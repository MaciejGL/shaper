'use client'

import { format, isPast, isToday } from 'date-fns'
import { Calendar, CalendarPlus, Clock, MapPin, Video } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  GQLGetAllClientMeetingsQuery,
  useGetAllClientMeetingsQuery,
} from '@/generated/graphql-client'
import { useTimeFormatting } from '@/hooks/use-time-formatting'
import { cn } from '@/lib/utils'
import { addToCalendar } from '@/utils/calendar-utils'

type Meeting = NonNullable<
  GQLGetAllClientMeetingsQuery['myUpcomingMeetings']
>[number]

const STATUS_COLORS: Record<Meeting['status'], string> = {
  PENDING:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  CONFIRMED:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  RESCHEDULED:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

const MEETING_TYPE_LABELS: Record<Meeting['type'], string> = {
  INITIAL_CONSULTATION: 'Initial Consultation',
  IN_PERSON_TRAINING: 'In-Person Training',
  CHECK_IN: 'Check-In',
  PLAN_REVIEW: 'Plan Review',
}

interface AllMeetingsDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AllMeetingsDrawer({
  isOpen,
  onOpenChange,
}: AllMeetingsDrawerProps) {
  const { formatTime } = useTimeFormatting()

  const { data, isLoading } = useGetAllClientMeetingsQuery(
    {},
    {
      enabled: isOpen,
      refetchInterval: 30000,
    },
  )

  const allMeetings = data?.myUpcomingMeetings || []

  // Separate meetings into upcoming and past (today's meetings are in upcoming)
  const upcomingMeetings = allMeetings.filter((meeting) => {
    const meetingDate = new Date(meeting.scheduledAt)
    return isToday(meetingDate) || !isPast(meetingDate)
  })
  const pastMeetings = allMeetings
    .filter((meeting) => {
      const meetingDate = new Date(meeting.scheduledAt)
      return !isToday(meetingDate) && isPast(meetingDate)
    })
    .sort(
      (a, b) =>
        new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
    )

  const renderMeeting = (meeting: Meeting) => {
    const meetingDate = new Date(meeting.scheduledAt)
    const isPastMeeting = !isToday(meetingDate) && isPast(meetingDate)

    // Determine status label: show "Upcoming" for future PENDING/CONFIRMED meetings
    const getStatusDisplay = () => {
      const now = new Date()
      if (
        meetingDate > now &&
        (meeting.status === 'PENDING' || meeting.status === 'CONFIRMED')
      ) {
        return 'Upcoming'
      }
      return meeting.status
    }

    const statusLabel = getStatusDisplay()

    return (
      <Card
        key={meeting.id}
        borderless
        className={cn('p-3 bg-card-on-card', isPastMeeting && 'opacity-60')}
      >
        <CardContent className="space-y-2 p-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-semibold text-sm truncate">
                  {meeting.title}
                </h4>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs shrink-0 capitalize ml-auto',
                    STATUS_COLORS[meeting.status],
                  )}
                >
                  {statusLabel.toLowerCase()}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {MEETING_TYPE_LABELS[meeting.type]}
              </p>
            </div>
          </div>

          {/* Date & Time */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs">
                {format(meetingDate, 'MMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs">
                {formatTime(meetingDate)} • {meeting.duration}min
              </span>
            </div>
          </div>

          {/* Location */}
          {meeting.locationType === 'VIRTUAL' && meeting.meetingLink && (
            <div className="flex items-center gap-1.5 text-sm">
              <Video className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-xs text-muted-foreground truncate">
                Virtual Meeting
              </span>
            </div>
          )}

          {meeting.locationType !== 'VIRTUAL' && meeting.address && (
            <div className="flex items-center gap-1.5 text-sm">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meeting.address)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline truncate"
              >
                {meeting.address}
              </a>
            </div>
          )}

          {/* Description */}
          {meeting.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {meeting.description}
            </p>
          )}
        </CardContent>

        {!isPastMeeting && (
          <CardFooter className="gap-2 p-3 pt-0">
            {/* Add to Calendar Button */}
            <Button
              size="sm"
              variant="tertiary"
              className="flex-1"
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
            >
              Add to Calendar
            </Button>
            {/* Join Button for Virtual Meetings */}
            {meeting.locationType === 'VIRTUAL' && meeting.meetingLink && (
              <Button
                size="sm"
                variant="default"
                className="flex-1"
                iconStart={<Video />}
                onClick={() => window.open(meeting.meetingLink!, '_blank')}
              >
                Join
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    )
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]" dialogTitle="All Meetings">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            All Meetings ({allMeetings.length})
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              Loading meetings...
            </div>
          ) : allMeetings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No meetings found.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Upcoming Meetings */}
              {upcomingMeetings.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">
                    Upcoming ({upcomingMeetings.length})
                  </h3>
                  <div className="space-y-2">
                    {upcomingMeetings.map(renderMeeting)}
                  </div>
                </div>
              )}

              {/* Past Meetings */}
              {pastMeetings.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">
                    Past ({pastMeetings.length})
                  </h3>
                  <div className="space-y-2">
                    {pastMeetings.map(renderMeeting)}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
