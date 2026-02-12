import express from "express";
import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";

const prisma = new PrismaClient();
const router = express.Router();

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (_, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.post("/upload", upload.single("file"), async (req, res) => {
  const { userId } = req.body;

  if (!req.file || !userId) {
    return res.status(400).json({ error: "Missing file or userId" });
  }

  const doc = await prisma.document.create({
    data: {
      userId,
      name: req.file.originalname,
      type: req.file.mimetype,
      uri: `/uploads/${req.file.filename}`,
    },
  });

  res.json(doc);
});

router.get("/:userId", async (req, res) => {
  const docs = await prisma.document.findMany({
    where: { userId: req.params.userId },
    orderBy: { createdAt: "desc" },
  });

  res.json(docs);
});

export default router;
