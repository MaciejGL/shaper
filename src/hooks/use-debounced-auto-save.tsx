'use client'

import { useCallback, useEffect, useRef } from 'react'

interface UseDebouncedAutoSaveProps {
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
   * Whether auto-save is enabled
   */
  enabled?: boolean
  /**
   * Delay in milliseconds to wait after user activity stops (default: 5000ms = 5s)
   */
  debounceDelay?: number
  /**
   * Additional activity events to listen for (default: ['keydown', 'mousedown', 'scroll'])
   */
  activityEvents?: string[]
}

/**
 * Custom hook that debounces auto-save based on user activity
 *
 * This hook tracks various user interactions and only triggers auto-save
 * after the user has been inactive for the specified delay period.
 *
 * **Key Features:**
 * - 🎯 **True Activity Tracking**: Monitors keyboard, mouse, and scroll events
 * - ⏰ **Smart Debouncing**: Resets timer on any user activity
 * - 🚫 **Respectful**: Only saves when there are actual changes and user is inactive
 * - 🔄 **Efficient**: Prevents unnecessary save calls during active editing
 *
 * @example
 * ```tsx
 * useDebouncedAutoSave({
 *   isDirty: hasUnsavedChanges,
 *   onSave: async () => await saveData(),
 *   isSaving: isSaveInProgress,
 *   enabled: shouldAutoSave,
 *   debounceDelay: 5000, // Wait 5s after user stops activity
 * })
 * ```
 */
export function useDebouncedAutoSave({
  isDirty,
  onSave,
  isSaving = false,
  enabled = true,
  debounceDelay = 5000,
  activityEvents = ['keyup', 'mouseup', 'touchend'],
}: UseDebouncedAutoSaveProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const savePromiseRef = useRef<Promise<void> | null>(null)
  const microDebounceRef = useRef<NodeJS.Timeout | null>(null)

  // Helper function to clear the save timeout
  const clearSaveTimeout = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
  }, [])

  // Helper function to clear micro-debounce timeout
  const clearMicroDebounce = useCallback(() => {
    if (microDebounceRef.current) {
      clearTimeout(microDebounceRef.current)
      microDebounceRef.current = null
    }
  }, [])

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
      console.log('🚀 Debounced auto-save triggered after user inactivity')
      const savePromise = Promise.resolve(onSave())
      savePromiseRef.current = savePromise
      await savePromise
      console.log('✅ Debounced auto-save completed successfully')
    } catch (error) {
      console.error('❌ Debounced auto-save failed:', error)
    } finally {
      savePromiseRef.current = null
    }
  }, [isDirty, isSaving, enabled, onSave])

  // Handle user activity detection with micro-debouncing
  const handleUserActivity = useCallback(() => {
    if (!enabled || !isDirty || isSaving) return

    console.log('🎯 User activity detected - micro-debouncing...')

    // Clear existing micro-debounce to batch rapid events
    clearMicroDebounce()

    // Set micro-debounce (100ms) to batch rapid events together
    microDebounceRef.current = setTimeout(() => {
      console.log(
        `🎯 Micro-debounce complete - resetting ${debounceDelay / 1000}s timer`,
      )

      // Clear existing main timeout to reset the debounce timer
      clearSaveTimeout()

      // Set the main timeout - this is the core debounce logic
      saveTimeoutRef.current = setTimeout(() => {
        console.log(
          `⏰ ${debounceDelay / 1000}s timer completed - triggering auto-save`,
        )
        performSave()
      }, debounceDelay)

      console.log(
        `✅ Main timer set for ${debounceDelay}ms, timeout ID:`,
        saveTimeoutRef.current,
      )
    }, 100) // 100ms micro-debounce to batch rapid events

    console.log(
      '✅ Micro-debounce set for 100ms, timeout ID:',
      microDebounceRef.current,
    )
  }, [
    enabled,
    isDirty,
    isSaving,
    debounceDelay,
    clearSaveTimeout,
    clearMicroDebounce,
    performSave,
  ])

  // Set up activity event listeners
  useEffect(() => {
    if (!enabled) return

    // Add event listeners for user activity
    activityEvents.forEach((event) => {
      document.addEventListener(event, handleUserActivity, { passive: true })
    })

    // Cleanup
    return () => {
      activityEvents.forEach((event) => {
        document.removeEventListener(event, handleUserActivity)
      })
      clearSaveTimeout()
      clearMicroDebounce()
    }
  }, [
    enabled,
    handleUserActivity,
    activityEvents,
    clearSaveTimeout,
    clearMicroDebounce,
  ])

  // Clear timeout when no changes or saving
  useEffect(() => {
    if (!enabled || !isDirty || isSaving) {
      clearSaveTimeout()
      clearMicroDebounce()
    }
  }, [enabled, isDirty, isSaving, clearSaveTimeout, clearMicroDebounce])

  // Force save function for manual triggering
  const forceSave = useCallback(() => {
    clearSaveTimeout()
    clearMicroDebounce()
    return performSave()
  }, [clearSaveTimeout, clearMicroDebounce, performSave])

  return {
    forceSave,
    clearSaveTimeout,
  }
}
