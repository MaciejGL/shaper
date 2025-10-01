-- CreateTable
CREATE TABLE "public"."CheckinSchedule" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "dayOfWeek" INTEGER,
    "dayOfMonth" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CheckinSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CheckinCompletion" (
    "id" TEXT NOT NULL,
    "scheduleId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "measurementId" TEXT,
    "progressLogId" TEXT,

    CONSTRAINT "CheckinCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CheckinSchedule_userProfileId_key" ON "public"."CheckinSchedule"("userProfileId");

-- CreateIndex
CREATE INDEX "CheckinSchedule_userProfileId_idx" ON "public"."CheckinSchedule"("userProfileId");

-- CreateIndex
CREATE INDEX "CheckinSchedule_isActive_idx" ON "public"."CheckinSchedule"("isActive");

-- CreateIndex
CREATE INDEX "CheckinCompletion_scheduleId_idx" ON "public"."CheckinCompletion"("scheduleId");

-- CreateIndex
CREATE INDEX "CheckinCompletion_completedAt_idx" ON "public"."CheckinCompletion"("completedAt");

-- AddForeignKey
ALTER TABLE "public"."CheckinSchedule" ADD CONSTRAINT "CheckinSchedule_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckinCompletion" ADD CONSTRAINT "CheckinCompletion_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "public"."CheckinSchedule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckinCompletion" ADD CONSTRAINT "CheckinCompletion_measurementId_fkey" FOREIGN KEY ("measurementId") REFERENCES "public"."UserBodyMeasure"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CheckinCompletion" ADD CONSTRAINT "CheckinCompletion_progressLogId_fkey" FOREIGN KEY ("progressLogId") REFERENCES "public"."BodyProgressLog"("id") ON DELETE SET NULL ON UPDATE CASCADE;
