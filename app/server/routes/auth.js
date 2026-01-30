import express from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = express.Router();


router.post("/register", async (req, res) => {
const { email, password } = req.body;
const user = await prisma.user.create({ data: { email, password } });
res.json(user);
});


router.post("/login", async (req, res) => {
const { email, password } = req.body;
const user = await prisma.user.findFirst({ where: { email, password } });
if (!user) return res.status(401).json({ error: "Invalid credentials" });
res.json(user);
});


export default router;