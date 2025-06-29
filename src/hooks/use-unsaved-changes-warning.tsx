'use client'

import { useIsMutating } from '@tanstack/react-query'
import { useEffect } from 'react'

interface UseUnsavedChangesWarningProps {
  /**
   * Whether there are unsaved changes
   */
  isDirty: boolean
  /**
   * Whether the warning is enabled
   */
  enabled?: boolean
  /**
   * Custom warning message
   */
  warningMessage?: string
  /**
   * Optional mutation key filter - only track specific mutations
   * If not provided, tracks ALL mutations globally
   */
  mutationKeyFilter?: string[]
}

/**
 * Custom hook that warns users about unsaved changes when they try to leave the page
 *
 * This hook prevents data loss by showing browser confirmation dialogs when:
 * 1. There are unsaved changes (isDirty = true)
 * 2. There are any pending mutations (automatically detected via TanStack Query)
 *
 * Unlike auto-save hooks, this ONLY shows warnings and does NOT perform any save operations.
 *
 * @example
 * ```tsx
 * // Track all mutations globally
 * useUnsavedChangesWarning({
 *   isDirty: hasUnsavedChanges,
 *   enabled: true,
 * })
 *
 * // Track only specific mutations
 * useUnsavedChangesWarning({
 *   isDirty: hasUnsavedChanges,
 *   enabled: true,
 *   mutationKeyFilter: ['updateTrainingPlan', 'createTrainingPlan']
 * })
 * ```
 */
export function useUnsavedChangesWarning({
  isDirty,
  enabled = true,
  warningMessage = 'You have unsaved changes or operations in progress. Are you sure you want to leave?',
  mutationKeyFilter,
}: UseUnsavedChangesWarningProps) {
  // Automatically detect any pending mutations using TanStack Query
  const pendingMutationsCount = useIsMutating({
    // If mutationKeyFilter is provided, only track those specific mutations
    // Otherwise, track all mutations globally
    mutationKey: mutationKeyFilter,
  })

  const hasPendingMutations = pendingMutationsCount > 0

  useEffect(() => {
    if (!enabled) return

    // Handle browser/tab close - beforeunload event
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      // Show warning if there are unsaved changes OR pending mutations
      if (isDirty || hasPendingMutations) {
        // Show browser confirmation dialog
        event.preventDefault()
        event.returnValue = warningMessage
        return event.returnValue
      }
    }

    // Add event listener
    window.addEventListener('beforeunload', handleBeforeUnload)

    // Cleanup
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [isDirty, hasPendingMutations, enabled, warningMessage])

  // Return current protection status for debugging
  return {
    isProtected: enabled && (isDirty || hasPendingMutations),
    isDirty,
    hasPendingMutations,
    pendingMutationsCount,
  }
}
