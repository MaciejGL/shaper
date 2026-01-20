import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
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
      <DrawerContent dialogTitle="Swap exercise" className="max-h-[90vh]">
        <div className="flex flex-col min-h-0">
          <DrawerHeader className="border-b flex-none">
            <DrawerTitle>Swap exercise</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-6">
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
          </div>

          <DrawerFooter className="border-t flex-none">
            <Button
              variant="secondary"
              className="w-full"
              disabled={!selectedSubstituteId}
              loading={isSwapping}
              onClick={onSwap}
            >
              Swap
            </Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
