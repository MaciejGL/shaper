export type WorkoutType =
  | 'fullbody'
  | 'push-pull-legs'
  | 'upper-lower'
  | 'split'
export type WorkoutSubType =
  | 'push'
  | 'pull'
  | 'legs'
  | 'upper'
  | 'lower'
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'arms'

export interface WorkoutTypeOption {
  id: WorkoutType
  label: string
  description: string
  hasSubTypes: boolean
  subTypes?: WorkoutSubTypeOption[]
}

export interface WorkoutSubTypeOption {
  id: WorkoutSubType
  label: string
  muscleGroups: string[]
}

export const WORKOUT_TYPE_OPTIONS: WorkoutTypeOption[] = [
  {
    id: 'fullbody',
    label: 'Full Body',
    description: 'Balanced workout targeting all major muscle groups',
    hasSubTypes: false,
  },
  {
    id: 'push-pull-legs',
    label: 'Push/Pull/Legs',
    description: 'Split by movement patterns',
    hasSubTypes: true,
    subTypes: [
      {
        id: 'push',
        label: 'Push',
        muscleGroups: ['Chest', 'Shoulders', 'Triceps'],
      },
      {
        id: 'pull',
        label: 'Pull',
        muscleGroups: ['Lats', 'Upper Back', 'Traps', 'Biceps'],
      },
      {
        id: 'legs',
        label: 'Legs',
        muscleGroups: [
          'Quads',
          'Hamstrings',
          'Glutes',
          'Calves',
          'Inner Thighs',
        ],
      },
    ],
  },
  {
    id: 'upper-lower',
    label: 'Upper/Lower Split',
    description: 'Divide by body regions',
    hasSubTypes: true,
    subTypes: [
      {
        id: 'upper',
        label: 'Upper Body',
        muscleGroups: [
          'Chest',
          'Lats',
          'Upper Back',
          'Traps',
          'Shoulders',
          'Biceps',
          'Triceps',
          'Forearms',
          'Abs',
          'Obliques',
          'LowerBack',
        ],
      },
      {
        id: 'lower',
        label: 'Lower Body',
        muscleGroups: [
          'Quads',
          'Hamstrings',
          'Glutes',
          'Calves',
          'Inner Thighs',
        ],
      },
    ],
  },
  {
    id: 'split',
    label: 'Body Part Split',
    description: 'Focus on 1-2 muscle groups per session',
    hasSubTypes: true,
    subTypes: [
      {
        id: 'chest',
        label: 'Chest & Triceps',
        muscleGroups: ['Chest', 'Triceps'],
      },
      {
        id: 'back',
        label: 'Back & Biceps',
        muscleGroups: ['Lats', 'Upper Back', 'Traps', 'Biceps'],
      },
      {
        id: 'legs',
        label: 'Legs',
        muscleGroups: [
          'Quads',
          'Hamstrings',
          'Glutes',
          'Calves',
          'Inner Thighs',
        ],
      },
      {
        id: 'shoulders',
        label: 'Shoulders & Abs',
        muscleGroups: ['Shoulders', 'Abs', 'Obliques'],
      },
      {
        id: 'arms',
        label: 'Arms',
        muscleGroups: ['Biceps', 'Triceps', 'Forearms'],
      },
    ],
  },
]

// Helper to get muscle groups by workout sub-type
export function getMuscleGroupsForSubType(
  subType: WorkoutSubType | null,
): string[] {
  if (!subType) return []

  for (const workoutType of WORKOUT_TYPE_OPTIONS) {
    if (workoutType.subTypes) {
      const subTypeOption = workoutType.subTypes.find((st) => st.id === subType)
      if (subTypeOption) {
        return subTypeOption.muscleGroups
      }
    }
  }

  return []
}
