/**
 * External Offers Service for Android
 *
 * Handles Google Play External Offers program compliance:
 * - Initializes alternative billing
 * - Generates external transaction tokens
 * - Opens checkout via Custom Tabs
 */
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import {
  checkAlternativeBillingAvailabilityAndroid,
  createAlternativeBillingTokenAndroid,
  initConnection,
  showAlternativeBillingDialogAndroid,
} from 'react-native-iap'

let isInitialized = false

/**
 * Initialize External Offers on app startup (Android only)
 */
export async function initExternalOffers(): Promise<void> {
  if (Platform.OS !== 'android' || isInitialized) {
    return
  }

  try {
    // Initialize with alternative billing mode for external offers
    isInitialized = await initConnection({
      alternativeBillingModeAndroid: 'alternative-only',
    })
    console.info('[EXTERNAL_OFFERS] Initialized successfully')
  } catch (error) {
    console.error('[EXTERNAL_OFFERS] Failed to initialize:', error)
  }
}

/**
 * Get external offer token for Google reporting (Android only)
 * Returns null if not available or not Android
 */
export async function getExternalOfferToken(): Promise<string | null> {
  if (Platform.OS !== 'android') {
    return null
  }

  try {
    // Check if alternative billing is available
    const isAvailable = await checkAlternativeBillingAvailabilityAndroid()

    if (!isAvailable) {
      console.warn('[EXTERNAL_OFFERS] Alternative billing not available')
      return null
    }

    // Create the token for external transaction reporting
    const token = await createAlternativeBillingTokenAndroid()

    if (!token) {
      console.warn('[EXTERNAL_OFFERS] No token received')
      return null
    }

    console.info('[EXTERNAL_OFFERS] Token generated successfully')
    return token
  } catch (error) {
    console.error('[EXTERNAL_OFFERS] Failed to get token:', error)
    return null
  }
}

/**
 * Open checkout URL in Custom Tabs (Android) or Safari (iOS)
 * Makes required compliance call to Play Billing before opening
 */
export async function openExternalCheckout(checkoutUrl: string): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      // Show the alternative billing dialog for compliance
      await showAlternativeBillingDialogAndroid()
    }

    // Open in Custom Tabs / Safari
    await WebBrowser.openBrowserAsync(checkoutUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      createTask: false,
    })
  } catch (error) {
    console.error('[EXTERNAL_OFFERS] Failed to open checkout:', error)
    throw error
  }
}
