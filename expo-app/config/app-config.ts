// const work = '10.1.70.73'
const home = '192.168.0.25'
// Simple, reliable configuration for Hypro mobile app
export const APP_CONFIG = {
  // Web app URLs - use local dev server when in development
  WEB_URL: __DEV__ ? `http://${home}:4000` : 'https://hypro.app',

  // API URLs (if needed for direct API calls)
  API_URL: __DEV__ ? `http://${home}:4000/api` : 'https://hypro.app/api',

  // Environment info
  ENVIRONMENT: __DEV__ ? 'development' : 'production',
  IS_DEV: __DEV__,
  IS_PROD: !__DEV__,

  // App info
  APP_NAME: 'Hypro',
  USER_AGENT: 'HyproApp/1.0 (Expo)',
}

// Helper function to get current config
export const getAppConfig = () => {
  console.info(`🚀 Hypro Mobile - Environment: ${APP_CONFIG.ENVIRONMENT}`)
  console.info(`🌐 Loading: ${APP_CONFIG.WEB_URL}`)
  return APP_CONFIG
}

// Development helpers
export const logConfig = () => {
  if (APP_CONFIG.IS_DEV) {
    console.info('📱 Hypro App Config:', {
      webUrl: APP_CONFIG.WEB_URL,
      environment: APP_CONFIG.ENVIRONMENT,
      isDev: APP_CONFIG.IS_DEV,
    })
  }
}
