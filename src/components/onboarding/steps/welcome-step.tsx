import { Button } from '@/components/ui/button'

import type { OnboardingPath } from '../onboarding-modal'

interface WelcomeStepProps {
  onPathSelect: (path: OnboardingPath) => void
  onQuickStart: () => void
}

export function WelcomeStep({ onPathSelect, onQuickStart }: WelcomeStepProps) {
  return (
    <div className="text-center space-y-6 flex-center flex-col h-full">
      <div className="space-y-3 mb-10">
        <h1 className="text-3xl font-bold">Welcome to Hypro!</h1>
        <p className="text-muted-foreground text-lg">
          Ready to start your fitness journey?
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="tertiary"
          onClick={onQuickStart}
          size="xl"
          className="w-full"
        >
          Start Workout
        </Button>

        <Button
          onClick={() => onPathSelect('setup')}
          variant="default"
          size="xl"
          className="w-full"
        >
          Set Preferences and Start Workout
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        You can always change your preferences later
      </p>
    </div>
  )
}
