-- CreateIndex
CREATE INDEX "TrainingExercise_dayId_completedAt_idx" ON "public"."TrainingExercise"("dayId", "completedAt");

-- CreateIndex
CREATE INDEX "TrainingExercise_dayId_order_idx" ON "public"."TrainingExercise"("dayId", "order");
