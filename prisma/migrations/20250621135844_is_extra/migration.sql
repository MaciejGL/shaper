-- AlterTable
ALTER TABLE "ExerciseSet" ADD COLUMN     "isExtra" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TrainingExercise" ADD COLUMN     "isExtra" BOOLEAN NOT NULL DEFAULT false;
