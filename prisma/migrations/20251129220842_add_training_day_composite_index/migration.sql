-- CreateIndex
CREATE INDEX "TrainingDay_scheduledAt_isRestDay_weekId_idx" ON "TrainingDay"("scheduledAt", "isRestDay", "weekId");
