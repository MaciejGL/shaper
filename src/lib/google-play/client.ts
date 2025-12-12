/**
 * Google Play Android Publisher API Client
 *
 * Used for reporting external transactions to Google Play
 * for compliance with External Offers program.
 */
import { google } from 'googleapis'

export const PACKAGE_NAME = 'app.hypertro.mobile'

/**
 * Get authenticated Android Publisher client
 */
export function getAndroidPublisher() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(
        /\\n/g,
        '\n',
      ),
    },
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  })

  return google.androidpublisher({
    version: 'v3',
    auth,
  })
}
