import { Clock, Dumbbell, Target } from 'lucide-react'
import { useState } from 'react'

import { getDayName } from '@/app/(protected)/trainer/trainings/creator/utils'
import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GQLGetTrainingPlanPreviewByIdQuery } from '@/generated/graphql-client'
import { estimateWorkoutTime } from '@/lib/workout/esimate-workout-time'

type WorkoutsProps = {
  plan: GQLGetTrainingPlanPreviewByIdQuery['getTrainingPlanById']
  isDemo: boolean
}

export function Workouts({ plan, isDemo }: WorkoutsProps) {
  const [selectedWeek, setSelectedWeek] = useState<number>(0)
  const [selectedDay, setSelectedDay] = useState<string>(
    plan.weeks[selectedWeek].days.find((day) => !day.isRestDay)?.id ?? '',
  )

  const handleWeekChange = (index: number) => {
    setSelectedWeek(index)
    setSelectedDay(
      plan.weeks[index].days.find((day) => !day.isRestDay)?.id ?? '',
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex overflow-x-auto gap-2">
        {plan.weeks.map((week, index) => (
          <Button
            key={week.id}
            variant={index === selectedWeek ? 'default' : 'outline'}
            disabled={isDemo && index > 0}
            onClick={() => handleWeekChange(index)}
          >
            {week.name}
          </Button>
        ))}
      </div>
      <Tabs value={selectedDay} onValueChange={setSelectedDay}>
        <TabsList className="w-full">
          {plan.weeks[selectedWeek].days.map((day) => (
            <TabsTrigger key={day.id} value={day.id} disabled={day.isRestDay}>
              {getDayName(day.dayOfWeek, { short: true })}
            </TabsTrigger>
          ))}
        </TabsList>

        {plan.weeks[selectedWeek].days.map((day) => (
          <TabsContent
            key={day.id}
            value={day.id}
            className="bg-muted/50 md:rounded-lg p-4 -mx-6 md:mx-0"
          >
            <Workout workout={day} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

type WorkoutProps = {
  workout: WorkoutsProps['plan']['weeks'][number]['days'][number]
}

export function Workout({ workout }: WorkoutProps) {
  const totalSets = workout.exercises.reduce(
    (total, exercise) => total + exercise.sets.length,
    0,
  )
  const estimatedDuration = estimateWorkoutTime(workout.exercises)

  return (
    <AnimatedPageTransition
      key={workout.id}
      id={workout.id}
      variant="blur"
      mode="wait"
    >
      <Card className="border-none !bg-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Dumbbell className="w-5 h-5" />
            {workout.workoutType}
          </CardTitle>
          <CardDescription>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4" />
                <span>{workout.exercises.length} exercises</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>~{estimatedDuration}min</span>
              </div>
            </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workout.exercises.map((exercise) => (
              <div
                key={exercise.id}
                className="bg-primary-foreground rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">{exercise.name}</h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {exercise.muscleGroups.map((muscle) => (
                        <Badge
                          key={muscle.alias}
                          variant="outline"
                          className="text-xs"
                        >
                          {muscle.alias}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 items-baseline">
                  <div className="font-medium">{exercise.sets.length} sets</div>
                  <div className="text-sm text-muted-foreground">
                    {exercise.restSeconds}s rest
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="flex justify-between items-center">
            <span className="font-semibold">Total sets:</span>
            <span className="text-2xl font-bold">{totalSets}</span>
          </div>
        </CardContent>
      </Card>
    </AnimatedPageTransition>
  )
}
