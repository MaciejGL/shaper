'use client'

import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  Calendar,
  CalendarPlus,
  CheckCircle2,
  Clock,
  Edit,
  MapPin,
  RotateCcw,
  Video,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
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

type Meeting = NonNullable<
  GQLGetTraineeMeetingsQuery['getTraineeMeetings']
>[number]

interface MeetingCardProps {
  meeting: Meeting
  clientId: string
  isPast?: boolean
}

const STATUS_COLORS = {
  PENDING:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  CONFIRMED:
    'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  COMPLETED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  RESCHEDULED:
    'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
}

const MEETING_TYPE_LABELS = {
  INITIAL_CONSULTATION: 'Initial Consultation',
  IN_PERSON_TRAINING: 'In-Person Training',
  CHECK_IN: 'Check-In',
  PLAN_REVIEW: 'Plan Review',
}

export function MeetingCard({
  meeting,
  clientId,
  isPast = false,
}: MeetingCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const queryClient = useQueryClient()
  const { openModal } = useConfirmationModalContext()
  const { formatTime } = useTimeFormatting()

  const updateMutation = useUpdateMeetingMutation()
  const cancelMutation = useCancelMeetingMutation()

  const queryKey = useGetTraineeMeetingsQuery.getKey({ traineeId: clientId })

  const handleComplete = async () => {
    setIsUpdating(true)
    try {
      await updateMutation.mutateAsync({
        meetingId: meeting.id,
        input: { status: GQLMeetingStatus.Completed },
      })
      await queryClient.invalidateQueries({ queryKey })
      toast.success('Meeting marked as completed')
    } catch (error) {
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
          await queryClient.invalidateQueries({ queryKey })
          toast.success('Meeting cancelled')
        } catch (error) {
          toast.error('Failed to cancel meeting')
        } finally {
          setIsUpdating(false)
        }
      },
    })
  }

  const handleReopen = async () => {
    setIsUpdating(true)
    try {
      await updateMutation.mutateAsync({
        meetingId: meeting.id,
        input: { status: GQLMeetingStatus.Pending },
      })
      await queryClient.invalidateQueries({ queryKey })
      toast.success('Meeting reopened')
    } catch (error) {
      toast.error('Failed to reopen meeting')
    } finally {
      setIsUpdating(false)
    }
  }

  const meetingDate = new Date(meeting.scheduledAt)
  const isUpcoming = meetingDate >= new Date() && meeting.status !== 'CANCELLED'

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
    <>
      <Card className={cn('py-3', isPast && 'opacity-75')}>
        <CardContent className="space-y-2">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h4 className="font-semibold text-sm truncate">
                  {meeting.title}
                </h4>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs shrink-0 capitalize',
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

            {/* Action Buttons */}
            {isUpcoming && meeting.status !== 'CANCELLED' && (
              <div className="flex gap-1 shrink-0">
                <TooltipProvider>
                  {meeting.status === 'COMPLETED' ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon-sm"
                          variant="ghost"
                          onClick={handleReopen}
                          disabled={isUpdating}
                          iconOnly={<RotateCcw />}
                        />
                      </TooltipTrigger>
                      <TooltipContent>Reopen meeting</TooltipContent>
                    </Tooltip>
                  ) : (
                    <>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => setIsEditModalOpen(true)}
                            disabled={isUpdating}
                            iconOnly={<Edit />}
                          />
                        </TooltipTrigger>
                        <TooltipContent>Edit meeting</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={handleComplete}
                            disabled={isUpdating}
                            iconOnly={<CheckCircle2 />}
                          />
                        </TooltipTrigger>
                        <TooltipContent>Mark as completed</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={handleCancel}
                            disabled={isUpdating}
                            iconOnly={<XCircle />}
                          />
                        </TooltipTrigger>
                        <TooltipContent>Cancel meeting</TooltipContent>
                      </Tooltip>
                    </>
                  )}
                </TooltipProvider>
              </div>
            )}
          </div>

          {/* Date & Time combined */}
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
              <Video className="h-3.5 w-3.5 text-muted-foreground" />
              <a
                href={meeting.meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline truncate"
              >
                Join Virtual Meeting
              </a>
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

          {/* Notes */}
          {meeting.notes && (
            <div className="p-2 bg-muted/50 rounded">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {meeting.notes}
              </p>
            </div>
          )}

          {/* Linked Service */}
          {meeting.serviceDelivery && (
            <p className="text-xs text-muted-foreground pt-1 border-t">
              {meeting.serviceDelivery.packageName}
              {meeting.serviceTask && ` • ${meeting.serviceTask.title}`}
            </p>
          )}
        </CardContent>

        {/* Footer with Add to Calendar button */}
        <CardFooter className="gap-2">
          {/* Add to Calendar Button */}
          <Button
            size="sm"
            variant="outline"
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
          {isUpcoming &&
            meeting.status !== 'CANCELLED' &&
            meeting.locationType === 'VIRTUAL' &&
            meeting.meetingLink && (
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
      </Card>

      {/* Edit Meeting Modal */}
      <EditMeetingModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        meeting={meeting}
        clientId={clientId}
      />
    </>
  )
}
