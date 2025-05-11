'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import type { TrainingPlanFormData } from './components/create-training-plan-form'

export async function createTrainingPlan(data: TrainingPlanFormData) {
  // In a real application, you would save this data to your database
  // using Prisma or another ORM based on your schema

  console.log('Creating training plan:', data)

  // Simulate a delay for the API call
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Revalidate the trainings page to show the new plan
  revalidatePath('/trainings')

  // Redirect to the trainings page
  redirect('/trainings')
}
