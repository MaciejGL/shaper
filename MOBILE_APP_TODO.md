# 📱 Hypertro Mobile App Implementation TODO

## 🎯 Project Overview

Convert Hypertro web app to native mobile apps using **Expo + WebView** approach for iOS App Store and Google Play Store with **native push notifications** and **native camera integration**.

**Approach**: Expo managed workflow with WebView + Native Bridge for camera and push notifications
**Timeline**: 1-2 weeks
**Team**: 1 developer
**Key Features**: Native FCM push notifications, native camera access, over-the-air updates

---

## 📁 Repository Structure (Monorepo Approach)

```
shaper/ (existing repo)
├── src/                          # Existing web app (unchanged)
├── expo-app/                     # New Expo app
│   ├── app/                      # Expo Router pages
│   ├── components/               # Native components
│   ├── hooks/                    # Native hooks
│   ├── utils/                    # Mobile utilities
│   ├── app.json                  # Expo configuration
│   ├── package.json              # Expo dependencies
│   └── eas.json                  # EAS Build configuration
├── shared/                       # Shared code between web and mobile
│   ├── types/
│   │   ├── mobile-bridge.ts      # Bridge communication types
│   │   └── push-notifications.ts # Push notification types
│   └── constants/
│       └── mobile-config.ts      # Mobile-specific constants
├── package.json                  # Updated with Expo scripts
├── MOBILE_APP_TODO.md
└── README.md
```

---

## 🚀 **Why Expo for Hypertro?**

### **Expo Advantages over React Native CLI**

✅ **EAS Build**: Cloud building - no Xcode/Android Studio setup needed  
✅ **EAS Submit**: Automated app store submission  
✅ **EAS Update**: Over-the-air updates for instant app updates  
✅ **Native Push**: Built-in Expo push notification system + FCM support  
✅ **Native Camera**: Easy camera integration with expo-camera  
✅ **TypeScript**: First-class TypeScript support  
✅ **Fast Development**: Hot reload, fast refresh  
✅ **Web Dev Friendly**: Similar to Next.js development experience

| Feature                | Expo                | React Native CLI        |
| ---------------------- | ------------------- | ----------------------- |
| **Setup Time**         | ✅ 10 minutes       | ❌ 2-4 hours            |
| **Cloud Building**     | ✅ EAS Build        | ❌ Local setup required |
| **Store Submission**   | ✅ Automated        | ❌ Manual               |
| **Push Notifications** | ✅ Built-in + FCM   | ❌ Manual FCM setup     |
| **Camera Integration** | ✅ expo-camera      | ⚠️ Manual setup         |
| **OTA Updates**        | ✅ EAS Update       | ❌ CodePush setup       |
| **Learning Curve**     | ✅ Web dev friendly | ❌ Steeper              |

---

## 📋 Implementation Phases

### Phase 1: Expo Setup & Basic WebView (Day 1-2)

#### Expo Project Creation

- [ ] **Create Expo app in existing repository**

  ```bash
  # In your existing shaper/ directory root:
  npx create-expo-app@latest expo-app --template tabs
  cd expo-app
  ```

- [ ] **Install essential dependencies**

  ```bash
  # WebView and native features
  npx expo install react-native-webview
  npx expo install expo-camera expo-notifications expo-constants
  npx expo install expo-sharing expo-file-system expo-media-library

  # Development tools
  npm install @types/react @types/react-native
  ```

- [ ] **Update root package.json with Expo scripts**
      Add these scripts to your existing `package.json`:

  ```json
  {
    "scripts": {
      // Your existing scripts remain unchanged:
      "dev": "PORT=${PORT:=4000} concurrently \"next dev --turbopack\" \"npm run codegen\"",
      "build": "prisma generate && next build",
      "start": "next start",

      // Add these new Expo scripts:
      "expo:install": "cd expo-app && npm install",
      "expo:start": "cd expo-app && npx expo start",
      "expo:ios": "cd expo-app && npx expo run:ios",
      "expo:android": "cd expo-app && npx expo run:android",
      "expo:build": "cd expo-app && eas build --platform all",
      "expo:submit": "cd expo-app && eas submit --platform all",
      "expo:update": "cd expo-app && eas update --branch production",
      "dev:all": "concurrently \"npm run dev\" \"npm run expo:start\"",

      // Continue with existing scripts:
      "generate": "prisma generate",
      "migrate": "prisma migrate dev --create-only",
      "codegen": "graphql-codegen --config codegen.ts --watch",
      "seed": "npx prisma db seed"
    }
  }
  ```

- [ ] **Configure app.json for Hypertro branding**
  ```json
  {
    "expo": {
      "name": "Hypertro",
      "slug": "hypertro",
      "version": "1.0.0",
      "orientation": "portrait",
      "icon": "./assets/icon.png",
      "userInterfaceStyle": "automatic",
      "splash": {
        "image": "./assets/splash.png",
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      },
      "assetBundlePatterns": ["**/*"],
      "ios": {
        "supportsTablet": false,
        "bundleIdentifier": "app.hypertro.mobile",
        "buildNumber": "1"
      },
      "android": {
        "adaptiveIcon": {
          "foregroundImage": "./assets/adaptive-icon.png",
          "backgroundColor": "#ffffff"
        },
        "package": "app.hypertro.mobile",
        "versionCode": 1,
        "permissions": [
          "CAMERA",
          "RECORD_AUDIO",
          "READ_EXTERNAL_STORAGE",
          "WRITE_EXTERNAL_STORAGE"
        ]
      },
      "web": {
        "favicon": "./assets/favicon.png"
      },
      "plugins": [
        [
          "expo-notifications",
          {
            "icon": "./assets/notification-icon.png",
            "color": "#ffffff",
            "defaultChannel": "default"
          }
        ],
        [
          "expo-camera",
          {
            "cameraPermission": "Allow Hypertro to access your camera for progress photos"
          }
        ]
      ],
      "extra": {
        "eas": {
          "projectId": "your-project-id-here"
        }
      }
    }
  }
  ```

#### Basic WebView Implementation

- [ ] **Create main WebView component**

  ```typescript
  // expo-app/app/(tabs)/index.tsx
  import React from 'react';
  import { SafeAreaView, StatusBar } from 'react-native';
  import { WebView } from 'react-native-webview';
  import Constants from 'expo-constants';

  export default function HomeScreen() {
    return (
      <SafeAreaView style={{ flex: 1, paddingTop: Constants.statusBarHeight }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <WebView
          source={{ uri: 'https://fit-space.app' }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          userAgent="HypertroApp/1.0 (Expo)"
          injectedJavaScript={`
            window.isNativeApp = true;
            window.platform = 'expo';
            true; // Required return statement
          `}
        />
      </SafeAreaView>
    );
  }
  ```

- [ ] **Create shared types for bridge communication**

  ```bash
  # Create shared/types/mobile-bridge.ts
  touch shared/types/mobile-bridge.ts
  ```

  ```typescript
  // shared/types/mobile-bridge.ts
  export interface MobileBridgeMessage {
    type: 'NATIVE_CAMERA' | 'NATIVE_PUSH_REGISTER' | 'NATIVE_SHARE'
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
  ```

#### Testing Setup

- [ ] **Test basic WebView functionality**

  ```bash
  # Start Expo development server
  npm run expo:start

  # Test on iOS Simulator
  npm run expo:ios

  # Test on Android Emulator
  npm run expo:android
  ```

---

### Phase 2: Native Push Notifications Integration (Day 3-4)

#### Expo Push Notifications Setup

- [ ] **Configure EAS Build for push notifications**

  ```bash
  # Initialize EAS
  cd expo-app
  npx eas build:configure
  ```

- [ ] **Create eas.json configuration**

  ```json
  {
    "cli": {
      "version": ">= 5.2.0"
    },
    "build": {
      "development": {
        "developmentClient": true,
        "distribution": "internal"
      },
      "preview": {
        "distribution": "internal",
        "android": {
          "buildType": "apk"
        }
      },
      "production": {
        "android": {
          "buildType": "aab"
        }
      }
    },
    "submit": {
      "production": {}
    }
  }
  ```

- [ ] **Implement native push notification handler**

  ```typescript
  // expo-app/hooks/usePushNotifications.ts
  import Constants from 'expo-constants'
  import * as Device from 'expo-device'
  import * as Notifications from 'expo-notifications'
  import { useEffect, useState } from 'react'

  // Configure notification behavior
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  })

  export function usePushNotifications() {
    const [expoPushToken, setExpoPushToken] = useState<string>()
    const [notification, setNotification] =
      useState<Notifications.Notification>()

    useEffect(() => {
      registerForPushNotificationsAsync().then((token) =>
        setExpoPushToken(token),
      )

      const notificationListener =
        Notifications.addNotificationReceivedListener((notification) => {
          setNotification(notification)
        })

      const responseListener =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log('Notification tapped:', response)
          // Handle notification tap - navigate to specific screen
        })

      return () => {
        Notifications.removeNotificationSubscription(notificationListener)
        Notifications.removeNotificationSubscription(responseListener)
      }
    }, [])

    return { expoPushToken, notification }
  }

  async function registerForPushNotificationsAsync() {
    let token

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      })
    }

    if (Device.isDevice) {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync()
      let finalStatus = existingStatus

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync()
        finalStatus = status
      }

      if (finalStatus !== 'granted') {
        alert('Failed to get push token for push notification!')
        return
      }

      token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        })
      ).data
    } else {
      alert('Must use physical device for Push Notifications')
    }

    return token
  }
  ```

#### Backend Integration

- [ ] **Create native push registration endpoint**

  ```typescript
  // src/app/api/push/register-expo/route.ts
  import { getServerSession } from 'next-auth'
  import { NextResponse } from 'next/server'

  import { authOptions } from '@/lib/auth'
  import { prisma } from '@/lib/db'

  export async function POST(req: Request) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { expoPushToken, platform } = await req.json()

    try {
      // Store Expo push token (extend your existing PushSubscription model)
      await prisma.pushSubscription.upsert({
        where: { endpoint: expoPushToken },
        update: {
          userAgent: `HypertroApp/1.0 (${platform})`,
          updatedAt: new Date(),
        },
        create: {
          userId: session.user.id,
          endpoint: expoPushToken,
          p256dh: 'expo-push', // Identifier for Expo push
          auth: 'expo-push',
          userAgent: `HypertroApp/1.0 (${platform})`,
        },
      })

      return NextResponse.json({ success: true })
    } catch (error) {
      console.error('Expo push registration failed:', error)
      return NextResponse.json(
        { error: 'Registration failed' },
        { status: 500 },
      )
    }
  }
  ```

- [ ] **Update existing push notification service for Expo**

  ```typescript
  // src/lib/notifications/expo-push-service.ts
  import { Expo } from 'expo-server-sdk'

  const expo = new Expo()

  export async function sendExpoPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: any,
  ) {
    if (!Expo.isExpoPushToken(expoPushToken)) {
      console.error(
        `Push token ${expoPushToken} is not a valid Expo push token`,
      )
      return { success: false, error: 'Invalid token' }
    }

    const message = {
      to: expoPushToken,
      sound: 'default',
      title,
      body,
      data: data || {},
      badge: 1,
    }

    try {
      const ticket = await expo.sendPushNotificationsAsync([message])
      console.log('Expo push sent:', ticket)
      return { success: true, ticket }
    } catch (error) {
      console.error('Error sending Expo push:', error)
      return { success: false, error }
    }
  }
  ```

#### Web App Integration

- [ ] **Update web app to register for Expo push**
  ```typescript
  // Update your existing push notification settings to detect Expo
  const registerForExpoPush = async () => {
    if (window.isNativeApp && window.platform === 'expo') {
      // Request Expo push token from native app
      window.postMessage({ type: 'REQUEST_EXPO_PUSH_TOKEN' }, '*')
    }
  }
  ```

---

### Phase 3: Native Camera Integration (Day 5-6)

#### Camera Component Implementation

- [ ] **Create native camera component**

  ```typescript
  // expo-app/components/NativeCamera.tsx
  import React, { useState, useRef } from 'react';
  import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
  import { Camera, CameraType } from 'expo-camera';
  import * as MediaLibrary from 'expo-media-library';

  interface NativeCameraProps {
    onPhotoTaken: (uri: string) => void;
    onClose: () => void;
  }

  export function NativeCamera({ onPhotoTaken, onClose }: NativeCameraProps) {
    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const cameraRef = useRef<Camera>(null);

    if (!permission) {
      return <View />;
    }

    if (!permission.granted) {
      return (
        <View style={styles.container}>
          <Text style={{ textAlign: 'center' }}>We need your permission to show the camera</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.button}>
            <Text style={styles.buttonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const takePicture = async () => {
      if (cameraRef.current) {
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.8,
            base64: false,
            exif: false,
          });

          // Save to media library
          await MediaLibrary.saveToLibraryAsync(photo.uri);

          // Return photo URI to WebView
          onPhotoTaken(photo.uri);
          onClose();

        } catch (error) {
          Alert.alert('Error', 'Failed to take picture');
          console.error('Camera error:', error);
        }
      }
    };

    return (
      <View style={styles.container}>
        <Camera style={styles.camera} type={type} ref={cameraRef}>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </Camera>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: { flex: 1 },
    camera: { flex: 1 },
    buttonContainer: {
      flex: 1,
      flexDirection: 'row',
      backgroundColor: 'transparent',
      margin: 64,
      alignItems: 'flex-end',
      justifyContent: 'space-around',
    },
    button: {
      alignSelf: 'flex-end',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 10,
      borderRadius: 5,
    },
    buttonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: 'white',
    },
    captureButton: {
      width: 70,
      height: 70,
      borderRadius: 35,
      backgroundColor: 'rgba(255,255,255,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    captureButtonInner: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: 'white',
    },
  });
  ```

#### WebView Bridge for Camera

- [ ] **Enhanced WebView with camera bridge**

  ```typescript
  // expo-app/app/(tabs)/index.tsx - Enhanced with camera
  import React, { useState } from 'react';
  import { SafeAreaView, StatusBar, Modal } from 'react-native';
  import { WebView } from 'react-native-webview';
  import Constants from 'expo-constants';
  import { NativeCamera } from '../components/NativeCamera';
  import { usePushNotifications } from '../hooks/usePushNotifications';

  export default function HomeScreen() {
    const [showCamera, setShowCamera] = useState(false);
    const webViewRef = useRef<WebView>(null);
    const { expoPushToken } = usePushNotifications();

    const handleWebViewMessage = (event: any) => {
      try {
        const message = JSON.parse(event.nativeEvent.data);

        switch (message.type) {
          case 'NATIVE_CAMERA':
            setShowCamera(true);
            break;

          case 'REQUEST_EXPO_PUSH_TOKEN':
            // Send push token back to web app
            webViewRef.current?.postMessage(JSON.stringify({
              type: 'EXPO_PUSH_TOKEN_RESPONSE',
              expoPushToken
            }));
            break;

          default:
            break;
        }
      } catch (error) {
        console.log('Invalid message format:', error);
      }
    };

    const handlePhotoTaken = (uri: string) => {
      // Send photo URI back to web app
      webViewRef.current?.postMessage(JSON.stringify({
        type: 'CAMERA_PHOTO_RESPONSE',
        photoUri: uri
      }));
    };

    return (
      <SafeAreaView style={{ flex: 1, paddingTop: Constants.statusBarHeight }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

        <WebView
          ref={webViewRef}
          source={{ uri: 'https://fit-space.app' }}
          style={{ flex: 1 }}
          onMessage={handleWebViewMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          userAgent="HypertroApp/1.0 (Expo)"
          injectedJavaScript={`
            window.isNativeApp = true;
            window.platform = 'expo';

            // Native camera function
            window.takeNativePhoto = () => {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'NATIVE_CAMERA'
              }));
            };

            // Listen for camera response
            window.addEventListener('message', function(event) {
              try {
                const data = JSON.parse(event.data);
                if (data.type === 'CAMERA_PHOTO_RESPONSE') {
                  // Handle photo in your web app
                  if (window.handleNativePhoto) {
                    window.handleNativePhoto(data.photoUri);
                  }
                }
              } catch (error) {
                console.log('Error handling message:', error);
              }
            });

            true;
          `}
        />

        {/* Native Camera Modal */}
        <Modal visible={showCamera} animationType="slide">
          <NativeCamera
            onPhotoTaken={handlePhotoTaken}
            onClose={() => setShowCamera(false)}
          />
        </Modal>
      </SafeAreaView>
    );
  }
  ```

#### Web App Camera Integration

- [ ] **Update web app to use native camera**
  ```typescript
  // Add to your existing camera component
  const takePhoto = async () => {
    if (window.isNativeApp && window.takeNativePhoto) {
      // Use native camera
      window.takeNativePhoto()
    } else {
      // Fallback to web camera
      // ... existing web camera logic
    }
  }
  ```

---

### Phase 4: EAS Build & Deployment Setup (Day 7-8)

#### EAS Build Configuration

- [ ] **Setup EAS project**

  ```bash
  cd expo-app

  # Login to Expo
  npx expo login

  # Configure EAS
  eas build:configure

  # Create EAS project
  eas project:init
  ```

- [ ] **Configure app signing and certificates**

  ```bash
  # Generate app signing credentials
  eas credentials
  ```

- [ ] **Create app store assets**
  - App icon (1024x1024)
  - Adaptive icon (Android)
  - Splash screen
  - Screenshots for various device sizes
  - Feature graphic (Google Play)

#### Store Preparation

- [ ] **Setup Google Play Console**

  - Create Google Play Console account ($25 one-time)
  - Create new app listing
  - Configure app details, descriptions, screenshots

- [ ] **Setup Apple App Store Connect**
  - Create Apple Developer account ($99/year)
  - Create new app in App Store Connect
  - Configure app metadata, screenshots, descriptions

#### Build and Submit Process

- [ ] **Build production apps**

  ```bash
  # Build for both platforms
  eas build --platform all
  ```

- [ ] **Submit to app stores**
  ```bash
  # Automated submission
  eas submit --platform all
  ```

---

### Phase 5: Testing & Over-the-Air Updates (Day 9-10)

#### Comprehensive Testing

- [ ] **Test on physical devices**

  ```bash
  # Create development build for testing
  eas build --profile development
  ```

- [ ] **Test all features**
  - [ ] WebView loading and navigation
  - [ ] Native push notifications (Expo push)
  - [ ] Native camera functionality
  - [ ] Bridge communication between web and native
  - [ ] Performance on various devices

#### OTA Updates Setup

- [ ] **Configure EAS Update for instant updates**

  ```bash
  # Configure update channels
  eas update:configure

  # Create production update
  eas update --branch production --message "Initial production release"
  ```

- [ ] **Test OTA update flow**

  ```bash
  # Make a change to your web app
  # Push update
  eas update --branch production --message "Updated web content"

  # Users will get update without app store submission
  ```

---

## 🚀 Development Workflow

### Daily Development Commands

```bash
# Start both web and mobile development
npm run dev:all

# Or separately
npm run dev              # Web app on localhost:4000
npm run expo:start       # Expo development server
npm run expo:ios         # iOS simulator
npm run expo:android     # Android emulator
```

### Deployment Commands

```bash
# Build for testing
eas build --profile preview

# Build for production
npm run expo:build

# Submit to stores
npm run expo:submit

# Push OTA update
npm run expo:update
```

---

## 🎯 Success Metrics

- [ ] **App store approval** within 1 week of submission
- [ ] **Native push notifications** working for 100% of users
- [ ] **Native camera** integration working smoothly
- [ ] **<2 second app launch time**
- [ ] **Instant web content updates** via OTA
- [ ] **>4.5 star rating** in stores after 1 month

---

## 💰 Estimated Costs

- **Apple Developer Account**: $99/year
- **Google Play Console**: $25 one-time
- **Expo Pro** (optional): $29/month for team features
- **Development Time**: 1-2 weeks (1 developer)
- **Total Initial Cost**: ~$124 + optional Expo Pro

---

## 🎯 Next Steps

### Immediate Actions (Today)

1. **Create Expo app**: `npx create-expo-app@latest expo-app --template tabs`
2. **Install WebView**: `npx expo install react-native-webview`
3. **Test basic WebView**: Load your web app in Expo
4. **Setup EAS**: Configure building and deployment

### Week 1 Goals

- [ ] Basic WebView wrapper working
- [ ] Native push notifications implemented
- [ ] Native camera integration complete
- [ ] Testing on physical devices

### Week 2 Goals

- [ ] App store assets created
- [ ] EAS Build configured
- [ ] Apps submitted to stores
- [ ] OTA update system working

---

**Created**: January 2025  
**Status**: Planning Phase  
**Framework**: Expo (Recommended)  
**Next Action**: Create Expo app and implement basic WebView

**Ready to transform your Hypertro web app into a powerful native mobile experience with Expo! 🚀**
