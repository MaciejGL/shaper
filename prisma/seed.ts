import { PrismaClient } from '@prisma/client'

import {
  seedBaseExercisesArms,
  seedBaseExercisesBack,
  seedBaseExercisesChest,
  seedBaseExercisesCore,
  seedBaseExercisesLegs,
  seedBaseExercisesShoulders,
  seedMuscleGroups,
} from './seedContent'

const prisma = new PrismaClient()

// async function updateTrainingExercises() {
//   // 1. Find all non-public BaseExercises
//   const baseExercises = await prisma.baseExercise.findMany({
//     where: { isPublic: false, videoUrl: { not: null } },
//     select: { id: true, name: true },
//   })

//   const trainingExercises = await prisma.trainingExercise.findMany({
//     where: {
//       baseId: null,
//     },
//     select: {
//       id: true,
//       name: true,
//     },
//   })

//   for (const trainingExercise of trainingExercises) {
//     // 2. Update all TrainingExercises with matching name
//     await prisma.trainingExercise.update({
//       where: {
//         id: trainingExercise.id,
//       },
//       data: {
//         baseId: baseExercises.find((base) =>
//           base.name.toLowerCase().includes(trainingExercise.name.toLowerCase()),
//         )?.id,
//       },
//     })
//     console.log(
//       `Updated TrainingExercises with name "${trainingExercise.name}" to baseId ${baseExercises.find((base) => base.name === trainingExercise.name)?.id}`,
//     )
//   }
// }

async function main() {
  console.info('Seeding starting')

  console.info('Updating training exercises...')
  // await updateTrainingExercises()

  console.info('Seeding muscle groups...')
  await seedMuscleGroups()
  console.info('Seeding chest exercises...')
  await seedBaseExercisesChest()
  console.info('Seeding back exercises...')
  await seedBaseExercisesBack()
  console.info('Seeding arms exercises...')
  await seedBaseExercisesArms()
  console.info('Seeding legs exercises...')
  await seedBaseExercisesLegs()
  console.info('Seeding shoulders exercises...')
  await seedBaseExercisesShoulders()
  console.info('Seeding core exercises...')
  await seedBaseExercisesCore()

  console.info('Seeding complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
