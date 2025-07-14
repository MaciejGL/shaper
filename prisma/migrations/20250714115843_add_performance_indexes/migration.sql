-- CreateIndex
CREATE INDEX "TrainingDay_weekId_idx" ON "TrainingDay"("weekId");

-- CreateIndex
CREATE INDEX "TrainingDay_weekId_dayOfWeek_idx" ON "TrainingDay"("weekId", "dayOfWeek");

-- CreateIndex
CREATE INDEX "TrainingPlan_assignedToId_idx" ON "TrainingPlan"("assignedToId");

-- CreateIndex
CREATE INDEX "TrainingPlan_assignedToId_active_idx" ON "TrainingPlan"("assignedToId", "active");

-- CreateIndex
CREATE INDEX "TrainingPlan_assignedToId_createdById_idx" ON "TrainingPlan"("assignedToId", "createdById");

-- CreateIndex
CREATE INDEX "TrainingPlan_createdById_idx" ON "TrainingPlan"("createdById");

-- CreateIndex
CREATE INDEX "TrainingPlan_active_idx" ON "TrainingPlan"("active");

-- CreateIndex
CREATE INDEX "TrainingWeek_planId_idx" ON "TrainingWeek"("planId");

-- CreateIndex
CREATE INDEX "TrainingWeek_planId_weekNumber_idx" ON "TrainingWeek"("planId", "weekNumber");
