# 🚀 Hypertro Mobile App Deployment Checklist

## ✅ COMPLETED
- [x] **Working Mobile App**: Hypertro web app in native container
- [x] **Environment Config**: Development (local IP) vs Production (hypertro.app)
- [x] **Testing**: Confirmed working on Expo Go

## 📋 DEPLOYMENT REQUIREMENTS

### **PHASE 1: EAS Build Setup (30 minutes)**

#### **1.1 EAS Configuration**
- [ ] **EAS CLI**: ✅ Installed 
- [ ] **Expo Login**: `eas login` with your Expo account
- [ ] **EAS Init**: `eas build:configure` to setup cloud building
- [ ] **EAS Project**: Configure project ID in app.json

#### **1.2 Build Profiles**
- [ ] **Development Build**: For testing (`eas build --profile development`)
- [ ] **Production Build**: For app stores (`eas build --profile production`)

### **PHASE 2: App Store Accounts (1-2 days)**

#### **2.1 Apple App Store**
- [ ] **Apple Developer Account**: $99/year enrollment
- [ ] **App Store Connect**: Create new app listing
- [ ] **Bundle ID**: `app.hypertro.mobile` (reserve in Apple portal)
- [ ] **Certificates**: Distribution certificate via EAS
- [ ] **Provisioning Profile**: App Store distribution profile

#### **2.2 Google Play Store**
- [ ] **Google Play Console**: $25 one-time registration fee
- [ ] **App Listing**: Create Hypertro app on Play Console
- [ ] **Package Name**: `app.hypertro.mobile` (confirm availability)
- [ ] **Upload Key**: Managed by EAS Build
- [ ] **Content Rating**: Complete questionnaire

### **PHASE 3: App Assets (2-3 hours)**

#### **3.1 Required Icons & Images**
- [ ] **App Icon**: 1024x1024 PNG (no transparency)
- [ ] **Adaptive Icon** (Android): Foreground + background
- [ ] **Splash Screen**: Launch screen for both platforms
- [ ] **Notification Icon**: For push notifications

#### **3.2 Store Screenshots**
- [ ] **iPhone Screenshots**: 6.7" (iPhone 14 Pro Max) - 6-10 images
- [ ] **Android Screenshots**: Various screen sizes - 6-8 images
- [ ] **Feature Graphic** (Google Play): 1024x500 promotional banner

### **PHASE 4: Store Listings (1-2 hours)**

#### **4.1 App Store Content**
- [ ] **App Name**: "Hypertro" (check availability)
- [ ] **Subtitle**: Brief app description (30 chars)
- [ ] **Description**: Detailed app description
- [ ] **Keywords**: App Store optimization keywords
- [ ] **Privacy Policy**: Updated for mobile app
- [ ] **Support URL**: Customer support page

#### **4.2 Play Store Content**
- [ ] **Short Description**: 80 characters max
- [ ] **Full Description**: 4000 characters max
- [ ] **Feature Graphic**: Promotional banner
- [ ] **Privacy Policy**: Same as App Store
- [ ] **Content Rating**: Age appropriate rating

### **PHASE 5: Technical Preparation (30 minutes)**

#### **5.1 Production Configuration**
- [ ] **Web App URL**: Confirm `https://hypertro.app` is live
- [ ] **API Endpoints**: Ensure all APIs work on production
- [ ] **Performance**: Test app performance and loading times
- [ ] **SSL Certificate**: Verify HTTPS is working correctly

#### **5.2 Mobile App Polish**
- [ ] **Loading States**: Proper loading indicators
- [ ] **Error Handling**: Graceful handling of network issues
- [ ] **Offline Behavior**: App behavior when offline
- [ ] **Back Button**: Proper Android back button handling

### **PHASE 6: Testing & Submission (1 week)**

#### **6.1 Internal Testing**
- [ ] **Development Build**: `eas build --profile development`
- [ ] **TestFlight** (iOS): Upload to App Store Connect for testing
- [ ] **Internal Testing** (Android): Upload to Play Console
- [ ] **Device Testing**: Test on various iOS and Android devices

#### **6.2 Store Submission**
- [ ] **Production Build**: `eas build --profile production`
- [ ] **App Store Review**: Submit for Apple review (1-7 days)
- [ ] **Play Store Review**: Submit for Google review (1-3 days)
- [ ] **Release**: Publish to stores after approval

## 🎯 **IMMEDIATE NEXT STEPS (TODAY)**

### **Step 1: Setup EAS Build**
```bash
# Login to Expo (if you haven't)
eas login

# Configure EAS Build
eas build:configure

# Test development build
eas build --platform android --profile development
```

### **Step 2: Create App Store Accounts**
1. **Apple Developer**: https://developer.apple.com/programs/
2. **Google Play Console**: https://play.google.com/console/signup

### **Step 3: Prepare Basic Assets**
- Design app icon (1024x1024)
- Create simple splash screen
- Write app description

## 📱 **BUILD COMMANDS REFERENCE**

```bash
# Development builds (for testing)
eas build --profile development --platform android
eas build --profile development --platform ios

# Production builds (for app stores)
eas build --profile production --platform android
eas build --profile production --platform ios

# Build both platforms
eas build --profile production --platform all

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

## 💰 **ESTIMATED COSTS**

- **Apple Developer Account**: $99/year
- **Google Play Console**: $25 one-time
- **Design Assets** (if outsourced): $100-500
- **Total First Year**: ~$224-724

## ⏱️ **ESTIMATED TIMELINE**

- **Setup & Configuration**: 1 day
- **App Store Account Approval**: 1-2 days
- **Asset Creation**: 1-2 days
- **Store Listing**: 1 day
- **Review Process**: 1-7 days (Apple), 1-3 days (Google)
- **Total**: 5-13 days from start to live

## 🎯 **SUCCESS CRITERIA**

- [ ] **Apps Live**: Both iOS and Android apps published
- [ ] **Functionality**: All web features working in mobile app
- [ ] **Performance**: <3 second load time
- [ ] **Ratings**: >4.0 stars after first month
- [ ] **Downloads**: Target number of installs

## 📞 **SUPPORT & RESOURCES**

- **EAS Build Docs**: https://docs.expo.dev/build/introduction/
- **App Store Guidelines**: https://developer.apple.com/app-store/guidelines/
- **Play Store Policy**: https://play.google.com/about/developer-content-policy/
- **Hypertro Support**: Your existing support channels

---

**Status**: Ready for Deployment 🚀  
**Next Action**: Run `eas login` and `eas build:configure`  
**Target Go-Live**: [Set your target date]
