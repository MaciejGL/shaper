/**
 * Google Profile Mapping Utility
 *
 * This module handles mapping Google OAuth profile data to our User model,
 * with different strategies for new users vs existing users.
 */

export interface GoogleProfile {
  id: string
  email: string
  name: string
  picture: string
  given_name?: string
  family_name?: string
  locale?: string
  verified_email?: boolean
  hd?: string // Hosted domain for G Suite users
}

export interface GoogleAccount {
  access_token?: string
  refresh_token?: string
  expires_at?: number
  token_type?: string
  scope?: string
}

export interface UserProfileData {
  googleId: string
  email: string
  name: string
  image: string
  locale?: string
  timezone?: string
}

export interface GoogleTokenData {
  googleId: string
  googleAccessToken?: string
  googleRefreshToken?: string
}

/**
 * Maps Google profile data to user profile data for new user creation
 * This function extracts all available profile information from Google
 */
export function mapGoogleProfileToUser(
  profile: GoogleProfile,
  account: GoogleAccount,
): UserProfileData & GoogleTokenData {
  return {
    googleId: profile.id,
    email: profile.email,
    name:
      profile.name ||
      `${profile.given_name || ''} ${profile.family_name || ''}`.trim() ||
      profile.email,
    image: profile.picture,
    locale: profile.locale,
    // Note: Google doesn't provide timezone directly, we could derive it from locale
    // or implement client-side timezone detection in the future
    timezone: deriveTimezoneFromLocale(profile.locale),
    googleAccessToken: account.access_token,
    googleRefreshToken: account.refresh_token,
  }
}

/**
 * Maps Google account data for linking to existing users
 * This function only extracts Google-specific data without overwriting existing profile
 */
export function mapGoogleAccountForLinking(
  profile: GoogleProfile,
  account: GoogleAccount,
): GoogleTokenData {
  return {
    googleId: profile.id,
    googleAccessToken: account.access_token,
    googleRefreshToken: account.refresh_token,
  }
}

/**
 * Validates that the Google profile contains required fields
 */
export function validateGoogleProfile(profile: GoogleProfile): boolean {
  return !!(
    profile.id &&
    profile.email &&
    profile.name &&
    profile.verified_email !== false // Allow undefined, but not false
  )
}

/**
 * Sanitizes Google profile data to prevent XSS and ensure data integrity
 */
export function sanitizeGoogleProfile(profile: GoogleProfile): GoogleProfile {
  return {
    id: profile.id.trim(),
    email: profile.email.toLowerCase().trim(),
    name: profile.name.trim().substring(0, 100), // Limit name length
    picture: profile.picture.trim(),
    given_name: profile.given_name?.trim().substring(0, 50),
    family_name: profile.family_name?.trim().substring(0, 50),
    locale: profile.locale?.trim().substring(0, 10),
    verified_email: profile.verified_email,
    hd: profile.hd?.trim().substring(0, 100),
  }
}

/**
 * Derives a timezone from locale if available
 * This is a basic implementation - in production you might want a more sophisticated mapping
 */
function deriveTimezoneFromLocale(locale?: string): string | undefined {
  if (!locale) return undefined

  // Basic locale to timezone mapping
  const localeTimezoneMap: Record<string, string> = {
    'en-US': 'America/New_York',
    'en-GB': 'Europe/London',
    'en-CA': 'America/Toronto',
    'en-AU': 'Australia/Sydney',
    'de-DE': 'Europe/Berlin',
    'fr-FR': 'Europe/Paris',
    'es-ES': 'Europe/Madrid',
    'it-IT': 'Europe/Rome',
    'ja-JP': 'Asia/Tokyo',
    'ko-KR': 'Asia/Seoul',
    'zh-CN': 'Asia/Shanghai',
    'pt-BR': 'America/Sao_Paulo',
    'ru-RU': 'Europe/Moscow',
    'ar-SA': 'Asia/Riyadh',
    'hi-IN': 'Asia/Kolkata',
  }

  return localeTimezoneMap[locale] || localeTimezoneMap[locale.split('-')[0]]
}

/**
 * Extracts the user's preferred language from locale
 */
export function extractLanguageFromLocale(locale?: string): string {
  if (!locale) return 'en'
  return locale.split('-')[0].toLowerCase()
}

/**
 * Checks if the Google profile picture URL is valid and accessible
 */
export function isValidGoogleProfilePicture(pictureUrl: string): boolean {
  try {
    const url = new URL(pictureUrl)
    return (
      url.protocol === 'https:' &&
      (url.hostname.includes('googleusercontent.com') ||
        url.hostname.includes('googleapis.com'))
    )
  } catch {
    return false
  }
}

/**
 * Gets the highest resolution version of Google profile picture
 */
export function getHighResGoogleProfilePicture(pictureUrl: string): string {
  if (!isValidGoogleProfilePicture(pictureUrl)) {
    return pictureUrl
  }

  // Google profile pictures can be resized by modifying the URL
  // Remove size parameters and add high resolution parameter
  return pictureUrl.replace(/=s\d+-c/, '=s400-c') // 400px is a good high-res size
}
