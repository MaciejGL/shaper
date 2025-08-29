'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  GQLHeightUnit,
  GQLTheme,
  GQLTimeFormat,
  GQLTrainingView,
  type GQLUpdateProfileInput,
  GQLWeightUnit,
  useProfileQuery,
  useUpdateProfileMutation,
} from '@/generated/graphql-client'
import { DEFAULT_WEEK_START, WeekStartDay } from '@/lib/date-utils'

export type WeightUnit = 'kg' | 'lbs'
export type HeightUnit = 'cm' | 'ft'
export type ThemePreference = 'light' | 'dark' | 'system'
export type TimeFormat = '12h' | '24h'
export type TrainingView = GQLTrainingView

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
  heightUnit: HeightUnit
  theme: ThemePreference
  timeFormat: TimeFormat
  trainingView: TrainingView
  notifications: NotificationPreferences
}

interface UserPreferencesContextType {
  preferences: UserPreferences
  updatePreferences: (updates: Partial<UserPreferences>) => void
  setWeekStartsOn: (weekStartsOn: WeekStartDay) => void
  setWeightUnit: (weightUnit: WeightUnit) => void
  setHeightUnit: (heightUnit: HeightUnit) => void
  setTheme: (theme: ThemePreference) => void
  setTimeFormat: (timeFormat: TimeFormat) => void
  setTrainingView: (trainingView: TrainingView) => void
  setNotifications: (notifications: Partial<NotificationPreferences>) => void
  registerThemeSetter: (setTheme: (theme: string) => void) => void
  isLoading: boolean
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(
  null,
)

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  workoutReminders: true,
  mealReminders: true,
  progressUpdates: true,
  collaborationNotifications: true,
  systemNotifications: true,
  emailNotifications: true,
  pushNotifications: false, // Disabled for now as requested
}

const DEFAULT_PREFERENCES: UserPreferences = {
  weekStartsOn: DEFAULT_WEEK_START,
  weightUnit: 'kg',
  heightUnit: 'cm',
  theme: 'system',
  timeFormat: '24h',
  trainingView: GQLTrainingView.Advanced,
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
  // Get user profile data from GraphQL with error handling
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
  } = useProfileQuery(
    {},
    {
      retry: 3, // Retry failed requests
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  )
  const { mutateAsync: updateProfile } = useUpdateProfileMutation()

  // Log profile loading errors for debugging
  if (profileError) {
    console.warn('🚨 [USER-PREFERENCES] Profile query error:', profileError)
  }

  // Store theme setter function from ThemeProvider child
  const themeSetterRef = useRef<((theme: string) => void) | null>(null)

  const [preferences, setPreferences] = useState<UserPreferences>({
    ...DEFAULT_PREFERENCES,
    ...initialPreferences,
  })

  // Update preferences from database when profile data loads
  useEffect(() => {
    // Handle successful profile load
    if (profileData?.profile) {
      const profile = profileData.profile

      try {
        // Convert GraphQL enums to our types with safe fallbacks
        const weightUnit: WeightUnit =
          profile.weightUnit === 'lbs' ? 'lbs' : 'kg'
        const heightUnit: HeightUnit = profile.heightUnit === 'ft' ? 'ft' : 'cm'
        const theme: ThemePreference =
          profile.theme === 'light'
            ? 'light'
            : profile.theme === 'dark'
              ? 'dark'
              : 'system'
        const timeFormat: TimeFormat =
          profile.timeFormat === 'h12' ? '12h' : '24h'

        const dbPreferences: UserPreferences = {
          weekStartsOn: (profile.weekStartsOn ??
            DEFAULT_WEEK_START) as WeekStartDay,
          weightUnit,
          heightUnit,
          theme,
          timeFormat,
          trainingView: profile.trainingView ?? GQLTrainingView.Advanced,
          notifications: {
            workoutReminders:
              profile.notificationPreferences?.workoutReminders ??
              DEFAULT_NOTIFICATIONS.workoutReminders,
            mealReminders:
              profile.notificationPreferences?.mealReminders ??
              DEFAULT_NOTIFICATIONS.mealReminders,
            progressUpdates:
              profile.notificationPreferences?.progressUpdates ??
              DEFAULT_NOTIFICATIONS.progressUpdates,
            collaborationNotifications:
              profile.notificationPreferences?.collaborationNotifications ??
              DEFAULT_NOTIFICATIONS.collaborationNotifications,
            systemNotifications:
              profile.notificationPreferences?.systemNotifications ??
              DEFAULT_NOTIFICATIONS.systemNotifications,
            emailNotifications:
              profile.notificationPreferences?.emailNotifications ??
              DEFAULT_NOTIFICATIONS.emailNotifications,
            pushNotifications:
              profile.notificationPreferences?.pushNotifications ??
              DEFAULT_NOTIFICATIONS.pushNotifications,
          },
        }

        setPreferences(dbPreferences)

        // Sync theme with next-themes if available
        if (themeSetterRef.current) {
          themeSetterRef.current(theme)
        }

        console.info('✅ [USER-PREFERENCES] Loaded preferences from profile')
      } catch (error) {
        console.error(
          '🚨 [USER-PREFERENCES] Error processing profile data:',
          error,
        )
        // Keep default preferences on error
      }
    }
    // Handle profile loading error - use defaults
    else if (profileError && !profileLoading) {
      console.warn(
        '🔄 [USER-PREFERENCES] Using default preferences due to profile error',
      )
      setPreferences({
        ...DEFAULT_PREFERENCES,
        ...initialPreferences,
      })
    }
  }, [profileData, profileError, profileLoading])

  // Function to register theme setter from child ThemeProvider
  const registerThemeSetter = useCallback(
    (setTheme: (theme: string) => void) => {
      themeSetterRef.current = setTheme
    },
    [],
  )

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      // Optimistically update local state
      setPreferences((prev) => ({ ...prev, ...updates }))

      try {
        // Convert our types to GraphQL enums
        const input: Partial<GQLUpdateProfileInput> = {}

        if (updates.weekStartsOn !== undefined) {
          input.weekStartsOn = updates.weekStartsOn
        }
        if (updates.weightUnit !== undefined) {
          input.weightUnit =
            updates.weightUnit === 'lbs' ? GQLWeightUnit.Lbs : GQLWeightUnit.Kg
        }
        if (updates.heightUnit !== undefined) {
          input.heightUnit =
            updates.heightUnit === 'ft' ? GQLHeightUnit.Ft : GQLHeightUnit.Cm
        }
        if (updates.theme !== undefined) {
          input.theme =
            updates.theme === 'light'
              ? GQLTheme.Light
              : updates.theme === 'dark'
                ? GQLTheme.Dark
                : GQLTheme.System
        }
        if (updates.timeFormat !== undefined) {
          input.timeFormat =
            updates.timeFormat === '12h' ? GQLTimeFormat.H12 : GQLTimeFormat.H24
        }
        if (updates.trainingView !== undefined) {
          input.trainingView = updates.trainingView
        }
        if (updates.notifications !== undefined) {
          input.notificationPreferences = updates.notifications
        }

        // Update in database via GraphQL
        await updateProfile({
          input,
        })
      } catch (error) {
        console.error('Failed to update preferences:', error)
        // Revert optimistic update on error
        setPreferences((prev) => {
          const reverted = { ...prev }
          Object.keys(updates).forEach((key) => {
            delete reverted[key as keyof UserPreferences]
          })
          return reverted
        })
      }
    },
    [updateProfile],
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

  const setHeightUnit = useCallback(
    (heightUnit: HeightUnit) => {
      updatePreferences({ heightUnit })
    },
    [updatePreferences],
  )

  const setTheme = useCallback(
    (theme: ThemePreference) => {
      // Update database preferences
      updatePreferences({ theme })
      // Immediately sync with next-themes for instant visual update
      if (themeSetterRef.current) {
        themeSetterRef.current(theme)
      }
    },
    [updatePreferences],
  )

  const setTimeFormat = useCallback(
    (timeFormat: TimeFormat) => {
      updatePreferences({ timeFormat })
    },
    [updatePreferences],
  )

  const setTrainingView = useCallback(
    (trainingView: TrainingView) => {
      updatePreferences({ trainingView })
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
      setHeightUnit,
      setTheme,
      setTimeFormat,
      setTrainingView,
      setNotifications,
      registerThemeSetter,
      isLoading: profileLoading,
    }),
    [
      preferences,
      updatePreferences,
      setWeekStartsOn,
      setWeightUnit,
      setHeightUnit,
      setTheme,
      setTimeFormat,
      setTrainingView,
      setNotifications,
      registerThemeSetter,
      profileLoading,
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
