/*
  Warnings:

  - You are about to drop the column `completedAt` on the `ExerciseSetLog` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `ExerciseSetLog` table. All the data in the column will be lost.
  - You are about to drop the column `performedReps` on the `ExerciseSetLog` table. All the data in the column will be lost.
  - You are about to drop the column `performedWeight` on the `ExerciseSetLog` table. All the data in the column will be lost.
  - You are about to drop the `_AssignedPlans` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `reps` to the `ExerciseSetLog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `weight` to the `ExerciseSetLog` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_AssignedPlans" DROP CONSTRAINT "_AssignedPlans_A_fkey";

-- DropForeignKey
ALTER TABLE "_AssignedPlans" DROP CONSTRAINT "_AssignedPlans_B_fkey";

-- AlterTable
ALTER TABLE "ExerciseSetLog" DROP COLUMN "completedAt",
DROP COLUMN "notes",
DROP COLUMN "performedReps",
DROP COLUMN "performedWeight",
ADD COLUMN     "reps" INTEGER NOT NULL,
ADD COLUMN     "weight" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "TrainingPlan" ADD COLUMN     "assignedToId" TEXT;

-- DropTable
DROP TABLE "_AssignedPlans";

-- AddForeignKey
ALTER TABLE "TrainingPlan" ADD CONSTRAINT "TrainingPlan_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
