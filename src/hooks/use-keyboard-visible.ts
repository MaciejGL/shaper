'use client'

import { useEffect, useState } from 'react'

/**
 * Hook to detect when virtual keyboard is visible on mobile devices
 * Uses a combination of:
 * - Visual Viewport API (modern browsers)
 * - Viewport height changes (fallback)
 * - Input focus tracking (immediate feedback)
 */
export function useKeyboardVisible() {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false)
  const [hasInputFocus, setHasInputFocus] = useState(false)

  useEffect(() => {
    // Track input focus state globally
    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      const isInput = target.matches(
        'input, textarea, [contenteditable="true"], [role="textbox"]',
      )
      if (isInput) {
        setHasInputFocus(true)
      }
    }

    const handleFocusOut = (event: FocusEvent) => {
      const target = event.target as HTMLElement
      const isInput = target.matches(
        'input, textarea, [contenteditable="true"], [role="textbox"]',
      )
      if (isInput) {
        // Small delay to account for focus switching between inputs
        setTimeout(() => {
          const activeElement = document.activeElement as HTMLElement
          const stillFocusedOnInput = activeElement?.matches(
            'input, textarea, [contenteditable="true"], [role="textbox"]',
          )
          setHasInputFocus(!!stillFocusedOnInput)
        }, 100)
      }
    }

    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)

    // Visual Viewport API for modern browsers
    if (window.visualViewport) {
      const handleViewportChange = () => {
        const viewport = window.visualViewport!
        const heightDiff = window.innerHeight - viewport.height
        // Consider keyboard visible if viewport height is significantly smaller
        setIsKeyboardVisible(heightDiff > 150)
      }

      window.visualViewport.addEventListener('resize', handleViewportChange)

      return () => {
        document.removeEventListener('focusin', handleFocusIn)
        document.removeEventListener('focusout', handleFocusOut)
        window.visualViewport?.removeEventListener(
          'resize',
          handleViewportChange,
        )
      }
    }

    // Fallback: Monitor window height changes for older browsers
    const initialHeight = window.innerHeight

    const handleResize = () => {
      const newHeight = window.innerHeight
      const heightDiff = initialHeight - newHeight

      // Threshold for keyboard detection (adjust as needed)
      const isKeyboardShown =
        heightDiff > 150 && newHeight < initialHeight * 0.75

      setIsKeyboardVisible(isKeyboardShown)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Return true if either input is focused OR keyboard is detected via viewport
  return hasInputFocus || isKeyboardVisible
}
