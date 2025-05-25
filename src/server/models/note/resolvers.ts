import { prisma } from '@lib/db'

import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { getCurrentUserOrThrow } from '@/lib/getUser'

import Note from './model'

export const Query: GQLQueryResolvers = {
  note: async (_, { id, relatedTo }) => {
    const user = await getCurrentUserOrThrow()

    const note = await prisma.note.findUnique({
      where: {
        id,
        relatedToId: relatedTo,
        createdById: user.user.id,
      },
    })

    return note ? new Note(note) : null
  },

  notes: async (_, { relatedTo }) => {
    const user = await getCurrentUserOrThrow()

    const notes = await prisma.note.findMany({
      where: { relatedToId: relatedTo, createdById: user.user.id },
      orderBy: { createdAt: 'desc' },
    })

    return notes.map((note) => new Note(note))
  },
}

export const Mutation: GQLMutationResolvers = {
  createNote: async (_, { input }) => {
    const user = await getCurrentUserOrThrow()

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
  deleteNote: async (_, { id }) => {
    const user = await getCurrentUserOrThrow()

    await prisma.note.delete({
      where: { id, createdById: user.user.id },
    })

    return true
  },
}
