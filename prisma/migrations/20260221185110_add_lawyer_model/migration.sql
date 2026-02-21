-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';

-- CreateTable
CREATE TABLE "Lawyer" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "barCouncilNumber" TEXT NOT NULL,
    "specialization" TEXT,
    "experience" INTEGER,
    "bio" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "barCouncilCertificate" BYTEA,
    "idProof" BYTEA,
    "photo" BYTEA,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lawyer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lawyer_userId_key" ON "Lawyer"("userId");

-- CreateIndex
CREATE INDEX "Lawyer_userId_idx" ON "Lawyer"("userId");

-- CreateIndex
CREATE INDEX "Lawyer_isVerified_idx" ON "Lawyer"("isVerified");

-- CreateIndex
CREATE INDEX "Lawyer_city_idx" ON "Lawyer"("city");

-- CreateIndex
CREATE INDEX "Lawyer_state_idx" ON "Lawyer"("state");

-- AddForeignKey
ALTER TABLE "Lawyer" ADD CONSTRAINT "Lawyer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
