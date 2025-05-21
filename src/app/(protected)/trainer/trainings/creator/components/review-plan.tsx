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
      <PlanHeader
        title={formData.details.title}
        isTemplate={formData.details.isTemplate}
        isPublic={formData.details.isPublic}
        description={formData.details.description ?? ''}
      />

      <Accordion type="multiple" className="w-full">
        {formData.weeks.map((week) => (
          <WeekDetails key={week.weekNumber} week={week} />
        ))}
      </Accordion>
    </div>
  )
}

type PlanHeaderProps = {
  title: string
  isTemplate: boolean
  isPublic: boolean
  description?: string
}

function PlanHeader({
  title,
  isTemplate,
  isPublic,
  description,
}: PlanHeaderProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="flex gap-2">
        {isTemplate && <Badge variant="outline">Template</Badge>}
        {isPublic && <Badge>Public</Badge>}
      </div>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
}

type ExerciseDetailsProps = {
  exercise: TrainingPlanFormData['weeks'][number]['days'][number]['exercises'][number]
  index: number
}

function ExerciseDetails({ exercise, index }: ExerciseDetailsProps) {
  return (
    <div className="pl-4 border-l-2 border-muted">
      <div className="font-medium">
        {index + 1}. {exercise.name}
      </div>
      <div className="text-sm">
        {exercise.sets.map((set, idx) => (
          <span key={`set-${set.order}`} className="mr-3">
            Set {set.order}: {set.reps} reps{' '}
            {set.weight ? `@ ${set.weight}kg` : ''}
            {idx < exercise.sets.length - 1 ? '' : ''}
          </span>
        ))}
      </div>
      <div className="text-sm text-muted-foreground">
        {exercise.restSeconds && `${exercise.restSeconds}s rest`}
        {exercise.tempo && ` • Tempo: ${exercise.tempo}`}
      </div>
    </div>
  )
}

type WeekDetailsProps = {
  week: TrainingPlanFormData['weeks'][number]
}

function WeekDetails({ week }: WeekDetailsProps) {
  return (
    <AccordionItem key={week.weekNumber} value={week.weekNumber.toString()}>
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
            <DayDetails key={day.dayOfWeek} day={day} />
          ))}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}

type DayDetailsProps = {
  day: TrainingPlanFormData['weeks'][number]['days'][number]
}

function DayDetails({ day }: DayDetailsProps) {
  return (
    <div
      className={cn('border rounded-md p-4', day.isRestDay && 'bg-muted/50')}
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
              <ExerciseDetails
                key={`exercise-${exercise.order}`}
                exercise={exercise}
                index={index}
              />
            ))
          ) : (
            <div className="text-sm text-red-800 pl-4 border-l-2 border-red-800">
              No exercises added
            </div>
          )}
        </div>
      )}
    </div>
  )
}
