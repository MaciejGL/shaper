/*
  Warnings:

  - You are about to drop the `BillingRecord` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OneTimePurchase` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PackageService` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ServiceUsage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrainerCommission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BillingRecord" DROP CONSTRAINT "BillingRecord_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OneTimePurchase" DROP CONSTRAINT "OneTimePurchase_packageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OneTimePurchase" DROP CONSTRAINT "OneTimePurchase_trainerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."OneTimePurchase" DROP CONSTRAINT "OneTimePurchase_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."PackageService" DROP CONSTRAINT "PackageService_packageId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ServiceUsage" DROP CONSTRAINT "ServiceUsage_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrainerCommission" DROP CONSTRAINT "TrainerCommission_purchaseId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrainerCommission" DROP CONSTRAINT "TrainerCommission_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrainerCommission" DROP CONSTRAINT "TrainerCommission_trainerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrainerCommission" DROP CONSTRAINT "TrainerCommission_userId_fkey";

-- DropTable
DROP TABLE "public"."BillingRecord";

-- DropTable
DROP TABLE "public"."OneTimePurchase";

-- DropTable
DROP TABLE "public"."PackageService";

-- DropTable
DROP TABLE "public"."ServiceUsage";

-- DropTable
DROP TABLE "public"."TrainerCommission";

-- DropEnum
DROP TYPE "public"."BillingStatus";

-- DropEnum
DROP TYPE "public"."CommissionStatus";

-- DropEnum
DROP TYPE "public"."PurchaseType";
