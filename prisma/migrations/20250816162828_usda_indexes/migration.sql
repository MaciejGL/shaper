-- CreateIndex
CREATE INDEX "usda_food_display_name_idx" ON "USDAFood"("displayName");

-- CreateIndex
CREATE INDEX "usda_food_display_search_idx" ON "USDAFood"("displayName", "dataType");

-- CreateIndex
CREATE INDEX "usda_food_hybrid_search_idx" ON "USDAFood"("dataType", "displayName", "description");
