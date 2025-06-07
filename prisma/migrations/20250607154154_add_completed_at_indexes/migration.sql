-- CreateIndex
CREATE INDEX "ExerciseSet_completedAt_idx" ON "ExerciseSet"("completedAt");

-- CreateIndex
CREATE INDEX "TrainingDay_completedAt_idx" ON "TrainingDay"("completedAt");

-- CreateIndex
CREATE INDEX "TrainingExercise_completedAt_idx" ON "TrainingExercise"("completedAt");

-- CreateIndex
CREATE INDEX "TrainingPlan_completedAt_idx" ON "TrainingPlan"("completedAt");

-- CreateIndex
CREATE INDEX "TrainingWeek_completedAt_idx" ON "TrainingWeek"("completedAt");
