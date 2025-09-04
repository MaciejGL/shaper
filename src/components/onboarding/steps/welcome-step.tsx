import { Button } from '@/components/ui/button'

import type { OnboardingPath } from '../onboarding-modal'

interface WelcomeStepProps {
  onPathSelect: (path: OnboardingPath) => void
  onQuickStart: () => void
}

export function WelcomeStep({ onPathSelect, onQuickStart }: WelcomeStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold">Welcome to Hypertro!</h1>
        <p className="text-muted-foreground text-lg">
          Ready to start your fitness journey?
        </p>
      </div>

      <div className="space-y-3">
        <Button onClick={onQuickStart} size="lg" className="w-full">
          Start Workout Now
        </Button>

        <Button
          onClick={() => onPathSelect('setup')}
          variant="outline"
          size="lg"
          className="w-full"
        >
          Setup My Account First
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        You can always change your preferences later
      </p>
    </div>
  )
}
