-- AlterTable
ALTER TABLE "PackageTemplate" DROP COLUMN "stripePriceId",
ADD COLUMN     "stripeLookupKey" TEXT;

-- AlterTable
ALTER TABLE "UserSubscription" DROP COLUMN "stripePriceId",
ADD COLUMN     "stripeLookupKey" TEXT;

-- CreateIndex
CREATE INDEX "PackageTemplate_stripeLookupKey_idx" ON "PackageTemplate"("stripeLookupKey");

-- DropIndex
DROP INDEX IF EXISTS "PackageTemplate_stripePriceId_idx";

-- DropIndex
DROP INDEX IF EXISTS "UserSubscription_stripePriceId_idx";

