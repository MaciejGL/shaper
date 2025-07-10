/**
 * Get user display name from firstName, lastName, and email
 */
export function getUserDisplayName(user: {
  firstName?: string | null
  lastName?: string | null
  email: string
}): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  if (user.firstName) {
    return user.firstName
  }
  if (user.lastName) {
    return user.lastName
  }
  return user.email
}

/**
 * Get user display name from firstName, lastName, and email with fallback for optional email
 */
export function getDisplayName(user: {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`
  }
  if (user.firstName) {
    return user.firstName
  }
  if (user.lastName) {
    return user.lastName
  }
  if (user.email) {
    return user.email
  }
  return 'Unknown User'
}

/**
 * Get user initials from firstName, lastName, and email
 */
export function getUserInitials(user: {
  firstName?: string | null
  lastName?: string | null
  email?: string | null
}): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }
  if (user.firstName) {
    return user.firstName[0].toUpperCase()
  }
  if (user.lastName) {
    return user.lastName[0].toUpperCase()
  }
  if (user.email) {
    return user.email[0].toUpperCase()
  }
  return 'U'
}
