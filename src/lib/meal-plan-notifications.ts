import { GQLNotificationType } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { sendPushForNotification } from '@/lib/notifications/push-integration'
import { createNotification } from '@/server/models/notification/factory'
import { GQLContext } from '@/types/gql-context'

/**
 * Send comprehensive notifications when a nutrition plan is shared with a client
 */
export async function notifyNutritionPlanShared(
  nutritionPlanId: string,
  trainerId: string,
  context: GQLContext,
): Promise<void> {
  try {
    // Get the nutrition plan details
    const nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: { id: nutritionPlanId },
      include: {
        trainer: {
          include: {
            profile: true,
          },
        },
        client: {
          include: {
            profile: true,
          },
        },
      },
    })

    if (!nutritionPlan) {
      throw new Error('Nutrition plan not found')
    }

    const trainerName =
      nutritionPlan.trainer.profile?.firstName &&
      nutritionPlan.trainer.profile?.lastName
        ? `${nutritionPlan.trainer.profile.firstName} ${nutritionPlan.trainer.profile.lastName}`
        : nutritionPlan.trainer.name || 'Your trainer'

    const planTitle = nutritionPlan.name
    const clientId = nutritionPlan.clientId

    // Create in-app notification
    await createNotification(
      {
        userId: clientId,
        createdBy: trainerId,
        message: `"${planTitle}" nutrition plan has been shared with you by ${trainerName}`,
        type: GQLNotificationType.NewMealPlanAssigned,
        link: '/fitspace/nutrition-plans',
        relatedItemId: nutritionPlanId,
      },
      context,
    )

    // Send push notification
    await sendPushForNotification(
      clientId,
      GQLNotificationType.NewMealPlanAssigned,
      `"${planTitle}" nutrition plan has been shared with you by ${trainerName}`,
      '/fitspace/nutrition-plans',
      {
        planTitle,
        senderName: trainerName,
      },
    )

    console.info(`✅ Nutrition plan notification sent to client ${clientId}`)
  } catch (error) {
    console.error('❌ Failed to send nutrition plan notification:', error)
    // Don't throw error to avoid breaking the main flow
  }
}

/**
 * Send notifications when a nutrition plan is updated
 */
export async function notifyNutritionPlanUpdated(
  nutritionPlanId: string,
  trainerId: string,
  context: GQLContext,
): Promise<void> {
  try {
    // Get the nutrition plan details
    const nutritionPlan = await prisma.nutritionPlan.findUnique({
      where: { id: nutritionPlanId },
      include: {
        trainer: {
          include: {
            profile: true,
          },
        },
        client: {
          include: {
            profile: true,
          },
        },
      },
    })

    if (!nutritionPlan || !nutritionPlan.isSharedWithClient) {
      return // Only notify if plan is shared
    }

    const trainerName =
      nutritionPlan.trainer.profile?.firstName &&
      nutritionPlan.trainer.profile?.lastName
        ? `${nutritionPlan.trainer.profile.firstName} ${nutritionPlan.trainer.profile.lastName}`
        : nutritionPlan.trainer.name || 'Your trainer'

    const planTitle = nutritionPlan.name
    const clientId = nutritionPlan.clientId

    // Create in-app notification
    await createNotification(
      {
        userId: clientId,
        createdBy: trainerId,
        message: `Your nutrition plan "${planTitle}" has been updated by ${trainerName}`,
        type: GQLNotificationType.System,
        link: '/fitspace/nutrition-plans',
        relatedItemId: nutritionPlanId,
      },
      context,
    )

    // Send push notification
    await sendPushForNotification(
      clientId,
      GQLNotificationType.System,
      `Your nutrition plan "${planTitle}" has been updated by ${trainerName}`,
      '/fitspace/nutrition-plans',
      {
        planTitle,
        senderName: trainerName,
      },
    )

    console.info(
      `✅ Nutrition plan update notification sent to client ${clientId}`,
    )
  } catch (error) {
    console.error(
      '❌ Failed to send nutrition plan update notification:',
      error,
    )
    // Don't throw error to avoid breaking the main flow
  }
}
