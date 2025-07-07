import { useQueryClient } from '@tanstack/react-query'
import { debounce } from 'lodash'
import { useCallback, useEffect, useRef } from 'react'

interface UseDebouncedInvalidationOptions {
  /**
   * Query keys to invalidate. Can be a single key or array of keys
   */
  queryKey?: string[] | string[][]
  /**
   * Multiple query keys to invalidate
   */
  queryKeys?: string[]
  /**
   * Delay in milliseconds to wait after the last call before executing (default: 500ms)
   */
  delay?: number
}

/**
 * Custom hook that provides a debounced query invalidation function
 *
 * This hook prevents excessive API calls when users perform rapid actions
 * that would normally trigger immediate query invalidations.
 *
 * @example
 * ```tsx
 * // Single query key
 * const debouncedInvalidate = useDebouncedInvalidation({
 *   queryKey: ['GetTemplateTrainingPlanById'],
 *   delay: 500
 * })
 *
 * // Multiple query keys
 * const debouncedInvalidate = useDebouncedInvalidation({
 *   queryKeys: ['GetTemplateTrainingPlanById', 'GetTemplates'],
 *   delay: 300
 * })
 *
 * // Usage in mutation callbacks
 * onSuccess: () => {
 *   setIsDirty(false)
 *   debouncedInvalidate()
 * }
 * ```
 */
export function useDebouncedInvalidation({
  queryKey,
  queryKeys,
  delay = 1000,
}: UseDebouncedInvalidationOptions) {
  const queryClient = useQueryClient()

  // Store the current query keys in refs to avoid recreating the debounced function
  const queryKeyRef = useRef(queryKey)
  const queryKeysRef = useRef(queryKeys)

  // Update refs when values change
  queryKeyRef.current = queryKey
  queryKeysRef.current = queryKeys

  // Create a stable debounced function that doesn't change on every render
  const debouncedInvalidateRef = useRef<ReturnType<typeof debounce> | null>(
    null,
  )

  // Initialize the debounced function once
  if (!debouncedInvalidateRef.current) {
    debouncedInvalidateRef.current = debounce(() => {
      // Use the current values from refs
      const currentQueryKey = queryKeyRef.current
      const currentQueryKeys = queryKeysRef.current

      // Invalidate single query key
      if (currentQueryKey) {
        queryClient.invalidateQueries({ queryKey: currentQueryKey })
      }

      // Invalidate multiple query keys
      if (currentQueryKeys) {
        currentQueryKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] })
        })
      }
    }, delay)
  }

  // Return a stable callback that calls the debounced function
  const debouncedInvalidate = useCallback(() => {
    debouncedInvalidateRef.current?.()
  }, [])

  // Cleanup the debounced function on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      debouncedInvalidateRef.current?.cancel()
    }
  }, [])

  return debouncedInvalidate
}
