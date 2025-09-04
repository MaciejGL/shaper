import { Button } from '@/components/ui/button'

interface WhatsNextStepProps {
  onChoice: (choice: 'custom' | 'plans' | 'trainer') => void
  onComplete: () => void
}

export function WhatsNextStep({ onChoice, onComplete }: WhatsNextStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-3">
        <h2 className="text-2xl font-semibold">You're all set!</h2>
        <p className="text-muted-foreground">
          What would you like to do first?
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => onChoice('plans')}
          variant="outline"
          className="w-full h-auto p-4 justify-start"
        >
          <div className="text-left">
            <div className="font-medium">Browse Training Plans</div>
            <div className="text-sm text-muted-foreground">
              Explore structured workout programs
            </div>
          </div>
        </Button>

        <Button
          onClick={() => onChoice('trainer')}
          variant="outline"
          className="w-full h-auto p-4 justify-start"
        >
          <div className="text-left">
            <div className="font-medium">Find a Trainer</div>
            <div className="text-sm text-muted-foreground">
              Get personalized coaching
            </div>
          </div>
        </Button>

        <Button
          onClick={() => onChoice('custom')}
          variant="outline"
          className="w-full h-auto p-4 justify-start"
        >
          <div className="text-left">
            <div className="font-medium">Start Quick Workout</div>
            <div className="text-sm text-muted-foreground">
              Build a custom workout now
            </div>
          </div>
        </Button>
      </div>

      <div className="pt-4 border-t">
        <Button onClick={onComplete} variant="ghost" size="sm">
          I'll explore later
        </Button>
      </div>
    </div>
  )
}
