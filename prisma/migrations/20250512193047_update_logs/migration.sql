/*
  Warnings:

  - You are about to drop the column `repsPerSet` on the `ExerciseLog` table. All the data in the column will be lost.
  - You are about to drop the column `setsCompleted` on the `ExerciseLog` table. All the data in the column will be lost.
  - You are about to drop the column `weightPerSet` on the `ExerciseLog` table. All the data in the column will be lost.
  - You are about to drop the column `reps` on the `TrainingExercise` table. All the data in the column will be lost.
  - You are about to drop the column `sets` on the `TrainingExercise` table. All the data in the column will be lost.
  - You are about to drop the `Set` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `TrainingExercise` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ExerciseLog" DROP COLUMN "repsPerSet",
DROP COLUMN "setsCompleted",
DROP COLUMN "weightPerSet";

-- AlterTable
ALTER TABLE "TrainingExercise" DROP COLUMN "reps",
DROP COLUMN "sets",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- DropTable
DROP TABLE "Set";

-- CreateTable
CREATE TABLE "ExerciseSet" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "weight" DOUBLE PRECISION,
    "exerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseSetLog" (
    "id" TEXT NOT NULL,
    "exerciseSetId" TEXT NOT NULL,
    "performedReps" INTEGER NOT NULL,
    "performedWeight" DOUBLE PRECISION NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "exerciseLogId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExerciseSetLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExerciseSet_exerciseId_idx" ON "ExerciseSet"("exerciseId");

-- CreateIndex
CREATE INDEX "TrainingExercise_dayId_idx" ON "TrainingExercise"("dayId");

-- CreateIndex
CREATE INDEX "TrainingExercise_baseId_idx" ON "TrainingExercise"("baseId");

-- AddForeignKey
ALTER TABLE "ExerciseSet" ADD CONSTRAINT "ExerciseSet_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "TrainingExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSetLog" ADD CONSTRAINT "ExerciseSetLog_exerciseSetId_fkey" FOREIGN KEY ("exerciseSetId") REFERENCES "ExerciseSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSetLog" ADD CONSTRAINT "ExerciseSetLog_exerciseLogId_fkey" FOREIGN KEY ("exerciseLogId") REFERENCES "ExerciseLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
