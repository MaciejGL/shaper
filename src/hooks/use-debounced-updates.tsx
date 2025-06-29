'use client'

import { useCallback, useRef } from 'react'

interface UseDebouncedUpdatesProps {
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
   * Delay in milliseconds to wait after updates stop (default: 5000ms = 5s)
   */
  debounceDelay?: number
}

/**
 * Custom hook that wraps update functions with debouncing auto-save logic
 *
 * This hook provides a cleaner approach to debounced auto-save by tracking
 * actual data changes (via wrapped update functions) rather than DOM events.
 *
 * @example
 * ```tsx
 * const { wrapWithDebounce } = useDebouncedUpdates({
 *   onSave: async () => await saveData(),
 *   isSaving: isSaveInProgress,
 *   enabled: shouldAutoSave,
 *   debounceDelay: 5000,
 * })
 *
 * const debouncedUpdateWeek = wrapWithDebounce(originalUpdateWeek)
 * ```
 */
export function useDebouncedUpdates({
  onSave,
  isSaving = false,
  enabled = true,
  debounceDelay = 2000,
}: UseDebouncedUpdatesProps) {
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const savePromiseRef = useRef<Promise<void> | null>(null)

  // Helper function to clear the save timeout
  const clearSaveTimeout = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
      saveTimeoutRef.current = null
    }
  }, [])

  // Helper function to perform the save operation
  const performSave = useCallback(async (): Promise<void> => {
    if (!enabled || isSaving) {
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
      console.error('Debounced auto-save failed:', error)
    } finally {
      savePromiseRef.current = null
    }
  }, [enabled, isSaving, onSave])

  // Function to trigger debounced save
  const triggerDebouncedSave = useCallback(() => {
    if (!enabled || isSaving) return

    // Clear existing timeout to reset the debounce timer
    clearSaveTimeout()

    // Set a new timeout - this is the core debounce logic
    saveTimeoutRef.current = setTimeout(() => {
      performSave()
    }, debounceDelay)
  }, [enabled, isSaving, debounceDelay, clearSaveTimeout, performSave])

  // Function to wrap update methods with debouncing
  const wrapWithDebounce = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <T extends (...args: any[]) => any>(updateFn: T): T => {
      return ((...args: Parameters<T>) => {
        // Call the original update function
        const result = updateFn(...args)

        // Trigger debounced save after the update
        triggerDebouncedSave()

        return result
      }) as T
    },
    [triggerDebouncedSave],
  )

  // Force save function for manual triggering
  const forceSave = useCallback(() => {
    clearSaveTimeout()
    return performSave()
  }, [clearSaveTimeout, performSave])

  return {
    wrapWithDebounce,
    forceSave,
    clearSaveTimeout,
    triggerDebouncedSave,
  }
}
