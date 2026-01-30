import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = express.Router();


router.post("/upload", async (req, res) => {
const { userId, name, type, uri } = req.body;
const doc = await prisma.document.create({ data: { userId, name, type, uri } });
res.json(doc);
});


router.get("/:userId", async (req, res) => {
const docs = await prisma.document.findMany({ where: { userId: req.params.userId } });
res.json(docs);
});


export default router;