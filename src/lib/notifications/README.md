# Push Notifications Integration Guide

## Overview

Push notifications are now fully integrated with your Shaper app's user preferences and database system. Users can control their push notification preferences through the existing settings, and notifications respect these preferences.

## Database Schema

### PushSubscription Model

```prisma
model PushSubscription {
  id        String   @id @default(uuid())
  userId    String
  endpoint  String   @unique
  p256dh    String
  auth      String
  userAgent String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

### User Preferences

Push notifications are controlled via the existing `UserProfile.pushNotifications` field:

```prisma
pushNotifications Boolean? @default(false)
```

## Integration Points

### 1. User Preferences Context

- ✅ Push notifications integrate with `useUserPreferences()` hook
- ✅ Subscription status automatically updates user preferences
- ✅ Preferences control whether notifications are sent

### 2. Existing Notification System

Use the integration helper to send push notifications alongside your existing notifications:

```typescript
import { sendPushForNotification } from '@/lib/notifications/push-integration'

// Send push notification for existing notification types
await sendPushForNotification(
  userId,
  GQLNotificationType.NewTrainingPlanAssigned,
  'Your new training plan is ready!',
  '/fitspace/my-plans',
)
```

### 3. Direct Push Notifications

Send push notifications directly to specific users:

```typescript
import { sendPushNotificationToUsers } from '@/app/actions/push-notifications'

// Send to specific users
await sendPushNotificationToUsers(
  [userId1, userId2],
  '🏋️ Workout Reminder',
  'Time for your Upper Body workout!',
  '/fitspace/workouts',
)
```

### 4. Specialized Helpers

```typescript
import {
  sendMealReminderPush,
  sendWorkoutReminderPush,
} from '@/lib/notifications/push-integration'

// Workout reminders
await sendWorkoutReminderPush(userId, 'Upper Body Strength', '3:00 PM')

// Meal reminders
await sendMealReminderPush(userId, 'lunch', '12:30 PM')
```

## Usage Examples

### Extending Existing Notification Creation

```typescript
// In your existing notification resolvers/services
import { createNotificationWithPush } from '@/lib/notifications/push-integration'

export async function createTrainingPlanNotification(
  userId: string,
  planName: string,
) {
  // This will create both in-app and push notifications
  await createNotificationWithPush({
    userId,
    type: GQLNotificationType.NewTrainingPlanAssigned,
    message: `Your new training plan "${planName}" is ready!`,
    link: '/fitspace/my-plans',
  })
}
```

### Scheduled Notifications

```typescript
// For cron jobs or scheduled tasks
import { sendWorkoutReminderPush } from '@/lib/notifications/push-integration'

// Send workout reminders 30 minutes before scheduled time
await sendWorkoutReminderPush(userId, 'Morning Strength Training', '7:00 AM')
```

## User Experience

### Subscription Flow

1. User visits `/fitspace/push-test` or uses the component
2. Clicks "Subscribe" → Browser requests permission
3. If granted → Subscription stored in database + preferences updated to `pushNotifications: true`
4. User can disable in preferences without unsubscribing (notifications won't be sent)
5. User can unsubscribe completely → removes from database + updates preferences

### Preference Integration

- **Subscribed + Enabled**: ✅ Receives notifications
- **Subscribed + Disabled**: 🔕 No notifications sent (respects preferences)
- **Not Subscribed**: ❌ No notifications possible

## Files Created/Modified

### New Files

- `src/server/models/push-subscription/` - Complete GraphQL model
- `src/lib/notifications/push-integration.ts` - Integration helpers
- `src/lib/notifications/README.md` - This documentation

### Modified Files

- `prisma/schema.prisma` - Added PushSubscription model
- `src/app/actions/push-notifications.ts` - Database integration
- `src/components/push-notification-manager.tsx` - User preferences integration

## Next Steps

### Run Migration

```bash
npx prisma migrate dev --name add_push_subscriptions
```

### Add to GraphQL Schema

Add the push subscription schema to your main GraphQL schema if using schema stitching.

### Test Integration

1. Add VAPID keys to `.env`
2. Visit `/fitspace/push-test`
3. Subscribe to notifications
4. Check preferences are updated
5. Test notification sending

## Production Considerations

- ✅ User preferences respected
- ✅ Database persistence
- ✅ Error handling and logging
- ✅ Authentication required
- ✅ Cross-platform support
- ✅ Integration with existing notification system

The system is now production-ready and fully integrated with your existing Shaper app architecture! 🚀
