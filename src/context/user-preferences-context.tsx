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

export type WeightUnit = 'kg' | 'lbs'
export type ThemePreference = 'light' | 'dark' | 'system'
export type TimeFormat = '12h' | '24h'

export interface NotificationPreferences {
  workoutReminders: boolean
  mealReminders: boolean
  progressUpdates: boolean
  collaborationNotifications: boolean
  systemNotifications: boolean
  emailNotifications: boolean
  pushNotifications: boolean
}

interface UserPreferences {
  weekStartsOn: WeekStartDay
  weightUnit: WeightUnit
  theme: ThemePreference
  timeFormat: TimeFormat
  notifications: NotificationPreferences
}

interface UserPreferencesContextType {
  preferences: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => void
  setWeekStartsOn: (weekStartsOn: WeekStartDay) => void
  setWeightUnit: (weightUnit: WeightUnit) => void
  setTheme: (theme: ThemePreference) => void
  setTimeFormat: (timeFormat: TimeFormat) => void
  setNotifications: (notifications: Partial<NotificationPreferences>) => void
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(
  null,
)

const PREFERENCES_KEY = 'user-preferences'

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  workoutReminders: true,
  mealReminders: true,
  progressUpdates: true,
  collaborationNotifications: true,
  systemNotifications: true,
  emailNotifications: true,
  pushNotifications: true,
}

const DEFAULT_PREFERENCES: UserPreferences = {
  weekStartsOn: DEFAULT_WEEK_START,
  weightUnit: 'kg',
  theme: 'system',
  timeFormat: '24h',
  notifications: DEFAULT_NOTIFICATIONS,
}

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
    ...DEFAULT_PREFERENCES,
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

  const setWeightUnit = useCallback(
    (weightUnit: WeightUnit) => {
      updatePreferences({ weightUnit })
    },
    [updatePreferences],
  )

  const setTheme = useCallback(
    (theme: ThemePreference) => {
      updatePreferences({ theme })
    },
    [updatePreferences],
  )

  const setTimeFormat = useCallback(
    (timeFormat: TimeFormat) => {
      updatePreferences({ timeFormat })
    },
    [updatePreferences],
  )

  const setNotifications = useCallback(
    (notificationUpdates: Partial<NotificationPreferences>) => {
      updatePreferences({
        notifications: { ...preferences.notifications, ...notificationUpdates },
      })
    },
    [updatePreferences, preferences.notifications],
  )

  const value = useMemo(
    () => ({
      preferences,
      updatePreferences,
      setWeekStartsOn,
      setWeightUnit,
      setTheme,
      setTimeFormat,
      setNotifications,
    }),
    [
      preferences,
      updatePreferences,
      setWeekStartsOn,
      setWeightUnit,
      setTheme,
      setTimeFormat,
      setNotifications,
    ],
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
