/*
  Warnings:

  - You are about to drop the column `exerciseLogId` on the `ExerciseSetLog` table. All the data in the column will be lost.
  - You are about to drop the column `exerciseSetId` on the `ExerciseSetLog` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[logId]` on the table `ExerciseSet` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ExerciseSetLog" DROP CONSTRAINT "ExerciseSetLog_exerciseLogId_fkey";

-- DropForeignKey
ALTER TABLE "ExerciseSetLog" DROP CONSTRAINT "ExerciseSetLog_exerciseSetId_fkey";

-- AlterTable
ALTER TABLE "ExerciseSet" ADD COLUMN     "logId" TEXT;

-- AlterTable
ALTER TABLE "ExerciseSetLog" DROP COLUMN "exerciseLogId",
DROP COLUMN "exerciseSetId";

-- CreateIndex
CREATE UNIQUE INDEX "ExerciseSet_logId_key" ON "ExerciseSet"("logId");

-- AddForeignKey
ALTER TABLE "ExerciseSet" ADD CONSTRAINT "ExerciseSet_logId_fkey" FOREIGN KEY ("logId") REFERENCES "ExerciseSetLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
