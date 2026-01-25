/*
  Warnings:

  - You are about to drop the column `presetId` on the `VolumeGoalPeriod` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "VolumeGoalPeriod" DROP COLUMN "presetId",
ADD COLUMN     "commitment" TEXT NOT NULL DEFAULT 'moderate',
ADD COLUMN     "focusPreset" TEXT NOT NULL DEFAULT 'balanced';
