import { GQLUpdateNoteInput } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { getCurrentUserOrThrow } from '@/lib/getUser'

export async function updateNote(input: GQLUpdateNoteInput) {
  const user = await getCurrentUserOrThrow()
  const { id, note, relatedTo } = input

  const updatedNote = await prisma.note.update({
    where: { id, createdById: user.user.id },
    data: { text: note, relatedToId: relatedTo },
    select: { text: true },
  })

  return updatedNote.text
}
