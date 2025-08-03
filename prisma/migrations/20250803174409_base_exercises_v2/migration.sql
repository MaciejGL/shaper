-- AlterTable
ALTER TABLE "BaseExercise" ADD COLUMN     "dataSource" TEXT,
ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "importedAt" TIMESTAMP(3),
ADD COLUMN     "instructions" TEXT,
ADD COLUMN     "sourceId" TEXT,
ADD COLUMN     "tips" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "BaseExercise_version_idx" ON "BaseExercise"("version");

-- CreateIndex
CREATE INDEX "BaseExercise_dataSource_idx" ON "BaseExercise"("dataSource");

-- CreateIndex
CREATE INDEX "BaseExercise_difficulty_idx" ON "BaseExercise"("difficulty");

-- CreateIndex
CREATE INDEX "BaseExercise_importedAt_idx" ON "BaseExercise"("importedAt");
