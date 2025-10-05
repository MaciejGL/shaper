-- AlterTable
ALTER TABLE "public"."CoachingRequest" ADD COLUMN     "interestedServices" TEXT[] DEFAULT ARRAY[]::TEXT[];
