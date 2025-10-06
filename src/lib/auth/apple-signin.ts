/**
 * Apple OAuth Sign-in Handler
 *
 * Handles Apple OAuth authentication flow including:
 * - Profile validation and mapping
 * - User creation for new users
 * - Account linking for existing users
 */
import { Account, Profile } from 'next-auth'

import { prisma } from '@/lib/db'

import {
  type AppleProfile,
  mapAppleAccountForLinking,
  mapAppleProfileToUser,
  sanitizeAppleProfile,
  validateAppleProfile,
} from '../apple-profile-mapper'

import { AppleJWTProfile } from './types'

/**
 * Maps NextAuth Apple JWT profile to our AppleProfile interface
 */
function mapJWTProfileToAppleProfile(
  jwtProfile: AppleJWTProfile,
): AppleProfile {
  return {
    id: jwtProfile.sub,
    email: jwtProfile.email,
    name: jwtProfile.name,
    email_verified: jwtProfile.email_verified,
    is_private_email: jwtProfile.is_private_email,
  }
}

/**
 * Handles Apple OAuth sign-in process
 *
 * @param account - NextAuth account object from Apple OAuth
 * @param profile - NextAuth profile object from Apple JWT
 * @returns Promise<boolean> - true if sign-in successful, false otherwise
 */
export async function handleAppleSignIn(
  account: Account,
  profile: Profile,
): Promise<boolean> {
  try {
    // Type-safe casting with validation
    const jwtProfile = profile as AppleJWTProfile

    // Validate required fields
    if (!jwtProfile.sub || !jwtProfile.email) {
      console.error('Missing required Apple profile fields:', {
        sub: !!jwtProfile.sub,
        email: !!jwtProfile.email,
      })
      return false
    }

    // Map JWT profile to our AppleProfile interface
    const appleProfile = mapJWTProfileToAppleProfile(jwtProfile)

    // Validate and sanitize Apple profile data
    if (!validateAppleProfile(appleProfile)) {
      console.error('Invalid Apple profile data:', appleProfile)
      return false
    }

    const sanitizedProfile = sanitizeAppleProfile(appleProfile)

    // Check if user already exists by email
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedProfile.email },
    })

    if (existingUser) {
      // Link Apple account to existing user WITHOUT overwriting profile data
      await prisma.user.update({
        where: { id: existingUser.id },
        data: mapAppleAccountForLinking(sanitizedProfile),
      })

      console.info(
        `Linked Apple account to existing user: ${existingUser.email}`,
      )
      return true
    } else {
      // Create new user with Apple profile data
      const newUserData = mapAppleProfileToUser(sanitizedProfile)

      // Create User and UserProfile together in a transaction
      const newUser = await prisma.user.create({
        data: {
          ...newUserData,
          role: 'CLIENT', // Default role for new users
          profile: {
            create: {
              firstName: sanitizedProfile.name?.firstName || '',
              lastName: sanitizedProfile.name?.lastName || '',
              timezone: newUserData.timezone,
            },
          },
        },
      })

      console.info(
        `Created new user with profile from Apple OAuth: ${newUser.email}`,
      )
      return true
    }
  } catch (error) {
    console.error('Apple OAuth sign-in error:', error)
    return false
  }
}
