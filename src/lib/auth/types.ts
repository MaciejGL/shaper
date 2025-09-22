/**
 * Auth-related TypeScript types and interfaces
 */
import { Account, Profile } from 'next-auth'

// NextAuth Google JWT Profile structure from Google OAuth
export interface GoogleJWTProfile extends Profile {
  sub: string
  email: string
  name: string
  picture: string
  given_name?: string
  family_name?: string
  locale?: string
  email_verified: boolean
  hd?: string
  iss: string
  azp: string
  aud: string
  at_hash?: string
  iat: number
  exp: number
}

// NextAuth Google Account structure
export interface GoogleAccount extends Account {
  provider: 'google'
  type: 'oauth'
  access_token?: string
  refresh_token?: string
  expires_at?: number
  token_type?: string
  scope?: string
}

// NextAuth Apple JWT Profile structure from Apple OAuth
export interface AppleJWTProfile {
  sub: string
  email: string
  name?: {
    firstName?: string
    lastName?: string
  }
  email_verified?: boolean
  is_private_email?: boolean
  iss: string
  aud: string
  iat: number
  exp: number
}

// NextAuth Apple Account structure
export interface AppleAccount extends Account {
  provider: 'apple'
  type: 'oauth'
  access_token?: string
  token_type?: string
  scope?: string
}
