'use client'

import { ChevronDownIcon, Plus, PlusCircle, SlashIcon } from 'lucide-react'
import React, { memo, useMemo } from 'react'

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import { cn } from '@/lib/utils'

import { TrainingDay, TrainingExercise } from '../types'
import { dayNames } from '../utils'

import { ExerciseCard } from './exercise-card'
import { ExerciseForm } from './exercise-form'
import { useExercisesSetup } from './use-exercise-setup'

export const ExercisesSetup = memo(function ExercisesSetup() {
  const { formData, activeWeek, activeDay } = useTrainingPlan()
  const weeks = formData.weeks

  const currentDay = useMemo(() => {
    return weeks[activeWeek].days.find((day) => day.dayOfWeek === activeDay)
  }, [weeks, activeWeek, activeDay])

  const {
    editingExerciseIndex,
    exerciseFormOpen,
    trainerExercises,
    handleEditExercise,
    handleCloseExerciseForm,
    setExerciseFormOpen,
  } = useExercisesSetup()

  return (
    <div className="space-y-6">
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

function ExerciseListHeader({
  activeWeek,
  currentDay,
  setExerciseFormOpen,
}: {
  activeWeek: number
  currentDay: TrainingDay
  setExerciseFormOpen: (open: boolean) => void
}) {
  const { formData, setActiveWeek, setActiveDay, activeDay } = useTrainingPlan()
  const weeks = formData.weeks
  return (
    <div className="flex justify-between items-center">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1">
                Week {activeWeek + 1} <ChevronDownIcon className="size-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {weeks.map((week, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => setActiveWeek(index)}
                    className={cn(
                      'cursor-pointer',
                      activeWeek === index && 'bg-primary/5',
                    )}
                  >
                    <div>
                      <div>
                        <p className="text-md font-medium">Week {index + 1}</p>
                        <p className="text-sm text-muted-foreground">
                          {week.days.filter((day) => !day.isRestDay).length}{' '}
                          days
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1">
                {dayNames[currentDay.dayOfWeek]}{' '}
                <ChevronDownIcon className="size-3" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {weeks[activeWeek].days.map((day, index) => (
                  <DropdownMenuItem
                    key={index}
                    onClick={() => setActiveDay(index)}
                    disabled={day.isRestDay}
                    className={cn(
                      'cursor-pointer',
                      activeDay === index && 'bg-primary/5',
                    )}
                  >
                    <div>
                      <p className="text-md font-medium">
                        {dayNames[day.dayOfWeek]}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {day.isRestDay
                          ? 'Rest Day'
                          : `${day.exercises.length} exercises`}
                      </p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </BreadcrumbItem>
          <BreadcrumbSeparator>
            <SlashIcon />
          </BreadcrumbSeparator>
          <BreadcrumbItem>{currentDay.workoutType || 'Workout'}</BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex gap-2">
        <CopyFrom />
        <Button onClick={() => setExerciseFormOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Exercise
        </Button>
      </div>
    </div>
  )
}

function CopyFrom() {
  const { formData, activeWeek, activeDay, addExercise } = useTrainingPlan()
  const weeks = formData.weeks

  const handleCopyFrom = (exercise: TrainingExercise) => {
    const currentDayExercises =
      formData.weeks[activeWeek].days[activeDay].exercises
    const reorderedExercise = {
      ...exercise,
      order: currentDayExercises.length + 1,
    }
    addExercise(activeWeek, activeDay, reorderedExercise)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" iconEnd={<ChevronDownIcon />}>
          Copy from
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {weeks.map((week, index) => (
          <DropdownMenuGroup key={index}>
            <DropdownMenuLabel>Week {index + 1}</DropdownMenuLabel>
            {week.days
              .filter((day) => !day.isRestDay)
              .map((day, index) => (
                <DropdownMenuSub key={index}>
                  <DropdownMenuSubTrigger>
                    {dayNames[day.dayOfWeek]}
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    {day.exercises.map((exercise, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => {
                          handleCopyFrom(exercise)
                        }}
                      >
                        {exercise.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ExerciseList({
  exercises,
  onEdit,
}: {
  exercises: TrainingExercise[]
  onEdit: (index: number) => void
}) {
  console.log(exercises.at(-1))
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
