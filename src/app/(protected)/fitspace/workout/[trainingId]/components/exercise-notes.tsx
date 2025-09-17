'use client'

import { Edit3, Plus, Reply, Send, Share, Trash2 } from 'lucide-react'
import React, { useEffect, useState } from 'react'

import { AnimateHeightItem } from '@/components/animations/animated-container'
import { Button } from '@/components/ui/button'
import { DrawerTitle, SimpleDrawerContent } from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  GQLFitspaceGetWorkoutDayQuery,
  type GQLGetWorkoutExerciseNotesQuery,
  useCreateExerciseNoteMutation,
  useCreateNoteReplyMutation,
  useDeleteNoteMutation,
  useUpdateNoteMutation,
} from '@/generated/graphql-client'
import {
  type OptimisticNote,
  createOptimisticNote,
  createOptimisticReply,
  useOptimisticNotes,
  useOptimisticReplies,
} from '@/hooks/use-optimistic-notes'
import { cn } from '@/lib/utils'

// Type definitions
type NoteReply = NonNullable<
  GQLGetWorkoutExerciseNotesQuery['workoutExerciseNotes'][number]['notes'][number]['replies']
>[number]

interface ExerciseNotesProps {
  exercise: NonNullable<
    GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']
  >['day']['exercises'][number]
  resetKey?: number // Add reset prop
}

interface Note {
  id: string
  text: string
  createdAt: string
  updatedAt: string
  shareWithTrainer?: boolean | null
  createdBy?: {
    id: string
    firstName?: string | null | undefined
    lastName?: string | null | undefined
    image?: string | null | undefined
    role: string
  }
}

// Hook to get notes count for the indicator
export function useExerciseNotesCount(
  exercise: NonNullable<
    GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']
  >['day']['exercises'][number],
) {
  const exerciseName = exercise.substitutedBy?.name || exercise.name
  const { notesCountForExercise } = useWorkout()

  return notesCountForExercise(exerciseName)
}

export function ExerciseNotes({ exercise, resetKey }: ExerciseNotesProps) {
  // State management
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [editingShareWithTrainer, setEditingShareWithTrainer] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newNoteText, setNewNoteText] = useState('')
  const [newNoteShareWithTrainer, setNewNoteShareWithTrainer] = useState(false)

  // Reset state when resetKey changes (when drawer closes)
  useEffect(() => {
    if (resetKey !== undefined) {
      setEditingNoteId(null)
      setEditingText('')
      setEditingShareWithTrainer(false)
      setIsCreating(false)
      setNewNoteText('')
      setNewNoteShareWithTrainer(false)
    }
  }, [resetKey])

  // Exercise data
  const exerciseName = exercise.substitutedBy?.name || exercise.name
  const exerciseId = exercise.substitutedBy?.id || exercise.id

  // Get notes from workout context (batched for all exercises)
  const { notesForExercise, isNotesLoading } = useWorkout()
  const notes = notesForExercise(exerciseName)
  const isLoading = isNotesLoading

  // Optimistic mutations hook
  const {
    addNoteOptimistically,
    updateNoteOptimistically,
    deleteNoteOptimistically,
    invalidateQueries,
  } = useOptimisticNotes(exerciseName)

  // Mutations
  const { mutateAsync: updateNote, isPending: isUpdatingNote } =
    useUpdateNoteMutation()
  const { mutateAsync: deleteNote, isPending: isDeletingNote } =
    useDeleteNoteMutation()
  const { mutateAsync: createExerciseNote, isPending: isCreatingNote } =
    useCreateExerciseNoteMutation()

  // Handlers
  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id)
    setEditingText(note.text)
    setEditingShareWithTrainer(note.shareWithTrainer || false)
  }

  const handleSaveEdit = async () => {
    if (!editingNoteId || !editingText.trim()) return

    const noteId = editingNoteId
    const noteText = editingText.trim()
    const shareWithTrainer = editingShareWithTrainer

    // Clear editing state immediately
    setEditingNoteId(null)
    setEditingText('')
    setEditingShareWithTrainer(false)

    // Update note in cache immediately - user sees changes right away
    updateNoteOptimistically(noteId, { text: noteText, shareWithTrainer })

    try {
      // Run mutation in background
      await updateNote({
        input: { id: noteId, note: noteText, shareWithTrainer },
      })
    } catch (error) {
      console.error('Failed to update note:', error)
      // On error, restore form state
      setEditingNoteId(noteId)
      setEditingText(noteText)
      setEditingShareWithTrainer(shareWithTrainer)
    }

    // Always refetch to sync with server
    invalidateQueries()
  }

  const handleCancelEdit = () => {
    setEditingNoteId(null)
    setEditingText('')
    setEditingShareWithTrainer(false)
  }

  const handleDeleteNote = async (noteId: string) => {
    // Store the note for potential rollback
    const noteToDelete = notes.find((note) => note.id === noteId)

    // Remove note from cache immediately - user sees it disappear right away
    deleteNoteOptimistically(noteId)

    try {
      // Run mutation in background
      await deleteNote({ id: noteId })
      // Success - refresh cache to sync with server
      await invalidateQueries()
    } catch (error) {
      console.error('Failed to delete note:', error)
      // Rollback: add the note back if deletion failed
      if (noteToDelete) {
        addNoteOptimistically(noteToDelete as OptimisticNote)
      }
    }
  }

  const handleCreateNote = async () => {
    if (!newNoteText.trim()) return

    const noteText = newNoteText.trim()
    const shareWithTrainer = newNoteShareWithTrainer

    // Clear form immediately
    setNewNoteText('')
    setNewNoteShareWithTrainer(false)
    setIsCreating(false)

    // Add note to cache immediately - user sees it right away
    const optimisticNote = createOptimisticNote(noteText, shareWithTrainer)
    addNoteOptimistically(optimisticNote)

    try {
      // Run mutation in background
      await createExerciseNote({
        input: { exerciseId, note: noteText, shareWithTrainer },
      })
    } catch (error) {
      console.error('Failed to create note:', error)
      // On error, restore form state but keep optimistic note visible
      // Server sync will happen via refetch
      setNewNoteText(noteText)
      setNewNoteShareWithTrainer(shareWithTrainer)
      setIsCreating(true)
    }

    // Always refetch to sync with server
    invalidateQueries()
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
    <SimpleDrawerContent
      title="Exercise Notes"
      className="flex flex-col"
      header={
        <div className="flex justify-between gap-2 items-center">
          <DrawerTitle>Exercise Notes</DrawerTitle>
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
      }
    >
      <div className="flex-1">
        <div className="space-y-6">
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

          {notes.length === 0 && !isCreating ? (
            <div className="text-center py-12">
              <p className="text-sm text-muted-foreground">
                {isCreating
                  ? 'Add your first note above'
                  : 'No notes yet. Click "Add Note" to start.'}
              </p>
            </div>
          ) : null}

          {/* Notes List */}
          {notes.length > 0 && (
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
      </div>
    </SimpleDrawerContent>
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
  if (!isCreating) return null

  return (
    <div className="space-y-4">
      <Textarea
        id="new-note"
        placeholder="Write your exercise note here..."
        value={newNoteText}
        variant="ghost"
        onChange={(e) => onNewNoteTextChange(e.target.value)}
        className="min-h-[100px] resize-none"
        autoFocus
      />

      <div className="flex items-center justify-between pt-2 border-t border-border">
        <div className="flex items-center space-x-2">
          <Switch
            id="share-new-note-trainer"
            checked={newNoteShareWithTrainer}
            onCheckedChange={onNewNoteShareWithTrainerChange}
          />
          <Label
            htmlFor="share-new-note-trainer"
            className="text-sm text-muted-foreground"
          >
            Share with trainer
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

  // Get replies from batched workout context
  const { repliesForNote } = useWorkout()
  const replies = repliesForNote(note.id)

  const { mutateAsync: createReply, isPending: isCreatingReply } =
    useCreateNoteReplyMutation()

  const { performOptimisticReplyMutation, invalidateRepliesQuery } =
    useOptimisticReplies(note.id)

  const handleCreateReply = async () => {
    if (!replyText.trim()) return

    const replyTextValue = replyText.trim()
    const optimisticReply = createOptimisticReply(replyTextValue)

    // Clear form immediately
    setReplyText('')
    setIsReplying(false)

    // Add reply to cache immediately - user sees it right away
    await performOptimisticReplyMutation(
      optimisticReply,
      () =>
        createReply({
          input: { parentNoteId: note.id, text: replyTextValue },
        }),
      () => {
        // On error, restore form state
        setReplyText(replyTextValue)
        setIsReplying(true)
      },
    )

    // Always refetch replies to sync with server
    invalidateRepliesQuery()
  }

  return (
    <div
      className={cn(
        'group transition-all duration-200 py-4 border-b border-border last:border-b-0',
        loading && 'opacity-50',
      )}
    >
      <AnimateHeightItem
        id={note.text}
        isFirstRender={false}
        className="w-full"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="space-y-4">
                <Textarea
                  id="edit-note"
                  variant="ghost"
                  value={editingText}
                  onChange={(e) => onEditingTextChange(e.target.value)}
                  className="min-h-[100px] resize-none"
                  autoFocus
                />

                <div className="flex items-center space-x-2">
                  <Switch
                    id="share-edit-note-trainer"
                    checked={editingShareWithTrainer}
                    onCheckedChange={onEditingShareWithTrainerChange}
                  />
                  <Label
                    htmlFor="share-edit-note-trainer"
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
                    {replies.map((reply: NoteReply, index: number) => (
                      <AnimateHeightItem
                        key={`reply-${index}`}
                        id={reply.text}
                        isFirstRender={false}
                        className="w-full"
                      >
                        <div key={reply.id} className="space-y-2">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {reply.text}
                          </p>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-muted-foreground">
                              {reply.createdBy.firstName}{' '}
                              {reply.createdBy.lastName}
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
                      </AnimateHeightItem>
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
      </AnimateHeightItem>
    </div>
  )
}
