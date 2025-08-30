import { Exercise } from '../types'

/**
 * Gets a display name for the creator of an exercise
 * @param creator - The creator object from the exercise
 * @returns A formatted display name
 */
export function getCreatorDisplayName(creator?: Exercise['createdBy']): string {
  if (!creator) {
    return 'Unknown'
  }

  const firstName = creator.profile?.firstName
  const lastName = creator.profile?.lastName

  if (firstName && lastName) {
    return `${firstName} ${lastName}`
  }

  if (firstName) {
    return firstName
  }

  if (lastName) {
    return lastName
  }

  // Fallback to email if no name is available
  return creator.email
}

/**
 * Gets a short display name for the creator (for compact UI elements)
 * @param creator - The creator object from the exercise
 * @returns A short formatted display name
 */
export function getCreatorShortName(creator?: Exercise['createdBy']): string {
  if (!creator) {
    return 'Unknown'
  }

  const firstName = creator.profile?.firstName
  const lastName = creator.profile?.lastName

  if (firstName && lastName) {
    return `${firstName} ${lastName.charAt(0)}.`
  }

  if (firstName) {
    return firstName
  }

  if (lastName) {
    return lastName
  }

  // Fallback to first part of email
  return creator.email.split('@')[0]
}
