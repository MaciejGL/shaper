'use client'

import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import {
  Calendar,
  CalendarPlus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit,
  MapPin,
  Plus,
  UserCheck,
  Video,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import { Loader } from '@/components/loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  GQLGetTraineeMeetingsQuery,
  GQLMeetingStatus,
  useCancelMeetingMutation,
  useGetTraineeMeetingsQuery,
  useUpdateMeetingMutation,
} from '@/generated/graphql-client'
import { useTimeFormatting } from '@/hooks/use-time-formatting'
import { cn } from '@/lib/utils'
import { addToCalendar } from '@/utils/calendar-utils'

import { EditMeetingModal } from './edit-meeting-modal'
import { ScheduleMeetingModal } from './schedule-meeting-modal'

type Meeting = NonNullable<
  GQLGetTraineeMeetingsQuery['getTraineeMeetings']
>[number]

interface ClientMeetingsDashboardProps {
  clientId: string
  clientName: string
}

const MEETING_TYPE_LABELS = {
  INITIAL_CONSULTATION: 'Initial Consultation',
  IN_PERSON_TRAINING: 'In-Person Training',
  CHECK_IN: 'Check-In',
  PLAN_REVIEW: 'Plan Review',
}

export function ClientMeetingsDashboard({
  clientId,
  clientName,
}: ClientMeetingsDashboardProps) {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  const { data, isLoading, refetch } = useGetTraineeMeetingsQuery(
    { traineeId: clientId },
    { refetchOnWindowFocus: false },
  )

  const meetings = data?.getTraineeMeetings || []
  const now = new Date()

  // Separate meetings
  const upcomingMeetings = meetings
    .filter(
      (m) =>
        new Date(m.scheduledAt) >= now &&
        m.status !== 'CANCELLED' &&
        m.status !== 'COMPLETED',
    )
    .sort(
      (a, b) =>
        new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime(),
    )

  const pastMeetings = meetings
    .filter(
      (m) =>
        new Date(m.scheduledAt) < now ||
        m.status === 'COMPLETED' ||
        m.status === 'CANCELLED',
    )
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    )

  // Stats
  const nextMeeting = upcomingMeetings[0]
  const completedCount = meetings.filter(
    (m) => m.status === GQLMeetingStatus.Completed,
  ).length
  const upcomingCount = upcomingMeetings.length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader />
        <span className="ml-3 text-gray-600">Loading meetings...</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 @3xl/client-detail-page:grid-cols-[3fr_2fr] gap-6">
      {/* Left Column: Meetings List */}
      <div className="space-y-6">
        <MeetingsListSection
          meetings={meetings}
          upcomingMeetings={upcomingMeetings}
          pastMeetings={pastMeetings}
          clientId={clientId}
          clientName={clientName}
          onRefetch={refetch}
          onSchedule={() => setIsScheduleModalOpen(true)}
        />
      </div>

      {/* Right Column: Stats & Actions */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage meetings with {clientName}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsScheduleModalOpen(true)}
              iconStart={<Plus />}
              className="w-full"
            >
              Schedule New Meeting
            </Button>
          </CardContent>
        </Card>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Meeting Stats</CardTitle>
            <CardDescription>Overview of all meetings</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Calendar className="size-4 text-muted-foreground" />
                Upcoming
              </div>
              <span className="text-base font-semibold">{upcomingCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="size-4 text-muted-foreground" />
                Completed
              </div>
              <span className="text-base font-semibold">{completedCount}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <UserCheck className="size-4 text-muted-foreground" />
                Total
              </div>
              <span className="text-base font-semibold">{meetings.length}</span>
            </div>
          </CardContent>
        </Card>

        {/* Next Meeting Card */}
        {nextMeeting && (
          <Card>
            <CardHeader>
              <CardTitle>Next Meeting</CardTitle>
              <CardDescription>
                {formatDistanceToNow(new Date(nextMeeting.scheduledAt), {
                  addSuffix: true,
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-medium text-sm">{nextMeeting.title}</p>
                <p className="text-xs text-muted-foreground">
                  {MEETING_TYPE_LABELS[nextMeeting.type]}
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="size-3.5" />
                {format(new Date(nextMeeting.scheduledAt), 'MMM d, yyyy')}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="size-3.5" />
                {format(new Date(nextMeeting.scheduledAt), 'HH:mm')} •{' '}
                {nextMeeting.duration}min
              </div>
              {nextMeeting.locationType === 'VIRTUAL' &&
                nextMeeting.meetingLink && (
                  <Button
                    size="sm"
                    variant="secondary"
                    iconStart={<Video />}
                    onClick={() =>
                      window.open(nextMeeting.meetingLink!, '_blank')
                    }
                    className="w-full"
                  >
                    Join Meeting
                  </Button>
                )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Schedule Modal */}
      <ScheduleMeetingModal
        open={isScheduleModalOpen}
        onOpenChange={setIsScheduleModalOpen}
        traineeId={clientId}
        traineeName={clientName}
      />
    </div>
  )
}

interface MeetingsListSectionProps {
  meetings: Meeting[]
  upcomingMeetings: Meeting[]
  pastMeetings: Meeting[]
  clientId: string
  clientName: string
  onRefetch: () => void
  onSchedule: () => void
}

function MeetingsListSection({
  meetings,
  upcomingMeetings,
  pastMeetings,
  clientId,
  clientName,
  onRefetch,
  onSchedule,
}: MeetingsListSectionProps) {
  const [showPast, setShowPast] = useState(false)

  if (meetings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="size-10 text-muted-foreground mb-4 opacity-50" />
          <CardTitle className="text-lg mb-2">No meetings scheduled</CardTitle>
          <CardDescription className="text-center mb-4">
            Schedule your first meeting with {clientName}
          </CardDescription>
          <Button onClick={onSchedule} iconStart={<Plus />}>
            Schedule Meeting
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meetings</CardTitle>
        <CardDescription>
          All scheduled and past meetings with {clientName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Upcoming Meetings */}
        {upcomingMeetings.length > 0 && (
          <div className="space-y-3 mb-4">
            <h3 className="text-sm font-medium text-muted-foreground">
              Upcoming ({upcomingMeetings.length})
            </h3>
            {upcomingMeetings.map((meeting) => (
              <CompactMeetingCard
                key={meeting.id}
                meeting={meeting}
                clientId={clientId}
                onRefetch={onRefetch}
              />
            ))}
          </div>
        )}

        {/* Past Meetings (Collapsible) */}
        {pastMeetings.length > 0 && (
          <div className="space-y-3">
            <button
              onClick={() => setShowPast(!showPast)}
              className="flex items-center justify-between w-full text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <span>Past Meetings ({pastMeetings.length})</span>
              {showPast ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
            </button>
            {showPast && (
              <div className="space-y-3 pt-2">
                {pastMeetings.slice(0, 10).map((meeting) => (
                  <CompactMeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    clientId={clientId}
                    onRefetch={onRefetch}
                    isPast
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface CompactMeetingCardProps {
  meeting: Meeting
  clientId: string
  onRefetch: () => void
  isPast?: boolean
}

function CompactMeetingCard({
  meeting,
  clientId,
  onRefetch,
  isPast = false,
}: CompactMeetingCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const { openModal } = useConfirmationModalContext()
  const { formatTime } = useTimeFormatting()

  const updateMutation = useUpdateMeetingMutation()
  const cancelMutation = useCancelMeetingMutation()

  const meetingDate = new Date(meeting.scheduledAt)
  const isUpcoming = meetingDate >= new Date() && meeting.status !== 'CANCELLED'
  const isCompleted = meeting.status === GQLMeetingStatus.Completed
  const isCancelled = meeting.status === GQLMeetingStatus.Cancelled

  const handleComplete = async () => {
    setIsUpdating(true)
    try {
      await updateMutation.mutateAsync({
        meetingId: meeting.id,
        input: { status: GQLMeetingStatus.Completed },
      })
      onRefetch()
      toast.success('Meeting marked as completed')
    } catch {
      toast.error('Failed to update meeting')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleCancel = () => {
    openModal({
      title: 'Cancel Meeting',
      description:
        'Are you sure you want to cancel this meeting? This action cannot be undone.',
      confirmText: 'Cancel Meeting',
      cancelText: 'Keep Meeting',
      variant: 'destructive',
      onConfirm: async () => {
        setIsUpdating(true)
        try {
          await cancelMutation.mutateAsync({
            meetingId: meeting.id,
            reason: 'Cancelled by trainer',
          })
          onRefetch()
          toast.success('Meeting cancelled')
        } catch {
          toast.error('Failed to cancel meeting')
        } finally {
          setIsUpdating(false)
        }
      },
    })
  }

  const getDateBadge = () => {
    if (isToday(meetingDate)) {
      return (
        <Badge variant="warning" className="shrink-0 text-xs">
          <Clock className="size-3 mr-1" />
          Today
        </Badge>
      )
    }
    if (isTomorrow(meetingDate)) {
      return (
        <Badge variant="outline" className="shrink-0 text-xs">
          <Calendar className="size-3 mr-1" />
          Tomorrow
        </Badge>
      )
    }
    return (
      <Badge variant="outline" className="shrink-0 text-xs">
        <Calendar className="size-3 mr-1" />
        {format(meetingDate, 'MMM d')}
      </Badge>
    )
  }

  const getStatusBadge = () => {
    if (isCompleted) {
      return (
        <Badge variant="success" className="shrink-0 text-xs">
          <CheckCircle2 className="size-3 mr-1" />
          Done
        </Badge>
      )
    }
    if (isCancelled) {
      return (
        <Badge variant="destructive" className="shrink-0 text-xs">
          <XCircle className="size-3 mr-1" />
          Cancelled
        </Badge>
      )
    }
    return null
  }

  return (
    <>
      <div
        className={cn(
          'border rounded-lg transition-all',
          (isCompleted || isCancelled) && 'opacity-60 bg-muted/30',
        )}
      >
        <div className="p-3">
          <div className="flex items-start gap-3">
            {/* Status Icon */}
            <div className="pt-0.5">
              {isCompleted ? (
                <CheckCircle2 className="size-5 text-primary" />
              ) : isCancelled ? (
                <XCircle className="size-5 text-destructive" />
              ) : (
                <Clock className="size-5 text-muted-foreground" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <p
                    className={cn(
                      'font-medium text-sm',
                      (isCompleted || isCancelled) &&
                        'line-through text-muted-foreground',
                    )}
                  >
                    {meeting.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {MEETING_TYPE_LABELS[meeting.type]}
                  </p>
                </div>
                <div className="flex gap-1">
                  {!isPast && getDateBadge()}
                  {getStatusBadge()}
                </div>
              </div>

              {/* Meeting Details */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mt-2">
                <div className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatTime(meetingDate)} • {meeting.duration}min
                </div>
                {meeting.locationType === 'VIRTUAL' ? (
                  <div className="flex items-center gap-1">
                    <Video className="size-3" />
                    Virtual
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    In Person
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {isUpcoming && !isCompleted && !isCancelled && (
              <div className="flex flex-col gap-1 pl-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setIsEditModalOpen(true)}
                        disabled={isUpdating}
                        iconOnly={<Edit />}
                        className="h-7 w-7"
                      />
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={handleComplete}
                        disabled={isUpdating}
                        iconOnly={<CheckCircle2 />}
                        className="h-7 w-7"
                      />
                    </TooltipTrigger>
                    <TooltipContent>Complete</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={isUpdating}
                        iconOnly={<XCircle />}
                        className="h-7 w-7"
                      />
                    </TooltipTrigger>
                    <TooltipContent>Cancel</TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setExpanded(!expanded)}
                  className="h-7 w-7"
                  iconOnly={
                    expanded ? (
                      <ChevronUp className="size-4" />
                    ) : (
                      <ChevronDown className="size-4" />
                    )
                  }
                />
              </div>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="border-t px-3 py-3 bg-muted/30 space-y-2">
            {meeting.description && (
              <p className="text-xs text-muted-foreground">
                {meeting.description}
              </p>
            )}

            {meeting.locationType === 'VIRTUAL' && meeting.meetingLink && (
              <Button
                size="sm"
                variant="secondary"
                iconStart={<Video />}
                onClick={() => window.open(meeting.meetingLink!, '_blank')}
                className="w-full"
              >
                Join Virtual Meeting
              </Button>
            )}

            {meeting.address && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meeting.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-primary hover:underline"
              >
                <MapPin className="size-3" />
                {meeting.address}
              </a>
            )}

            <Button
              size="sm"
              variant="outline"
              iconStart={<CalendarPlus />}
              onClick={() =>
                addToCalendar({
                  title: meeting.title,
                  description: meeting.description,
                  scheduledAt: meeting.scheduledAt,
                  duration: meeting.duration,
                  address: meeting.address,
                  meetingLink: meeting.meetingLink,
                  locationType: meeting.locationType,
                })
              }
              className="w-full"
            >
              Add to Calendar
            </Button>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <EditMeetingModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        meeting={meeting}
        clientId={clientId}
      />
    </>
  )
}
