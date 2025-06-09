import { prisma } from '@lib/db'

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
    })

    return note ? new Note(note) : null
  },

  notes: async (_, { relatedTo }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const notes = await prisma.note.findMany({
      where: { relatedToId: relatedTo, createdById: user.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return notes.map((note) => new Note(note))
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createNote: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const { note, relatedTo } = input

    const newNote = await prisma.note.create({
      data: { text: note, relatedToId: relatedTo, createdById: user.user.id },
    })

    return new Note(newNote)
  },

  updateNote: async (_, { input }) => {
    const { id, note } = input

    const newNote = await prisma.note.update({
      where: { id },
      data: { text: note },
    })

    return new Note(newNote)
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
