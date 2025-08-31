import { prisma } from '@lib/db'

import {
  GQLMutationResolvers,
  GQLNotificationType,
  GQLQueryResolvers,
  GQLUserRole,
} from '@/generated/graphql-server'
import { Prisma } from '@/generated/prisma/client'
import {
  ensureTrainerClientAccess,
  verifyTrainerClientAccess,
} from '@/lib/access-control'
import {
  notifyClientTrainerNote,
  notifyExerciseCommentReply,
  notifyTrainerExerciseNote,
} from '@/lib/notifications/push-notification-service'
import { GQLContext } from '@/types/gql-context'

import { createNotification } from '../notification/factory'

import Note from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  note: async (_, { id, relatedTo }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const note = await prisma.note.findUnique({
      where: {
        id,
        relatedToId: relatedTo,
        createdById: user.user.id,
      },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
    })

    return note ? new Note(note, context) : null
  },

  notes: async (_, { relatedTo }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const notes = await prisma.note.findMany({
      where: { relatedToId: relatedTo, createdById: user.user.id },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return notes.map((note) => new Note(note, context))
  },

  exerciseNotes: async (_, { exerciseName }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Find all exercises with the given name in the user's training plans
    const exercises = await prisma.trainingExercise.findMany({
      where: {
        name: exerciseName,
        day: {
          week: {
            plan: {
              OR: [
                { createdById: user.user.id },
                { assignedToId: user.user.id },
              ],
            },
          },
        },
      },
      select: { id: true },
    })

    const exerciseIds = exercises.map((ex) => ex.id)

    if (exerciseIds.length === 0) {
      return []
    }

    // Get all notes for these exercises (excluding replies)
    const notes = await prisma.note.findMany({
      where: {
        relatedToId: { in: exerciseIds },
        createdById: user.user.id,
        // Filter out replies by checking if metadata doesn't contain parentNoteId
        // We'll handle this in post-processing since Prisma JSON filtering is complex
      },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Filter out replies in post-processing
    const filteredNotes = notes.filter((note) => {
      if (!note.metadata || typeof note.metadata !== 'object') return true
      const metadata = note.metadata as { parentNoteId?: string }
      return !metadata.parentNoteId
    })

    return filteredNotes.map((note) => new Note(note, context))
  },

  // NEW: Optimized batch query for workout notes - replaces 9 individual calls with 1
  workoutExerciseNotes: async (_, { exerciseNames }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // OPTIMIZED: Single query to find all exercises by names
    const exercises = await prisma.trainingExercise.findMany({
      where: {
        name: { in: exerciseNames },
        day: {
          week: {
            plan: {
              OR: [
                { createdById: user.user.id },
                { assignedToId: user.user.id },
              ],
            },
          },
        },
      },
      select: { id: true, name: true },
    })

    const exerciseIds = exercises.map((ex) => ex.id)

    if (exerciseIds.length === 0) {
      // Return empty results for all requested exercise names
      return exerciseNames.map((name) => ({
        exerciseName: name,
        notes: [],
      }))
    }

    // OPTIMIZED: Single query to get ALL notes for ALL exercises
    const notes = await prisma.note.findMany({
      where: {
        relatedToId: { in: exerciseIds },
        createdById: user.user.id,
      },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    // Separate parent notes from replies
    const parentNotes = notes.filter((note) => {
      if (!note.metadata || typeof note.metadata !== 'object') return true
      const metadata = note.metadata as { parentNoteId?: string }
      return !metadata.parentNoteId
    })

    const replies = notes
      .filter((note) => {
        if (!note.metadata || typeof note.metadata !== 'object') return false
        const metadata = note.metadata as { parentNoteId?: string }
        return !!metadata.parentNoteId
      })
      .sort((a, b) => {
        const aDate = a.createdAt
        const bDate = b.createdAt
        return aDate.getTime() - bDate.getTime()
      })

    // Group replies by parent note ID
    const repliesByParentNoteId = new Map<string, typeof replies>()
    for (const reply of replies) {
      const metadata = reply.metadata as { parentNoteId?: string }
      const parentNoteId = metadata.parentNoteId
      if (parentNoteId) {
        if (!repliesByParentNoteId.has(parentNoteId)) {
          repliesByParentNoteId.set(parentNoteId, [])
        }
        repliesByParentNoteId.get(parentNoteId)!.push(reply)
      }
    }

    // Group parent notes by exercise name
    const notesByExercise = new Map<string, typeof parentNotes>()

    for (const note of parentNotes) {
      // Find the exercise name for this note
      const exercise = exercises.find((ex) => ex.id === note.relatedToId)
      if (exercise) {
        if (!notesByExercise.has(exercise.name)) {
          notesByExercise.set(exercise.name, [])
        }
        notesByExercise.get(exercise.name)!.push(note)
      }
    }

    // Return results for all requested exercise names (empty array if no notes)
    return exerciseNames.map((exerciseName) => ({
      exerciseName,
      notes: (notesByExercise.get(exerciseName) || []).map((note) => {
        // Include replies for each parent note
        const noteReplies = repliesByParentNoteId.get(note.id) || []
        return new Note({ ...note, replies: noteReplies }, context)
      }),
    }))
  },

  clientSharedNotes: async (_, { clientId }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Verify the trainer-client access (direct trainer or team member)
    await ensureTrainerClientAccess(user.user.id, clientId)

    // Get all notes created by the client that are shared with trainer (excluding replies)
    const notes = await prisma.note.findMany({
      where: {
        createdById: clientId,
        metadata: {
          path: ['shareWithTrainer'],
          equals: true,
        },
      },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return notes.map((note) => new Note(note, context))
  },

  trainerSharedNotes: async (_, { limit, offset }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Get notes created by the user's trainer that are shared with client (excluding replies)
    const notes = await prisma.note.findMany({
      where: {
        createdBy: {
          clients: {
            some: { id: user.user.id },
          },
        },
        metadata: {
          path: ['shareWithClient'],
          equals: true,
        },
      },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit || undefined,
      skip: offset || undefined,
    })

    // Filter out replies in post-processing
    const filteredNotes = notes.filter((note) => {
      if (!note.metadata || typeof note.metadata !== 'object') return true
      const metadata = note.metadata as { parentNoteId?: string }
      return !metadata.parentNoteId
    })

    return filteredNotes.map((note) => new Note(note, context))
  },

  noteReplies: async (_, { noteId }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Get the parent note to verify access
    const parentNote = await prisma.note.findUnique({
      where: { id: noteId },
    })

    if (!parentNote) {
      throw new Error('Note not found')
    }

    // Verify user can access this note (either they created it or they're the trainer)
    const canAccess =
      parentNote.createdById === user.user.id || // User created the note
      user.user.role === 'TRAINER' // Trainer can see client notes

    if (!canAccess) {
      throw new Error('Access denied')
    }

    // Get all replies to this note
    const replies = await prisma.note.findMany({
      where: {
        metadata: {
          path: ['parentNoteId'],
          equals: noteId,
        },
      },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    return replies.map((reply) => new Note(reply, context))
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createNote: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { note, relatedTo, shareWithTrainer, shareWithClient } = input

    // Build metadata object
    const metadata: Record<string, unknown> = {}
    if (shareWithTrainer !== undefined)
      metadata.shareWithTrainer = shareWithTrainer
    if (shareWithClient !== undefined)
      metadata.shareWithClient = shareWithClient

    const finalMetadata =
      Object.keys(metadata).length > 0
        ? (metadata as Prisma.InputJsonValue)
        : undefined

    const newNote = await prisma.note.create({
      data: {
        text: note,
        relatedToId: relatedTo,
        createdById: user.user.id,
        metadata: finalMetadata,
      },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
    })

    // Send notifications if trainer is sharing note with client
    if (shareWithClient && user.user.role === 'TRAINER' && relatedTo) {
      // Verify the relatedTo user is a client of this trainer (direct or team access)
      const hasAccess = await verifyTrainerClientAccess(user.user.id, relatedTo)

      if (hasAccess) {
        // Get client details for notification
        const client = await prisma.user.findUnique({
          where: { id: relatedTo },
          include: { profile: true },
        })

        if (client) {
          // Get trainer name
          const trainerName =
            user.user.profile?.firstName && user.user.profile?.lastName
              ? `${user.user.profile.firstName} ${user.user.profile.lastName}`
              : user.user.name || 'Your trainer'

          // Send in-app notification
          await createNotification(
            {
              userId: relatedTo,
              createdBy: user.user.id,
              type: GQLNotificationType.TrainerNoteShared,
              message: `${trainerName} shared a note with you`,
              link: '/fitspace/my-trainer',
              relatedItemId: newNote.id,
            },
            context,
          )

          // Send push notification
          await notifyClientTrainerNote(relatedTo, trainerName, note)
        }
      }
    }

    return new Note(newNote, context)
  },

  createExerciseNote: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { exerciseId, note, shareWithTrainer, shareWithClient } = input

    // Verify the exercise belongs to the user's training plans and get trainer info
    const exercise = await prisma.trainingExercise.findFirst({
      where: {
        id: exerciseId,
        day: {
          week: {
            plan: {
              OR: [
                { createdById: user.user.id },
                { assignedToId: user.user.id },
              ],
            },
          },
        },
      },
      include: {
        day: {
          include: {
            week: {
              include: {
                plan: {
                  include: {
                    createdBy: true,
                    assignedTo: {
                      include: {
                        profile: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!exercise) {
      throw new Error('Exercise not found or access denied')
    }

    // Build metadata object
    const metadata: Record<string, unknown> = {}
    if (shareWithTrainer !== undefined)
      metadata.shareWithTrainer = shareWithTrainer
    if (shareWithClient !== undefined)
      metadata.shareWithClient = shareWithClient

    const finalMetadata =
      Object.keys(metadata).length > 0
        ? (metadata as Prisma.InputJsonValue)
        : undefined

    const newNote = await prisma.note.create({
      data: {
        text: note,
        relatedToId: exerciseId,
        createdById: user.user.id,
        metadata: finalMetadata,
      },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
    })

    // Send push notification to trainer if note is shared and user is a client
    if (shareWithTrainer && exercise.day.week.plan) {
      const plan = exercise.day.week.plan
      const isClientNote = plan.assignedToId === user.user.id

      if (isClientNote && plan.createdBy) {
        const clientName =
          user.user.profile?.firstName && user.user.profile?.lastName
            ? `${user.user.profile.firstName} ${user.user.profile.lastName}`
            : user.user.name || 'Client'

        await notifyTrainerExerciseNote(plan.createdBy.id, clientName, note)
      }
    }

    return new Note(newNote, context)
  },

  createTrainerNoteForClient: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Verify user is a trainer
    if (user.user.role !== 'TRAINER') {
      throw new Error('Only trainers can create notes for clients')
    }

    const { clientId, exerciseId, note, shareWithClient } = input

    // Verify the trainer-client access (direct trainer or team member)
    await ensureTrainerClientAccess(user.user.id, clientId)

    // Get client details
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      include: { profile: true },
    })

    if (!client) {
      throw new Error('Client not found')
    }

    // Verify the exercise belongs to a training plan assigned to this client
    const exercise = await prisma.trainingExercise.findFirst({
      where: {
        id: exerciseId,
        day: {
          week: {
            plan: {
              assignedToId: clientId,
              createdById: user.user.id,
            },
          },
        },
      },
    })

    if (!exercise) {
      throw new Error('Exercise not found or access denied')
    }

    // Build metadata object
    const metadata =
      shareWithClient !== undefined ? { shareWithClient } : undefined

    const newNote = await prisma.note.create({
      data: {
        text: note,
        relatedToId: exerciseId,
        createdById: user.user.id,
        metadata,
      },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
    })

    // Send notification to client if note is shared
    if (shareWithClient) {
      const trainerName =
        user.user.profile?.firstName && user.user.profile?.lastName
          ? `${user.user.profile.firstName} ${user.user.profile.lastName}`
          : user.user.name || 'Your trainer'

      // Create app notification
      await createNotification(
        {
          userId: clientId,
          createdBy: user.user.id,
          type: GQLNotificationType.TrainerNoteShared,
          message: `${trainerName} shared a note with you`,
          link: '/fitspace/my-trainer',
          relatedItemId: newNote.id,
        },
        context,
      )

      // Send push notification
      await notifyClientTrainerNote(clientId, trainerName, note)
    }

    return new Note(newNote, context)
  },

  createNoteReply: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { parentNoteId, text } = input

    // Get the parent note to verify access and get related exercise
    const parentNote = await prisma.note.findUnique({
      where: { id: parentNoteId },
      include: {
        createdBy: true,
      },
    })

    if (!parentNote) {
      throw new Error('Parent note not found')
    }

    // Verify user can reply to this note
    // User can reply if they are:
    // 1. The trainer of the note creator
    // 2. The original note creator (client replying to trainer reply)
    let canReply = false

    if (user.user.role === GQLUserRole.Trainer) {
      // Verify the note creator is the trainer's client (direct or team access)
      canReply = await verifyTrainerClientAccess(
        user.user.id,
        parentNote.createdById,
      )
    } else {
      // Client can reply if:
      // 1. They created the note themselves, OR
      // 2. The note was shared with them by their trainer

      if (parentNote.createdById === user.user.id) {
        // Client replying to their own note
        canReply = true
      } else {
        // Check if this is a trainer note shared with the client
        const noteMetadata = parentNote.metadata as {
          shareWithClient?: boolean
        } | null
        const isSharedWithClient = noteMetadata?.shareWithClient === true

        if (isSharedWithClient) {
          // Verify the note creator is this client's trainer
          const trainer = await prisma.user.findFirst({
            where: {
              id: parentNote.createdById,
              role: 'TRAINER',
              clients: {
                some: { id: user.user.id },
              },
            },
          })
          canReply = !!trainer
        }
      }
    }

    if (!canReply) {
      throw new Error('Access denied: cannot reply to this note')
    }

    // Create the reply with parentNoteId in metadata
    const metadata = { parentNoteId }

    const reply = await prisma.note.create({
      data: {
        text,
        relatedToId: parentNote.relatedToId, // Same exercise as parent
        createdById: user.user.id,
        metadata,
      },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
    })

    // Send push notification to the original note creator (if it's not the same person)
    if (parentNote.createdById !== user.user.id) {
      const senderName =
        user.user.profile?.firstName && user.user.profile?.lastName
          ? `${user.user.profile.firstName} ${user.user.profile.lastName}`
          : user.user.name || 'Someone'

      await notifyExerciseCommentReply(parentNote.createdById, senderName, text)
    }

    return new Note(reply, context)
  },

  updateNote: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { id, note, shareWithTrainer, shareWithClient } = input

    // Get existing note to check current sharing status
    const existingNote = await prisma.note.findUnique({
      where: { id },
      select: {
        metadata: true,
        relatedToId: true,
        createdById: true,
      },
    })

    if (!existingNote) {
      throw new Error('Note not found')
    }

    // Check if user owns the note
    if (existingNote.createdById !== user.user.id) {
      throw new Error('You can only update your own notes')
    }

    const existingMetadata =
      (existingNote?.metadata as Record<string, unknown>) || {}
    const wasSharedWithClient = existingMetadata.shareWithClient === true

    // Build metadata object, preserving existing metadata if sharing options are not provided
    const updateData: { text: string; metadata?: Prisma.InputJsonValue } = {
      text: note,
    }

    if (shareWithTrainer !== undefined || shareWithClient !== undefined) {
      const newMetadata = {
        ...(typeof existingMetadata === 'object' && existingMetadata !== null
          ? existingMetadata
          : {}),
      }

      if (shareWithTrainer !== undefined) {
        newMetadata.shareWithTrainer = shareWithTrainer
      }
      if (shareWithClient !== undefined) {
        newMetadata.shareWithClient = shareWithClient
      }

      updateData.metadata = newMetadata as Prisma.InputJsonValue
    }

    const newNote = await prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
    })

    // Send notifications if trainer is newly sharing note with client
    if (
      shareWithClient &&
      !wasSharedWithClient &&
      user.user.role === 'TRAINER' &&
      existingNote.relatedToId
    ) {
      // Verify the relatedTo user is a client of this trainer (direct or team access)
      const hasAccess = await verifyTrainerClientAccess(
        user.user.id,
        existingNote.relatedToId,
      )

      if (hasAccess) {
        // Get client details for notification
        const client = await prisma.user.findUnique({
          where: { id: existingNote.relatedToId },
          include: { profile: true },
        })

        if (client) {
          // Get trainer name
          const trainerName =
            user.user.profile?.firstName && user.user.profile?.lastName
              ? `${user.user.profile.firstName} ${user.user.profile.lastName}`
              : user.user.name || 'Your trainer'

          // Send in-app notification
          await createNotification(
            {
              userId: existingNote.relatedToId,
              createdBy: user.user.id,
              type: GQLNotificationType.TrainerNoteShared,
              message: `${trainerName} shared a note with you`,
              link: '/fitspace/my-trainer',
              relatedItemId: newNote.id,
            },
            context,
          )

          // Send push notification
          await notifyClientTrainerNote(
            existingNote.relatedToId,
            trainerName,
            newNote.text,
          )
        }
      }
    }

    return new Note(newNote, context)
  },

  deleteNote: async (_, { id }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // First, verify the note exists and belongs to the user
    const noteToDelete = await prisma.note.findFirst({
      where: { id, createdById: user.user.id },
    })

    if (!noteToDelete) {
      throw new Error(
        'Note not found or you do not have permission to delete it',
      )
    }

    // Find and delete all replies to this note (cascading delete)
    const replies = await prisma.note.findMany({
      where: {
        createdById: user.user.id,
        // Find notes where metadata contains parentNoteId matching our note ID
        metadata: {
          path: ['parentNoteId'],
          equals: id,
        },
      },
    })

    // Delete all replies first
    if (replies.length > 0) {
      await prisma.note.deleteMany({
        where: {
          id: { in: replies.map((reply) => reply.id) },
          createdById: user.user.id,
        },
      })
    }

    // Then delete the parent note
    await prisma.note.delete({
      where: { id, createdById: user.user.id },
    })

    return true
  },
}
