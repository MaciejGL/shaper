export interface ClientSurveyData {
  // Current Fitness Level & Activity
  exerciseFrequency: string
  exerciseTypes: string[]
  otherExerciseType?: string
  trainingDuration: string
  currentFitnessLevel: string

  // Fitness Goals
  primaryGoal: string
  otherPrimaryGoal?: string
  secondaryGoal: string
  otherSecondaryGoal?: string
  hasDeadline: boolean
  deadline?: string

  // Training Preferences & Motivation
  motivationLevel: number
  preferredDuration: string
  preferredLocation: string
  lovedExercises: string
  hatedExercises: string
  hasInjuries: boolean
  injuries?: string

  // Nutrition & Lifestyle
  cuisineTypes: string[]
  otherCuisine?: string
  hasAllergies: boolean
  allergies?: string
  dietQuality: string
  tracksNutrition: string
  supplements: string[]
  otherSupplement?: string

  // Recovery & Sleep
  sleepHours: string
  hasSleepIssues: boolean

  // Blood Tests
  hasRecentBloodTests: boolean

  // Challenges & Feedback
  biggestChallenge: string
  otherChallenge?: string
  additionalInfo: string
}

export const INITIAL_SURVEY_DATA: ClientSurveyData = {
  exerciseFrequency: '',
  exerciseTypes: [],
  trainingDuration: '',
  currentFitnessLevel: '',
  primaryGoal: '',
  secondaryGoal: '',
  hasDeadline: false,
  motivationLevel: 5,
  preferredDuration: '',
  preferredLocation: '',
  lovedExercises: '',
  hatedExercises: '',
  hasInjuries: false,
  cuisineTypes: [],
  hasAllergies: false,
  dietQuality: '',
  tracksNutrition: '',
  supplements: [],
  sleepHours: '',
  hasSleepIssues: false,
  hasRecentBloodTests: false,
  biggestChallenge: '',
  additionalInfo: '',
}
