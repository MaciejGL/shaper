import { useQueryClient } from '@tanstack/react-query'
import { debounce } from 'lodash'
import { useEffect, useMemo, useRef } from 'react'

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
  const debouncedInvalidateRef = useRef<ReturnType<typeof debounce> | null>(
    null,
  )

  // Update refs when values change
  useEffect(() => {
    queryKeyRef.current = queryKey
    queryKeysRef.current = queryKeys
  })

  // Create debounced function in effect (allowed to access refs)
  // Only recreates when delay or queryClient changes
  useEffect(() => {
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

    // Cleanup: cancel debounced function when recreating or unmounting
    return () => {
      debouncedInvalidateRef.current?.cancel()
    }
  }, [delay, queryClient])

  // Return stable callback that invokes the debounced function
  const debouncedInvalidate = useMemo(
    () => () => {
      debouncedInvalidateRef.current?.()
    },
    [],
  )

  return debouncedInvalidate
}
