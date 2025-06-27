/*
  Warnings:

  - You are about to drop the column `partialDuration` on the `WorkoutSessionEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkoutSessionEvent" DROP COLUMN "partialDuration",
ADD COLUMN     "totalDuration" INTEGER NOT NULL DEFAULT 0;
