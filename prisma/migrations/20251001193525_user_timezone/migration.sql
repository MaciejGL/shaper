-- AlterTable
ALTER TABLE "public"."UserProfile" ADD COLUMN     "checkinReminders" BOOLEAN DEFAULT true,
ADD COLUMN     "timezone" TEXT DEFAULT 'UTC';
