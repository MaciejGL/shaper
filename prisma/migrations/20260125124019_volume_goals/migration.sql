-- CreateTable
CREATE TABLE "VolumeGoalPeriod" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "presetId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "VolumeGoalPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VolumeGoalPeriod_userId_idx" ON "VolumeGoalPeriod"("userId");

-- CreateIndex
CREATE INDEX "VolumeGoalPeriod_userId_endedAt_idx" ON "VolumeGoalPeriod"("userId", "endedAt");

-- AddForeignKey
ALTER TABLE "VolumeGoalPeriod" ADD CONSTRAINT "VolumeGoalPeriod_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
