-- AlterTable
ALTER TABLE "UserProfile" ADD COLUMN     "collaborationNotifications" BOOLEAN DEFAULT true,
ADD COLUMN     "emailNotifications" BOOLEAN DEFAULT true,
ADD COLUMN     "heightUnit" TEXT DEFAULT 'cm',
ADD COLUMN     "mealReminders" BOOLEAN DEFAULT true,
ADD COLUMN     "progressUpdates" BOOLEAN DEFAULT true,
ADD COLUMN     "pushNotifications" BOOLEAN DEFAULT false,
ADD COLUMN     "systemNotifications" BOOLEAN DEFAULT true,
ADD COLUMN     "theme" TEXT DEFAULT 'system',
ADD COLUMN     "timeFormat" TEXT DEFAULT '24h',
ADD COLUMN     "weightUnit" TEXT DEFAULT 'kg',
ADD COLUMN     "workoutReminders" BOOLEAN DEFAULT true;
