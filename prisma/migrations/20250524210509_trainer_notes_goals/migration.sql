/*
  Warnings:

  - You are about to drop the column `goal` on the `UserProfile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "trainerNotes" TEXT;

-- AlterTable
ALTER TABLE "UserProfile" DROP COLUMN "goal",
ADD COLUMN     "goals" TEXT[];
