/*
  Warnings:

  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."PackageTemplate" ADD COLUMN     "stripePriceIdEUR" TEXT,
ADD COLUMN     "stripePriceIdNOK" TEXT,
ADD COLUMN     "stripePriceIdUSD" TEXT,
ADD COLUMN     "stripeProductId" TEXT;

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "stripeCustomerId" TEXT;

-- CreateIndex
CREATE INDEX "PackageTemplate_stripeProductId_idx" ON "public"."PackageTemplate"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "public"."User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "User_stripeCustomerId_idx" ON "public"."User"("stripeCustomerId");
