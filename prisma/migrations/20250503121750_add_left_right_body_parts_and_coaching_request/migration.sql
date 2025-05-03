/*
  Warnings:

  - You are about to drop the column `biceps` on the `UserBodyMeasure` table. All the data in the column will be lost.
  - You are about to drop the column `calf` on the `UserBodyMeasure` table. All the data in the column will be lost.
  - You are about to drop the column `thigh` on the `UserBodyMeasure` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserBodyMeasure" DROP COLUMN "biceps",
DROP COLUMN "calf",
DROP COLUMN "thigh",
ADD COLUMN     "bicepsLeft" DOUBLE PRECISION,
ADD COLUMN     "bicepsRight" DOUBLE PRECISION,
ADD COLUMN     "calfLeft" DOUBLE PRECISION,
ADD COLUMN     "calfRight" DOUBLE PRECISION,
ADD COLUMN     "thighLeft" DOUBLE PRECISION,
ADD COLUMN     "thighRight" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "CoachingRequest" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachingRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoachingRequest_senderId_idx" ON "CoachingRequest"("senderId");

-- CreateIndex
CREATE INDEX "CoachingRequest_recipientId_idx" ON "CoachingRequest"("recipientId");

-- AddForeignKey
ALTER TABLE "CoachingRequest" ADD CONSTRAINT "CoachingRequest_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingRequest" ADD CONSTRAINT "CoachingRequest_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
