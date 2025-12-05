import { format } from 'date-fns'

import {
  GQLCreateMeetingInput,
  GQLNotificationType,
  GQLUpdateMeetingInput,
} from '@/generated/graphql-server'
import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import {
  notifyMeetingScheduled,
  notifyMeetingUpdated,
} from '@/lib/notifications/push-notification-service'
import { GQLContext } from '@/types/gql-context'

import { createNotification } from '../notification/factory'
import { completeTaskByAction } from '../service-task/factory'

import Meeting from './model'

export async function createMeeting(
  input: GQLCreateMeetingInput,
  context: GQLContext,
): Promise<Meeting> {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Verify trainer-client relationship
  const trainee = await prisma.user.findUnique({
    where: {
      id: input.traineeId,
      trainerId: currentUserId,
    },
  })

  if (!trainee) {
    throw new Error('No trainer-client relationship exists or access denied')
  }

  // Validate service delivery link if provided
  if (input.serviceDeliveryId) {
    const serviceDelivery = await prisma.serviceDelivery.findFirst({
      where: {
        id: input.serviceDeliveryId,
        trainerId: currentUserId,
        clientId: input.traineeId,
      },
    })

    if (!serviceDelivery) {
      throw new Error('Service delivery not found or access denied')
    }
  }

  const scheduledAt = new Date(input.scheduledAt)

  const meeting = await prisma.meeting.create({
    data: {
      coachId: currentUserId,
      traineeId: input.traineeId,
      type: input.type,
      status: 'PENDING',
      scheduledAt,
      duration: input.duration,
      timezone: input.timezone,
      locationType: input.locationType,
      virtualMethod: input.virtualMethod || null,
      address: input.address || null,
      meetingLink: input.meetingLink || null,
      title: input.title,
      description: input.description || null,
      serviceDeliveryId: input.serviceDeliveryId || null,
    },
    include: {
      coach: {
        include: {
          profile: true,
        },
      },
      trainee: {
        include: {
          profile: true,
        },
      },
      serviceDelivery: {
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
      },
      serviceTask: true,
    },
  })

  // Get trainer name for notification
  const trainerName = meeting.coach?.profile?.firstName
    ? `${meeting.coach.profile.firstName}${meeting.coach.profile.lastName ? ` ${meeting.coach.profile.lastName}` : ''}`
    : 'Your trainer'

  // Create in-app notification for trainee
  await createNotification(
    {
      userId: input.traineeId,
      createdBy: currentUserId,
      message: `${trainerName} scheduled a meeting: ${input.title}`,
      type: GQLNotificationType.MeetingScheduled,
      link: '/fitspace/my-trainer',
      relatedItemId: meeting.id,
    },
    context,
  )

  // Send push notification for meeting scheduled
  const shortDate = format(scheduledAt, 'MMM d, h:mm a')
  await notifyMeetingScheduled(
    input.traineeId,
    input.title,
    shortDate,
    trainerName,
  )

  return new Meeting(meeting, context)
}

export async function updateMeeting(
  meetingId: string,
  input: GQLUpdateMeetingInput,
  context: GQLContext,
): Promise<Meeting> {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Verify user has access to this meeting
  const existingMeeting = await prisma.meeting.findFirst({
    where: {
      id: meetingId,
      OR: [
        { coachId: currentUserId }, // Coach can update
        { traineeId: currentUserId }, // Trainee can update (limited fields)
      ],
    },
  })

  if (!existingMeeting) {
    throw new Error('Meeting not found or access denied')
  }

  const updateData: Prisma.MeetingUpdateInput = {}
  const changedFields: string[] = []

  // Coach can update all fields
  const isCoachUpdate = existingMeeting.coachId === currentUserId
  if (isCoachUpdate) {
    if (input.type && input.type !== existingMeeting.type) {
      updateData.type = input.type
      changedFields.push('meeting type')
    }
    if (input.status && input.status !== existingMeeting.status) {
      updateData.status = input.status
    }
    if (input.scheduledAt) {
      const newDate = new Date(input.scheduledAt)
      if (newDate.getTime() !== existingMeeting.scheduledAt.getTime()) {
        updateData.scheduledAt = newDate
        changedFields.push('date/time')
      }
    }
    if (input.duration && input.duration !== existingMeeting.duration) {
      updateData.duration = input.duration
      changedFields.push('duration')
    }
    if (input.timezone) updateData.timezone = input.timezone
    if (
      input.locationType &&
      input.locationType !== existingMeeting.locationType
    ) {
      updateData.locationType = input.locationType
      changedFields.push('location type')
    }
    if (
      input.virtualMethod !== undefined &&
      input.virtualMethod !== existingMeeting.virtualMethod
    ) {
      updateData.virtualMethod = input.virtualMethod
      changedFields.push('virtual method')
    }
    if (
      input.address !== undefined &&
      input.address !== existingMeeting.address
    ) {
      updateData.address = input.address
      changedFields.push('address')
    }
    if (
      input.meetingLink !== undefined &&
      input.meetingLink !== existingMeeting.meetingLink
    ) {
      updateData.meetingLink = input.meetingLink
      changedFields.push('meeting link')
    }
    if (input.title && input.title !== existingMeeting.title) {
      updateData.title = input.title
      changedFields.push('title')
    }
    if (
      input.description !== undefined &&
      input.description !== existingMeeting.description
    ) {
      updateData.description = input.description
      changedFields.push('description')
    }
    if (input.notes !== undefined) updateData.notes = input.notes
  } else {
    // Trainee can only update limited fields (status confirmation, etc.)
    if (input.status === 'CONFIRMED' && existingMeeting.status === 'PENDING') {
      updateData.status = 'CONFIRMED'
    }
    if (input.notes) updateData.notes = input.notes
  }

  const meeting = await prisma.meeting.update({
    where: { id: meetingId },
    data: updateData,
    include: {
      coach: {
        include: {
          profile: true,
        },
      },
      trainee: {
        include: {
          profile: true,
        },
      },
      serviceDelivery: {
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
      },
      serviceTask: true,
    },
  })

  // Send notification to trainee if coach made significant changes
  if (isCoachUpdate && changedFields.length > 0) {
    // Get trainer name for notification
    const trainerName = meeting.coach?.profile?.firstName
      ? `${meeting.coach.profile.firstName}${meeting.coach.profile.lastName ? ` ${meeting.coach.profile.lastName}` : ''}`
      : 'Your trainer'

    const changesList = changedFields.join(', ')

    // Create in-app notification for trainee
    await createNotification(
      {
        userId: existingMeeting.traineeId,
        createdBy: currentUserId,
        message: `${trainerName} updated meeting "${meeting.title}": ${changesList}`,
        type: GQLNotificationType.MeetingUpdated,
        link: '/fitspace/my-trainer',
        relatedItemId: meeting.id,
      },
      context,
    )

    // Send push notification
    const shortDate = format(meeting.scheduledAt, 'MMM d, h:mm a')
    await notifyMeetingUpdated(
      existingMeeting.traineeId,
      meeting.title,
      changesList,
      shortDate,
      trainerName,
    )
  }

  // Auto-complete meeting task when status changes to COMPLETED
  if (
    input.status === 'COMPLETED' &&
    existingMeeting.status !== 'COMPLETED' &&
    isCoachUpdate
  ) {
    try {
      // Determine task type based on meeting type
      const action =
        meeting.type === 'CHECK_IN'
          ? 'meeting_checkin_completed'
          : meeting.type === 'IN_PERSON_TRAINING'
            ? 'meeting_in_person_completed'
            : null

      if (action) {
        await completeTaskByAction({
          trainerId: existingMeeting.coachId,
          clientId: existingMeeting.traineeId,
          action,
          relatedItemId: meetingId,
        })
      }
    } catch (error) {
      console.error('Error auto-completing meeting task:', error)
    }
  }

  return new Meeting(meeting, context)
}

export async function confirmMeeting(
  meetingId: string,
  context: GQLContext,
): Promise<Meeting> {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  const meeting = await prisma.meeting.updateMany({
    where: {
      id: meetingId,
      traineeId: currentUserId,
      status: 'PENDING',
    },
    data: {
      status: 'CONFIRMED',
    },
  })

  if (meeting.count === 0) {
    throw new Error('Meeting not found, access denied, or already confirmed')
  }

  // Return updated meeting
  const updatedMeeting = await prisma.meeting.findUnique({
    where: { id: meetingId },
    include: {
      coach: {
        include: {
          profile: true,
        },
      },
      trainee: {
        include: {
          profile: true,
        },
      },
      serviceDelivery: {
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
      },
      serviceTask: true,
    },
  })

  if (!updatedMeeting) {
    throw new Error('Meeting not found after update')
  }

  return new Meeting(updatedMeeting, context)
}

export async function cancelMeeting(
  meetingId: string,
  reason: string | null,
  context: GQLContext,
): Promise<Meeting> {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  const existingMeeting = await prisma.meeting.findFirst({
    where: {
      id: meetingId,
      OR: [{ coachId: currentUserId }, { traineeId: currentUserId }],
    },
  })

  if (!existingMeeting) {
    throw new Error('Meeting not found or access denied')
  }

  const meeting = await prisma.meeting.update({
    where: { id: meetingId },
    data: {
      status: 'CANCELLED',
      notes: reason
        ? `${existingMeeting.notes || ''}\n\nCancelled: ${reason}`.trim()
        : existingMeeting.notes,
    },
    include: {
      coach: {
        include: {
          profile: true,
        },
      },
      trainee: {
        include: {
          profile: true,
        },
      },
      serviceDelivery: {
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
      },
    },
  })

  return new Meeting(meeting, context)
}

export async function myUpcomingMeetings(
  context: GQLContext,
): Promise<Meeting[]> {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  const now = new Date()
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  )

  const meetings = await prisma.meeting.findMany({
    where: {
      OR: [{ coachId: currentUserId }, { traineeId: currentUserId }],
      scheduledAt: {
        gte: startOfToday, // Show meetings from start of today
      },
      status: {
        in: ['PENDING', 'CONFIRMED'], // Exclude completed/cancelled
      },
    },
    include: {
      coach: {
        include: {
          profile: true,
        },
      },
      trainee: {
        include: {
          profile: true,
        },
      },
      serviceDelivery: {
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
      },
      serviceTask: true,
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  })

  return meetings.map((meeting) => new Meeting(meeting, context))
}

export async function getTraineeMeetings(
  args: { traineeId: string },
  context: GQLContext,
): Promise<Meeting[]> {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Verify trainer-client relationship
  const trainee = await prisma.user.findUnique({
    where: {
      id: args.traineeId,
      trainerId: currentUserId,
    },
  })

  if (!trainee) {
    throw new Error('No trainer-client relationship exists or access denied')
  }

  const meetings = await prisma.meeting.findMany({
    where: {
      coachId: currentUserId,
      traineeId: args.traineeId,
    },
    include: {
      coach: {
        include: {
          profile: true,
        },
      },
      trainee: {
        include: {
          profile: true,
        },
      },
      serviceDelivery: {
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
      },
      serviceTask: true,
    },
    orderBy: {
      scheduledAt: 'desc',
    },
  })

  return meetings.map((meeting) => new Meeting(meeting, context))
}

export async function getServiceDeliveryMeetings(
  args: { serviceDeliveryId: string },
  context: GQLContext,
): Promise<Meeting[]> {
  const currentUserId = context.user?.user.id
  if (!currentUserId) {
    throw new Error('Authentication required')
  }

  // Verify access to service delivery
  const serviceDelivery = await prisma.serviceDelivery.findFirst({
    where: {
      id: args.serviceDeliveryId,
      OR: [{ trainerId: currentUserId }, { clientId: currentUserId }],
    },
  })

  if (!serviceDelivery) {
    throw new Error('Service delivery not found or access denied')
  }

  const meetings = await prisma.meeting.findMany({
    where: {
      serviceDeliveryId: args.serviceDeliveryId,
    },
    include: {
      coach: {
        include: {
          profile: true,
        },
      },
      trainee: {
        include: {
          profile: true,
        },
      },
      serviceDelivery: {
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
      },
      serviceTask: true,
    },
    orderBy: {
      scheduledAt: 'asc',
    },
  })

  return meetings.map((meeting) => new Meeting(meeting, context))
}
