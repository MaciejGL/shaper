/**
 * Google Play Android Publisher API Client
 *
 * Used for reporting external transactions to Google Play
 * for compliance with External Offers program.
 */
import { google } from 'googleapis'

export const PACKAGE_NAME = 'app.hypertro.mobile'

type ServiceAccountCredentials = {
  client_email: string
  private_key: string
}

function getServiceAccountCredentials(): ServiceAccountCredentials {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

  // Primary: split env vars (recommended)
  if (email && privateKey) {
    return {
      client_email: email,
      private_key: privateKey.replace(/\\n/g, '\n'),
    }
  }

  // Fallback: JSON string (or base64 JSON) in GOOGLE_SERVICE_ACCOUNT_JSON
  // Some deployments accidentally store the whole JSON in GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.
  const jsonCandidateRaw =
    process.env.GOOGLE_SERVICE_ACCOUNT_JSON ||
    (privateKey && privateKey.trim().startsWith('{') ? privateKey : null)

  if (jsonCandidateRaw) {
    const jsonText = (() => {
      const trimmed = jsonCandidateRaw.trim()
      if (trimmed.startsWith('{')) return trimmed
      try {
        return Buffer.from(trimmed, 'base64').toString('utf8')
      } catch {
        return trimmed
      }
    })()

    const parsed = JSON.parse(jsonText) as Partial<ServiceAccountCredentials>
    if (!parsed.client_email || !parsed.private_key) {
      throw new Error(
        'Google service account JSON is missing client_email/private_key',
      )
    }
    return {
      client_email: parsed.client_email,
      private_key: parsed.private_key.replace(/\\n/g, '\n'),
    }
  }

  throw new Error(
    'Missing Google service account credentials. Set GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY (or GOOGLE_SERVICE_ACCOUNT_JSON).',
  )
}

/**
 * Get authenticated Android Publisher client
 */
export function getAndroidPublisher() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      ...getServiceAccountCredentials(),
    },
    scopes: ['https://www.googleapis.com/auth/androidpublisher'],
  })

  return google.androidpublisher({
    version: 'v3',
    auth,
  })
}
