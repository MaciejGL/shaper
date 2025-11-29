-- CreateIndex
CREATE INDEX "UserSubscription_userId_status_endDate_idx" ON "UserSubscription"("userId", "status", "endDate");
