/*
  Warnings:

  - You are about to drop the column `portionMultiplier` on the `NutritionPlanMeal` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."NutritionPlanMeal" DROP COLUMN "portionMultiplier";

-- CreateTable
CREATE TABLE "public"."NutritionPlanMealIngredient" (
    "id" TEXT NOT NULL,
    "nutritionPlanMealId" TEXT NOT NULL,
    "mealIngredientId" TEXT NOT NULL,
    "grams" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NutritionPlanMealIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "NutritionPlanMealIngredient_nutritionPlanMealId_idx" ON "public"."NutritionPlanMealIngredient"("nutritionPlanMealId");

-- CreateIndex
CREATE INDEX "NutritionPlanMealIngredient_mealIngredientId_idx" ON "public"."NutritionPlanMealIngredient"("mealIngredientId");

-- CreateIndex
CREATE UNIQUE INDEX "NutritionPlanMealIngredient_nutritionPlanMealId_mealIngredi_key" ON "public"."NutritionPlanMealIngredient"("nutritionPlanMealId", "mealIngredientId");

-- AddForeignKey
ALTER TABLE "public"."NutritionPlanMealIngredient" ADD CONSTRAINT "NutritionPlanMealIngredient_nutritionPlanMealId_fkey" FOREIGN KEY ("nutritionPlanMealId") REFERENCES "public"."NutritionPlanMeal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."NutritionPlanMealIngredient" ADD CONSTRAINT "NutritionPlanMealIngredient_mealIngredientId_fkey" FOREIGN KEY ("mealIngredientId") REFERENCES "public"."MealIngredient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
