-- CreateIndex
CREATE INDEX "off_search_quality_idx" ON "OpenFoodFactsProduct"("completeness" DESC, "scansN" DESC, "productName");

-- CreateIndex
CREATE INDEX "off_nutrition_filter_idx" ON "OpenFoodFactsProduct"("energyKcal100g", "proteins100g", "carbohydrates100g", "fat100g");

-- CreateIndex
CREATE INDEX "off_country_search_idx" ON "OpenFoodFactsProduct"("countries", "productName");

-- CreateIndex
CREATE INDEX "usda_food_search_quality_idx" ON "USDAFood"("dataType", "description");

-- CreateIndex
CREATE INDEX "usda_nutrition_filter_idx" ON "USDAFood"("caloriesPer100g", "proteinPer100g", "carbsPer100g", "fatPer100g");
