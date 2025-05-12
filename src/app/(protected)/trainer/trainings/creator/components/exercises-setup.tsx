'use client'

import {
  Check,
  Edit,
  GaugeIcon,
  GripVertical,
  Plus,
  PlusCircle,
  Search,
  TimerIcon,
  Trash2,
  X,
} from 'lucide-react'
import { useState } from 'react'

import { RadioGroupTabs } from '@/components/radio-group'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { TrainingPlanFormData } from './types'
import { dayNames } from './utils'

type ExercisesSetupProps = {
  weeks: TrainingPlanFormData['weeks']
  activeWeek: number
  setActiveWeek: (week: number) => void
  activeDay: number
  setActiveDay: (day: number) => void
  updateWeeks: (weeks: TrainingPlanFormData['weeks']) => void
}

// Mock data for base exercises
const mockBaseExercises = [
  {
    id: 'ex1',
    name: 'Barbell Bench Press',
    equipment: 'BARBELL',
    muscleGroups: ['Chest', 'Triceps'],
  },
  {
    id: 'ex2',
    name: 'Barbell Squat',
    equipment: 'BARBELL',
    muscleGroups: ['Quadriceps', 'Glutes'],
  },
  {
    id: 'ex3',
    name: 'Deadlift',
    equipment: 'BARBELL',
    muscleGroups: ['Back', 'Hamstrings'],
  },
  {
    id: 'ex4',
    name: 'Pull-up',
    equipment: 'BODYWEIGHT',
    muscleGroups: ['Back', 'Biceps'],
  },
  {
    id: 'ex5',
    name: 'Dumbbell Shoulder Press',
    equipment: 'DUMBBELL',
    muscleGroups: ['Shoulders', 'Triceps'],
  },
]

export function ExercisesSetup({
  weeks,
  activeWeek,
  setActiveWeek,
  activeDay,
  setActiveDay,
  updateWeeks,
}: ExercisesSetupProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null)
  const [exerciseFormOpen, setExerciseFormOpen] = useState(false)
  const [editingExerciseIndex, setEditingExerciseIndex] = useState<
    number | null
  >(null)
  const [newExercise, setNewExercise] = useState({
    name: '',
    sets: [
      { id: `set-${Date.now()}-1`, order: 1, reps: 10, weight: 0 },
      { id: `set-${Date.now()}-2`, order: 2, reps: 10, weight: 0 },
      { id: `set-${Date.now()}-3`, order: 3, reps: 10, weight: 0 },
    ],
    restSeconds: 60,
    tempo: '',
    instructions: '',
  })

  const filteredExercises = mockBaseExercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getCurrentDay = () => {
    return weeks[activeWeek].days.find((day) => day.dayOfWeek === activeDay)
  }

  const addSet = () => {
    const nextorder = newExercise.sets.length + 1
    setNewExercise({
      ...newExercise,
      sets: [
        ...newExercise.sets,
        {
          id: `set-${Date.now()}-${nextorder}`,
          order: nextorder,
          reps: newExercise.sets[0]?.reps || 10,
          weight: newExercise.sets[0]?.weight || 0,
        },
      ],
    })
  }

  const removeSet = (setIndex: number) => {
    if (newExercise.sets.length <= 1) return // Don't remove the last set

    const newSets = newExercise.sets.filter((_, index) => index !== setIndex)
    // Renumber the sets
    newSets.forEach((set, index) => {
      set.order = index + 1
    })

    setNewExercise({
      ...newExercise,
      sets: newSets,
    })
  }

  const updateSet = (
    setIndex: number,
    field: 'reps' | 'weight',
    value: number,
  ) => {
    const newSets = [...newExercise.sets]
    newSets[setIndex] = {
      ...newSets[setIndex],
      [field]: value,
    }
    setNewExercise({
      ...newExercise,
      sets: newSets,
    })
  }

  const resetExerciseForm = () => {
    setSelectedExercise(null)
    setNewExercise({
      name: '',
      sets: [
        { id: `set-${Date.now()}-1`, order: 1, reps: 10, weight: 0 },
        { id: `set-${Date.now()}-2`, order: 2, reps: 10, weight: 0 },
        { id: `set-${Date.now()}-3`, order: 3, reps: 10, weight: 0 },
      ],
      restSeconds: 60,
      tempo: '',
      instructions: '',
    })
    setEditingExerciseIndex(null)
  }

  const openExerciseForm = (exerciseIndex?: number) => {
    if (exerciseIndex !== undefined) {
      // Editing existing exercise
      const currentDay = getCurrentDay()
      if (!currentDay) return

      const exercise = currentDay.exercises[exerciseIndex]
      setEditingExerciseIndex(exerciseIndex)
      setSelectedExercise(exercise.id || null)
      setNewExercise({
        name: exercise.name,
        sets: exercise.sets,
        restSeconds: exercise.restSeconds || 60,
        tempo: exercise.tempo || '',
        instructions: exercise.instructions || '',
      })
    } else {
      // Adding new exercise
      resetExerciseForm()
    }

    setExerciseFormOpen(true)
  }

  const saveExercise = () => {
    const currentDay = getCurrentDay()
    if (!currentDay || currentDay.isRestDay) return

    const baseExercise = selectedExercise
      ? mockBaseExercises.find((ex) => ex.id === selectedExercise)
      : null

    const exerciseData = {
      id:
        editingExerciseIndex !== null
          ? currentDay.exercises[editingExerciseIndex].id
          : `exercise-${Date.now()}`,
      baseId: baseExercise?.id,
      name: baseExercise?.name || newExercise.name,
      sets: newExercise.sets,
      restSeconds: newExercise.restSeconds,
      tempo: newExercise.tempo || undefined,
      instructions: newExercise.instructions || undefined,
      order:
        editingExerciseIndex !== null
          ? currentDay.exercises[editingExerciseIndex].order
          : currentDay.exercises.length,
    }

    const newWeeks = [...weeks]
    const dayIndex = newWeeks[activeWeek].days.findIndex(
      (day) => day.dayOfWeek === activeDay,
    )

    if (editingExerciseIndex !== null) {
      // Update existing exercise
      newWeeks[activeWeek].days[dayIndex].exercises[editingExerciseIndex] =
        exerciseData
    } else {
      // Add new exercise
      newWeeks[activeWeek].days[dayIndex].exercises.push(exerciseData)
    }

    updateWeeks(newWeeks)
    setExerciseFormOpen(false)
    resetExerciseForm()
  }

  const removeExercise = (exerciseIndex: number) => {
    const newWeeks = [...weeks]
    const dayIndex = newWeeks[activeWeek].days.findIndex(
      (day) => day.dayOfWeek === activeDay,
    )
    newWeeks[activeWeek].days[dayIndex].exercises.splice(exerciseIndex, 1)

    // Update order for remaining exercises
    newWeeks[activeWeek].days[dayIndex].exercises.forEach((ex, idx) => {
      ex.order = idx
    })

    updateWeeks(newWeeks)
  }

  const moveExercise = (exerciseIndex: number, direction: 'up' | 'down') => {
    const newWeeks = [...weeks]
    const dayIndex = newWeeks[activeWeek].days.findIndex(
      (day) => day.dayOfWeek === activeDay,
    )
    const exercises = newWeeks[activeWeek].days[dayIndex].exercises

    if (
      (direction === 'up' && exerciseIndex === 0) ||
      (direction === 'down' && exerciseIndex === exercises.length - 1)
    ) {
      return
    }

    const newIndex = direction === 'up' ? exerciseIndex - 1 : exerciseIndex + 1
    const temp = exercises[exerciseIndex]
    exercises[exerciseIndex] = exercises[newIndex]
    exercises[newIndex] = temp

    // Update order
    exercises.forEach((ex, idx) => {
      ex.order = idx
    })

    updateWeeks(newWeeks)
  }

  const currentDay = getCurrentDay()
  const days = weeks[activeWeek].days

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <RadioGroupTabs
          title="Select Week"
          items={weeks.map((week, index) => ({
            id: `exercise-week-${index}`,
            value: index.toString(),
            label: `Week ${index + 1}`,
          }))}
          onValueChange={(value) => setActiveWeek(Number.parseInt(value))}
          value={activeWeek.toString()}
        />

        <RadioGroupTabs
          title="Select Day"
          items={days.map((day) => ({
            id: `exercise-day-${day.id}`,
            value: day.dayOfWeek.toString(),
            label: dayNames[day.dayOfWeek],
            disabled: day.isRestDay,
          }))}
          onValueChange={(value) => setActiveDay(Number.parseInt(value))}
          value={activeDay.toString()}
        />
      </div>

      {currentDay && !currentDay.isRestDay ? (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {dayNames[currentDay.dayOfWeek]} -{' '}
              {currentDay.workoutType || 'Workout'}
            </h3>
            <Dialog
              open={exerciseFormOpen}
              onOpenChange={(open) => {
                if (!open) resetExerciseForm()
                setExerciseFormOpen(open)
              }}
            >
              <DialogTrigger asChild>
                <Button onClick={() => openExerciseForm()}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Exercise
                </Button>
              </DialogTrigger>
              <DialogContent
                dialogTitle="Add Exercise"
                className="sm:max-w-[600px]"
              >
                <DialogHeader>
                  <DialogTitle>
                    {editingExerciseIndex !== null
                      ? 'Edit Exercise'
                      : 'Add Exercise'}
                  </DialogTitle>
                  <DialogDescription>
                    {editingExerciseIndex !== null
                      ? 'Edit the exercise details and sets.'
                      : 'Search for an existing exercise or create a custom one.'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {editingExerciseIndex === null && (
                    <>
                      <div className="relative">
                        <Input
                          id="exercise-search"
                          iconStart={<Search />}
                          placeholder="Search exercises..."
                          className="pl-8"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>

                      <div className="max-h-[200px] overflow-y-auto border rounded-md">
                        {filteredExercises.length > 0 ? (
                          filteredExercises.map((exercise) => (
                            <div
                              key={exercise.id}
                              className={`p-2 flex justify-between cursor-pointer hover:bg-accent ${
                                selectedExercise === exercise.id
                                  ? 'bg-accent'
                                  : ''
                              }`}
                              onClick={() => {
                                if (selectedExercise === exercise.id) {
                                  setSelectedExercise(null)
                                } else {
                                  setSelectedExercise(exercise.id)
                                  setNewExercise({
                                    ...newExercise,
                                    name: exercise.name,
                                  })
                                }
                              }}
                            >
                              <div>
                                <div className="font-medium">
                                  {exercise.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {exercise.equipment} •{' '}
                                  {exercise.muscleGroups.join(', ')}
                                </div>
                              </div>
                              {selectedExercise === exercise.id && (
                                <Button
                                  size="xs"
                                  iconOnly={<Check />}
                                  variant="ghost"
                                  className="text-xs text-muted-foreground"
                                ></Button>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-muted-foreground">
                            No exercises found. Create a custom one below.
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {!selectedExercise && editingExerciseIndex === null && (
                    <div className="space-y-2">
                      <Label htmlFor="exercise-name">
                        Custom Exercise Name
                      </Label>
                      <Input
                        id="exercise-name"
                        value={newExercise.name}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g., Single-Arm Dumbbell Row"
                      />
                    </div>
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label>Sets</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addSet}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Set
                      </Button>
                    </div>

                    <div className="space-y-2">
                      {newExercise.sets.map((set, index) => (
                        <div key={set.id} className="flex items-center gap-2">
                          <div className="font-medium w-16">
                            Set {set.order}
                          </div>
                          <div className="flex-1 flex items-center gap-2">
                            <div className="flex-1">
                              <Label
                                htmlFor={`reps-${set.id}`}
                                className="text-xs"
                              >
                                Reps
                              </Label>
                              <Input
                                id={`reps-${set.id}`}
                                type="number"
                                min="1"
                                value={set.reps}
                                onChange={(e) =>
                                  updateSet(
                                    index,
                                    'reps',
                                    Number.parseInt(e.target.value),
                                  )
                                }
                              />
                            </div>
                            <div className="flex-1">
                              <Label
                                htmlFor={`weight-${set.id}`}
                                className="text-xs"
                              >
                                Weight
                              </Label>
                              <Input
                                id={`weight-${set.id}`}
                                type="number"
                                min="0"
                                step="2.5"
                                value={set.weight || 0}
                                onChange={(e) =>
                                  updateSet(
                                    index,
                                    'weight',
                                    Number.parseFloat(e.target.value),
                                  )
                                }
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeSet(index)}
                            disabled={newExercise.sets.length <= 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="rest">Rest (seconds)</Label>
                      <Input
                        id="rest"
                        type="number"
                        min="0"
                        step="5"
                        value={newExercise.restSeconds}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            restSeconds: Number.parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tempo">Tempo (optional)</Label>
                      <Input
                        id="tempo"
                        placeholder="e.g., 3-1-3"
                        value={newExercise.tempo}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            tempo: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">
                      Instructions (optional)
                    </Label>
                    <Textarea
                      id="instructions"
                      placeholder="Add any specific instructions for this exercise"
                      value={newExercise.instructions}
                      onChange={(e) =>
                        setNewExercise({
                          ...newExercise,
                          instructions: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    onClick={saveExercise}
                    disabled={
                      (selectedExercise === null && newExercise.name === '') ||
                      newExercise.sets.length === 0
                    }
                  >
                    {editingExerciseIndex !== null
                      ? 'Update Exercise'
                      : 'Add Exercise'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {currentDay.exercises.length > 0 ? (
            <div className="space-y-2">
              {currentDay.exercises.map((exercise, index) => (
                <Card key={exercise.id} className="relative">
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col space-y-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveExercise(index, 'up')}
                      disabled={index === 0}
                    >
                      <GripVertical className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardHeader className="pb-2 pl-10">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-base">
                        {exercise.name}
                      </CardTitle>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openExerciseForm(index)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExercise(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pl-10">
                    <div className="space-y-2">
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {exercise.sets.map((set) => (
                          <div key={set.id} className="border rounded p-1.5">
                            <div className="font-medium">Set {set.order}</div>
                            <div className="text-xs text-muted-foreground">
                              {set.reps} reps{' '}
                              {set.weight ? `@ ${set.weight}kg` : ''}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {exercise.restSeconds && (
                          <Badge>
                            <TimerIcon /> {exercise.restSeconds}s rest
                          </Badge>
                        )}
                        {exercise.tempo && (
                          <Badge>
                            <GaugeIcon /> Tempo: {exercise.tempo}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {exercise.instructions && (
                      <div className="mt-2 text-sm text-foreground bg-muted p-2 rounded-md">
                        {exercise.instructions}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border rounded-lg">
              <div className="text-muted-foreground">
                No exercises added yet
              </div>
              <Button
                variant="outline"
                className="mt-4 mx-auto"
                onClick={() => openExerciseForm()}
                iconStart={<Plus />}
              >
                Add Your First Exercise
              </Button>
            </div>
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
    </div>
  )
}
