/**
 * Safe file download utility to prevent DOM manipulation race conditions
 * Handles blob downloads with proper cleanup and error handling
 * Supports mobile webview by opening files in new window instead of forcing download
 */

export function safeDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)

  // Check if running in mobile webview
  const isNativeApp =
    typeof window !== 'undefined' && (window as any).isNativeApp === true

  if (isNativeApp) {
    // Mobile webview: Open file in new window for native OS handling
    const newWindow = window.open(url, '_blank')

    if (!newWindow) {
      // Fallback: Try to navigate to the file
      window.location.href = url
    }

    // Cleanup after a delay to allow file to load
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 1000)
  } else {
    // Desktop browser: Standard download approach
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
}

/**
 * Safe file download from URL with proper cleanup
 * Supports mobile webview by opening files in new window instead of forcing download
 */
export function safeDownloadFromUrl(url: string, filename: string): void {
  // Check if running in mobile webview
  const isNativeApp =
    typeof window !== 'undefined' && (window as any).isNativeApp === true

  if (isNativeApp) {
    // Mobile webview: Open file in new window for native OS handling
    const newWindow = window.open(url, '_blank')

    if (!newWindow) {
      // Fallback: Try to navigate to the file
      window.location.href = url
    }
  } else {
    // Desktop browser: Standard download approach
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
}
