-- CreateTable
CREATE TABLE "LawyerUserMessage" (
    "id" TEXT NOT NULL,
    "lawyerId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LawyerUserMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LawyerUserMessage_lawyerId_userId_idx" ON "LawyerUserMessage"("lawyerId", "userId");

-- CreateIndex
CREATE INDEX "LawyerUserMessage_createdAt_idx" ON "LawyerUserMessage"("createdAt");
