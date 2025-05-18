/*
  Warnings:

  - Added the required column `name` to the `TrainingWeek` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TrainingDay" ADD COLUMN     "isRestDay" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "workoutType" TEXT;

-- AlterTable
ALTER TABLE "TrainingWeek" ADD COLUMN     "description" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;
