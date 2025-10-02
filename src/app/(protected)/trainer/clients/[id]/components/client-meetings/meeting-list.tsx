'use client'

import { GQLGetTraineeMeetingsQuery } from '@/generated/graphql-client'

import { MeetingCard } from './meeting-card'

type Meeting = NonNullable<
  GQLGetTraineeMeetingsQuery['getTraineeMeetings']
>[number]

interface MeetingListProps {
  meetings: Meeting[]
  clientId: string
  isPast?: boolean
}

export function MeetingList({
  meetings,
  clientId,
  isPast = false,
}: MeetingListProps) {
  return (
    <div className="space-y-3">
      {meetings.map((meeting) => (
        <MeetingCard
          key={meeting.id}
          meeting={meeting}
          clientId={clientId}
          isPast={isPast}
        />
      ))}
    </div>
  )
}
