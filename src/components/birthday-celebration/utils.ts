const STORAGE_KEY = 'birthday-celebration-dismissed-2025'

export function isCelebrationDate(): boolean {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const date = now.getDate()

  return (
    year === 2025 &&
    month === 10 && // November is month 10 (0-indexed)
    (date === 7 || date === 8)
  )
}

export function isCelebrationDismissed(): boolean {
  if (typeof window === 'undefined') return true

  try {
    return localStorage.getItem(STORAGE_KEY) === 'true'
  } catch {
    return true
  }
}

export function dismissCelebration(): void {
  if (typeof window === 'undefined') return

  try {
    localStorage.setItem(STORAGE_KEY, 'true')
  } catch (error) {
    console.error('Failed to save dismissal state:', error)
  }
}

export function shouldShowCelebration(userEmail: string): boolean {
  return (
    userEmail === 'dawidkowalczyk1990@gmail.com' &&
    isCelebrationDate() &&
    !isCelebrationDismissed()
  )
}
