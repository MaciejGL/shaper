/*
  Warnings:

  - You are about to drop the column `priceNOK` on the `PackageTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceIdEUR` on the `PackageTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceIdNOK` on the `PackageTemplate` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceIdUSD` on the `PackageTemplate` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."PackageTemplate" DROP COLUMN "priceNOK",
DROP COLUMN "stripePriceIdEUR",
DROP COLUMN "stripePriceIdNOK",
DROP COLUMN "stripePriceIdUSD",
ADD COLUMN     "stripePriceId" TEXT;

-- CreateIndex
CREATE INDEX "PackageTemplate_stripePriceId_idx" ON "public"."PackageTemplate"("stripePriceId");
