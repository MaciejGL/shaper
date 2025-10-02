-- CreateTable
CREATE TABLE "public"."ReminderSent" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "reminderType" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReminderSent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReminderSent_entityType_entityId_idx" ON "public"."ReminderSent"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "ReminderSent_userId_idx" ON "public"."ReminderSent"("userId");

-- CreateIndex
CREATE INDEX "ReminderSent_sentAt_idx" ON "public"."ReminderSent"("sentAt");

-- CreateIndex
CREATE UNIQUE INDEX "ReminderSent_entityType_entityId_reminderType_userId_key" ON "public"."ReminderSent"("entityType", "entityId", "reminderType", "userId");

-- CreateIndex
CREATE INDEX "Meeting_scheduledAt_status_idx" ON "public"."Meeting"("scheduledAt", "status");

-- AddForeignKey
ALTER TABLE "public"."ReminderSent" ADD CONSTRAINT "ReminderSent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
