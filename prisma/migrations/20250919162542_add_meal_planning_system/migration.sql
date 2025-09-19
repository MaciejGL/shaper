-- CreateTable
CREATE TABLE "public"."NutritionPlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trainerId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "isSharedWithClient" BOOLEAN NOT NULL DEFAULT false,
    "sharedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NutritionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NutritionPlanDay" (
    "id" TEXT NOT NULL,
    "nutritionPlanId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutritionPlanDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Meal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "instructions" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "preparationTime" INTEGER,
    "cookingTime" INTEGER,
    "servings" INTEGER,
    "createdById" TEXT NOT NULL,
    "teamId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Ingredient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "proteinPer100g" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "carbsPer100g" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fatPer100g" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "caloriesPer100g" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MealIngredient" (
    "id" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "grams" DOUBLE PRECISION NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MealIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."NutritionPlanMeal" (
    "id" TEXT NOT NULL,
    "nutritionPlanDayId" TEXT NOT NULL,
    "mealId" TEXT NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "portionMultiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutritionPlanMeal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NutritionPlan_trainerId_clientId_idx" ON "public"."NutritionPlan"("trainerId", "clientId");

-- CreateIndex
CREATE INDEX "NutritionPlan_trainerId_isSharedWithClient_idx" ON "public"."NutritionPlan"("trainerId", "isSharedWithClient");

-- CreateIndex
CREATE INDEX "NutritionPlan_clientId_isSharedWithClient_idx" ON "public"."NutritionPlan"("clientId", "isSharedWithClient");

-- CreateIndex
CREATE INDEX "NutritionPlan_trainerId_clientId_isSharedWithClient_idx" ON "public"."NutritionPlan"("trainerId", "clientId", "isSharedWithClient");

-- CreateIndex
CREATE INDEX "NutritionPlan_sharedAt_idx" ON "public"."NutritionPlan"("sharedAt");

-- CreateIndex
CREATE INDEX "NutritionPlan_updatedAt_idx" ON "public"."NutritionPlan"("updatedAt");

-- CreateIndex
CREATE INDEX "NutritionPlanDay_nutritionPlanId_dayNumber_idx" ON "public"."NutritionPlanDay"("nutritionPlanId", "dayNumber");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionPlanDay_nutritionPlanId_dayNumber_key" ON "public"."NutritionPlanDay"("nutritionPlanId", "dayNumber");

-- CreateIndex
CREATE INDEX "Meal_teamId_createdAt_idx" ON "public"."Meal"("teamId", "createdAt");

-- CreateIndex
CREATE INDEX "Meal_teamId_name_idx" ON "public"."Meal"("teamId", "name");

-- CreateIndex
CREATE INDEX "Meal_createdById_createdAt_idx" ON "public"."Meal"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "Meal_teamId_name_createdAt_idx" ON "public"."Meal"("teamId", "name", "createdAt");

-- CreateIndex
CREATE INDEX "Ingredient_createdById_createdAt_idx" ON "public"."Ingredient"("createdById", "createdAt");

-- CreateIndex
CREATE INDEX "Ingredient_name_idx" ON "public"."Ingredient"("name");

-- CreateIndex
CREATE INDEX "MealIngredient_mealId_orderIndex_idx" ON "public"."MealIngredient"("mealId", "orderIndex");

-- CreateIndex
CREATE INDEX "MealIngredient_ingredientId_idx" ON "public"."MealIngredient"("ingredientId");

-- CreateIndex
CREATE INDEX "MealIngredient_mealId_idx" ON "public"."MealIngredient"("mealId");

-- CreateIndex
CREATE UNIQUE INDEX "MealIngredient_mealId_ingredientId_key" ON "public"."MealIngredient"("mealId", "ingredientId");

-- CreateIndex
CREATE INDEX "NutritionPlanMeal_nutritionPlanDayId_orderIndex_idx" ON "public"."NutritionPlanMeal"("nutritionPlanDayId", "orderIndex");

-- CreateIndex
CREATE INDEX "NutritionPlanMeal_mealId_idx" ON "public"."NutritionPlanMeal"("mealId");

-- CreateIndex
CREATE INDEX "NutritionPlanMeal_nutritionPlanDayId_idx" ON "public"."NutritionPlanMeal"("nutritionPlanDayId");

-- AddForeignKey
ALTER TABLE "public"."NutritionPlan" ADD CONSTRAINT "NutritionPlan_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NutritionPlan" ADD CONSTRAINT "NutritionPlan_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NutritionPlanDay" ADD CONSTRAINT "NutritionPlanDay_nutritionPlanId_fkey" FOREIGN KEY ("nutritionPlanId") REFERENCES "public"."NutritionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meal" ADD CONSTRAINT "Meal_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meal" ADD CONSTRAINT "Meal_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "public"."Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Ingredient" ADD CONSTRAINT "Ingredient_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MealIngredient" ADD CONSTRAINT "MealIngredient_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "public"."Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MealIngredient" ADD CONSTRAINT "MealIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "public"."Ingredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NutritionPlanMeal" ADD CONSTRAINT "NutritionPlanMeal_nutritionPlanDayId_fkey" FOREIGN KEY ("nutritionPlanDayId") REFERENCES "public"."NutritionPlanDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NutritionPlanMeal" ADD CONSTRAINT "NutritionPlanMeal_mealId_fkey" FOREIGN KEY ("mealId") REFERENCES "public"."Meal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
