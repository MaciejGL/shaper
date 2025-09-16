-- CreateTable
CREATE TABLE "public"."PersonalRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "baseExerciseId" TEXT NOT NULL,
    "estimated1RM" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PersonalRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PersonalRecord_userId_idx" ON "public"."PersonalRecord"("userId");

-- CreateIndex
CREATE INDEX "PersonalRecord_baseExerciseId_idx" ON "public"."PersonalRecord"("baseExerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalRecord_userId_baseExerciseId_key" ON "public"."PersonalRecord"("userId", "baseExerciseId");

-- AddForeignKey
ALTER TABLE "public"."PersonalRecord" ADD CONSTRAINT "PersonalRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PersonalRecord" ADD CONSTRAINT "PersonalRecord_baseExerciseId_fkey" FOREIGN KEY ("baseExerciseId") REFERENCES "public"."BaseExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
