/**
 * Theme Manager Hook
 * Manages status bar and navigation bar styling based on web app theme
 */
import { useCallback, useState } from 'react'
import { Platform, StatusBar } from 'react-native'

// Optional: expo-navigation-bar for Android navigation bar theming
// Install with: npm install expo-navigation-bar
let NavigationBar: {
  setBackgroundColorAsync: (color: string) => Promise<void>
  setButtonStyleAsync: (style: string) => Promise<void>
} | null = null
try {
  NavigationBar = require('expo-navigation-bar')
} catch (error) {
  console.warn(
    '📱 expo-navigation-bar not installed. Android navigation bar theming will be skipped.',
  )
}

export type AppTheme = 'light' | 'dark'

interface ThemeColors {
  statusBarStyle: 'light' | 'dark'
  statusBarBackground: string
  navigationBarBackground: string
  appBackground: string
}

const THEME_COLORS: Record<AppTheme, ThemeColors> = {
  light: {
    statusBarStyle: 'dark',
    statusBarBackground: '#ffffff',
    navigationBarBackground: '#ffffff',
    appBackground: '#ffffff',
  },
  dark: {
    statusBarStyle: 'light',
    statusBarBackground: '#000000',
    navigationBarBackground: '#000000',
    appBackground: '#000000',
  },
}

export function useThemeManager() {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('light')

  const updateTheme = useCallback(async (theme: AppTheme) => {
    try {
      const colors = THEME_COLORS[theme]

      // Update status bar (works on both iOS and Android)
      StatusBar.setBarStyle(
        colors.statusBarStyle === 'light' ? 'light-content' : 'dark-content',
        true,
      )

      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(colors.statusBarBackground, true)
      }

      // Update Android navigation bar (if expo-navigation-bar is installed)
      if (Platform.OS === 'android' && NavigationBar) {
        try {
          await NavigationBar.setBackgroundColorAsync(
            colors.navigationBarBackground,
          )

          // Set navigation bar button style
          const buttonStyle = theme === 'dark' ? 'light' : 'dark'
          await NavigationBar.setButtonStyleAsync(buttonStyle)
        } catch (error) {
          console.warn('⚠️ Failed to update Android navigation bar:', error)
        }
      }

      setCurrentTheme(theme)
    } catch (error) {
      console.error('❌ Error updating theme:', error)
    }
  }, [])

  const getThemeColors = useCallback(() => {
    return THEME_COLORS[currentTheme]
  }, [currentTheme])

  const handleWebThemeChange = useCallback(
    (webTheme: 'light' | 'dark') => {
      updateTheme(webTheme)
    },
    [updateTheme],
  )

  return {
    currentTheme,
    updateTheme,
    getThemeColors,
    handleWebThemeChange,
    colors: THEME_COLORS[currentTheme],
  }
}
