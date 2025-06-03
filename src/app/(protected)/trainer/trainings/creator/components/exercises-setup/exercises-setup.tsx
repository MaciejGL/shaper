'use client'

import { Plus, PlusCircle } from 'lucide-react'
import React, { memo, useCallback, useMemo } from 'react'

import { RadioGroupTabs } from '@/components/radio-group'
import { Button } from '@/components/ui/button'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'

import { TrainingDay, TrainingExercise, TrainingWeek } from '../types'
import { dayNames } from '../utils'

import { ExerciseCard } from './exercise-card'
import { ExerciseForm } from './exercise-form'
import { useExercisesSetup } from './use-exercise-setup'

export const ExercisesSetup = memo(function ExercisesSetup() {
  const { formData, activeWeek, setActiveWeek, activeDay, setActiveDay } =
    useTrainingPlan()
  const weeks = formData.weeks

  const currentDay = useMemo(() => {
    return weeks[activeWeek].days.find((day) => day.dayOfWeek === activeDay)
  }, [weeks, activeWeek, activeDay])
  const days = useMemo(() => weeks[activeWeek].days, [weeks, activeWeek])

  const {
    editingExerciseIndex,
    exerciseFormOpen,
    trainerExercises,
    handleEditExercise,
    handleCloseExerciseForm,
    setExerciseFormOpen,
  } = useExercisesSetup()

  const handleSetWeek = useCallback(
    (week: number, day: number) => {
      setActiveWeek(week)
      const selectedWeek = weeks[week]
      const weekDays = selectedWeek.days
      const isNewDayActive = !weekDays[day].isRestDay

      if (isNewDayActive) {
        setActiveWeek(week)
        setActiveDay(day)
      } else {
        const firstActiveDay = weekDays.findIndex((day) => !day.isRestDay)
        setActiveDay(firstActiveDay)
        setActiveWeek(week)
      }
    },
    [weeks, setActiveWeek, setActiveDay],
  )

  return (
    <div className="space-y-6">
      <Navigation
        weeks={weeks}
        activeWeek={activeWeek}
        activeDay={activeDay}
        days={days}
        handleSetWeek={handleSetWeek}
        setActiveDay={setActiveDay}
      />

      {currentDay && !currentDay.isRestDay ? (
        <div className="space-y-4">
          <ExerciseListHeader
            activeWeek={activeWeek}
            currentDay={currentDay}
            setExerciseFormOpen={setExerciseFormOpen}
          />

          {currentDay.exercises.length > 0 ? (
            <ExerciseList
              exercises={currentDay.exercises}
              onEdit={handleEditExercise}
            />
          ) : (
            <EmptyState setExerciseFormOpen={setExerciseFormOpen} />
          )}
        </div>
      ) : (
        <div className="text-center p-8 border rounded-lg">
          <div className="text-muted-foreground">
            {currentDay?.isRestDay
              ? `${dayNames[currentDay.dayOfWeek]} is a rest day`
              : 'Please select a training day'}
          </div>
        </div>
      )}
      <ExerciseForm
        isOpen={exerciseFormOpen}
        onOpenChange={handleCloseExerciseForm}
        editingExerciseIndex={editingExerciseIndex}
        trainerExercises={trainerExercises}
      />
    </div>
  )
})

function Navigation({
  weeks,
  activeWeek,
  activeDay,
  days,
  handleSetWeek,
  setActiveDay,
}: {
  weeks: TrainingWeek[]
  activeWeek: number
  activeDay: number
  days: TrainingDay[]
  handleSetWeek: (week: number, day: number) => void
  setActiveDay: (day: number) => void
}) {
  return (
    <div className="flex flex-col gap-2 space-y-2">
      <RadioGroupTabs
        title="Select Week"
        items={weeks.map((week, index) => ({
          id: `week-${index}`,
          value: index.toString(),
          label: `Week ${index + 1}`,
        }))}
        onValueChange={(value) =>
          handleSetWeek(Number.parseInt(value), activeDay)
        }
        value={activeWeek.toString()}
      />

      <RadioGroupTabs
        title="Select Day"
        items={days.map((day, index) => ({
          id: `day-${activeWeek}-${day.dayOfWeek}-${index}`,
          value: day.dayOfWeek.toString(),
          label: dayNames[day.dayOfWeek],
          disabled: day.isRestDay,
        }))}
        onValueChange={(value) => setActiveDay(Number.parseInt(value))}
        value={activeDay.toString()}
      />
    </div>
  )
}

function ExerciseListHeader({
  activeWeek,
  currentDay,
  setExerciseFormOpen,
}: {
  activeWeek: number
  currentDay: TrainingDay
  setExerciseFormOpen: (open: boolean) => void
}) {
  return (
    <div className="flex justify-between items-center">
      <h3 className="text-lg font-medium">
        Week {activeWeek + 1} - {dayNames[currentDay.dayOfWeek]} -{' '}
        {currentDay.workoutType || 'Workout'}
      </h3>
      <Button onClick={() => setExerciseFormOpen(true)}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Add Exercise
      </Button>
    </div>
  )
}

function ExerciseList({
  exercises,
  onEdit,
}: {
  exercises: TrainingExercise[]
  onEdit: (index: number) => void
}) {
  return (
    <div className="space-y-8">
      {exercises.map((exercise, index) => (
        <ExerciseCard
          key={exercise.order}
          exercise={exercise}
          exerciseIndex={index}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}

function EmptyState({
  setExerciseFormOpen,
}: {
  setExerciseFormOpen: (open: boolean) => void
}) {
  return (
    <div className="text-center p-8 border rounded-lg">
      <div className="text-muted-foreground">No exercises added yet</div>
      <Button
        variant="outline"
        className="mt-4 mx-auto"
        onClick={() => setExerciseFormOpen(true)}
        iconStart={<Plus />}
      >
        Add Your First Exercise
      </Button>
    </div>
  )
}
