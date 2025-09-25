/**
 * Theme transition utility using View Transitions API
 * Based on https://theme-toggle.rdsx.dev/
 *
 * Browser Support:
 * - Chrome 111+ ✅
 * - Edge 111+ ✅
 * - Safari 18+ ✅
 * - Firefox: Not yet supported (graceful fallback)
 *
 * The function automatically falls back to immediate theme switching
 * on browsers that don't support View Transitions API.
 */

// Type assertion for View Transitions API compatibility
type ViewTransitionDocument = Document & {
  startViewTransition?: (callback: () => void) => unknown
}

type ThemeSwitcher = (theme: string) => void

/**
 * Switches theme with smooth transition using View Transitions API
 * Falls back to immediate switch if View Transitions API is not supported
 * Includes mobile performance optimizations
 */
export function switchThemeWithTransition(
  themeSetter: ThemeSwitcher,
  newTheme: string,
) {
  const switchTheme = () => {
    themeSetter(newTheme)
  }

  // Check if View Transitions API is supported
  const doc = document as ViewTransitionDocument
  if (!doc.startViewTransition) {
    switchTheme()
    return
  }

  // For very low-end mobile devices, skip animation if performance is critical
  const isNative = typeof window !== 'undefined' && window.isNativeApp === true
  const shouldSkipAnimation =
    isNative &&
    navigator.hardwareConcurrency &&
    navigator.hardwareConcurrency <= 2

  if (shouldSkipAnimation) {
    switchTheme()
    return
  }

  // Add a small delay on mobile to ensure proper state sync
  if (isNative) {
    requestAnimationFrame(() => {
      doc.startViewTransition(switchTheme)
    })
  } else {
    // Use View Transitions API for smooth animation
    doc.startViewTransition(switchTheme)
  }
}
