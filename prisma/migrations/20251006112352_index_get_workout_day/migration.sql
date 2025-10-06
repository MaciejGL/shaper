-- CreateIndex
CREATE INDEX "BaseExercise_isPublic_idx" ON "public"."BaseExercise"("isPublic");

-- CreateIndex
CREATE INDEX "BaseExercise_isPublic_isPremium_idx" ON "public"."BaseExercise"("isPublic", "isPremium");

-- CreateIndex
CREATE INDEX "TrainingDay_scheduledAt_idx" ON "public"."TrainingDay"("scheduledAt");

-- CreateIndex
CREATE INDEX "TrainingDay_weekId_scheduledAt_idx" ON "public"."TrainingDay"("weekId", "scheduledAt");

-- CreateIndex
CREATE INDEX "TrainingExercise_baseId_completedAt_idx" ON "public"."TrainingExercise"("baseId", "completedAt");
