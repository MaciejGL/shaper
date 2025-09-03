import type { MessageType } from './types'

/**
 * Formats message timestamp based on how long ago it was sent
 */
export function formatMessageTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } else if (diffInHours < 48) {
    return 'Yesterday'
  } else {
    return date.toLocaleDateString()
  }
}

/**
 * Determines if messages should be grouped together (same sender, close in time)
 */
export function shouldGroupWithPrevious(
  currentMessage: MessageType,
  previousMessage: MessageType | undefined,
): boolean {
  if (!previousMessage) return false

  // Different senders = no grouping
  if (currentMessage.sender.id !== previousMessage.sender.id) return false

  // Check time difference (group if less than 2 minutes apart)
  const currentTime = new Date(currentMessage.createdAt).getTime()
  const previousTime = new Date(previousMessage.createdAt).getTime()
  const timeDiffMinutes = (currentTime - previousTime) / (1000 * 60)

  return timeDiffMinutes < 15
}

/**
 * Gets display name for a user from their profile or fallback name
 */
export function getUserDisplayName(user: {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}): string {
  if (user.firstName || user.lastName) {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim()
  }
  return user.email || 'User'
}
