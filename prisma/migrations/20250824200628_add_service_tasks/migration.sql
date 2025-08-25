-- CreateTable
CREATE TABLE "public"."ServiceTask" (
    "id" TEXT NOT NULL,
    "serviceDeliveryId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "order" INTEGER NOT NULL DEFAULT 0,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "completedAt" TIMESTAMP(3),
    "notes" TEXT,
    "requiresScheduling" BOOLEAN NOT NULL DEFAULT false,
    "scheduledAt" TIMESTAMP(3),
    "estimatedDuration" INTEGER,
    "isRecurring" BOOLEAN NOT NULL DEFAULT false,
    "intervalDays" INTEGER,
    "recurrenceCount" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ServiceTask_serviceDeliveryId_idx" ON "public"."ServiceTask"("serviceDeliveryId");

-- CreateIndex
CREATE INDEX "ServiceTask_status_idx" ON "public"."ServiceTask"("status");

-- CreateIndex
CREATE INDEX "ServiceTask_templateId_idx" ON "public"."ServiceTask"("templateId");

-- CreateIndex
CREATE INDEX "ServiceTask_scheduledAt_idx" ON "public"."ServiceTask"("scheduledAt");

-- AddForeignKey
ALTER TABLE "public"."ServiceTask" ADD CONSTRAINT "ServiceTask_serviceDeliveryId_fkey" FOREIGN KEY ("serviceDeliveryId") REFERENCES "public"."ServiceDelivery"("id") ON DELETE CASCADE ON UPDATE CASCADE;
