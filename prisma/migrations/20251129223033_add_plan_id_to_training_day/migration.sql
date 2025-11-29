-- DropIndex
DROP INDEX "TrainingDay_scheduledAt_completedAt_isRestDay_weekId_idx";

-- DropIndex
DROP INDEX "TrainingDay_scheduledAt_isRestDay_weekId_idx";

-- AlterTable
ALTER TABLE "TrainingDay" ADD COLUMN     "planId" TEXT;

-- CreateIndex
CREATE INDEX "TrainingDay_planId_scheduledAt_isRestDay_idx" ON "TrainingDay"("planId", "scheduledAt", "isRestDay");

-- AddForeignKey
ALTER TABLE "TrainingDay" ADD CONSTRAINT "TrainingDay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "TrainingPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;
