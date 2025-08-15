'use client'

import { Edit3, Plus, Reply, Send, Share, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { AnimatedContainer } from '@/components/animations/animated-container'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  type GQLGetNoteRepliesQuery,
  useCreateExerciseNoteMutation,
  useCreateNoteReplyMutation,
  useDeleteNoteMutation,
  useGetExerciseNotesQuery,
  useGetNoteRepliesQuery,
  useUpdateNoteMutation,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { WorkoutExercise } from './workout-page.client'

// Type definitions for replies
type NoteReply = NonNullable<GQLGetNoteRepliesQuery['noteReplies']>[number]

interface ExerciseNotesProps {
  exercise: WorkoutExercise
}

interface Note {
  id: string
  text: string
  createdAt: string
  updatedAt: string
  shareWithTrainer?: boolean | null
  createdBy?: {
    id: string
    firstName: string | null
    lastName: string | null
    image: string | null
    role: string
  }
}

// Hook to get notes count for the indicator
export function useExerciseNotesCount(exercise: WorkoutExercise) {
  const exerciseName = exercise.substitutedBy?.name || exercise.name

  const { data: notesData } = useGetExerciseNotesQuery({
    exerciseName,
  })

  return (notesData?.exerciseNotes || []).length
}

export function ExerciseNotes({ exercise }: ExerciseNotesProps) {
  // State management
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [editingShareWithTrainer, setEditingShareWithTrainer] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')
  const [newNoteShareWithTrainer, setNewNoteShareWithTrainer] = useState(false)

  // Use the exercise name for querying but exercise ID for creating
  const exerciseName = exercise.substitutedBy?.name || exercise.name
  const exerciseId = exercise.substitutedBy?.id || exercise.id

  // GQL
  const {
    data: notesData,
    refetch,
    isLoading,
  } = useGetExerciseNotesQuery({
    exerciseName,
  })

  const { mutateAsync: updateNote, isPending: isUpdatingNote } =
    useUpdateNoteMutation()
  const { mutateAsync: deleteNote, isPending: isDeletingNote } =
    useDeleteNoteMutation()
  const { mutateAsync: createExerciseNote, isPending: isCreatingNote } =
    useCreateExerciseNoteMutation()

  const notes = (notesData?.exerciseNotes || []) as Note[]

  // Handlers
  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id)
    setEditingText(note.text)
    setEditingShareWithTrainer(note.shareWithTrainer || false)
  }

  const handleSaveEdit = async () => {
    if (editingNoteId && editingText.trim()) {
      try {
        await updateNote({
          input: {
            id: editingNoteId,
            note: editingText.trim(),
            shareWithTrainer: editingShareWithTrainer,
          },
        })
        await refetch()
        setEditingNoteId(null)
        setEditingText('')
        setEditingShareWithTrainer(false)
      } catch (error) {
        console.error('Failed to update note:', error)
      }
    }
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditingText('')
    setEditingShareWithTrainer(false)
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
        await createExerciseNote({
          input: {
            exerciseId,
            note: newNoteText.trim(),
            shareWithTrainer: newNoteShareWithTrainer,
          },
        })
        await refetch()
        setNewNoteText('')
        setNewNoteShareWithTrainer(false)
        setIsCreating(false)
      } catch (error) {
        console.error('Failed to create note:', error)
      }
    }
  }

  const handleCancelCreate = () => {
    setIsCreating(false)
    setNewNoteText('')
    setNewNoteShareWithTrainer(false)
  }

  const handleOpenCreateNote = () => {
    setIsCreating((p) => !p)
  }

  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-end items-center">
        <Button
          variant="tertiary"
          size="sm"
          onClick={handleOpenCreateNote}
          className="h-8 px-3 text-sm"
          iconStart={
            <Plus
              className={cn(
                'h-4 w-4 transition-transform duration-200',
                isCreating && 'rotate-45',
              )}
            />
          }
        >
          Add Note
        </Button>
      </div>

      {/* Create Note Form */}
      <CreateNoteForm
        isCreating={isCreating}
        newNoteText={newNoteText}
        newNoteShareWithTrainer={newNoteShareWithTrainer}
        isCreatingNote={isCreatingNote}
        onNewNoteTextChange={setNewNoteText}
        onNewNoteShareWithTrainerChange={setNewNoteShareWithTrainer}
        onCreateNote={handleCreateNote}
        onCancelCreate={handleCancelCreate}
      />

      {/* Notes List */}
      {notes.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-sm text-muted-foreground">
            {isCreating
              ? 'Add your first note above'
              : 'No notes yet. Click "Add Note" to start.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <ExerciseNote
              key={note.id}
              note={note}
              isEditing={editingNoteId === note.id}
              editingText={editingText}
              editingShareWithTrainer={editingShareWithTrainer}
              isUpdatingNote={isUpdatingNote}
              isDeletingNote={isDeletingNote}
              loading={isLoading}
              onStartEdit={handleStartEdit}
              onSaveEdit={handleSaveEdit}
              onCancelEdit={handleCancelEdit}
              onDeleteNote={handleDeleteNote}
              onEditingTextChange={setEditingText}
              onEditingShareWithTrainerChange={setEditingShareWithTrainer}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// Create note form component
function CreateNoteForm({
  isCreating,
  newNoteText,
  newNoteShareWithTrainer,
  isCreatingNote,
  onNewNoteTextChange,
  onNewNoteShareWithTrainerChange,
  onCreateNote,
  onCancelCreate,
}: {
  isCreating: boolean
  newNoteText: string
  newNoteShareWithTrainer: boolean
  isCreatingNote: boolean
  onNewNoteTextChange: (text: string) => void
  onNewNoteShareWithTrainerChange: (share: boolean) => void
  onCreateNote: () => void
  onCancelCreate: () => void
}) {
  return (
    <AnimatedContainer
      isVisible={isCreating}
      className="overflow-hidden"
      id="create-note-form"
    >
      <div className="space-y-4 border border-border rounded-lg p-4">
        <Textarea
          id="new-note"
          placeholder="Write your exercise note here..."
          value={newNoteText}
          onChange={(e) => onNewNoteTextChange(e.target.value)}
          className="min-h-[100px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm"
          autoFocus
        />

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-2">
            <Switch
              id="share-new-note"
              checked={newNoteShareWithTrainer}
              onCheckedChange={onNewNoteShareWithTrainerChange}
            />
            <Label
              htmlFor="share-new-note"
              className="text-sm text-muted-foreground"
            >
              Share with my trainer
            </Label>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancelCreate}
              disabled={isCreatingNote}
              className="h-8 px-3"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={onCreateNote}
              disabled={!newNoteText.trim() || isCreatingNote}
              loading={isCreatingNote}
              className="h-8 px-3"
            >
              Save Note
            </Button>
          </div>
        </div>
      </div>
    </AnimatedContainer>
  )
}

// Individual note component with replies
function ExerciseNote({
  note,
  isEditing,
  editingText,
  editingShareWithTrainer,
  isUpdatingNote,
  isDeletingNote,
  loading,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDeleteNote,
  onEditingTextChange,
  onEditingShareWithTrainerChange,
}: {
  note: Note
  isEditing: boolean
  editingText: string
  editingShareWithTrainer: boolean
  isUpdatingNote: boolean
  isDeletingNote: boolean
  loading: boolean
  onStartEdit: (note: Note) => void
  onSaveEdit: () => void
  onCancelEdit: () => void
  onDeleteNote: (id: string) => void
  onEditingTextChange: (text: string) => void
  onEditingShareWithTrainerChange: (share: boolean) => void
}) {
  const [isReplying, setIsReplying] = useState(false)
  const [replyText, setReplyText] = useState('')

  // Fetch replies for this note
  const { data: repliesData, refetch: refetchReplies } = useGetNoteRepliesQuery(
    {
      noteId: note.id,
    },
  )

  const { mutateAsync: createReply, isPending: isCreatingReply } =
    useCreateNoteReplyMutation()

  const replies = repliesData?.noteReplies || []

  const handleCreateReply = async () => {
    if (!replyText.trim()) return

    try {
      await createReply({
        input: {
          parentNoteId: note.id,
          text: replyText.trim(),
        },
      })
      setReplyText('')
      setIsReplying(false)
      await refetchReplies()
    } catch (error) {
      console.error('Failed to create reply:', error)
    }
  }

  return (
    <div
      className={cn(
        'group transition-all duration-200 py-4 border-b border-border last:border-b-0',
        loading && 'opacity-50',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                id="edit-note"
                value={editingText}
                onChange={(e) => onEditingTextChange(e.target.value)}
                className="min-h-[100px] resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 p-0 text-sm"
                autoFocus
              />

              <div className="flex items-center space-x-2">
                <Switch
                  id="share-edit-note"
                  checked={editingShareWithTrainer}
                  onCheckedChange={onEditingShareWithTrainerChange}
                />
                <Label
                  htmlFor="share-edit-note"
                  className="text-sm text-muted-foreground"
                >
                  Share with my trainer
                </Label>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteNote(note.id)}
                  loading={isDeletingNote}
                  className="h-8 px-3 text-destructive hover:text-destructive"
                  iconStart={<Trash2 className="h-4 w-4" />}
                >
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onCancelEdit}
                    disabled={isUpdatingNote}
                    className="h-8 px-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={onSaveEdit}
                    disabled={!editingText.trim() || isUpdatingNote}
                    loading={isUpdatingNote}
                    className="h-8 px-3"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap bg-muted rounded-md p-2">
                    {note.text}
                  </p>
                  {!isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStartEdit(note)}
                      iconOnly={<Edit3 />}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {note.shareWithTrainer && (
                      <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                        <Share className="h-3 w-3" />
                        <span>Shared with trainer</span>
                      </div>
                    )}
                  </div>

                  <time className="text-xs text-muted-foreground">
                    {new Date(note.createdAt).toLocaleDateString('en-GB', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                </div>
              </div>

              {/* Trainer Replies */}
              {replies.length > 0 && (
                <div className="ml-4 space-y-3 border-l-2 border-muted pl-4 bg-muted rounded-md p-2">
                  {replies.map((reply: NoteReply) => (
                    <div key={reply.id} className="space-y-2">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {reply.text}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          {reply.createdBy.firstName} {reply.createdBy.lastName}
                        </span>
                        <time className="text-xs text-muted-foreground">
                          {new Date(reply.createdAt).toLocaleDateString(
                            'en-GB',
                            {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            },
                          )}
                        </time>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {note.shareWithTrainer && !isReplying && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsReplying(!isReplying)}
                  iconStart={<Reply />}
                  className="ml-auto"
                >
                  Reply
                </Button>
              )}

              {isReplying && (
                <div className="ml-4 space-y-3 border-l-2 border-muted pl-4">
                  <Textarea
                    id={`reply-${note.id}`}
                    placeholder="Write your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[80px] text-sm border-border"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsReplying(false)
                        setReplyText('')
                      }}
                      disabled={isCreatingReply}
                      className="h-8 px-3"
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCreateReply}
                      disabled={!replyText.trim() || isCreatingReply}
                      loading={isCreatingReply}
                      className="h-8 px-3"
                      iconStart={<Send className="h-3 w-3" />}
                    >
                      Send Reply
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
