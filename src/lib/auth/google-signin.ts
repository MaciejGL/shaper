/**
 * Google OAuth Sign-in Handler
 *
 * Handles Google OAuth authentication flow including:
 * - Profile validation and mapping
 * - User creation for new users
 * - Account linking for existing users
 */
import { Account, Profile } from 'next-auth'

import { prisma } from '@/lib/db'

import {
  type GoogleProfile,
  type GoogleAccount as GoogleProfileMapperAccount,
  getHighResGoogleProfilePicture,
  mapGoogleAccountForLinking,
  mapGoogleProfileToUser,
  sanitizeGoogleProfile,
  validateGoogleProfile,
} from '../google-profile-mapper'

import { ensureQuickWorkout } from './ensure-quick-workout'
import { GoogleAccount, GoogleJWTProfile } from './types'

/**
 * Maps NextAuth Google JWT profile to our GoogleProfile interface
 */
function mapJWTProfileToGoogleProfile(
  jwtProfile: GoogleJWTProfile,
): GoogleProfile {
  return {
    id: jwtProfile.sub,
    email: jwtProfile.email,
    name: jwtProfile.name,
    picture: jwtProfile.picture,
    given_name: jwtProfile.given_name,
    family_name: jwtProfile.family_name,
    locale: jwtProfile.locale,
    verified_email: jwtProfile.email_verified,
    hd: jwtProfile.hd,
  }
}

/**
 * Maps NextAuth Google Account to our GoogleAccount interface
 */
function mapNextAuthAccountToGoogleAccount(
  account: GoogleAccount,
): GoogleProfileMapperAccount {
  return {
    access_token: account.access_token,
    refresh_token: account.refresh_token,
    expires_at: account.expires_at,
    token_type: account.token_type,
    scope: account.scope,
  }
}

/**
 * Handles Google OAuth sign-in process
 *
 * @param account - NextAuth account object from Google OAuth
 * @param profile - NextAuth profile object from Google JWT
 * @returns Promise<boolean> - true if sign-in successful, false otherwise
 */
export async function handleGoogleSignIn(
  account: Account,
  profile: Profile,
): Promise<boolean> {
  try {
    // Type-safe casting with validation
    const jwtProfile = profile as GoogleJWTProfile
    const googleAccount = account as GoogleAccount

    // Validate required fields
    if (!jwtProfile.sub || !jwtProfile.email || !jwtProfile.name) {
      console.error('Missing required Google profile fields:', {
        sub: !!jwtProfile.sub,
        email: !!jwtProfile.email,
        name: !!jwtProfile.name,
      })
      return false
    }

    // Map JWT profile to our GoogleProfile interface
    const googleProfile = mapJWTProfileToGoogleProfile(jwtProfile)

    // Validate and sanitize Google profile data
    if (!validateGoogleProfile(googleProfile)) {
      console.error('Invalid Google profile data:', googleProfile)
      return false
    }

    const sanitizedProfile = sanitizeGoogleProfile(googleProfile)
    const mappedAccount = mapNextAuthAccountToGoogleAccount(googleAccount)

    // Check if user already exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedProfile.email },
    })

    if (existingUser) {
      // Link Google account to existing user WITHOUT overwriting profile data
      await prisma.user.update({
        where: { id: existingUser.id },
        data: mapGoogleAccountForLinking(sanitizedProfile, mappedAccount),
      })

      console.info(
        `Linked Google account to existing user: ${existingUser.email}`,
      )
      return true
    } else {
      // Create new user with full Google profile data
      const newUserData = mapGoogleProfileToUser(
        sanitizedProfile,
        mappedAccount,
      )

      // Enhance profile picture with high resolution version
      if (newUserData.image) {
        newUserData.image = getHighResGoogleProfilePicture(newUserData.image)
      }

      // Create User and UserProfile together in a transaction
      const newUser = await prisma.user.create({
        data: {
          ...newUserData,
          role: 'CLIENT', // Default role for new users
          profile: {
            create: {
              firstName: sanitizedProfile.given_name || '',
              lastName: sanitizedProfile.family_name || '',
              timezone: newUserData.timezone,
              avatarUrl: newUserData.image,
            },
          },
        },
      })

      console.info(
        `Created new user with profile from Google OAuth: ${newUser.email}`,
      )

      // Create Quick Workout plan for new user in background
      ensureQuickWorkout(newUser.id).catch((err) =>
        console.error('Failed to create Quick Workout:', err),
      )

      return true
    }
  } catch (error) {
    console.error('Google OAuth sign-in error:', error)
    return false
  }
}
