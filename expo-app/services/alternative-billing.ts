/**
 * Alternative Billing Service for Android
 *
 * Handles Google Play Alternative Billing compliance.
 * Users stay in-app, complete Stripe checkout, and we report to Google.
 * https://hyochan.github.io/react-native-iap/docs/guides/alternative-billing
 */
import * as WebBrowser from 'expo-web-browser'
import { Platform } from 'react-native'
import {
  checkAlternativeBillingAvailabilityAndroid,
  createAlternativeBillingTokenAndroid,
  endConnection,
  initConnection,
  showAlternativeBillingDialogAndroid,
} from 'react-native-iap'

let isInitialized = false
let initPromise: Promise<boolean> | null = null

// Simplified diagnostics for production
interface Diagnostics {
  stage: string
  isAvailable: boolean | null
  error: string | null
  attempts: number
  initOk: boolean
}

let currentDiagnostics: Diagnostics = {
  stage: 'idle',
  isAvailable: null,
  error: null,
  attempts: 0,
  initOk: false,
}

function resetDiagnostics() {
  currentDiagnostics = {
    stage: 'idle',
    isAvailable: null,
    error: null,
    attempts: 0,
    initOk: false,
  }
}

// ============================================================================
// Types
// ============================================================================

export interface AlternativeBillingTokenResult {
  token: string | null
  error: string | null
  diagnostics: Diagnostics
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize Alternative Billing on app startup (Android only)
 */
export async function initAlternativeBilling(): Promise<boolean> {
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
  currentDiagnostics.stage = 'init'

  try {
    const result = await initConnection({
      alternativeBillingModeAndroid: 'alternative-only',
    })

    if (!result) {
      currentDiagnostics.initOk = false
      currentDiagnostics.stage = 'init_failed'
      initPromise = null
      return false
    }

    // Wait for Google Play billing service to fully bind
    // Required: billing client needs time to establish connection
    await new Promise((resolve) => setTimeout(resolve, 1500))

    isInitialized = true
    currentDiagnostics.initOk = true
    currentDiagnostics.stage = 'init_ok'

    initPromise = null
    return true
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    currentDiagnostics.error = msg.slice(0, 500)
    currentDiagnostics.stage = 'init_error'
    console.error('[ALT_BILLING] Init failed:', msg)
    isInitialized = false
    initPromise = null
    return false
  }
}

/**
 * Force re-initialization of the billing connection
 * Used when billing client disconnects (SERVICE_DISCONNECTED = -1)
 */
async function reinitialize(): Promise<boolean> {
  try {
    await endConnection()
  } catch {
    // Ignore end connection errors
  }

  isInitialized = false
  initPromise = null

  return initAlternativeBilling()
}

// ============================================================================
// Token Generation
// ============================================================================

/**
 * Get alternative billing token for Google reporting (Android only)
 * Flow: check availability → show dialog → get token
 * Retries on SERVICE_DISCONNECTED (-1) errors
 * @param productId - The Stripe lookup key (e.g. 'premium_monthly')
 */
export async function getAlternativeBillingToken(
  productId: string = 'premium_monthly',
): Promise<AlternativeBillingTokenResult> {
  resetDiagnostics()

  if (Platform.OS !== 'android') {
    currentDiagnostics.stage = 'not_android'
    return { token: null, error: null, diagnostics: { ...currentDiagnostics } }
  }

  // Ensure initialized
  currentDiagnostics.stage = 'checking_init'
  if (!isInitialized) {
    const initSuccess = await initAlternativeBilling()
    currentDiagnostics.initOk = initSuccess
    if (!initSuccess) {
      return {
        token: null,
        error: 'init_failed',
        diagnostics: { ...currentDiagnostics },
      }
    }
  } else {
    currentDiagnostics.initOk = true
  }

  // Retry up to 3 times for SERVICE_DISCONNECTED errors
  for (let attempt = 1; attempt <= 3; attempt++) {
    currentDiagnostics.attempts = attempt

    try {
      // Step 1: Check availability
      currentDiagnostics.stage = 'checking_availability'
      const isAvailable = await checkAlternativeBillingAvailabilityAndroid()
      currentDiagnostics.isAvailable = isAvailable

      if (!isAvailable) {
        currentDiagnostics.stage = 'not_available'
        return {
          token: null,
          error: 'not_available',
          diagnostics: { ...currentDiagnostics },
        }
      }

      // Step 2: Show Google's information dialog
      currentDiagnostics.stage = 'showing_dialog'
      const userAccepted = await showAlternativeBillingDialogAndroid()

      if (!userAccepted) {
        currentDiagnostics.stage = 'dialog_declined'
        return {
          token: null,
          error: 'user_declined',
          diagnostics: { ...currentDiagnostics },
        }
      }

      // Step 3: Get the token
      currentDiagnostics.stage = 'getting_token'
      // @ts-expect-error - Types incorrectly show 0 args, but implementation accepts optional sku
      const token = await createAlternativeBillingTokenAndroid(productId)

      currentDiagnostics.stage = 'token_ok'
      return {
        token,
        error: null,
        diagnostics: { ...currentDiagnostics },
      }
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      currentDiagnostics.error = msg.slice(0, 500)
      currentDiagnostics.stage = 'error'

      const isServiceDisconnected = msg.includes('responseCode":-1')

      if (isServiceDisconnected && attempt < 3) {
        currentDiagnostics.stage = 'reinitializing'
        await reinitialize()
        // Wait for service to reconnect before retry
        await new Promise((r) => setTimeout(r, 500))
        continue
      }

      return {
        token: null,
        error: msg.slice(0, 500),
        diagnostics: { ...currentDiagnostics },
      }
    }
  }

  currentDiagnostics.stage = 'max_retries'
  return {
    token: null,
    error: 'max_retries_exceeded',
    diagnostics: { ...currentDiagnostics },
  }
}

// ============================================================================
// Checkout
// ============================================================================

/**
 * Open checkout URL in Custom Tabs (stays within app context)
 */
export async function openCheckout(checkoutUrl: string): Promise<void> {
  try {
    await WebBrowser.openBrowserAsync(checkoutUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      createTask: false,
    })
  } catch (error) {
    console.error('[ALT_BILLING] Checkout failed:', error)
    throw error
  }
}

// ============================================================================
// Backwards Compatibility (for WebView bridge)
// ============================================================================

export const initExternalOffers = initAlternativeBilling
export const getExternalOfferToken = getAlternativeBillingToken
export const openExternalCheckout = openCheckout
export type ExternalOfferTokenResult = AlternativeBillingTokenResult
