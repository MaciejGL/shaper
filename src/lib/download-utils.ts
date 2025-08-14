/**
 * Safe file download utility to prevent DOM manipulation race conditions
 * Handles blob downloads with proper cleanup and error handling
 */

export function safeDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none' // Hide the element

  try {
    document.body.appendChild(a)
    a.click()
  } finally {
    // Always clean up, regardless of errors
    URL.revokeObjectURL(url)
    // Safe removal - only remove if still in DOM
    if (document.body.contains(a)) {
      document.body.removeChild(a)
    }
  }
}

/**
 * Safe file download from URL with proper cleanup
 */
export function safeDownloadFromUrl(url: string, filename: string): void {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'

  try {
    document.body.appendChild(a)
    a.click()
  } finally {
    // Safe removal - only remove if still in DOM
    if (document.body.contains(a)) {
      document.body.removeChild(a)
    }
  }
}
