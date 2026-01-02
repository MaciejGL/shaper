# PostHog Integration Setup

This guide explains how to set up PostHog integration in the Hypro application for feature flags, session recordings, and page view tracking.

## Environment Variables

Add the following environment variables to your `.env.local` file:

```bash
# PostHog Configuration
# Get your PostHog project API key from https://app.posthog.com/project/settings
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key_here

# PostHog Host URL (optional, defaults to https://app.posthog.com)
# Only change this if you're using PostHog Cloud EU or self-hosted PostHog
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
```

## Getting Your PostHog API Key

1. Go to [PostHog](https://app.posthog.com) and sign up or log in
2. Navigate to Project Settings
3. Copy your Project API Key
4. Add it to your `.env.local` file as `NEXT_PUBLIC_POSTHOG_KEY`

## Features Enabled

### 1. Page View Tracking

- Automatic page view tracking on route changes
- Captures URL with query parameters
- Tracks user navigation patterns

### 2. Feature Flags

- Real-time feature flag evaluation
- React hooks for easy integration
- Automatic updates when flags change

### 3. Session Recordings

- Captures user interactions
- Masks sensitive inputs (passwords)
- Helps with debugging and UX improvements

## User Registration with PostHog

PostHog automatically registers users when they log in and resets tracking when they log out. This is handled automatically by the `usePostHogUser` hook in the PostHog provider.

### How User Registration Works

1. **Automatic Registration**: When a user logs in via NextAuth, PostHog automatically identifies them using their email as the unique identifier.

2. **User Properties**: The system tracks basic user information like email, role, and profile data.

3. **Logout Handling**: When users log out, PostHog tracking is reset to protect privacy.

### Manual User Identification

If you need to manually identify users or add additional properties:

```tsx
import { usePostHogAuth } from '@/hooks/use-posthog-auth'

function LoginComponent() {
  const { identifyUserOnLogin } = usePostHogAuth()

  const handleSuccessfulLogin = (user) => {
    // Manually identify user with additional properties
    identifyUserOnLogin(user.email, {
      user_role: user.role,
      signup_date: user.createdAt,
      has_subscription: !!user.subscription,
    })
  }
}
```

### Enhanced User Identification

For detailed user tracking with profile information:

```tsx
import { usePostHogUserEnhanced } from '@/hooks/use-posthog-user-enhanced'

function DashboardComponent() {
  const { isAuthenticated, userData, hasIdentified } = usePostHogUserEnhanced()

  // This hook automatically identifies users with detailed profile data
  // including fitness goals, body measurements, trainer relationships, etc.

  return (
    <div>
      {isAuthenticated && hasIdentified && (
        <p>User tracking active with detailed profile data</p>
      )}
    </div>
  )
}
```

## Usage Examples

### Feature Flags

```tsx
import { useFeatureFlag, useFeatureFlagValue } from '@/hooks/use-feature-flag'

function MyComponent() {
  // Simple boolean feature flag
  const isNewDesignEnabled = useFeatureFlag('new-design')

  // Feature flag with value (boolean, string, or undefined)
  const { value: theme, isLoading } = useFeatureFlagValue('theme-variant')

  if (isLoading) return <div>Loading...</div>

  return (
    <div className={isNewDesignEnabled ? 'new-design' : 'old-design'}>
      <h1>Content with theme: {theme}</h1>
    </div>
  )
}
```

### Custom Event Tracking

```tsx
import { usePostHogTracking } from '@/hooks/use-posthog-tracking'

function WorkoutComponent() {
  const { trackWorkoutEvent, trackEvent } = usePostHogTracking()

  const handleWorkoutComplete = () => {
    trackWorkoutEvent('completed', {
      workout_type: 'strength',
      duration_minutes: 45,
      exercises_count: 8,
    })
  }

  const handleCustomEvent = () => {
    trackEvent('custom_action', {
      action_type: 'button_click',
      component: 'WorkoutComponent',
    })
  }
}
```

### Manual User Identification

```tsx
import { identifyUser, resetUser } from '@/lib/posthog'

function AuthComponent() {
  const handleLogin = async (user) => {
    // Login logic...

    // Identify user with PostHog
    identifyUser(user.email, {
      user_id: user.id,
      role: user.role,
      name: user.name,
      signup_date: user.createdAt,
    })
  }

  const handleLogout = async () => {
    // Reset PostHog tracking
    resetUser()

    // Logout logic...
  }
}
```

## Configuration Details

### Session Recordings

- **Enabled**: Yes
- **Mask all inputs**: No (only passwords are masked)
- **Capture**: User interactions, clicks, scrolls

### Feature Flags

- **Real-time updates**: Yes
- **Fallback behavior**: Returns false/undefined when PostHog unavailable
- **Caching**: Checks for updates every 30 seconds and on window focus

### Page Views

- **Automatic tracking**: Yes
- **Route changes**: Captured automatically
- **Query parameters**: Included in tracking

## Troubleshooting

1. **PostHog not loading**: Check your API key and network connection
2. **Feature flags not updating**: Ensure you're using the correct flag key
3. **Session recordings not working**: Verify your PostHog project has recordings enabled

## Environment Setup

The PostHog provider is automatically included in the app through the providers structure:

```tsx
// Already configured in src/components/providers.tsx
<PostHogProvider>{/* Your app components */}</PostHogProvider>
```

## Performance Considerations

- PostHog loads asynchronously to avoid blocking the main thread
- Feature flag checks are cached and updated periodically
- Session recordings are optimized for minimal performance impact

## In-App Feedback Survey

The app includes a lightweight "Feedback" entry in the profile menu that lets users report bugs, request features, or share opinions. Responses are stored in PostHog Surveys for admin triage.

### How It Works

1. User clicks **Feedback** in the top-nav profile dropdown.
2. A modal opens with a custom feedback form.
3. The modal emits a `feedback_opened` event with `from`, `pathname`, and `url` properties.
4. User fills in the form (feedback type + details).
5. On submit, the app sends a `survey sent` event to PostHog with survey response data.

### Setting Up the Survey in PostHog

1. In PostHog, go to **Surveys** and click **New survey**.
2. Add two questions:
   - **Question 1** (id: `feedback_type`): "What type of feedback is this?" with options `Bug`, `Feature request`, `Opinion`.
   - **Question 2** (id: `feedback_details`): "Tell us more" (open text).
3. Set display to **API only** (since we're using a custom form, not the PostHog overlay).
4. Launch the survey and copy the **Survey ID**.
5. Update `src/components/feedback-modal/feedback-modal.tsx` and replace the `SURVEY_ID` constant with the actual survey ID.

### Custom Form Implementation

The feedback modal (`src/components/feedback-modal/feedback-modal.tsx`) uses a custom inline form that:
- Shows a select dropdown for feedback type (Bug, Feature request, Opinion)
- Shows a textarea for detailed feedback
- Sends responses directly to PostHog using `posthog.capture('survey sent', {...})`

This approach gives full control over the UI while still tracking responses in PostHog's survey analytics.

Responses will appear in the Surveys section of your PostHog project. You can connect Slack, Zapier, or other integrations to receive notifications when new feedback is submitted.
