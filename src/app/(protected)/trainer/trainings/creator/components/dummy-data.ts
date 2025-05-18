import { GQLWorkoutType } from '@/generated/graphql-client'

import { TrainingPlanFormData } from './types'

export const fullBodyTrainingPlan: TrainingPlanFormData = {
  details: {
    title: '4-Week Full Body Strength Program',
    description:
      'A balanced full-body workout program focusing on compound movements and progressive overload. Perfect for intermediate lifters looking to build strength and muscle mass.',
    isPublic: true,
    isTemplate: true,
  },
  weeks: [
    {
      weekNumber: 1,
      name: 'Week 1 - Foundation',
      description:
        'Focus on proper form and establishing baseline weights. Use moderate weights to prepare the body for progressive overload.',
      days: [
        {
          dayOfWeek: 0, // Sunday
          isRestDay: true,
          exercises: [],
        },
        {
          dayOfWeek: 1, // Monday
          isRestDay: false,
          workoutType: GQLWorkoutType.FullBody,
          exercises: [
            {
              name: 'Barbell Squat',
              sets: [
                { order: 1, reps: 8, weight: 60 },
                { order: 2, reps: 8, weight: 60 },
                { order: 3, reps: 8, weight: 60 },
              ],
              restSeconds: 120,
              tempo: '3-0-1-0',
              instructions: 'Keep chest up, core tight, and push through heels',
              order: 1,
            },
            {
              name: 'Bench Press',
              sets: [
                { order: 1, reps: 8, weight: 50 },
                { order: 2, reps: 8, weight: 50 },
                { order: 3, reps: 8, weight: 50 },
              ],
              restSeconds: 120,
              tempo: '2-0-1-0',
              instructions: 'Keep shoulders retracted and feet planted',
              order: 2,
            },
            {
              name: 'Bent Over Row',
              sets: [
                { order: 1, reps: 10, weight: 40 },
                { order: 2, reps: 10, weight: 40 },
                { order: 3, reps: 10, weight: 40 },
              ],
              restSeconds: 90,
              tempo: '2-0-1-0',
              instructions: 'Maintain neutral spine, pull elbows back',
              order: 3,
            },
            {
              name: 'Overhead Press',
              sets: [
                { order: 1, reps: 8, weight: 30 },
                { order: 2, reps: 8, weight: 30 },
                { order: 3, reps: 8, weight: 30 },
              ],
              restSeconds: 90,
              tempo: '2-0-1-0',
              instructions: 'Keep core tight, press directly overhead',
              order: 4,
            },
            {
              name: 'Romanian Deadlift',
              sets: [
                { order: 1, reps: 10, weight: 50 },
                { order: 2, reps: 10, weight: 50 },
                { order: 3, reps: 10, weight: 50 },
              ],
              restSeconds: 120,
              tempo: '3-0-1-0',
              instructions: 'Keep back straight, push hips back',
              order: 5,
            },
          ],
        },
        {
          dayOfWeek: 2, // Tuesday
          isRestDay: true,
          exercises: [],
        },
        {
          dayOfWeek: 3, // Wednesday
          isRestDay: false,
          workoutType: GQLWorkoutType.FullBody,
          exercises: [
            // Similar structure to Monday but with slightly different exercises
            {
              name: 'Front Squat',
              sets: [
                { order: 1, reps: 8, weight: 50 },
                { order: 2, reps: 8, weight: 50 },
                { order: 3, reps: 8, weight: 50 },
              ],
              restSeconds: 120,
              tempo: '3-0-1-0',
              instructions: 'Keep elbows high, core tight',
              order: 1,
            },
            {
              name: 'Incline Bench Press',
              sets: [
                { order: 1, reps: 8, weight: 40 },
                { order: 2, reps: 8, weight: 40 },
                { order: 3, reps: 8, weight: 40 },
              ],
              restSeconds: 120,
              tempo: '2-0-1-0',
              instructions: '30-45 degree incline, focus on upper chest',
              order: 2,
            },
            {
              name: 'Pull-ups',
              sets: [
                { order: 1, reps: 8, weight: 0 },
                { order: 2, reps: 8, weight: 0 },
                { order: 3, reps: 8, weight: 0 },
              ],
              restSeconds: 90,
              tempo: '2-0-1-0',
              instructions:
                'Use assistance if needed, focus on full range of motion',
              order: 3,
            },
            {
              name: 'Dumbbell Shoulder Press',
              sets: [
                { order: 1, reps: 10, weight: 20 },
                { order: 2, reps: 10, weight: 20 },
                { order: 3, reps: 10, weight: 20 },
              ],
              restSeconds: 90,
              tempo: '2-0-1-0',
              instructions: 'Keep core tight, press directly overhead',
              order: 4,
            },
            {
              name: 'Bulgarian Split Squat',
              sets: [
                { order: 1, reps: 10, weight: 20 },
                { order: 2, reps: 10, weight: 20 },
                { order: 3, reps: 10, weight: 20 },
              ],
              restSeconds: 90,
              tempo: '2-0-1-0',
              instructions: 'Keep front knee stable, focus on balance',
              order: 5,
            },
          ],
        },
        {
          dayOfWeek: 4, // Thursday
          isRestDay: true,
          exercises: [],
        },
        {
          dayOfWeek: 5, // Friday
          isRestDay: false,
          workoutType: GQLWorkoutType.FullBody,
          exercises: [
            // Similar structure to Monday but with different variations
            {
              name: 'Deadlift',
              sets: [
                { order: 1, reps: 6, weight: 80 },
                { order: 2, reps: 6, weight: 80 },
                { order: 3, reps: 6, weight: 80 },
              ],
              restSeconds: 180,
              tempo: '2-0-1-0',
              instructions: 'Keep back straight, drive through heels',
              order: 1,
            },
            {
              name: 'Push-ups',
              sets: [
                { order: 1, reps: 12, weight: 0 },
                { order: 2, reps: 12, weight: 0 },
                { order: 3, reps: 12, weight: 0 },
              ],
              restSeconds: 90,
              tempo: '2-0-1-0',
              instructions: 'Full range of motion, keep body straight',
              order: 2,
            },
            {
              name: 'Lat Pulldown',
              sets: [
                { order: 1, reps: 12, weight: 50 },
                { order: 2, reps: 12, weight: 50 },
                { order: 3, reps: 12, weight: 50 },
              ],
              restSeconds: 90,
              tempo: '2-0-1-0',
              instructions: 'Pull to chest, squeeze shoulder blades',
              order: 3,
            },
            {
              name: 'Lateral Raises',
              sets: [
                { order: 1, reps: 12, weight: 10 },
                { order: 2, reps: 12, weight: 10 },
                { order: 3, reps: 12, weight: 10 },
              ],
              restSeconds: 60,
              tempo: '2-0-1-0',
              instructions:
                'Keep slight bend in elbows, raise to shoulder height',
              order: 4,
            },
            {
              name: 'Plank',
              sets: [
                { order: 1, reps: 1, weight: 0 },
                { order: 2, reps: 1, weight: 0 },
                { order: 3, reps: 1, weight: 0 },
              ],
              restSeconds: 60,
              tempo: '0-30-0-0',
              instructions: 'Hold for 30 seconds, keep body straight',
              order: 5,
            },
          ],
        },
        {
          dayOfWeek: 6, // Saturday
          isRestDay: true,
          exercises: [],
        },
      ],
    },
    // Weeks 2-4 would follow similar structure with progressive overload
    // Week 2: Increase weights by 5-10%
    // Week 3: Increase weights by another 5-10%
    // Week 4: Deload week with 60% of Week 3 weights
  ],
}
