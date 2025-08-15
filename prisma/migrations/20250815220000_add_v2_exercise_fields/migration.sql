-- CreateV2ExerciseFields
-- Add description, instructions, tips, and difficulty fields to exercise tables

-- TrainingExercise: Add new V2 fields
ALTER TABLE "TrainingExercise" ADD COLUMN "description" TEXT;
ALTER TABLE "TrainingExercise" ADD COLUMN "difficulty" TEXT;
ALTER TABLE "TrainingExercise" ADD COLUMN "tips" TEXT[];

-- TrainingExercise: Convert instructions from TEXT to TEXT[]
ALTER TABLE "TrainingExercise" DROP COLUMN "instructions";
ALTER TABLE "TrainingExercise" ADD COLUMN "instructions" TEXT[];

-- FavouriteWorkoutExercise: Add new V2 fields
ALTER TABLE "FavouriteWorkoutExercise" ADD COLUMN "additionalInstructions" TEXT;
ALTER TABLE "FavouriteWorkoutExercise" ADD COLUMN "description" TEXT;
ALTER TABLE "FavouriteWorkoutExercise" ADD COLUMN "difficulty" TEXT;
ALTER TABLE "FavouriteWorkoutExercise" ADD COLUMN "tips" TEXT[];

-- FavouriteWorkoutExercise: Convert instructions from TEXT to TEXT[]
ALTER TABLE "FavouriteWorkoutExercise" DROP COLUMN "instructions";
ALTER TABLE "FavouriteWorkoutExercise" ADD COLUMN "instructions" TEXT[];
