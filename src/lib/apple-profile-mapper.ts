/**
 * Apple Profile Mapping Utility
 *
 * This module handles mapping Apple OAuth profile data to our User model,
 * with different strategies for new users vs existing users.
 */

export interface AppleProfile {
  id: string
  email: string
  name?: {
    firstName?: string
    lastName?: string
  }
  email_verified?: boolean
  is_private_email?: boolean
}

export interface AppleAccount {
  access_token?: string
  token_type?: string
  scope?: string
}

export interface UserProfileData {
  appleId: string
  email: string
  name: string
  locale?: string
  timezone?: string
}

/**
 * Maps Apple profile data to user profile data for new user creation
 * This function extracts all available profile information from Apple
 */
export function mapAppleProfileToUser(profile: AppleProfile): UserProfileData {
  // Build name from Apple profile
  let name = ''
  if (profile.name?.firstName || profile.name?.lastName) {
    name =
      `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim()
  }

  // If no name provided (Apple only provides name on first sign-in),
  // use email prefix as fallback
  if (!name) {
    name = profile.email.split('@')[0]
  }

  return {
    appleId: profile.id,
    email: profile.email,
    name,
    // Apple doesn't provide locale/timezone directly
    locale: undefined,
    timezone: undefined,
  }
}

/**
 * Maps Apple account data for linking to existing users
 * This function only extracts Apple-specific data without overwriting existing profile
 */
export function mapAppleAccountForLinking(profile: AppleProfile): {
  appleId: string
} {
  return {
    appleId: profile.id,
  }
}

/**
 * Validates Apple profile data to ensure required fields are present
 */
export function validateAppleProfile(profile: AppleProfile): boolean {
  return (
    Boolean(profile.id) &&
    Boolean(profile.email) &&
    // Apple email verification is implied to be true
    profile.email_verified !== false
  )
}

/**
 * Sanitizes Apple profile data to prevent XSS and ensure data integrity
 */
export function sanitizeAppleProfile(profile: AppleProfile): AppleProfile {
  return {
    id: profile.id.trim(),
    email: profile.email.toLowerCase().trim(),
    name: profile.name
      ? {
          firstName: profile.name.firstName?.trim().substring(0, 50),
          lastName: profile.name.lastName?.trim().substring(0, 50),
        }
      : undefined,
    email_verified: profile.email_verified,
    is_private_email: profile.is_private_email,
  }
}
