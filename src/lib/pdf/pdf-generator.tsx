import type { DocumentProps } from '@react-pdf/renderer'
import { Font, pdf } from '@react-pdf/renderer'
import type { JSXElementConstructor, ReactElement } from 'react'

// Register Inter font for PDF using local WOFF font files
// Using WOFF files from public/fonts directory (downloaded from Fontsource CDN)
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: `${typeof window !== 'undefined' ? window.location.origin : ''}/fonts/Inter-Regular.woff`,
      fontWeight: 400,
    },
    {
      src: `${typeof window !== 'undefined' ? window.location.origin : ''}/fonts/Inter-Medium.woff`,
      fontWeight: 500,
    },
    {
      src: `${typeof window !== 'undefined' ? window.location.origin : ''}/fonts/Inter-SemiBold.woff`,
      fontWeight: 600,
    },
    {
      src: `${typeof window !== 'undefined' ? window.location.origin : ''}/fonts/Inter-Bold.woff`,
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
