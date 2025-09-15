# Hypro Mobile App

A React Native app built with Expo for fitness tracking and personal training.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Expo CLI (`npm install -g @expo/cli`)
- EAS CLI (`npm install -g eas-cli`)
- iOS Simulator (Mac) or Android Studio
- Apple Developer Account (for iOS deployment)

### Installation

```bash
cd expo-app
npm install
```

## 🛠️ Development Workflow

### Local Development

```bash
# Start development server
npm run start

# Start with cleared cache (if having issues)
npm run start:clear

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

### Testing on Real Devices

#### Development Builds (Internal Testing)

```bash
# Build for iOS devices (development)
npm run build:dev:ios

# Build for Android devices (development)
npm run build:dev:android

# Build for both platforms
npm run build:dev
```

**Note:** Development builds include developer tools and debugging features.

#### Preview Builds (Stakeholder Testing)

```bash
# Build for iOS (preview)
npm run build:preview:ios

# Build for Android (preview)
npm run build:preview:android

# Build for both platforms
npm run build:preview
```

**Note:** Preview builds are optimized but still for internal distribution.

## 📱 Production Deployment

### Step 1: Production Build

```bash
# iOS production build (App Store ready)
npm run build:prod:ios

# Android production build (Play Store ready)
npm run build:prod:android

# Both platforms
npm run build:prod
```

### Step 2: App Store Preparation

#### iOS App Store Connect Setup

1. **Login to App Store Connect**: https://appstoreconnect.apple.com
2. **Create New App**:
   - **Name**: Hypro
   - **Bundle ID**: `app.hypertro.mobile`
   - **SKU**: `hypertro-mobile-ios` (your choice)
   - **Platform**: iOS

#### Required App Store Materials

- **App Screenshots** (iPhone sizes: 6.7", 6.5", 5.5")
- **App Description** and keywords
- **Privacy Policy** (required for camera/notifications)
- **App Icon** (1024x1024px)
- **Category**: Health & Fitness

### Step 3: Submit to App Store

```bash
# Submit iOS app to App Store
npm run submit:ios

# Submit Android app to Play Store
npm run submit:android

# Submit to both stores
npm run submit:all
```

## 🔧 Utility Commands

### EAS Management

```bash
# Login to EAS
npm run login

# Check current user
npm run whoami

# Logout from EAS
npm run logout

# List registered devices
npm run devices

# View all builds
npm run builds
```

### Updates & Maintenance

```bash
# Push over-the-air update
npm run update

# Prebuild (generate native code)
npm run prebuild

# Clean prebuild (regenerate native code)
npm run prebuild:clean
```

## 📋 Build Profiles

| Profile       | Purpose           | Distribution  | Features                  |
| ------------- | ----------------- | ------------- | ------------------------- |
| `development` | Daily development | Internal      | Debug tools, dev client   |
| `preview`     | Testing & demos   | Internal      | Optimized, no debug tools |
| `production`  | Store submission  | Public stores | Fully optimized, signed   |

## 🔐 Configuration Files

### Key Files

- **`app.json`**: App configuration, versions, permissions
- **`eas.json`**: Build and submission configuration
- **`package.json`**: Dependencies and scripts

### Version Management

```json
// app.json
{
  "expo": {
    "version": "1.0.0", // App version
    "ios": {
      "buildNumber": "1" // iOS build number
    },
    "android": {
      "versionCode": 1 // Android version code
    }
  }
}
```

**Important:** Increment these before each store submission.

## 🚨 Production Checklist

### Before App Store Submission

#### Security Configuration

- [ ] Set `NSAllowsArbitraryLoads: false` in production
- [ ] Set `usesCleartextTraffic: false` for Android
- [ ] Remove development-only permissions
- [ ] Verify HTTPS endpoints only

#### App Store Requirements

- [ ] App icon (1024x1024px)
- [ ] Screenshots for all required device sizes
- [ ] App description (max 4000 characters)
- [ ] Keywords (max 100 characters)
- [ ] Privacy policy URL
- [ ] Support URL
- [ ] Age rating questionnaire completed

#### Testing

- [ ] Test on physical iOS devices
- [ ] Test core app functionality
- [ ] Test camera permissions
- [ ] Test notification permissions
- [ ] Verify app works without network

## 🐛 Common Issues & Solutions

### Build Issues

```bash
# Clear Expo cache
npm run start:clear

# Clear node modules
rm -rf node_modules && npm install

# Clear EAS cache
eas build --clear-cache
```

### Version Conflicts

- Ensure `app.json` versions match your release
- Increment `buildNumber` for iOS updates
- Increment `versionCode` for Android updates

### Permissions Issues

- Check `app.json` for required permissions
- Verify Info.plist descriptions are user-friendly
- Test permission requests on real devices

## 📞 Support

### Useful Links

- **Expo Documentation**: https://docs.expo.dev/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console

### Team Commands

```bash
# Check build status
npm run builds

# Monitor specific build
eas build:view [BUILD_ID]

# Cancel running build
eas build:cancel [BUILD_ID]
```

## 🔄 Release Workflow

### Regular Development

1. `npm run start` - Local development
2. `npm run build:dev:ios` - Test on device
3. `npm run build:preview` - Share with team

### App Store Release

1. Update version in `app.json`
2. `npm run build:prod:ios` - Production build
3. Test the production build thoroughly
4. `npm run submit:ios` - Submit to App Store
5. Monitor App Store Connect for review status

### Hotfix Process

1. Fix the issue
2. Increment `buildNumber` in `app.json`
3. `npm run build:prod:ios`
4. `npm run submit:ios`

---

**Happy coding! 🚀**
