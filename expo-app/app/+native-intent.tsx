/**
 * Native Intent Handler
 *
 * Handles incoming universal links (HTTPS) and deep links (hypro://)
 * Redirects ALL incoming links to root so PushNotificationManager can handle them
 *
 * This is the standard Expo Router way to handle universal links that should
 * not be matched as routes but instead trigger app launch with full URL data.
 *
 * Docs: https://docs.expo.dev/router/advanced/native-intent
 */

export async function redirectSystemPath(props: {
  path: string
  initial: boolean
}): Promise<string> {
  const { path, initial } = props

  console.info('📱 [NATIVE-INTENT] Incoming path:', path)
  console.info('📱 [NATIVE-INTENT] Is initial launch:', initial)

  // Always redirect to root (/)
  // PushNotificationManager will call Linking.getInitialURL() to get the full original URL
  // and navigate the WebView to the correct page
  return '/'
}
