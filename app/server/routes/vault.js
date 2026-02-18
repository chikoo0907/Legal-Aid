import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import * as fs from "fs";
import path from "path";

const prisma = new PrismaClient();
const router = express.Router();

// Store files directly in DB (no disk writes)
const upload = multer({ storage: multer.memoryStorage() });

// Upload a document (any file type)
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { userId, folderId } = req.body;
    const file = req.file;

    if (!userId || !file) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const doc = await prisma.document.create({
      data: {
        userId,
        folderId: folderId || null,
        name: file.originalname,
        type: file.mimetype || "application/octet-stream",
        size: file.size ?? 0,
        data: file.buffer,
        path: null,
      },
    });

    res.json({
      ...doc,
      url: `/vault/file/${doc.id}`,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Upload failed" });
  }
});

// Stream a stored document back to the app
router.get("/file/:id", async (req, res) => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!doc) return res.status(404).send("Not found");

    // Primary: DB bytes
    if (doc.data && doc.data.length) {
      res.setHeader("Content-Type", doc.type || "application/octet-stream");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(doc.name || "document")}"`
      );
      return res.send(Buffer.from(doc.data));
    }

    // Fallback for legacy records that pointed to disk paths (no new uploads use this)
    if (doc.path) {
      let diskPath = doc.path;
      if (diskPath.startsWith("/uploads")) {
        diskPath = path.join(process.cwd(), diskPath.replace("/uploads", "uploads"));
      }
      if (fs.existsSync(diskPath)) {
        res.setHeader("Content-Type", doc.type || "application/octet-stream");
        res.setHeader(
          "Content-Disposition",
          `inline; filename="${encodeURIComponent(doc.name || "document")}"`
        );
        return fs.createReadStream(diskPath).pipe(res);
      }
    }

    return res.status(404).send("File content not available");
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch file");
  }
});

// Get all documents for a user (with folder/category)
router.get("/:userId", async (req, res) => {
  try {
    const docs = await prisma.document.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: "desc" },
      include: { folder: true },
    });

    res.json(
      docs.map((d) => ({
        ...d,
        url: `/vault/file/${d.id}`,
        category: d.folder?.name || null,
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Fetch failed" });
  }
});

// Rename / recategorize a document
router.patch("/:id", async (req, res) => {
  try {
    const { name, category } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: "New name is required" });
    }

    // Find the document first so we know the userId
    const existing = await prisma.document.findUnique({
      where: { id: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ error: "Document not found" });
    }

    let folderId = existing.folderId;

    // If category specified, map it to a Folder (create if needed)
    if (category && typeof category === "string" && category.trim()) {
      const catName = category.trim();
      const folder = await prisma.folder.upsert({
        where: {
          // Composite uniqueness emulation: userId + name
          id: `${existing.userId}:${catName}`,
        },
        update: {},
        create: {
          userId: existing.userId,
          name: catName,
          id: `${existing.userId}:${catName}`,
        },
      });
      folderId = folder.id;
    }

    const updated = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        name: name.trim(),
        folderId: folderId ?? null,
      },
      include: { folder: true },
    });

    res.json({
      ...updated,
      url: `/vault/file/${updated.id}`,
      category: updated.folder?.name || null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Rename failed" });
  }
});

// Delete a document (and remove underlying file if present)
router.delete("/:id", async (req, res) => {
  try {
    const existing = await prisma.document.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ error: "Document not found" });
    }

    // No disk deletes for new documents. (Optional legacy cleanup if doc.path exists.)
    if (existing.path) {
      try {
        let diskPath = existing.path;
        if (diskPath.startsWith("/uploads")) {
          diskPath = path.join(process.cwd(), diskPath.replace("/uploads", "uploads"));
        }
        if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
      } catch (err) {
        console.warn("Failed to delete legacy file from disk", err);
      }
    }

    await prisma.document.delete({
      where: { id: req.params.id },
    });
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Delete failed" });
  }
});

export default router;
