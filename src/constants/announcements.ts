export interface Announcement {
  id: string
  title: string
  content: string
  date: string // ISO date string
}

export const announcements: Announcement[] = []
