import { prisma } from '@lib/db'
import { Prisma } from '@prisma/client'

import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

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

  clientSharedNotes: async (_, { clientId }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Verify the user is a trainer and clientId is their client
    const client = await prisma.user.findFirst({
      where: {
        id: clientId,
        trainerId: user.user.id,
      },
    })

    if (!client) {
      throw new Error('Client not found or access denied')
    }

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

    const { note, relatedTo, shareWithTrainer } = input

    // Build metadata object
    const metadata =
      shareWithTrainer !== undefined ? { shareWithTrainer } : undefined

    const newNote = await prisma.note.create({
      data: {
        text: note,
        relatedToId: relatedTo,
        createdById: user.user.id,
        metadata,
      },
      include: {
        createdBy: {
          include: { profile: true },
        },
      },
    })

    return new Note(newNote, context)
  },

  createExerciseNote: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { exerciseId, note, shareWithTrainer } = input

    // Verify the exercise belongs to the user's training plans
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
    })

    if (!exercise) {
      throw new Error('Exercise not found or access denied')
    }

    // Build metadata object
    const metadata =
      shareWithTrainer !== undefined ? { shareWithTrainer } : undefined

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

    if (user.user.role === 'TRAINER') {
      // Verify the note creator is the trainer's client
      const client = await prisma.user.findFirst({
        where: {
          id: parentNote.createdById,
          trainerId: user.user.id,
        },
      })
      canReply = !!client
    } else {
      // Client can reply to their own notes or trainer replies to their notes
      canReply = parentNote.createdById === user.user.id
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

    return new Note(reply, context)
  },

  updateNote: async (_, { input }, context) => {
    const { id, note, shareWithTrainer } = input

    // Build metadata object, preserving existing metadata if shareWithTrainer is not provided
    const updateData: { text: string; metadata?: Prisma.InputJsonValue } = {
      text: note,
    }

    if (shareWithTrainer !== undefined) {
      // Get existing metadata to preserve other fields
      const existingNote = await prisma.note.findUnique({
        where: { id },
        select: { metadata: true },
      })

      const existingMetadata =
        (existingNote?.metadata as Record<string, unknown>) || {}
      updateData.metadata = {
        ...(typeof existingMetadata === 'object' && existingMetadata !== null
          ? existingMetadata
          : {}),
        shareWithTrainer,
      }
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

    return new Note(newNote, context)
  },
  deleteNote: async (_, { id }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    await prisma.note.delete({
      where: { id, createdById: user.user.id },
    })

    return true
  },
}
