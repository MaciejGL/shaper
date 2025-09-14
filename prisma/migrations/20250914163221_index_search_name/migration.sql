-- CreateIndex
CREATE INDEX "TrainingExercise_name_completedAt_idx" ON "public"."TrainingExercise"("name", "completedAt");

-- CreateIndex
CREATE INDEX "TrainingExercise_dayId_name_completedAt_idx" ON "public"."TrainingExercise"("dayId", "name", "completedAt");

-- CreateIndex
CREATE INDEX "TrainingExercise_name_dayId_idx" ON "public"."TrainingExercise"("name", "dayId");
