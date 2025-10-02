import { GQLClientSurvey } from '@/generated/graphql-server'
import { ClientSurvey as PrismaClientSurvey } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import User from '../user/model'

export default class ClientSurvey implements GQLClientSurvey {
  constructor(
    protected surveyData: PrismaClientSurvey,
    protected context: GQLContext,
  ) {}

  get id() {
    return this.surveyData.id
  }

  get userId() {
    return this.surveyData.userId
  }

  get data() {
    return this.surveyData.data
  }

  get version() {
    return this.surveyData.version
  }

  get createdAt() {
    return this.surveyData.createdAt.toISOString()
  }

  get updatedAt() {
    return this.surveyData.updatedAt.toISOString()
  }

  async user() {
    const user = await prisma.user.findUnique({
      where: { id: this.surveyData.userId },
    })

    if (!user) {
      console.error('[CLIENT-SURVEY] User not found')
      throw new Error('User not found')
    }

    return new User(user, this.context)
  }
}
