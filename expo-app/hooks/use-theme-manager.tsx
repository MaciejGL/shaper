/**
 * Theme Manager Hook
 * Manages status bar and navigation bar styling based on web app theme
 */
// Import expo-navigation-bar for Android navigation bar theming
import * as NavigationBar from 'expo-navigation-bar'
import { useCallback, useState } from 'react'
import { Platform, StatusBar } from 'react-native'

export type AppTheme = 'light' | 'dark'

interface ThemeColors {
  statusBarStyle: 'light' | 'dark'
  statusBarBackground: string
  navigationBarBackground: string
  appBackground: string
}

const THEME_COLORS: Record<AppTheme, ThemeColors> = {
  light: {
    statusBarStyle: 'light',
    statusBarBackground: '#1a1a1d',
    navigationBarBackground: '#ffffff',
    appBackground: '#ffffff',
  },
  dark: {
    statusBarStyle: 'light',
    statusBarBackground: '#1a1a1d',
    navigationBarBackground: '#111114',
    appBackground: '#111114',
  },
}

export function useThemeManager() {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>('light')

  const updateTheme = useCallback(async (theme: AppTheme) => {
    try {
      const colors = THEME_COLORS[theme]

      // Update status bar style (icon contrast) - works on both iOS and Android
      StatusBar.setBarStyle(
        colors.statusBarStyle === 'light' ? 'light-content' : 'dark-content',
        true,
      )

      // Update Android navigation bar button style (icon contrast only)
      // Background colors are handled by SafeAreaView in edge-to-edge mode
      if (Platform.OS === 'android') {
        try {
          const buttonStyle = theme === 'dark' ? 'light' : 'dark'
          await NavigationBar.setButtonStyleAsync(buttonStyle)
        } catch (error) {
          console.warn('Failed to update Android navigation bar style:', error)
        }
      }

      setCurrentTheme(theme)
    } catch (error) {
      console.error('Error updating theme:', error)
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
