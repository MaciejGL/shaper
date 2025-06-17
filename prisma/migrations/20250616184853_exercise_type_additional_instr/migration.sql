-- AlterTable
ALTER TABLE "BaseExercise" ADD COLUMN     "additionalInstructions" TEXT,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "TrainingExercise" ADD COLUMN     "additionalInstructions" TEXT,
ADD COLUMN     "type" TEXT;
