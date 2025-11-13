export interface MobileBridgeMessage {
  type:
    | 'NATIVE_CAMERA'
    | 'NATIVE_PUSH_REGISTER'
    | 'NATIVE_SHARE'
    | 'REQUEST_EXPO_PUSH_TOKEN'
  data?:
    | CameraRequest
    | PushTokenData
    | FileDownloadData
    | Record<string, unknown>
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

export interface FileDownloadData {
  base64Data: string
  filename: string
  mimeType: string
}

export interface CameraResponse {
  type: 'CAMERA_PHOTO_RESPONSE'
  photoUri: string
}

export interface PushTokenResponse {
  type: 'EXPO_PUSH_TOKEN_RESPONSE'
  expoPushToken: string
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
