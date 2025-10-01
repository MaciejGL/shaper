import {
  GQLCheckinCompletion,
  GQLCheckinFrequency,
  GQLCheckinSchedule,
} from '@/generated/graphql-server'
import {
  BodyProgressLog as PrismaBodyProgressLog,
  CheckinCompletion as PrismaCheckinCompletion,
  CheckinSchedule as PrismaCheckinSchedule,
  UserBodyMeasure as PrismaUserBodyMeasure,
} from '@/generated/prisma/client'

import BodyProgressLog from '../body-progress-log/model'
import UserBodyMeasure from '../user-body-measure/model'

export class CheckinSchedule implements GQLCheckinSchedule {
  constructor(
    protected data: PrismaCheckinSchedule & {
      completions?: (PrismaCheckinCompletion & {
        measurement?: PrismaUserBodyMeasure | null
        progressLog?: PrismaBodyProgressLog | null
      })[]
    },
  ) {}

  get id() {
    return this.data.id
  }

  get frequency() {
    return this.data.frequency as GQLCheckinFrequency
  }

  get dayOfWeek() {
    return this.data.dayOfWeek
  }

  get dayOfMonth() {
    return this.data.dayOfMonth
  }

  get isActive() {
    return this.data.isActive
  }

  get nextCheckinDate() {
    // This will be computed in the resolver
    return null
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  get completions() {
    return (this.data.completions || []).map(
      (completion) => new CheckinCompletion(completion),
    )
  }
}

export class CheckinCompletion implements GQLCheckinCompletion {
  constructor(
    protected data: PrismaCheckinCompletion & {
      measurement?: PrismaUserBodyMeasure | null
      progressLog?: PrismaBodyProgressLog | null
    },
  ) {}

  get id() {
    return this.data.id
  }

  get completedAt() {
    return this.data.completedAt.toISOString()
  }

  get measurement() {
    return this.data.measurement
      ? new UserBodyMeasure(this.data.measurement)
      : null
  }

  get progressLog() {
    return this.data.progressLog
      ? new BodyProgressLog(this.data.progressLog)
      : null
  }
}

export default CheckinSchedule
