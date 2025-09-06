import { BookOpenCheckIcon, ChevronRight, DumbbellIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SectionIcon } from '@/components/ui/section-icon'

interface QuickWorkoutChoiceStepProps {
  onWorkoutChoice: (choice: 'custom' | 'plans') => void
}

export function QuickWorkoutChoiceStep({
  onWorkoutChoice,
}: QuickWorkoutChoiceStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2 mb-10">
        <h2 className="text-2xl font-semibold">Ready to start?</h2>
        <p className="text-muted-foreground">
          Choose how you'd like to begin your workout
        </p>
      </div>

      <div className="space-y-3">
        <Button
          onClick={() => onWorkoutChoice('custom')}
          variant="secondary"
          className="w-full h-auto text-left justify-start p-4"
          iconStart={
            <SectionIcon size="sm" icon={DumbbellIcon} variant="green" />
          }
          iconEnd={<ChevronRight />}
        >
          <div className="text-left flex-1">
            <div className="font-medium">Start Your Custom Workout</div>
            <div className="text-sm text-muted-foreground">
              Create workout with our wizard
            </div>
          </div>
        </Button>

        <Button
          onClick={() => onWorkoutChoice('plans')}
          variant="secondary"
          className="w-full h-auto text-left justify-start p-4"
          iconStart={
            <SectionIcon size="sm" icon={BookOpenCheckIcon} variant="sky" />
          }
          iconEnd={<ChevronRight />}
        >
          <div className="text-left flex-1">
            <div className="font-medium">Checkout Premade Training Plans</div>
            <div className="text-sm text-muted-foreground">
              Explore our workout programs
            </div>
          </div>
        </Button>
      </div>
    </div>
  )
}
