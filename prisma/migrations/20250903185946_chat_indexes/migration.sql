-- CreateIndex
CREATE INDEX "Message_chatId_senderId_readAt_idx" ON "public"."Message"("chatId", "senderId", "readAt");

-- CreateIndex
CREATE INDEX "Message_chatId_createdAt_idx" ON "public"."Message"("chatId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "Message_senderId_readAt_idx" ON "public"."Message"("senderId", "readAt");

-- CreateIndex
CREATE INDEX "User_trainerId_role_idx" ON "public"."User"("trainerId", "role");
