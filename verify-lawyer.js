import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function verifyLawyer(lawyerId) {
  try {
    const lawyer = await prisma.lawyer.findUnique({
      where: { id: lawyerId },
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

    if (!lawyer) {
      console.log("❌ Lawyer not found");
      return;
    }

    if (lawyer.isVerified) {
      console.log("⚠️  Lawyer is already verified");
      console.log(`   Name: ${lawyer.user.name}`);
      console.log(`   Email: ${lawyer.user.email}`);
      console.log(`   Verified at: ${lawyer.verifiedAt?.toLocaleString() || "N/A"}`);
      return;
    }

    const updated = await prisma.lawyer.update({
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

    console.log("✅ Lawyer verified successfully!");
    console.log(`   Name: ${updated.user.name}`);
    console.log(`   Email: ${updated.user.email}`);
    console.log(`   Phone: ${updated.user.phone || "N/A"}`);
    console.log(`   Bar Council: ${updated.barCouncilNumber}`);
    console.log(`   Specialization: ${updated.specialization || "N/A"}`);
    console.log(`   Verified at: ${updated.verifiedAt?.toLocaleString()}`);
    console.log("\n🎉 The lawyer will now appear in the 'Find Lawyers' section!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Get lawyer ID from command line argument
const lawyerId = process.argv[2];

if (!lawyerId) {
  console.log("Usage: node verify-lawyer.js <lawyer-id>");
  console.log("\nTo find lawyer ID, run:");
  console.log("  node list-pending-lawyers.js");
  process.exit(1);
}

verifyLawyer(lawyerId);
