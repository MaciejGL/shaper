'use client'

import { AnimatePresence } from 'framer-motion'
import { ClockIcon, GaugeIcon, TextIcon } from 'lucide-react'
import { useState } from 'react'

import { AnimateHeightItem } from '@/components/animations/animated-container'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VideoPreview } from '@/components/video-preview'
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
        isDraft={formData.details.isDraft}
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
  isDraft: boolean
  isPublic: boolean
  description?: string
}

function PlanHeader({
  title,
  isDraft,
  isPublic,
  description,
}: PlanHeaderProps) {
  return (
    <div className="space-y-2">
      <h2 className="text-2xl font-bold">{title}</h2>
      <div className="flex gap-2">
        {isDraft && <Badge variant="outline">Draft</Badge>}
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
  const [showInstructions, setShowInstructions] = useState(false)
  const { name, sets, restSeconds, tempo, instructions, videoUrl } = exercise
  return (
    <div className="px-4 py-2 border-l-2">
      <div className="flex justify-between flex-wrap gap-2">
        <div className="font-medium shrink-0">
          {index + 1}. {name}
        </div>
        <div className="text-sm text-muted-foreground flex gap-2">
          <Badge variant="outline">
            <ClockIcon className="size-3" />
            {restSeconds && `${restSeconds}s rest`}
          </Badge>
          {tempo && (
            <Badge variant="outline">
              <GaugeIcon className="size-3" />
              {`Tempo: ${tempo}`}
            </Badge>
          )}
          {instructions && (
            <Button
              variant="outline"
              iconOnly={<TextIcon />}
              onClick={() => setShowInstructions(!showInstructions)}
            >
              Instructions
            </Button>
          )}
          {videoUrl && <VideoPreview url={videoUrl} variant="outline" />}
        </div>
      </div>
      <div className="mt-2 overflow-x-auto">
        <table className=" border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-xs font-medium text-center py-2 px-4">Set</th>
              <th className="text-xs font-medium text-center py-2 px-4">
                Reps
              </th>
              <th className="text-xs font-medium text-center py-2 px-4">
                Weight
              </th>
              <th className="text-xs font-medium text-center py-2 px-4">RPE</th>
            </tr>
          </thead>
          <tbody>
            {sets.map((set) => (
              <tr key={`set-${set.order}`} className="border-b last:border-b-0">
                <td className="text-sm text-center py-2">{set.order}</td>
                <td className="text-sm text-center py-2">
                  {set.minReps && set.maxReps
                    ? `${set.minReps}-${set.maxReps}`
                    : set.reps}
                </td>
                <td className="text-sm text-center py-2">
                  {set.weight ? `${set.weight} kg` : '-'}
                </td>
                <td className="text-sm text-center py-2">
                  {set.rpe ? `${set.rpe}` : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        {showInstructions && (
          <AnimateHeightItem id="instructions" isFirstRender={false}>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {instructions}
            </p>
          </AnimateHeightItem>
        )}
      </AnimatePresence>
    </div>
  )
}

type WeekDetailsProps = {
  week: TrainingPlanFormData['weeks'][number]
}

function WeekDetails({ week }: WeekDetailsProps) {
  const workingDaysWithoutExercises = week.days.filter(
    (d) => !d.isRestDay && d.exercises.length === 0,
  ).length

  return (
    <AccordionItem key={week.weekNumber} value={week.weekNumber.toString()}>
      <AccordionTrigger>
        <div className="flex justify-between w-full pr-4">
          <span>{week.name}</span>
          <div className="flex gap-2">
            {workingDaysWithoutExercises > 0 ? (
              <span className="text-sm text-red-800">
                {workingDaysWithoutExercises} empty day
                {workingDaysWithoutExercises > 1 ? 's' : ''}
              </span>
            ) : null}
            <span className="text-sm text-muted-foreground">
              {week.days.filter((d) => !d.isRestDay).length} training days
            </span>
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent>
        {week.description && (
          <p className="text-muted-foreground mb-4">{week.description}</p>
        )}
        <div className="flex flex-col gap-4">
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
    <div className={cn('border rounded-md p-4', day.isRestDay && 'opacity-50')}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="font-medium">{dayNames[day.dayOfWeek]}</h4>
        {day.isRestDay ? (
          <Badge variant="outline">Rest Day</Badge>
        ) : (
          <Badge>{day.workoutType || 'Workout'}</Badge>
        )}
      </div>

      {!day.isRestDay && (
        <div className="space-y-4">
          {day.exercises.length > 0 ? (
            day.exercises.map((exercise, index) => (
              <ExerciseDetails
                key={`exercise-${exercise.id}`}
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
