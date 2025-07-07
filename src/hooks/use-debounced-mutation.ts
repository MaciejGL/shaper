import { debounce } from 'lodash'
import { useCallback, useEffect, useRef, useState } from 'react'

interface UseDebouncedMutationOptions<TVariables, TData> {
  /**
   * The mutation function to debounce
   */
  mutationFn: (variables: TVariables) => Promise<TData>
  /**
   * Delay in milliseconds to wait after the last change (default: 700ms)
   */
  delay?: number
  /**
   * Called when mutation succeeds
   */
  onSuccess?: (data: TData, variables: TVariables) => void
  /**
   * Called when mutation fails
   */
  onError?: (error: Error, variables: TVariables) => void
  /**
   * Called when mutation starts
   */
  onMutate?: (variables: TVariables) => void
  /**
   * Whether the mutation is enabled
   */
  enabled?: boolean
}

/**
 * Custom hook for debouncing mutations, perfect for text inputs and form fields
 *
 * This hook prevents excessive API calls when users type rapidly by:
 * - Debouncing the actual mutation call
 * - Providing loading states
 * - Handling cancellation of pending mutations
 * - Supporting optimistic updates
 *
 * @example
 * ```tsx
 * // For text input debouncing
 * const { mutate: updateTitle, isPending, cancel } = useDebouncedMutation({
 *   mutationFn: async (variables: { id: string, title: string }) => {
 *     return updateTrainingPlanTitle(variables)
 *   },
 *   delay: 700,
 *   onSuccess: () => {
 *     console.log('Title updated!')
 *   },
 *   onError: (error) => {
 *     console.error('Failed to update title:', error)
 *   }
 * })
 *
 * // In your input handler
 * const handleTitleChange = (newTitle: string) => {
 *   setLocalTitle(newTitle) // Update local state immediately
 *   mutate({ id: planId, title: newTitle }) // Debounced API call
 * }
 * ```
 */
export function useDebouncedMutation<TVariables, TData>({
  mutationFn,
  delay = 700,
  onSuccess,
  onError,
  onMutate,
  enabled = true,
}: UseDebouncedMutationOptions<TVariables, TData>) {
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Store the current callbacks in refs to avoid recreating the debounced function
  const onSuccessRef = useRef(onSuccess)
  const onErrorRef = useRef(onError)
  const onMutateRef = useRef(onMutate)
  const mutationFnRef = useRef(mutationFn)

  // Update refs when callbacks change
  onSuccessRef.current = onSuccess
  onErrorRef.current = onError
  onMutateRef.current = onMutate
  mutationFnRef.current = mutationFn

  // Track the latest variables to prevent stale mutations
  const latestVariablesRef = useRef<TVariables | null>(null)

  // Create a stable debounced mutation function
  const debouncedMutateRef = useRef<ReturnType<typeof debounce> | null>(null)

  // Initialize the debounced function once
  if (!debouncedMutateRef.current) {
    debouncedMutateRef.current = debounce(async (variables: TVariables) => {
      if (!enabled) return

      // Check if this is still the latest call
      if (latestVariablesRef.current !== variables) {
        return // Ignore stale calls
      }

      try {
        setIsPending(true)
        setError(null)

        // Call onMutate callback
        onMutateRef.current?.(variables)

        // Execute the actual mutation
        const result = await mutationFnRef.current(variables)

        // Only process result if still the latest call
        if (latestVariablesRef.current === variables) {
          onSuccessRef.current?.(result, variables)
        }
      } catch (err) {
        // Only handle error if still the latest call
        if (latestVariablesRef.current === variables) {
          const error = err instanceof Error ? err : new Error(String(err))
          setError(error)
          onErrorRef.current?.(error, variables)
        }
      } finally {
        // Only update pending state if still the latest call
        if (latestVariablesRef.current === variables) {
          setIsPending(false)
        }
      }
    }, delay)
  }

  // Debounced mutate function
  const mutate = useCallback(
    (variables: TVariables) => {
      if (!enabled) return

      // Store the latest variables
      latestVariablesRef.current = variables

      // Clear any previous error
      setError(null)

      // Call the debounced function
      debouncedMutateRef.current?.(variables)
    },
    [enabled],
  )

  // Cancel function to cancel pending mutations
  const cancel = useCallback(() => {
    debouncedMutateRef.current?.cancel()
    setIsPending(false)
    setError(null)
    latestVariablesRef.current = null
  }, [])

  // Force execute the mutation immediately (skip debounce)
  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      if (!enabled) {
        throw new Error('Mutation is disabled')
      }

      // Cancel any pending debounced calls
      cancel()

      // Update latest variables
      latestVariablesRef.current = variables

      try {
        setIsPending(true)
        setError(null)

        onMutateRef.current?.(variables)
        const result = await mutationFnRef.current(variables)

        onSuccessRef.current?.(result, variables)
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err))
        setError(error)
        onErrorRef.current?.(error, variables)
        throw error
      } finally {
        setIsPending(false)
      }
    },
    [enabled, cancel],
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedMutateRef.current?.cancel()
    }
  }, [])

  return {
    mutate,
    mutateAsync,
    cancel,
    isPending,
    error,
  }
}
