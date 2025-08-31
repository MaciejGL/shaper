import { GQLNotificationType } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { sendPushForNotification } from '@/lib/notifications/push-integration'

import { getBaseUrl } from './get-base-url'

interface TeamInvitationNotificationParams {
  invitedEmail: string
  inviterName: string
  invitedById: string
  teamName: string
  locations: string[]
  invitationId: string
}

/**
 * Sends all notifications for team invitations (email, in-app, push)
 */
export async function sendTeamInvitationNotifications({
  invitedEmail,
  inviterName,
  invitedById,
  teamName,
  locations,
  invitationId,
}: TeamInvitationNotificationParams): Promise<void> {
  try {
    // Find the invited user by email
    const invitedUser = await prisma.user.findUnique({
      where: { email: invitedEmail },
      include: { profile: true },
    })

    const baseUrl = getBaseUrl()

    // Generate invitation URL (assuming teams are viewed at this path)
    const invitationUrl = invitedUser
      ? `${baseUrl}/trainer/teams?invitation=${invitationId}`
      : `${baseUrl}/login?redirect=/trainer/teams&invitation=${invitationId}`

    // Send email notification (always sent, regardless of user registration)
    const invitedUserName = invitedUser?.profile
      ? `${invitedUser.profile.firstName} ${invitedUser.profile.lastName}`.trim() ||
        invitedUser.name
      : null

    await sendEmail.teamInvitation(invitedEmail, {
      invitedUserName,
      inviterName,
      teamName,
      locations,
      invitationUrl,
    })

    // Create in-app notification and send push notification for registered users
    if (invitedUser) {
      // Create in-app notification
      await prisma.notification.create({
        data: {
          userId: invitedUser.id,
          createdBy: invitedById,
          message: `${inviterName} invited you to join the ${teamName} team`,
          type: 'TEAM_INVITATION',
          link: `/fitspace/teams?invitation=${invitationId}`,
          relatedItemId: invitationId,
        },
      })

      // Send push notification
      await sendPushForNotification(
        invitedUser.id,
        GQLNotificationType.TeamInvitation,
        `${inviterName} invited you to join the ${teamName} team`,
        `/fitspace/teams?invitation=${invitationId}`,
        {
          senderName: inviterName,
          teamName,
        },
      )
    }
  } catch (error) {
    // Log notification errors but don't fail the invitation creation
    console.error('Failed to send team invitation notifications:', error)
  }
}
