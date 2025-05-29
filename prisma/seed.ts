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

async function main() {
  console.info('Seeding starting')

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
