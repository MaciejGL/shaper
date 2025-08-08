// Simple, reliable configuration for Hypertro mobile app
export const APP_CONFIG = {
  // Web app URLs - use computer's IP for mobile development
  WEB_URL: __DEV__ ? 'http://10.1.70.73:4000' : 'https://hypertro.app',

  // API URLs (if needed for direct API calls)
  API_URL: __DEV__ ? 'http://10.1.70.73:4000/api' : 'https://hypertro.app/api',

  // Environment info
  ENVIRONMENT: __DEV__ ? 'development' : 'production',
  IS_DEV: __DEV__,
  IS_PROD: !__DEV__,

  // App info
  APP_NAME: 'Hypertro',
  USER_AGENT: 'HypertroApp/1.0 (Expo)',
}

// Helper function to get current config
export const getAppConfig = () => {
  console.log(`🚀 Hypertro Mobile - Environment: ${APP_CONFIG.ENVIRONMENT}`)
  console.log(`🌐 Loading: ${APP_CONFIG.WEB_URL}`)
  return APP_CONFIG
}

// Development helpers
export const logConfig = () => {
  if (APP_CONFIG.IS_DEV) {
    console.log('📱 Hypertro App Config:', {
      webUrl: APP_CONFIG.WEB_URL,
      environment: APP_CONFIG.ENVIRONMENT,
      isDev: APP_CONFIG.IS_DEV,
    })
  }
}
