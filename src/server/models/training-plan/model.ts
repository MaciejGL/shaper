import { differenceInCalendarDays } from 'date-fns'

import {
  GQLDifficulty,
  GQLFocusTag,
  GQLTargetGoal,
  GQLTrainingPlan,
} from '@/generated/graphql-server'
import {
  BaseExercise as PrismaBaseExercise,
  ExerciseSet as PrismaExerciseSet,
  ExerciseSetLog as PrismaExerciseSetLog,
  MuscleGroup as PrismaMuscleGroup,
  TrainingDay as PrismaTrainingDay,
  TrainingExercise as PrismaTrainingExercise,
  TrainingPlan as PrismaTrainingPlan,
  TrainingWeek as PrismaTrainingWeek,
  User as PrismaUser,
  WorkoutSessionEvent as PrismaWorkoutSessionEvent,
} from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

import Review from '../review/model'
import TrainingWeek from '../training-week/model'
import UserPublic from '../user-public/model'

export default class TrainingPlan implements GQLTrainingPlan {
  constructor(
    protected data: PrismaTrainingPlan & {
      createdBy?: PrismaUser
      weeks?: (PrismaTrainingWeek & {
        days?: (PrismaTrainingDay & {
          events?: PrismaWorkoutSessionEvent[]
          exercises?: (PrismaTrainingExercise & {
            substitutedBy?: PrismaTrainingExercise & {
              base?: PrismaBaseExercise & {
                muscleGroups: PrismaMuscleGroup[]
              }
              sets?: (PrismaExerciseSet & {
                log?: PrismaExerciseSetLog
              })[]
            }
            sets?: (PrismaExerciseSet & {
              log?: PrismaExerciseSetLog
            })[]
            base?: PrismaBaseExercise & {
              muscleGroups: PrismaMuscleGroup[]
            }
          })[]
        })[]
      })[]
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get title() {
    return this.data.title
  }

  get description() {
    return this.data.description
  }

  get isPublic() {
    return this.data.isPublic
  }

  get isTemplate() {
    return this.data.isTemplate
  }

  get isDraft() {
    return this.data.isDraft
  }

  get active() {
    return this.data.active
  }

  get premium() {
    return this.data.premium
  }

  get focusTags() {
    if (!this.data.focusTags || !Array.isArray(this.data.focusTags)) {
      return []
    }

    // The database values should match the GraphQL enum values directly
    return this.data.focusTags.filter((tag): tag is GQLFocusTag =>
      Object.values(GQLFocusTag).includes(tag as GQLFocusTag),
    )
  }

  get targetGoals() {
    if (!this.data.targetGoals || !Array.isArray(this.data.targetGoals)) {
      return []
    }

    // The database values should match the GraphQL enum values directly
    return this.data.targetGoals.filter((goal): goal is GQLTargetGoal =>
      Object.values(GQLTargetGoal).includes(goal as GQLTargetGoal),
    )
  }

  get startDate() {
    return this.data.startDate?.toISOString()
  }

  get endDate() {
    if (!this.data.startDate) {
      return null
    }

    const weeks = this.data.weeks ?? []
    const endDate = new Date(this.data.startDate)
    endDate.setDate(endDate.getDate() + weeks.length * 7 - 1)

    return endDate.toISOString()
  }

  get nextSession() {
    // TODO: Implement this
    return null
  }

  get lastSessionActivity() {
    const events = this.data.weeks?.flatMap((week) =>
      week.days?.flatMap((day) => day.events),
    )

    const latestEvent = events
      ?.sort(
        (a, b) => (a?.timestamp.getTime() ?? 0) - (b?.timestamp.getTime() ?? 0),
      )
      .at(-1)

    return latestEvent?.timestamp.toISOString()
  }

  get progress() {
    return this.calculateProgress()
  }

  async createdBy() {
    if (!this.data.createdBy) {
      return null
    }

    return new UserPublic(this.data.createdBy, this.context)
  }

  async assignedTo() {
    if (!this.data.assignedToId) return null
    const user = await this.context.loaders.user.userBasic.load(
      this.data.assignedToId,
    )
    return user ? new UserPublic(user, this.context) : null
  }

  async weekCount() {
    return this.context.loaders.plan.weekCountByPlanId.load(this.data.id)
  }

  async assignedCount() {
    const id = this.data.isTemplate ? this.data.id : this.data.templateId

    if (!id) {
      return 0
    }

    const count = await this.context.loaders.plan.assignedCountByPlanId.load(id)

    return count
  }

  async assignmentCount() {
    console.log(
      'assignmentCount',
      this.data.id,
      this.data.isTemplate,
      this.data.isPublic,
    )
    if (this.data.isTemplate && this.data.isPublic) {
      const count =
        await this.context.loaders.plan.assignmentCountByTemplateId.load(
          this.data.id,
        )

      return count
    }

    return 0
  }

  get isDemo() {
    return this.data.assignedToId !== this.context.user?.user.id
  }

  get currentWeekNumber() {
    // Calculate which week of the training plan the user should currently be on
    const startDate = this.data.startDate
    if (!startDate) {
      return null
    }

    const currentDate = new Date()
    const daysPassed = differenceInCalendarDays(currentDate, startDate)

    // If training hasn't started yet (negative days), return week 1
    if (daysPassed < 0) {
      return 1
    }

    // Calculate which week we're in (1-indexed)
    // Week 1: days 0-6, Week 2: days 7-13, etc.
    const currentWeekNumber = Math.floor(daysPassed / 7) + 1

    return currentWeekNumber
  }

  get completedWorkoutsDays() {
    const weeks = this.data.weeks ?? []
    const completedWorkoutsDays = weeks.reduce(
      (acc, week) =>
        acc + (week.days?.filter((day) => day.completedAt).length ?? 0),
      0,
    )
    return completedWorkoutsDays
  }

  get adherence() {
    const weeks = this.data.weeks ?? []
    const days = weeks
      .flatMap((week) => week.days)
      .filter(
        (day) => !day?.isRestDay && day?.exercises && day.exercises.length > 0,
      )
    const completedDays = days.filter((day) => day?.completedAt)

    // Prevent division by zero, which would return NaN and break GraphQL Float
    if (days.length === 0) {
      return 0
    }

    const adherence = Math.round((completedDays.length / days.length) * 100)
    return adherence
  }

  get totalWorkouts() {
    const weeks = this.data.weeks ?? []
    const totalWorkoutDays =
      weeks?.reduce(
        (acc, week) =>
          acc +
          (week.days?.filter((day) => !day.isRestDay && day.exercises?.length)
            ?.length ?? 0),
        0,
      ) ?? 0

    return totalWorkoutDays
  }

  get difficulty() {
    switch (this.data.difficulty) {
      case GQLDifficulty.Beginner:
        return GQLDifficulty.Beginner
      case GQLDifficulty.Intermediate:
        return GQLDifficulty.Intermediate
      case GQLDifficulty.Advanced:
        return GQLDifficulty.Advanced
      case GQLDifficulty.Expert:
        return GQLDifficulty.Expert
      default:
        return null
    }
  }

  async userReview() {
    if (!this.data.templateId) return null

    const reviews = await this.context.loaders.plan.reviewsByPlanId.load(
      this.data.templateId,
    )

    const userReview = reviews.find(
      (r) => r.createdById === this.context.user?.user.id,
    )

    return userReview ? new Review(userReview, this.context) : null
  }

  async rating() {
    if (!this.data.templateId) return 0

    const reviews = await this.context.loaders.plan.reviewsByPlanId.load(
      this.data.templateId,
    )

    // Prevent division by zero, which would return NaN and break GraphQL Float
    if (reviews.length === 0) {
      return 0
    }

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0)
    return totalRating / reviews.length
  }

  async totalReviews() {
    if (!this.data.templateId) return 0

    const reviews = await this.context.loaders.plan.reviewsByPlanId.load(
      this.data.templateId,
    )
    return reviews.length
  }

  async reviews() {
    if (!this.data.templateId) return []

    const reviews = await this.context.loaders.plan.reviewsByPlanId.load(
      this.data.templateId,
    )
    return reviews.map((review) => new Review(review, this.context))
  }

  get completedAt() {
    if (!this.data.completedAt) {
      return null
    }

    return this.data.completedAt.toISOString()
  }

  get createdAt() {
    return typeof this.data.createdAt === 'string'
      ? this.data.createdAt
      : this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return typeof this.data.updatedAt === 'string'
      ? this.data.updatedAt
      : this.data.updatedAt.toISOString()
  }

  async weeks() {
    const weeks =
      this.data.weeks ??
      (await this.context.loaders.plan.weeksByPlanId.load(this.data.id))
    return weeks.map((week) => new TrainingWeek(week, this.context))
  }

  private calculateProgress() {
    const totalDays =
      this.data.weeks?.reduce(
        (acc, week) => acc + (week.days?.length ?? 0),
        0,
      ) ?? 0
    const completedDays =
      this.data.weeks?.reduce(
        (acc, week) =>
          acc + (week.days?.filter((day) => day.completedAt).length ?? 0),
        0,
      ) ?? 0

    // Prevent division by zero, which would return NaN and break GraphQL Float
    if (totalDays === 0) {
      return 0
    }

    return Math.round((completedDays / totalDays) * 100)
  }

  get sessionsPerWeek() {
    // Calculate sessions per week based on the plan structure
    if (!this.data.weeks || this.data.weeks.length === 0) return null

    const totalSessions = this.data.weeks.reduce((total, week) => {
      return total + (week.days?.length || 0)
    }, 0)

    return Math.round(totalSessions / this.data.weeks.length)
  }

  get avgSessionTime() {
    // Calculate based on: Exercises 45s, rest time, and warmups each 45s + 60s times number of exercises. Calculate for each day in a week 1 and take average
    if (!this.data.weeks || this.data.weeks.length === 0) return null

    const firstWeek = this.data.weeks[0]
    if (!firstWeek?.days || firstWeek.days.length === 0) return null

    const dayTimes: number[] = []

    firstWeek.days.forEach((day) => {
      if (day.isRestDay || !day.exercises || day.exercises.length === 0) {
        return // Skip rest days
      }

      let totalTimeSeconds = 0
      const exerciseCount = day.exercises.length

      day.exercises.forEach((exercise) => {
        // Exercise execution time: 45 seconds per set
        const setCount = exercise.sets?.length || 1
        const exerciseTime = setCount * 45

        // Rest time between sets (from exercise.restSeconds)
        const restTime = exercise.restSeconds || 60 // Default 60s rest
        const totalRestTime = (setCount - 1) * restTime // Rest between sets only

        // Warmup time: 45 seconds (assuming one warmup per exercise)
        const warmupTime = (exercise.warmupSets ?? 0) > 0 ? 45 : 0

        totalTimeSeconds += exerciseTime + totalRestTime + warmupTime
      })

      // Add base time: 60s times number of exercises
      totalTimeSeconds += exerciseCount * 60

      // Convert to minutes and add to day times
      dayTimes.push(Math.round(totalTimeSeconds / 60))
    })

    // Return average time across training days in week 1
    if (dayTimes.length === 0) return null
    return Math.round(
      dayTimes.reduce((sum, time) => sum + time, 0) / dayTimes.length,
    )
  }

  get equipment() {
    if (!this.data.weeks) return []

    const equipmentSet = new Set<string>()

    this.data.weeks.forEach((week) => {
      week.days?.forEach((day) => {
        day.exercises?.forEach((exercise) => {
          if (exercise.base?.equipment) {
            equipmentSet.add(exercise.base.equipment)
          }
        })
      })
    })

    return Array.from(equipmentSet)
  }
}
