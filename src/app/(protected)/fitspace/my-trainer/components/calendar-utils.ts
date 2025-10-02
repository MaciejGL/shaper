import { format } from 'date-fns'

interface MeetingDetails {
  title: string
  description?: string | null
  scheduledAt: string
  duration: number
  address?: string | null
  meetingLink?: string | null
  locationType: string
}

export function generateGoogleCalendarUrl(meeting: MeetingDetails): string {
  const startDate = new Date(meeting.scheduledAt)
  const endDate = new Date(startDate.getTime() + meeting.duration * 60000)

  const formatDate = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss")
  }

  const location =
    meeting.locationType === 'VIRTUAL'
      ? meeting.meetingLink || 'Virtual Meeting'
      : meeting.address || ''

  const description = [
    meeting.description || '',
    meeting.locationType === 'VIRTUAL' && meeting.meetingLink
      ? `\n\nJoin meeting: ${meeting.meetingLink}`
      : '',
  ]
    .filter(Boolean)
    .join('')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: meeting.title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    details: description,
    location: location,
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function generateICalFile(meeting: MeetingDetails): string {
  const startDate = new Date(meeting.scheduledAt)
  const endDate = new Date(startDate.getTime() + meeting.duration * 60000)

  const formatDate = (date: Date) => {
    return format(date, "yyyyMMdd'T'HHmmss'Z'")
  }

  const location =
    meeting.locationType === 'VIRTUAL'
      ? meeting.meetingLink || 'Virtual Meeting'
      : meeting.address || ''

  const description = [
    meeting.description || '',
    meeting.locationType === 'VIRTUAL' && meeting.meetingLink
      ? `\\n\\nJoin meeting: ${meeting.meetingLink}`
      : '',
  ]
    .filter(Boolean)
    .join('')
    .replace(/\n/g, '\\n')

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Hypertro//Meeting//EN',
    'BEGIN:VEVENT',
    `DTSTART:${formatDate(startDate)}`,
    `DTEND:${formatDate(endDate)}`,
    `SUMMARY:${meeting.title}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  return icsContent
}

export function downloadICalFile(meeting: MeetingDetails) {
  const icsContent = generateICalFile(meeting)
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${meeting.title.replace(/[^a-z0-9]/gi, '_')}.ics`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(link.href)
}

export function addToCalendar(meeting: MeetingDetails) {
  // Try to detect the user's platform and provide the best option
  const userAgent = navigator.userAgent.toLowerCase()
  const isAppleDevice = /iphone|ipad|ipod|mac/.test(userAgent)

  if (isAppleDevice) {
    // For Apple devices, download .ics file
    downloadICalFile(meeting)
  } else {
    // For others, open Google Calendar (most universal)
    window.open(generateGoogleCalendarUrl(meeting), '_blank')
  }
}
