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
