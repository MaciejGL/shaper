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

  // Use View Transitions API for smooth animation
  doc.startViewTransition(switchTheme)
}
