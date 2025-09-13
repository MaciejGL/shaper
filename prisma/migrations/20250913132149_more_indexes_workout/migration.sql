-- CreateIndex
CREATE INDEX "ExerciseSet_exerciseId_order_idx" ON "public"."ExerciseSet"("exerciseId", "order");

-- CreateIndex
CREATE INDEX "ExerciseSet_exerciseId_completedAt_idx" ON "public"."ExerciseSet"("exerciseId", "completedAt");

-- CreateIndex
CREATE INDEX "Image_entityType_entityId_order_idx" ON "public"."Image"("entityType", "entityId", "order");

-- CreateIndex
CREATE INDEX "TrainingExercise_baseId_dayId_idx" ON "public"."TrainingExercise"("baseId", "dayId");

-- CreateIndex
CREATE INDEX "TrainingExercise_substitutedById_idx" ON "public"."TrainingExercise"("substitutedById");
