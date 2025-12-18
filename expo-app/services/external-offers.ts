/**
 * External Offers Service for Android
 *
 * Handles Google Play External Offers program compliance using Billing Programs API:
 * - Initializes billing with external-offer program enabled
 * - Generates external transaction tokens for Google reporting
 * - Opens checkout via Custom Tabs with compliance dialog
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

export interface ExternalOfferTokenDiagnostics {
  isInitialized: boolean
  isAvailable: boolean | null
  errorName: string | null
  errorMessage: string | null
  failedStep: 'availability' | 'token' | 'unknown' | null
  stage:
    | 'not_android'
    | 'not_initialized'
    | 'availability_false'
    | 'token_ok'
    | 'availability_error'
    | 'token_error'
    | 'unknown_error'
    | null
}

export interface ExternalOfferTokenResult {
  token: string | null
  diagnostics: ExternalOfferTokenDiagnostics
}

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
 * Used when the billing client becomes disconnected
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

/**
 * Get external offer token for Google reporting (Android only)
 * Uses Billing Programs API (not Alternative Billing API)
 * Will attempt to initialize/reinitialize if needed
 */
export async function getExternalOfferToken(): Promise<ExternalOfferTokenResult> {
  if (Platform.OS !== 'android') {
    return {
      token: null,
      diagnostics: {
        isInitialized: false,
        isAvailable: null,
        errorName: null,
        errorMessage: null,
        failedStep: null,
        stage: 'not_android',
      },
    }
  }

  // Try to get token, with one retry after reinit if billing client disconnected
  const result = await attemptGetToken()

  // If we got a "billing client not ready" error, try reinitializing once
  if (
    result.diagnostics.stage === 'availability_error' &&
    result.diagnostics.errorMessage?.includes('not ready')
  ) {
    // #region agent log
    console.info('[DBG_EXT_OFFERS_APP][RETRY_AFTER_REINIT]')
    // #endregion agent log

    const reinitSuccess = await reinitialize()
    if (reinitSuccess) {
      return attemptGetToken()
    }
  }

  return result
}

async function attemptGetToken(): Promise<ExternalOfferTokenResult> {
  const baseDiagnostics: ExternalOfferTokenDiagnostics = {
    isInitialized,
    isAvailable: null,
    errorName: null,
    errorMessage: null,
    failedStep: null,
    stage: null,
  }

  // Ensure initialized before proceeding
  if (!isInitialized) {
    const initSuccess = await initExternalOffers()
    if (!initSuccess) {
      return {
        token: null,
        diagnostics: {
          ...baseDiagnostics,
          isInitialized: false,
          stage: 'not_initialized',
        },
      }
    }
    baseDiagnostics.isInitialized = true
  }

  try {
    // #region agent log
    console.info('[DBG_EXT_OFFERS_APP][TOKEN_START]', {
      isInitialized,
    })
    // #endregion agent log

    // Check if External Offers program is available for this user
    let isAvailable: boolean
    try {
      const result = await isBillingProgramAvailableAndroid('external-offer')
      isAvailable = result.isAvailable
    } catch (error) {
      return {
        token: null,
        diagnostics: {
          ...baseDiagnostics,
          errorName: error instanceof Error ? error.name : 'UnknownError',
          errorMessage: error instanceof Error ? error.message : String(error),
          failedStep: 'availability',
          stage: 'availability_error',
        },
      }
    }

    // #region agent log
    console.info('[DBG_EXT_OFFERS_APP][TOKEN_AVAILABILITY]', {
      isAvailable,
    })
    // #endregion agent log

    if (!isAvailable) {
      console.warn('[EXTERNAL_OFFERS] External Offers program not available')
      return {
        token: null,
        diagnostics: {
          ...baseDiagnostics,
          isAvailable,
          stage: 'availability_false',
        },
      }
    }

    // Get the external transaction token via Billing Programs API
    let token: string
    try {
      const details =
        await createBillingProgramReportingDetailsAndroid('external-offer')
      token = details.externalTransactionToken
    } catch (error) {
      return {
        token: null,
        diagnostics: {
          ...baseDiagnostics,
          isAvailable,
          errorName: error instanceof Error ? error.name : 'UnknownError',
          errorMessage: error instanceof Error ? error.message : String(error),
          failedStep: 'token',
          stage: 'token_error',
        },
      }
    }

    // #region agent log
    console.info('[DBG_EXT_OFFERS_APP][TOKEN_RESULT]', {
      hasToken: !!token,
      tokenLength: token?.length || 0,
    })
    // #endregion agent log

    console.info('[EXTERNAL_OFFERS] Token generated successfully')
    return {
      token,
      diagnostics: {
        ...baseDiagnostics,
        isAvailable,
        stage: 'token_ok',
      },
    }
  } catch (error) {
    // #region agent log
    console.error('[DBG_EXT_OFFERS_APP][TOKEN_ERROR]', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
    })
    // #endregion agent log
    console.error('[EXTERNAL_OFFERS] Failed to get token:', error)
    return {
      token: null,
      diagnostics: {
        ...baseDiagnostics,
        errorName: error instanceof Error ? error.name : 'UnknownError',
        errorMessage: error instanceof Error ? error.message : String(error),
        failedStep: 'unknown',
        stage: 'unknown_error',
      },
    }
  }
}

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
