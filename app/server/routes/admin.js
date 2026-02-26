import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// TODO: Add authentication middleware here for production
// For now, this is open - add authentication in production!

/**
 * Get all pending lawyers (not verified yet)
 * GET /admin/pending-lawyers
 */
router.get("/pending-lawyers", async (req, res) => {
  try {
    const lawyers = await prisma.lawyer.findMany({
      where: { isVerified: false },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Remove binary data from response
    const lawyersWithoutBinary = lawyers.map((lawyer) => {
      const { barCouncilCertificate, idProof, photo, ...lawyerData } = lawyer;
      return {
        ...lawyerData,
        hasBarCouncilCert: !!lawyer.barCouncilCertificate,
        hasIdProof: !!lawyer.idProof,
        hasPhoto: !!lawyer.photo,
        barCouncilCertUrl: lawyer.barCouncilCertificate 
          ? `/admin/lawyers/${lawyer.id}/bar-council-cert` 
          : null,
        idProofUrl: lawyer.idProof 
          ? `/admin/lawyers/${lawyer.id}/id-proof` 
          : null,
        photoUrl: lawyer.photo 
          ? `/admin/lawyers/${lawyer.id}/photo` 
          : null,
      };
    });

    res.json(lawyersWithoutBinary);
  } catch (error) {
    console.error("Error fetching pending lawyers:", error);
    res.status(500).json({ error: "Failed to fetch pending lawyers" });
  }
});

/**
 * Get all verified lawyers
 * GET /admin/verified-lawyers
 */
router.get("/verified-lawyers", async (req, res) => {
  try {
    const lawyers = await prisma.lawyer.findMany({
      where: { isVerified: true },
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
      orderBy: { verifiedAt: "desc" },
    });

    const lawyersWithoutBinary = lawyers.map((lawyer) => {
      const { barCouncilCertificate, idProof, photo, ...lawyerData } = lawyer;
      return lawyerData;
    });

    res.json(lawyersWithoutBinary);
  } catch (error) {
    console.error("Error fetching verified lawyers:", error);
    res.status(500).json({ error: "Failed to fetch verified lawyers" });
  }
});

/**
 * Verify a lawyer
 * POST /admin/verify-lawyer/:lawyerId
 */
router.post("/verify-lawyer/:lawyerId", async (req, res) => {
  try {
    const { lawyerId } = req.params;

    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!lawyer) {
      return res.status(404).json({ error: "Lawyer not found" });
    }

    if (lawyer.isVerified) {
      return res.status(400).json({ error: "Lawyer is already verified" });
    }

    const updatedLawyer = await prisma.lawyer.update({
      where: { id: lawyerId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    console.log(`Lawyer verified: ${updatedLawyer.user.email} (${updatedLawyer.user.name})`);

    res.json({
      success: true,
      message: "Lawyer verified successfully",
      lawyer: {
        id: updatedLawyer.id,
        barCouncilNumber: updatedLawyer.barCouncilNumber,
        isVerified: updatedLawyer.isVerified,
        verifiedAt: updatedLawyer.verifiedAt,
        user: updatedLawyer.user,
      },
    });
  } catch (error) {
    console.error("Error verifying lawyer:", error);
    res.status(500).json({ error: "Failed to verify lawyer" });
  }
});

/**
 * Reject/Unverify a lawyer
 * POST /admin/reject-lawyer/:lawyerId
 */
router.post("/reject-lawyer/:lawyerId", async (req, res) => {
  try {
    const { lawyerId } = req.params;
    const { reason } = req.body;

    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
    });

    if (!lawyer) {
      return res.status(404).json({ error: "Lawyer not found" });
    }

    // Optionally delete the lawyer record, or just mark as rejected
    // For now, we'll just unverify them
    const updatedLawyer = await prisma.lawyer.update({
      where: { id: lawyerId },
      data: {
        isVerified: false,
        verifiedAt: null,
      },
    });

    console.log(`Lawyer rejected: ${lawyerId}${reason ? ` - Reason: ${reason}` : ""}`);

    res.json({
      success: true,
      message: "Lawyer rejected successfully",
      lawyer: {
        id: updatedLawyer.id,
        isVerified: updatedLawyer.isVerified,
      },
    });
  } catch (error) {
    console.error("Error rejecting lawyer:", error);
    res.status(500).json({ error: "Failed to reject lawyer" });
  }
});

/**
 * Get lawyer documents (Bar Council Certificate)
 * GET /admin/lawyers/:lawyerId/bar-council-cert
 */
router.get("/lawyers/:lawyerId/bar-council-cert", async (req, res) => {
  try {
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: req.params.lawyerId },
      select: { barCouncilCertificate: true },
    });

    if (!lawyer || !lawyer.barCouncilCertificate) {
      return res.status(404).send("Document not found");
    }

    res.setHeader("Content-Type", "image/jpeg");
    res.send(Buffer.from(lawyer.barCouncilCertificate));
  } catch (error) {
    console.error("Error fetching bar council certificate:", error);
    res.status(500).send("Failed to fetch document");
  }
});

/**
 * Get lawyer documents (ID Proof)
 * GET /admin/lawyers/:lawyerId/id-proof
 */
router.get("/lawyers/:lawyerId/id-proof", async (req, res) => {
  try {
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: req.params.lawyerId },
      select: { idProof: true },
    });

    if (!lawyer || !lawyer.idProof) {
      return res.status(404).send("Document not found");
    }

    res.setHeader("Content-Type", "image/jpeg");
    res.send(Buffer.from(lawyer.idProof));
  } catch (error) {
    console.error("Error fetching ID proof:", error);
    res.status(500).send("Failed to fetch document");
  }
});

/**
 * Get lawyer photo
 * GET /admin/lawyers/:lawyerId/photo
 */
router.get("/lawyers/:lawyerId/photo", async (req, res) => {
  try {
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: req.params.lawyerId },
      select: { photo: true },
    });

    if (!lawyer || !lawyer.photo) {
      return res.status(404).send("Photo not found");
    }

    res.setHeader("Content-Type", "image/jpeg");
    res.send(Buffer.from(lawyer.photo));
  } catch (error) {
    console.error("Error fetching photo:", error);
    res.status(500).send("Failed to fetch photo");
  }
});

/**
 * Get specific lawyer details
 * GET /admin/lawyers/:lawyerId
 */
router.get("/lawyers/:lawyerId", async (req, res) => {
  try {
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: req.params.lawyerId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          },
        },
      },
    });

    if (!lawyer) {
      return res.status(404).json({ error: "Lawyer not found" });
    }

    const { barCouncilCertificate, idProof, photo, ...lawyerData } = lawyer;
    res.json({
      ...lawyerData,
      hasBarCouncilCert: !!barCouncilCertificate,
      hasIdProof: !!idProof,
      hasPhoto: !!photo,
      barCouncilCertUrl: barCouncilCertificate 
        ? `/admin/lawyers/${lawyer.id}/bar-council-cert` 
        : null,
      idProofUrl: idProof 
        ? `/admin/lawyers/${lawyer.id}/id-proof` 
        : null,
      photoUrl: photo 
        ? `/admin/lawyers/${lawyer.id}/photo` 
        : null,
    });
  } catch (error) {
    console.error("Error fetching lawyer:", error);
    res.status(500).json({ error: "Failed to fetch lawyer" });
  }
});

export default router;
