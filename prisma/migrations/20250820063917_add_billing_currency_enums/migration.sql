/*
  Warnings:

  - Changed the type of `currency` on the `BillingRecord` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `BillingRecord` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."BillingStatus" AS ENUM ('SUCCEEDED', 'FAILED', 'PENDING', 'REFUNDED');

-- CreateEnum
CREATE TYPE "public"."Currency" AS ENUM ('NOK', 'EUR', 'USD');

-- AlterTable
ALTER TABLE "public"."BillingRecord" DROP COLUMN "currency",
ADD COLUMN     "currency" "public"."Currency" NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" "public"."BillingStatus" NOT NULL;

-- CreateIndex
CREATE INDEX "BillingRecord_status_idx" ON "public"."BillingRecord"("status");
