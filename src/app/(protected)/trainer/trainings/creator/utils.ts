import { dayNames } from '../creator-old/components/utils'

export interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string
}

export interface DayExercise {
  id: string
  exerciseId: string
  exerciseName: string
  type: string
}

export interface Day {
  id: string
  name: string
  isRestDay: boolean
  exercises: DayExercise[]
  selectedType: string
}

export interface Week {
  id: string
  name: string
  days: Day[]
}

export const initialExercises: Exercise[] = [
  { id: 'ex1', name: 'Exercise A', muscleGroup: 'chest', equipment: 'barbell' },
  { id: 'ex2', name: 'Exercise B', muscleGroup: 'back', equipment: 'dumbbell' },
  {
    id: 'ex3',
    name: 'Push-ups',
    muscleGroup: 'chest',
    equipment: 'bodyweight',
  },
  { id: 'ex4', name: 'Pull-ups', muscleGroup: 'back', equipment: 'bodyweight' },
]

export const createInitialWeek = (weekNumber: number): Week => ({
  id: `week-${weekNumber}`,
  name: `Week ${weekNumber}`,
  days: dayNames.map((dayName, index) => ({
    id: `week-${weekNumber}-day-${index}`,
    name: dayName,
    isRestDay: [2, 4, 6].includes(index), // Wednesday, Friday, Sunday as rest days initially
    exercises: [],
    selectedType: 'strength',
  })),
})
