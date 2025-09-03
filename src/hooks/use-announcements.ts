import { useEffect, useState } from 'react'

import { announcements } from '@/constants/announcements'

const DISMISSED_ANNOUNCEMENTS_KEY = 'hypertro-dismissed-announcements'

export function useAnnouncements() {
  const [dismissedIds, setDismissedIds] = useState<string[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load dismissed announcements from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(DISMISSED_ANNOUNCEMENTS_KEY)
      const dismissed = stored ? JSON.parse(stored) : []
      setDismissedIds(dismissed)
    } catch {
      setDismissedIds([])
    } finally {
      setIsLoaded(true)
    }
  }, [])

  // Get the latest announcement that hasn't been dismissed
  const currentAnnouncement = isLoaded
    ? announcements
        .filter((announcement) => !dismissedIds.includes(announcement.id))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )[0] || null
    : null

  const dismissAnnouncement = (id: string) => {
    const newDismissedIds = [...dismissedIds, id]
    setDismissedIds(newDismissedIds)

    try {
      localStorage.setItem(
        DISMISSED_ANNOUNCEMENTS_KEY,
        JSON.stringify(newDismissedIds),
      )
    } catch {
      // localStorage failed, but continue with in-memory state
    }
  }

  return {
    currentAnnouncement,
    dismissAnnouncement,
    isLoaded,
  }
}
