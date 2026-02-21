import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// Get all verified lawyers with optional filters
router.get("/", async (req, res) => {
  try {
    const { city, state, specialization, search } = req.query;

    const where = {
      isVerified: true,
    };

    if (city) {
      where.city = { contains: city, mode: "insensitive" };
    }

    if (state) {
      where.state = { contains: state, mode: "insensitive" };
    }

    if (specialization) {
      where.specialization = { contains: specialization, mode: "insensitive" };
    }

    if (search) {
      where.OR = [
        { barCouncilNumber: { contains: search, mode: "insensitive" } },
        { specialization: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const lawyers = await prisma.lawyer.findMany({
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
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Remove binary data from response (photos will be served separately)
    const lawyersWithoutBinary = lawyers.map((lawyer) => {
      const { barCouncilCertificate, idProof, photo, ...lawyerData } = lawyer;
      return {
        ...lawyerData,
        photoUrl: photo ? `/lawyers/${lawyer.id}/photo` : null,
      };
    });

    res.json(lawyersWithoutBinary);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch lawyers" });
  }
});

// Get lawyer by userId
router.get("/by-user/:userId", async (req, res) => {
  try {
    const lawyer = await prisma.lawyer.findUnique({
      where: { userId: req.params.userId },
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
    });

    if (!lawyer) {
      return res.status(404).json({ error: "Lawyer not found" });
    }

    // Remove binary data
    const { barCouncilCertificate, idProof, photo, ...lawyerData } = lawyer;
    res.json({
      ...lawyerData,
      photoUrl: photo ? `/lawyers/${lawyer.id}/photo` : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch lawyer" });
  }
});

// Get a specific lawyer by ID
router.get("/:id", async (req, res) => {
  try {
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: req.params.id },
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
    });

    if (!lawyer) {
      return res.status(404).json({ error: "Lawyer not found" });
    }

    // Remove binary data
    const { barCouncilCertificate, idProof, photo, ...lawyerData } = lawyer;
    res.json({
      ...lawyerData,
      photoUrl: photo ? `/lawyers/${lawyer.id}/photo` : null,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch lawyer" });
  }
});

// Get lawyer photo
router.get("/:id/photo", async (req, res) => {
  try {
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: req.params.id },
      select: { photo: true },
    });

    if (!lawyer || !lawyer.photo) {
      return res.status(404).send("Photo not found");
    }

    res.setHeader("Content-Type", "image/jpeg");
    res.send(Buffer.from(lawyer.photo));
  } catch (error) {
    console.error(error);
    res.status(500).send("Failed to fetch photo");
  }
});

export default router;
