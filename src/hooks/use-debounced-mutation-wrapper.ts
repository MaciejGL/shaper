import { debounce } from 'lodash'
import { useCallback, useEffect, useRef } from 'react'

interface MutationCallOptions<TData> {
  onSuccess?: (data: TData, ...args: unknown[]) => void
  onError?: (error: unknown, ...args: unknown[]) => void
}

interface DebounceMutationOptions<TData, TVariables> {
  /**
   * Delay in milliseconds to wait after the last call (default: 700ms)
   */
  delay?: number
  /**
   * Called when mutation succeeds
   */
  onSuccess?: (data: TData, variables: TVariables) => void
  /**
   * Called when mutation fails
   */
  onError?: (error: unknown, variables: TVariables) => void
  /**
   * Whether debouncing is enabled
   */
  enabled?: boolean
}

/**
 * Creates a debounced version of any mutation function (pure function version)
 *
 * This function creates a debounced version of your mutation that:
 * - Cancels previous pending calls when a new one comes in
 * - Only executes the latest call after the specified delay
 * - Preserves the original mutation's behavior and callbacks
 *
 * @param mutationFn - The original mutation function to wrap
 * @param options - Debouncing options
 * @returns A debounced version of the mutation function with a cancel method
 *
 * @example
 * ```tsx
 * // Create debounced mutation (outside React component)
 * const debouncedUpdateDetails = createDebouncedMutation(
 *   updateTrainingPlanDetails,
 *   {
 *     delay: 700,
 *     onSuccess: (data, variables) => {
 *       console.log('Updated successfully')
 *     },
 *     onError: (error, variables) => {
 *       console.error('Failed to update:', error)
 *     }
 *   }
 * )
 *
 * // Use it
 * debouncedUpdateDetails.mutate({ input: { id: trainingId, title: newTitle } })
 *
 * // Cancel pending calls
 * debouncedUpdateDetails.cancel()
 * ```
 */
export function createDebouncedMutation<TData = unknown, TVariables = unknown>(
  mutationFn: (
    variables: TVariables,
    options?: MutationCallOptions<TData>,
  ) => Promise<TData> | void,
  wrapperOptions: DebounceMutationOptions<TData, TVariables> = {},
) {
  const {
    delay = 700,
    onSuccess: wrapperOnSuccess,
    onError: wrapperOnError,
    enabled = true,
  } = wrapperOptions

  // Track latest call to prevent stale mutations
  let latestCall: {
    variables: TVariables
    options?: MutationCallOptions<TData>
  } | null = null

  // Create debounced function
  const debouncedFn = debounce(
    async (variables: TVariables, options?: MutationCallOptions<TData>) => {
      if (!enabled) return

      // Check if this is still the latest call
      if (latestCall?.variables !== variables) {
        return // Ignore stale calls
      }

      try {
        // Execute the original mutation
        const result = await mutationFn(variables, {
          ...options,
          onSuccess: (data: TData, ...args: unknown[]) => {
            // Only process if still the latest call
            if (latestCall?.variables === variables) {
              // Call wrapper's onSuccess first
              wrapperOnSuccess?.(data, variables)
              // Then call the individual call's onSuccess
              options?.onSuccess?.(data, ...args)
            }
          },
          onError: (error: unknown, ...args: unknown[]) => {
            // Only process if still the latest call
            if (latestCall?.variables === variables) {
              // Call wrapper's onError first
              wrapperOnError?.(error, variables)
              // Then call the individual call's onError
              options?.onError?.(error, ...args)
            }
          },
        })

        return result
      } catch (error) {
        // Handle any errors that weren't caught by onError
        if (latestCall?.variables === variables) {
          wrapperOnError?.(error, variables)
          options?.onError?.(error, variables)
        }
        throw error
      }
    },
    delay,
  )

  return {
    mutate: (variables: TVariables, options?: MutationCallOptions<TData>) => {
      if (!enabled) {
        // If disabled, call original mutation immediately
        return mutationFn(variables, options)
      }

      // Store the latest call
      latestCall = { variables, options }

      // Call the debounced function
      return debouncedFn(variables, options)
    },
    cancel: () => {
      debouncedFn.cancel()
      latestCall = null
    },
    flush: () => debouncedFn.flush(),
  }
}

/**
 * Hook version of the debounce wrapper for use in React components
 *
 * @example
 * ```tsx
 * const { mutateAsync: updateDetails } = useUpdateTrainingPlanDetailsMutation()
 *
 * const debouncedUpdateDetails = useDebouncedMutationWrapper(updateDetails, {
 *   delay: 700,
 *   onSuccess: () => {
 *     setIsDirty(false)
 *     debouncedInvalidateQueries()
 *   }
 * })
 *
 * // Use in event handlers
 * const handleTitleChange = (newTitle: string) => {
 *   // Update local state immediately
 *   setLocalTitle(newTitle)
 *
 *   // Debounced API call
 *   debouncedUpdateDetails({
 *     input: { id: trainingId, title: newTitle }
 *   })
 * }
 * ```
 */
export function useDebouncedMutationWrapper<
  TData = unknown,
  TVariables = unknown,
>(
  mutationFn: (
    variables: TVariables,
    options?: MutationCallOptions<TData>,
  ) => Promise<TData> | void,
  options: DebounceMutationOptions<TData, TVariables> = {},
) {
  const debouncedMutationRef = useRef<ReturnType<
    typeof createDebouncedMutation<TData, TVariables>
  > | null>(null)

  // Create the wrapper once
  if (!debouncedMutationRef.current) {
    debouncedMutationRef.current = createDebouncedMutation(mutationFn, options)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedMutationRef.current?.cancel()
    }
  }, [])

  // Return just the mutate function for easier usage
  return useCallback(
    (variables: TVariables, options?: MutationCallOptions<TData>) => {
      return debouncedMutationRef.current?.mutate(variables, options)
    },
    [],
  )
}
