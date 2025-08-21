-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('TRAINING_PLAN', 'MEAL_PLAN', 'COACHING', 'IN_PERSON_MEETING', 'PREMIUM_ACCESS');

-- CreateEnum
CREATE TYPE "SubscriptionDuration" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED', 'PENDING');

-- CreateTable
CREATE TABLE "PackageTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceNOK" INTEGER NOT NULL,
    "duration" "SubscriptionDuration" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "trainerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageService" (
    "id" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "PackageService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "trainerId" TEXT,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "mockPaymentStatus" TEXT DEFAULT 'COMPLETED',
    "mockTransactionId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceUsage" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "usedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "metadata" JSONB,

    CONSTRAINT "ServiceUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PackageTemplate_trainerId_idx" ON "PackageTemplate"("trainerId");

-- CreateIndex
CREATE INDEX "PackageTemplate_isActive_idx" ON "PackageTemplate"("isActive");

-- CreateIndex
CREATE INDEX "PackageTemplate_duration_idx" ON "PackageTemplate"("duration");

-- CreateIndex
CREATE INDEX "PackageService_packageId_idx" ON "PackageService"("packageId");

-- CreateIndex
CREATE INDEX "PackageService_serviceType_idx" ON "PackageService"("serviceType");

-- CreateIndex
CREATE UNIQUE INDEX "PackageService_packageId_serviceType_key" ON "PackageService"("packageId", "serviceType");

-- CreateIndex
CREATE INDEX "UserSubscription_userId_idx" ON "UserSubscription"("userId");

-- CreateIndex
CREATE INDEX "UserSubscription_trainerId_idx" ON "UserSubscription"("trainerId");

-- CreateIndex
CREATE INDEX "UserSubscription_status_idx" ON "UserSubscription"("status");

-- CreateIndex
CREATE INDEX "UserSubscription_endDate_idx" ON "UserSubscription"("endDate");

-- CreateIndex
CREATE INDEX "UserSubscription_startDate_idx" ON "UserSubscription"("startDate");

-- CreateIndex
CREATE INDEX "ServiceUsage_subscriptionId_idx" ON "ServiceUsage"("subscriptionId");

-- CreateIndex
CREATE INDEX "ServiceUsage_serviceType_idx" ON "ServiceUsage"("serviceType");

-- CreateIndex
CREATE INDEX "ServiceUsage_usedAt_idx" ON "ServiceUsage"("usedAt");

-- AddForeignKey
ALTER TABLE "PackageTemplate" ADD CONSTRAINT "PackageTemplate_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageService" ADD CONSTRAINT "PackageService_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "PackageTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "PackageTemplate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ServiceUsage" ADD CONSTRAINT "ServiceUsage_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "UserSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
