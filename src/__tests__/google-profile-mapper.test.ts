/**
 * Tests for Google Profile Mapper utility functions
 */
import {
  type GoogleAccount,
  type GoogleProfile,
  extractLanguageFromLocale,
  getHighResGoogleProfilePicture,
  isValidGoogleProfilePicture,
  mapGoogleAccountForLinking,
  mapGoogleProfileToUser,
  sanitizeGoogleProfile,
  validateGoogleProfile,
} from '@/lib/google-profile-mapper'

describe('Google Profile Mapper', () => {
  const mockGoogleProfile: GoogleProfile = {
    id: '123456789',
    email: 'test@example.com',
    name: 'Test User',
    picture: 'https://lh3.googleusercontent.com/a/test=s96-c',
    given_name: 'Test',
    family_name: 'User',
    locale: 'en-US',
    verified_email: true,
  }

  const mockGoogleAccount: GoogleAccount = {
    access_token: 'access_token_123',
    refresh_token: 'refresh_token_123',
    expires_at: 1234567890,
    token_type: 'Bearer',
    scope: 'openid email profile',
  }

  describe('validateGoogleProfile', () => {
    it('should validate a complete Google profile', () => {
      expect(validateGoogleProfile(mockGoogleProfile)).toBe(true)
    })

    it('should reject profile without required fields', () => {
      const invalidProfile = { ...mockGoogleProfile, id: '' }
      expect(validateGoogleProfile(invalidProfile)).toBe(false)
    })

    it('should reject profile with verified_email false', () => {
      const invalidProfile = { ...mockGoogleProfile, verified_email: false }
      expect(validateGoogleProfile(invalidProfile)).toBe(false)
    })

    it('should accept profile with verified_email undefined', () => {
      const validProfile = { ...mockGoogleProfile }
      delete validProfile.verified_email
      expect(validateGoogleProfile(validProfile)).toBe(true)
    })
  })

  describe('sanitizeGoogleProfile', () => {
    it('should sanitize and trim profile data', () => {
      const dirtyProfile: GoogleProfile = {
        id: '  123456789  ',
        email: '  TEST@EXAMPLE.COM  ',
        name: '  Test User  ',
        picture: '  https://example.com/pic  ',
        given_name: '  Test  ',
        family_name: '  User  ',
        locale: '  en-US  ',
        verified_email: true,
      }

      const sanitized = sanitizeGoogleProfile(dirtyProfile)

      expect(sanitized.id).toBe('123456789')
      expect(sanitized.email).toBe('test@example.com')
      expect(sanitized.name).toBe('Test User')
      expect(sanitized.picture).toBe('https://example.com/pic')
      expect(sanitized.given_name).toBe('Test')
      expect(sanitized.family_name).toBe('User')
      expect(sanitized.locale).toBe('en-US')
    })

    it('should limit field lengths', () => {
      const longProfile: GoogleProfile = {
        id: '123456789',
        email: 'test@example.com',
        name: 'A'.repeat(200), // Very long name
        picture: 'https://example.com/pic',
        given_name: 'B'.repeat(100), // Very long given name
        family_name: 'C'.repeat(100), // Very long family name
        locale: 'en-US-extra-long-locale',
        verified_email: true,
      }

      const sanitized = sanitizeGoogleProfile(longProfile)

      expect(sanitized.name).toHaveLength(100)
      expect(sanitized.given_name).toHaveLength(50)
      expect(sanitized.family_name).toHaveLength(50)
      expect(sanitized.locale).toHaveLength(10)
    })
  })

  describe('mapGoogleProfileToUser', () => {
    it('should map Google profile to user data for new users', () => {
      const result = mapGoogleProfileToUser(
        mockGoogleProfile,
        mockGoogleAccount,
      )

      expect(result).toEqual({
        googleId: '123456789',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://lh3.googleusercontent.com/a/test=s96-c',
        locale: 'en-US',
        timezone: 'America/New_York', // Derived from en-US locale
        googleAccessToken: 'access_token_123',
        googleRefreshToken: 'refresh_token_123',
      })
    })

    it('should handle missing optional fields gracefully', () => {
      const minimalProfile: GoogleProfile = {
        id: '123456789',
        email: 'test@example.com',
        name: 'Test User',
        picture: 'https://example.com/pic',
      }

      const result = mapGoogleProfileToUser(minimalProfile, mockGoogleAccount)

      expect(result.googleId).toBe('123456789')
      expect(result.email).toBe('test@example.com')
      expect(result.name).toBe('Test User')
      expect(result.locale).toBeUndefined()
      expect(result.timezone).toBeUndefined()
    })

    it('should construct name from given_name and family_name if name is missing', () => {
      const profileWithoutName: GoogleProfile = {
        id: '123456789',
        email: 'test@example.com',
        name: '',
        picture: 'https://example.com/pic',
        given_name: 'Test',
        family_name: 'User',
      }

      const result = mapGoogleProfileToUser(
        profileWithoutName,
        mockGoogleAccount,
      )
      expect(result.name).toBe('Test User')
    })

    it('should fallback to email if no name is available', () => {
      const profileWithoutName: GoogleProfile = {
        id: '123456789',
        email: 'test@example.com',
        name: '',
        picture: 'https://example.com/pic',
      }

      const result = mapGoogleProfileToUser(
        profileWithoutName,
        mockGoogleAccount,
      )
      expect(result.name).toBe('test@example.com')
    })
  })

  describe('mapGoogleAccountForLinking', () => {
    it('should map only Google-specific data for account linking', () => {
      const result = mapGoogleAccountForLinking(
        mockGoogleProfile,
        mockGoogleAccount,
      )

      expect(result).toEqual({
        googleId: '123456789',
        googleAccessToken: 'access_token_123',
        googleRefreshToken: 'refresh_token_123',
      })

      // Should not include profile data
      expect(result).not.toHaveProperty('email')
      expect(result).not.toHaveProperty('name')
      expect(result).not.toHaveProperty('image')
    })
  })

  describe('isValidGoogleProfilePicture', () => {
    it('should validate Google profile picture URLs', () => {
      const validUrls = [
        'https://lh3.googleusercontent.com/a/test=s96-c',
        'https://googleapis.com/profile/pic',
      ]

      validUrls.forEach((url) => {
        expect(isValidGoogleProfilePicture(url)).toBe(true)
      })
    })

    it('should reject invalid URLs', () => {
      const invalidUrls = [
        'http://example.com/pic', // Not HTTPS
        'https://example.com/pic', // Not Google domain
        'invalid-url', // Not a URL
        '',
      ]

      invalidUrls.forEach((url) => {
        expect(isValidGoogleProfilePicture(url)).toBe(false)
      })
    })
  })

  describe('getHighResGoogleProfilePicture', () => {
    it('should upgrade Google profile picture to high resolution', () => {
      const lowResUrl = 'https://lh3.googleusercontent.com/a/test=s96-c'
      const result = getHighResGoogleProfilePicture(lowResUrl)
      expect(result).toBe('https://lh3.googleusercontent.com/a/test=s400-c')
    })

    it('should return original URL if not a valid Google URL', () => {
      const invalidUrl = 'https://example.com/pic'
      const result = getHighResGoogleProfilePicture(invalidUrl)
      expect(result).toBe(invalidUrl)
    })
  })

  describe('extractLanguageFromLocale', () => {
    it('should extract language from locale', () => {
      expect(extractLanguageFromLocale('en-US')).toBe('en')
      expect(extractLanguageFromLocale('fr-FR')).toBe('fr')
      expect(extractLanguageFromLocale('es-ES')).toBe('es')
    })

    it('should handle missing locale', () => {
      expect(extractLanguageFromLocale(undefined)).toBe('en')
      expect(extractLanguageFromLocale('')).toBe('en')
    })

    it('should handle locale without region', () => {
      expect(extractLanguageFromLocale('en')).toBe('en')
      expect(extractLanguageFromLocale('fr')).toBe('fr')
    })
  })
})
