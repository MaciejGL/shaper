-- CreateTable
CREATE TABLE "MobilePushToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "expoPushToken" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "deviceInfo" TEXT,
    "pushNotificationsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MobilePushToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MobilePushToken_expoPushToken_key" ON "MobilePushToken"("expoPushToken");

-- CreateIndex
CREATE INDEX "MobilePushToken_userId_idx" ON "MobilePushToken"("userId");

-- CreateIndex
CREATE INDEX "MobilePushToken_expoPushToken_idx" ON "MobilePushToken"("expoPushToken");

-- CreateIndex
CREATE INDEX "MobilePushToken_pushNotificationsEnabled_idx" ON "MobilePushToken"("pushNotificationsEnabled");

-- AddForeignKey
ALTER TABLE "MobilePushToken" ADD CONSTRAINT "MobilePushToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
