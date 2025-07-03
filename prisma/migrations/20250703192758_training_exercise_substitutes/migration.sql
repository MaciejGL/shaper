/*
  Warnings:

  - You are about to drop the `ExerciseSubstitutionOption` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `UserExerciseSubstitution` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[substitutedById]` on the table `TrainingExercise` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ExerciseSubstitutionOption" DROP CONSTRAINT "ExerciseSubstitutionOption_originalId_fkey";

-- DropForeignKey
ALTER TABLE "ExerciseSubstitutionOption" DROP CONSTRAINT "ExerciseSubstitutionOption_substituteId_fkey";

-- DropForeignKey
ALTER TABLE "UserExerciseSubstitution" DROP CONSTRAINT "UserExerciseSubstitution_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "UserExerciseSubstitution" DROP CONSTRAINT "UserExerciseSubstitution_selectedId_fkey";

-- DropForeignKey
ALTER TABLE "UserExerciseSubstitution" DROP CONSTRAINT "UserExerciseSubstitution_userId_fkey";

-- AlterTable
ALTER TABLE "TrainingExercise" ADD COLUMN     "substitutedById" TEXT;

-- DropTable
DROP TABLE "ExerciseSubstitutionOption";

-- DropTable
DROP TABLE "UserExerciseSubstitution";

-- CreateIndex
CREATE UNIQUE INDEX "TrainingExercise_substitutedById_key" ON "TrainingExercise"("substitutedById");

-- AddForeignKey
ALTER TABLE "TrainingExercise" ADD CONSTRAINT "TrainingExercise_substitutedById_fkey" FOREIGN KEY ("substitutedById") REFERENCES "TrainingExercise"("id") ON DELETE SET NULL ON UPDATE CASCADE;
