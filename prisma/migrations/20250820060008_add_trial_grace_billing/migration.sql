-- AlterTable
ALTER TABLE "public"."UserSubscription" ADD COLUMN     "failedPaymentRetries" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "gracePeriodEnd" TIMESTAMP(3),
ADD COLUMN     "isInGracePeriod" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isTrialActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastPaymentAttempt" TIMESTAMP(3),
ADD COLUMN     "trialEnd" TIMESTAMP(3),
ADD COLUMN     "trialStart" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "public"."BillingRecord" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "stripeInvoiceId" TEXT,
    "stripePaymentId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "failureReason" TEXT,
    "refundReason" TEXT,
    "refundAmount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BillingRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BillingRecord_subscriptionId_idx" ON "public"."BillingRecord"("subscriptionId");

-- CreateIndex
CREATE INDEX "BillingRecord_status_idx" ON "public"."BillingRecord"("status");

-- CreateIndex
CREATE INDEX "BillingRecord_periodStart_idx" ON "public"."BillingRecord"("periodStart");

-- CreateIndex
CREATE INDEX "BillingRecord_stripeInvoiceId_idx" ON "public"."BillingRecord"("stripeInvoiceId");

-- CreateIndex
CREATE INDEX "UserSubscription_trialEnd_idx" ON "public"."UserSubscription"("trialEnd");

-- CreateIndex
CREATE INDEX "UserSubscription_gracePeriodEnd_idx" ON "public"."UserSubscription"("gracePeriodEnd");

-- CreateIndex
CREATE INDEX "UserSubscription_isTrialActive_idx" ON "public"."UserSubscription"("isTrialActive");

-- CreateIndex
CREATE INDEX "UserSubscription_isInGracePeriod_idx" ON "public"."UserSubscription"("isInGracePeriod");

-- AddForeignKey
ALTER TABLE "public"."BillingRecord" ADD CONSTRAINT "BillingRecord_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "public"."UserSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
