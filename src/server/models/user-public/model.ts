import { GQLGoal, GQLUserPublic, GQLUserRole } from '@/generated/graphql-server'
import {
  ExerciseSet as PrismaExerciseSet,
  ExerciseSetLog as PrismaExerciseSetLog,
  TrainingDay as PrismaTrainingDay,
  TrainingExercise as PrismaTrainingExercise,
  TrainingPlan as PrismaTrainingPlan,
  TrainingWeek as PrismaTrainingWeek,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
  WorkoutSessionEvent as PrismaWorkoutSessionEvent,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import TrainingPlan from '../training-plan/model'

export default class UserPublic implements GQLUserPublic {
  constructor(
    protected data: PrismaUser & {
      profile?: PrismaUserProfile | null
      assignedPlans?: (PrismaTrainingPlan & {
        weeks?: (PrismaTrainingWeek & {
          days?: (PrismaTrainingDay & {
            events?: PrismaWorkoutSessionEvent
            exercises?: (PrismaTrainingExercise & {
              sets?: (PrismaExerciseSet & {
                log?: PrismaExerciseSetLog
              })[]
            })[]
          })[]
        })[]
      })[]
    },
    protected context: GQLContext,
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

  get phone() {
    return this.data.profile?.phone
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
    const plan = this.data.assignedPlans?.find((plan) => plan.active)
    if (!plan) return null

    return new TrainingPlan(plan, this.context)
  }

  get averageRating() {
    // TODO: Implement average rating
    return 4.3
  }

  get yearsOfExperience() {
    // TODO: Implement years of experience
    return 8
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
