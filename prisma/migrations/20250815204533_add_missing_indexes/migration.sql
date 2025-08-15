-- CreateIndex
CREATE INDEX "BaseExercise_createdById_idx" ON "BaseExercise"("createdById");

-- CreateIndex
CREATE INDEX "ExerciseLog_exerciseId_idx" ON "ExerciseLog"("exerciseId");

-- CreateIndex
CREATE INDEX "ExerciseLog_userId_idx" ON "ExerciseLog"("userId");

-- CreateIndex
CREATE INDEX "Image_entityId_idx" ON "Image"("entityId");

-- CreateIndex
CREATE INDEX "Meal_dayId_idx" ON "Meal"("dayId");

-- CreateIndex
CREATE INDEX "MealDay_weekId_idx" ON "MealDay"("weekId");

-- CreateIndex
CREATE INDEX "MealFood_addedById_idx" ON "MealFood"("addedById");

-- CreateIndex
CREATE INDEX "MealPlan_assignedToId_idx" ON "MealPlan"("assignedToId");

-- CreateIndex
CREATE INDEX "MealPlan_createdById_idx" ON "MealPlan"("createdById");

-- CreateIndex
CREATE INDEX "MealPlan_templateId_idx" ON "MealPlan"("templateId");

-- CreateIndex
CREATE INDEX "MealPlanCollaborator_addedById_idx" ON "MealPlanCollaborator"("addedById");

-- CreateIndex
CREATE INDEX "MealWeek_planId_idx" ON "MealWeek"("planId");

-- CreateIndex
CREATE INDEX "MuscleGroup_categoryId_idx" ON "MuscleGroup"("categoryId");

-- CreateIndex
CREATE INDEX "off_country_nutrition_idx" ON "OpenFoodFactsProduct"("countries", "energyKcal100g", "proteins100g");

-- CreateIndex
CREATE INDEX "off_quality_sort_idx" ON "OpenFoodFactsProduct"("completeness" DESC, "scansN" DESC);

-- CreateIndex
CREATE INDEX "off_imported_desc_idx" ON "OpenFoodFactsProduct"("importedAt" DESC);

-- CreateIndex
CREATE INDEX "off_images_idx" ON "OpenFoodFactsProduct"("imageUrl");

-- CreateIndex
CREATE INDEX "TrainingPlan_templateId_idx" ON "TrainingPlan"("templateId");

-- CreateIndex
CREATE INDEX "TrainingPlanCollaborator_addedById_idx" ON "TrainingPlanCollaborator"("addedById");

-- CreateIndex
CREATE INDEX "User_trainerId_idx" ON "User"("trainerId");
