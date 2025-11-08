import { useEffect, useState } from 'react'

const CHECKIN_SETUP_DISMISSED_KEY = 'checkin-setup-dismissed'
const CHECKIN_DISMISSED_EVENT = 'checkin-dismissed'

export function useCheckinDismissal() {
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(CHECKIN_SETUP_DISMISSED_KEY)
    setIsDismissed(dismissed === 'true')

    const handleDismissChange = () => {
      const dismissed = localStorage.getItem(CHECKIN_SETUP_DISMISSED_KEY)
      setIsDismissed(dismissed === 'true')
    }

    window.addEventListener(CHECKIN_DISMISSED_EVENT, handleDismissChange)
    return () => {
      window.removeEventListener(CHECKIN_DISMISSED_EVENT, handleDismissChange)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(CHECKIN_SETUP_DISMISSED_KEY, 'true')
    setIsDismissed(true)
    window.dispatchEvent(new Event(CHECKIN_DISMISSED_EVENT))
  }

  const undismiss = () => {
    localStorage.removeItem(CHECKIN_SETUP_DISMISSED_KEY)
    setIsDismissed(false)
    window.dispatchEvent(new Event(CHECKIN_DISMISSED_EVENT))
  }

  return { isDismissed, dismiss, undismiss }
}
