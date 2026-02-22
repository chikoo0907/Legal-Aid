import express from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import multer from "multer";

const prisma = new PrismaClient();
const router = express.Router();

const SALT_ROUNDS = 10;
const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 2. Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 3. Store hashed password
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
      },
    });

    // 4. Never return password
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      language: user.language,
      hasVaultPin: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
});

/* =======================
   LOGIN
======================= */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Find user by email only
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        language: true,
        password: true,
        vaultPinHash: true,
        role: true,
        lawyer: {
          select: {
            id: true,
            isVerified: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 2. Compare password with hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // 3. Return safe response
    const { password: _pw, vaultPinHash, ...safeUser } = user;

    // Ensure lawyer data is properly included
    const response = {
      ...safeUser,
      hasVaultPin: !!vaultPinHash,
    };

    // Log for debugging
    console.log("Login response for user:", user.email);
    console.log("Role:", user.role);
    console.log("Lawyer data:", user.lawyer);

    res.json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
});

/* =======================
   LAWYER REGISTRATION
======================= */
router.post("/register-lawyer", upload.fields([
  { name: "barCouncilCertificate", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
  { name: "photo", maxCount: 1 },
]), async (req, res) => {
  try {
    console.log("Lawyer registration request received");
    console.log("Request body keys:", Object.keys(req.body));
    console.log("Request files:", req.files ? Object.keys(req.files) : "No files");
    
    const {
      email,
      password,
      name,
      phone,
      barCouncilNumber,
      specialization,
      experience,
      bio,
      address,
      city,
      state,
      pincode,
    } = req.body;

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // 2. Validate required fields
    if (!barCouncilNumber) {
      return res.status(400).json({ error: "Bar Council Number is required" });
    }

    // 3. Get uploaded files
    const files = req.files;
    const barCouncilCert = files?.barCouncilCertificate?.[0];
    const idProofFile = files?.idProof?.[0];
    const photoFile = files?.photo?.[0];

    if (!barCouncilCert || !idProofFile || !photoFile) {
      return res.status(400).json({ error: "All documents are required" });
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 5. Create user with lawyer role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role: "lawyer",
      },
    });

    // 6. Create lawyer profile (not verified yet)
    const lawyer = await prisma.lawyer.create({
      data: {
        userId: user.id,
        barCouncilNumber,
        specialization: specialization || null,
        experience: experience ? parseInt(experience) : null,
        bio: bio || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        barCouncilCertificate: barCouncilCert.buffer,
        idProof: idProofFile.buffer,
        photo: photoFile.buffer,
        isVerified: false, // Will be verified by admin later
      },
    });

    // 7. Return safe response
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      language: user.language,
      role: user.role,
      hasVaultPin: false,
      lawyer: {
        id: lawyer.id,
        isVerified: lawyer.isVerified,
      },
    });
  } catch (error) {
    console.error("Lawyer registration error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: "Lawyer registration failed",
      message: error.message,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined
    });
  }
});

export default router;
