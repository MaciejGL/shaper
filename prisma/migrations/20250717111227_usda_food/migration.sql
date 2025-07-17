-- CreateTable
CREATE TABLE "USDAFood" (
    "id" TEXT NOT NULL,
    "fdcId" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "dataType" TEXT NOT NULL,
    "foodCategory" TEXT,
    "brandOwner" TEXT,
    "brandName" TEXT,
    "ingredients" TEXT,
    "servingSize" DOUBLE PRECISION,
    "servingSizeUnit" TEXT,
    "publishedDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "caloriesPer100g" DOUBLE PRECISION,
    "proteinPer100g" DOUBLE PRECISION,
    "carbsPer100g" DOUBLE PRECISION,
    "fatPer100g" DOUBLE PRECISION,
    "fiberPer100g" DOUBLE PRECISION,
    "sugarPer100g" DOUBLE PRECISION,
    "sodiumPer100g" DOUBLE PRECISION,
    "calciumPer100g" DOUBLE PRECISION,
    "ironPer100g" DOUBLE PRECISION,
    "potassiumPer100g" DOUBLE PRECISION,
    "vitaminCPer100g" DOUBLE PRECISION,

    CONSTRAINT "USDAFood_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "USDAFood_fdcId_key" ON "USDAFood"("fdcId");

-- CreateIndex
CREATE INDEX "usda_food_description_idx" ON "USDAFood"("description");

-- CreateIndex
CREATE INDEX "usda_food_data_type_idx" ON "USDAFood"("dataType");

-- CreateIndex
CREATE INDEX "usda_food_category_idx" ON "USDAFood"("foodCategory");

-- CreateIndex
CREATE INDEX "usda_food_fdc_id_idx" ON "USDAFood"("fdcId");
