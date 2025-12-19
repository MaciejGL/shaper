/**
 * External Offers Service for Android
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

// Diagnostics collection for server-side logging
interface Diagnostics {
  stage: string
  isInitialized: boolean
  initError: string | null
  isAvailable: boolean | null
  availabilityError: string | null
  dialogShown: boolean | null
  dialogError: string | null
  tokenError: string | null
  attempts: number
  lastError: string | null
}

let currentDiagnostics: Diagnostics = {
  stage: 'idle',
  isInitialized: false,
  initError: null,
  isAvailable: null,
  availabilityError: null,
  dialogShown: null,
  dialogError: null,
  tokenError: null,
  attempts: 0,
  lastError: null,
}

function resetDiagnostics() {
  currentDiagnostics = {
    stage: 'idle',
    isInitialized: false,
    initError: null,
    isAvailable: null,
    availabilityError: null,
    dialogShown: null,
    dialogError: null,
    tokenError: null,
    attempts: 0,
    lastError: null,
  }
}

// ============================================================================
// Types
// ============================================================================

export interface ExternalOfferTokenResult {
  token: string | null
  error: string | null
  diagnostics: Diagnostics
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize Alternative Billing on app startup (Android only)
 * Per docs: Use alternativeBillingModeAndroid: 'alternative-only'
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
  currentDiagnostics.stage = 'init_start'

  try {
    // Initialize connection with Alternative Billing mode
    currentDiagnostics.stage = 'init_connection'
    const result = await initConnection({
      alternativeBillingModeAndroid: 'alternative-only',
    })

    if (!result) {
      currentDiagnostics.isInitialized = false
      currentDiagnostics.stage = 'init_failed_no_result'
      initPromise = null
      return false
    }

    // Wait for billing service to fully bind
    currentDiagnostics.stage = 'waiting_for_bind'
    await new Promise((resolve) => setTimeout(resolve, 1500))

    isInitialized = true
    currentDiagnostics.isInitialized = true
    currentDiagnostics.stage = 'init_ok'

    initPromise = null
    return true
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    currentDiagnostics.initError = msg.slice(0, 500)
    currentDiagnostics.stage = 'init_error'
    currentDiagnostics.lastError = msg.slice(0, 500)
    console.error('[EXTERNAL_OFFERS] Init failed:', msg)
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
 * Get alternative billing token for Google reporting (Android only)
 * Implements 3-step flow: check availability → show dialog → get token
 * Implements retry logic for SERVICE_DISCONNECTED (-1) errors
 * @param productId - The Stripe lookup key (e.g. 'premium_monthly')
 */
export async function getExternalOfferToken(
  productId: string = 'premium_monthly',
): Promise<ExternalOfferTokenResult> {
  resetDiagnostics()

  if (Platform.OS !== 'android') {
    currentDiagnostics.stage = 'not_android'
    return { token: null, error: null, diagnostics: { ...currentDiagnostics } }
  }

  // Ensure initialized
  currentDiagnostics.stage = 'checking_init'
  if (!isInitialized) {
    const initSuccess = await initExternalOffers()
    currentDiagnostics.isInitialized = initSuccess
    if (!initSuccess) {
      return {
        token: null,
        error: 'init_failed',
        diagnostics: { ...currentDiagnostics },
      }
    }
  } else {
    currentDiagnostics.isInitialized = true
  }

  // Retry up to 3 times for SERVICE_DISCONNECTED errors
  for (let attempt = 1; attempt <= 3; attempt++) {
    currentDiagnostics.attempts = attempt

    // Small delay before first attempt to ensure billing client is ready
    if (attempt === 1) {
      await new Promise((resolve) => setTimeout(resolve, 300))
    }

    try {
      // Step 1: Check availability (returns boolean)
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

      // Step 2: Show Google's information dialog (returns boolean)
      currentDiagnostics.stage = 'showing_dialog'
      const userAccepted = await showAlternativeBillingDialogAndroid()
      currentDiagnostics.dialogShown = userAccepted

      if (!userAccepted) {
        currentDiagnostics.stage = 'dialog_declined'
        return {
          token: null,
          error: 'user_declined',
          diagnostics: { ...currentDiagnostics },
        }
      }

      // Step 3: Get the token (returns string | null)
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
      currentDiagnostics.lastError = msg.slice(0, 500)

      // Determine which stage failed
      if (currentDiagnostics.stage === 'checking_availability') {
        currentDiagnostics.availabilityError = msg.slice(0, 500)
        currentDiagnostics.stage = 'availability_error'
      } else if (currentDiagnostics.stage === 'showing_dialog') {
        currentDiagnostics.dialogError = msg.slice(0, 500)
        currentDiagnostics.stage = 'dialog_error'
      } else {
        currentDiagnostics.tokenError = msg.slice(0, 500)
        currentDiagnostics.stage = 'token_error'
      }

      const isServiceDisconnected = msg.includes('responseCode":-1')

      if (isServiceDisconnected && attempt < 3) {
        currentDiagnostics.stage = 'reinitializing'
        await reinitialize()
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
 * User completes Stripe payment, then we report to Google
 */
export async function openExternalCheckout(checkoutUrl: string): Promise<void> {
  try {
    // Open in Custom Tabs (in-app browser)
    await WebBrowser.openBrowserAsync(checkoutUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      createTask: false,
    })
  } catch (error) {
    console.error('[EXTERNAL_OFFERS] Checkout failed:', error)
    throw error
  }
}
