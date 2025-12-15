-- AlterTable
ALTER TABLE "UserSubscription" ADD COLUMN     "externalOfferToken" TEXT,
ADD COLUMN     "initialStripeInvoiceId" TEXT,
ADD COLUMN     "originPlatform" TEXT;
