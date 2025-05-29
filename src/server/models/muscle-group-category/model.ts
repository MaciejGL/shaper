import { MuscleGroupCategory as PrismaMuscleGroupCategory } from '@prisma/client'

import { GQLMuscleGroupCategory } from '@/generated/graphql-server'
import MuscleGroup from '../muscle-group/model'
import { prisma } from '@/lib/db'


export default class MuscleGroupCategory implements GQLMuscleGroupCategory {
  constructor(protected data: PrismaMuscleGroupCategory) {}

  get id() {
    return this.data.id
  }

  
  get name() {
    return this.data.name
  }
  
  get slug() {
    return this.data.slug
  }

  async muscles() {
    const muscles = await prisma.muscleGroup.findMany({
      where: {
        categoryId: this.data.id,
      },
    })

    return muscles.map((muscle) => new MuscleGroup(muscle))
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }
}
