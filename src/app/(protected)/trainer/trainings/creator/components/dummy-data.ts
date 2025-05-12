import { TrainingPlanFormData, WorkoutType } from './types'

export const fullBodyTrainingPlan: TrainingPlanFormData = {
  id: 'full-body-training-plan',
  details: {
    title: '4-Week Full Body Strength Program',
    description:
      'A balanced full-body workout program focusing on compound movements and progressive overload. Perfect for intermediate lifters looking to build strength and muscle mass.',
    isPublic: true,
    isTemplate: true,
  },
  weeks: [
    {
      id: 'week-1',
      weekNumber: 1,
      name: 'Week 1 - Foundation',
      description:
        'Focus on proper form and establishing baseline weights. Use moderate weights to prepare the body for progressive overload.',
      days: [
        {
          id: 'week-1-day-0',
          dayOfWeek: 0, // Sunday
          isRestDay: true,
          exercises: [],
        },
        {
          id: 'week-1-day-1',
          dayOfWeek: 1, // Monday
          isRestDay: false,
          workoutType: WorkoutType.FullBody,
          exercises: [
            {
              id: 'week-1-day-1-ex-1',
              name: 'Barbell Squat',
              sets: [
                { id: 'set-1', order: 1, reps: 8, weight: 60 },
                { id: 'set-2', order: 2, reps: 8, weight: 60 },
                { id: 'set-3', order: 3, reps: 8, weight: 60 },
              ],
              restSeconds: 120,
              tempo: '3-0-1-0',
              instructions: 'Keep chest up, core tight, and push through heels',
              order: 1,
            },
            {
              id: 'week-1-day-1-ex-2',
              name: 'Bench Press',
              sets: [
                { id: 'set-1', order: 1, reps: 8, weight: 50 },
                { id: 'set-2', order: 2, reps: 8, weight: 50 },
                { id: 'set-3', order: 3, reps: 8, weight: 50 },
              ],
              restSeconds: 120,
              tempo: '2-0-1-0',
              instructions: 'Keep shoulders retracted and feet planted',
              order: 2,
            },
            {
              id: 'week-1-day-1-ex-3',
              name: 'Bent Over Row',
              sets: [
                { id: 'set-1', order: 1, reps: 10, weight: 40 },
                { id: 'set-2', order: 2, reps: 10, weight: 40 },
                { id: 'set-3', order: 3, reps: 10, weight: 40 },
              ],
              restSeconds: 90,
              tempo: '2-0-1-0',
              instructions: 'Maintain neutral spine, pull elbows back',
              order: 3,
            },
            {
              id: 'week-1-day-1-ex-4',
              name: 'Overhead Press',
              sets: [
                { id: 'set-1', order: 1, reps: 8, weight: 30 },
                { id: 'set-2', order: 2, reps: 8, weight: 30 },
                { id: 'set-3', order: 3, reps: 8, weight: 30 },
              ],
              restSeconds: 90,
              tempo: '2-0-1-0',
              instructions: 'Keep core tight, press directly overhead',
              order: 4,
            },
            {
              id: 'week-1-day-1-ex-5',
              name: 'Romanian Deadlift',
              sets: [
                { id: 'set-1', order: 1, reps: 10, weight: 50 },
                { id: 'set-2', order: 2, reps: 10, weight: 50 },
                { id: 'set-3', order: 3, reps: 10, weight: 50 },
              ],
              restSeconds: 120,
              tempo: '3-0-1-0',
              instructions: 'Keep back straight, push hips back',
              order: 5,
            },
          ],
        },
        {
          id: 'week-1-day-2',
          dayOfWeek: 2, // Tuesday
          isRestDay: true,
          exercises: [],
        },
        {
          id: 'week-1-day-3',
          dayOfWeek: 3, // Wednesday
          isRestDay: false,
          workoutType: WorkoutType.FullBody,
          exercises: [
            // Similar structure to Monday but with slightly different exercises
            {
              id: 'week-1-day-3-ex-1',
              name: 'Front Squat',
              sets: [
                { id: 'set-1', order: 1, reps: 8, weight: 50 },
                { id: 'set-2', order: 2, reps: 8, weight: 50 },
                { id: 'set-3', order: 3, reps: 8, weight: 50 },
              ],
              restSeconds: 120,
              tempo: '3-0-1-0',
              instructions: 'Keep elbows high, core tight',
              order: 1,
            },
            {
              id: 'week-1-day-3-ex-2',
              name: 'Incline Bench Press',
              sets: [
                { id: 'set-1', order: 1, reps: 8, weight: 40 },
                { id: 'set-2', order: 2, reps: 8, weight: 40 },
                { id: 'set-3', order: 3, reps: 8, weight: 40 },
              ],
              restSeconds: 120,
              tempo: '2-0-1-0',
              instructions: '30-45 degree incline, focus on upper chest',
              order: 2,
            },
            {
              id: 'week-1-day-3-ex-3',
              name: 'Pull-ups',
              sets: [
                { id: 'set-1', order: 1, reps: 8, weight: 0 },
                { id: 'set-2', order: 2, reps: 8, weight: 0 },
                { id: 'set-3', order: 3, reps: 8, weight: 0 },
              ],
              restSeconds: 90,
              tempo: '2-0-1-0',
              instructions:
                'Use assistance if needed, focus on full range of motion',
              order: 3,
            },
            {
              id: 'week-1-day-3-ex-4',
              name: 'Dumbbell Shoulder Press',
              sets: [
                { id: 'set-1', order: 1, reps: 10, weight: 20 },
                { id: 'set-2', order: 2, reps: 10, weight: 20 },
                { id: 'set-3', order: 3, reps: 10, weight: 20 },
              ],
              restSeconds: 90,
              tempo: '2-0-1-0',
              instructions: 'Keep core tight, press directly overhead',
              order: 4,
            },
            {
              id: 'week-1-day-3-ex-5',
              name: 'Bulgarian Split Squat',
              sets: [
                { id: 'set-1', order: 1, reps: 10, weight: 20 },
                { id: 'set-2', order: 2, reps: 10, weight: 20 },
                { id: 'set-3', order: 3, reps: 10, weight: 20 },
              ],
              restSeconds: 90,
              tempo: '2-0-1-0',
              instructions: 'Keep front knee stable, focus on balance',
              order: 5,
            },
          ],
        },
        {
          id: 'week-1-day-4',
          dayOfWeek: 4, // Thursday
          isRestDay: true,
          exercises: [],
        },
        {
          id: 'week-1-day-5',
          dayOfWeek: 5, // Friday
          isRestDay: false,
          workoutType: WorkoutType.FullBody,
          exercises: [
            // Similar structure to Monday but with different variations
            {
              id: 'week-1-day-5-ex-1',
              name: 'Deadlift',
              sets: [
                { id: 'set-1', order: 1, reps: 6, weight: 80 },
                { id: 'set-2', order: 2, reps: 6, weight: 80 },
                { id: 'set-3', order: 3, reps: 6, weight: 80 },
              ],
              restSeconds: 180,
              tempo: '2-0-1-0',
              instructions: 'Keep back straight, drive through heels',
              order: 1,
            },
            {
              id: 'week-1-day-5-ex-2',
              name: 'Push-ups',
              sets: [
                { id: 'set-1', order: 1, reps: 12, weight: 0 },
                { id: 'set-2', order: 2, reps: 12, weight: 0 },
                { id: 'set-3', order: 3, reps: 12, weight: 0 },
              ],
              restSeconds: 90,
              tempo: '2-0-1-0',
              instructions: 'Full range of motion, keep body straight',
              order: 2,
            },
            {
              id: 'week-1-day-5-ex-3',
              name: 'Lat Pulldown',
              sets: [
                { id: 'set-1', order: 1, reps: 12, weight: 50 },
                { id: 'set-2', order: 2, reps: 12, weight: 50 },
                { id: 'set-3', order: 3, reps: 12, weight: 50 },
              ],
              restSeconds: 90,
              tempo: '2-0-1-0',
              instructions: 'Pull to chest, squeeze shoulder blades',
              order: 3,
            },
            {
              id: 'week-1-day-5-ex-4',
              name: 'Lateral Raises',
              sets: [
                { id: 'set-1', order: 1, reps: 12, weight: 10 },
                { id: 'set-2', order: 2, reps: 12, weight: 10 },
                { id: 'set-3', order: 3, reps: 12, weight: 10 },
              ],
              restSeconds: 60,
              tempo: '2-0-1-0',
              instructions:
                'Keep slight bend in elbows, raise to shoulder height',
              order: 4,
            },
            {
              id: 'week-1-day-5-ex-5',
              name: 'Plank',
              sets: [
                { id: 'set-1', order: 1, reps: 1, weight: 0 },
                { id: 'set-2', order: 2, reps: 1, weight: 0 },
                { id: 'set-3', order: 3, reps: 1, weight: 0 },
              ],
              restSeconds: 60,
              tempo: '0-30-0-0',
              instructions: 'Hold for 30 seconds, keep body straight',
              order: 5,
            },
          ],
        },
        {
          id: 'week-1-day-6',
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
