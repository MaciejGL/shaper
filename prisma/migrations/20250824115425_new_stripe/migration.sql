/*
  Warnings:

  - You are about to drop the `TrainerOfferItem` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripeCheckoutSessionId]` on the table `TrainerOffer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripePaymentIntentId]` on the table `TrainerOffer` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "public"."DeliveryStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "public"."TrainerOfferItem" DROP CONSTRAINT "TrainerOfferItem_offerId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrainerOfferItem" DROP CONSTRAINT "TrainerOfferItem_packageId_fkey";

-- AlterTable
ALTER TABLE "public"."TrainerOffer" ADD COLUMN     "packageSummary" JSONB,
ADD COLUMN     "stripeCheckoutSessionId" TEXT,
ADD COLUMN     "stripePaymentIntentId" TEXT;

-- DropTable
DROP TABLE "public"."TrainerOfferItem";

-- CreateTable
CREATE TABLE "public"."ServiceDelivery" (
    "id" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "serviceType" "public"."ServiceType" NOT NULL,
    "packageName" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "public"."DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "deliveredAt" TIMESTAMP(3),
    "deliveryNotes" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceDelivery_trainerId_idx" ON "public"."ServiceDelivery"("trainerId");

-- CreateIndex
CREATE INDEX "ServiceDelivery_clientId_idx" ON "public"."ServiceDelivery"("clientId");

-- CreateIndex
CREATE INDEX "ServiceDelivery_stripePaymentIntentId_idx" ON "public"."ServiceDelivery"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "ServiceDelivery_status_idx" ON "public"."ServiceDelivery"("status");

-- CreateIndex
CREATE INDEX "ServiceDelivery_serviceType_idx" ON "public"."ServiceDelivery"("serviceType");

-- CreateIndex
CREATE INDEX "ServiceDelivery_createdAt_idx" ON "public"."ServiceDelivery"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerOffer_stripeCheckoutSessionId_key" ON "public"."TrainerOffer"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerOffer_stripePaymentIntentId_key" ON "public"."TrainerOffer"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "TrainerOffer_stripeCheckoutSessionId_idx" ON "public"."TrainerOffer"("stripeCheckoutSessionId");

-- CreateIndex
CREATE INDEX "TrainerOffer_stripePaymentIntentId_idx" ON "public"."TrainerOffer"("stripePaymentIntentId");

-- AddForeignKey
ALTER TABLE "public"."ServiceDelivery" ADD CONSTRAINT "ServiceDelivery_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ServiceDelivery" ADD CONSTRAINT "ServiceDelivery_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
