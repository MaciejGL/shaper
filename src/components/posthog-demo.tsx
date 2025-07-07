'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useFeatureFlag, useFeatureFlagValue } from '@/hooks/use-feature-flag'
import { usePostHogTracking } from '@/hooks/use-posthog-tracking'

/**
 * Demo component showcasing PostHog integration
 * This component demonstrates:
 * 1. Feature flag usage for UI variations
 * 2. Event tracking for user interactions
 * 3. Conditional rendering based on feature flags
 */
export function PostHogDemo() {
  // Feature flag hooks
  const isNewDesignEnabled = useFeatureFlag('new-design')
  const { value: buttonVariant, isLoading } =
    useFeatureFlagValue('button-variant')
  const showExperimentalFeature = useFeatureFlag('experimental-feature')

  // Event tracking hook
  const { trackEvent, trackFeatureUsage, trackUserInteraction } =
    usePostHogTracking()

  // Event handlers with tracking
  const handleButtonClick = () => {
    trackEvent('demo_button_clicked', {
      button_variant: buttonVariant,
      is_new_design: isNewDesignEnabled,
    })
    trackUserInteraction('button_click', {
      component: 'PostHogDemo',
      feature_flags: {
        new_design: isNewDesignEnabled,
        button_variant: buttonVariant,
      },
    })
  }

  const handleFeatureTest = () => {
    trackFeatureUsage('experimental_feature', {
      enabled: showExperimentalFeature,
      user_tested: true,
    })
  }

  const handleWorkoutStart = () => {
    trackEvent('workout_started', {
      source: 'demo',
      workout_type: 'strength',
      estimated_duration: 45,
    })
  }

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>PostHog Demo</CardTitle>
          <CardDescription>Loading feature flags...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card
      className={`w-full max-w-md ${isNewDesignEnabled ? 'border-blue-500 shadow-lg' : 'border-gray-200'}`}
    >
      <CardHeader>
        <CardTitle
          className={isNewDesignEnabled ? 'text-blue-600' : 'text-gray-900'}
        >
          PostHog Integration Demo
        </CardTitle>
        <CardDescription>
          This component demonstrates PostHog feature flags and event tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feature Flag Status */}
        <div className="space-y-2">
          <h3 className="font-semibold">Feature Flag Status:</h3>
          <ul className="text-sm space-y-1">
            <li>
              <span className="font-medium">New Design:</span>{' '}
              {isNewDesignEnabled ? '✅ Enabled' : '❌ Disabled'}
            </li>
            <li>
              <span className="font-medium">Button Variant:</span>{' '}
              {buttonVariant || 'default'}
            </li>
            <li>
              <span className="font-medium">Experimental Feature:</span>{' '}
              {showExperimentalFeature ? '✅ Enabled' : '❌ Disabled'}
            </li>
          </ul>
        </div>

        {/* Dynamic Button based on feature flag */}
        <Button
          onClick={handleButtonClick}
          variant={buttonVariant === 'secondary' ? 'secondary' : 'default'}
          className={`w-full ${isNewDesignEnabled ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
        >
          {buttonVariant === 'secondary'
            ? 'Secondary Action'
            : 'Primary Action'}
        </Button>

        {/* Conditional experimental feature */}
        {showExperimentalFeature && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-semibold text-yellow-800">
              🧪 Experimental Feature
            </h4>
            <p className="text-sm text-yellow-700 mt-1">
              This feature is only visible when the experimental-feature flag is
              enabled!
            </p>
            <Button
              onClick={handleFeatureTest}
              variant="outline"
              size="sm"
              className="mt-2"
            >
              Test Feature
            </Button>
          </div>
        )}

        {/* Event tracking examples */}
        <div className="space-y-2">
          <h3 className="font-semibold">Event Tracking Examples:</h3>
          <div className="grid grid-cols-1 gap-2">
            <Button onClick={handleWorkoutStart} variant="outline" size="sm">
              Track Workout Start
            </Button>
          </div>
        </div>

        {/* Implementation note */}
        <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded">
          <p>
            <strong>Implementation:</strong> This component uses
            `useFeatureFlag` and `useFeatureFlagValue` hooks to conditionally
            render UI elements and `usePostHogTracking` for event tracking.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default PostHogDemo
