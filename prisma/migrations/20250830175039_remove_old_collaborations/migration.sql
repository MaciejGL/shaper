/*
  Warnings:

  - You are about to drop the column `collaborationNotifications` on the `UserProfile` table. All the data in the column will be lost.
  - You are about to drop the `CollaborationInvitation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MealPlanCollaborator` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TrainingPlanCollaborator` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."CollaborationInvitation" DROP CONSTRAINT "CollaborationInvitation_recipientId_fkey";

-- DropForeignKey
ALTER TABLE "public"."CollaborationInvitation" DROP CONSTRAINT "CollaborationInvitation_senderId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MealPlanCollaborator" DROP CONSTRAINT "MealPlanCollaborator_addedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."MealPlanCollaborator" DROP CONSTRAINT "MealPlanCollaborator_collaboratorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."MealPlanCollaborator" DROP CONSTRAINT "MealPlanCollaborator_mealPlanId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrainingPlanCollaborator" DROP CONSTRAINT "TrainingPlanCollaborator_addedById_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrainingPlanCollaborator" DROP CONSTRAINT "TrainingPlanCollaborator_collaboratorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."TrainingPlanCollaborator" DROP CONSTRAINT "TrainingPlanCollaborator_trainingPlanId_fkey";

-- AlterTable
ALTER TABLE "public"."UserProfile" DROP COLUMN "collaborationNotifications";

-- DropTable
DROP TABLE "public"."CollaborationInvitation";

-- DropTable
DROP TABLE "public"."MealPlanCollaborator";

-- DropTable
DROP TABLE "public"."TrainingPlanCollaborator";
