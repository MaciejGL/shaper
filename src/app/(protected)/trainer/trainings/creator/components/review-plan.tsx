'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

import type { TrainingPlanFormData } from './types'
import { dayNames } from './utils'

type ReviewPlanProps = {
  formData: TrainingPlanFormData
}

export function ReviewPlan({ formData }: ReviewPlanProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{formData.details.title}</h2>
        <div className="flex gap-2">
          {formData.details.isTemplate && (
            <Badge variant="outline">Template</Badge>
          )}
          {formData.details.isPublic && <Badge>Public</Badge>}
        </div>
        {formData.details.description && (
          <p className="text-muted-foreground">
            {formData.details.description}
          </p>
        )}
      </div>

      <Accordion type="multiple" className="w-full">
        {formData.weeks.map((week) => (
          <AccordionItem key={week.id} value={week.id}>
            <AccordionTrigger>
              <div className="flex justify-between w-full pr-4">
                <span>{week.name}</span>
                <span className="text-sm text-muted-foreground">
                  {week.days.filter((d) => !d.isRestDay).length} training days
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              {week.description && (
                <p className="text-muted-foreground mb-4">{week.description}</p>
              )}
              <div className="space-y-4 pt-2">
                {week.days.map((day) => (
                  <div
                    key={day.id}
                    className={cn(
                      'border rounded-md p-4',
                      day.isRestDay && 'bg-muted/50',
                    )}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium">{dayNames[day.dayOfWeek]}</h4>
                      {day.isRestDay ? (
                        <Badge variant="outline">Rest Day</Badge>
                      ) : (
                        <Badge>{day.workoutType || 'Workout'}</Badge>
                      )}
                    </div>

                    {!day.isRestDay && (
                      <div className="space-y-2">
                        {day.exercises.length > 0 ? (
                          day.exercises.map((exercise, index) => (
                            <div
                              key={exercise.id}
                              className="pl-4 border-l-2 border-muted"
                            >
                              <div className="font-medium">
                                {index + 1}. {exercise.name}
                              </div>
                              <div className="text-sm">
                                {exercise.sets.map((set, idx) => (
                                  <span key={set.id} className="mr-3">
                                    Set {set.order}: {set.reps} reps{' '}
                                    {set.weight ? `@ ${set.weight}kg` : ''}
                                    {idx < exercise.sets.length - 1 ? '' : ''}
                                  </span>
                                ))}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {exercise.restSeconds &&
                                  `${exercise.restSeconds}s rest`}
                                {exercise.tempo &&
                                  ` • Tempo: ${exercise.tempo}`}
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-red-800 pl-4 border-l-2 border-red-800">
                            No exercises added
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
