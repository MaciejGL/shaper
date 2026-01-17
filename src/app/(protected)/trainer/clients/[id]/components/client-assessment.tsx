'use client'

import { ClientSurveyData } from '@/components/client-survey/types'
import { useGetClientSurveyForTraineeQuery } from '@/generated/graphql-client'

interface ClientAssessmentProps {
  clientId: string
}

interface QuestionAnswer {
  question: string
  answer: string | string[]
  category?: string
}

export function ClientAssessment({ clientId }: ClientAssessmentProps) {
  const { data, isLoading } = useGetClientSurveyForTraineeQuery(
    { traineeId: clientId },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  )

  const survey = data?.getClientSurveyForTrainee?.data as
    | ClientSurveyData
    | undefined

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Fitness Assessment</h3>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!survey) {
    return (
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Fitness Assessment</h3>
        <p className="text-sm text-muted-foreground">
          Client hasn't completed the fitness assessment yet
        </p>
      </div>
    )
  }

  // Format survey data into Q&A format
  const questions: QuestionAnswer[] = [
    // Current Fitness Level & Activity
    {
      category: 'Current Fitness Level & Activity',
      question: 'How often do you exercise per week?',
      answer: survey.exerciseFrequency || 'Not specified',
    },
    {
      question: 'What type of exercise do you currently do?',
      answer: survey.exerciseTypes?.length
        ? survey.exerciseTypes
            .filter((type) => type !== 'exercise-other')
            .concat(survey.otherExerciseType ? [survey.otherExerciseType] : [])
        : 'Not specified',
    },
    {
      question: 'How long have you been training consistently?',
      answer: survey.trainingDuration || 'Not specified',
    },
    {
      question: 'Current fitness level',
      answer: survey.currentFitnessLevel || 'Not specified',
    },

    // Fitness Goals
    {
      category: 'Fitness Goals',
      question: 'Primary fitness goal',
      answer:
        survey.otherPrimaryGoal ||
        (survey.primaryGoal !== 'primary-goal-other'
          ? survey.primaryGoal
          : null) ||
        'Not specified',
    },
    {
      question: 'Secondary goal',
      answer:
        survey.otherSecondaryGoal ||
        (survey.secondaryGoal !== 'secondary-goal-other'
          ? survey.secondaryGoal
          : null) ||
        'Not specified',
    },
    ...(survey.hasDeadline && survey.deadline
      ? [
          {
            question: 'Specific deadline or event',
            answer: survey.deadline,
          },
        ]
      : []),

    // Training Preferences
    {
      category: 'Training Preferences & Motivation',
      question: 'Motivation level (1-10)',
      answer: String(survey.motivationLevel || 'Not specified'),
    },
    {
      question: 'Preferred workout duration',
      answer: survey.preferredDuration || 'Not specified',
    },
    {
      question: 'Preferred training location',
      answer: survey.preferredLocation || 'Not specified',
    },
    ...(survey.lovedExercises
      ? [{ question: 'Favorite exercises', answer: survey.lovedExercises }]
      : []),
    ...(survey.hatedExercises
      ? [
          {
            question: 'Exercises to avoid',
            answer: survey.hatedExercises,
          },
        ]
      : []),
    ...(survey.hasInjuries && survey.injuries
      ? [
          {
            question: 'Injuries or medical conditions',
            answer: survey.injuries,
          },
        ]
      : []),

    // Nutrition & Lifestyle
    {
      category: 'Nutrition & Lifestyle',
      question: 'Preferred cuisine types',
      answer: survey.cuisineTypes?.length
        ? survey.cuisineTypes
            .filter((type) => type !== 'cuisine-other')
            .concat(survey.otherCuisine ? [survey.otherCuisine] : [])
        : 'Not specified',
    },
    ...(survey.hasAllergies && survey.allergies
      ? [{ question: 'Food allergies/intolerances', answer: survey.allergies }]
      : []),
    {
      question: 'Diet quality',
      answer: survey.dietQuality || 'Not specified',
    },
    {
      question: 'Tracks nutrition',
      answer: survey.tracksNutrition
        ? survey.tracksNutrition === 'closely'
          ? 'Yes, closely'
          : survey.tracksNutrition === 'sometimes'
            ? 'Sometimes'
            : survey.tracksNutrition === 'never'
              ? 'No'
              : survey.tracksNutrition
        : 'Not specified',
    },
    {
      question: 'Current supplements',
      answer: survey.supplements?.length
        ? survey.supplements
            .filter((sup) => sup !== 'supplement-other')
            .concat(survey.otherSupplement ? [survey.otherSupplement] : [])
        : 'Not specified',
    },

    // Recovery & Sleep
    {
      category: 'Recovery & Sleep',
      question: 'Average sleep per night',
      answer: survey.sleepHours || 'Not specified',
    },
    {
      question: 'Sleep quality issues',
      answer: survey.hasSleepIssues ? 'Yes' : 'No',
    },
    ...(survey.hasSleepIssues && survey.sleepIssuesDetails
      ? [
          {
            question: 'Sleep issues details',
            answer: survey.sleepIssuesDetails,
          },
        ]
      : []),
    {
      question: 'Recent blood work for vitamins/minerals',
      answer: survey.hasRecentBloodTests ? 'Yes' : 'No',
    },

    // Challenges
    {
      category: 'Challenges',
      question: 'Biggest challenge',
      answer:
        survey.otherChallenge ||
        (survey.biggestChallenge !== 'challenge-other'
          ? survey.biggestChallenge
          : null) ||
        'Not specified',
    },
    ...(survey.additionalInfo
      ? [{ question: 'Additional information', answer: survey.additionalInfo }]
      : []),
  ]

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Fitness Assessment</h3>

      <div>
        {questions.map((qa, index) => (
          <div key={index} className="">
            {qa.category && (
              <h4 className="text-base font-semibold text-primary mb-3 mt-6">
                {qa.category}
              </h4>
            )}
            <div className="space-y-1 bg-card-on-card rounded-lg p-2 mt-2">
              <p className="text-sm font-medium">{qa.question}</p>
              <p className="text-sm text-muted-foreground">
                {Array.isArray(qa.answer) ? qa.answer.join(', ') : qa.answer}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
