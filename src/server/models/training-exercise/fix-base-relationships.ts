import { prisma } from '@/lib/db'

/**
 * Fix broken baseId relationships for training exercises
 * This function attempts to match training exercises with their corresponding base exercises
 */
export async function fixBrokenBaseRelationships() {
  console.info('🔧 Starting to fix broken base exercise relationships...')

  // Find training exercises with null baseId
  const brokenExercises = await prisma.trainingExercise.findMany({
    where: {
      baseId: null,
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    // take: 300, // Limit for safety
    // skip: 300,
  })

  console.info(
    `Found ${brokenExercises.length} training exercises with null baseId`,
  )

  let fixedCount = 0
  let notFoundCount = 0

  for (const exercise of brokenExercises) {
    // Try to find a matching base exercise by name (exact match first)
    let baseExercise = await prisma.baseExercise.findFirst({
      where: {
        name: {
          equals: exercise.name,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
    })

    // If no exact match, try partial match
    if (!baseExercise) {
      baseExercise = await prisma.baseExercise.findFirst({
        where: {
          name: {
            contains: exercise.name,
            mode: 'insensitive',
          },
        },
        select: {
          id: true,
          name: true,
        },
      })
    }

    // If still no match, try reverse partial match (exercise name contains base name)
    if (!baseExercise) {
      const baseExercises = await prisma.baseExercise.findMany({
        select: {
          id: true,
          name: true,
        },
      })

      baseExercise =
        baseExercises.find((base) =>
          exercise.name.toLowerCase().includes(base.name.toLowerCase()),
        ) || null
    }

    if (baseExercise) {
      // Update the training exercise with the found baseId
      await prisma.trainingExercise.update({
        where: { id: exercise.id },
        data: { baseId: baseExercise.id },
      })

      console.info(`✅ Fixed "${exercise.name}" → "${baseExercise.name}"`)
      fixedCount++
    } else {
      console.warn(`❌ No base exercise found for "${exercise.name}"`)
      notFoundCount++
    }
  }

  console.info(`🎉 Fixed ${fixedCount} training exercises`)
  console.info(
    `⚠️ ${notFoundCount} training exercises still need manual fixing`,
  )

  return {
    totalBroken: brokenExercises.length,
    fixed: fixedCount,
    notFound: notFoundCount,
  }
}

/**
 * Fix a single training exercise's base relationship
 */
type FixSingleExerciseResult =
  | {
      success: true
      action: 'already-linked' | 'linked'
      message: string
      baseExerciseName?: string
    }
  | {
      success: false
      action: 'not-found'
      message: string
    }

export async function fixSingleExerciseRelationship(
  exerciseId: string,
): Promise<FixSingleExerciseResult> {
  console.info(`🔧 Fixing single exercise relationship for ID: ${exerciseId}`)

  // Find the specific training exercise
  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: exerciseId },
    select: {
      id: true,
      name: true,
      baseId: true,
      createdAt: true,
    },
  })

  if (!exercise) {
    throw new Error('Training exercise not found')
  }

  if (exercise.baseId) {
    console.info(`✅ Exercise "${exercise.name}" already has a base exercise`)
    return {
      success: true,
      action: 'already-linked',
      message: `Exercise "${exercise.name}" already has a base exercise`,
    }
  }

  // Try to find a matching base exercise by name (exact match first)
  let baseExercise = await prisma.baseExercise.findFirst({
    where: {
      name: {
        equals: exercise.name,
        mode: 'insensitive',
      },
    },
    select: {
      id: true,
      name: true,
    },
  })

  // If no exact match, try partial match
  if (!baseExercise) {
    baseExercise = await prisma.baseExercise.findFirst({
      where: {
        name: {
          contains: exercise.name,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
      },
    })
  }

  // If still no match, try reverse partial match
  if (!baseExercise) {
    const baseExercises = await prisma.baseExercise.findMany({
      select: {
        id: true,
        name: true,
      },
    })

    baseExercise =
      baseExercises.find((base) =>
        exercise.name.toLowerCase().includes(base.name.toLowerCase()),
      ) || null
  }

  if (baseExercise) {
    // Update the training exercise with the found baseId
    await prisma.trainingExercise.update({
      where: { id: exercise.id },
      data: { baseId: baseExercise.id },
    })

    console.info(`✅ Fixed "${exercise.name}" → "${baseExercise.name}"`)
    return {
      success: true,
      action: 'linked',
      message: `Linked "${exercise.name}" to existing base exercise "${baseExercise.name}"`,
      baseExerciseName: baseExercise.name,
    }
  } else {
    // No matching base exercise found
    console.info(`❌ No base exercise found for "${exercise.name}"`)
    return {
      success: false,
      action: 'not-found',
      message: `No matching base exercise found for "${exercise.name}". Please use manual mapping.`,
    }
  }
}

// /**
//  * Create missing base exercises for training exercises that don't have matches
//  */
// export async function createMissingBaseExercises() {
//   console.info('🔧 Creating missing base exercises...')

//   // Find training exercises still without baseId after fixing
//   const orphanedExercises = await prisma.trainingExercise.findMany({
//     where: {
//       baseId: null,
//     },
//     select: {
//       id: true,
//       name: true,
//       description: true,
//     },
//     take: 50, // Limit for safety
//   })

//   let createdCount = 0

//   for (const exercise of orphanedExercises) {
//     // Check if we already have a base exercise with this exact name
//     const existingBase = await prisma.baseExercise.findFirst({
//       where: {
//         name: {
//           equals: exercise.name,
//           mode: 'insensitive',
//         },
//       },
//     })

//     if (existingBase) {
//       // Link to existing base exercise
//       await prisma.trainingExercise.update({
//         where: { id: exercise.id },
//         data: { baseId: existingBase.id },
//       })
//       console.info(`🔗 Linked "${exercise.name}" to existing base exercise`)
//       continue
//     }

//     // Create new base exercise
//     const newBaseExercise = await prisma.baseExercise.create({
//       data: {
//         name: exercise.name,
//         description:
//           exercise.description ||
//           `Auto-generated base exercise for ${exercise.name}`,
//         isPublic: false,
//         // Add default muscle groups (chest for now, can be updated manually)
//         muscleGroups: {
//           connect: [
//             { id: 'cmb6zr9kx0002uhmhqmgb01cy' }, // Pectoralis Major (Chest)
//           ],
//         },
//       },
//     })

//     // Link training exercise to new base exercise
//     await prisma.trainingExercise.update({
//       where: { id: exercise.id },
//       data: { baseId: newBaseExercise.id },
//     })

//     console.info(`✅ Created base exercise and linked "${exercise.name}"`)
//     createdCount++
//   }

//   console.info(`🎉 Created ${createdCount} new base exercises`)
//   return { created: createdCount }
// }
