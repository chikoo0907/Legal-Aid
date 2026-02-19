import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const router = express.Router();

const PIN_SALT_ROUNDS = 10;

// Fetch basic user profile plus vault lock status
router.get("/:id", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        language: true,
        createdAt: true,
        vaultPinHash: true,
      },
    });

    if (!user) return res.status(404).json({ error: "User not found" });

    const { vaultPinHash, ...safeUser } = user;
    res.json({
      ...safeUser,
      hasVaultPin: !!vaultPinHash,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Update preferred language
router.patch("/:id/language", async (req, res) => {
  try {
    const { language } = req.body || {};
    const allowed = new Set(["en", "mr", "hi", "gu", "pa", "ta", "te"]);
    if (!allowed.has(language)) {
      return res.status(400).json({ error: "Unsupported language" });
    }

    const updated = await prisma.user.update({
      where: { id: req.params.id },
      data: { language },
      select: { id: true, language: true },
    });

    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update language" });
  }
});

// Set or update 4‑digit numeric vault PIN
router.post("/:id/vault-pin", async (req, res) => {
  try {
    const { pin } = req.body || {};

    if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
      return res
        .status(400)
        .json({ error: "PIN must be a 4‑digit numeric string" });
    }

    const hash = await bcrypt.hash(pin, PIN_SALT_ROUNDS);

    await prisma.user.update({
      where: { id: req.params.id },
      data: { vaultPinHash: hash },
      select: { id: true },
    });

    res.json({ success: true, hasVaultPin: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to set vault PIN" });
  }
});

// Verify a candidate PIN for vault access
router.post("/:id/vault-pin/verify", async (req, res) => {
  try {
    const { pin } = req.body || {};

    if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
      return res
        .status(400)
        .json({ error: "PIN must be a 4‑digit numeric string" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { vaultPinHash: true },
    });

    if (!user || !user.vaultPinHash) {
      return res.status(400).json({ error: "Vault PIN not set" });
    }

    const ok = await bcrypt.compare(pin, user.vaultPinHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid PIN" });
    }

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to verify vault PIN" });
  }
});

// Reset vault PIN using account password (for when user forgets PIN)
router.post("/:id/vault-pin/reset", async (req, res) => {
  try {
    const { password, newPin } = req.body || {};

    if (typeof password !== "string" || !password.trim()) {
      return res.status(400).json({ error: "Password is required" });
    }
    if (typeof newPin !== "string" || !/^\d{4}$/.test(newPin)) {
      return res
        .status(400)
        .json({ error: "PIN must be a 4‑digit numeric string" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { password: true },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ error: "Invalid account password" });
    }

    const hash = await bcrypt.hash(newPin, PIN_SALT_ROUNDS);

    await prisma.user.update({
      where: { id: req.params.id },
      data: { vaultPinHash: hash },
      select: { id: true },
    });

    res.json({ success: true, hasVaultPin: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to reset vault PIN" });
  }
});

export default router;

