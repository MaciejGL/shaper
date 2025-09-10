-- CreateTable
CREATE TABLE "public"."BodyProgressLog" (
    "id" TEXT NOT NULL,
    "userProfileId" TEXT NOT NULL,
    "loggedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "image1Url" TEXT,
    "image2Url" TEXT,
    "image3Url" TEXT,
    "shareWithTrainer" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BodyProgressLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BodyProgressLog_userProfileId_idx" ON "public"."BodyProgressLog"("userProfileId");

-- CreateIndex
CREATE INDEX "BodyProgressLog_userProfileId_loggedAt_idx" ON "public"."BodyProgressLog"("userProfileId", "loggedAt");

-- AddForeignKey
ALTER TABLE "public"."BodyProgressLog" ADD CONSTRAINT "BodyProgressLog_userProfileId_fkey" FOREIGN KEY ("userProfileId") REFERENCES "public"."UserProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
