export interface MobileBridgeMessage {
  type:
    | 'NATIVE_CAMERA'
    | 'NATIVE_PUSH_REGISTER'
    | 'NATIVE_SHARE'
    | 'REQUEST_EXPO_PUSH_TOKEN'
    | 'back_button_handled'
  data?: any
}

export interface CameraRequest {
  quality?: number
  allowEditing?: boolean
  aspect?: [number, number]
}

export interface PushTokenData {
  expoPushToken?: string
  fcmToken?: string
  platform: 'ios' | 'android'
  userId: string
}

export interface CameraResponse {
  type: 'CAMERA_PHOTO_RESPONSE'
  photoUri: string
}

export interface PushTokenResponse {
  type: 'EXPO_PUSH_TOKEN_RESPONSE'
  expoPushToken: string
}

export interface BackButtonHandledResponse {
  type: 'back_button_handled'
  handled: boolean
}

// Window interface extensions for native bridge
declare global {
  interface Window {
    isNativeApp?: boolean
    platform?: 'expo' | 'web'
    takeNativePhoto?: () => void
    handleNativePhoto?: (photoUri: string) => void
    ReactNativeWebView?: {
      postMessage: (message: string) => void
    }
  }
}
