'use client'

import { useQueryClient } from '@tanstack/react-query'
import { format } from 'date-fns'
import {
  Calendar,
  CheckCircle2,
  Clock,
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
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  GQLGetTraineeMeetingsQuery,
  GQLMeetingStatus,
  useCancelMeetingMutation,
  useGetTraineeMeetingsQuery,
  useUpdateMeetingMutation,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

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
  const queryClient = useQueryClient()
  const { openModal } = useConfirmationModalContext()

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

  return (
    <Card borderless className={cn(isPast && 'opacity-75')}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold">{meeting.title}</h4>
              <Badge
                variant="secondary"
                className={cn('text-xs', STATUS_COLORS[meeting.status])}
              >
                {meeting.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {MEETING_TYPE_LABELS[meeting.type]}
            </p>
          </div>

          {/* Action Buttons */}
          {isUpcoming && meeting.status !== 'CANCELLED' && (
            <div className="flex gap-2">
              {meeting.status === 'COMPLETED' ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleReopen}
                  disabled={isUpdating}
                  iconStart={<RotateCcw className="h-4 w-4" />}
                >
                  Undo
                </Button>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleComplete}
                    disabled={isUpdating}
                    iconStart={<CheckCircle2 className="h-4 w-4" />}
                  >
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isUpdating}
                    iconStart={<XCircle className="h-4 w-4" />}
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Date & Time */}

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span>{format(meetingDate, 'EEEE, MMMM d, yyyy')}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span>
            {format(meetingDate, 'h:mm a')} • {meeting.duration} minutes
          </span>
        </div>

        {/* Location */}
        {meeting.locationType === 'VIRTUAL' && meeting.meetingLink && (
          <div className="flex items-center gap-2 text-sm">
            <Video className="h-4 w-4 text-muted-foreground" />
            <a
              href={meeting.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Join Virtual Meeting
            </a>
          </div>
        )}

        {meeting.locationType !== 'VIRTUAL' && meeting.address && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(meeting.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              {meeting.address}
            </a>
          </div>
        )}

        {/* Description */}
        {meeting.description && (
          <p className="text-sm text-muted-foreground mt-2">
            {meeting.description}
          </p>
        )}

        {/* Notes */}
        {meeting.notes && (
          <div className="mt-3 p-3 bg-muted/50 rounded-md">
            <p className="text-xs font-medium mb-1">Notes:</p>
            <p className="text-sm whitespace-pre-wrap">{meeting.notes}</p>
          </div>
        )}

        {/* Linked Service */}
        {meeting.serviceDelivery && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-xs text-muted-foreground">
              Linked to: {meeting.serviceDelivery.packageName}
              {meeting.serviceTask && ` • ${meeting.serviceTask.title}`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
