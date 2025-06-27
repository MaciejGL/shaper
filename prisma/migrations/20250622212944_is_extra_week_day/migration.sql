-- AlterTable
ALTER TABLE "TrainingDay" ADD COLUMN     "isExtra" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "TrainingWeek" ADD COLUMN     "isExtra" BOOLEAN NOT NULL DEFAULT false;
