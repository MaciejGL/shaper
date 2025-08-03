import { NextRequest, NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    if (!id) {
      return NextResponse.json(
        { error: 'Exercise ID is required' },
        { status: 400 },
      )
    }

    // Check if exercise exists
    const exercise = await prisma.baseExercise.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        trainingExercises: { select: { id: true } },
        favouriteWorkoutExercises: { select: { id: true } },
      },
    })

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    // Check if exercise is being used in training plans or favourite workouts
    const hasTrainingUsage = exercise.trainingExercises.length > 0
    const hasFavouriteUsage = exercise.favouriteWorkoutExercises.length > 0

    if (hasTrainingUsage || hasFavouriteUsage) {
      return NextResponse.json(
        {
          error:
            'Cannot delete exercise that is currently being used in training plans or favourite workouts',
          details: {
            trainingPlans: exercise.trainingExercises.length,
            favouriteWorkouts: exercise.favouriteWorkoutExercises.length,
          },
        },
        { status: 409 },
      )
    }

    // Delete the exercise
    await prisma.baseExercise.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: `Exercise "${exercise.name}" has been deleted successfully`,
    })
  } catch (error) {
    console.error('Failed to delete exercise:', error)
    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 },
    )
  }
}
