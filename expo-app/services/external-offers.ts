/**
 * External Offers Service for Android
 *
 * Handles Google Play External Offers program compliance using Billing Programs API:
 * - Initializes billing with external-offer program enabled
 * - Generates external transaction tokens for Google reporting
 * - Opens checkout via Custom Tabs with compliance dialog
 *
 * Implements retry logic for SERVICE_DISCONNECTED (-1) errors per Google's docs:
 * https://developer.android.com/google/play/billing/errors#service_disconnected_error_code_-1
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

interface RetryAttempt {
  attempt: number
  error: string | null
  responseCode: number | null // -1 = SERVICE_DISCONNECTED
  reinitSuccess: boolean | null
}

export interface ExternalOfferTokenDiagnostics {
  isInitialized: boolean
  isAvailable: boolean | null
  stage: string | null
  totalAttempts: number
  attempts: RetryAttempt[]
  finalError: string | null
  finalResponseCode: number | null
}

export interface ExternalOfferTokenResult {
  token: string | null
  diagnostics: ExternalOfferTokenDiagnostics
}

// ============================================================================
// Retry Utilities
// ============================================================================

/**
 * Parse responseCode from JSON error message
 * Error format: {"code":"service-error","message":"...","responseCode":-1,"debugMessage":"..."}
 */
function parseResponseCode(errorMessage: string): number | null {
  try {
    // The error message might have a JSON object in it
    const jsonMatch = errorMessage.match(/\{[^}]+\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      return typeof parsed.responseCode === 'number'
        ? parsed.responseCode
        : null
    }
    return null
  } catch {
    return null
  }
}

/**
 * Generic retry utility with diagnostics collection
 * Retries up to maxAttempts times, calling beforeRetry (reinit) between attempts
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  options: {
    maxAttempts?: number
    delayMs?: number
    shouldRetry?: (error: unknown) => boolean
    beforeRetry?: () => Promise<boolean>
  },
): Promise<{ result: T | null; success: boolean; attempts: RetryAttempt[] }> {
  const { maxAttempts = 3, delayMs = 500, shouldRetry, beforeRetry } = options
  const attempts: RetryAttempt[] = []

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const result = await operation()
      // Success - record successful attempt
      attempts.push({
        attempt,
        error: null,
        responseCode: null,
        reinitSuccess: null,
      })
      return { result, success: true, attempts }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      const responseCode = parseResponseCode(errorMsg)

      // #region agent log
      console.info('[DBG_EXT_OFFERS_APP][RETRY_ATTEMPT]', {
        attempt,
        responseCode,
        errorPreview: errorMsg.slice(0, 200),
      })
      // #endregion agent log

      attempts.push({
        attempt,
        error: errorMsg.slice(0, 500), // Truncate for logging
        responseCode,
        reinitSuccess: null,
      })

      // Check if we should retry
      const canRetry =
        attempt < maxAttempts && (!shouldRetry || shouldRetry(error))
      if (!canRetry) {
        // #region agent log
        console.info('[DBG_EXT_OFFERS_APP][RETRY_STOP]', {
          attempt,
          reason: attempt >= maxAttempts ? 'max_attempts' : 'should_not_retry',
        })
        // #endregion agent log
        break
      }

      // Run beforeRetry (e.g., reinitialize billing client)
      if (beforeRetry) {
        const reinitSuccess = await beforeRetry()
        attempts[attempts.length - 1].reinitSuccess = reinitSuccess

        // #region agent log
        console.info('[DBG_EXT_OFFERS_APP][REINIT_RESULT]', {
          attempt,
          reinitSuccess,
        })
        // #endregion agent log

        if (!reinitSuccess) {
          // #region agent log
          console.info('[DBG_EXT_OFFERS_APP][RETRY_STOP]', {
            attempt,
            reason: 'reinit_failed',
          })
          // #endregion agent log
          break
        }
      }

      // Delay before next retry
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  return { result: null, success: false, attempts }
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize External Offers on app startup (Android only)
 * MUST call enableBillingProgramAndroid BEFORE initConnection
 */
export async function initExternalOffers(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return false
  }

  // Return existing promise if init is in progress
  if (initPromise) {
    return initPromise
  }

  // Already initialized successfully
  if (isInitialized) {
    return true
  }

  initPromise = doInit()
  return initPromise
}

async function doInit(): Promise<boolean> {
  try {
    // #region agent log
    console.info('[DBG_EXT_OFFERS_APP][INIT_START]', {
      platform: Platform.OS,
      isInitialized,
    })
    // #endregion agent log

    // Enable External Offers program BEFORE connecting
    enableBillingProgramAndroid('external-offer')

    // Now initialize the connection
    const result = await initConnection()
    isInitialized = !!result

    // #region agent log
    console.info('[DBG_EXT_OFFERS_APP][INIT_RESULT]', {
      isInitialized,
    })
    // #endregion agent log
    console.info('[EXTERNAL_OFFERS] Initialized successfully')

    initPromise = null
    return isInitialized
  } catch (error) {
    // #region agent log
    console.error('[DBG_EXT_OFFERS_APP][INIT_ERROR]', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
    })
    // #endregion agent log
    console.error('[EXTERNAL_OFFERS] Failed to initialize:', error)

    isInitialized = false
    initPromise = null
    return false
  }
}

/**
 * Force re-initialization of the billing connection
 * Used when the billing client becomes disconnected (SERVICE_DISCONNECTED = -1)
 */
async function reinitialize(): Promise<boolean> {
  // #region agent log
  console.info('[DBG_EXT_OFFERS_APP][REINIT_START]')
  // #endregion agent log

  try {
    // End existing connection first
    await endConnection()
  } catch {
    // Ignore end connection errors
  }

  isInitialized = false
  initPromise = null

  return initExternalOffers()
}

// ============================================================================
// Token Generation with Retry
// ============================================================================

/**
 * Get external offer token for Google reporting (Android only)
 * Uses Billing Programs API with retry logic for SERVICE_DISCONNECTED errors
 *
 * Retry strategy (per Google's docs):
 * - Up to 3 attempts
 * - 500ms delay between retries
 * - Reinitialize billing connection before each retry
 * - Only retry on responseCode -1 (SERVICE_DISCONNECTED)
 */
export async function getExternalOfferToken(): Promise<ExternalOfferTokenResult> {
  if (Platform.OS !== 'android') {
    return {
      token: null,
      diagnostics: {
        isInitialized: false,
        isAvailable: null,
        stage: 'not_android',
        totalAttempts: 0,
        attempts: [],
        finalError: null,
        finalResponseCode: null,
      },
    }
  }

  // Ensure initialized first
  if (!isInitialized) {
    const initSuccess = await initExternalOffers()
    if (!initSuccess) {
      return {
        token: null,
        diagnostics: {
          isInitialized: false,
          isAvailable: null,
          stage: 'init_failed',
          totalAttempts: 0,
          attempts: [],
          finalError: 'Failed to initialize billing connection',
          finalResponseCode: null,
        },
      }
    }
  }

  // #region agent log
  console.info('[DBG_EXT_OFFERS_APP][TOKEN_START]', {
    isInitialized,
  })
  // #endregion agent log

  // Use withRetry for the token generation with reinit between retries
  const { result, success, attempts } = await withRetry(
    async () => {
      // Step 1: Check if External Offers program is available
      const availResult =
        await isBillingProgramAvailableAndroid('external-offer')

      // #region agent log
      console.info('[DBG_EXT_OFFERS_APP][TOKEN_AVAILABILITY]', {
        isAvailable: availResult.isAvailable,
      })
      // #endregion agent log

      if (!availResult.isAvailable) {
        throw new Error('NOT_AVAILABLE')
      }

      // Step 2: Get the external transaction token
      const details =
        await createBillingProgramReportingDetailsAndroid('external-offer')

      // #region agent log
      console.info('[DBG_EXT_OFFERS_APP][TOKEN_CREATED]', {
        hasToken: !!details.externalTransactionToken,
        tokenLength: details.externalTransactionToken?.length || 0,
      })
      // #endregion agent log

      return details.externalTransactionToken
    },
    {
      maxAttempts: 3,
      delayMs: 500,
      shouldRetry: (error) => {
        const msg = error instanceof Error ? error.message : String(error)
        const code = parseResponseCode(msg)
        // Only retry on SERVICE_DISCONNECTED (-1)
        return code === -1
      },
      beforeRetry: reinitialize,
    },
  )

  const lastAttempt = attempts[attempts.length - 1]

  if (success) {
    console.info('[EXTERNAL_OFFERS] Token generated successfully')
  } else {
    console.warn('[EXTERNAL_OFFERS] Token generation failed after retries')
  }

  return {
    token: success ? result : null,
    diagnostics: {
      isInitialized,
      isAvailable: success ? true : null,
      stage: success ? 'token_ok' : 'retry_exhausted',
      totalAttempts: attempts.length,
      attempts,
      finalError: lastAttempt?.error || null,
      finalResponseCode: lastAttempt?.responseCode || null,
    },
  }
}

// ============================================================================
// Checkout
// ============================================================================

/**
 * Open checkout URL with External Offers compliance
 * Shows Google's required information dialog before opening Custom Tabs
 */
export async function openExternalCheckout(checkoutUrl: string): Promise<void> {
  try {
    if (Platform.OS === 'android' && isInitialized) {
      // #region agent log
      console.info('[DBG_EXT_OFFERS_APP][LAUNCH_EXTERNAL_LINK]', {
        isInitialized,
        checkoutUrl: checkoutUrl.slice(0, 50) + '...',
      })
      // #endregion agent log

      // Launch external link with compliance dialog
      // Using 'caller-will-launch-link' so we control opening via Custom Tabs
      const userAccepted = await launchExternalLinkAndroid({
        billingProgram: 'external-offer',
        launchMode: 'caller-will-launch-link',
        linkType: 'link-to-digital-content-offer',
        linkUri: checkoutUrl,
      })

      // #region agent log
      console.info('[DBG_EXT_OFFERS_APP][LAUNCH_RESULT]', {
        userAccepted,
      })
      // #endregion agent log

      if (!userAccepted) {
        console.info('[EXTERNAL_OFFERS] User declined external link')
        return
      }
    }

    // Open in Custom Tabs / Safari
    await WebBrowser.openBrowserAsync(checkoutUrl, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
      createTask: false,
    })
  } catch (error) {
    // #region agent log
    console.error('[DBG_EXT_OFFERS_APP][OPEN_CHECKOUT_ERROR]', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
    })
    // #endregion agent log
    console.error('[EXTERNAL_OFFERS] Failed to open checkout:', error)
    throw error
  }
}
