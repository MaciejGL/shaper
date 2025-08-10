# Push Notifications - Mobile Only

## Overview

Push notifications are now **mobile-only** using native Expo push notifications. The PWA/web push system has been removed in favor of a simpler, more reliable mobile app experience.

## Architecture

### Mobile Push Tokens

```prisma
model MobilePushToken {
  id                      String   @id @default(uuid())
  expoPushToken           String   @unique
  userId                  String
  platform                String   // 'ios' | 'android'
  deviceInfo              String?  // JSON string with device details
  pushNotificationsEnabled Boolean  @default(true)
  createdAt               DateTime @default(now())
  lastActiveAt            DateTime @default(now())
  user                    User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### User Preferences

Push notifications are controlled via the existing `UserProfile.pushNotifications` field:

```prisma
pushNotifications Boolean? @default(false)
```

## How It Works

### 1. Mobile App Registration

- User logs into mobile app
- App requests push permissions
- Expo push token is generated and sent to backend
- Token is stored in `MobilePushToken` table with user association

### 2. Push Notification Flow

```
Backend → Expo Push Service → iOS/Android → Mobile App
```

### 3. User Control

- Users can enable/disable in mobile app settings
- Settings sync with backend via mobile app bridge
- Disabled tokens are not sent notifications

## Usage Examples

### Send to Specific Users

```typescript
import { sendPushNotificationToUsers } from '@/app/actions/push-notifications'

await sendPushNotificationToUsers(
  [userId1, userId2],
  '🏋️ Workout Reminder',
  'Time for your Upper Body workout!',
  '/fitspace/workouts',
)
```

### Send via Mobile Service

```typescript
import { sendMobilePushNotifications } from '@/lib/notifications/mobile-push-service'

await sendMobilePushNotifications({
  userIds: [userId],
  title: 'New Plan Assigned',
  body: 'Your trainer assigned you a new workout plan',
  data: { url: '/fitspace/my-plans' },
})
```

### Integration with Existing Notifications

```typescript
import { sendPushForNotification } from '@/lib/notifications/push-integration'

// Automatically sends push alongside in-app notifications
await sendPushForNotification(
  userId,
  GQLNotificationType.NewTrainingPlanAssigned,
  'Your new training plan is ready!',
  '/fitspace/my-plans',
)
```

## API Endpoints

### Mobile App Registration

- `POST /api/mobile/push-token` - Register/update push token
- `PATCH /api/mobile/push-token` - Update notification preferences

### Admin/Testing

- `POST /api/admin/test-push` - Send test notifications
- `GET /api/admin/test-push` - Get push statistics

## Key Features

### ✅ What Works

- Native iOS/Android push notifications
- Deep linking support
- User preference synchronization
- Automatic permission detection
- Background notification handling
- Badge count management

### ❌ What's Removed

- PWA/web push notifications
- Service worker registration
- VAPID key configuration
- Browser notification APIs

## Migration Notes

If upgrading from the old PWA system:

1. **Database**: Old `PushSubscription` records are not automatically migrated
2. **Environment**: VAPID keys are no longer needed
3. **Frontend**: Remove any service worker registration code
4. **Settings**: Update notification settings to mobile-only UI

## Development

### Testing

```typescript
import { sendTestNotification } from '@/app/actions/push-notifications'

await sendTestNotification('Test message')
```

### Debugging

- Check Expo push token format: `ExponentPushToken[...]`
- Verify permissions in mobile app settings
- Check device platform compatibility
- Monitor push token sync in app logs
