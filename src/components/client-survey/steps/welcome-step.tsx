import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface WelcomeStepProps {
  onStart: () => void
  onSkip: () => void
}

export function WelcomeStep({ onStart, onSkip }: WelcomeStepProps) {
  return (
    <div className="flex flex-col items-center text-center space-y-6 py-8">
      <div className="size-16 rounded-full bg-primary/10 flex-center">
        <Sparkles className="size-8 text-primary" />
      </div>

      <div className="space-y-3">
        <h2 className="text-2xl font-semibold">
          Help Your Coach Create the Perfect Plan
        </h2>
        <p className="text-muted-foreground max-w-md">
          Take a few minutes to share your fitness background, goals, and
          preferences. This helps your trainer design a program tailored
          specifically for you.
        </p>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 space-y-2 w-full max-w-md">
        <p className="text-sm font-medium">What we'll cover:</p>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Your current fitness level and experience</li>
          <li>• Primary and secondary fitness goals</li>
          <li>• Training preferences and schedule</li>
          <li>• Nutrition habits and lifestyle</li>
          <li>• Recovery and sleep patterns</li>
        </ul>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-md pt-4">
        <Button size="lg" onClick={onStart} iconStart={<Sparkles />}>
          Get Started
        </Button>
        <Button size="lg" variant="ghost" onClick={onSkip}>
          Skip for Now
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        This survey is optional but helps create better results
      </p>
    </div>
  )
}
