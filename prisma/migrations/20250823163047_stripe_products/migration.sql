-- CreateEnum
CREATE TYPE "public"."PurchaseType" AS ENUM ('SUBSCRIPTION', 'ONE_TIME');

-- CreateEnum
CREATE TYPE "public"."CommissionStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."PackageTemplate" ADD COLUMN     "metadata" JSONB;

-- CreateTable
CREATE TABLE "public"."TrainerCommission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "subscriptionId" TEXT,
    "purchaseId" TEXT,
    "purchaseType" "public"."PurchaseType" NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "platformCommission" INTEGER NOT NULL,
    "trainerPayout" INTEGER NOT NULL,
    "currency" "public"."Currency" NOT NULL,
    "stripeInvoiceId" TEXT,
    "stripePaymentIntentId" TEXT,
    "stripePriceId" TEXT,
    "platformCommissionPercentage" DECIMAL(65,30) NOT NULL DEFAULT 10.00,
    "trainerPayoutPercentage" DECIMAL(65,30) NOT NULL DEFAULT 90.00,
    "status" "public"."CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "serviceType" "public"."ServiceType" NOT NULL,
    "packageName" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerCommission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OneTimePurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "trainerId" TEXT,
    "packageId" TEXT NOT NULL,
    "totalAmount" INTEGER NOT NULL,
    "currency" "public"."Currency" NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "stripePaymentIntentId" TEXT,
    "stripeCheckoutSessionId" TEXT,
    "stripePriceId" TEXT,
    "serviceType" "public"."ServiceType" NOT NULL,
    "deliveredAt" TIMESTAMP(3),
    "deliveryNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OneTimePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TrainerOffer" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "clientEmail" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "personalMessage" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "TrainerOffer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainerCommission_userId_idx" ON "public"."TrainerCommission"("userId");

-- CreateIndex
CREATE INDEX "TrainerCommission_trainerId_idx" ON "public"."TrainerCommission"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerCommission_subscriptionId_idx" ON "public"."TrainerCommission"("subscriptionId");

-- CreateIndex
CREATE INDEX "TrainerCommission_purchaseId_idx" ON "public"."TrainerCommission"("purchaseId");

-- CreateIndex
CREATE INDEX "TrainerCommission_status_idx" ON "public"."TrainerCommission"("status");

-- CreateIndex
CREATE INDEX "TrainerCommission_createdAt_idx" ON "public"."TrainerCommission"("createdAt");

-- CreateIndex
CREATE INDEX "TrainerCommission_stripeInvoiceId_idx" ON "public"."TrainerCommission"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "TrainerCommission_stripePaymentIntentId_idx" ON "public"."TrainerCommission"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "OneTimePurchase_userId_idx" ON "public"."OneTimePurchase"("userId");

-- CreateIndex
CREATE INDEX "OneTimePurchase_trainerId_idx" ON "public"."OneTimePurchase"("trainerId");

-- CreateIndex
CREATE INDEX "OneTimePurchase_packageId_idx" ON "public"."OneTimePurchase"("packageId");

-- CreateIndex
CREATE INDEX "OneTimePurchase_serviceType_idx" ON "public"."OneTimePurchase"("serviceType");

-- CreateIndex
CREATE INDEX "OneTimePurchase_createdAt_idx" ON "public"."OneTimePurchase"("createdAt");

-- CreateIndex
CREATE INDEX "OneTimePurchase_stripePaymentIntentId_idx" ON "public"."OneTimePurchase"("stripePaymentIntentId");

-- CreateIndex
CREATE INDEX "OneTimePurchase_stripeCheckoutSessionId_idx" ON "public"."OneTimePurchase"("stripeCheckoutSessionId");

-- CreateIndex
CREATE UNIQUE INDEX "TrainerOffer_token_key" ON "public"."TrainerOffer"("token");

-- CreateIndex
CREATE INDEX "TrainerOffer_token_idx" ON "public"."TrainerOffer"("token");

-- CreateIndex
CREATE INDEX "TrainerOffer_trainerId_idx" ON "public"."TrainerOffer"("trainerId");

-- CreateIndex
CREATE INDEX "TrainerOffer_clientEmail_idx" ON "public"."TrainerOffer"("clientEmail");

-- CreateIndex
CREATE INDEX "TrainerOffer_status_idx" ON "public"."TrainerOffer"("status");

-- CreateIndex
CREATE INDEX "TrainerOffer_expiresAt_idx" ON "public"."TrainerOffer"("expiresAt");

-- CreateIndex
CREATE INDEX "TrainerOffer_createdAt_idx" ON "public"."TrainerOffer"("createdAt");

-- CreateIndex
CREATE INDEX "PackageTemplate_metadata_idx" ON "public"."PackageTemplate" USING GIN ("metadata");

-- AddForeignKey
ALTER TABLE "public"."TrainerCommission" ADD CONSTRAINT "TrainerCommission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrainerCommission" ADD CONSTRAINT "TrainerCommission_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrainerCommission" ADD CONSTRAINT "TrainerCommission_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."UserSubscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrainerCommission" ADD CONSTRAINT "TrainerCommission_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "public"."OneTimePurchase"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OneTimePurchase" ADD CONSTRAINT "OneTimePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OneTimePurchase" ADD CONSTRAINT "OneTimePurchase_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OneTimePurchase" ADD CONSTRAINT "OneTimePurchase_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "public"."PackageTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrainerOffer" ADD CONSTRAINT "TrainerOffer_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TrainerOffer" ADD CONSTRAINT "TrainerOffer_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "public"."PackageTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
