-- AlterTable
ALTER TABLE "ExerciseSet" ADD COLUMN     "maxReps" INTEGER,
ADD COLUMN     "minReps" INTEGER,
ALTER COLUMN "reps" DROP NOT NULL;
