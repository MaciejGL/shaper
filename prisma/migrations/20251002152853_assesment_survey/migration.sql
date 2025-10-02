-- CreateTable
CREATE TABLE "public"."ClientSurvey" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClientSurvey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClientSurvey_userId_key" ON "public"."ClientSurvey"("userId");

-- CreateIndex
CREATE INDEX "ClientSurvey_userId_idx" ON "public"."ClientSurvey"("userId");

-- CreateIndex
CREATE INDEX "ClientSurvey_updatedAt_idx" ON "public"."ClientSurvey"("updatedAt");

-- AddForeignKey
ALTER TABLE "public"."ClientSurvey" ADD CONSTRAINT "ClientSurvey_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
