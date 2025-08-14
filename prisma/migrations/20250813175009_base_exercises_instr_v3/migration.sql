/*
  Warnings:

  - The `instructions` column on the `BaseExercise` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `tips` column on the `BaseExercise` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "BaseExercise" DROP COLUMN "instructions",
ADD COLUMN     "instructions" TEXT[],
DROP COLUMN "tips",
ADD COLUMN     "tips" TEXT[];
