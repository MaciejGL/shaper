'use client'

import { useCallback, useEffect, useState } from 'react'

// Predefined localStorage keys with their expected value types
export enum LocalStorageKey {
  FAVORITE_EXERCISES = 'favoriteExercises',
  USER_PREFERENCES = 'userPreferences',
  WORKOUT_DRAFT = 'workoutDraft',
  UI_COLLAPSED_SECTIONS = 'uiCollapsedSections',
  SHOW_EXERCISE_IMAGES = 'showExerciseImages',
}

// Type mapping for each key
type LocalStorageValueMap = {
  [LocalStorageKey.FAVORITE_EXERCISES]: string[]
  [LocalStorageKey.USER_PREFERENCES]: Record<string, unknown>
  [LocalStorageKey.WORKOUT_DRAFT]: Record<string, unknown>
  [LocalStorageKey.UI_COLLAPSED_SECTIONS]: Record<string, boolean>
  [LocalStorageKey.SHOW_EXERCISE_IMAGES]: boolean
}

// Helper to check if we're on the client side
const isClient = typeof window !== 'undefined'

/**
 * Type-safe localStorage hook with predefined keys and cross-tab synchronization
 *
 * @param key - Predefined localStorage key
 * @param defaultValue - Default value if key doesn't exist
 * @returns [value, setValue, removeValue] tuple
 */
export function useLocalStorage<K extends LocalStorageKey>(
  key: K,
  defaultValue: LocalStorageValueMap[K],
): [
  LocalStorageValueMap[K],
  (
    value:
      | LocalStorageValueMap[K]
      | ((prev: LocalStorageValueMap[K]) => LocalStorageValueMap[K]),
  ) => void,
  () => void,
] {
  // Initialize state with default value or stored value
  const [storedValue, setStoredValue] = useState<LocalStorageValueMap[K]>(
    () => {
      if (!isClient) {
        return defaultValue
      }

      try {
        const item = window.localStorage.getItem(key)
        if (item === null) {
          return defaultValue
        }
        return JSON.parse(item) as LocalStorageValueMap[K]
      } catch (error) {
        console.warn(`Failed to parse localStorage key "${key}":`, error)
        return defaultValue
      }
    },
  )

  // Update localStorage and state
  const setValue = useCallback(
    (
      value:
        | LocalStorageValueMap[K]
        | ((prev: LocalStorageValueMap[K]) => LocalStorageValueMap[K]),
    ) => {
      try {
        // Allow function updates like useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value

        if (isClient) {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }

        setStoredValue(valueToStore)
      } catch (error) {
        console.error(`Failed to set localStorage key "${key}":`, error)
      }
    },
    [key, storedValue],
  )

  // Remove from localStorage
  const removeValue = useCallback(() => {
    try {
      if (isClient) {
        window.localStorage.removeItem(key)
      }
      setStoredValue(defaultValue)
    } catch (error) {
      console.error(`Failed to remove localStorage key "${key}":`, error)
    }
  }, [key, defaultValue])

  // Listen for storage events (cross-tab synchronization)
  useEffect(() => {
    if (!isClient) return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = JSON.parse(e.newValue) as LocalStorageValueMap[K]
          setStoredValue(newValue)
        } catch (error) {
          console.warn(`Failed to parse storage event for key "${key}":`, error)
        }
      } else if (e.key === key && e.newValue === null) {
        // Key was removed in another tab
        setStoredValue(defaultValue)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key, defaultValue])

  return [storedValue, setValue, removeValue]
}
