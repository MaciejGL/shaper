import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  // Hide splash screen immediately since our app handles loading
  SplashScreen.hideAsync()

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  )
}
