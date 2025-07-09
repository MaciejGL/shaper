-- CreateTable
CREATE TABLE "CollaborationInvitation" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "recipientId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CollaborationInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TrainingPlanCollaborator" (
    "id" TEXT NOT NULL,
    "trainingPlanId" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "addedById" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'EDIT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingPlanCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MealPlanCollaborator" (
    "id" TEXT NOT NULL,
    "mealPlanId" TEXT NOT NULL,
    "collaboratorId" TEXT NOT NULL,
    "addedById" TEXT NOT NULL,
    "permission" TEXT NOT NULL DEFAULT 'EDIT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MealPlanCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollaborationInvitation_senderId_idx" ON "CollaborationInvitation"("senderId");

-- CreateIndex
CREATE INDEX "CollaborationInvitation_recipientId_idx" ON "CollaborationInvitation"("recipientId");

-- CreateIndex
CREATE INDEX "CollaborationInvitation_status_idx" ON "CollaborationInvitation"("status");

-- CreateIndex
CREATE UNIQUE INDEX "TrainingPlanCollaborator_trainingPlanId_collaboratorId_key" ON "TrainingPlanCollaborator"("trainingPlanId", "collaboratorId");

-- CreateIndex
CREATE INDEX "TrainingPlanCollaborator_trainingPlanId_idx" ON "TrainingPlanCollaborator"("trainingPlanId");

-- CreateIndex
CREATE INDEX "TrainingPlanCollaborator_collaboratorId_idx" ON "TrainingPlanCollaborator"("collaboratorId");

-- CreateIndex
CREATE UNIQUE INDEX "MealPlanCollaborator_mealPlanId_collaboratorId_key" ON "MealPlanCollaborator"("mealPlanId", "collaboratorId");

-- CreateIndex
CREATE INDEX "MealPlanCollaborator_mealPlanId_idx" ON "MealPlanCollaborator"("mealPlanId");

-- CreateIndex
CREATE INDEX "MealPlanCollaborator_collaboratorId_idx" ON "MealPlanCollaborator"("collaboratorId");

-- AddForeignKey
ALTER TABLE "CollaborationInvitation" ADD CONSTRAINT "CollaborationInvitation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollaborationInvitation" ADD CONSTRAINT "CollaborationInvitation_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlanCollaborator" ADD CONSTRAINT "TrainingPlanCollaborator_trainingPlanId_fkey" FOREIGN KEY ("trainingPlanId") REFERENCES "TrainingPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlanCollaborator" ADD CONSTRAINT "TrainingPlanCollaborator_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingPlanCollaborator" ADD CONSTRAINT "TrainingPlanCollaborator_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanCollaborator" ADD CONSTRAINT "MealPlanCollaborator_mealPlanId_fkey" FOREIGN KEY ("mealPlanId") REFERENCES "MealPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanCollaborator" ADD CONSTRAINT "MealPlanCollaborator_collaboratorId_fkey" FOREIGN KEY ("collaboratorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MealPlanCollaborator" ADD CONSTRAINT "MealPlanCollaborator_addedById_fkey" FOREIGN KEY ("addedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE; 