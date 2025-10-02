import {
  GQLCreateMeetingInput,
  GQLUpdateMeetingInput,
} from '@/generated/graphql-server'
import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

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

  // Validate service task link if provided
  if (input.serviceTaskId) {
    const serviceTask = await prisma.serviceTask.findFirst({
      where: {
        id: input.serviceTaskId,
        serviceDelivery: {
          trainerId: currentUserId,
          clientId: input.traineeId,
        },
      },
    })

    if (!serviceTask) {
      throw new Error('Service task not found or access denied')
    }
  }

  const meeting = await prisma.meeting.create({
    data: {
      coachId: currentUserId,
      traineeId: input.traineeId,
      type: input.type,
      status: 'PENDING',
      scheduledAt: new Date(input.scheduledAt),
      duration: input.duration,
      timezone: input.timezone,
      locationType: input.locationType,
      address: input.address || null,
      meetingLink: input.meetingLink || null,
      title: input.title,
      description: input.description || null,
      serviceDeliveryId: input.serviceDeliveryId || null,
      serviceTaskId: input.serviceTaskId || null,
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

  // Coach can update all fields
  if (existingMeeting.coachId === currentUserId) {
    if (input.type) updateData.type = input.type
    if (input.status) updateData.status = input.status
    if (input.scheduledAt) updateData.scheduledAt = new Date(input.scheduledAt)
    if (input.duration) updateData.duration = input.duration
    if (input.timezone) updateData.timezone = input.timezone
    if (input.locationType) updateData.locationType = input.locationType
    if (input.address !== undefined) updateData.address = input.address
    if (input.meetingLink !== undefined)
      updateData.meetingLink = input.meetingLink
    if (input.title) updateData.title = input.title
    if (input.description !== undefined)
      updateData.description = input.description
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

  const meetings = await prisma.meeting.findMany({
    where: {
      OR: [{ coachId: currentUserId }, { traineeId: currentUserId }],
      scheduledAt: {
        gte: now, // Only future meetings
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
