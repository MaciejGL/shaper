-- AlterTable
ALTER TABLE "BaseExercise" ADD COLUMN     "isPremium" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "BaseExercise_isPremium_idx" ON "BaseExercise"("isPremium");
