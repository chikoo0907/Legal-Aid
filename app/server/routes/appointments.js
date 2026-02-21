import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Get all appointments for a lawyer
router.get("/lawyer/:lawyerId", async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const { status } = req.query;

    const where = { lawyerId };
    if (status) {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        lawyer: {
          select: {
            id: true,
            specialization: true,
          },
        },
      },
      orderBy: {
        appointmentDate: "asc",
      },
    });

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching lawyer appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Get all appointments for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        lawyer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
      orderBy: {
        appointmentDate: "asc",
      },
    });

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// Create a new appointment
router.post("/", async (req, res) => {
  try {
    const { lawyerId, userId, appointmentDate, reason } = req.body;

    if (!lawyerId || !userId) {
      return res.status(400).json({ error: "Lawyer ID and User ID are required" });
    }

    const appointment = await prisma.appointment.create({
      data: {
        lawyerId,
        userId,
        appointmentDate: appointmentDate ? new Date(appointmentDate) : null,
        reason: reason || null,
        status: "pending",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        lawyer: {
          select: {
            id: true,
            specialization: true,
          },
        },
      },
    });

    res.json(appointment);
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Failed to create appointment" });
  }
});

// Update appointment status
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, appointmentDate, notes } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate);
    if (notes !== undefined) updateData.notes = notes;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        lawyer: {
          select: {
            id: true,
            specialization: true,
          },
        },
      },
    });

    res.json(appointment);
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Failed to update appointment" });
  }
});

// Get single appointment
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        lawyer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Failed to fetch appointment" });
  }
});

export default router;
