-- CreateTable
CREATE TABLE "public"."UserTermsAgreement" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "offerId" TEXT,
    "agreedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserTermsAgreement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserTermsAgreement_userId_idx" ON "public"."UserTermsAgreement"("userId");

-- CreateIndex
CREATE INDEX "UserTermsAgreement_version_idx" ON "public"."UserTermsAgreement"("version");

-- CreateIndex
CREATE INDEX "UserTermsAgreement_agreedAt_idx" ON "public"."UserTermsAgreement"("agreedAt");

-- AddForeignKey
ALTER TABLE "public"."UserTermsAgreement" ADD CONSTRAINT "UserTermsAgreement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
