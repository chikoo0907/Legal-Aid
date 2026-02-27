import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Get messages between lawyer and user
router.get("/", async (req, res) => {
  try {
    const { lawyerId, userId } = req.query;

    if (!lawyerId || !userId) {
      return res.status(400).json({ error: "lawyerId and userId are required" });
    }

    const messages = await prisma.lawyerUserMessage.findMany({
      where: {
        lawyerId,
        userId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// Send a message
router.post("/", async (req, res) => {
  try {
    const { lawyerId, userId, sender, message } = req.body;

    if (!lawyerId || !userId || !sender || !message) {
      return res.status(400).json({
        error: "lawyerId, userId, sender, and message are required",
      });
    }

    if (sender !== "lawyer" && sender !== "user") {
      return res.status(400).json({ error: "sender must be 'lawyer' or 'user'" });
    }

    const newMessage = await prisma.lawyerUserMessage.create({
      data: {
        lawyerId,
        userId,
        sender,
        message: message.trim(),
      },
    });

    res.json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
});

export default router;
