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
  GQLUserBasicQuery,
  GQLWeightUnit,
  useUpdateProfileMutation,
} from '@/generated/graphql-client'
import { DEFAULT_WEEK_START, WeekStartDay } from '@/lib/date-utils'
import { switchThemeWithTransition } from '@/lib/theme-transition'

export type WeightUnit = GQLWeightUnit
export type HeightUnit = GQLHeightUnit
export type ThemePreference = GQLTheme
export type TimeFormat = GQLTimeFormat
export type TrainingView = GQLTrainingView

export interface NotificationPreferences {
  workoutReminders?: boolean
  progressUpdates?: boolean
  systemNotifications?: boolean
  emailNotifications?: boolean
  pushNotifications?: boolean
  checkinReminders?: boolean
}

interface UserPreferences {
  weekStartsOn: WeekStartDay
  weightUnit: WeightUnit
  heightUnit: HeightUnit
  theme: ThemePreference
  timeFormat: TimeFormat
  timezone?: string
  trainingView: TrainingView
  notifications: NotificationPreferences
  blurProgressSnapshots?: boolean
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
}

const UserPreferencesContext = createContext<UserPreferencesContextType | null>(
  null,
)

const DEFAULT_NOTIFICATIONS: NotificationPreferences = {
  workoutReminders: true,
  progressUpdates: true,
  systemNotifications: true,
  emailNotifications: true,
  pushNotifications: false, // Disabled for now as requested
}

const DEFAULT_PREFERENCES: UserPreferences = {
  weekStartsOn: DEFAULT_WEEK_START,
  weightUnit: GQLWeightUnit.Kg,
  heightUnit: GQLHeightUnit.Cm,
  theme: GQLTheme.System,
  timeFormat: GQLTimeFormat.H24,
  trainingView: GQLTrainingView.Advanced,
  notifications: DEFAULT_NOTIFICATIONS,
  blurProgressSnapshots: false,
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
  initialData: NonNullable<GQLUserBasicQuery>
}

export function UserPreferencesProvider({
  children,
  initialData,
}: UserPreferencesProviderProps) {
  const profile = initialData.userBasic?.profile
  const initialPreferences = initialData.userBasic?.profile
  // Get user profile data from GraphQL
  const { mutateAsync: updateProfile } = useUpdateProfileMutation()

  // Store theme setter function from ThemeProvider child
  const themeSetterRef = useRef<((theme: string) => void) | null>(null)

  const [preferences, setPreferences] = useState<UserPreferences>({
    ...DEFAULT_PREFERENCES,
    heightUnit: profile?.heightUnit ?? DEFAULT_PREFERENCES.heightUnit,
    weightUnit: profile?.weightUnit ?? DEFAULT_PREFERENCES.weightUnit,
    theme: profile?.theme ?? DEFAULT_PREFERENCES.theme,
    timeFormat: profile?.timeFormat ?? DEFAULT_PREFERENCES.timeFormat,
    trainingView: profile?.trainingView ?? DEFAULT_PREFERENCES.trainingView,
    notifications:
      profile?.notificationPreferences ?? DEFAULT_PREFERENCES.notifications,
    blurProgressSnapshots:
      profile?.blurProgressSnapshots ??
      DEFAULT_PREFERENCES.blurProgressSnapshots,
  })

  // Store current preferences to avoid stale closures without causing re-renders
  const preferencesRef = useRef({
    ...DEFAULT_PREFERENCES,
    ...initialPreferences,
  })
  preferencesRef.current = preferences

  // Update preferences from database when profile data loads
  useEffect(() => {
    if (profile) {
      // Convert GraphQL enums to our types
      const weightUnit: WeightUnit =
        profile.weightUnit === GQLWeightUnit.Lbs
          ? GQLWeightUnit.Lbs
          : GQLWeightUnit.Kg
      const heightUnit: HeightUnit =
        profile.heightUnit === GQLHeightUnit.Ft
          ? GQLHeightUnit.Ft
          : GQLHeightUnit.Cm
      const theme: ThemePreference =
        profile.theme === 'light'
          ? GQLTheme.Light
          : profile.theme === GQLTheme.Dark
            ? GQLTheme.Dark
            : GQLTheme.System
      const timeFormat: TimeFormat =
        profile.timeFormat === GQLTimeFormat.H12
          ? GQLTimeFormat.H12
          : GQLTimeFormat.H24

      const dbPreferences: UserPreferences = {
        weekStartsOn: (profile.weekStartsOn ??
          DEFAULT_WEEK_START) as WeekStartDay,
        weightUnit,
        heightUnit,
        theme,
        timeFormat,
        trainingView: profile.trainingView,
        notifications: {
          workoutReminders:
            profile.notificationPreferences?.workoutReminders ?? true,
          progressUpdates:
            profile.notificationPreferences?.progressUpdates ?? true,
          systemNotifications:
            profile.notificationPreferences?.systemNotifications ?? true,
          emailNotifications:
            profile.notificationPreferences?.emailNotifications ?? true,
          pushNotifications:
            profile.notificationPreferences?.pushNotifications ?? false,
          checkinReminders:
            profile.notificationPreferences?.checkinReminders ?? true,
        },
        blurProgressSnapshots: profile.blurProgressSnapshots ?? false,
      }

      setPreferences(dbPreferences)

      // Sync theme with next-themes if available
      if (themeSetterRef.current) {
        themeSetterRef.current(theme)
      }
    }
  }, [profile])

  // Function to register theme setter from child ThemeProvider
  const registerThemeSetter = useCallback(
    (setTheme: (theme: string) => void) => {
      themeSetterRef.current = setTheme
    },
    [],
  )

  const updatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      // Capture previous state for rollback on error
      const previousPreferences = { ...preferences }

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
            updates.timeFormat === GQLTimeFormat.H12
              ? GQLTimeFormat.H12
              : GQLTimeFormat.H24
        }
        if (updates.trainingView !== undefined) {
          input.trainingView = updates.trainingView
        }
        if (updates.notifications !== undefined) {
          input.notificationPreferences = updates.notifications
        }

        if (updates.timezone !== undefined) {
          input.timezone = updates.timezone
        }

        if (updates.blurProgressSnapshots !== undefined) {
          input.blurProgressSnapshots = updates.blurProgressSnapshots
        }

        // Update in database via GraphQL
        await updateProfile({
          input,
        })
      } catch (error) {
        console.error('Failed to update preferences:', error)
        // Revert to previous state (before optimistic update)
        setPreferences(previousPreferences)
      }
    },
    [updateProfile, preferences],
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
      // Use view transitions for smooth theme switching
      if (themeSetterRef.current) {
        switchThemeWithTransition(themeSetterRef.current, theme)
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
        notifications: {
          ...preferencesRef.current.notifications,
          ...notificationUpdates,
        },
      })
    },
    [updatePreferences],
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
      blurProgressSnapshots: preferences.blurProgressSnapshots,
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
  return preferences.weekStartsOn ?? DEFAULT_WEEK_START
}
