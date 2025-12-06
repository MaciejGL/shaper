import type { DocumentProps } from '@react-pdf/renderer'
import { Font, pdf } from '@react-pdf/renderer'
import type { JSXElementConstructor, ReactElement } from 'react'

// Get font base URL - works both client-side and server-side
function getFontBaseUrl(): string {
  // Client-side
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  // Server-side - use production URL or NEXTAUTH_URL
  return process.env.NEXTAUTH_URL || 'https://hypro.app'
}

// Register Inter font for PDF using local WOFF font files
// Works both client-side (local fonts) and server-side (production URL)
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: `${getFontBaseUrl()}/fonts/Inter-Regular.woff`,
      fontWeight: 400,
    },
    {
      src: `${getFontBaseUrl()}/fonts/Inter-Medium.woff`,
      fontWeight: 500,
    },
    {
      src: `${getFontBaseUrl()}/fonts/Inter-SemiBold.woff`,
      fontWeight: 600,
    },
    {
      src: `${getFontBaseUrl()}/fonts/Inter-Bold.woff`,
      fontWeight: 700,
    },
  ],
})

/**
 * PDF Styling Constants
 * Reusable constants for consistent PDF styling across the application
 */
export const PDF_STYLES = {
  colors: {
    primary: '#0f172a',
    secondary: '#64748b',
    border: '#e2e8f0',
    text: '#1e293b',
    muted: '#64748b',
  },
  fonts: {
    small: 10,
    base: 12,
    medium: 14,
    large: 16,
    xlarge: 20,
    xxlarge: 24,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  page: {
    padding: 40,
    margin: 0,
  },
} as const

export async function downloadPDF(
  document: ReactElement<
    DocumentProps,
    string | JSXElementConstructor<unknown>
  >,
  filename: string,
): Promise<void> {
  try {
    const blob = await pdf(document).toBlob()

    const isNativeApp =
      typeof window !== 'undefined' && window?.isNativeApp === true
    const hasNativeDownload =
      isNativeApp && typeof window?.nativeApp?.downloadFile === 'function'

    if (hasNativeDownload) {
      const base64Data = await blobToBase64(blob)
      window?.nativeApp?.downloadFile({
        base64Data,
        filename: `${filename}.pdf`,
        mimeType: 'application/pdf',
      })
    } else {
      const url = URL.createObjectURL(blob)
      const link = window.document.createElement('a')
      link.href = url
      link.download = `${filename}.pdf`

      window.document.body.appendChild(link)
      link.click()

      window.document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result as string
      const base64Data = base64.split(',')[1]
      resolve(base64Data)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Check if running in native mobile app
 */
export function isNativeApp(): boolean {
  return typeof window !== 'undefined' && window?.isNativeApp === true
}

/**
 * Open PDF in system browser (for mobile) or download directly (for web)
 *
 * On mobile apps: Opens the PDF URL in the system browser (Safari/Chrome)
 * which provides native PDF viewing and download capabilities.
 *
 * On web: Falls back to direct link opening.
 */
export function openPdfInBrowser(pdfUrl: string): void {
  if (typeof window === 'undefined') return

  const absoluteUrl = pdfUrl.startsWith('http')
    ? pdfUrl
    : `${window.location.origin}${pdfUrl.startsWith('/') ? pdfUrl : `/${pdfUrl}`}`

  // On iOS native app: use bridge to open in system browser
  if (
    window.isNativeApp &&
    window.mobilePlatform === 'ios' &&
    window.nativeApp?.openExternalUrl
  ) {
    window.nativeApp.openExternalUrl(absoluteUrl)
    return
  }

  // On Android native app or web: open in new tab
  // Android WebView will handle PDF natively, web browsers have built-in PDF viewers
  window.open(absoluteUrl, '_blank', 'noopener,noreferrer')
}

/**
 * Format date for PDF display
 */
export function formatPDFDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

/**
 * Generate a unique filename with timestamp
 */
type GenerateFilenameProps = {
  prefix: string
  skipTimestamp?: boolean
}
export function generateFilename({
  prefix,
  skipTimestamp,
}: GenerateFilenameProps): string {
  if (skipTimestamp) {
    return `${prefix}`
  }
  const timestamp = new Date().toISOString().split('T')[0]
  return `${prefix}-${timestamp}`
}
