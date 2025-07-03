-- CreateTable
CREATE TABLE "BaseExerciseSubstitute" (
    "id" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "substituteId" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BaseExerciseSubstitute_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BaseExerciseSubstitute_originalId_idx" ON "BaseExerciseSubstitute"("originalId");

-- CreateIndex
CREATE INDEX "BaseExerciseSubstitute_substituteId_idx" ON "BaseExerciseSubstitute"("substituteId");

-- CreateIndex
CREATE UNIQUE INDEX "BaseExerciseSubstitute_originalId_substituteId_key" ON "BaseExerciseSubstitute"("originalId", "substituteId");

-- AddForeignKey
ALTER TABLE "BaseExerciseSubstitute" ADD CONSTRAINT "BaseExerciseSubstitute_originalId_fkey" FOREIGN KEY ("originalId") REFERENCES "BaseExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BaseExerciseSubstitute" ADD CONSTRAINT "BaseExerciseSubstitute_substituteId_fkey" FOREIGN KEY ("substituteId") REFERENCES "BaseExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
