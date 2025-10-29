-- AlterTable
ALTER TABLE "public"."BaseExercise" ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "BaseExercise_verified_idx" ON "public"."BaseExercise"("verified");
