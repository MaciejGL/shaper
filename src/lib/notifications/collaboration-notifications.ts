import { GQLNotificationType } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { createNotification } from '@/server/models/notification/factory'
import { GQLContext } from '@/types/gql-context'

/**
 * Helper function to get user display name
 */
function getUserDisplayName(user: { name?: string | null; email: string }) {
  return user.name || user.email
}

/**
 * Send collaboration invitation notification
 */
export async function sendCollaborationInvitationNotification(
  senderId: string,
  recipientId: string,
  invitationId: string,
  context: GQLContext,
) {
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { name: true, email: true },
  })

  if (!sender) {
    throw new Error('Sender not found')
  }

  const senderName = getUserDisplayName(sender)

  await createNotification(
    {
      userId: recipientId,
      createdBy: senderId,
      type: GQLNotificationType.CollaborationInvitation,
      message: `${senderName} sent you a collaboration invitation`,
      relatedItemId: invitationId,
      link: `/collaboration/invitations`,
    },
    context,
  )
}

/**
 * Send collaboration response notification
 */
export async function sendCollaborationResponseNotification(
  responderId: string,
  senderId: string,
  invitationId: string,
  action: 'ACCEPT' | 'REJECT',
  context: GQLContext,
) {
  const responder = await prisma.user.findUnique({
    where: { id: responderId },
    select: { name: true, email: true },
  })

  if (!responder) {
    throw new Error('Responder not found')
  }

  const responderName = getUserDisplayName(responder)
  const actionText = action === 'ACCEPT' ? 'accepted' : 'rejected'

  await createNotification(
    {
      userId: senderId,
      createdBy: responderId,
      type: GQLNotificationType.CollaborationResponse,
      message: `${responderName} ${actionText} your collaboration invitation`,
      relatedItemId: invitationId,
      link: `/collaboration/invitations`,
    },
    context,
  )
}

/**
 * Send training plan collaboration notification
 */
export async function sendTrainingPlanCollaborationNotification(
  addedById: string,
  collaboratorId: string,
  planId: string,
  planTitle: string,
  permission: string,
  context: GQLContext,
) {
  const addedBy = await prisma.user.findUnique({
    where: { id: addedById },
    select: { name: true, email: true },
  })

  if (!addedBy) {
    throw new Error('User who added collaborator not found')
  }

  const addedByName = getUserDisplayName(addedBy)

  await createNotification(
    {
      userId: collaboratorId,
      createdBy: addedById,
      type: GQLNotificationType.TrainingPlanCollaboration,
      message: `${addedByName} gave you ${permission.toLowerCase()} access to training plan "${planTitle}"`,
      relatedItemId: planId,
      link: `/trainer/trainings/${planId}`,
    },
    context,
  )
}

/**
 * Send training plan collaboration removed notification
 */
export async function sendTrainingPlanCollaborationRemovedNotification(
  removedById: string,
  collaboratorId: string,
  planId: string,
  planTitle: string,
  context: GQLContext,
) {
  const removedBy = await prisma.user.findUnique({
    where: { id: removedById },
    select: { name: true, email: true },
  })

  if (!removedBy) {
    throw new Error('User who removed collaborator not found')
  }

  const removedByName = getUserDisplayName(removedBy)

  await createNotification(
    {
      userId: collaboratorId,
      createdBy: removedById,
      type: GQLNotificationType.TrainingPlanCollaborationRemoved,
      message: `${removedByName} removed your access to training plan "${planTitle}"`,
      relatedItemId: planId,
      link: `/trainer/trainings`,
    },
    context,
  )
}

/**
 * Send meal plan collaboration notification
 */
export async function sendMealPlanCollaborationNotification(
  addedById: string,
  collaboratorId: string,
  planId: string,
  planTitle: string,
  permission: string,
  context: GQLContext,
) {
  const addedBy = await prisma.user.findUnique({
    where: { id: addedById },
    select: { name: true, email: true },
  })

  if (!addedBy) {
    throw new Error('User who added collaborator not found')
  }

  const addedByName = getUserDisplayName(addedBy)

  await createNotification(
    {
      userId: collaboratorId,
      createdBy: addedById,
      type: GQLNotificationType.MealPlanCollaboration,
      message: `${addedByName} gave you ${permission.toLowerCase()} access to meal plan "${planTitle}"`,
      relatedItemId: planId,
      link: `/trainer/meal-plans/${planId}`,
    },
    context,
  )
}

/**
 * Send meal plan collaboration removed notification
 */
export async function sendMealPlanCollaborationRemovedNotification(
  removedById: string,
  collaboratorId: string,
  planId: string,
  planTitle: string,
  context: GQLContext,
) {
  const removedBy = await prisma.user.findUnique({
    where: { id: removedById },
    select: { name: true, email: true },
  })

  if (!removedBy) {
    throw new Error('User who removed collaborator not found')
  }

  const removedByName = getUserDisplayName(removedBy)

  await createNotification(
    {
      userId: collaboratorId,
      createdBy: removedById,
      type: GQLNotificationType.MealPlanCollaborationRemoved,
      message: `${removedByName} removed your access to meal plan "${planTitle}"`,
      relatedItemId: planId,
      link: `/trainer/meal-plans`,
    },
    context,
  )
}

/**
 * Send training plan collaboration permission updated notification
 */
export async function sendTrainingPlanCollaborationPermissionUpdatedNotification(
  updatedById: string,
  collaboratorId: string,
  planId: string,
  planTitle: string,
  newPermission: string,
  context: GQLContext,
) {
  const updatedBy = await prisma.user.findUnique({
    where: { id: updatedById },
    select: { name: true, email: true },
  })

  if (!updatedBy) {
    throw new Error('User who updated permission not found')
  }

  const updatedByName = getUserDisplayName(updatedBy)

  await createNotification(
    {
      userId: collaboratorId,
      createdBy: updatedById,
      type: GQLNotificationType.TrainingPlanCollaboration,
      message: `${updatedByName} updated your collaboration permission to ${newPermission.toLowerCase()} for training plan "${planTitle}"`,
      relatedItemId: planId,
      link: `/trainer/trainings/${planId}`,
    },
    context,
  )
}

/**
 * Send meal plan collaboration permission updated notification
 */
export async function sendMealPlanCollaborationPermissionUpdatedNotification(
  updatedById: string,
  collaboratorId: string,
  planId: string,
  planTitle: string,
  newPermission: string,
  context: GQLContext,
) {
  const updatedBy = await prisma.user.findUnique({
    where: { id: updatedById },
    select: { name: true, email: true },
  })

  if (!updatedBy) {
    throw new Error('User who updated permission not found')
  }

  const updatedByName = getUserDisplayName(updatedBy)

  await createNotification(
    {
      userId: collaboratorId,
      createdBy: updatedById,
      type: GQLNotificationType.MealPlanCollaboration,
      message: `${updatedByName} updated your collaboration permission to ${newPermission.toLowerCase()} for meal plan "${planTitle}"`,
      relatedItemId: planId,
      link: `/trainer/meal-plans/${planId}`,
    },
    context,
  )
}
