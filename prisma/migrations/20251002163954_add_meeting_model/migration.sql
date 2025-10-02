-- CreateEnum
CREATE TYPE "public"."MeetingType" AS ENUM ('INITIAL_CONSULTATION', 'IN_PERSON_TRAINING', 'CHECK_IN', 'PLAN_REVIEW');

-- CreateEnum
CREATE TYPE "public"."MeetingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'RESCHEDULED');

-- CreateEnum
CREATE TYPE "public"."LocationType" AS ENUM ('VIRTUAL', 'COACH_LOCATION', 'TRAINEE_LOCATION', 'OTHER');

-- CreateTable
CREATE TABLE "public"."Meeting" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "traineeId" TEXT NOT NULL,
    "type" "public"."MeetingType" NOT NULL,
    "status" "public"."MeetingStatus" NOT NULL DEFAULT 'PENDING',
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "duration" INTEGER NOT NULL,
    "timezone" TEXT NOT NULL,
    "locationType" "public"."LocationType" NOT NULL,
    "address" TEXT,
    "meetingLink" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "notes" TEXT,
    "serviceDeliveryId" TEXT,
    "serviceTaskId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Meeting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Meeting_coachId_scheduledAt_idx" ON "public"."Meeting"("coachId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Meeting_traineeId_scheduledAt_idx" ON "public"."Meeting"("traineeId", "scheduledAt");

-- CreateIndex
CREATE INDEX "Meeting_status_idx" ON "public"."Meeting"("status");

-- CreateIndex
CREATE INDEX "Meeting_serviceDeliveryId_idx" ON "public"."Meeting"("serviceDeliveryId");

-- CreateIndex
CREATE INDEX "Meeting_serviceTaskId_idx" ON "public"."Meeting"("serviceTaskId");

-- AddForeignKey
ALTER TABLE "public"."Meeting" ADD CONSTRAINT "Meeting_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meeting" ADD CONSTRAINT "Meeting_traineeId_fkey" FOREIGN KEY ("traineeId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meeting" ADD CONSTRAINT "Meeting_serviceDeliveryId_fkey" FOREIGN KEY ("serviceDeliveryId") REFERENCES "public"."ServiceDelivery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Meeting" ADD CONSTRAINT "Meeting_serviceTaskId_fkey" FOREIGN KEY ("serviceTaskId") REFERENCES "public"."ServiceTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
