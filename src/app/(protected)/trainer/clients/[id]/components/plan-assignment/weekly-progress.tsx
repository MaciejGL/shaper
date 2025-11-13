'use client'

import { formatDate } from 'date-fns'
import {
  CheckCircle,
  ChevronDown,
  Circle,
  MessageSquare,
  Reply,
  Send,
} from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'
import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardTitle } from '@/components/ui/card'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import type { GQLGetClientByIdQuery } from '@/generated/graphql-client'
import {
  type GQLGetClientSharedNotesQuery,
  type GQLGetNoteRepliesQuery,
  useCreateNoteReplyMutation,
  useGetClientSharedNotesQuery,
  useGetNoteRepliesQuery,
} from '@/generated/graphql-client'
import { dayNames } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

// Type definitions for notes and replies
type SharedNote = NonNullable<
  GQLGetClientSharedNotesQuery['clientSharedNotes']
>[number]
type NoteReply = NonNullable<GQLGetNoteRepliesQuery['noteReplies']>[number]

interface WeeklyProgressProps {
  plan: NonNullable<GQLGetClientByIdQuery['getClientActivePlan']>
  clientId: string
}

export function WeeklyProgress({ plan, clientId }: WeeklyProgressProps) {
  // Read deep-link query params directly
  const [week] = useQueryState('week', parseAsInteger)
  const [day] = useQueryState('day', parseAsInteger)
  const [exercise] = useQueryState('exercise', parseAsString)

  // Fetch all shared notes from the client in one call
  const { data: sharedNotesData } = useGetClientSharedNotesQuery({
    clientId,
  })

  const sharedNotes = sharedNotesData?.clientSharedNotes || []

  // Find the week ID that matches the deep link weekNumber
  const initialWeekId = useMemo(() => {
    if (week !== null) {
      const targetWeek = plan.weeks.find((_, index) => index + 1 === week)
      return targetWeek?.id || plan.weeks[0]?.id
    }
    return plan.weeks[0]?.id
  }, [week, plan.weeks])

  const [selectedWeekId, setSelectedWeekId] = useState(initialWeekId)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Weekly Breakdown</h3>
        <Badge variant="outline">
          {plan.weeks.filter((w) => w.completedAt).length} of {plan.weekCount}{' '}
          weeks completed
        </Badge>
      </div>

      <Tabs
        value={selectedWeekId}
        onValueChange={setSelectedWeekId}
        className="w-full"
      >
        <TabsList className="w-full">
          {plan.weeks.map((week, index) => (
            <TabsTrigger key={week.id} value={week.id}>
              {week.completedAt && (
                <CheckCircle className="size-3 text-green-600" />
              )}
              {week.name || `Week ${index + 1}`}
            </TabsTrigger>
          ))}
        </TabsList>

        {plan.weeks.map((week) => (
          <TabsContent key={week.id} value={week.id} className="mt-1">
            <div className="space-y-3">
              {week.days.map((dayItem) => (
                <DayCard
                  key={dayItem.id}
                  day={dayItem}
                  sharedNotes={sharedNotes}
                  shouldExpand={day !== null && dayItem.dayOfWeek === day}
                  highlightExercise={exercise || undefined}
                />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

const DayCard = ({
  day,
  sharedNotes,
  shouldExpand,
  highlightExercise,
}: {
  day: NonNullable<
    GQLGetClientByIdQuery['getClientActivePlan']
  >['weeks'][number]['days'][number]
  sharedNotes: SharedNote[]
  shouldExpand?: boolean
  highlightExercise?: string
}) => {
  const [isOpen, setIsOpen] = useState(shouldExpand || false)

  const checkIcons = {
    completed: <CheckCircle className="size-4 text-green-600" />,
    planned: <Circle className="size-4 text-muted-foreground" />,
    rest: <div className="size-4 bg-muted-foreground/10 rounded-full" />,
  }
  return (
    <Collapsible
      open={isOpen}
      onOpenChange={(open) => !day.isRestDay && setIsOpen(open)}
    >
      <CollapsibleTrigger asChild>
        <div
          className={cn(
            'cursor-pointer bg-muted/50 transition-colors p-3  rounded-md',
            day.isRestDay
              ? 'opacity-50 hover:bg-muted/50 cursor-default'
              : 'hover:bg-muted/70',
          )}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {
                checkIcons[
                  day.completedAt
                    ? 'completed'
                    : day.isRestDay
                      ? 'rest'
                      : 'planned'
                ]
              }
              <div>
                <CardTitle className="text-base font-medium">
                  {dayNames[day.dayOfWeek]}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  {day.isRestDay ? (
                    <Badge variant="secondary" size="sm">
                      Rest Day
                    </Badge>
                  ) : (
                    <>
                      <Badge variant="outline" size="sm">
                        {day.workoutType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {day.exercises.length} exercises
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {day.completedAt && (
                <p className="text-xs text-muted-foreground">
                  Completed {formatDate(new Date(day.completedAt), 'MMM d')}
                </p>
              )}
              {!day.isRestDay && (
                <ChevronDown
                  className={cn(
                    'size-4 text-muted-foreground transition-transform',
                    isOpen && 'rotate-180',
                  )}
                />
              )}
            </div>
          </div>
        </div>
      </CollapsibleTrigger>

      <CollapsibleContent className="overflow-hidden">
        <div className="p-4">
          {day.isRestDay ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Rest day - no exercises scheduled
            </p>
          ) : (
            <div className="space-y-4 overflow-x-auto">
              {day.exercises.map((exerciseItem) => (
                <ExerciseCard
                  key={exerciseItem.id}
                  exercise={exerciseItem}
                  sharedNotes={sharedNotes}
                  shouldScroll={highlightExercise === exerciseItem.id}
                />
              ))}
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

const ExerciseCard = ({
  exercise,
  sharedNotes,
  shouldScroll,
}: {
  exercise: NonNullable<
    GQLGetClientByIdQuery['getClientActivePlan']
  >['weeks'][number]['days'][number]['exercises'][number]
  sharedNotes: SharedNote[]
  shouldScroll?: boolean
}) => {
  const hasLogs = exercise.sets.some((set) => set.log)
  const completedSets = exercise.sets.filter((set) => set.completedAt).length

  // Get all exercise IDs for this exercise (current and substituted)
  const currentExerciseIds = [exercise.id]

  // Filter notes for this specific exercise by checking if the relatedTo field matches any exercise ID
  const exerciseNotes = sharedNotes.filter(
    (note) => note.relatedTo && currentExerciseIds.includes(note.relatedTo),
  )

  // Scroll to this exercise if it should be highlighted
  useEffect(() => {
    if (shouldScroll) {
      // Delay scroll to ensure DOM is ready after tab/collapsible animations
      setTimeout(() => {
        const element = document.getElementById(`exercise-${exercise.id}`)
        element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 300)
    }
  }, [shouldScroll, exercise.id])

  return (
    <div
      id={`exercise-${exercise.id}`}
      className="space-y-3 bg-card-on-card rounded-md p-4"
    >
      {/* Exercise Header */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-sm">{exercise.name}</h4>
        <div className="flex items-center gap-2">
          {exerciseNotes.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400">
              <MessageSquare className="size-3" />
              <span>{exerciseNotes.length}</span>
            </div>
          )}
          {hasLogs && (
            <span className="text-xs text-muted-foreground">
              {completedSets}/{exercise.sets.length}
            </span>
          )}
          <Badge
            variant={hasLogs ? 'primary' : 'outline'}
            className="text-xs h-5"
          >
            {hasLogs ? 'Completed' : 'Planned'}
          </Badge>
        </div>
      </div>

      {/* Client Notes Section */}
      {exerciseNotes.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-xs font-medium text-muted-foreground">
            Client Notes:
          </h5>
          {exerciseNotes.map((note) => (
            <ClientNoteWithReplies key={note.id} note={note} />
          ))}
        </div>
      )}

      {/* Sets Table */}
      <div className="space-y-1 max-w-max overflow-x-auto min-w-max">
        {/* Header */}
        <div className="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 text-xs text-muted-foreground font-medium pb-2">
          <div className="w-8">Set</div>
          <div className="text-center w-32">Reps</div>
          <div className="text-center w-32">Weight (kg)</div>
          <div className="text-center w-32">RPE</div>
        </div>

        {/* Sets Data */}
        {exercise.sets.map((set) => {
          const isCompleted = set.completedAt
          const log = set.log

          return (
            <div
              key={set.id}
              className="grid grid-cols-[auto_1fr_1fr_1fr] gap-2 text-sm"
            >
              {/* Set Number */}
              <div className="flex items-center gap-1">
                <span className="font-medium w-8">{set.order}</span>
                {isCompleted && (
                  <CheckCircle className="size-3 text-green-600" />
                )}
              </div>

              {/* Reps - Target */}
              <SetLog
                logValue={log?.reps}
                targetValue={
                  set.minReps && set.maxReps
                    ? `${set.minReps}-${set.maxReps}`
                    : set.reps
                }
              />
              {/* Weight - Target */}
              <SetLog logValue={log?.weight} targetValue={set.weight} />

              {/* RPE - Target */}
              <SetLog logValue={log?.rpe} targetValue={set.rpe} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Component to handle individual client notes with replies
function ClientNoteWithReplies({ note }: { note: SharedNote }) {
  const [showReplies, setShowReplies] = useState(false)
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
    <div className="space-y-2">
      {/* Original Note */}
      <div className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded border-l-2 border-blue-500">
        <p className="text-muted-foreground whitespace-pre-wrap text-sm">
          {note.text}
        </p>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground/70">
            {new Date(note.createdAt).toLocaleDateString('en-GB', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <div className="flex items-center gap-2">
            {replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
                className="h-6 px-2 text-xs"
              >
                <Reply className="size-3 mr-1" />
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
              className="h-6 px-2 text-xs"
            >
              <Reply className="size-3 mr-1" />
              Reply
            </Button>
          </div>
        </div>
      </div>

      {/* Replies */}
      {showReplies && replies.length > 0 && (
        <div className="ml-4 space-y-2">
          {replies.map((reply: NoteReply) => (
            <div
              key={reply.id}
              className="bg-gray-50 dark:bg-gray-900/20 p-2 rounded border-l-2 border-gray-300"
            >
              <p className="text-muted-foreground whitespace-pre-wrap text-xs">
                {reply.text}
              </p>
              <div className="flex items-center justify-between mt-1">
                <p className="text-xs text-muted-foreground/70">
                  {reply.createdBy.firstName} {reply.createdBy.lastName} •{' '}
                  {new Date(reply.createdAt).toLocaleDateString('en-GB', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
                <Badge variant="outline" size="sm" className="text-xs">
                  {reply.createdBy.role === 'TRAINER' ? 'Trainer' : 'Client'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Form */}
      {isReplying && (
        <div className="ml-4 space-y-2">
          <Textarea
            id={`reply-${note.id}`}
            placeholder="Write your reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="min-h-[80px] text-sm"
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsReplying(false)
                setReplyText('')
              }}
              disabled={isCreatingReply}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleCreateReply}
              disabled={!replyText.trim() || isCreatingReply}
              loading={isCreatingReply}
            >
              <Send className="size-3 mr-1" />
              Send Reply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function SetLog({
  logValue,
  targetValue,
}: {
  logValue?: string | number | null
  targetValue?: string | number | null
}) {
  return (
    <div className="grid grid-cols-2 text-center bg-muted rounded-md">
      <div className="border-r border-muted-foreground/20 px-2 py-1">
        <span className="font-medium text-foreground">{logValue}</span>
      </div>
      <div className="px-2 py-1">
        <span className="text-xs text-muted-foreground">{targetValue}</span>
      </div>
    </div>
  )
}
