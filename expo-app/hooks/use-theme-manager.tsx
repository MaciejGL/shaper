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

      // Update Android navigation bar
      if (Platform.OS === 'android') {
        try {
          // Set navigation bar button style (this works with edge-to-edge)
          const buttonStyle = theme === 'dark' ? 'light' : 'dark'
          await NavigationBar.setButtonStyleAsync(buttonStyle)

          // Try to set background color, but don't warn if it fails due to edge-to-edge
          try {
            await NavigationBar.setBackgroundColorAsync(
              colors.navigationBarBackground,
            )
          } catch (bgError) {
            // Silently ignore background color errors in edge-to-edge mode
            console.log(
              '📱 Navigation bar background not set (edge-to-edge mode)',
            )
          }
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
