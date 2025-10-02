'use client'

import { Calendar, Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { useGetTraineeMeetingsQuery } from '@/generated/graphql-client'

import { MeetingList } from './meeting-list'
import { ScheduleMeetingModal } from './schedule-meeting-modal'

interface ClientMeetingsProps {
  clientId: string
  clientName: string
}

export function ClientMeetings({ clientId, clientName }: ClientMeetingsProps) {
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)

  const { data, isLoading } = useGetTraineeMeetingsQuery(
    { traineeId: clientId },
    { refetchOnWindowFocus: false },
  )

  const meetings = data?.getTraineeMeetings || []
  const now = new Date()

  // Separate upcoming and past meetings
  const upcomingMeetings = meetings.filter(
    (m) => new Date(m.scheduledAt) >= now && m.status !== 'CANCELLED',
  )
  const pastMeetings = meetings.filter(
    (m) =>
      new Date(m.scheduledAt) < now ||
      m.status === 'COMPLETED' ||
      m.status === 'CANCELLED',
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
        <div className="h-24 bg-muted animate-pulse rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Meetings</h2>
          <p className="text-sm text-muted-foreground">
            Schedule and manage meetings with {clientName}
          </p>
        </div>
        <Button
          onClick={() => setIsScheduleModalOpen(true)}
          iconStart={<Plus />}
        >
          Schedule Meeting
        </Button>
      </div>

      {/* Empty State */}
      {meetings.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <CardTitle className="text-lg mb-2">
              No meetings scheduled
            </CardTitle>
            <CardDescription className="text-center mb-4">
              Schedule your first meeting with {clientName} to get started
            </CardDescription>
            <Button
              onClick={() => setIsScheduleModalOpen(true)}
              iconStart={<Plus />}
            >
              Schedule Meeting
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Upcoming Meetings */}
      {upcomingMeetings.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Upcoming Meetings</h3>
          <MeetingList meetings={upcomingMeetings} clientId={clientId} />
        </div>
      )}

      {/* Past Meetings */}
      {pastMeetings.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-3">Past Meetings</h3>
          <MeetingList meetings={pastMeetings} clientId={clientId} isPast />
        </div>
      )}

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
