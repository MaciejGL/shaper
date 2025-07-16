-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "timezone" TEXT DEFAULT 'UTC',
ADD COLUMN     "weekStartsOn" INTEGER DEFAULT 1;
