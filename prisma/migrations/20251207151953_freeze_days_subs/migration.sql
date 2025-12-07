-- AlterTable
ALTER TABLE "UserSubscription" ADD COLUMN     "freezeDaysUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "freezeUsageYear" INTEGER;
