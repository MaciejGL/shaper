'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { DEFAULT_WEEK_START, WeekStartDay } from '@/lib/date-utils'

interface UserPreferences {
  weekStartsOn: WeekStartDay
  // Future preferences can be added here:
  // timeFormat: '12h' | '24h'
  // dateFormat: 'MM/dd/yyyy' | 'dd/MM/yyyy' | 'yyyy-MM-dd'
  // theme: 'light' | 'dark' | 'system'
}

interface UserPreferencesContextType {
  preferences: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => void
  setWeekStartsOn: (weekStartsOn: WeekStartDay) => void
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(
  null,
)

const PREFERENCES_KEY = 'user-preferences'

export function useUserPreferences() {
  const context = useContext(UserPreferencesContext)
  if (!context) {
    throw new Error(
      'useUserPreferences must be used within a UserPreferencesProvider',
    )
  }
  return context
}

interface UserPreferencesProviderProps {
  children: React.ReactNode
  initialPreferences?: Partial<UserPreferences>
}

export function UserPreferencesProvider({
  children,
  initialPreferences = {},
}: UserPreferencesProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>({
    weekStartsOn: DEFAULT_WEEK_START,
    ...initialPreferences,
  })

  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(PREFERENCES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<UserPreferences>
        setPreferences((prev) => ({ ...prev, ...parsed }))
      }
    } catch (error) {
      console.warn('Failed to load user preferences from localStorage:', error)
    }
  }, [])

  const updatePreferences = useCallback(
    (updates: Partial<UserPreferences>) => {
      const newPreferences = { ...preferences, ...updates }
      setPreferences(newPreferences)

      // Persist to localStorage
      try {
        localStorage.setItem(PREFERENCES_KEY, JSON.stringify(newPreferences))
      } catch (error) {
        console.warn('Failed to save user preferences to localStorage:', error)
      }
    },
    [preferences],
  )

  const setWeekStartsOn = useCallback(
    (weekStartsOn: WeekStartDay) => {
      updatePreferences({ weekStartsOn })
    },
    [updatePreferences],
  )

  const value = useMemo(
    () => ({
      preferences,
      updatePreferences,
      setWeekStartsOn,
    }),
    [preferences, updatePreferences, setWeekStartsOn],
  )

  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  )
}

// Hook to easily access just the week start preference
export function useWeekStartPreference(): WeekStartDay {
  const { preferences } = useUserPreferences()
  return preferences.weekStartsOn
}
