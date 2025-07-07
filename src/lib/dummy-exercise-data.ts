// Dummy data for testing exercise progress over 6 months
// This simulates realistic strength progression for Bench Press

interface DummyExerciseProgress {
  baseExercise: {
    id: string
    name: string
    muscleGroups: {
      name: string
      alias?: string | null
      groupSlug: string
      category: {
        name: string
      }
    }[]
  }
  estimated1RMProgress: {
    date: string
    average1RM: number
  }[]
  totalVolumeProgress: {
    week: string
    totalVolume: number
  }[]
  totalSets: number
}

// Generate realistic progression over 6 months (26 weeks)
function generateProgressionData(): DummyExerciseProgress {
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 6) // 6 months ago

  const startWeight = 80 // Starting 1RM in kg
  const progressionRate = 0.02 // 2% improvement per month on average
  const variability = 0.05 // 5% random variation

  const estimated1RMProgress = []
  const totalVolumeProgress = []

  for (let week = 0; week < 26; week++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + week * 7)

    // Calculate progressive 1RM with some realistic variation
    const monthProgress = (week / 4) * progressionRate // Monthly progression
    const baseIncrease = startWeight * monthProgress
    const randomVariation =
      (Math.random() - 0.5) * 2 * startWeight * variability

    // Add some plateaus and small dips for realism
    let plateauFactor = 1
    if (week >= 8 && week <= 10) plateauFactor = 0.98 // Small plateau around week 8-10
    if (week >= 18 && week <= 19) plateauFactor = 0.96 // Slight dip around week 18-19

    const current1RM =
      Math.round(
        (startWeight + baseIncrease + randomVariation) * plateauFactor * 10,
      ) / 10

    estimated1RMProgress.push({
      date: currentDate.toISOString().split('T')[0],
      average1RM: Math.max(current1RM, startWeight * 0.9), // Ensure no huge drops
    })

    // Calculate corresponding volume (sets × reps × weight)
    // Assume training at 75-85% of 1RM for 3-5 sets of 5-8 reps
    const trainingWeight = current1RM * (0.75 + Math.random() * 0.1)
    const sets = 3 + Math.floor(Math.random() * 3) // 3-5 sets
    const reps = 5 + Math.floor(Math.random() * 4) // 5-8 reps
    const weeklyVolume = Math.round(trainingWeight * sets * reps * 2) // 2 sessions per week

    totalVolumeProgress.push({
      week: currentDate.toISOString().split('T')[0],
      totalVolume: weeklyVolume,
    })
  }

  return {
    baseExercise: {
      id: 'dummy-bench-press',
      name: 'Bench Press',
      muscleGroups: [
        {
          name: 'Chest',
          alias: 'Chest',
          groupSlug: 'chest',
          category: {
            name: 'Upper Body',
          },
        },
        {
          name: 'Shoulders',
          alias: 'Shoulders',
          groupSlug: 'shoulders',
          category: {
            name: 'Upper Body',
          },
        },
        {
          name: 'Triceps',
          alias: 'Triceps',
          groupSlug: 'triceps',
          category: {
            name: 'Upper Body',
          },
        },
      ],
    },
    estimated1RMProgress,
    totalVolumeProgress,
    totalSets: estimated1RMProgress.length * 4, // Average 4 sets per session
  }
}

// Generate additional exercises for variety
function generateSquatData(): DummyExerciseProgress {
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 6)

  const startWeight = 100 // Starting 1RM in kg
  const progressionRate = 0.025 // Slightly higher progression for squats

  const estimated1RMProgress = []
  const totalVolumeProgress = []

  for (let week = 0; week < 26; week++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + week * 7)

    const monthProgress = (week / 4) * progressionRate
    const baseIncrease = startWeight * monthProgress
    const randomVariation = (Math.random() - 0.5) * 2 * startWeight * 0.04

    let plateauFactor = 1
    if (week >= 12 && week <= 14) plateauFactor = 0.97

    const current1RM =
      Math.round(
        (startWeight + baseIncrease + randomVariation) * plateauFactor * 10,
      ) / 10

    estimated1RMProgress.push({
      date: currentDate.toISOString().split('T')[0],
      average1RM: Math.max(current1RM, startWeight * 0.9),
    })

    const trainingWeight = current1RM * (0.7 + Math.random() * 0.15)
    const sets = 3 + Math.floor(Math.random() * 3)
    const reps = 4 + Math.floor(Math.random() * 4)
    const weeklyVolume = Math.round(trainingWeight * sets * reps * 2)

    totalVolumeProgress.push({
      week: currentDate.toISOString().split('T')[0],
      totalVolume: weeklyVolume,
    })
  }

  return {
    baseExercise: {
      id: 'dummy-squat',
      name: 'Back Squat',
      muscleGroups: [
        {
          name: 'Quadriceps',
          alias: 'Quads',
          groupSlug: 'quadriceps',
          category: {
            name: 'Lower Body',
          },
        },
        {
          name: 'Glutes',
          alias: 'Glutes',
          groupSlug: 'glutes',
          category: {
            name: 'Lower Body',
          },
        },
        {
          name: 'Hamstrings',
          alias: 'Hams',
          groupSlug: 'hamstrings',
          category: {
            name: 'Lower Body',
          },
        },
      ],
    },
    estimated1RMProgress,
    totalVolumeProgress,
    totalSets: estimated1RMProgress.length * 4,
  }
}

function generateDeadliftData(): DummyExerciseProgress {
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - 6)

  const startWeight = 120 // Starting 1RM in kg
  const progressionRate = 0.03 // Higher progression for deadlifts

  const estimated1RMProgress = []
  const totalVolumeProgress = []

  for (let week = 0; week < 26; week++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + week * 7)

    const monthProgress = (week / 4) * progressionRate
    const baseIncrease = startWeight * monthProgress
    const randomVariation = (Math.random() - 0.5) * 2 * startWeight * 0.03

    let plateauFactor = 1
    if (week >= 15 && week <= 17) plateauFactor = 0.98

    const current1RM =
      Math.round(
        (startWeight + baseIncrease + randomVariation) * plateauFactor * 10,
      ) / 10

    estimated1RMProgress.push({
      date: currentDate.toISOString().split('T')[0],
      average1RM: Math.max(current1RM, startWeight * 0.92),
    })

    const trainingWeight = current1RM * (0.7 + Math.random() * 0.15)
    const sets = 2 + Math.floor(Math.random() * 3) // Deadlifts typically fewer sets
    const reps = 3 + Math.floor(Math.random() * 4)
    const weeklyVolume = Math.round(trainingWeight * sets * reps * 1.5) // Less frequent training

    totalVolumeProgress.push({
      week: currentDate.toISOString().split('T')[0],
      totalVolume: weeklyVolume,
    })
  }

  return {
    baseExercise: {
      id: 'dummy-deadlift',
      name: 'Deadlift',
      muscleGroups: [
        {
          name: 'Hamstrings',
          alias: 'Hams',
          groupSlug: 'hamstrings',
          category: {
            name: 'Lower Body',
          },
        },
        {
          name: 'Glutes',
          alias: 'Glutes',
          groupSlug: 'glutes',
          category: {
            name: 'Lower Body',
          },
        },
        {
          name: 'Back',
          alias: 'Back',
          groupSlug: 'back',
          category: {
            name: 'Upper Body',
          },
        },
      ],
    },
    estimated1RMProgress,
    totalVolumeProgress,
    totalSets: estimated1RMProgress.length * 3,
  }
}

// Export the dummy data
export const dummyExerciseProgressData = [
  generateProgressionData(), // Bench Press
  generateSquatData(), // Back Squat
  generateDeadliftData(), // Deadlift
]

// Export individual exercises for targeted testing
export const dummyBenchPress = generateProgressionData()
export const dummySquat = generateSquatData()
export const dummyDeadlift = generateDeadliftData()

// Helper function to format data for GraphQL query mock
export function formatForGraphQLMock() {
  return {
    exercisesProgressByUser: dummyExerciseProgressData,
  }
}
