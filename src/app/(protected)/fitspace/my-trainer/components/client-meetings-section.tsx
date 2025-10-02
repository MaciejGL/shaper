'use client'

import { format, isPast } from 'date-fns'
import { Calendar, CalendarPlus, Clock, MapPin, Video } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  GQLGetMyMeetingsQuery,
  useGetMyMeetingsQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { AllMeetingsDrawer } from './all-meetings-modal'
import { addToCalendar } from './calendar-utils'

type Meeting = NonNullable<GQLGetMyMeetingsQuery['myUpcomingMeetings']>[number]

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

export function ClientMeetingsSection() {
  const [showAllMeetings, setShowAllMeetings] = useState(false)

  const { data, isLoading } = useGetMyMeetingsQuery(
    {},
    {
      refetchInterval: 30000, // Refresh every 30 seconds
    },
  )

  const allMeetings = data?.myUpcomingMeetings || []

  // Show meetings that are upcoming OR past but not completed/cancelled
  const meetings = allMeetings.filter((meeting) => {
    const meetingDate = new Date(meeting.scheduledAt)
    const isUpcoming = !isPast(meetingDate)
    const isActive =
      meeting.status !== 'COMPLETED' && meeting.status !== 'CANCELLED'

    // Show if upcoming, or if past but still pending/confirmed
    return isUpcoming || isActive
  })

  if (isLoading) {
    return (
      <Card borderless>
        <CardHeader>
          <CardTitle className="text-base">Scheduled Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading meetings...</p>
        </CardContent>
      </Card>
    )
  }

  if (meetings.length === 0) {
    return (
      <Card borderless>
        <CardHeader>
          <CardTitle className="text-base">Scheduled Meetings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No upcoming meetings scheduled with your trainer.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card borderless>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            Scheduled Meetings
            <Button
              variant="ghost"
              size="xs"
              className="ml-auto"
              onClick={() => setShowAllMeetings(true)}
            >
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {meetings.map((meeting: Meeting) => {
            const meetingDate = new Date(meeting.scheduledAt)

            return (
              <Card
                key={meeting.id}
                borderless
                className={cn('p-3 bg-card-on-card')}
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
                          {meeting.status.toLowerCase()}
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
                        {format(meetingDate, 'h:mm a')} • {meeting.duration}min
                      </span>
                    </div>
                  </div>

                  {/* Location */}
                  {meeting.locationType === 'VIRTUAL' &&
                    meeting.meetingLink && (
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

                <CardFooter className="gap-2 p-0">
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
                  {meeting.locationType === 'VIRTUAL' &&
                    meeting.meetingLink && (
                      <Button
                        size="sm"
                        variant="default"
                        className="flex-1"
                        iconStart={<Video />}
                        onClick={() =>
                          window.open(meeting.meetingLink!, '_blank')
                        }
                      >
                        Join
                      </Button>
                    )}
                </CardFooter>
              </Card>
            )
          })}
        </CardContent>
      </Card>

      <AllMeetingsDrawer
        isOpen={showAllMeetings}
        onOpenChange={setShowAllMeetings}
      />
    </>
  )
}
