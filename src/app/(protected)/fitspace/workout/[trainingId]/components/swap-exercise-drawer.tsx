import { Button } from '@/components/ui/button'
import { Drawer, SimpleDrawerContent } from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import type { WorkoutContextPlan } from '@/context/workout-context/workout-context'
import { cn } from '@/lib/utils'

interface SwapExerciseDrawerProps {
  exercise: WorkoutContextPlan['exercises'][number]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  selectedSubstituteId: string | null
  onSelectedSubstituteIdChange: (id: string | null) => void
  onSwap: () => void
  isSwapping: boolean
}

export function SwapExerciseDrawer({
  exercise,
  isOpen,
  onOpenChange,
  selectedSubstituteId,
  onSelectedSubstituteIdChange,
  onSwap,
  isSwapping,
}: SwapExerciseDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <SimpleDrawerContent
        title="Swap exercise"
        footer={
          <Button
            variant="secondary"
            disabled={!selectedSubstituteId}
            loading={isSwapping}
            onClick={onSwap}
          >
            Swap
          </Button>
        }
      >
        <div className="flex flex-col gap-2">
          <RadioGroup
            value={selectedSubstituteId}
            onValueChange={(value) => onSelectedSubstituteIdChange(value)}
          >
            <Label
              key={exercise.id}
              htmlFor={exercise.id}
              className={cn(
                'flex items-center gap-2 p-4 rounded-md bg-card-on-card cursor-pointer',
                !exercise.substitutedBy && 'opacity-50 cursor-default',
              )}
            >
              <RadioGroupItem
                value={exercise.id}
                id={exercise.id}
                disabled={!exercise.substitutedBy}
              />
              {exercise.name} (original)
            </Label>

            {exercise.substitutes.map((substitute) => (
              <Label
                key={substitute.substitute.id}
                htmlFor={substitute.substitute.id}
                className="flex items-center gap-2 p-4 rounded-md bg-card-on-card cursor-pointer"
              >
                <RadioGroupItem
                  value={substitute.substitute.id}
                  id={substitute.substitute.id}
                />
                {substitute.substitute.name}
              </Label>
            ))}
          </RadioGroup>
        </div>
      </SimpleDrawerContent>
    </Drawer>
  )
}
