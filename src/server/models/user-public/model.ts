import {
  TrainingPlan as PrismaTrainingPlan,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
} from '@prisma/client'

import { GQLGoal, GQLUserPublic, GQLUserRole } from '@/generated/graphql-server'

import TrainingPlan from '../training-plan/model'

export default class UserPublic implements GQLUserPublic {
  constructor(
    protected data: PrismaUser & {
      profile?: PrismaUserProfile | null
      assignedPlans?: PrismaTrainingPlan[]
    },
  ) {}

  get id() {
    return this.data.id
  }

  get email() {
    return this.data.email
  }

  get firstName() {
    return this.data.profile?.firstName
  }

  get lastName() {
    return this.data.profile?.lastName
  }

  get image() {
    return this.data.profile?.avatarUrl
  }

  get role() {
    switch (this.data.role) {
      case GQLUserRole.Trainer:
        return GQLUserRole.Trainer
      case GQLUserRole.Client:
        return GQLUserRole.Client
      default:
        return GQLUserRole.Client
    }
  }

  get sex() {
    return this.data.profile?.sex
  }

  get birthday() {
    if (!this.data.profile?.birthday) return null
    return new Date(this.data.profile?.birthday).toISOString()
  }

  get goals() {
    const goals: GQLGoal[] = []
    this.data.profile?.goals.forEach((goal) => {
      goals.push(goal as GQLGoal)
    })

    return goals
  }

  get allergies() {
    return this.data.profile?.allergies
  }

  get currentWeight() {
    return this.data.profile?.weight
  }

  get height() {
    return this.data.profile?.height
  }

  get activePlan() {
    const plan = this.data.assignedPlans?.at(0)
    if (!plan) return null

    return new TrainingPlan(plan)
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
