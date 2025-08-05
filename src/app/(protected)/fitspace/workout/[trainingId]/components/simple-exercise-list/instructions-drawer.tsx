import { Drawer, SimpleDrawerContent } from '@/components/ui/drawer'
import type { WorkoutContextPlan } from '@/context/workout-context/workout-context'

interface InstructionsDrawerProps {
  exercise: WorkoutContextPlan['weeks'][number]['days'][number]['exercises'][number]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function InstructionsDrawer({
  exercise,
  isOpen,
  onOpenChange,
}: InstructionsDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <SimpleDrawerContent title={exercise.name}>
        {exercise.instructions && (
          <div>
            <h4 className="font-medium text-foreground mb-2">Instructions:</h4>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {exercise.instructions}
            </p>
          </div>
        )}
        {exercise.additionalInstructions && (
          <div>
            <h4 className="font-medium text-foreground mb-2">
              Additional Notes:
            </h4>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {exercise.additionalInstructions}
            </p>
          </div>
        )}
      </SimpleDrawerContent>
    </Drawer>
  )
}
