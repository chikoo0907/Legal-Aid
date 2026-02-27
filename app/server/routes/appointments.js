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

// Helper: round to 30-min slot start
function getSlotStart(date) {
  const d = new Date(date);
  const mins = d.getMinutes();
  const roundedMins = Math.floor(mins / 30) * 30;
  d.setMinutes(roundedMins, 0, 0);
  return d;
}

// Check if a time slot is available for a lawyer
router.get("/check-slot", async (req, res) => {
  try {
    const { lawyerId, appointmentDate } = req.query;

    if (!lawyerId || !appointmentDate) {
      return res.status(400).json({ error: "lawyerId and appointmentDate are required" });
    }

    const slotStart = getSlotStart(new Date(appointmentDate));
    const slotEnd = new Date(slotStart);
    slotEnd.setMinutes(slotStart.getMinutes() + 30, 0, 0);

    // Find overlapping appointments (same lawyer, same 30-min slot)
    const overlapping = await prisma.appointment.findMany({
      where: {
        lawyerId,
        status: { not: "cancelled" },
        appointmentDate: {
          not: null,
          gte: slotStart,
          lt: slotEnd,
        },
      },
    });

    res.json({
      available: overlapping.length === 0,
      message: overlapping.length > 0
        ? "This time slot is already booked. Please select another date or time."
        : "Slot available",
    });
  } catch (error) {
    console.error("Error checking slot:", error);
    res.status(500).json({ error: "Failed to check slot availability" });
  }
});

// Create a new appointment
router.post("/", async (req, res) => {
  try {
    const { lawyerId, userId, appointmentDate, reason } = req.body;

    if (!lawyerId || !userId) {
      return res.status(400).json({ error: "Lawyer ID and User ID are required" });
    }

    // Check slot availability before creating
    if (appointmentDate) {
      const slotStart = getSlotStart(new Date(appointmentDate));
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + 30, 0, 0);

      const overlapping = await prisma.appointment.findMany({
        where: {
          lawyerId,
          status: { not: "cancelled" },
          appointmentDate: {
            not: null,
            gte: slotStart,
            lt: slotEnd,
          },
        },
      });

      if (overlapping.length > 0) {
        return res.status(400).json({
          error: "This time slot is already booked. Please select another date or time.",
        });
      }
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
