'use client'

import { Check, Edit3, Plus, Trash2, X } from 'lucide-react'
import { useState } from 'react'

import { AnimatedContainer } from '@/components/animations/animated-container'
import { Divider } from '@/components/divider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateNoteMutation,
  useDeleteNoteMutation,
  useGetNotesQuery,
  useUpdateNoteMutation,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

// Types
interface Note {
  id: string
  text: string
  createdAt: string
}

// Main component
export function ClientNotes({ clientId }: { clientId: string }) {
  // State management
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')

  // Data fetching and mutations
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
      placeholderData: {
        notes: [
          {
            id: '1',
            text: 'Top secret note about the client',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            text: 'Top secret note about the client, Top secret note about the client Top secret note about the client',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            text: 'Top secret note about the client',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      },
    },
  )
  const { mutateAsync: updateNote, isPending: isUpdatingNote } =
    useUpdateNoteMutation()
  const { mutateAsync: deleteNote, isPending: isDeletingNote } =
    useDeleteNoteMutation()
  const { mutateAsync: createNote, isPending: isCreatingNote } =
    useCreateNoteMutation()

  const notes = notesData?.notes || []

  // Event handlers
  const handleStartEdit = (note: Note) => {
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
      <CardHeader className="gap-0">
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
              <NoteItem
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

// Note creation form component
function CreateNoteForm({
  isCreating,
  newNoteText,
  isCreatingNote,
  onNewNoteTextChange,
  onCreateNote,
  onCancelCreate,
}: {
  isCreating: boolean
  newNoteText: string
  isCreatingNote: boolean
  onNewNoteTextChange: (text: string) => void
  onCreateNote: () => void
  onCancelCreate: () => void
}) {
  return (
    <AnimatedContainer
      isVisible={isCreating}
      className="overflow-hidden"
      id="create-note-form"
    >
      <Textarea
        id="new-note"
        placeholder="Write your note here..."
        value={newNoteText}
        onChange={(e) => onNewNoteTextChange(e.target.value)}
        className="min-h-[120px] resize-none border-none bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 mt-4"
        autoFocus
      />
      <div className="flex gap-2 mt-3 justify-end">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancelCreate}
          disabled={isCreatingNote}
          iconStart={<X />}
        >
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={onCreateNote}
          disabled={!newNoteText.trim() || isCreatingNote}
          loading={isCreatingNote}
          iconStart={<Check />}
        >
          Save
        </Button>
      </div>
    </AnimatedContainer>
  )
}

// Individual note component
function NoteItem({
  note,
  isEditing,
  editingText,
  isUpdatingNote,
  isDeletingNote,
  loading,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeleteNote,
  onEditingTextChange,
}: {
  note: Note
  isEditing: boolean
  editingText: string
  isUpdatingNote: boolean
  isDeletingNote: boolean
  loading: boolean
  onStartEdit: (note: Note) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDeleteNote: (id: string) => void
  onEditingTextChange: (text: string) => void
}) {
  return (
    <div
      className={cn(
        'transition-all duration-200 group/note bg-secondary rounded-md p-2',
        loading && 'masked-placeholder-text',
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-3">
              <Textarea
                id="edit-note"
                value={editingText}
                onChange={(e) => onEditingTextChange(e.target.value)}
                className="min-h-[120px] resize-none border-none bg-secondary focus-visible:ring-0 focus-visible:ring-offset-0 shadow-none -m-2 p-2 leading-relaxed"
                autoFocus
              />

              <Divider className="mb-2" />

              <AnimatedContainer
                isVisible={true}
                className="flex justify-between gap-2"
                id="edit-note-actions"
              >
                <Button
                  variant="destructive"
                  size="icon-xs"
                  onClick={() => onDeleteNote(note.id)}
                  loading={isDeletingNote}
                  iconOnly={<Trash2 />}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onCancelEdit}
                    disabled={isUpdatingNote}
                    iconStart={<X />}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={onSaveEdit}
                    disabled={!editingText.trim() || isUpdatingNote}
                    loading={isUpdatingNote}
                    iconStart={<Check />}
                  >
                    Save
                  </Button>
                </div>
              </AnimatedContainer>
            </div>
          ) : (
            <>
              <p
                className={cn(
                  'text-sm leading-relaxed break-words whitespace-pre-wrap',
                )}
              >
                {note.text}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(note.createdAt).toLocaleDateString('en-GB', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </>
          )}
        </div>

        {!isEditing && (
          <div className="flex gap-1 opacity-0 group-hover/note:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onStartEdit(note)}
              iconOnly={<Edit3 />}
            />
          </div>
        )}
      </div>
    </div>
  )
}
