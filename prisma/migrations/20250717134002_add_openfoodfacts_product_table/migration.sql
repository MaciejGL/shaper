-- CreateTable
CREATE TABLE "OpenFoodFactsProduct" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "brands" TEXT,
    "categories" TEXT,
    "origins" TEXT,
    "countries" TEXT,
    "labels" TEXT,
    "packaging" TEXT,
    "ingredients" TEXT,
    "allergens" TEXT,
    "traces" TEXT,
    "servingSize" TEXT,
    "servingQuantity" DOUBLE PRECISION,
    "energyKcal100g" DOUBLE PRECISION,
    "proteins100g" DOUBLE PRECISION,
    "carbohydrates100g" DOUBLE PRECISION,
    "fat100g" DOUBLE PRECISION,
    "fiber100g" DOUBLE PRECISION,
    "sugars100g" DOUBLE PRECISION,
    "salt100g" DOUBLE PRECISION,
    "saturatedFat100g" DOUBLE PRECISION,
    "sodium100g" DOUBLE PRECISION,
    "nutriScore" TEXT,
    "novaGroup" INTEGER,
    "ecoScore" TEXT,
    "completeness" DOUBLE PRECISION,
    "lastModified" TIMESTAMP(3),
    "scansN" INTEGER,
    "uniqueScansN" INTEGER,
    "imageUrl" TEXT,
    "imageFrontUrl" TEXT,
    "imageIngredientsUrl" TEXT,
    "imageNutritionUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OpenFoodFactsProduct_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OpenFoodFactsProduct_code_key" ON "OpenFoodFactsProduct"("code");

-- CreateIndex
CREATE INDEX "off_product_name_idx" ON "OpenFoodFactsProduct"("productName");

-- CreateIndex
CREATE INDEX "off_brands_idx" ON "OpenFoodFactsProduct"("brands");

-- CreateIndex
CREATE INDEX "off_categories_idx" ON "OpenFoodFactsProduct"("categories");

-- CreateIndex
CREATE INDEX "off_countries_idx" ON "OpenFoodFactsProduct"("countries");

-- CreateIndex
CREATE INDEX "off_code_idx" ON "OpenFoodFactsProduct"("code");

-- CreateIndex
CREATE INDEX "off_nutri_score_idx" ON "OpenFoodFactsProduct"("nutriScore");

-- CreateIndex
CREATE INDEX "off_last_modified_idx" ON "OpenFoodFactsProduct"("lastModified");

-- CreateIndex
CREATE INDEX "off_scans_idx" ON "OpenFoodFactsProduct"("scansN");

-- CreateIndex
CREATE INDEX "off_completeness_idx" ON "OpenFoodFactsProduct"("completeness");
