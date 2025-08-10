-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "credentials" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "specialization" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "successStories" TEXT[] DEFAULT ARRAY[]::TEXT[];
