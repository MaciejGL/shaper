import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const categories = [
    {
      name: 'Chest',
      slug: 'chest',
      muscles: [
        { name: 'Pectoralis Major', alias: 'Chest', groupSlug: 'chest' },
        { name: 'Pectoralis Minor', alias: 'Inner Chest', groupSlug: 'chest' },
      ],
    },
    {
      name: 'Back',
      slug: 'back',
      muscles: [
        { name: 'Latissimus Dorsi', alias: 'Lats', groupSlug: 'back' },
        { name: 'Trapezius', alias: 'Traps', groupSlug: 'back' },
        { name: 'Rhomboids', alias: 'Rhomboids', groupSlug: 'back' },
        { name: 'Erector Spinae', alias: 'Lower Back', groupSlug: 'back' },
      ],
    },
    {
      name: 'Arms',
      slug: 'arms',
      muscles: [
        { name: 'Biceps Brachii', alias: 'Biceps', groupSlug: 'arms' },
        { name: 'Triceps Brachii', alias: 'Triceps', groupSlug: 'arms' },
        { name: 'Brachialis', alias: 'Brachialis', groupSlug: 'arms' },
        { name: 'Forearms', alias: 'Forearms', groupSlug: 'arms' },
      ],
    },
    {
      name: 'Legs',
      slug: 'legs',
      muscles: [
        { name: 'Quadriceps', alias: 'Quads', groupSlug: 'legs' },
        { name: 'Hamstrings', alias: 'Hams', groupSlug: 'legs' },
        { name: 'Gluteus Maximus', alias: 'Glutes', groupSlug: 'legs' },
        { name: 'Adductors', alias: 'Inner Thigh', groupSlug: 'legs' },
        { name: 'Calves', alias: 'Calves', groupSlug: 'legs' },
      ],
    },
    {
      name: 'Shoulders',
      slug: 'shoulders',
      muscles: [
        {
          name: 'Deltoid Anterior',
          alias: 'Front Delts',
          groupSlug: 'shoulders',
        },
        {
          name: 'Deltoid Lateral',
          alias: 'Side Delts',
          groupSlug: 'shoulders',
        },
        {
          name: 'Deltoid Posterior',
          alias: 'Rear Delts',
          groupSlug: 'shoulders',
        },
      ],
    },
    {
      name: 'Core',
      slug: 'core',
      muscles: [
        { name: 'Rectus Abdominis', alias: 'Abs', groupSlug: 'core' },
        { name: 'Obliques', alias: 'Obliques', groupSlug: 'core' },
        { name: 'Transverse Abdominis', alias: 'Deep Core', groupSlug: 'core' },
      ],
    },
  ]

  for (const cat of categories) {
    const category = await prisma.muscleGroupCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: {
        name: cat.name,
        slug: cat.slug,
      },
    })

    for (const muscle of cat.muscles) {
      await prisma.muscleGroup.upsert({
        where: { name: muscle.name },
        update: {},
        create: {
          name: muscle.name,
          alias: muscle.alias,
          groupSlug: muscle.groupSlug,
          categoryId: category.id,
        },
      })
    }

    console.log(`Seeded category: ${cat.name}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
