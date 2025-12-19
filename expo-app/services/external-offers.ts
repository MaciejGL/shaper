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
let billingProgramEnabled = false

// Diagnostics collection for server-side logging
interface Diagnostics {
  stage: string
  isInitialized: boolean
  initError: string | null
  isAvailable: boolean | null
  availabilityError: string | null
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
  currentDiagnostics.stage = 'init_start'

  try {
    // Step 1: Enable billing program BEFORE initConnection (per docs)
    // Only call once per app lifecycle
    if (!billingProgramEnabled) {
      currentDiagnostics.stage = 'enable_program'
      enableBillingProgramAndroid('external-offer')
      billingProgramEnabled = true
    }

    // Step 2: Initialize connection (NO alternativeBillingModeAndroid option!)
    currentDiagnostics.stage = 'init_connection'
    const result = await initConnection()

    if (!result) {
      currentDiagnostics.isInitialized = false
      currentDiagnostics.stage = 'init_failed_no_result'
      initPromise = null
      return false
    }

    // Step 3: Wait for billing service to fully bind
    // Some devices report success but the client isn't ready for API calls immediately
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
 * Get external offer token for Google reporting (Android only)
 * Implements retry logic for SERVICE_DISCONNECTED (-1) errors
 */
export async function getExternalOfferToken(): Promise<ExternalOfferTokenResult> {
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
      // Step 3: Check if program is available
      currentDiagnostics.stage = 'checking_availability'
      const { isAvailable } =
        await isBillingProgramAvailableAndroid('external-offer')
      currentDiagnostics.isAvailable = isAvailable

      if (!isAvailable) {
        currentDiagnostics.stage = 'not_available'
        return {
          token: null,
          error: 'not_available',
          diagnostics: { ...currentDiagnostics },
        }
      }

      // Step 5: Get reporting token
      currentDiagnostics.stage = 'getting_token'
      const details =
        await createBillingProgramReportingDetailsAndroid('external-offer')

      currentDiagnostics.stage = 'token_ok'
      return {
        token: details.externalTransactionToken,
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
