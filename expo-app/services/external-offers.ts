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

export interface ExternalOfferTokenDiagnostics {
  isInitialized: boolean
  isAvailable: boolean | null
  errorName: string | null
}

export interface ExternalOfferTokenResult {
  token: string | null
  diagnostics: ExternalOfferTokenDiagnostics
}

/**
 * Initialize External Offers on app startup (Android only)
 */
export async function initExternalOffers(): Promise<void> {
  if (Platform.OS !== 'android' || isInitialized) {
    return
  }

  try {
    // #region agent log
    console.info('[DBG_EXT_OFFERS_APP][INIT_START]', {
      platform: Platform.OS,
      isInitialized,
    })
    // #endregion agent log

    // Initialize with alternative billing mode for external offers
    isInitialized = await initConnection({
      alternativeBillingModeAndroid: 'alternative-only',
    })
    // #region agent log
    console.info('[DBG_EXT_OFFERS_APP][INIT_RESULT]', {
      isInitialized,
    })
    // #endregion agent log
    console.info('[EXTERNAL_OFFERS] Initialized successfully')
  } catch (error) {
    // #region agent log
    console.error('[DBG_EXT_OFFERS_APP][INIT_ERROR]', {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
    })
    // #endregion agent log
    console.error('[EXTERNAL_OFFERS] Failed to initialize:', error)
  }
}

/**
 * Get external offer token for Google reporting (Android only)
 * Returns null if not available or not Android
 */
export async function getExternalOfferToken(): Promise<ExternalOfferTokenResult> {
  const baseDiagnostics: ExternalOfferTokenDiagnostics = {
    isInitialized,
    isAvailable: null,
    errorName: null,
  }

  if (Platform.OS !== 'android') {
    return { token: null, diagnostics: baseDiagnostics }
  }

  try {
    // #region agent log
    console.info('[DBG_EXT_OFFERS_APP][TOKEN_START]', {
      isInitialized,
    })
    // #endregion agent log

    // Check if alternative billing is available
    const isAvailable = await checkAlternativeBillingAvailabilityAndroid()

    // #region agent log
    console.info('[DBG_EXT_OFFERS_APP][TOKEN_AVAILABILITY]', {
      isAvailable,
    })
    // #endregion agent log

    if (!isAvailable) {
      console.warn('[EXTERNAL_OFFERS] Alternative billing not available')
      return {
        token: null,
        diagnostics: { ...baseDiagnostics, isAvailable },
      }
    }

    // Create the token for external transaction reporting
    const token = await createAlternativeBillingTokenAndroid()

    // #region agent log
    console.info('[DBG_EXT_OFFERS_APP][TOKEN_RESULT]', {
      hasToken: !!token,
      tokenType: typeof token,
    })
    // #endregion agent log

    if (!token) {
      console.warn('[EXTERNAL_OFFERS] No token received')
      return {
        token: null,
        diagnostics: { ...baseDiagnostics, isAvailable },
      }
    }

    console.info('[EXTERNAL_OFFERS] Token generated successfully')
    return {
      token,
      diagnostics: { ...baseDiagnostics, isAvailable },
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
      },
    }
  }
}

/**
 * Open checkout URL in Custom Tabs (Android) or Safari (iOS)
 * Makes required compliance call to Play Billing before opening
 */
export async function openExternalCheckout(checkoutUrl: string): Promise<void> {
  try {
    if (Platform.OS === 'android') {
      // #region agent log
      console.info('[DBG_EXT_OFFERS_APP][DIALOG_SHOW]', {
        isInitialized,
      })
      // #endregion agent log
      // Show the alternative billing dialog for compliance
      await showAlternativeBillingDialogAndroid()
      // #region agent log
      console.info('[DBG_EXT_OFFERS_APP][DIALOG_SHOWN]')
      // #endregion agent log
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
