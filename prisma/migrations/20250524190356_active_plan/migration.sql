-- AlterTable
ALTER TABLE "TrainingPlan" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);
