/*
  Warnings:

  - You are about to drop the column `categoryId` on the `MuscleGroup` table. All the data in the column will be lost.
  - You are about to drop the column `groupSlug` on the `MuscleGroup` table. All the data in the column will be lost.
  - You are about to drop the column `isPrimary` on the `MuscleGroup` table. All the data in the column will be lost.
  - You are about to drop the `MuscleGroupCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MuscleGroup" DROP CONSTRAINT "MuscleGroup_categoryId_fkey";

-- DropIndex
DROP INDEX "MuscleGroup_categoryId_idx";

-- AlterTable
ALTER TABLE "MuscleGroup" DROP COLUMN "categoryId",
DROP COLUMN "groupSlug",
DROP COLUMN "isPrimary",
ADD COLUMN     "displayGroup" TEXT;

-- DropTable
DROP TABLE "MuscleGroupCategory";

-- CreateIndex
CREATE INDEX "MuscleGroup_displayGroup_idx" ON "MuscleGroup"("displayGroup");
