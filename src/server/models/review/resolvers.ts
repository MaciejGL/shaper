import {
  GQLMutationResolvers,
  GQLQueryResolvers,
  GQLUserRole,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

export const Query: GQLQueryResolvers = {}

export const Mutation: GQLMutationResolvers = {
  async createReview(_, { input }, context) {
    const userId = context.user?.user.id

    if (!userId) throw new Error('Unauthorized')

    const { trainingPlanId, rating, comment } = input

    const template = await prisma.trainingPlan.findUnique({
      where: { assignedToId: userId, id: trainingPlanId },
      select: {
        templateId: true,
      },
    })

    if (!template?.templateId) throw new Error('Training plan not found')

    await prisma.review.create({
      data: {
        trainingPlanId: template.templateId,
        createdById: userId,
        rating,
        comment,
      },
    })

    return true
  },

  async updateReview(_, { input }, context) {
    const userId = context.user?.user.id
    if (!userId) throw new Error('Unauthorized')

    const existing = await prisma.review.findUnique({
      where: { id: input.reviewId },
    })

    if (!existing) throw new Error('Review not found')
    if (existing.createdById !== userId) {
      throw new Error('You can only edit your own reviews')
    }

    await prisma.review.update({
      where: { id: input.reviewId },
      data: {
        rating: input.rating ?? existing.rating,
        comment: input.comment ?? existing.comment,
        isEdited: true,
      },
    })

    return true
  },

  async deleteReview(_, { input }, context) {
    const userId = context.user?.user.id
    if (!userId) throw new Error('Unauthorized')

    const existing = await prisma.review.findUnique({
      where: { id: input.reviewId },
    })

    if (!existing) throw new Error('Review not found')
    if (existing.createdById !== userId) {
      throw new Error('You can only delete your own reviews')
    }

    await prisma.review.delete({
      where: { id: input.reviewId },
    })

    return true
  },

  async moderateReview(_, { input }, context) {
    const userId = context.user?.user.id
    if (!userId) throw new Error('Unauthorized')
    if (context.user?.user.role !== GQLUserRole.Admin) {
      throw new Error('Only admins can moderate reviews')
    }

    await prisma.review.update({
      where: { id: input.reviewId },
      data: {
        isHidden: input.isHidden ?? undefined,
        flagged: input.flagged ?? undefined,
        flagReason: input.flagReason ?? undefined,
      },
      include: {
        createdBy: {},
      },
    })

    return true
  },
}
