import { BaseExercise as BaseExerciseType } from '@/generated/prisma/client'

import { MUSCLES_V2 } from '../src/constants/muscles-v2'
import { prisma } from '../src/lib/db'

type BaseExercise = Pick<
  BaseExerciseType,
  'name' | 'description' | 'equipment'
> & { muscleGroupIds: string[] }

export async function seedMuscleGroupsV2() {
  // Create categories based on muscles-v2.ts structure
  const muscleCategoriesV2 = [
    { name: 'Chest', slug: 'chest' },
    { name: 'Upper Back', slug: 'upper-back' },
    { name: 'Lower Back', slug: 'lower-back' },
    { name: 'Shoulders', slug: 'shoulders' },
    { name: 'Biceps', slug: 'biceps' },
    { name: 'Triceps', slug: 'triceps' },
    { name: 'Forearms', slug: 'forearms' },
    { name: 'Quads', slug: 'quads' },
    { name: 'Hamstrings', slug: 'hamstrings' },
    { name: 'Glutes', slug: 'glutes' },
    { name: 'Calves', slug: 'calves' },
    { name: 'Core', slug: 'core' },
    { name: 'Hip Adductors', slug: 'hip-adductors' },
    { name: 'Hip Abductors', slug: 'hip-abductors' },
    { name: 'Neck', slug: 'neck' },
    { name: 'Stabilizers', slug: 'stabilizers' },
  ]

  // Create muscle group categories
  const categoryMap: Record<string, string> = {}
  for (const cat of muscleCategoriesV2) {
    const category = await prisma.muscleGroupCategory.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        slug: cat.slug,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
      },
    })
    categoryMap[cat.name] = category.id
    console.info(`Added/Updated MuscleGroupCategory: ${cat.name}`)
  }

  // Create muscle groups using data from muscles-v2.ts
  for (const muscle of MUSCLES_V2) {
    await prisma.muscleGroup.upsert({
      where: { id: muscle.id },
      update: {
        name: muscle.name,
        alias: muscle.alias,
        groupSlug: muscle.groupSlug,
        categoryId: categoryMap[muscle.group],
        isPrimary: muscle.isPrimary !== false, // Default to true if not specified
      },
      create: {
        id: muscle.id, // Use specific ID from muscles-v2.ts
        name: muscle.name,
        alias: muscle.alias,
        groupSlug: muscle.groupSlug,
        categoryId: categoryMap[muscle.group],
        isPrimary: muscle.isPrimary !== false, // Default to true if not specified
      },
    })
    console.info(`Added/Updated MuscleGroup: ${muscle.name} (${muscle.alias})`)
  }

  console.info(
    `Seeded ${MUSCLES_V2.length} muscle groups across ${muscleCategoriesV2.length} categories`,
  )
}

export async function seedBaseExercisesChest() {
  const chestMuscles = await prisma.muscleGroup.findMany({
    where: {
      name: { in: ['Pectoralis Major', 'Pectoralis Minor'] },
    },
  })

  const pMajor = chestMuscles.find((m) => m.name === 'Pectoralis Major')
  const pMinor = chestMuscles.find((m) => m.name === 'Pectoralis Minor')

  if (!pMajor || !pMinor) {
    console.warn('Chest muscles not found. Skipping chest exercises seeding.')
    return
  }

  const extendedChestExercises: BaseExercise[] = [
    {
      name: 'Flat Bench Dumbbell Fly',
      description:
        'Isolation movement on flat bench targeting chest with dumbbells.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Incline Bench Dumbbell Fly',
      description:
        'Isolation movement on incline bench focusing on upper chest.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [pMajor.id, pMinor.id],
    },
    {
      name: 'Decline Dumbbell Fly',
      description: 'Lower chest isolation exercise performed with dumbbells.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Incline Bench Press (Barbell)',
      description: 'Barbell press on incline bench to target upper chest.',
      equipment: 'BARBELL',
      muscleGroupIds: [pMajor.id, pMinor.id],
    },
    {
      name: 'Decline Bench Press (Barbell)',
      description: 'Barbell press on decline bench to target lower chest.',
      equipment: 'BARBELL',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Reverse-Grip Bench Press',
      description: 'Targets upper chest using underhand barbell grip.',
      equipment: 'BARBELL',
      muscleGroupIds: [pMajor.id, pMinor.id],
    },
    {
      name: 'Flat Bench Press',
      description:
        'The gold standard chest press performed with barbell on a flat bench.',
      equipment: 'BARBELL',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Incline Bench Press',
      description: 'Barbell press on incline bench targeting the upper chest.',
      equipment: 'BARBELL',
      muscleGroupIds: [pMajor.id, pMinor.id],
    },
    {
      name: 'Decline Bench Press',
      description: 'Barbell press on decline bench emphasizing lower chest.',
      equipment: 'BARBELL',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Flat Dumbbell Press',
      description:
        'Dumbbell chest press on flat bench allowing greater range of motion.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Incline Dumbbell Press',
      description:
        'Upper chest dumbbell press variation performed on incline bench.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [pMajor.id, pMinor.id],
    },
    {
      name: 'Decline Dumbbell Press',
      description: 'Lower chest variation using dumbbells on a decline bench.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [pMajor.id],
    },

    {
      name: 'Pec Deck Machine',
      description:
        'Isolation machine targeting the chest using a fixed arc path.',
      equipment: 'MACHINE',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Single-Arm Cable Fly',
      description:
        'Unilateral cable fly to isolate the chest and improve symmetry.',
      equipment: 'CABLE',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Incline Cable Fly',
      description:
        'Cable fly variation on an incline bench focusing on upper chest.',
      equipment: 'CABLE',
      muscleGroupIds: [pMajor.id, pMinor.id],
    },
    {
      name: 'Decline Dumbbell Press',
      description: 'Targets lower chest using dumbbells on a decline bench.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Floor Press',
      description:
        'Bench press variation performed on the floor to limit ROM and target triceps and chest.',
      equipment: 'BARBELL',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Smith Machine Bench Press',
      description: 'Controlled path chest press using a Smith machine.',
      equipment: 'MACHINE',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Wide-Grip Push-Up',
      description:
        'Push-up variation with wide hand placement to emphasize chest.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Close-Grip Bench Press',
      description: 'Narrow grip bench press targeting triceps and inner chest.',
      equipment: 'BARBELL',
      muscleGroupIds: [pMajor.id, pMinor.id],
    },
    {
      name: 'Guillotine Press',
      description:
        'Chest press where the bar is lowered to the neck to emphasize upper chest.',
      equipment: 'BARBELL',
      muscleGroupIds: [pMajor.id, pMinor.id],
    },
    {
      name: 'Isometric Chest Squeeze',
      description:
        'Static contraction exercise for chest using body tension or a ball.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Resistance Band Chest Press',
      description: 'Chest pressing movement using resistance bands.',
      equipment: 'BAND',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Standing Chest Press (Cable)',
      description: 'Chest press performed standing with cables, engaging core.',
      equipment: 'CABLE',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Chest Press Machine',
      description: 'Machine-based horizontal chest press.',
      equipment: 'MACHINE',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Medicine Ball Chest Pass',
      description:
        'Explosive chest movement performed with a medicine ball throw.',
      equipment: 'MEDICINE_BALL',
      muscleGroupIds: [pMajor.id],
    },
    {
      name: 'Incline Smith Machine Press',
      description:
        'Incline pressing on a Smith machine for upper chest development.',
      equipment: 'MACHINE',
      muscleGroupIds: [pMajor.id, pMinor.id],
    },
  ]

  for (const ex of extendedChestExercises) {
    const existing = await prisma.baseExercise.findFirst({
      where: { name: ex.name },
    })

    if (!existing) {
      const created = await prisma.baseExercise.create({
        data: {
          name: ex.name,
          description: ex.description,
          equipment: ex.equipment,
          isPublic: true,
          muscleGroups: {
            connect: ex.muscleGroupIds.map((id) => ({ id })),
          },
        },
      })

      console.info(`Added BaseExercise CHEST: ${created.name}`)
    } else {
      console.info(`Updated BaseExercise CHEST: ${ex.name}`)
      await prisma.baseExercise.update({
        where: { id: existing.id },
        data: {
          name: ex.name,
          description: ex.description,
          equipment: ex.equipment,
          isPublic: true,
          muscleGroups: {
            connect: ex.muscleGroupIds.map((id) => ({ id })),
          },
        },
      })
    }
  }
}

export async function seedBaseExercisesBack() {
  const backMuscles = await prisma.muscleGroup.findMany({
    where: {
      name: {
        in: ['Latissimus Dorsi', 'Trapezius', 'Rhomboids', 'Erector Spinae'],
      },
    },
  })

  const lat = backMuscles.find((m) => m.name === 'Latissimus Dorsi')
  const traps = backMuscles.find((m) => m.name === 'Trapezius')
  const rhomboids = backMuscles.find((m) => m.name === 'Rhomboids')
  const erector = backMuscles.find((m) => m.name === 'Erector Spinae')

  if (!lat || !traps || !rhomboids || !erector) {
    console.warn('Back muscles not found. Skipping back exercises seeding.')
    return
  }

  const backExercises: BaseExercise[] = [
    {
      name: 'Pull-Up',
      description: 'Bodyweight exercise targeting lats and upper back.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [lat.id, traps.id],
    },
    {
      name: 'Chin-Up',
      description: 'Underhand pull-up variation targeting biceps and lats.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [lat.id],
    },
    {
      name: 'Lat Pulldown',
      description: 'Cable machine movement mimicking the pull-up.',
      equipment: 'MACHINE',
      muscleGroupIds: [lat.id],
    },
    {
      name: 'Barbell Bent-Over Row',
      description: 'Compound movement hitting the entire back.',
      equipment: 'BARBELL',
      muscleGroupIds: [lat.id, rhomboids.id, traps.id],
    },
    {
      name: 'Pendlay Row',
      description:
        'Strict barbell row from the floor focusing on explosiveness.',
      equipment: 'BARBELL',
      muscleGroupIds: [lat.id, rhomboids.id],
    },
    {
      name: 'Dumbbell Row',
      description: 'Unilateral row movement for lats and rhomboids.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [lat.id, rhomboids.id],
    },
    {
      name: 'Seated Cable Row',
      description: 'Horizontal pulling exercise using a cable machine.',
      equipment: 'CABLE',
      muscleGroupIds: [lat.id, rhomboids.id],
    },
    {
      name: 'T-Bar Row',
      description: 'Barbell row variant targeting middle back.',
      equipment: 'BARBELL',
      muscleGroupIds: [traps.id, rhomboids.id],
    },
    {
      name: 'Inverted Row',
      description: 'Bodyweight row using bar or suspension trainer.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [lat.id],
    },
    {
      name: 'Deadlift',
      description: 'Full-body pull targeting posterior chain including back.',
      equipment: 'BARBELL',
      muscleGroupIds: [erector.id, traps.id],
    },
    {
      name: 'Cable Face Pull',
      description:
        'Rehabilitation and posture exercise for upper traps and rear delts.',
      equipment: 'CABLE',
      muscleGroupIds: [traps.id],
    },
    {
      name: 'Reverse Fly (Dumbbell)',
      description: 'Isolation exercise for rear delts and rhomboids.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [rhomboids.id],
    },
    {
      name: 'Shrug',
      description: 'Trapezius isolation movement.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [traps.id],
    },
    {
      name: 'Good Morning',
      description: 'Lower back and hamstring movement with barbell.',
      equipment: 'BARBELL',
      muscleGroupIds: [erector.id],
    },
    {
      name: 'Superman Hold',
      description: 'Bodyweight exercise for erector spinae.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [erector.id],
    },
    {
      name: 'Straight Arm Pulldown',
      description: 'Isolation movement for the lats using a cable.',
      equipment: 'CABLE',
      muscleGroupIds: [lat.id],
    },
    {
      name: 'Kroc Row',
      description: 'Heavy dumbbell row variation for upper back hypertrophy.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [lat.id, rhomboids.id],
    },
    {
      name: 'Chest Supported Row (Machine)',
      description: 'Machine-based row that removes lower back involvement.',
      equipment: 'MACHINE',
      muscleGroupIds: [rhomboids.id],
    },
    {
      name: 'Pull-Up',
      description:
        'Bodyweight vertical pulling movement targeting the lats and upper back.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [lat.id, traps.id],
    },
    {
      name: 'Lat Pulldown',
      description:
        'Machine-based vertical pull mimicking a pull-up for lat activation.',
      equipment: 'MACHINE',
      muscleGroupIds: [lat.id],
    },
    {
      name: 'Barbell Bent-Over Row',
      description:
        'Compound horizontal pulling movement for back thickness and lats.',
      equipment: 'BARBELL',
      muscleGroupIds: [lat.id, rhomboids.id, traps.id],
    },
    {
      name: 'Dumbbell Row',
      description: 'Single-arm row variation targeting lats and rhomboids.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [lat.id, rhomboids.id],
    },
    {
      name: 'T-Bar Row',
      description: 'Landmine or platform-supported row for mid and upper back.',
      equipment: 'MACHINE',
      muscleGroupIds: [lat.id, traps.id, rhomboids.id],
    },
    {
      name: 'Cable Row',
      description: 'Horizontal row performed using a seated cable machine.',
      equipment: 'CABLE',
      muscleGroupIds: [lat.id, rhomboids.id],
    },
    {
      name: 'Face Pull',
      description:
        'Cable movement targeting rear delts, traps, and upper back.',
      equipment: 'CABLE',
      muscleGroupIds: [traps.id, rhomboids.id],
    },
    {
      name: 'Inverted Row',
      description: 'Bodyweight row performed under a bar, great for beginners.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [lat.id, rhomboids.id],
    },
    {
      name: 'Chest-Supported Row',
      description:
        'Machine or bench-supported row to reduce lower back strain.',
      equipment: 'MACHINE',
      muscleGroupIds: [lat.id, rhomboids.id],
    },
    {
      name: 'Deadlift',
      description:
        'Full-body lift focusing on posterior chain including erector spinae.',
      equipment: 'BARBELL',
      muscleGroupIds: [erector.id, traps.id, lat.id],
    },
    {
      name: 'Rack Pull',
      description: 'Partial deadlift from a rack, emphasizing upper back.',
      equipment: 'BARBELL',
      muscleGroupIds: [erector.id, traps.id],
    },
    {
      name: 'Reverse Fly',
      description: 'Isolation exercise targeting rear delts and rhomboids.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [rhomboids.id],
    },
    {
      name: 'Good Morning',
      description: 'Hip-hinge movement engaging erector spinae and hamstrings.',
      equipment: 'BARBELL',
      muscleGroupIds: [erector.id],
    },
    {
      name: 'Hyperextension',
      description: 'Isolation for the lower back on a roman chair or bench.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [erector.id],
    },
  ]

  for (const ex of backExercises) {
    const existing = await prisma.baseExercise.findFirst({
      where: { name: ex.name },
    })

    if (!existing) {
      const created = await prisma.baseExercise.create({
        data: {
          name: ex.name,
          description: ex.description,
          equipment: ex.equipment,
          isPublic: true,
          muscleGroups: {
            connect: ex.muscleGroupIds.map((id) => ({ id })),
          },
        },
      })

      console.info(`Added BaseExercise BACK: ${created.name}`)
    } else {
      console.info(`Updated BaseExercise BACK: ${ex.name}`)
      await prisma.baseExercise.update({
        where: { id: existing.id },
        data: {
          name: ex.name,
          description: ex.description,
          equipment: ex.equipment,
          isPublic: true,
          muscleGroups: {
            connect: ex.muscleGroupIds.map((id) => ({ id })),
          },
        },
      })
    }
  }
}

export async function seedBaseExercisesArms() {
  const muscles = await prisma.muscleGroup.findMany({
    where: {
      name: {
        in: ['Biceps Brachii', 'Triceps Brachii', 'Brachialis', 'Forearms'],
      },
    },
  })

  const muscleMap = Object.fromEntries(muscles.map((m) => [m.name, m.id]))

  const armExercises: BaseExercise[] = [
    {
      name: 'Barbell Bicep Curl',
      description: 'Classic barbell curl targeting the biceps brachii.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Biceps Brachii']],
    },
    {
      name: 'Dumbbell Bicep Curl',
      description: 'Alternating or simultaneous curls using dumbbells.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [muscleMap['Biceps Brachii']],
    },
    {
      name: 'Hammer Curl',
      description: 'Targets the brachialis and forearms using a neutral grip.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [muscleMap['Brachialis'], muscleMap['Forearms']],
    },
    {
      name: 'Concentration Curl',
      description: 'Isolated dumbbell curl focusing on peak bicep contraction.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [muscleMap['Biceps Brachii']],
    },
    {
      name: 'Preacher Curl',
      description: 'Curl variation with arm support for bicep isolation.',
      equipment: 'MACHINE',
      muscleGroupIds: [muscleMap['Biceps Brachii']],
    },
    {
      name: 'Cable Curl',
      description: 'Constant resistance bicep curl using cable machine.',
      equipment: 'CABLE',
      muscleGroupIds: [muscleMap['Biceps Brachii']],
    },
    {
      name: 'EZ Bar Curl',
      description: 'Angled grip barbell curl reducing wrist strain.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Biceps Brachii']],
    },
    {
      name: 'Straight Bar Tricep Pushdown',
      description: 'Cable movement isolating the triceps.',
      equipment: 'CABLE',
      muscleGroupIds: [muscleMap['Triceps Brachii']],
    },
    {
      name: 'Overhead Tricep Extension (Dumbbell)',
      description: 'Targets long head of the triceps with overhead motion.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [muscleMap['Triceps Brachii']],
    },
    {
      name: 'EZ-Bar Skullcrusher',
      description: 'Lying tricep extension using barbell or EZ bar.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Triceps Brachii']],
    },
    {
      name: 'Overhead Tricep Extension (Cable)',
      description: 'Targets long head of the triceps with overhead motion.',
      equipment: 'CABLE',
      muscleGroupIds: [muscleMap['Triceps Brachii']],
    },
    {
      name: 'Dumbbell Skullcrusher',
      description: 'Lying tricep extension using dumbbells.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Triceps Brachii']],
    },
    {
      name: 'Skullcrusher',
      description: 'Lying tricep extension using barbell or EZ bar.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Triceps Brachii']],
    },
    {
      name: 'Cable Rope Tricep Pushdown',
      description: 'Cable movement isolating the triceps.',
      equipment: 'CABLE',
      muscleGroupIds: [muscleMap['Triceps Brachii']],
    },
    {
      name: 'Tricep Kickback',
      description: 'Bent-over dumbbell extension isolating triceps.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [muscleMap['Triceps Brachii']],
    },
    {
      name: 'Close-Grip Bench Press',
      description: 'Bench press variation emphasizing triceps.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Triceps Brachii']],
    },
    {
      name: 'Reverse Curl',
      description: 'Curl variation emphasizing brachialis and forearms.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Brachialis'], muscleMap['Forearms']],
    },
    {
      name: 'Zottman Curl',
      description:
        'Combo of regular and reverse curls for full arm activation.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [
        muscleMap['Biceps Brachii'],
        muscleMap['Brachialis'],
        muscleMap['Forearms'],
      ],
    },
    {
      name: 'Wrist Curl',
      description: 'Isolation movement for forearm flexors.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Forearms']],
    },
    {
      name: 'Reverse Wrist Curl',
      description: 'Targets extensors on top of the forearm.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Forearms']],
    },
    {
      name: 'Spider Curl',
      description: 'Incline bench curl isolating biceps in peak contraction.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [muscleMap['Biceps Brachii']],
    },
    {
      name: 'Cable Rope Hammer Curl',
      description:
        'Hammer grip curl with rope to emphasize brachialis and forearms.',
      equipment: 'CABLE',
      muscleGroupIds: [muscleMap['Brachialis'], muscleMap['Forearms']],
    },
    {
      name: 'Overhead Cable Triceps Extension',
      description: 'Triceps isolation performed with cable from overhead.',
      equipment: 'CABLE',
      muscleGroupIds: [muscleMap['Triceps Brachii']],
    },
    {
      name: 'Close-Grip Push-Up',
      description:
        'Push-up variation with narrow hands for triceps activation.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [muscleMap['Triceps Brachii']],
    },
    {
      name: 'Skull Crushers',
      description: 'Lying barbell extension for triceps development.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Triceps Brachii']],
    },
    {
      name: 'Kickbacks',
      description: 'Triceps extension performed bent-over with dumbbells.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [muscleMap['Triceps Brachii']],
    },
    {
      name: 'Reverse Grip Triceps Pushdown',
      description: 'Triceps cable pushdown with underhand grip.',
      equipment: 'CABLE',
      muscleGroupIds: [muscleMap['Triceps Brachii']],
    },
    {
      name: 'Behind-the-Back Wrist Curl',
      description:
        'Forearm isolation exercise for inner forearm using a barbell.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Forearms']],
    },
    {
      name: 'Incline Dumbbell Curl',
      description:
        'Biceps curl while lying back on an incline bench for stretch.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [muscleMap['Biceps Brachii']],
    },
  ]

  for (const ex of armExercises) {
    const existing = await prisma.baseExercise.findFirst({
      where: { name: ex.name },
    })

    if (!existing) {
      const created = await prisma.baseExercise.create({
        data: {
          name: ex.name,
          description: ex.description,
          equipment: ex.equipment,
          isPublic: true,
          muscleGroups: {
            connect: ex.muscleGroupIds.map((id) => ({ id })),
          },
        },
      })

      console.info(`Added BaseExercise ARMS: ${created.name}`)
    } else {
      console.info(`Updated BaseExercise ARMS: ${ex.name}`)
      await prisma.baseExercise.update({
        where: { id: existing.id },
        data: {
          name: ex.name,
          description: ex.description,
          equipment: ex.equipment,
          isPublic: true,
          muscleGroups: {
            connect: ex.muscleGroupIds.map((id) => ({ id })),
          },
        },
      })
    }
  }
}

export async function seedBaseExercisesLegs() {
  const muscles = await prisma.muscleGroup.findMany({
    where: {
      name: {
        in: [
          'Quadriceps',
          'Hamstrings',
          'Gluteus Maximus',
          'Adductors',
          'Calves',
        ],
      },
    },
  })

  const muscleMap = Object.fromEntries(muscles.map((m) => [m.name, m.id]))

  const legExercises: BaseExercise[] = [
    {
      name: 'Barbell Back Squat',
      description: 'Compound movement hitting quads, glutes, and hamstrings.',
      equipment: 'BARBELL',
      muscleGroupIds: [
        muscleMap['Quadriceps'],
        muscleMap['Hamstrings'],
        muscleMap['Gluteus Maximus'],
      ],
    },
    {
      name: 'Front Squat',
      description: 'Targets quads more than traditional back squats.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Quadriceps']],
    },
    {
      name: 'Leg Press',
      description:
        'Machine-based squat alternative targeting quads and glutes.',
      equipment: 'MACHINE',
      muscleGroupIds: [muscleMap['Quadriceps'], muscleMap['Gluteus Maximus']],
    },
    {
      name: 'Lunges',
      description: 'Single-leg movement for glutes, quads, and hamstrings.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [
        muscleMap['Quadriceps'],
        muscleMap['Hamstrings'],
        muscleMap['Gluteus Maximus'],
      ],
    },
    {
      name: 'Walking Lunges',
      description: 'Dynamic lunge variation for balance and muscle control.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [
        muscleMap['Quadriceps'],
        muscleMap['Hamstrings'],
        muscleMap['Gluteus Maximus'],
      ],
    },
    {
      name: 'Conventional Deadlift',
      description:
        'Full-body compound movement focusing on glutes, hamstrings, and back.',
      equipment: 'BARBELL',
      muscleGroupIds: [
        muscleMap['Hamstrings'],
        muscleMap['Gluteus Maximus'],
        muscleMap['Quadriceps'],
      ],
    },
    {
      name: 'Sumo Deadlift',
      description: 'Wide stance deadlift emphasizing glutes and inner thighs.',
      equipment: 'BARBELL',
      muscleGroupIds: [
        muscleMap['Hamstrings'],
        muscleMap['Gluteus Maximus'],
        muscleMap['Adductors'],
      ],
    },
    {
      name: 'Trap Bar Deadlift',
      description:
        'Hex bar variation reducing spine stress, hitting quads and glutes.',
      equipment: 'TRAP_BAR',
      muscleGroupIds: [
        muscleMap['Quadriceps'],
        muscleMap['Gluteus Maximus'],
        muscleMap['Hamstrings'],
      ],
    },
    {
      name: 'Stiff-Leg Deadlift',
      description: 'Hamstring-dominant variation using less knee flexion.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Hamstrings']],
    },
    {
      name: 'Deficit Deadlift',
      description:
        'Deadlift performed on a platform to increase range of motion.',
      equipment: 'BARBELL',
      muscleGroupIds: [
        muscleMap['Hamstrings'],
        muscleMap['Gluteus Maximus'],
        muscleMap['Quadriceps'],
      ],
    },
    {
      name: 'Snatch-Grip Deadlift',
      description:
        'Deadlift with a wide grip to emphasize upper back and posterior chain.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Hamstrings'], muscleMap['Gluteus Maximus']],
    },
    {
      name: 'Romanian Deadlift',
      description: 'Hip-hinge movement targeting hamstrings and glutes.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Hamstrings'], muscleMap['Gluteus Maximus']],
    },
    {
      name: 'Leg Curl Machine',
      description: 'Isolation movement for hamstrings.',
      equipment: 'MACHINE',
      muscleGroupIds: [muscleMap['Hamstrings']],
    },
    {
      name: 'Leg Extension',
      description: 'Machine-based isolation for the quadriceps.',
      equipment: 'MACHINE',
      muscleGroupIds: [muscleMap['Quadriceps']],
    },
    {
      name: 'Hip Thrust',
      description: 'Glute-focused movement using a barbell or bodyweight.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Gluteus Maximus']],
    },
    {
      name: 'Cable Kickbacks',
      description: 'Isolated glute activation with cable machine.',
      equipment: 'CABLE',
      muscleGroupIds: [muscleMap['Gluteus Maximus']],
    },
    {
      name: 'Step-Up',
      description: 'Unilateral movement for quads and glutes.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [muscleMap['Quadriceps'], muscleMap['Gluteus Maximus']],
    },
    {
      name: 'Sumo Squat',
      description: 'Wide-stance squat targeting adductors and glutes.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [muscleMap['Adductors'], muscleMap['Gluteus Maximus']],
    },
    {
      name: 'Calf Raise',
      description: 'Isolation for calves performed on machine or bodyweight.',
      equipment: 'MACHINE',
      muscleGroupIds: [muscleMap['Calves']],
    },
    {
      name: 'Seated Calf Raise',
      description: 'Targets the soleus muscle in the calves.',
      equipment: 'MACHINE',
      muscleGroupIds: [muscleMap['Calves']],
    },
    {
      name: 'Glute Kickback Machine',
      description: 'Machine variation of kickbacks for glute isolation.',
      equipment: 'MACHINE',
      muscleGroupIds: [muscleMap['Gluteus Maximus']],
    },
    {
      name: 'Single-Leg Romanian Deadlift',
      description: 'Balance-intensive hamstring and glute movement.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [muscleMap['Hamstrings'], muscleMap['Gluteus Maximus']],
    },
    {
      name: 'Resistance Band Squat',
      description: 'Squat using resistance bands for added tension.',
      equipment: 'BAND',
      muscleGroupIds: [muscleMap['Quadriceps'], muscleMap['Gluteus Maximus']],
    },
  ]

  for (const ex of legExercises) {
    const existing = await prisma.baseExercise.findFirst({
      where: { name: ex.name },
    })

    if (!existing) {
      const created = await prisma.baseExercise.create({
        data: {
          name: ex.name,
          description: ex.description,
          equipment: ex.equipment,
          isPublic: true,
          muscleGroups: {
            connect: ex.muscleGroupIds.map((id) => ({ id })),
          },
        },
      })

      console.info(`Added BaseExercise LEGS: ${created.name}`)
    } else {
      console.info(`Updated BaseExercise LEGS: ${ex.name}`)
      await prisma.baseExercise.update({
        where: { id: existing.id },
        data: {
          name: ex.name,
          description: ex.description,
          equipment: ex.equipment,
          isPublic: true,
          muscleGroups: {
            connect: ex.muscleGroupIds.map((id) => ({ id })),
          },
        },
      })
    }
  }
}

export async function seedBaseExercisesShoulders() {
  const muscles = await prisma.muscleGroup.findMany({
    where: {
      name: {
        in: ['Deltoid Anterior', 'Deltoid Lateral', 'Deltoid Posterior'],
      },
    },
  })

  const muscleMap = Object.fromEntries(muscles.map((m) => [m.name, m.id]))

  const shoulderExercises: BaseExercise[] = [
    {
      name: 'Barbell Overhead Press',
      description:
        'Compound pressing movement primarily for front and side delts.',
      equipment: 'BARBELL',
      muscleGroupIds: [
        muscleMap['Deltoid Anterior'],
        muscleMap['Deltoid Lateral'],
      ],
    },
    {
      name: 'Dumbbell Shoulder Press',
      description: 'Overhead press variation using dumbbells.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [
        muscleMap['Deltoid Anterior'],
        muscleMap['Deltoid Lateral'],
      ],
    },
    {
      name: 'Arnold Press',
      description:
        'A twisting dumbbell press that targets all heads of the deltoids.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [
        muscleMap['Deltoid Anterior'],
        muscleMap['Deltoid Lateral'],
        muscleMap['Deltoid Posterior'],
      ],
    },
    {
      name: 'Lateral Raise',
      description: 'Isolation exercise for the lateral delts.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [muscleMap['Deltoid Lateral']],
    },
    {
      name: 'Front Raise',
      description: 'Isolation movement targeting the front delts.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [muscleMap['Deltoid Anterior']],
    },
    {
      name: 'Rear Delt Fly',
      description: 'Isolation movement for the rear delts.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [muscleMap['Deltoid Posterior']],
    },
    {
      name: 'Face Pull',
      description: 'Cable-based exercise for rear delts and traps.',
      equipment: 'CABLE',
      muscleGroupIds: [muscleMap['Deltoid Posterior']],
    },
    {
      name: 'Upright Row',
      description: 'Targets the traps and side delts using vertical pulling.',
      equipment: 'BARBELL',
      muscleGroupIds: [muscleMap['Deltoid Lateral']],
    },
    {
      name: 'Smith Machine Shoulder Press',
      description: 'Controlled overhead press using Smith machine.',
      equipment: 'MACHINE',
      muscleGroupIds: [
        muscleMap['Deltoid Anterior'],
        muscleMap['Deltoid Lateral'],
      ],
    },
    {
      name: 'Seated Dumbbell Press',
      description: 'Overhead press performed seated for isolation.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [
        muscleMap['Deltoid Anterior'],
        muscleMap['Deltoid Lateral'],
      ],
    },
    {
      name: 'Cable Lateral Raise',
      description: 'Lateral raise using cables for constant tension.',
      equipment: 'CABLE',
      muscleGroupIds: [muscleMap['Deltoid Lateral']],
    },
    {
      name: 'Machine Lateral Raise',
      description: 'Lateral raise performed on a machine.',
      equipment: 'MACHINE',
      muscleGroupIds: [muscleMap['Deltoid Lateral']],
    },
    {
      name: 'Reverse Pec Deck',
      description: 'Rear delt isolation movement using the pec deck machine.',
      equipment: 'MACHINE',
      muscleGroupIds: [muscleMap['Deltoid Posterior']],
    },
    {
      name: 'Standing Overhead Press',
      description: 'Barbell overhead press engaging full shoulders.',
      equipment: 'BARBELL',
      muscleGroupIds: [
        muscleMap['Deltoid Anterior'],
        muscleMap['Deltoid Lateral'],
      ],
    },
    {
      name: 'Push Press',
      description: 'Explosive barbell overhead press using leg drive.',
      equipment: 'BARBELL',
      muscleGroupIds: [
        muscleMap['Deltoid Anterior'],
        muscleMap['Deltoid Lateral'],
      ],
    },
  ]

  for (const ex of shoulderExercises) {
    const existing = await prisma.baseExercise.findFirst({
      where: { name: ex.name },
    })

    if (!existing) {
      const created = await prisma.baseExercise.create({
        data: {
          name: ex.name,
          description: ex.description,
          equipment: ex.equipment,
          isPublic: true,
          muscleGroups: {
            connect: ex.muscleGroupIds.map((id) => ({ id })),
          },
        },
      })

      console.info(`Added BaseExercise SHOULDERS: ${created.name}`)
    } else {
      console.info(`Updated BaseExercise SHOULDERS: ${ex.name}`)
      await prisma.baseExercise.update({
        where: { id: existing.id },
        data: {
          name: ex.name,
          description: ex.description,
          equipment: ex.equipment,
          isPublic: true,
          muscleGroups: {
            connect: ex.muscleGroupIds.map((id) => ({ id })),
          },
        },
      })
    }
  }
}

export async function seedBaseExercisesCore() {
  const muscles = await prisma.muscleGroup.findMany({
    where: {
      name: {
        in: ['Rectus Abdominis', 'Obliques', 'Transverse Abdominis'],
      },
    },
  })

  const muscleMap = Object.fromEntries(muscles.map((m) => [m.name, m.id]))

  const coreExercises: BaseExercise[] = [
    {
      name: 'Crunch',
      description:
        'Classic abdominal exercise focusing on the rectus abdominis.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [muscleMap['Rectus Abdominis']],
    },
    {
      name: 'Sit-Up',
      description:
        'Abdominal exercise with full range of motion to activate the core.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [muscleMap['Rectus Abdominis']],
    },
    {
      name: 'Plank',
      description: 'Isometric core hold that targets deep core stabilizers.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [muscleMap['Transverse Abdominis']],
    },
    {
      name: 'Side Plank',
      description: 'Lateral isometric hold focusing on obliques and deep core.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [
        muscleMap['Obliques'],
        muscleMap['Transverse Abdominis'],
      ],
    },
    {
      name: 'Leg Raise',
      description: 'Lower ab movement often done lying flat.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [muscleMap['Rectus Abdominis']],
    },
    {
      name: 'Hanging Leg Raise',
      description: 'Advanced core exercise performed hanging from a bar.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [muscleMap['Rectus Abdominis']],
    },
    {
      name: 'Bicycle Crunch',
      description: 'Cross-body movement targeting abs and obliques.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [muscleMap['Rectus Abdominis'], muscleMap['Obliques']],
    },
    {
      name: 'Russian Twist',
      description: 'Rotational core exercise that targets obliques.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [muscleMap['Obliques']],
    },
    {
      name: 'Cable Crunch',
      description: 'Weighted crunch performed on a cable machine.',
      equipment: 'CABLE',
      muscleGroupIds: [muscleMap['Rectus Abdominis']],
    },
    {
      name: 'Ab Wheel Rollout',
      description: 'Dynamic full-core movement using an ab wheel.',
      equipment: 'WHEEL',
      muscleGroupIds: [
        muscleMap['Rectus Abdominis'],
        muscleMap['Transverse Abdominis'],
      ],
    },
    {
      name: 'Toe Touches',
      description: 'Targets upper abs through controlled reaching motion.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [muscleMap['Rectus Abdominis']],
    },
    {
      name: 'Flutter Kicks',
      description: 'Lower ab activation through quick leg movements.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [muscleMap['Rectus Abdominis']],
    },
    {
      name: 'Mountain Climbers',
      description: 'Cardio-based movement engaging the entire core.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [
        muscleMap['Rectus Abdominis'],
        muscleMap['Transverse Abdominis'],
      ],
    },
    {
      name: 'V-Ups',
      description: 'Explosive movement combining crunch and leg raise.',
      equipment: 'BODYWEIGHT',
      muscleGroupIds: [muscleMap['Rectus Abdominis']],
    },
    {
      name: 'Weighted Sit-Up',
      description: 'Sit-up variation performed with added resistance.',
      equipment: 'DUMBBELL',
      muscleGroupIds: [muscleMap['Rectus Abdominis']],
    },
  ]

  for (const ex of coreExercises) {
    const existing = await prisma.baseExercise.findFirst({
      where: { name: ex.name },
    })

    if (!existing) {
      const created = await prisma.baseExercise.create({
        data: {
          name: ex.name,
          description: ex.description,
          equipment: ex.equipment,
          isPublic: true,
          muscleGroups: {
            connect: ex.muscleGroupIds.map((id) => ({ id })),
          },
        },
      })

      console.info(`Added BaseExercise CORE: ${created.name}`)
    } else {
      console.info(`Updated BaseExercise CORE: ${ex.name}`)
      await prisma.baseExercise.update({
        where: { id: existing.id },
        data: {
          name: ex.name,
          description: ex.description,
          equipment: ex.equipment,
          isPublic: true,
          muscleGroups: {
            connect: ex.muscleGroupIds.map((id) => ({ id })),
          },
        },
      })
    }
  }
}
