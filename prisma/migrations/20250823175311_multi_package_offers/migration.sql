/*
  Warnings:

  - You are about to drop the column `packageId` on the `TrainerOffer` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."TrainerOffer" DROP CONSTRAINT "TrainerOffer_packageId_fkey";

-- AlterTable
ALTER TABLE "public"."TrainerOffer" DROP COLUMN "packageId";

-- CreateTable
CREATE TABLE "public"."TrainerOfferItem" (
    "id" TEXT NOT NULL,
    "offerId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "TrainerOfferItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainerOfferItem_offerId_idx" ON "public"."TrainerOfferItem"("offerId");

-- CreateIndex
CREATE INDEX "TrainerOfferItem_packageId_idx" ON "public"."TrainerOfferItem"("packageId");

-- AddForeignKey
ALTER TABLE "public"."TrainerOfferItem" ADD CONSTRAINT "TrainerOfferItem_offerId_fkey" FOREIGN KEY ("offerId") REFERENCES "public"."TrainerOffer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrainerOfferItem" ADD CONSTRAINT "TrainerOfferItem_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "public"."PackageTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
