import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function listPendingLawyers() {
  try {
    const lawyers = await prisma.lawyer.findMany({
      where: { isVerified: false },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    if (lawyers.length === 0) {
      console.log("✅ No pending lawyers");
      return;
    }

    console.log(`\n📋 Found ${lawyers.length} pending lawyer(s):\n`);

    lawyers.forEach((lawyer, index) => {
      console.log(`${index + 1}. ${lawyer.user.name}`);
      console.log(`   ID: ${lawyer.id}`);
      console.log(`   Email: ${lawyer.user.email}`);
      console.log(`   Phone: ${lawyer.user.phone || "N/A"}`);
      console.log(`   Bar Council: ${lawyer.barCouncilNumber}`);
      console.log(`   Specialization: ${lawyer.specialization || "N/A"}`);
      console.log(`   Registered: ${lawyer.createdAt.toLocaleDateString()}`);
      console.log(`   To verify: node verify-lawyer.js ${lawyer.id}`);
      console.log("");
    });
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

listPendingLawyers();
