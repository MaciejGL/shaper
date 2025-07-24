-- CreateIndex
CREATE INDEX "off_fast_search_idx" ON "OpenFoodFactsProduct"("productName", "energyKcal100g");

-- CreateIndex
CREATE INDEX "off_protein_search_idx" ON "OpenFoodFactsProduct"("productName", "proteins100g");
