import { Stack } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router'

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync()

export default function RootLayout() {
  // Keep splash screen visible until WebView loads
  // SplashScreen.hideAsync() is now called when WebView is ready

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  )
}
