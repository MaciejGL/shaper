export type PaymentModel = 'full' | 'companion'
export type Platform = 'ios' | 'android' | 'web'

export interface PaymentRule {
  canShowUpgradeUI: boolean
  canShowPricing: boolean
  canLinkToPayment: boolean
  paymentModel: PaymentModel
  premiumGateText: string
}

// Timezone to country mapping for region detection
const TIMEZONE_TO_COUNTRY: Record<string, string> = {
  'Europe/Oslo': 'NO',
  'Arctic/Longyearbyen': 'NO',
  'America/New_York': 'US',
  'America/Los_Angeles': 'US',
  'America/Chicago': 'US',
  'America/Denver': 'US',
  'America/Phoenix': 'US',
  'America/Anchorage': 'US',
  'Pacific/Honolulu': 'US',
  'Europe/London': 'GB',
  'Europe/Berlin': 'DE',
  'Europe/Paris': 'FR',
  'Europe/Madrid': 'ES',
  'Europe/Rome': 'IT',
  'Europe/Amsterdam': 'NL',
  'Europe/Brussels': 'BE',
  'Europe/Vienna': 'AT',
  'Europe/Stockholm': 'SE',
  'Europe/Copenhagen': 'DK',
  'Europe/Helsinki': 'FI',
  'Europe/Warsaw': 'PL',
  'Europe/Prague': 'CZ',
  'Europe/Budapest': 'HU',
  'Europe/Bucharest': 'RO',
  'Europe/Sofia': 'BG',
  'Europe/Athens': 'GR',
  'Europe/Dublin': 'IE',
  'Europe/Lisbon': 'PT',
}

// EU countries for DMA coverage
export const EU_COUNTRIES = [
  'AT',
  'BE',
  'BG',
  'HR',
  'CY',
  'CZ',
  'DK',
  'EE',
  'FI',
  'FR',
  'DE',
  'GR',
  'HU',
  'IE',
  'IT',
  'LV',
  'LT',
  'LU',
  'MT',
  'NL',
  'PL',
  'PT',
  'RO',
  'SK',
  'SI',
  'ES',
  'SE',
] as const

export function getRegionFromTimezone(
  timezone: string | null | undefined,
): string {
  if (!timezone) return 'DEFAULT'

  const country = TIMEZONE_TO_COUNTRY[timezone]
  if (country) {
    if (country === 'US') return 'US'
    if (country === 'NO') return 'NO'
    if (EU_COUNTRIES.includes(country as (typeof EU_COUNTRIES)[number]))
      return 'EU'
  }

  return 'DEFAULT'
}

/**
 * Get ISO country code from timezone for Google reporting.
 * Returns the actual country code (NO, DE, FR, etc.) or null if unknown.
 * Google's userTaxAddress.regionCode requires real ISO country codes.
 */
export function getCountryCodeFromTimezone(
  timezone: string | null | undefined,
): string | null {
  if (!timezone) return null
  return TIMEZONE_TO_COUNTRY[timezone] || null
}

// Full mode config - shows all upgrade UI
const FULL_MODE: PaymentRule = {
  canShowUpgradeUI: true,
  canShowPricing: true,
  canLinkToPayment: true,
  paymentModel: 'full',
  premiumGateText: 'Upgrade to Premium for full access.',
}

// Companion mode config - hides upgrade UI for compliance
const COMPANION_MODE: PaymentRule = {
  canShowUpgradeUI: false,
  canShowPricing: false,
  canLinkToPayment: false,
  paymentModel: 'companion',
  premiumGateText: 'Not available for purchase in the app.',
}

export const PAYMENT_RULES: Record<string, Record<Platform, PaymentRule>> = {
  // Norway - iOS is companion (no DMA yet), Android/Web are full (Google EEA program)
  NO: {
    ios: COMPANION_MODE,
    android: FULL_MODE,
    web: FULL_MODE,
  },

  // EU - Full mode on all platforms (DMA applies)
  EU: {
    ios: FULL_MODE,
    android: FULL_MODE,
    web: FULL_MODE,
  },

  // US - Full mode on all platforms
  US: {
    ios: FULL_MODE,
    android: FULL_MODE,
    web: FULL_MODE,
  },

  // Default - Companion mode for safety (unknown regions)
  DEFAULT: {
    ios: COMPANION_MODE,
    android: COMPANION_MODE,
    web: FULL_MODE, // Web is always safe
  },
}
