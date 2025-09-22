/*
  Warnings:

  - A unique constraint covering the columns `[appleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "appleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_appleId_key" ON "public"."User"("appleId");

-- CreateIndex
CREATE INDEX "User_appleId_idx" ON "public"."User"("appleId");
