'use client'

import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'

interface UseAutoSaveOnNavigationProps {
  /**
   * Whether there are unsaved changes that need to be saved
   */
  isDirty: boolean
  /**
   * Function to call to save the changes
   */
  onSave: () => Promise<void> | void
  /**
   * Whether a save operation is currently in progress
   */
  isSaving?: boolean
  /**
   * Whether auto-save on navigation is enabled
   */
  enabled?: boolean
  /**
   * Delay in milliseconds before auto-saving after changes (default: 30000ms = 30s)
   */
  autoSaveDelay?: number
}

/**
 * Custom hook that automatically saves changes with debounced timing and immediate save on navigation
 *
 * This hook prevents data loss with a two-tier approach:
 *
 * **⏰ Debounced Auto-Save (Default: 30s after changes stop)**
 * - Waits for user to stop making changes before saving
 * - Resets timer on each new change to avoid saving mid-edit
 * - Perfect for preventing data loss during active editing
 *
 * **🚨 Immediate Save on Critical Actions**
 * 1. 🚪 **Browser/Tab Close**: When user closes browser tab or window (beforeunload event)
 * 2. 🔄 **Page Navigation**: When user navigates to a different page within the app (pathname change)
 * 3. 👁️ **Tab Switch**: When page becomes hidden (user switches tabs, minimizes window, etc.)
 *
 * The hook is designed to be non-intrusive and will only save when:
 * - There are actual unsaved changes (isDirty = true)
 * - No save operation is currently in progress (isSaving = false)
 * - The hook is enabled (enabled = true)
 *
 * @example
 * ```tsx
 * // In your component or context
 * useAutoSaveOnNavigation({
 *   isDirty: hasUnsavedChanges,
 *   onSave: async () => await saveData(),
 *   isSaving: isSaveInProgress,
 *   enabled: shouldAutoSave,
 *   autoSaveDelay: 30000, // Optional: customize delay (default: 30s)
 * })
 * ```
 */
export function useAutoSaveOnNavigation({
  isDirty,
  onSave,
  isSaving = false,
  enabled = true,
  autoSaveDelay = 30000, // 30 seconds default
}: UseAutoSaveOnNavigationProps) {
  const pathname = usePathname()
  const savePromiseRef = useRef<Promise<void> | null>(null)
  const previousPathnameRef = useRef<string>(pathname)
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to perform the save operation
  const performSave = useCallback(async (): Promise<void> => {
    // Don't save if there are no changes, already saving, or disabled
    if (!isDirty || isSaving || !enabled) {
      return
    }

    // Prevent multiple simultaneous save operations
    if (savePromiseRef.current) {
      return savePromiseRef.current
    }

    try {
      const savePromise = Promise.resolve(onSave())
      savePromiseRef.current = savePromise
      await savePromise
    } catch (error) {
      console.error('❌ Auto-save on navigation failed:', error)
    } finally {
      savePromiseRef.current = null
    }
  }, [isDirty, isSaving, enabled, onSave])

  // Helper function to clear the auto-save timeout
  const clearAutoSaveTimeout = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
      autoSaveTimeoutRef.current = null
    }
  }

  // Debounced auto-save: wait for specified delay after changes stop
  useEffect(() => {
    if (!enabled) return

    // Skip debounced save if autoSaveDelay is 0 (immediate save mode)
    if (autoSaveDelay === 0) return

    // Clear any existing timeout
    clearAutoSaveTimeout()

    // If there are unsaved changes and we're not currently saving
    if (isDirty && !isSaving) {
      // Set a new timeout to save after the delay
      autoSaveTimeoutRef.current = setTimeout(() => {
        performSave()
      }, autoSaveDelay)
    }

    // Cleanup timeout on unmount or when dependencies change
    return clearAutoSaveTimeout
  }, [isDirty, isSaving, enabled, autoSaveDelay, performSave])

  useEffect(() => {
    if (!enabled) return

    // Handle browser/tab close - beforeunload event
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty && !isSaving) {
        // Clear the debounced save timeout since we're saving immediately
        clearAutoSaveTimeout()

        // Attempt to save synchronously
        performSave()

        // Show browser confirmation dialog for unsaved changes
        event.preventDefault()
        event.returnValue =
          'You have unsaved changes. Are you sure you want to leave?'
        return event.returnValue
      }
    }

    // Handle page visibility change (tab switch, minimize, etc.)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && isDirty && !isSaving) {
        // Clear the debounced save timeout since we're saving immediately
        clearAutoSaveTimeout()

        // Save when page becomes hidden
        performSave()
      }
    }

    // Add event listeners
    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [isDirty, isSaving, enabled, performSave])

  // Handle Next.js route changes by listening to pathname changes
  useEffect(() => {
    if (!enabled) return

    // Save when pathname changes (navigation detected)
    if (previousPathnameRef.current !== pathname && isDirty && !isSaving) {
      // Clear the debounced save timeout since we're saving immediately
      clearAutoSaveTimeout()

      performSave()
    }

    // Update the previous pathname reference
    previousPathnameRef.current = pathname
  }, [pathname, isDirty, isSaving, enabled, performSave])

  return {
    performSave,
  }
}
