'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  GQLGetNotesQuery,
  GQLUserRole,
  useCreateNoteMutation,
  useDeleteNoteMutation,
  useGetNotesQuery,
  useUpdateNoteMutation,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { CreateNoteForm } from './create-note-form'
import { Note } from './note'
import type { Note as NoteType } from './types'

export function ClientNotes({ clientId }: { clientId: string }) {
  // State management
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')

  // GQL
  const {
    data: notesData,
    refetch,
    isLoading,
    isPlaceholderData,
  } = useGetNotesQuery(
    {
      relatedTo: clientId,
    },
    {
      placeholderData: placeholderNotes,
    },
  )
  const { mutateAsync: updateNote, isPending: isUpdatingNote } =
    useUpdateNoteMutation()
  const { mutateAsync: deleteNote, isPending: isDeletingNote } =
    useDeleteNoteMutation()
  const { mutateAsync: createNote, isPending: isCreatingNote } =
    useCreateNoteMutation()

  const notes = notesData?.notes || []

  // Handlers
  const handleStartEdit = (note: NoteType) => {
    setEditingNoteId(note.id)
    setEditingText(note.text)
  }

  const handleSaveEdit = async () => {
    if (editingNoteId && editingText.trim()) {
      try {
        await updateNote({
          input: { id: editingNoteId, note: editingText.trim() },
        })
        await refetch()
        setEditingNoteId(null)
        setEditingText('')
      } catch (error) {
        console.error('Failed to update note:', error)
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditingText('')
  }

  const handleDeleteNote = async (noteId: string) => {
    try {
      await deleteNote({ id: noteId })
      await refetch()
    } catch (error) {
      console.error('Failed to delete note:', error)
    }
  }

  const handleCreateNote = async () => {
    if (newNoteText.trim()) {
      try {
        await createNote({
          input: {
            relatedTo: clientId,
            note: newNoteText.trim(),
          },
        })
        await refetch()
        setNewNoteText('')
        setIsCreating(false)
      } catch (error) {
        console.error('Failed to create note:', error)
      }
    }
  }

  const handleCancelCreate = () => {
    setIsCreating(false)
    setNewNoteText('')
  }

  const handleOpenCreateNote = () => {
    setIsCreating((p) => !p)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between">
          <CardTitle>Notes</CardTitle>
          <Button
            variant="outline"
            size="icon-xs"
            onClick={handleOpenCreateNote}
            iconOnly={
              <Plus
                className={cn(
                  'transition-transform duration-200',
                  isCreating && 'rotate-45',
                )}
              />
            }
          />
        </div>
        <CreateNoteForm
          isCreating={isCreating}
          newNoteText={newNoteText}
          isCreatingNote={isCreatingNote}
          onNewNoteTextChange={setNewNoteText}
          onCreateNote={handleCreateNote}
          onCancelCreate={handleCancelCreate}
        />
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            You haven't added any notes yet.
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <Note
                loading={isLoading || isPlaceholderData}
                key={note.id}
                note={note}
                isEditing={editingNoteId === note.id}
                editingText={editingText}
                isUpdatingNote={isUpdatingNote}
                isDeletingNote={isDeletingNote}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onDeleteNote={handleDeleteNote}
                onEditingTextChange={setEditingText}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const placeholderNotes: GQLGetNotesQuery = {
  notes: [
    {
      id: '1',
      text: 'Top secret note about the client',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        image: 'https://via.placeholder.com/150',
        role: GQLUserRole.Trainer,
      },
    },
    {
      id: '2',
      text: 'Top secret note about the client, Top secret note about the client Top secret note about the client',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        image: 'https://via.placeholder.com/150',
        role: GQLUserRole.Trainer,
      },
    },
    {
      id: '3',
      text: 'Top secret note about the client',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        image: 'https://via.placeholder.com/150',
        role: GQLUserRole.Trainer,
      },
    },
  ],
}
