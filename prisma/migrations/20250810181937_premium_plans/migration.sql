-- AlterTable
ALTER TABLE "TrainingPlan" ADD COLUMN     "focusTags" TEXT[],
ADD COLUMN     "premium" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "targetGoals" TEXT[];
