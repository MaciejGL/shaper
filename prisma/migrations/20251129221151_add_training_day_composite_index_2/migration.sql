-- CreateIndex
CREATE INDEX "TrainingDay_scheduledAt_completedAt_isRestDay_weekId_idx" ON "TrainingDay"("scheduledAt", "completedAt", "isRestDay", "weekId");
