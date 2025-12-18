/**
 * External Offers Service for Android
 *
 * Handles Google Play External Offers program compliance using Billing Programs API.
 * Follows react-native-iap documentation exactly:
 * https://hyochan.github.io/react-native-iap/docs/guides/alternative-billing
 */
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import {
  createBillingProgramReportingDetailsAndroid,
  enableBillingProgramAndroid,
  endConnection,
  initConnection,
  isBillingProgramAvailableAndroid,
  launchExternalLinkAndroid,
} from 'react-native-iap'

let isInitialized = false
let initPromise: Promise<boolean> | null = null

// ============================================================================
// Types
// ============================================================================

export interface ExternalOfferTokenResult {
  token: string | null
  error: string | null
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize External Offers on app startup (Android only)
 * Per docs: enableBillingProgramAndroid MUST be called BEFORE initConnection
 */
export async function initExternalOffers(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false
  }

  if (initPromise) {
    return initPromise
  }

  if (isInitialized) {
    return true
  }

  initPromise = doInit()
  return initPromise
}

async function doInit(): Promise<boolean> {
  try {
    // Step 1: Enable billing program BEFORE initConnection (per docs)
    enableBillingProgramAndroid('external-offer')

    // Step 2: Initialize connection (NO alternativeBillingModeAndroid option!)
    const result = await initConnection()
    isInitialized = !!result

    initPromise = null
    return isInitialized
  } catch (error) {
    console.error('[EXTERNAL_OFFERS] Init failed:', error)
    isInitialized = false
    initPromise = null
    return false
  }
}

/**
 * Force re-initialization of the billing connection
 * Used when billing client becomes disconnected (SERVICE_DISCONNECTED = -1)
 */
async function reinitialize(): Promise<boolean> {
  try {
    await endConnection()
  } catch {
    // Ignore end connection errors
  }

  isInitialized = false
  initPromise = null

  return initExternalOffers()
}

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Get external offer token for Google reporting (Android only)
 * Implements retry logic for SERVICE_DISCONNECTED (-1) errors
 */
export async function getExternalOfferToken(): Promise<ExternalOfferTokenResult> {
  if (Platform.OS !== 'android') {
    return { token: null, error: null }
  }

  // Ensure initialized
  if (!isInitialized) {
    const initSuccess = await initExternalOffers()
    if (!initSuccess) {
      return { token: null, error: 'init_failed' }
    }
  }

  // Retry up to 3 times for SERVICE_DISCONNECTED errors
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      // Step 3: Check if program is available
      const { isAvailable } =
        await isBillingProgramAvailableAndroid('external-offer')
      if (!isAvailable) {
        return { token: null, error: 'not_available' }
      }

      // Step 5: Get reporting token
      const details =
        await createBillingProgramReportingDetailsAndroid('external-offer')

      return { token: details.externalTransactionToken, error: null }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      const isServiceDisconnected = msg.includes('responseCode":-1')

      if (isServiceDisconnected && attempt < 3) {
        // Reinitialize and retry
        await reinitialize()
        await new Promise((r) => setTimeout(r, 500))
        continue
      }

      console.error('[EXTERNAL_OFFERS] Token generation failed:', msg)
      return { token: null, error: msg }
    }
  }

  return { token: null, error: 'max_retries_exceeded' }
}

// ============================================================================
// Checkout
// ============================================================================

/**
 * Open checkout URL with External Offers compliance
 * Shows Google's required disclosure dialog before opening browser
 */
export async function openExternalCheckout(checkoutUrl: string): Promise<void> {
  try {
    if (Platform.OS === 'android' && isInitialized) {
      // Step 4: Launch external link (shows Google's disclosure dialog)
      const userAccepted = await launchExternalLinkAndroid({
        billingProgram: 'external-offer',
        launchMode: 'caller-will-launch-link',
        linkType: 'link-to-digital-content-offer',
        linkUri: checkoutUrl,
      })

      if (!userAccepted) {
        return // User declined
      }
    }

    // Open in Custom Tabs
    await WebBrowser.openBrowserAsync(checkoutUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      createTask: false,
    })
  } catch (error) {
    console.error('[EXTERNAL_OFFERS] Checkout failed:', error)
    throw error
  }
}
