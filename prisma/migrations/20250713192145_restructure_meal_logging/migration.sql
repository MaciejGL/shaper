/*
  Warnings:

  - You are about to drop the `MealLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MealLogItem` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MealLog" DROP CONSTRAINT "MealLog_mealId_fkey";

-- DropForeignKey
ALTER TABLE "MealLog" DROP CONSTRAINT "MealLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "MealLogItem" DROP CONSTRAINT "MealLogItem_logId_fkey";

-- DropForeignKey
ALTER TABLE "MealLogItem" DROP CONSTRAINT "MealLogItem_plannedFoodId_fkey";

-- AlterTable
ALTER TABLE "MealFood" ADD COLUMN     "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "addedById" TEXT;

-- DropTable
DROP TABLE "MealLog";

-- DropTable
DROP TABLE "MealLogItem";

-- CreateTable
CREATE TABLE "MealFoodLog" (
    "id" TEXT NOT NULL,
    "mealFoodId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "calories" DOUBLE PRECISION,
    "protein" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "fat" DOUBLE PRECISION,
    "fiber" DOUBLE PRECISION,

    CONSTRAINT "MealFoodLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MealFoodLog_mealFoodId_idx" ON "MealFoodLog"("mealFoodId");

-- CreateIndex
CREATE INDEX "MealFoodLog_userId_loggedAt_idx" ON "MealFoodLog"("userId", "loggedAt");

-- CreateIndex
CREATE INDEX "MealFood_mealId_idx" ON "MealFood"("mealId");

-- CreateIndex
CREATE INDEX "MealFood_addedAt_idx" ON "MealFood"("addedAt");

-- AddForeignKey
ALTER TABLE "MealFood" ADD CONSTRAINT "MealFood_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealFoodLog" ADD CONSTRAINT "MealFoodLog_mealFoodId_fkey" FOREIGN KEY ("mealFoodId") REFERENCES "MealFood"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealFoodLog" ADD CONSTRAINT "MealFoodLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
