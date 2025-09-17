'use client'

import { formatDistanceToNow } from 'date-fns'
import { Trophy } from 'lucide-react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { useUser } from '@/context/user-context'
import {
  useExercisesProgressByUserQuery,
  useGetUserPrHistoryQuery,
} from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { cn } from '@/lib/utils'

import { ExerciseLogsContent } from './exercise-logs-drawer-content'
import { ExerciseProgressChart } from './exercise-progress-chart'

interface ExerciseDrawerProps {
  exerciseId: string | null
  isOpen: boolean
  onClose: () => void
}

export function ExerciseDrawer({
  exerciseId,
  isOpen,
  onClose,
}: ExerciseDrawerProps) {
  const { user } = useUser()
  const { toDisplayWeight, weightUnit } = useWeightConversion()

  const { data: progressData, isLoading: isLoadingProgress } =
    useExercisesProgressByUserQuery(
      { userId: user?.id || '' },
      {
        enabled: !!user?.id && !!exerciseId && isOpen,
        select: (data) => ({
          ...data,
          exercisesProgressByUser: data.exercisesProgressByUser.filter(
            (ex) => ex.baseExercise?.id === exerciseId,
          ),
        }),
      },
    )

  const { data: prHistory, isLoading: isLoadingPRs } = useGetUserPrHistoryQuery(
    { userId: user?.id || '', exerciseId: exerciseId || '' },
    { enabled: !!user?.id && !!exerciseId && isOpen },
  )

  const exercise = progressData?.exercisesProgressByUser[0]
  const prs = prHistory?.getUserPRHistory || []

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent dialogTitle="Exercise Details" className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>{exercise?.baseExercise?.name}</DrawerTitle>
        </DrawerHeader>
        <div className="pb-6 space-y-6 overflow-y-auto">
          {isLoadingProgress ? (
            <LoadingSkeleton variant="lg" count={1} />
          ) : null}
          {/* Progress Chart */}
          {!isLoadingProgress && exercise ? (
            <div>
              <ExerciseProgressChart exercise={exercise} />
            </div>
          ) : null}

          {/* Personal Records */}
          <div className="px-2">
            <h3 className="font-medium mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Personal Records
            </h3>

            {isLoadingPRs ? (
              <div className="space-y-3">
                <LoadingSkeleton variant="sm" count={2} />
              </div>
            ) : prs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Trophy className="h-8 w-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No personal records yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {prs.slice(0, 10).map((pr, index) => (
                  <div
                    key={pr.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg bg-card-on-card',
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full',
                          index === 0
                            ? 'bg-yellow-500 text-white'
                            : 'bg-muted text-muted-foreground',
                        )}
                      >
                        <Trophy className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {toDisplayWeight(pr.estimated1RM)?.toFixed(1)}{' '}
                          {weightUnit}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {toDisplayWeight(pr.weight)?.toFixed(1)} {weightUnit}{' '}
                          × {pr.reps} reps
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(pr.achievedAt), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {exercise?.estimated1RMProgress && (
            <Accordion type="single" collapsible>
              <AccordionItem
                value="exercise-logs"
                className="bg-card-on-card rounded-lg mx-2 px-2"
              >
                <AccordionTrigger>Logs History</AccordionTrigger>
                <AccordionContent>
                  <ExerciseLogsContent
                    estimated1RMProgress={exercise.estimated1RMProgress}
                  />
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
