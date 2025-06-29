import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Hook for form inputs that need to sync with external state but protect user typing
 * @param externalValue - Value from external source (context, props, etc.)
 * @param onUpdate - Function to call when updating external state
 * @param debounceMs - Debounce delay for updates (default: 300ms)
 */
export function useAutoSyncedInput<T>(
  externalValue: T,
  onUpdate: (value: T) => void,
  debounceMs: number = 300,
) {
  const [localValue, setLocalValue] = useState<T>(externalValue)
  const [isFocused, setIsFocused] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastExternalValue = useRef<T>(externalValue)

  // Update local value when external value changes, but only when not focused
  useEffect(() => {
    if (!isFocused && externalValue !== lastExternalValue.current) {
      setLocalValue(externalValue)
    }
    lastExternalValue.current = externalValue
  }, [externalValue, isFocused])

  // Debounced update to external state
  const debouncedUpdate = useCallback(
    (value: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        onUpdate(value)
      }, debounceMs)
    },
    [onUpdate, debounceMs],
  )

  const handleChange = useCallback(
    (value: T) => {
      setLocalValue(value)
      debouncedUpdate(value)
    },
    [debouncedUpdate],
  )

  const handleFocus = useCallback(() => {
    setIsFocused(true)
  }, [])

  const handleBlur = useCallback(() => {
    setIsFocused(false)
    // Sync with external value on blur in case there were external updates
    if (localValue !== externalValue) {
      onUpdate(localValue)
    }
  }, [localValue, externalValue, onUpdate])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    value: localValue,
    onChange: handleChange,
    onFocus: handleFocus,
    onBlur: handleBlur,
    isFocused,
  }
}
