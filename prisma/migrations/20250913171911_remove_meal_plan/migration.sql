/*
  Warnings:

  - You are about to drop the column `mealReminders` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the `FoodProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Meal` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MealDay` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MealFood` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MealFoodLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MealPlan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MealWeek` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OpenFoodFactsProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `USDAFood` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."Meal" DROP CONSTRAINT "Meal_dayId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MealDay" DROP CONSTRAINT "MealDay_weekId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MealFood" DROP CONSTRAINT "MealFood_addedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."MealFood" DROP CONSTRAINT "MealFood_mealId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MealFoodLog" DROP CONSTRAINT "MealFoodLog_mealFoodId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MealFoodLog" DROP CONSTRAINT "MealFoodLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MealPlan" DROP CONSTRAINT "MealPlan_assignedToId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MealPlan" DROP CONSTRAINT "MealPlan_createdById_fkey";

-- DropForeignKey
ALTER TABLE "public"."MealPlan" DROP CONSTRAINT "MealPlan_templateId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MealWeek" DROP CONSTRAINT "MealWeek_planId_fkey";

-- AlterTable
ALTER TABLE "public"."UserProfile" DROP COLUMN "mealReminders";

-- DropTable
DROP TABLE "public"."FoodProduct";

-- DropTable
DROP TABLE "public"."Meal";

-- DropTable
DROP TABLE "public"."MealDay";

-- DropTable
DROP TABLE "public"."MealFood";

-- DropTable
DROP TABLE "public"."MealFoodLog";

-- DropTable
DROP TABLE "public"."MealPlan";

-- DropTable
DROP TABLE "public"."MealWeek";

-- DropTable
DROP TABLE "public"."OpenFoodFactsProduct";

-- DropTable
DROP TABLE "public"."USDAFood";
