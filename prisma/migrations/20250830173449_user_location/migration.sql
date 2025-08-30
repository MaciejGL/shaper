/*
  Warnings:

  - You are about to drop the column `locationId` on the `Team` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `UserProfile` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Team" DROP CONSTRAINT "Team_locationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."UserProfile" DROP CONSTRAINT "UserProfile_locationId_fkey";

-- DropIndex
DROP INDEX "public"."Team_locationId_idx";

-- DropIndex
DROP INDEX "public"."UserProfile_locationId_idx";

-- AlterTable
ALTER TABLE "public"."Team" DROP COLUMN "locationId";

-- AlterTable
ALTER TABLE "public"."UserProfile" DROP COLUMN "locationId";

-- CreateTable
CREATE TABLE "public"."TeamInvitation" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "invitedEmail" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserLocation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TeamLocation" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamLocation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamInvitation_teamId_idx" ON "public"."TeamInvitation"("teamId");

-- CreateIndex
CREATE INDEX "TeamInvitation_invitedEmail_idx" ON "public"."TeamInvitation"("invitedEmail");

-- CreateIndex
CREATE INDEX "TeamInvitation_invitedById_idx" ON "public"."TeamInvitation"("invitedById");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvitation_teamId_invitedEmail_key" ON "public"."TeamInvitation"("teamId", "invitedEmail");

-- CreateIndex
CREATE INDEX "UserLocation_userId_idx" ON "public"."UserLocation"("userId");

-- CreateIndex
CREATE INDEX "UserLocation_locationId_idx" ON "public"."UserLocation"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserLocation_userId_locationId_key" ON "public"."UserLocation"("userId", "locationId");

-- CreateIndex
CREATE INDEX "TeamLocation_teamId_idx" ON "public"."TeamLocation"("teamId");

-- CreateIndex
CREATE INDEX "TeamLocation_locationId_idx" ON "public"."TeamLocation"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamLocation_teamId_locationId_key" ON "public"."TeamLocation"("teamId", "locationId");

-- AddForeignKey
ALTER TABLE "public"."TeamInvitation" ADD CONSTRAINT "TeamInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamInvitation" ADD CONSTRAINT "TeamInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserLocation" ADD CONSTRAINT "UserLocation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserLocation" ADD CONSTRAINT "UserLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamLocation" ADD CONSTRAINT "TeamLocation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TeamLocation" ADD CONSTRAINT "TeamLocation_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "public"."Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
