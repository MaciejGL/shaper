/*
  Warnings:

  - A unique constraint covering the columns `[userId,baseExerciseId,dayId]` on the table `PersonalRecord` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `dayId` to the `PersonalRecord` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."PersonalRecord_userId_baseExerciseId_key";

-- AlterTable
ALTER TABLE "public"."PersonalRecord" ADD COLUMN     "dayId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "PersonalRecord_userId_baseExerciseId_idx" ON "public"."PersonalRecord"("userId", "baseExerciseId");

-- CreateIndex
CREATE INDEX "PersonalRecord_userId_baseExerciseId_estimated1RM_idx" ON "public"."PersonalRecord"("userId", "baseExerciseId", "estimated1RM");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalRecord_userId_baseExerciseId_dayId_key" ON "public"."PersonalRecord"("userId", "baseExerciseId", "dayId");

-- AddForeignKey
ALTER TABLE "public"."PersonalRecord" ADD CONSTRAINT "PersonalRecord_dayId_fkey" FOREIGN KEY ("dayId") REFERENCES "public"."TrainingDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
