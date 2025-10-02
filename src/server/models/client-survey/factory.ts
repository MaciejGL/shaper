import { GraphQLError } from 'graphql'

import { GQLClientSurveyDataInput } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { UserWithSession } from '@/types/UserWithSession'
import { GQLContext } from '@/types/gql-context'

import ClientSurvey from './model'

/**
 * Get the current user's client survey
 */
export async function getMyClientSurvey({
  user,
  context,
}: {
  user: UserWithSession
  context: GQLContext
}): Promise<ClientSurvey | null> {
  const survey = await prisma.clientSurvey.findUnique({
    where: { userId: user.user.id },
  })

  if (!survey) {
    return null
  }

  return new ClientSurvey(survey, context)
}

/**
 * Get a client's survey (for trainers)
 * Accessible if:
 * 1. There's an active trainer-client relationship
 * 2. OR there's a pending coaching request from the client to this trainer
 */
export async function getClientSurveyForTrainee({
  traineeId,
  user,
  context,
}: {
  traineeId: string
  user: UserWithSession
  context: GQLContext
}): Promise<ClientSurvey | null> {
  // Verify trainee exists and check trainer relationship
  const trainee = await prisma.user.findUnique({
    where: { id: traineeId },
    select: { trainerId: true },
  })

  if (!trainee) {
    throw new GraphQLError('Client not found')
  }

  // Check if the current user is the trainee's active trainer
  const isActiveTrainer = trainee.trainerId === user.user.id

  // Check if there's a pending coaching request from this client
  const hasPendingRequest = await prisma.coachingRequest.findFirst({
    where: {
      senderId: traineeId,
      recipientId: user.user.id,
      status: 'PENDING',
    },
  })

  // User must be either the active trainer OR have a pending request
  if (!isActiveTrainer && !hasPendingRequest) {
    throw new GraphQLError(
      'You do not have permission to view this survey. You must be the active trainer for this client or have a pending coaching request.',
    )
  }

  const survey = await prisma.clientSurvey.findUnique({
    where: { userId: traineeId },
  })

  if (!survey) {
    return null
  }

  return new ClientSurvey(survey, context)
}

/**
 * Create or update client survey
 */
export async function upsertClientSurvey({
  data,
  user,
  context,
}: {
  data: GQLClientSurveyDataInput
  user: UserWithSession
  context: GQLContext
}): Promise<ClientSurvey> {
  try {
    // Convert the input data to a plain object for JSON storage
    const surveyData = {
      exerciseFrequency: data.exerciseFrequency || '',
      exerciseTypes: data.exerciseTypes || [],
      otherExerciseType: data.otherExerciseType || '',
      trainingDuration: data.trainingDuration || '',
      currentFitnessLevel: data.currentFitnessLevel || '',
      primaryGoal: data.primaryGoal || '',
      otherPrimaryGoal: data.otherPrimaryGoal || '',
      secondaryGoal: data.secondaryGoal || '',
      otherSecondaryGoal: data.otherSecondaryGoal || '',
      hasDeadline: data.hasDeadline || false,
      deadline: data.deadline || '',
      motivationLevel: data.motivationLevel || 5,
      preferredDuration: data.preferredDuration || '',
      preferredLocation: data.preferredLocation || '',
      lovedExercises: data.lovedExercises || '',
      hatedExercises: data.hatedExercises || '',
      hasInjuries: data.hasInjuries || false,
      injuries: data.injuries || '',
      cuisineTypes: data.cuisineTypes || [],
      otherCuisine: data.otherCuisine || '',
      hasAllergies: data.hasAllergies || false,
      allergies: data.allergies || '',
      dietQuality: data.dietQuality || '',
      tracksNutrition: data.tracksNutrition || '',
      supplements: data.supplements || [],
      otherSupplement: data.otherSupplement || '',
      sleepHours: data.sleepHours || '',
      hasSleepIssues: data.hasSleepIssues || false,
      hasRecentBloodTests: data.hasRecentBloodTests || false,
      biggestChallenge: data.biggestChallenge || '',
      otherChallenge: data.otherChallenge || '',
      additionalInfo: data.additionalInfo || '',
    }

    const survey = await prisma.clientSurvey.upsert({
      where: { userId: user.user.id },
      create: {
        userId: user.user.id,
        data: surveyData,
        version: 1,
      },
      update: {
        data: surveyData,
        // Don't increment version for now, could be added later for tracking major schema changes
      },
    })

    return new ClientSurvey(survey, context)
  } catch (error) {
    console.error('[CLIENT-SURVEY] Error upserting survey:', error)
    throw new GraphQLError(
      'Something went wrong while saving your survey. Please try again.',
    )
  }
}
