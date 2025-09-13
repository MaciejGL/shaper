import {
  GQLMutationAddExerciseToDayArgs,
  GQLMutationAddSetToExerciseArgs,
  GQLMutationAddTrainingWeekArgs,
  GQLMutationDuplicateTrainingWeekArgs,
  GQLMutationMoveExerciseArgs,
  GQLMutationRemoveAllExercisesFromDayArgs,
  GQLMutationRemoveExerciseFromDayArgs,
  GQLMutationRemoveSetFromExerciseArgs,
  GQLMutationRemoveTrainingWeekArgs,
  GQLMutationResolvers,
  GQLMutationUpdateExerciseSetArgs,
  GQLMutationUpdateTrainingDayDataArgs,
  GQLMutationUpdateTrainingExerciseArgs,
  GQLMutationUpdateTrainingPlanDetailsArgs,
  GQLMutationUpdateTrainingWeekDetailsArgs,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  activatePlan,
  assignTemplateToSelf,
  assignTrainingPlanToClient,
  closePlan,
  createDraftTemplate,
  createTrainingPlan,
  deletePlan,
  deleteTrainingPlan,
  duplicateTrainingPlan,
  extendPlan,
  getActivePlanId,
  getClientActivePlan,
  getClientTrainingPlans,
  getMyPlansOverview,
  getMyPlansOverviewFull,
  getMyPlansOverviewLite,
  getPublicTrainingPlans,
  getTemplates,
  getTrainingPlanById,
  getWorkoutDay,
  getWorkoutNavigation,
  pausePlan,
  removeTrainingPlanFromClient,
  removeWeek,
  updateTrainingPlan,
} from './factory'
import {
  addExerciseToDay,
  addSetToExercise,
  addTrainingWeek,
  duplicateTrainingWeek,
  getQuickWorkoutPlan,
  moveExercise,
  removeAllExercisesFromDay,
  removeExerciseFromDay,
  removeSetFromExercise,
  removeTrainingWeek,
  updateExerciseSet,
  updateTrainingDayData,
  updateTrainingExercise,
  updateTrainingPlanDetails,
  updateTrainingWeekDetails,
} from './factory-updates'

export const Query: GQLQueryResolvers<GQLContext> = {
  getTrainingPlanById: async (_, args, context) => {
    return getTrainingPlanById(args, context)
  },
  getTemplates: async (_, args, context) => {
    return getTemplates(args, context)
  },
  getPublicTrainingPlans: async (_, args, context) => {
    return getPublicTrainingPlans(args, context)
  },
  getClientTrainingPlans: async (_, args, context) => {
    return getClientTrainingPlans(args, context)
  },
  getClientActivePlan: async (_, args, context) => {
    return getClientActivePlan(args, context)
  },
  getMyPlansOverview: async (_, __, context) => {
    return getMyPlansOverview(context)
  },
  getMyPlansOverviewLite: async (_, __, context) => {
    return getMyPlansOverviewLite(context)
  },
  getMyPlansOverviewFull: async (_, __, context) => {
    return getMyPlansOverviewFull(context)
  },
  getActivePlanId: async (_, __, context) => {
    return getActivePlanId(context)
  },
  getQuickWorkoutPlan: async (_, __, context) => {
    return getQuickWorkoutPlan(context)
  },
  getWorkoutNavigation: async (_, args, context) => {
    return getWorkoutNavigation(args, context)
  },
  getWorkoutDay: async (_, args, context) => {
    return getWorkoutDay(args, context)
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createTrainingPlan: async (_, args, context) => {
    return createTrainingPlan(args, context)
  },
  createDraftTemplate: async (_, __, context) => {
    return createDraftTemplate(context)
  },
  updateTrainingPlan: async (_, args, context) => {
    return updateTrainingPlan(args, context)
  },
  deleteTrainingPlan: async (_, args, context) => {
    return deleteTrainingPlan(args, context)
  },
  duplicateTrainingPlan: async (_, args, context) => {
    return duplicateTrainingPlan(args, context)
  },
  assignTrainingPlanToClient: async (_, args, context) => {
    return assignTrainingPlanToClient(args, context)
  },
  assignTemplateToSelf: async (_, args, context) => {
    return assignTemplateToSelf(args, context)
  },
  removeTrainingPlanFromClient: async (_, args, context) => {
    return removeTrainingPlanFromClient(args, context)
  },
  activatePlan: async (_, args, context) => {
    return activatePlan(args, context)
  },
  pausePlan: async (_, args, context) => {
    return pausePlan(args, context)
  },
  closePlan: async (_, args, context) => {
    return closePlan(args, context)
  },
  deletePlan: async (_, args, context) => {
    return deletePlan(args, context)
  },
  extendPlan: async (_, args) => {
    return extendPlan(args)
  },
  removeWeek: async (_, args, context) => {
    return removeWeek(args, context)
  },

  // Granular update mutations - more efficient than full plan updates
  updateTrainingPlanDetails: (
    _,
    { input }: GQLMutationUpdateTrainingPlanDetailsArgs,
    context,
  ) => {
    return updateTrainingPlanDetails(input, context)
  },

  updateTrainingWeekDetails: (
    _,
    { input }: GQLMutationUpdateTrainingWeekDetailsArgs,
    context,
  ) => {
    return updateTrainingWeekDetails(input, context)
  },

  duplicateTrainingWeek: (
    _,
    { input }: GQLMutationDuplicateTrainingWeekArgs,
    context,
  ) => {
    return duplicateTrainingWeek(input, context)
  },

  removeTrainingWeek: (
    _,
    { weekId }: GQLMutationRemoveTrainingWeekArgs,
    context,
  ) => {
    return removeTrainingWeek(weekId, context)
  },

  addTrainingWeek: (_, { input }: GQLMutationAddTrainingWeekArgs, context) => {
    return addTrainingWeek(input, context)
  },

  updateTrainingDayData: (
    _,
    { input }: GQLMutationUpdateTrainingDayDataArgs,
    context,
  ) => {
    return updateTrainingDayData(input, context)
  },

  updateTrainingExercise: (
    _,
    { input }: GQLMutationUpdateTrainingExerciseArgs,
    context,
  ) => {
    return updateTrainingExercise(input, context)
  },

  updateExerciseSet: (
    _,
    { input }: GQLMutationUpdateExerciseSetArgs,
    context,
  ) => {
    return updateExerciseSet(input, context)
  },

  addExerciseToDay: (
    _,
    { input }: GQLMutationAddExerciseToDayArgs,
    context,
  ) => {
    return addExerciseToDay(input, context)
  },

  removeExerciseFromDay: (
    _,
    { exerciseId }: GQLMutationRemoveExerciseFromDayArgs,
    context,
  ) => {
    return removeExerciseFromDay(exerciseId, context)
  },

  removeAllExercisesFromDay: (
    _,
    { input }: GQLMutationRemoveAllExercisesFromDayArgs,
    context,
  ) => {
    return removeAllExercisesFromDay(input, context)
  },

  moveExercise: (_, { input }: GQLMutationMoveExerciseArgs, context) => {
    return moveExercise(input, context)
  },

  addSetToExercise: (
    _,
    { input }: GQLMutationAddSetToExerciseArgs,
    context,
  ) => {
    return addSetToExercise(input, context)
  },

  removeSetFromExercise: (
    _,
    { setId }: GQLMutationRemoveSetFromExerciseArgs,
    context,
  ) => {
    return removeSetFromExercise(setId, context)
  },
}
