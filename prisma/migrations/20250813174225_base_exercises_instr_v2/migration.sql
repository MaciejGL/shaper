/*
  Warnings:

  - You are about to drop the column `dataSource` on the `BaseExercise` table. All the data in the column will be lost.
  - You are about to drop the column `execution` on the `BaseExercise` table. All the data in the column will be lost.
  - You are about to drop the column `importedAt` on the `BaseExercise` table. All the data in the column will be lost.
  - You are about to drop the column `sourceId` on the `BaseExercise` table. All the data in the column will be lost.
  - You are about to drop the column `startPosition` on the `BaseExercise` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "BaseExercise_dataSource_idx";

-- DropIndex
DROP INDEX "BaseExercise_importedAt_idx";

-- AlterTable
ALTER TABLE "BaseExercise" DROP COLUMN "dataSource",
DROP COLUMN "execution",
DROP COLUMN "importedAt",
DROP COLUMN "sourceId",
DROP COLUMN "startPosition";
