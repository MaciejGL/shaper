-- AlterTable
ALTER TABLE "public"."TrainingDay" ADD COLUMN     "sourcePlanId" TEXT,
ADD COLUMN     "sourceTrainingDayId" TEXT;

-- AlterTable
ALTER TABLE "public"."TrainingPlan" ADD COLUMN     "heroImageUrl" TEXT,
ADD COLUMN     "sourceTrainingPlanId" TEXT;

-- CreateTable
CREATE TABLE "public"."FreeWorkoutDay" (
    "id" TEXT NOT NULL,
    "trainingDayId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "heroImageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FreeWorkoutDay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FreeWorkoutDay_trainingDayId_key" ON "public"."FreeWorkoutDay"("trainingDayId");

-- CreateIndex
CREATE INDEX "FreeWorkoutDay_isVisible_idx" ON "public"."FreeWorkoutDay"("isVisible");

-- CreateIndex
CREATE INDEX "FreeWorkoutDay_planId_idx" ON "public"."FreeWorkoutDay"("planId");

-- CreateIndex
CREATE INDEX "FreeWorkoutDay_trainingDayId_idx" ON "public"."FreeWorkoutDay"("trainingDayId");

-- CreateIndex
CREATE INDEX "TrainingDay_sourceTrainingDayId_idx" ON "public"."TrainingDay"("sourceTrainingDayId");

-- CreateIndex
CREATE INDEX "TrainingDay_sourcePlanId_idx" ON "public"."TrainingDay"("sourcePlanId");

-- CreateIndex
CREATE INDEX "TrainingPlan_sourceTrainingPlanId_idx" ON "public"."TrainingPlan"("sourceTrainingPlanId");

-- AddForeignKey
ALTER TABLE "public"."FreeWorkoutDay" ADD CONSTRAINT "FreeWorkoutDay_trainingDayId_fkey" FOREIGN KEY ("trainingDayId") REFERENCES "public"."TrainingDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FreeWorkoutDay" ADD CONSTRAINT "FreeWorkoutDay_planId_fkey" FOREIGN KEY ("planId") REFERENCES "public"."TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
