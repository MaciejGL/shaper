import { GraphQLResolveInfo } from 'graphql';
import { GQLContext } from '@/types/gql-context';
export type Maybe<T> = T | undefined | null;
export type InputMaybe<T> = T | undefined | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
export type EntireFieldWrapper<T> = T | (() => Promise<T>) | (() => T);
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

export enum GQLActivityLevel {
  Active = 'ACTIVE',
  Athlete = 'ATHLETE',
  Light = 'LIGHT',
  Moderate = 'MODERATE',
  Sedentary = 'SEDENTARY'
}

export type GQLAddAiExerciseToWorkoutInput = {
  dayId: Scalars['ID']['input'];
  exerciseId: Scalars['ID']['input'];
  sets: Array<InputMaybe<GQLSuggestedSetsInput>>;
};

export type GQLAddBodyMeasurementInput = {
  bicepsLeft?: InputMaybe<Scalars['Float']['input']>;
  bicepsRight?: InputMaybe<Scalars['Float']['input']>;
  bodyFat?: InputMaybe<Scalars['Float']['input']>;
  calfLeft?: InputMaybe<Scalars['Float']['input']>;
  calfRight?: InputMaybe<Scalars['Float']['input']>;
  chest?: InputMaybe<Scalars['Float']['input']>;
  hips?: InputMaybe<Scalars['Float']['input']>;
  measuredAt?: InputMaybe<Scalars['String']['input']>;
  neck?: InputMaybe<Scalars['Float']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  thighLeft?: InputMaybe<Scalars['Float']['input']>;
  thighRight?: InputMaybe<Scalars['Float']['input']>;
  waist?: InputMaybe<Scalars['Float']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLAddCustomFoodToMealInput = {
  caloriesPer100g?: InputMaybe<Scalars['Float']['input']>;
  carbsPer100g?: InputMaybe<Scalars['Float']['input']>;
  fatPer100g?: InputMaybe<Scalars['Float']['input']>;
  fiberPer100g?: InputMaybe<Scalars['Float']['input']>;
  loggedAt?: InputMaybe<Scalars['String']['input']>;
  mealId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  openFoodFactsId?: InputMaybe<Scalars['String']['input']>;
  productData?: InputMaybe<Scalars['String']['input']>;
  proteinPer100g?: InputMaybe<Scalars['Float']['input']>;
  quantity: Scalars['Float']['input'];
  unit: Scalars['String']['input'];
};

export type GQLAddExerciseToDayInput = {
  additionalInstructions?: InputMaybe<Scalars['String']['input']>;
  baseId?: InputMaybe<Scalars['ID']['input']>;
  dayId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<Scalars['String']['input']>;
  instructions?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  order: Scalars['Int']['input'];
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  tempo?: InputMaybe<Scalars['String']['input']>;
  tips?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<GQLExerciseType>;
  warmupSets?: InputMaybe<Scalars['Int']['input']>;
};

export type GQLAddExercisesToWorkoutInput = {
  exerciseIds: Array<Scalars['ID']['input']>;
  workoutId: Scalars['ID']['input'];
};

export type GQLAddFoodToPersonalLogInput = {
  caloriesPer100g?: InputMaybe<Scalars['Float']['input']>;
  carbsPer100g?: InputMaybe<Scalars['Float']['input']>;
  dayOfWeek: Scalars['Int']['input'];
  fatPer100g?: InputMaybe<Scalars['Float']['input']>;
  fiberPer100g?: InputMaybe<Scalars['Float']['input']>;
  loggedAt?: InputMaybe<Scalars['String']['input']>;
  mealName: Scalars['String']['input'];
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  openFoodFactsId?: InputMaybe<Scalars['String']['input']>;
  productData?: InputMaybe<Scalars['String']['input']>;
  proteinPer100g?: InputMaybe<Scalars['Float']['input']>;
  quantity: Scalars['Float']['input'];
  unit: Scalars['String']['input'];
};

export type GQLAddMealPlanCollaboratorInput = {
  collaboratorEmail: Scalars['String']['input'];
  mealPlanId: Scalars['ID']['input'];
  permission: GQLCollaborationPermission;
};

export type GQLAddSetExerciseFormInput = {
  exerciseId: Scalars['ID']['input'];
  set: GQLAddSetExerciseFormSetInput;
};

export type GQLAddSetExerciseFormSetInput = {
  maxReps?: InputMaybe<Scalars['Int']['input']>;
  minReps?: InputMaybe<Scalars['Int']['input']>;
  rpe?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLAddSetToExerciseInput = {
  exerciseId: Scalars['ID']['input'];
  maxReps?: InputMaybe<Scalars['Int']['input']>;
  minReps?: InputMaybe<Scalars['Int']['input']>;
  order: Scalars['Int']['input'];
  reps?: InputMaybe<Scalars['Int']['input']>;
  rpe?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLAddSubstituteExerciseInput = {
  originalId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  substituteId: Scalars['ID']['input'];
};

export type GQLAddTrainingPlanCollaboratorInput = {
  collaboratorEmail: Scalars['String']['input'];
  permission: GQLCollaborationPermission;
  trainingPlanId: Scalars['ID']['input'];
};

export type GQLAddTrainingWeekInput = {
  trainingPlanId: Scalars['ID']['input'];
  weekNumber: Scalars['Int']['input'];
};

export type GQLAdminUserFilters = {
  dateFrom?: InputMaybe<Scalars['String']['input']>;
  dateTo?: InputMaybe<Scalars['String']['input']>;
  hasProfile?: InputMaybe<Scalars['Boolean']['input']>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<GQLUserRole>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type GQLAdminUserListItem = {
  __typename?: 'AdminUserListItem';
  clientCount: EntireFieldWrapper<Scalars['Int']['output']>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  email: EntireFieldWrapper<Scalars['String']['output']>;
  featured: EntireFieldWrapper<Scalars['Boolean']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isActive: EntireFieldWrapper<Scalars['Boolean']['output']>;
  lastLoginAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  name?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  profile?: EntireFieldWrapper<Maybe<GQLUserProfile>>;
  role: EntireFieldWrapper<GQLUserRole>;
  sessionCount: EntireFieldWrapper<Scalars['Int']['output']>;
  trainer?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLAdminUserListResponse = {
  __typename?: 'AdminUserListResponse';
  hasMore: EntireFieldWrapper<Scalars['Boolean']['output']>;
  total: EntireFieldWrapper<Scalars['Int']['output']>;
  users: EntireFieldWrapper<Array<GQLAdminUserListItem>>;
};

export type GQLAdminUserStats = {
  __typename?: 'AdminUserStats';
  activeUsers: EntireFieldWrapper<Scalars['Int']['output']>;
  inactiveUsers: EntireFieldWrapper<Scalars['Int']['output']>;
  recentSignups: EntireFieldWrapper<Scalars['Int']['output']>;
  totalAdmins: EntireFieldWrapper<Scalars['Int']['output']>;
  totalClients: EntireFieldWrapper<Scalars['Int']['output']>;
  totalTrainers: EntireFieldWrapper<Scalars['Int']['output']>;
  totalUsers: EntireFieldWrapper<Scalars['Int']['output']>;
  usersWithoutProfiles: EntireFieldWrapper<Scalars['Int']['output']>;
};

export type GQLAiExerciseSuggestion = {
  __typename?: 'AiExerciseSuggestion';
  aiMeta: EntireFieldWrapper<GQLAiMeta>;
  exercise: EntireFieldWrapper<GQLBaseExercise>;
  sets: EntireFieldWrapper<Array<Maybe<GQLSuggestedSets>>>;
};

export type GQLAiMeta = {
  __typename?: 'AiMeta';
  explanation: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLAiWorkoutExercise = {
  __typename?: 'AiWorkoutExercise';
  exercise: EntireFieldWrapper<GQLBaseExercise>;
  order: EntireFieldWrapper<Scalars['Int']['output']>;
  sets: EntireFieldWrapper<Array<Maybe<GQLSuggestedSets>>>;
};

export type GQLAiWorkoutResult = {
  __typename?: 'AiWorkoutResult';
  exercises: EntireFieldWrapper<Array<GQLAiWorkoutExercise>>;
  totalDuration?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
};

export type GQLAssignMealPlanToClientInput = {
  clientId: Scalars['ID']['input'];
  planId: Scalars['ID']['input'];
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type GQLAssignTrainingPlanToClientInput = {
  clientId: Scalars['ID']['input'];
  planId: Scalars['ID']['input'];
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type GQLAvailablePlan = {
  __typename?: 'AvailablePlan';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isTemplate: EntireFieldWrapper<Scalars['Boolean']['output']>;
  planType: EntireFieldWrapper<Scalars['String']['output']>;
  title: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLBaseExercise = {
  __typename?: 'BaseExercise';
  additionalInstructions?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  canBeSubstitutedBy: EntireFieldWrapper<Array<GQLBaseExerciseSubstitute>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  createdBy?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  difficulty?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  equipment?: EntireFieldWrapper<Maybe<GQLEquipment>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  images: EntireFieldWrapper<Array<GQLImage>>;
  instructions: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  isPremium: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isPublic: EntireFieldWrapper<Scalars['Boolean']['output']>;
  muscleGroupCategories: EntireFieldWrapper<Array<GQLMuscleGroupCategory>>;
  muscleGroups: EntireFieldWrapper<Array<GQLMuscleGroup>>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  secondaryMuscleGroups: EntireFieldWrapper<Array<GQLMuscleGroup>>;
  substitutes: EntireFieldWrapper<Array<GQLBaseExerciseSubstitute>>;
  tips: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  type?: EntireFieldWrapper<Maybe<GQLExerciseType>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  version: EntireFieldWrapper<Scalars['Int']['output']>;
  videoUrl?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
};

export type GQLBaseExerciseSubstitute = {
  __typename?: 'BaseExerciseSubstitute';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  original: EntireFieldWrapper<GQLBaseExercise>;
  originalId: EntireFieldWrapper<Scalars['ID']['output']>;
  reason?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  substitute: EntireFieldWrapper<GQLBaseExercise>;
  substituteId: EntireFieldWrapper<Scalars['ID']['output']>;
};

export type GQLBatchLogMealFoodInput = {
  foods: Array<GQLBatchLogMealFoodItemInput>;
  loggedAt?: InputMaybe<Scalars['String']['input']>;
  mealId: Scalars['ID']['input'];
};

export type GQLBatchLogMealFoodItemInput = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  calories?: InputMaybe<Scalars['Float']['input']>;
  carbs?: InputMaybe<Scalars['Float']['input']>;
  fat?: InputMaybe<Scalars['Float']['input']>;
  fiber?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  openFoodFactsId?: InputMaybe<Scalars['String']['input']>;
  productData?: InputMaybe<Scalars['String']['input']>;
  protein?: InputMaybe<Scalars['Float']['input']>;
  quantity: Scalars['Float']['input'];
  unit: Scalars['String']['input'];
};

export type GQLBulkUpdatePlanPermissionsInput = {
  planUpdates: Array<GQLPlanPermissionUpdateInput>;
  userId: Scalars['ID']['input'];
};

export type GQLCoachingRequest = {
  __typename?: 'CoachingRequest';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  message?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  recipient: EntireFieldWrapper<GQLUser>;
  sender: EntireFieldWrapper<GQLUser>;
  status: EntireFieldWrapper<GQLCoachingRequestStatus>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export enum GQLCoachingRequestStatus {
  Accepted = 'ACCEPTED',
  Cancelled = 'CANCELLED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type GQLCollaborationInvitation = {
  __typename?: 'CollaborationInvitation';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  message?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  recipient: EntireFieldWrapper<GQLUserPublic>;
  sender: EntireFieldWrapper<GQLUserPublic>;
  status: EntireFieldWrapper<GQLCollaborationInvitationStatus>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export enum GQLCollaborationInvitationAction {
  Accept = 'ACCEPT',
  Reject = 'REJECT'
}

export enum GQLCollaborationInvitationStatus {
  Accepted = 'ACCEPTED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export enum GQLCollaborationPermission {
  Admin = 'ADMIN',
  Edit = 'EDIT',
  View = 'VIEW'
}

export type GQLCopyExercisesFromDayInput = {
  sourceDayId: Scalars['ID']['input'];
  targetDayId: Scalars['ID']['input'];
};

export type GQLCreateExerciseInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  equipment?: InputMaybe<GQLEquipment>;
  imageUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  muscleGroups: Array<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  secondaryMuscleGroups?: InputMaybe<Array<Scalars['ID']['input']>>;
  substituteIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  videoUrl?: InputMaybe<Scalars['String']['input']>;
};

export type GQLCreateExerciseNoteInput = {
  exerciseId: Scalars['String']['input'];
  note: Scalars['String']['input'];
  shareWithClient?: InputMaybe<Scalars['Boolean']['input']>;
  shareWithTrainer?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GQLCreateExerciseSetInput = {
  maxReps?: InputMaybe<Scalars['Int']['input']>;
  minReps?: InputMaybe<Scalars['Int']['input']>;
  order: Scalars['Int']['input'];
  reps?: InputMaybe<Scalars['Int']['input']>;
  rpe?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLCreateFavouriteWorkoutExerciseInput = {
  additionalInstructions?: InputMaybe<Scalars['String']['input']>;
  baseId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<Scalars['String']['input']>;
  instructions?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  order: Scalars['Int']['input'];
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  sets: Array<GQLCreateFavouriteWorkoutSetInput>;
  tips?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type GQLCreateFavouriteWorkoutInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  exercises: Array<GQLCreateFavouriteWorkoutExerciseInput>;
  title: Scalars['String']['input'];
};

export type GQLCreateFavouriteWorkoutSetInput = {
  maxReps?: InputMaybe<Scalars['Int']['input']>;
  minReps?: InputMaybe<Scalars['Int']['input']>;
  order: Scalars['Int']['input'];
  reps?: InputMaybe<Scalars['Int']['input']>;
  rpe?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLCreateMealDayInput = {
  dayOfWeek: Scalars['Int']['input'];
  meals?: InputMaybe<Array<GQLCreateMealInput>>;
  targetCalories?: InputMaybe<Scalars['Float']['input']>;
  targetCarbs?: InputMaybe<Scalars['Float']['input']>;
  targetFat?: InputMaybe<Scalars['Float']['input']>;
  targetProtein?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLCreateMealFoodInput = {
  caloriesPer100g?: InputMaybe<Scalars['Float']['input']>;
  carbsPer100g?: InputMaybe<Scalars['Float']['input']>;
  fatPer100g?: InputMaybe<Scalars['Float']['input']>;
  fiberPer100g?: InputMaybe<Scalars['Float']['input']>;
  name: Scalars['String']['input'];
  openFoodFactsId?: InputMaybe<Scalars['String']['input']>;
  productData?: InputMaybe<Scalars['String']['input']>;
  proteinPer100g?: InputMaybe<Scalars['Float']['input']>;
  quantity: Scalars['Float']['input'];
  unit: Scalars['String']['input'];
};

export type GQLCreateMealInput = {
  dateTime: Scalars['String']['input'];
  foods?: InputMaybe<Array<GQLCreateMealFoodInput>>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type GQLCreateMealPlanInput = {
  dailyCalories?: InputMaybe<Scalars['Float']['input']>;
  dailyCarbs?: InputMaybe<Scalars['Float']['input']>;
  dailyFat?: InputMaybe<Scalars['Float']['input']>;
  dailyProtein?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  title: Scalars['String']['input'];
  weeks?: InputMaybe<Array<GQLCreateMealWeekInput>>;
};

export type GQLCreateMealPlanPayload = {
  __typename?: 'CreateMealPlanPayload';
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  success: EntireFieldWrapper<Scalars['Boolean']['output']>;
};

export type GQLCreateMealWeekInput = {
  days?: InputMaybe<Array<GQLCreateMealDayInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  weekNumber: Scalars['Int']['input'];
};

export type GQLCreateNoteInput = {
  note: Scalars['String']['input'];
  relatedTo?: InputMaybe<Scalars['ID']['input']>;
  shareWithClient?: InputMaybe<Scalars['Boolean']['input']>;
  shareWithTrainer?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GQLCreateNoteReplyInput = {
  parentNoteId: Scalars['String']['input'];
  text: Scalars['String']['input'];
};

export type GQLCreateNotificationInput = {
  createdBy?: InputMaybe<Scalars['ID']['input']>;
  link?: InputMaybe<Scalars['String']['input']>;
  message: Scalars['String']['input'];
  relatedItemId?: InputMaybe<Scalars['String']['input']>;
  type: GQLNotificationType;
  userId: Scalars['ID']['input'];
};

export type GQLCreatePushSubscriptionInput = {
  auth: Scalars['String']['input'];
  endpoint: Scalars['String']['input'];
  p256dh: Scalars['String']['input'];
  userAgent?: InputMaybe<Scalars['String']['input']>;
};

export type GQLCreateQuickWorkoutInput = {
  exercises: Array<GQLQuickWorkoutExerciseInput>;
  replaceExisting: Scalars['Boolean']['input'];
};

export type GQLCreateReviewInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  rating: Scalars['Int']['input'];
  trainingPlanId: Scalars['ID']['input'];
};

export type GQLCreateTrainerNoteForClientInput = {
  clientId: Scalars['String']['input'];
  exerciseId: Scalars['String']['input'];
  note: Scalars['String']['input'];
  shareWithClient?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GQLCreateTrainingDayInput = {
  dayOfWeek: Scalars['Int']['input'];
  exercises?: InputMaybe<Array<GQLCreateTrainingExerciseInput>>;
  isRestDay: Scalars['Boolean']['input'];
  workoutType?: InputMaybe<Scalars['String']['input']>;
};

export type GQLCreateTrainingExerciseInput = {
  additionalInstructions?: InputMaybe<Scalars['String']['input']>;
  baseId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<Scalars['String']['input']>;
  instructions?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  order: Scalars['Int']['input'];
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  sets?: InputMaybe<Array<GQLCreateExerciseSetInput>>;
  tempo?: InputMaybe<Scalars['String']['input']>;
  tips?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<GQLExerciseType>;
  videoUrl?: InputMaybe<Scalars['String']['input']>;
  warmupSets?: InputMaybe<Scalars['Int']['input']>;
};

export type GQLCreateTrainingPlanInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<GQLDifficulty>;
  focusTags?: InputMaybe<Array<GQLFocusTag>>;
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  premium?: InputMaybe<Scalars['Boolean']['input']>;
  targetGoals?: InputMaybe<Array<GQLTargetGoal>>;
  title: Scalars['String']['input'];
  weeks?: InputMaybe<Array<GQLCreateTrainingWeekInput>>;
};

export type GQLCreateTrainingPlanPayload = {
  __typename?: 'CreateTrainingPlanPayload';
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  success: EntireFieldWrapper<Scalars['Boolean']['output']>;
};

export type GQLCreateTrainingWeekInput = {
  days?: InputMaybe<Array<GQLCreateTrainingDayInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  weekNumber: Scalars['Int']['input'];
};

export type GQLCurrentWorkoutWeekPayload = {
  __typename?: 'CurrentWorkoutWeekPayload';
  currentWeekIndex: EntireFieldWrapper<Scalars['Int']['output']>;
  plan?: EntireFieldWrapper<Maybe<GQLTrainingPlan>>;
  totalWeeks: EntireFieldWrapper<Scalars['Int']['output']>;
};

export type GQLDeleteReviewInput = {
  reviewId: Scalars['ID']['input'];
};

export enum GQLDeliveryStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  Pending = 'PENDING'
}

export enum GQLDifficulty {
  Advanced = 'ADVANCED',
  Beginner = 'BEGINNER',
  Expert = 'EXPERT',
  Intermediate = 'INTERMEDIATE'
}

export type GQLDuplicateTrainingWeekInput = {
  trainingPlanId: Scalars['ID']['input'];
  weekId: Scalars['ID']['input'];
};

export enum GQLEquipment {
  Band = 'BAND',
  Barbell = 'BARBELL',
  Bench = 'BENCH',
  Bodyweight = 'BODYWEIGHT',
  Cable = 'CABLE',
  Dumbbell = 'DUMBBELL',
  EzBar = 'EZ_BAR',
  Kettlebell = 'KETTLEBELL',
  Machine = 'MACHINE',
  Other = 'OTHER',
  SmithMachine = 'SMITH_MACHINE',
  TrapBar = 'TRAP_BAR'
}

export type GQLExerciseLog = {
  __typename?: 'ExerciseLog';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  exerciseId: EntireFieldWrapper<Scalars['ID']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  notes?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  performedAt: EntireFieldWrapper<Scalars['String']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLExerciseProgress = {
  __typename?: 'ExerciseProgress';
  averageRpe?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  baseExercise?: EntireFieldWrapper<Maybe<GQLBaseExercise>>;
  estimated1RMProgress: EntireFieldWrapper<Array<GQLOneRmEntry>>;
  lastPerformed?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  totalSets?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  totalVolumeProgress: EntireFieldWrapper<Array<GQLVolumeEntry>>;
};

export type GQLExerciseSet = {
  __typename?: 'ExerciseSet';
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  exerciseId: EntireFieldWrapper<Scalars['ID']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isExtra: EntireFieldWrapper<Scalars['Boolean']['output']>;
  log?: EntireFieldWrapper<Maybe<GQLExerciseSetLog>>;
  maxReps?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  minReps?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  order: EntireFieldWrapper<Scalars['Int']['output']>;
  reps?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  rpe?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  weight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
};

export type GQLExerciseSetLog = {
  __typename?: 'ExerciseSetLog';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  reps?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  rpe?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  weight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
};

export enum GQLExerciseType {
  Cardio = 'CARDIO',
  Dropset = 'DROPSET',
  Superset_1A = 'SUPERSET_1A',
  Superset_1B = 'SUPERSET_1B'
}

export type GQLExerciseWhereInput = {
  equipment?: InputMaybe<GQLEquipment>;
  muscleGroups?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type GQLFavouriteWorkout = {
  __typename?: 'FavouriteWorkout';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  createdById: EntireFieldWrapper<Scalars['ID']['output']>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  exercises: EntireFieldWrapper<Array<GQLFavouriteWorkoutExercise>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  title: EntireFieldWrapper<Scalars['String']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLFavouriteWorkoutExercise = {
  __typename?: 'FavouriteWorkoutExercise';
  additionalInstructions?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  base?: EntireFieldWrapper<Maybe<GQLBaseExercise>>;
  baseId?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  difficulty?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  favouriteWorkoutId: EntireFieldWrapper<Scalars['ID']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  instructions?: EntireFieldWrapper<Maybe<Array<Scalars['String']['output']>>>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  order: EntireFieldWrapper<Scalars['Int']['output']>;
  restSeconds?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  sets: EntireFieldWrapper<Array<GQLFavouriteWorkoutSet>>;
  tips?: EntireFieldWrapper<Maybe<Array<Scalars['String']['output']>>>;
};

export type GQLFavouriteWorkoutSet = {
  __typename?: 'FavouriteWorkoutSet';
  exerciseId: EntireFieldWrapper<Scalars['ID']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  maxReps?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  minReps?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  order: EntireFieldWrapper<Scalars['Int']['output']>;
  reps?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  rpe?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  weight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
};

export enum GQLFitnessLevel {
  Advanced = 'ADVANCED',
  Beginner = 'BEGINNER',
  Expert = 'EXPERT',
  Intermediate = 'INTERMEDIATE'
}

export enum GQLFocusTag {
  AthleticPerformance = 'ATHLETIC_PERFORMANCE',
  BeginnerFriendly = 'BEGINNER_FRIENDLY',
  Bodyweight = 'BODYWEIGHT',
  BodyRecomposition = 'BODY_RECOMPOSITION',
  Cardio = 'CARDIO',
  Conditioning = 'CONDITIONING',
  Endurance = 'ENDURANCE',
  FatLoss = 'FAT_LOSS',
  Flexibility = 'FLEXIBILITY',
  FunctionalFitness = 'FUNCTIONAL_FITNESS',
  Hypertrophy = 'HYPERTROPHY',
  MuscleBuilding = 'MUSCLE_BUILDING',
  Powerlifting = 'POWERLIFTING',
  Strength = 'STRENGTH',
  WeightLoss = 'WEIGHT_LOSS'
}

export type GQLGenerateAiWorkoutInput = {
  exerciseCount: Scalars['Int']['input'];
  maxSetsPerExercise: Scalars['Int']['input'];
  repFocus: GQLRepFocus;
  rpeRange: GQLRpeRange;
  selectedEquipment: Array<GQLEquipment>;
  selectedMuscleGroups: Array<Scalars['String']['input']>;
};

export type GQLGetExercisesResponse = {
  __typename?: 'GetExercisesResponse';
  publicExercises: EntireFieldWrapper<Array<GQLBaseExercise>>;
  trainerExercises: EntireFieldWrapper<Array<GQLBaseExercise>>;
};

export type GQLGetMealPlanPayload = {
  __typename?: 'GetMealPlanPayload';
  plan: EntireFieldWrapper<GQLMealPlan>;
};

export type GQLGetWorkoutPayload = {
  __typename?: 'GetWorkoutPayload';
  plan: EntireFieldWrapper<GQLTrainingPlan>;
};

export enum GQLGoal {
  BodyRecomposition = 'BODY_RECOMPOSITION',
  GainMuscle = 'GAIN_MUSCLE',
  ImproveHealth = 'IMPROVE_HEALTH',
  IncreaseEndurance = 'INCREASE_ENDURANCE',
  IncreaseStrength = 'INCREASE_STRENGTH',
  LoseWeight = 'LOSE_WEIGHT',
  Maintain = 'MAINTAIN'
}

export enum GQLHeightUnit {
  Cm = 'cm',
  Ft = 'ft'
}

export type GQLImage = {
  __typename?: 'Image';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  entityId: EntireFieldWrapper<Scalars['ID']['output']>;
  entityType: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  order: EntireFieldWrapper<Scalars['Int']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  url: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLLogSetInput = {
  loggedReps?: InputMaybe<Scalars['Int']['input']>;
  loggedWeight?: InputMaybe<Scalars['Float']['input']>;
  setId: Scalars['ID']['input'];
};

export type GQLMeal = {
  __typename?: 'Meal';
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  dateTime: EntireFieldWrapper<Scalars['String']['output']>;
  day?: EntireFieldWrapper<Maybe<GQLMealDay>>;
  foods: EntireFieldWrapper<Array<GQLMealFood>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  instructions?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  plannedCalories: EntireFieldWrapper<Scalars['Float']['output']>;
  plannedCarbs: EntireFieldWrapper<Scalars['Float']['output']>;
  plannedFat: EntireFieldWrapper<Scalars['Float']['output']>;
  plannedProtein: EntireFieldWrapper<Scalars['Float']['output']>;
};

export type GQLMealDay = {
  __typename?: 'MealDay';
  actualCalories: EntireFieldWrapper<Scalars['Float']['output']>;
  actualCarbs: EntireFieldWrapper<Scalars['Float']['output']>;
  actualFat: EntireFieldWrapper<Scalars['Float']['output']>;
  actualProtein: EntireFieldWrapper<Scalars['Float']['output']>;
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  dayOfWeek: EntireFieldWrapper<Scalars['Int']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  meals: EntireFieldWrapper<Array<GQLMeal>>;
  plannedCalories: EntireFieldWrapper<Scalars['Float']['output']>;
  plannedCarbs: EntireFieldWrapper<Scalars['Float']['output']>;
  plannedFat: EntireFieldWrapper<Scalars['Float']['output']>;
  plannedProtein: EntireFieldWrapper<Scalars['Float']['output']>;
  scheduledAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  targetCalories?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  targetCarbs?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  targetFat?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  targetProtein?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  week?: EntireFieldWrapper<Maybe<GQLMealWeek>>;
};

export type GQLMealFood = {
  __typename?: 'MealFood';
  addedAt: EntireFieldWrapper<Scalars['String']['output']>;
  addedBy?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  caloriesPer100g?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  carbsPer100g?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  fatPer100g?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  fiberPer100g?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isCustomAddition: EntireFieldWrapper<Scalars['Boolean']['output']>;
  latestLog?: EntireFieldWrapper<Maybe<GQLMealFoodLog>>;
  log?: EntireFieldWrapper<Maybe<GQLMealFoodLog>>;
  meal?: EntireFieldWrapper<Maybe<GQLMeal>>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  openFoodFactsId?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  productData?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  proteinPer100g?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  quantity: EntireFieldWrapper<Scalars['Float']['output']>;
  totalCalories: EntireFieldWrapper<Scalars['Float']['output']>;
  totalCarbs: EntireFieldWrapper<Scalars['Float']['output']>;
  totalFat: EntireFieldWrapper<Scalars['Float']['output']>;
  totalFiber: EntireFieldWrapper<Scalars['Float']['output']>;
  totalProtein: EntireFieldWrapper<Scalars['Float']['output']>;
  unit: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLMealFoodInput = {
  caloriesPer100g?: InputMaybe<Scalars['Float']['input']>;
  carbsPer100g?: InputMaybe<Scalars['Float']['input']>;
  fatPer100g?: InputMaybe<Scalars['Float']['input']>;
  fiberPer100g?: InputMaybe<Scalars['Float']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  openFoodFactsId?: InputMaybe<Scalars['String']['input']>;
  productData?: InputMaybe<Scalars['String']['input']>;
  proteinPer100g?: InputMaybe<Scalars['Float']['input']>;
  quantity: Scalars['Float']['input'];
  unit: Scalars['String']['input'];
};

export type GQLMealFoodLog = {
  __typename?: 'MealFoodLog';
  calories?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  carbs?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  fat?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  fiber?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  loggedAt: EntireFieldWrapper<Scalars['String']['output']>;
  loggedQuantity: EntireFieldWrapper<Scalars['Float']['output']>;
  mealFood: EntireFieldWrapper<GQLMealFood>;
  notes?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  protein?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  quantity: EntireFieldWrapper<Scalars['Float']['output']>;
  unit: EntireFieldWrapper<Scalars['String']['output']>;
  user: EntireFieldWrapper<GQLUserPublic>;
};

export type GQLMealPlan = {
  __typename?: 'MealPlan';
  active: EntireFieldWrapper<Scalars['Boolean']['output']>;
  assignedCount: EntireFieldWrapper<Scalars['Int']['output']>;
  assignedTo?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  collaboratorCount: EntireFieldWrapper<Scalars['Int']['output']>;
  collaborators: EntireFieldWrapper<Array<GQLMealPlanCollaborator>>;
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  createdBy?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  dailyCalories?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  dailyCarbs?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  dailyFat?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  dailyProtein?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  endDate?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isDraft: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isPublic: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isTemplate: EntireFieldWrapper<Scalars['Boolean']['output']>;
  startDate?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  title: EntireFieldWrapper<Scalars['String']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  weekCount: EntireFieldWrapper<Scalars['Int']['output']>;
  weeks: EntireFieldWrapper<Array<GQLMealWeek>>;
};

export type GQLMealPlanCollaborator = {
  __typename?: 'MealPlanCollaborator';
  addedBy: EntireFieldWrapper<GQLUserPublic>;
  collaborator: EntireFieldWrapper<GQLUserPublic>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  mealPlan: EntireFieldWrapper<GQLMealPlan>;
  permission: EntireFieldWrapper<GQLCollaborationPermission>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLMealWeek = {
  __typename?: 'MealWeek';
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  days: EntireFieldWrapper<Array<GQLMealDay>>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isExtra: EntireFieldWrapper<Scalars['Boolean']['output']>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  plan?: EntireFieldWrapper<Maybe<GQLMealPlan>>;
  totalCalories: EntireFieldWrapper<Scalars['Float']['output']>;
  totalCarbs: EntireFieldWrapper<Scalars['Float']['output']>;
  totalFat: EntireFieldWrapper<Scalars['Float']['output']>;
  totalProtein: EntireFieldWrapper<Scalars['Float']['output']>;
  weekNumber: EntireFieldWrapper<Scalars['Int']['output']>;
};

export type GQLModerateReviewInput = {
  flagReason?: InputMaybe<Scalars['String']['input']>;
  flagged?: InputMaybe<Scalars['Boolean']['input']>;
  isHidden?: InputMaybe<Scalars['Boolean']['input']>;
  reviewId: Scalars['ID']['input'];
};

export type GQLMoveExerciseInput = {
  dayId: Scalars['ID']['input'];
  exerciseId: Scalars['ID']['input'];
  newOrder: Scalars['Int']['input'];
  targetDayId?: InputMaybe<Scalars['ID']['input']>;
};

export type GQLMuscleGroup = {
  __typename?: 'MuscleGroup';
  alias?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  category: EntireFieldWrapper<GQLMuscleGroupCategory>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  exercises: EntireFieldWrapper<Array<GQLBaseExercise>>;
  groupSlug: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isPrimary: EntireFieldWrapper<Scalars['Boolean']['output']>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLMuscleGroupCategory = {
  __typename?: 'MuscleGroupCategory';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  muscles: EntireFieldWrapper<Array<GQLMuscleGroup>>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  slug: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLMutation = {
  __typename?: 'Mutation';
  acceptCoachingRequest?: EntireFieldWrapper<Maybe<GQLCoachingRequest>>;
  activatePlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  activateUser: EntireFieldWrapper<Scalars['Boolean']['output']>;
  addAiExerciseToWorkout: EntireFieldWrapper<GQLTrainingExercise>;
  addBodyMeasurement: EntireFieldWrapper<GQLUserBodyMeasure>;
  addCustomFoodToMeal: EntireFieldWrapper<GQLMealFoodLog>;
  addExerciseToDay: EntireFieldWrapper<Scalars['ID']['output']>;
  addExercisesToQuickWorkout: EntireFieldWrapper<GQLTrainingPlan>;
  addExercisesToWorkout: EntireFieldWrapper<Array<GQLTrainingExercise>>;
  addFoodToPersonalLog: EntireFieldWrapper<GQLMealFoodLog>;
  addMealPlanCollaborator: EntireFieldWrapper<GQLMealPlanCollaborator>;
  addSet: EntireFieldWrapper<GQLExerciseSet>;
  addSetExerciseForm: EntireFieldWrapper<GQLExerciseSet>;
  addSetToExercise: EntireFieldWrapper<Scalars['ID']['output']>;
  addSubstituteExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  addTrainingPlanCollaborator: EntireFieldWrapper<GQLTrainingPlanCollaborator>;
  addTrainingWeek: EntireFieldWrapper<Scalars['ID']['output']>;
  assignMealPlanToClient: EntireFieldWrapper<Scalars['Boolean']['output']>;
  assignTemplateToSelf: EntireFieldWrapper<Scalars['Boolean']['output']>;
  assignTrainingPlanToClient: EntireFieldWrapper<Scalars['Boolean']['output']>;
  batchLogMealFood: EntireFieldWrapper<Scalars['Boolean']['output']>;
  bulkUpdatePlanPermissions: EntireFieldWrapper<Array<GQLPlanCollaboratorSummary>>;
  cancelCoaching: EntireFieldWrapper<Scalars['Boolean']['output']>;
  cancelCoachingRequest?: EntireFieldWrapper<Maybe<GQLCoachingRequest>>;
  clearTodaysWorkout: EntireFieldWrapper<Scalars['Boolean']['output']>;
  clearUserSessions: EntireFieldWrapper<Scalars['Boolean']['output']>;
  closePlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  completeMeal: EntireFieldWrapper<Scalars['Boolean']['output']>;
  copyExercisesFromDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  createCoachingRequest: EntireFieldWrapper<GQLCoachingRequest>;
  createDraftMealTemplate: EntireFieldWrapper<GQLMealPlan>;
  createDraftTemplate: EntireFieldWrapper<GQLTrainingPlan>;
  createExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  createExerciseNote: EntireFieldWrapper<GQLNote>;
  createFavouriteWorkout: EntireFieldWrapper<GQLFavouriteWorkout>;
  createMealPlan: EntireFieldWrapper<GQLCreateMealPlanPayload>;
  createNote: EntireFieldWrapper<GQLNote>;
  createNoteReply: EntireFieldWrapper<GQLNote>;
  createNotification: EntireFieldWrapper<GQLNotification>;
  createPushSubscription: EntireFieldWrapper<GQLPushSubscription>;
  createQuickWorkout: EntireFieldWrapper<GQLTrainingPlan>;
  createReview: EntireFieldWrapper<Scalars['Boolean']['output']>;
  createTrainerNoteForClient: EntireFieldWrapper<GQLNote>;
  createTrainingPlan: EntireFieldWrapper<GQLCreateTrainingPlanPayload>;
  deactivateUser: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteBodyMeasurement: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteFavouriteWorkout: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteNote: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteNotification: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deletePlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deletePushSubscription: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteReview: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteTrainingPlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteUserAccount: EntireFieldWrapper<Scalars['Boolean']['output']>;
  duplicateMealPlan: EntireFieldWrapper<Scalars['ID']['output']>;
  duplicateTrainingPlan: EntireFieldWrapper<Scalars['ID']['output']>;
  duplicateTrainingWeek: EntireFieldWrapper<Scalars['ID']['output']>;
  extendPlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  fitspaceActivateMealPlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  fitspaceDeactivateMealPlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  fitspaceDeleteMealPlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  generateAiWorkout: EntireFieldWrapper<GQLAiWorkoutResult>;
  getAiExerciseSuggestions: EntireFieldWrapper<Array<GQLAiExerciseSuggestion>>;
  giveLifetimePremium: EntireFieldWrapper<GQLUserSubscription>;
  logWorkoutProgress: EntireFieldWrapper<Scalars['ID']['output']>;
  logWorkoutSessionEvent: EntireFieldWrapper<Scalars['ID']['output']>;
  markAllNotificationsRead: EntireFieldWrapper<Array<GQLNotification>>;
  markExerciseAsCompleted?: EntireFieldWrapper<Maybe<Scalars['Boolean']['output']>>;
  markNotificationRead: EntireFieldWrapper<GQLNotification>;
  markSetAsCompleted?: EntireFieldWrapper<Maybe<Scalars['Boolean']['output']>>;
  markWorkoutAsCompleted?: EntireFieldWrapper<Maybe<Scalars['Boolean']['output']>>;
  moderateReview: EntireFieldWrapper<Scalars['Boolean']['output']>;
  moveExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  pausePlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  rejectCoachingRequest?: EntireFieldWrapper<Maybe<GQLCoachingRequest>>;
  removeAllExercisesFromDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeExerciseFromDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeExerciseFromWorkout: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeMealLog: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeMealPlanCollaborator: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeMealPlanFromClient: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeSet: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeSetExerciseForm: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeSetFromExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeSubstituteExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeTrainingPlanCollaborator: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeTrainingPlanFromClient: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeTrainingWeek: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeUserSubscription: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeWeek: EntireFieldWrapper<Scalars['Boolean']['output']>;
  resetUserLogs: EntireFieldWrapper<Scalars['Boolean']['output']>;
  respondToCollaborationInvitation: EntireFieldWrapper<GQLCollaborationInvitation>;
  saveMeal?: EntireFieldWrapper<Maybe<GQLMeal>>;
  sendCollaborationInvitation: EntireFieldWrapper<GQLCollaborationInvitation>;
  startWorkoutFromFavourite: EntireFieldWrapper<Scalars['ID']['output']>;
  swapExercise: EntireFieldWrapper<GQLSubstitute>;
  uncompleteMeal: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateBodyMeasurement: EntireFieldWrapper<GQLUserBodyMeasure>;
  updateExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateExerciseForm: EntireFieldWrapper<GQLTrainingExercise>;
  updateExerciseSet: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateFavouriteWorkout: EntireFieldWrapper<GQLFavouriteWorkout>;
  updateMealPlanCollaboratorPermission: EntireFieldWrapper<GQLMealPlanCollaborator>;
  updateMealPlanDetails: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateNote: EntireFieldWrapper<GQLNote>;
  updateNotification: EntireFieldWrapper<GQLNotification>;
  updateProfile?: EntireFieldWrapper<Maybe<GQLUserProfile>>;
  updatePushSubscription: EntireFieldWrapper<GQLPushSubscription>;
  updateReview: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateServiceDelivery: EntireFieldWrapper<GQLServiceDelivery>;
  updateServiceTask: EntireFieldWrapper<GQLServiceTask>;
  updateSetLog?: EntireFieldWrapper<Maybe<GQLExerciseSetLog>>;
  updateSubstituteExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingDayData: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingPlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingPlanCollaboratorPermission: EntireFieldWrapper<GQLTrainingPlanCollaborator>;
  updateTrainingPlanDetails: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingWeekDetails: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateUserFeatured: EntireFieldWrapper<GQLAdminUserListItem>;
  updateUserRole: EntireFieldWrapper<GQLAdminUserListItem>;
};


export type GQLMutationAcceptCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationActivatePlanArgs = {
  planId: Scalars['ID']['input'];
  resume: Scalars['Boolean']['input'];
  startDate: Scalars['String']['input'];
};


export type GQLMutationActivateUserArgs = {
  userId: Scalars['ID']['input'];
};


export type GQLMutationAddAiExerciseToWorkoutArgs = {
  input: GQLAddAiExerciseToWorkoutInput;
};


export type GQLMutationAddBodyMeasurementArgs = {
  input: GQLAddBodyMeasurementInput;
};


export type GQLMutationAddCustomFoodToMealArgs = {
  input: GQLAddCustomFoodToMealInput;
};


export type GQLMutationAddExerciseToDayArgs = {
  input: GQLAddExerciseToDayInput;
};


export type GQLMutationAddExercisesToQuickWorkoutArgs = {
  exercises: Array<GQLQuickWorkoutExerciseInput>;
};


export type GQLMutationAddExercisesToWorkoutArgs = {
  input: GQLAddExercisesToWorkoutInput;
};


export type GQLMutationAddFoodToPersonalLogArgs = {
  input: GQLAddFoodToPersonalLogInput;
};


export type GQLMutationAddMealPlanCollaboratorArgs = {
  input: GQLAddMealPlanCollaboratorInput;
};


export type GQLMutationAddSetArgs = {
  exerciseId: Scalars['ID']['input'];
};


export type GQLMutationAddSetExerciseFormArgs = {
  input: GQLAddSetExerciseFormInput;
};


export type GQLMutationAddSetToExerciseArgs = {
  input: GQLAddSetToExerciseInput;
};


export type GQLMutationAddSubstituteExerciseArgs = {
  input: GQLAddSubstituteExerciseInput;
};


export type GQLMutationAddTrainingPlanCollaboratorArgs = {
  input: GQLAddTrainingPlanCollaboratorInput;
};


export type GQLMutationAddTrainingWeekArgs = {
  input: GQLAddTrainingWeekInput;
};


export type GQLMutationAssignMealPlanToClientArgs = {
  input: GQLAssignMealPlanToClientInput;
};


export type GQLMutationAssignTemplateToSelfArgs = {
  planId: Scalars['ID']['input'];
};


export type GQLMutationAssignTrainingPlanToClientArgs = {
  input: GQLAssignTrainingPlanToClientInput;
};


export type GQLMutationBatchLogMealFoodArgs = {
  input: GQLBatchLogMealFoodInput;
};


export type GQLMutationBulkUpdatePlanPermissionsArgs = {
  input: GQLBulkUpdatePlanPermissionsInput;
};


export type GQLMutationCancelCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationClearUserSessionsArgs = {
  userId: Scalars['ID']['input'];
};


export type GQLMutationClosePlanArgs = {
  planId: Scalars['ID']['input'];
};


export type GQLMutationCompleteMealArgs = {
  mealId: Scalars['ID']['input'];
};


export type GQLMutationCopyExercisesFromDayArgs = {
  input: GQLCopyExercisesFromDayInput;
};


export type GQLMutationCreateCoachingRequestArgs = {
  message?: InputMaybe<Scalars['String']['input']>;
  recipientEmail: Scalars['String']['input'];
};


export type GQLMutationCreateExerciseArgs = {
  input: GQLCreateExerciseInput;
};


export type GQLMutationCreateExerciseNoteArgs = {
  input: GQLCreateExerciseNoteInput;
};


export type GQLMutationCreateFavouriteWorkoutArgs = {
  input: GQLCreateFavouriteWorkoutInput;
};


export type GQLMutationCreateMealPlanArgs = {
  input: GQLCreateMealPlanInput;
};


export type GQLMutationCreateNoteArgs = {
  input: GQLCreateNoteInput;
};


export type GQLMutationCreateNoteReplyArgs = {
  input: GQLCreateNoteReplyInput;
};


export type GQLMutationCreateNotificationArgs = {
  input: GQLCreateNotificationInput;
};


export type GQLMutationCreatePushSubscriptionArgs = {
  input: GQLCreatePushSubscriptionInput;
};


export type GQLMutationCreateQuickWorkoutArgs = {
  input: GQLCreateQuickWorkoutInput;
};


export type GQLMutationCreateReviewArgs = {
  input: GQLCreateReviewInput;
};


export type GQLMutationCreateTrainerNoteForClientArgs = {
  input: GQLCreateTrainerNoteForClientInput;
};


export type GQLMutationCreateTrainingPlanArgs = {
  input: GQLCreateTrainingPlanInput;
};


export type GQLMutationDeactivateUserArgs = {
  userId: Scalars['ID']['input'];
};


export type GQLMutationDeleteBodyMeasurementArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationDeleteExerciseArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationDeleteFavouriteWorkoutArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationDeleteNoteArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationDeleteNotificationArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationDeletePlanArgs = {
  planId: Scalars['ID']['input'];
};


export type GQLMutationDeletePushSubscriptionArgs = {
  endpoint: Scalars['String']['input'];
};


export type GQLMutationDeleteReviewArgs = {
  input: GQLDeleteReviewInput;
};


export type GQLMutationDeleteTrainingPlanArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationDuplicateMealPlanArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationDuplicateTrainingPlanArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationDuplicateTrainingWeekArgs = {
  input: GQLDuplicateTrainingWeekInput;
};


export type GQLMutationExtendPlanArgs = {
  planId: Scalars['ID']['input'];
  weeks: Array<Scalars['ID']['input']>;
};


export type GQLMutationFitspaceActivateMealPlanArgs = {
  planId: Scalars['ID']['input'];
};


export type GQLMutationFitspaceDeactivateMealPlanArgs = {
  planId: Scalars['ID']['input'];
};


export type GQLMutationFitspaceDeleteMealPlanArgs = {
  planId: Scalars['ID']['input'];
};


export type GQLMutationGenerateAiWorkoutArgs = {
  input: GQLGenerateAiWorkoutInput;
};


export type GQLMutationGetAiExerciseSuggestionsArgs = {
  dayId: Scalars['ID']['input'];
};


export type GQLMutationGiveLifetimePremiumArgs = {
  userId: Scalars['ID']['input'];
};


export type GQLMutationLogWorkoutProgressArgs = {
  dayId: Scalars['ID']['input'];
  tick: Scalars['Int']['input'];
};


export type GQLMutationLogWorkoutSessionEventArgs = {
  dayId: Scalars['ID']['input'];
  event: GQLWorkoutSessionEvent;
};


export type GQLMutationMarkAllNotificationsReadArgs = {
  userId: Scalars['ID']['input'];
};


export type GQLMutationMarkExerciseAsCompletedArgs = {
  completed: Scalars['Boolean']['input'];
  exerciseId: Scalars['ID']['input'];
};


export type GQLMutationMarkNotificationReadArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationMarkSetAsCompletedArgs = {
  completed: Scalars['Boolean']['input'];
  reps?: InputMaybe<Scalars['Int']['input']>;
  setId: Scalars['ID']['input'];
  weight?: InputMaybe<Scalars['Float']['input']>;
};


export type GQLMutationMarkWorkoutAsCompletedArgs = {
  dayId: Scalars['ID']['input'];
};


export type GQLMutationModerateReviewArgs = {
  input: GQLModerateReviewInput;
};


export type GQLMutationMoveExerciseArgs = {
  input: GQLMoveExerciseInput;
};


export type GQLMutationPausePlanArgs = {
  planId: Scalars['ID']['input'];
};


export type GQLMutationRejectCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationRemoveAllExercisesFromDayArgs = {
  input: GQLRemoveAllExercisesFromDayInput;
};


export type GQLMutationRemoveExerciseFromDayArgs = {
  exerciseId: Scalars['ID']['input'];
};


export type GQLMutationRemoveExerciseFromWorkoutArgs = {
  exerciseId: Scalars['ID']['input'];
};


export type GQLMutationRemoveMealLogArgs = {
  foodId: Scalars['ID']['input'];
};


export type GQLMutationRemoveMealPlanCollaboratorArgs = {
  input: GQLRemoveMealPlanCollaboratorInput;
};


export type GQLMutationRemoveMealPlanFromClientArgs = {
  clientId: Scalars['ID']['input'];
  planId: Scalars['ID']['input'];
};


export type GQLMutationRemoveSetArgs = {
  setId: Scalars['ID']['input'];
};


export type GQLMutationRemoveSetExerciseFormArgs = {
  setId: Scalars['ID']['input'];
};


export type GQLMutationRemoveSetFromExerciseArgs = {
  setId: Scalars['ID']['input'];
};


export type GQLMutationRemoveSubstituteExerciseArgs = {
  input: GQLRemoveSubstituteExerciseInput;
};


export type GQLMutationRemoveTrainingPlanCollaboratorArgs = {
  input: GQLRemoveTrainingPlanCollaboratorInput;
};


export type GQLMutationRemoveTrainingPlanFromClientArgs = {
  clientId: Scalars['ID']['input'];
  planId: Scalars['ID']['input'];
};


export type GQLMutationRemoveTrainingWeekArgs = {
  weekId: Scalars['ID']['input'];
};


export type GQLMutationRemoveUserSubscriptionArgs = {
  userId: Scalars['ID']['input'];
};


export type GQLMutationRemoveWeekArgs = {
  planId: Scalars['ID']['input'];
  weekId: Scalars['ID']['input'];
};


export type GQLMutationRespondToCollaborationInvitationArgs = {
  input: GQLRespondToCollaborationInvitationInput;
};


export type GQLMutationSaveMealArgs = {
  input: GQLSaveMealInput;
};


export type GQLMutationSendCollaborationInvitationArgs = {
  input: GQLSendCollaborationInvitationInput;
};


export type GQLMutationStartWorkoutFromFavouriteArgs = {
  input: GQLStartWorkoutFromFavouriteInput;
};


export type GQLMutationSwapExerciseArgs = {
  exerciseId: Scalars['ID']['input'];
  substituteId: Scalars['ID']['input'];
};


export type GQLMutationUncompleteMealArgs = {
  mealId: Scalars['ID']['input'];
};


export type GQLMutationUpdateBodyMeasurementArgs = {
  input: GQLUpdateBodyMeasurementInput;
};


export type GQLMutationUpdateExerciseArgs = {
  id: Scalars['ID']['input'];
  input: GQLUpdateExerciseInput;
};


export type GQLMutationUpdateExerciseFormArgs = {
  input: GQLUpdateExerciseFormInput;
};


export type GQLMutationUpdateExerciseSetArgs = {
  input: GQLUpdateExerciseSetInput;
};


export type GQLMutationUpdateFavouriteWorkoutArgs = {
  input: GQLUpdateFavouriteWorkoutInput;
};


export type GQLMutationUpdateMealPlanCollaboratorPermissionArgs = {
  input: GQLUpdateMealPlanCollaboratorPermissionInput;
};


export type GQLMutationUpdateMealPlanDetailsArgs = {
  input: GQLUpdateMealPlanDetailsInput;
};


export type GQLMutationUpdateNoteArgs = {
  input: GQLUpdateNoteInput;
};


export type GQLMutationUpdateNotificationArgs = {
  input: GQLUpdateNotificationInput;
};


export type GQLMutationUpdateProfileArgs = {
  input: GQLUpdateProfileInput;
};


export type GQLMutationUpdatePushSubscriptionArgs = {
  input: GQLUpdatePushSubscriptionInput;
};


export type GQLMutationUpdateReviewArgs = {
  input: GQLUpdateReviewInput;
};


export type GQLMutationUpdateServiceDeliveryArgs = {
  deliveryId: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  status: GQLDeliveryStatus;
};


export type GQLMutationUpdateServiceTaskArgs = {
  input: GQLUpdateServiceTaskInput;
  taskId: Scalars['ID']['input'];
};


export type GQLMutationUpdateSetLogArgs = {
  input: GQLLogSetInput;
};


export type GQLMutationUpdateSubstituteExerciseArgs = {
  input: GQLUpdateSubstituteExerciseInput;
};


export type GQLMutationUpdateTrainingDayDataArgs = {
  input: GQLUpdateTrainingDayDataInput;
};


export type GQLMutationUpdateTrainingExerciseArgs = {
  input: GQLUpdateTrainingExerciseInput;
};


export type GQLMutationUpdateTrainingPlanArgs = {
  input: GQLUpdateTrainingPlanInput;
};


export type GQLMutationUpdateTrainingPlanCollaboratorPermissionArgs = {
  input: GQLUpdateTrainingPlanCollaboratorPermissionInput;
};


export type GQLMutationUpdateTrainingPlanDetailsArgs = {
  input: GQLUpdateTrainingPlanDetailsInput;
};


export type GQLMutationUpdateTrainingWeekDetailsArgs = {
  input: GQLUpdateTrainingWeekDetailsInput;
};


export type GQLMutationUpdateUserFeaturedArgs = {
  input: GQLUpdateUserFeaturedInput;
};


export type GQLMutationUpdateUserRoleArgs = {
  input: GQLUpdateUserRoleInput;
};

export type GQLMyMealPlansPayload = {
  __typename?: 'MyMealPlansPayload';
  activePlan?: EntireFieldWrapper<Maybe<GQLMealPlan>>;
  availablePlans: EntireFieldWrapper<Array<GQLMealPlan>>;
  completedPlans: EntireFieldWrapper<Array<GQLMealPlan>>;
};

export type GQLMyPlansPayload = {
  __typename?: 'MyPlansPayload';
  activePlan?: EntireFieldWrapper<Maybe<GQLTrainingPlan>>;
  availablePlans: EntireFieldWrapper<Array<GQLTrainingPlan>>;
  completedPlans: EntireFieldWrapper<Array<GQLTrainingPlan>>;
  quickWorkoutPlan?: EntireFieldWrapper<Maybe<GQLTrainingPlan>>;
};

export type GQLNote = {
  __typename?: 'Note';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  createdBy: EntireFieldWrapper<GQLUserPublic>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  parentNoteId?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
  relatedTo?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
  replies: EntireFieldWrapper<Array<GQLNote>>;
  shareWithClient?: EntireFieldWrapper<Maybe<Scalars['Boolean']['output']>>;
  shareWithTrainer?: EntireFieldWrapper<Maybe<Scalars['Boolean']['output']>>;
  text: EntireFieldWrapper<Scalars['String']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLNotification = {
  __typename?: 'Notification';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  createdBy?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
  creator?: EntireFieldWrapper<Maybe<GQLUser>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  link?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  message: EntireFieldWrapper<Scalars['String']['output']>;
  read: EntireFieldWrapper<Scalars['Boolean']['output']>;
  relatedItemId?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  type: EntireFieldWrapper<GQLNotificationType>;
};

export type GQLNotificationPreferences = {
  __typename?: 'NotificationPreferences';
  collaborationNotifications: EntireFieldWrapper<Scalars['Boolean']['output']>;
  emailNotifications: EntireFieldWrapper<Scalars['Boolean']['output']>;
  mealReminders: EntireFieldWrapper<Scalars['Boolean']['output']>;
  progressUpdates: EntireFieldWrapper<Scalars['Boolean']['output']>;
  pushNotifications: EntireFieldWrapper<Scalars['Boolean']['output']>;
  systemNotifications: EntireFieldWrapper<Scalars['Boolean']['output']>;
  workoutReminders: EntireFieldWrapper<Scalars['Boolean']['output']>;
};

export type GQLNotificationPreferencesInput = {
  collaborationNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  emailNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  mealReminders?: InputMaybe<Scalars['Boolean']['input']>;
  progressUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  pushNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  systemNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  workoutReminders?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum GQLNotificationType {
  CoachingCancelled = 'COACHING_CANCELLED',
  CoachingRequest = 'COACHING_REQUEST',
  CoachingRequestAccepted = 'COACHING_REQUEST_ACCEPTED',
  CoachingRequestRejected = 'COACHING_REQUEST_REJECTED',
  CollaborationInvitation = 'COLLABORATION_INVITATION',
  CollaborationResponse = 'COLLABORATION_RESPONSE',
  ExerciseNoteAdded = 'EXERCISE_NOTE_ADDED',
  ExerciseNoteReply = 'EXERCISE_NOTE_REPLY',
  MealPlanCollaboration = 'MEAL_PLAN_COLLABORATION',
  MealPlanCollaborationRemoved = 'MEAL_PLAN_COLLABORATION_REMOVED',
  Message = 'MESSAGE',
  NewMealPlanAssigned = 'NEW_MEAL_PLAN_ASSIGNED',
  NewTrainingPlanAssigned = 'NEW_TRAINING_PLAN_ASSIGNED',
  PlanCompleted = 'PLAN_COMPLETED',
  Reminder = 'REMINDER',
  System = 'SYSTEM',
  TrainerNoteShared = 'TRAINER_NOTE_SHARED',
  TrainerOfferReceived = 'TRAINER_OFFER_RECEIVED',
  TrainerWorkoutCompleted = 'TRAINER_WORKOUT_COMPLETED',
  TrainingPlanCollaboration = 'TRAINING_PLAN_COLLABORATION',
  TrainingPlanCollaborationRemoved = 'TRAINING_PLAN_COLLABORATION_REMOVED',
  WorkoutCompleted = 'WORKOUT_COMPLETED'
}

export type GQLOneRmEntry = {
  __typename?: 'OneRmEntry';
  average1RM: EntireFieldWrapper<Scalars['Float']['output']>;
  date: EntireFieldWrapper<Scalars['String']['output']>;
  detailedLogs: EntireFieldWrapper<Array<GQLOneRmLog>>;
};

export type GQLOneRmLog = {
  __typename?: 'OneRmLog';
  estimated1RM: EntireFieldWrapper<Scalars['Float']['output']>;
  reps?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  weight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
};

export type GQLPackageTemplate = {
  __typename?: 'PackageTemplate';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  duration: EntireFieldWrapper<GQLSubscriptionDuration>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isActive: EntireFieldWrapper<Scalars['Boolean']['output']>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  serviceType?: EntireFieldWrapper<Maybe<GQLServiceType>>;
  stripePriceId?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  stripeProductId?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  trainer?: EntireFieldWrapper<Maybe<GQLUser>>;
  trainerId?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLPlanCollaboratorSummary = {
  __typename?: 'PlanCollaboratorSummary';
  addedBy: EntireFieldWrapper<GQLUserPublic>;
  collaborator: EntireFieldWrapper<GQLUserPublic>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  permission: EntireFieldWrapper<GQLCollaborationPermission>;
  planId: EntireFieldWrapper<Scalars['ID']['output']>;
  planTitle: EntireFieldWrapper<Scalars['String']['output']>;
  planType: EntireFieldWrapper<Scalars['String']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLPlanPermissionUpdateInput = {
  permission?: InputMaybe<GQLCollaborationPermission>;
  planId: Scalars['ID']['input'];
  planType: Scalars['String']['input'];
  removeAccess?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GQLPlanWithPermissions = {
  __typename?: 'PlanWithPermissions';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  currentPermission?: EntireFieldWrapper<Maybe<GQLCollaborationPermission>>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  hasAccess: EntireFieldWrapper<Scalars['Boolean']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isTemplate: EntireFieldWrapper<Scalars['Boolean']['output']>;
  planType: EntireFieldWrapper<Scalars['String']['output']>;
  title: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLPublicTrainer = {
  __typename?: 'PublicTrainer';
  clientCount: EntireFieldWrapper<Scalars['Int']['output']>;
  credentials: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  email: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  name?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  profile?: EntireFieldWrapper<Maybe<GQLUserProfile>>;
  role: EntireFieldWrapper<GQLUserRole>;
  specialization: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  successStories: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  trainerSince?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
};

export type GQLPushSubscription = {
  __typename?: 'PushSubscription';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  endpoint: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  userAgent?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
};

export type GQLQuery = {
  __typename?: 'Query';
  adminUserById?: EntireFieldWrapper<Maybe<GQLAdminUserListItem>>;
  adminUserList: EntireFieldWrapper<GQLAdminUserListResponse>;
  adminUserStats: EntireFieldWrapper<GQLAdminUserStats>;
  allPlansWithPermissions: EntireFieldWrapper<Array<GQLPlanWithPermissions>>;
  availablePlansForTeamMember: EntireFieldWrapper<Array<GQLAvailablePlan>>;
  bodyMeasures: EntireFieldWrapper<Array<GQLUserBodyMeasure>>;
  checkPremiumAccess: EntireFieldWrapper<Scalars['Boolean']['output']>;
  clientBodyMeasures: EntireFieldWrapper<Array<GQLUserBodyMeasure>>;
  clientSharedNotes: EntireFieldWrapper<Array<GQLNote>>;
  coachingRequest?: EntireFieldWrapper<Maybe<GQLCoachingRequest>>;
  coachingRequests: EntireFieldWrapper<Array<GQLCoachingRequest>>;
  exercise?: EntireFieldWrapper<Maybe<GQLBaseExercise>>;
  exerciseNotes: EntireFieldWrapper<Array<GQLNote>>;
  exercisesProgressByUser: EntireFieldWrapper<Array<GQLExerciseProgress>>;
  getActiveMealPlan?: EntireFieldWrapper<Maybe<GQLMealPlan>>;
  getActivePackageTemplates: EntireFieldWrapper<Array<GQLPackageTemplate>>;
  getActivePlanId?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
  getAllUsersWithSubscriptions: EntireFieldWrapper<GQLUsersWithSubscriptionsResult>;
  getClientActivePlan?: EntireFieldWrapper<Maybe<GQLTrainingPlan>>;
  getClientMealPlans: EntireFieldWrapper<Array<GQLMealPlan>>;
  getClientTrainingPlans: EntireFieldWrapper<Array<GQLTrainingPlan>>;
  getCollaborationMealPlanTemplates: EntireFieldWrapper<Array<GQLMealPlan>>;
  getCollaborationTemplates: EntireFieldWrapper<Array<GQLTrainingPlan>>;
  getCurrentWorkoutWeek?: EntireFieldWrapper<Maybe<GQLCurrentWorkoutWeekPayload>>;
  getDefaultMealPlan: EntireFieldWrapper<GQLMealPlan>;
  getExercises: EntireFieldWrapper<GQLGetExercisesResponse>;
  getFavouriteWorkout?: EntireFieldWrapper<Maybe<GQLFavouriteWorkout>>;
  getFavouriteWorkouts: EntireFieldWrapper<Array<GQLFavouriteWorkout>>;
  getFeaturedTrainers: EntireFieldWrapper<Array<GQLPublicTrainer>>;
  getMealPlanById: EntireFieldWrapper<GQLMealPlan>;
  getMealPlanTemplates: EntireFieldWrapper<Array<GQLMealPlan>>;
  getMyMealPlansOverview: EntireFieldWrapper<GQLMyMealPlansPayload>;
  getMyPlansOverview: EntireFieldWrapper<GQLMyPlansPayload>;
  getMyPlansOverviewFull: EntireFieldWrapper<GQLMyPlansPayload>;
  getMyPlansOverviewLite: EntireFieldWrapper<GQLMyPlansPayload>;
  getMyServiceDeliveries: EntireFieldWrapper<Array<GQLServiceDelivery>>;
  getMySubscriptionStatus: EntireFieldWrapper<GQLUserSubscriptionStatus>;
  getMySubscriptions: EntireFieldWrapper<Array<GQLUserSubscription>>;
  getMyTrainer?: EntireFieldWrapper<Maybe<GQLPublicTrainer>>;
  getPackageTemplate?: EntireFieldWrapper<Maybe<GQLPackageTemplate>>;
  getPublicTrainingPlans: EntireFieldWrapper<Array<GQLTrainingPlan>>;
  getQuickWorkoutPlan: EntireFieldWrapper<GQLTrainingPlan>;
  getRecentCompletedWorkouts: EntireFieldWrapper<Array<GQLTrainingDay>>;
  getServiceDeliveryTasks: EntireFieldWrapper<Array<GQLServiceTask>>;
  getSubscriptionStats: EntireFieldWrapper<GQLSubscriptionStats>;
  getTemplates: EntireFieldWrapper<Array<GQLTrainingPlan>>;
  getTrainerDeliveries: EntireFieldWrapper<Array<GQLServiceDelivery>>;
  getTrainerTasks: EntireFieldWrapper<Array<GQLServiceTask>>;
  getTrainingExercise?: EntireFieldWrapper<Maybe<GQLTrainingExercise>>;
  getTrainingPlanById: EntireFieldWrapper<GQLTrainingPlan>;
  getWorkout?: EntireFieldWrapper<Maybe<GQLGetWorkoutPayload>>;
  getWorkoutInfo: EntireFieldWrapper<GQLTrainingDay>;
  mealPlanCollaborators: EntireFieldWrapper<Array<GQLMealPlanCollaborator>>;
  muscleGroupCategories: EntireFieldWrapper<Array<GQLMuscleGroupCategory>>;
  muscleGroupCategory: EntireFieldWrapper<GQLMuscleGroupCategory>;
  myClients: EntireFieldWrapper<Array<GQLUserPublic>>;
  myCollaborationInvitations: EntireFieldWrapper<Array<GQLCollaborationInvitation>>;
  myMealPlanCollaborations: EntireFieldWrapper<Array<GQLMealPlanCollaborator>>;
  myPlanCollaborators: EntireFieldWrapper<Array<GQLPlanCollaboratorSummary>>;
  myTeamMembers: EntireFieldWrapper<Array<GQLTeamMember>>;
  myTrainer?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  myTrainingPlanCollaborations: EntireFieldWrapper<Array<GQLTrainingPlanCollaborator>>;
  note?: EntireFieldWrapper<Maybe<GQLNote>>;
  noteReplies: EntireFieldWrapper<Array<GQLNote>>;
  notes: EntireFieldWrapper<Array<GQLNote>>;
  notification?: EntireFieldWrapper<Maybe<GQLNotification>>;
  notifications: EntireFieldWrapper<Array<GQLNotification>>;
  profile?: EntireFieldWrapper<Maybe<GQLUserProfile>>;
  publicExercises: EntireFieldWrapper<Array<GQLBaseExercise>>;
  pushSubscription?: EntireFieldWrapper<Maybe<GQLPushSubscription>>;
  pushSubscriptions: EntireFieldWrapper<Array<GQLPushSubscription>>;
  sentCollaborationInvitations: EntireFieldWrapper<Array<GQLCollaborationInvitation>>;
  trainerSharedNotes: EntireFieldWrapper<Array<GQLNote>>;
  trainingPlanCollaborators: EntireFieldWrapper<Array<GQLTrainingPlanCollaborator>>;
  user?: EntireFieldWrapper<Maybe<GQLUser>>;
  userBasic?: EntireFieldWrapper<Maybe<GQLUser>>;
  userExercises: EntireFieldWrapper<Array<GQLBaseExercise>>;
  userPublic?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  userWithAllData?: EntireFieldWrapper<Maybe<GQLUser>>;
  workoutExerciseNotes: EntireFieldWrapper<Array<GQLWorkoutExerciseNotes>>;
};


export type GQLQueryAdminUserByIdArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryAdminUserListArgs = {
  filters?: InputMaybe<GQLAdminUserFilters>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryAllPlansWithPermissionsArgs = {
  userId: Scalars['ID']['input'];
};


export type GQLQueryAvailablePlansForTeamMemberArgs = {
  userId: Scalars['ID']['input'];
};


export type GQLQueryClientBodyMeasuresArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLQueryClientSharedNotesArgs = {
  clientId: Scalars['String']['input'];
};


export type GQLQueryCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryExerciseArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryExerciseNotesArgs = {
  exerciseName: Scalars['String']['input'];
};


export type GQLQueryExercisesProgressByUserArgs = {
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type GQLQueryGetActiveMealPlanArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
};


export type GQLQueryGetActivePackageTemplatesArgs = {
  trainerId?: InputMaybe<Scalars['ID']['input']>;
};


export type GQLQueryGetAllUsersWithSubscriptionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
};


export type GQLQueryGetClientActivePlanArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLQueryGetClientMealPlansArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLQueryGetClientTrainingPlansArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLQueryGetCollaborationMealPlanTemplatesArgs = {
  draft?: InputMaybe<Scalars['Boolean']['input']>;
};


export type GQLQueryGetCollaborationTemplatesArgs = {
  draft?: InputMaybe<Scalars['Boolean']['input']>;
};


export type GQLQueryGetDefaultMealPlanArgs = {
  date?: InputMaybe<Scalars['String']['input']>;
};


export type GQLQueryGetFavouriteWorkoutArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryGetFeaturedTrainersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryGetMealPlanByIdArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryGetMealPlanTemplatesArgs = {
  draft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryGetMyServiceDeliveriesArgs = {
  status?: InputMaybe<GQLDeliveryStatus>;
};


export type GQLQueryGetPackageTemplateArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryGetPublicTrainingPlansArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryGetServiceDeliveryTasksArgs = {
  serviceDeliveryId: Scalars['ID']['input'];
};


export type GQLQueryGetTemplatesArgs = {
  draft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryGetTrainerDeliveriesArgs = {
  status?: InputMaybe<GQLDeliveryStatus>;
  trainerId: Scalars['ID']['input'];
};


export type GQLQueryGetTrainerTasksArgs = {
  serviceDeliveryId?: InputMaybe<Scalars['ID']['input']>;
  status?: InputMaybe<GQLTaskStatus>;
  trainerId: Scalars['ID']['input'];
};


export type GQLQueryGetTrainingExerciseArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryGetTrainingPlanByIdArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryGetWorkoutArgs = {
  trainingId?: InputMaybe<Scalars['ID']['input']>;
};


export type GQLQueryGetWorkoutInfoArgs = {
  dayId: Scalars['ID']['input'];
};


export type GQLQueryMealPlanCollaboratorsArgs = {
  mealPlanId: Scalars['ID']['input'];
};


export type GQLQueryMuscleGroupCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryMyClientsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryNoteArgs = {
  id: Scalars['ID']['input'];
  relatedTo?: InputMaybe<Scalars['ID']['input']>;
};


export type GQLQueryNoteRepliesArgs = {
  noteId: Scalars['String']['input'];
};


export type GQLQueryNotesArgs = {
  relatedTo?: InputMaybe<Scalars['ID']['input']>;
};


export type GQLQueryNotificationArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryNotificationsArgs = {
  read?: InputMaybe<Scalars['Boolean']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<GQLNotificationType>;
  userId: Scalars['ID']['input'];
};


export type GQLQueryPublicExercisesArgs = {
  where?: InputMaybe<GQLExerciseWhereInput>;
};


export type GQLQueryPushSubscriptionArgs = {
  endpoint: Scalars['String']['input'];
};


export type GQLQueryTrainerSharedNotesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryTrainingPlanCollaboratorsArgs = {
  trainingPlanId: Scalars['ID']['input'];
};


export type GQLQueryUserExercisesArgs = {
  where?: InputMaybe<GQLExerciseWhereInput>;
};


export type GQLQueryUserPublicArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryWorkoutExerciseNotesArgs = {
  exerciseNames: Array<Scalars['String']['input']>;
};

export type GQLQuickWorkoutExerciseInput = {
  exerciseId: Scalars['ID']['input'];
  order: Scalars['Int']['input'];
  sets?: InputMaybe<Array<GQLQuickWorkoutSetInput>>;
};

export type GQLQuickWorkoutSetInput = {
  maxReps?: InputMaybe<Scalars['Int']['input']>;
  minReps?: InputMaybe<Scalars['Int']['input']>;
  order: Scalars['Int']['input'];
  reps?: InputMaybe<Scalars['Int']['input']>;
  rpe?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLRemoveAllExercisesFromDayInput = {
  dayId: Scalars['ID']['input'];
};

export type GQLRemoveMealPlanCollaboratorInput = {
  collaboratorId: Scalars['ID']['input'];
};

export type GQLRemoveSubstituteExerciseInput = {
  originalId: Scalars['ID']['input'];
  substituteId: Scalars['ID']['input'];
};

export type GQLRemoveTrainingPlanCollaboratorInput = {
  collaboratorId: Scalars['ID']['input'];
};

export enum GQLRepFocus {
  Endurance = 'ENDURANCE',
  Hypertrophy = 'HYPERTROPHY',
  Strength = 'STRENGTH'
}

export type GQLRespondToCollaborationInvitationInput = {
  action: GQLCollaborationInvitationAction;
  invitationId: Scalars['ID']['input'];
};

export type GQLReview = {
  __typename?: 'Review';
  comment?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  creatorName?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  flagReason?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  flagged: EntireFieldWrapper<Scalars['Boolean']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isEdited: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isHidden: EntireFieldWrapper<Scalars['Boolean']['output']>;
  rating: EntireFieldWrapper<Scalars['Int']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export enum GQLRpeRange {
  Rpe_6_7 = 'RPE_6_7',
  Rpe_7_8 = 'RPE_7_8',
  Rpe_8_10 = 'RPE_8_10'
}

export type GQLSaveMealInput = {
  dayId: Scalars['ID']['input'];
  foods: Array<GQLMealFoodInput>;
  hour: Scalars['Int']['input'];
  instructions?: InputMaybe<Scalars['String']['input']>;
  timezone: Scalars['String']['input'];
};

export type GQLSendCollaborationInvitationInput = {
  message?: InputMaybe<Scalars['String']['input']>;
  recipientEmail: Scalars['String']['input'];
};

export type GQLServiceDelivery = {
  __typename?: 'ServiceDelivery';
  client: EntireFieldWrapper<GQLUser>;
  clientId: EntireFieldWrapper<Scalars['ID']['output']>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  deliveredAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  deliveryNotes?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  packageName: EntireFieldWrapper<Scalars['String']['output']>;
  quantity: EntireFieldWrapper<Scalars['Int']['output']>;
  serviceType?: EntireFieldWrapper<Maybe<GQLServiceType>>;
  status: EntireFieldWrapper<GQLDeliveryStatus>;
  trainer: EntireFieldWrapper<GQLUser>;
  trainerId: EntireFieldWrapper<Scalars['ID']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLServiceTask = {
  __typename?: 'ServiceTask';
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  estimatedDuration?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  intervalDays?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  isRecurring: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isRequired: EntireFieldWrapper<Scalars['Boolean']['output']>;
  location?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  notes?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  order: EntireFieldWrapper<Scalars['Int']['output']>;
  recurrenceCount?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  requiresScheduling: EntireFieldWrapper<Scalars['Boolean']['output']>;
  scheduledAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  serviceDelivery: EntireFieldWrapper<GQLServiceDelivery>;
  serviceDeliveryId: EntireFieldWrapper<Scalars['ID']['output']>;
  status: EntireFieldWrapper<GQLTaskStatus>;
  taskType: EntireFieldWrapper<GQLTaskType>;
  templateId: EntireFieldWrapper<Scalars['String']['output']>;
  title: EntireFieldWrapper<Scalars['String']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export enum GQLServiceType {
  CoachingComplete = 'coaching_complete',
  InPersonMeeting = 'in_person_meeting',
  MealPlan = 'meal_plan',
  PremiumAccess = 'premium_access',
  WorkoutPlan = 'workout_plan'
}

export type GQLStartWorkoutFromFavouriteInput = {
  favouriteWorkoutId: Scalars['ID']['input'];
  replaceExisting?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum GQLSubscriptionDuration {
  Monthly = 'MONTHLY',
  Yearly = 'YEARLY'
}

export type GQLSubscriptionStats = {
  __typename?: 'SubscriptionStats';
  totalLifetimeSubscriptions: EntireFieldWrapper<Scalars['Int']['output']>;
  totalUsers: EntireFieldWrapper<Scalars['Int']['output']>;
  usersWithActiveSubscriptions: EntireFieldWrapper<Scalars['Int']['output']>;
  usersWithExpiredSubscriptions: EntireFieldWrapper<Scalars['Int']['output']>;
  usersWithoutSubscriptions: EntireFieldWrapper<Scalars['Int']['output']>;
};

export enum GQLSubscriptionStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
  Pending = 'PENDING'
}

export type GQLSubstitute = {
  __typename?: 'Substitute';
  additionalInstructions?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  baseId?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  dayId: EntireFieldWrapper<Scalars['ID']['output']>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  difficulty?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  instructions?: EntireFieldWrapper<Maybe<Array<Scalars['String']['output']>>>;
  isPublic: EntireFieldWrapper<Scalars['Boolean']['output']>;
  muscleGroups: EntireFieldWrapper<Array<GQLMuscleGroup>>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  sets: EntireFieldWrapper<Array<GQLExerciseSet>>;
  tips?: EntireFieldWrapper<Maybe<Array<Scalars['String']['output']>>>;
  type?: EntireFieldWrapper<Maybe<GQLExerciseType>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  videoUrl?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
};

export type GQLSuggestedSets = {
  __typename?: 'SuggestedSets';
  reps?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  rpe?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
};

export type GQLSuggestedSetsInput = {
  reps: Scalars['Int']['input'];
  rpe?: InputMaybe<Scalars['Int']['input']>;
};

export enum GQLTargetGoal {
  AthleticPerformance = 'ATHLETIC_PERFORMANCE',
  BodyRecomposition = 'BODY_RECOMPOSITION',
  FunctionalMovement = 'FUNCTIONAL_MOVEMENT',
  GainMuscle = 'GAIN_MUSCLE',
  GeneralFitness = 'GENERAL_FITNESS',
  ImproveFlexibility = 'IMPROVE_FLEXIBILITY',
  ImprovePosture = 'IMPROVE_POSTURE',
  ImproveSleep = 'IMPROVE_SLEEP',
  ImproveStrength = 'IMPROVE_STRENGTH',
  IncreaseEndurance = 'INCREASE_ENDURANCE',
  InjuryRecovery = 'INJURY_RECOVERY',
  LoseWeight = 'LOSE_WEIGHT',
  MarathonTraining = 'MARATHON_TRAINING',
  PowerliftingCompetition = 'POWERLIFTING_COMPETITION',
  StressRelief = 'STRESS_RELIEF'
}

export enum GQLTaskStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  InProgress = 'IN_PROGRESS',
  Pending = 'PENDING'
}

export enum GQLTaskType {
  Assessment = 'ASSESSMENT',
  CheckIn = 'CHECK_IN',
  Consultation = 'CONSULTATION',
  FollowUp = 'FOLLOW_UP',
  Meeting = 'MEETING',
  PlanCreation = 'PLAN_CREATION',
  PlanDelivery = 'PLAN_DELIVERY'
}

export type GQLTeamMember = {
  __typename?: 'TeamMember';
  addedBy: EntireFieldWrapper<GQLUserPublic>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isCurrentUserSender: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  user: EntireFieldWrapper<GQLUserPublic>;
};

export enum GQLTheme {
  Dark = 'dark',
  Light = 'light',
  System = 'system'
}

export enum GQLTimeFormat {
  H12 = 'h12',
  H24 = 'h24'
}

export type GQLTrainingDay = {
  __typename?: 'TrainingDay';
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  dayOfWeek: EntireFieldWrapper<Scalars['Int']['output']>;
  duration?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  exercises: EntireFieldWrapper<Array<GQLTrainingExercise>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isRestDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  scheduledAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  startedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  trainingWeekId: EntireFieldWrapper<Scalars['ID']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  workoutType?: EntireFieldWrapper<Maybe<GQLWorkoutType>>;
};

export type GQLTrainingExercise = {
  __typename?: 'TrainingExercise';
  additionalInstructions?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  baseId?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  dayId: EntireFieldWrapper<Scalars['ID']['output']>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  difficulty?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  equipment?: EntireFieldWrapper<Maybe<GQLEquipment>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  images: EntireFieldWrapper<Array<GQLImage>>;
  instructions?: EntireFieldWrapper<Maybe<Array<Scalars['String']['output']>>>;
  isExtra: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isPublic: EntireFieldWrapper<Scalars['Boolean']['output']>;
  logs: EntireFieldWrapper<Array<GQLExerciseLog>>;
  muscleGroups: EntireFieldWrapper<Array<GQLMuscleGroup>>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  order: EntireFieldWrapper<Scalars['Int']['output']>;
  restSeconds?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  sets: EntireFieldWrapper<Array<GQLExerciseSet>>;
  substitutedBy?: EntireFieldWrapper<Maybe<GQLSubstitute>>;
  substitutes: EntireFieldWrapper<Array<GQLBaseExerciseSubstitute>>;
  tempo?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  tips?: EntireFieldWrapper<Maybe<Array<Scalars['String']['output']>>>;
  type?: EntireFieldWrapper<Maybe<GQLExerciseType>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  videoUrl?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  warmupSets?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
};

export type GQLTrainingPlan = {
  __typename?: 'TrainingPlan';
  active: EntireFieldWrapper<Scalars['Boolean']['output']>;
  adherence: EntireFieldWrapper<Scalars['Float']['output']>;
  assignedCount: EntireFieldWrapper<Scalars['Int']['output']>;
  assignedTo?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  assignmentCount: EntireFieldWrapper<Scalars['Int']['output']>;
  avgSessionTime?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  collaboratorCount: EntireFieldWrapper<Scalars['Int']['output']>;
  collaborators: EntireFieldWrapper<Array<GQLTrainingPlanCollaborator>>;
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  completedWorkoutsDays: EntireFieldWrapper<Scalars['Int']['output']>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  createdBy?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  currentWeekNumber?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  difficulty?: EntireFieldWrapper<Maybe<GQLDifficulty>>;
  endDate?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  equipment: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  focusTags: EntireFieldWrapper<Array<GQLFocusTag>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isDemo: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isDraft: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isPremium?: EntireFieldWrapper<Maybe<Scalars['Boolean']['output']>>;
  isPublic: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isTemplate: EntireFieldWrapper<Scalars['Boolean']['output']>;
  lastSessionActivity?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  nextSession?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  premium: EntireFieldWrapper<Scalars['Boolean']['output']>;
  progress?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  rating?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  reviews: EntireFieldWrapper<Array<GQLReview>>;
  sessionsPerWeek?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  startDate?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  targetGoals: EntireFieldWrapper<Array<GQLTargetGoal>>;
  title: EntireFieldWrapper<Scalars['String']['output']>;
  totalReviews: EntireFieldWrapper<Scalars['Int']['output']>;
  totalWorkouts: EntireFieldWrapper<Scalars['Int']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  userReview?: EntireFieldWrapper<Maybe<GQLReview>>;
  weekCount: EntireFieldWrapper<Scalars['Int']['output']>;
  weeks: EntireFieldWrapper<Array<GQLTrainingWeek>>;
};

export type GQLTrainingPlanCollaborator = {
  __typename?: 'TrainingPlanCollaborator';
  addedBy: EntireFieldWrapper<GQLUserPublic>;
  collaborator: EntireFieldWrapper<GQLUserPublic>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  permission: EntireFieldWrapper<GQLCollaborationPermission>;
  trainingPlan: EntireFieldWrapper<GQLTrainingPlan>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export enum GQLTrainingView {
  Advanced = 'ADVANCED',
  Simple = 'SIMPLE'
}

export type GQLTrainingWeek = {
  __typename?: 'TrainingWeek';
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  days: EntireFieldWrapper<Array<GQLTrainingDay>>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isExtra: EntireFieldWrapper<Scalars['Boolean']['output']>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  scheduledAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  trainingPlanId: EntireFieldWrapper<Scalars['ID']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  weekNumber: EntireFieldWrapper<Scalars['Int']['output']>;
};

export type GQLUpdateBodyMeasurementInput = {
  bicepsLeft?: InputMaybe<Scalars['Float']['input']>;
  bicepsRight?: InputMaybe<Scalars['Float']['input']>;
  bodyFat?: InputMaybe<Scalars['Float']['input']>;
  calfLeft?: InputMaybe<Scalars['Float']['input']>;
  calfRight?: InputMaybe<Scalars['Float']['input']>;
  chest?: InputMaybe<Scalars['Float']['input']>;
  hips?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  measuredAt?: InputMaybe<Scalars['String']['input']>;
  neck?: InputMaybe<Scalars['Float']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  thighLeft?: InputMaybe<Scalars['Float']['input']>;
  thighRight?: InputMaybe<Scalars['Float']['input']>;
  waist?: InputMaybe<Scalars['Float']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLUpdateExerciseFormInput = {
  additionalInstructions?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<Scalars['String']['input']>;
  exerciseId: Scalars['ID']['input'];
  instructions?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  sets?: InputMaybe<Array<GQLUpdateExerciseSetFormInput>>;
  tempo?: InputMaybe<Scalars['String']['input']>;
  tips?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<GQLExerciseType>;
  warmupSets?: InputMaybe<Scalars['Int']['input']>;
};

export type GQLUpdateExerciseInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  equipment?: InputMaybe<GQLEquipment>;
  imageUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  muscleGroups: Array<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  secondaryMuscleGroups?: InputMaybe<Array<Scalars['ID']['input']>>;
  substituteIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  videoUrl?: InputMaybe<Scalars['String']['input']>;
};

export type GQLUpdateExerciseSetFormInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  maxReps?: InputMaybe<Scalars['Int']['input']>;
  minReps?: InputMaybe<Scalars['Int']['input']>;
  order: Scalars['Int']['input'];
  rpe?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLUpdateExerciseSetInput = {
  id: Scalars['ID']['input'];
  maxReps?: InputMaybe<Scalars['Int']['input']>;
  minReps?: InputMaybe<Scalars['Int']['input']>;
  order: Scalars['Int']['input'];
  reps?: InputMaybe<Scalars['Int']['input']>;
  rpe?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLUpdateFavouriteWorkoutExerciseInput = {
  additionalInstructions?: InputMaybe<Scalars['String']['input']>;
  baseId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  instructions?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  order: Scalars['Int']['input'];
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  sets: Array<GQLUpdateFavouriteWorkoutSetInput>;
  tips?: InputMaybe<Array<Scalars['String']['input']>>;
};

export type GQLUpdateFavouriteWorkoutInput = {
  additionalInstructions?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<Scalars['String']['input']>;
  exercises?: InputMaybe<Array<GQLUpdateFavouriteWorkoutExerciseInput>>;
  id: Scalars['ID']['input'];
  instructions?: InputMaybe<Array<Scalars['String']['input']>>;
  tips?: InputMaybe<Array<Scalars['String']['input']>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type GQLUpdateFavouriteWorkoutSetInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  maxReps?: InputMaybe<Scalars['Int']['input']>;
  minReps?: InputMaybe<Scalars['Int']['input']>;
  order: Scalars['Int']['input'];
  reps?: InputMaybe<Scalars['Int']['input']>;
  rpe?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLUpdateMealPlanCollaboratorPermissionInput = {
  collaboratorId: Scalars['ID']['input'];
  permission: GQLCollaborationPermission;
};

export type GQLUpdateMealPlanDetailsInput = {
  dailyCalories?: InputMaybe<Scalars['Float']['input']>;
  dailyCarbs?: InputMaybe<Scalars['Float']['input']>;
  dailyFat?: InputMaybe<Scalars['Float']['input']>;
  dailyProtein?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type GQLUpdateNoteInput = {
  id: Scalars['ID']['input'];
  note: Scalars['String']['input'];
  shareWithClient?: InputMaybe<Scalars['Boolean']['input']>;
  shareWithTrainer?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GQLUpdateNotificationInput = {
  id: Scalars['ID']['input'];
  link?: InputMaybe<Scalars['String']['input']>;
  message?: InputMaybe<Scalars['String']['input']>;
  read?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<GQLNotificationType>;
};

export type GQLUpdateProfileInput = {
  activityLevel?: InputMaybe<GQLActivityLevel>;
  allergies?: InputMaybe<Scalars['String']['input']>;
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  birthday?: InputMaybe<Scalars['String']['input']>;
  credentials?: InputMaybe<Array<Scalars['String']['input']>>;
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  fitnessLevel?: InputMaybe<GQLFitnessLevel>;
  goals?: InputMaybe<Array<GQLGoal>>;
  height?: InputMaybe<Scalars['Float']['input']>;
  heightUnit?: InputMaybe<GQLHeightUnit>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  notificationPreferences?: InputMaybe<GQLNotificationPreferencesInput>;
  phone?: InputMaybe<Scalars['String']['input']>;
  sex?: InputMaybe<Scalars['String']['input']>;
  specialization?: InputMaybe<Array<Scalars['String']['input']>>;
  successStories?: InputMaybe<Array<Scalars['String']['input']>>;
  theme?: InputMaybe<GQLTheme>;
  timeFormat?: InputMaybe<GQLTimeFormat>;
  trainerSince?: InputMaybe<Scalars['String']['input']>;
  trainingView?: InputMaybe<GQLTrainingView>;
  weekStartsOn?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
  weightUnit?: InputMaybe<GQLWeightUnit>;
};

export type GQLUpdatePushSubscriptionInput = {
  id: Scalars['ID']['input'];
  userAgent?: InputMaybe<Scalars['String']['input']>;
};

export type GQLUpdateReviewInput = {
  comment?: InputMaybe<Scalars['String']['input']>;
  rating?: InputMaybe<Scalars['Int']['input']>;
  reviewId: Scalars['ID']['input'];
};

export type GQLUpdateServiceTaskInput = {
  location?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  scheduledAt?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<GQLTaskStatus>;
};

export type GQLUpdateSubstituteExerciseInput = {
  originalId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  substituteId: Scalars['ID']['input'];
};

export type GQLUpdateTrainingDayDataInput = {
  dayId: Scalars['ID']['input'];
  isRestDay?: InputMaybe<Scalars['Boolean']['input']>;
  workoutType?: InputMaybe<GQLWorkoutType>;
};

export type GQLUpdateTrainingDayInput = {
  dayOfWeek: Scalars['Int']['input'];
  exercises?: InputMaybe<Array<GQLUpdateTrainingExerciseInput>>;
  id: Scalars['ID']['input'];
  isRestDay?: InputMaybe<Scalars['Boolean']['input']>;
  workoutType?: InputMaybe<Scalars['String']['input']>;
};

export type GQLUpdateTrainingExerciseInput = {
  additionalInstructions?: InputMaybe<Scalars['String']['input']>;
  baseId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  instructions?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  order: Scalars['Int']['input'];
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  sets?: InputMaybe<Array<GQLUpdateExerciseSetInput>>;
  tempo?: InputMaybe<Scalars['String']['input']>;
  tips?: InputMaybe<Array<Scalars['String']['input']>>;
  type?: InputMaybe<GQLExerciseType>;
  videoUrl?: InputMaybe<Scalars['String']['input']>;
  warmupSets?: InputMaybe<Scalars['Int']['input']>;
};

export type GQLUpdateTrainingPlanCollaboratorPermissionInput = {
  collaboratorId: Scalars['ID']['input'];
  permission: GQLCollaborationPermission;
};

export type GQLUpdateTrainingPlanDetailsInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<GQLDifficulty>;
  focusTags?: InputMaybe<Array<GQLFocusTag>>;
  id: Scalars['ID']['input'];
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  premium?: InputMaybe<Scalars['Boolean']['input']>;
  targetGoals?: InputMaybe<Array<GQLTargetGoal>>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type GQLUpdateTrainingPlanInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<GQLDifficulty>;
  focusTags?: InputMaybe<Array<GQLFocusTag>>;
  id: Scalars['ID']['input'];
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  premium?: InputMaybe<Scalars['Boolean']['input']>;
  targetGoals?: InputMaybe<Array<GQLTargetGoal>>;
  title?: InputMaybe<Scalars['String']['input']>;
  weeks?: InputMaybe<Array<GQLUpdateTrainingWeekInput>>;
};

export type GQLUpdateTrainingWeekDetailsInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  weekNumber?: InputMaybe<Scalars['Int']['input']>;
};

export type GQLUpdateTrainingWeekInput = {
  days?: InputMaybe<Array<GQLUpdateTrainingDayInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  weekNumber: Scalars['Int']['input'];
};

export type GQLUpdateUserFeaturedInput = {
  featured: Scalars['Boolean']['input'];
  userId: Scalars['ID']['input'];
};

export type GQLUpdateUserRoleInput = {
  newRole: GQLUserRole;
  userId: Scalars['ID']['input'];
};

export type GQLUser = {
  __typename?: 'User';
  clients: EntireFieldWrapper<Array<GQLUserPublic>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  createdNotifications: EntireFieldWrapper<Array<GQLNotification>>;
  email: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  image?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  name?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  notifications: EntireFieldWrapper<Array<GQLNotification>>;
  profile?: EntireFieldWrapper<Maybe<GQLUserProfile>>;
  role: EntireFieldWrapper<GQLUserRole>;
  sessions: EntireFieldWrapper<Array<GQLUserSession>>;
  trainer?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLUserBodyMeasure = {
  __typename?: 'UserBodyMeasure';
  bicepsLeft?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  bicepsRight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  bodyFat?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  calfLeft?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  calfRight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  chest?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  hips?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  measuredAt: EntireFieldWrapper<Scalars['String']['output']>;
  neck?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  notes?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  thighLeft?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  thighRight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  waist?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  weight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
};

export type GQLUserProfile = {
  __typename?: 'UserProfile';
  activityLevel?: EntireFieldWrapper<Maybe<GQLActivityLevel>>;
  allergies?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  avatarUrl?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  bio?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  birthday?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  bodyMeasures: EntireFieldWrapper<Array<GQLUserBodyMeasure>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  credentials: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  email?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  firstName?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  fitnessLevel?: EntireFieldWrapper<Maybe<GQLFitnessLevel>>;
  goals: EntireFieldWrapper<Array<GQLGoal>>;
  height?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  heightUnit: EntireFieldWrapper<GQLHeightUnit>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  lastName?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  notificationPreferences: EntireFieldWrapper<GQLNotificationPreferences>;
  phone?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  sex?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  specialization: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  successStories: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  theme: EntireFieldWrapper<GQLTheme>;
  timeFormat: EntireFieldWrapper<GQLTimeFormat>;
  trainerSince?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  trainingView: EntireFieldWrapper<GQLTrainingView>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  weekStartsOn?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  weight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  weightUnit: EntireFieldWrapper<GQLWeightUnit>;
};

export type GQLUserPublic = {
  __typename?: 'UserPublic';
  activePlan?: EntireFieldWrapper<Maybe<GQLTrainingPlan>>;
  allergies?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  averageRating?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  birthday?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  currentWeight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  email: EntireFieldWrapper<Scalars['String']['output']>;
  firstName?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  goals: EntireFieldWrapper<Array<GQLGoal>>;
  height?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  image?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  lastName?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  phone?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  role: EntireFieldWrapper<GQLUserRole>;
  sex?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  yearsOfExperience?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
};

export enum GQLUserRole {
  Admin = 'ADMIN',
  Client = 'CLIENT',
  Trainer = 'TRAINER'
}

export type GQLUserSession = {
  __typename?: 'UserSession';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  expiresAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  otp: EntireFieldWrapper<Scalars['String']['output']>;
  user: EntireFieldWrapper<GQLUser>;
};

export type GQLUserSubscription = {
  __typename?: 'UserSubscription';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  daysUntilExpiry: EntireFieldWrapper<Scalars['Int']['output']>;
  endDate: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isActive: EntireFieldWrapper<Scalars['Boolean']['output']>;
  packageId: EntireFieldWrapper<Scalars['ID']['output']>;
  startDate: EntireFieldWrapper<Scalars['String']['output']>;
  status: EntireFieldWrapper<GQLSubscriptionStatus>;
  stripePriceId?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  stripeSubscriptionId?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  trainer?: EntireFieldWrapper<Maybe<GQLUser>>;
  trainerId?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  userId: EntireFieldWrapper<Scalars['ID']['output']>;
};

export type GQLUserSubscriptionStatus = {
  __typename?: 'UserSubscriptionStatus';
  canAccessMealPlans: EntireFieldWrapper<Scalars['Boolean']['output']>;
  canAccessPremiumExercises: EntireFieldWrapper<Scalars['Boolean']['output']>;
  canAccessPremiumTrainingPlans: EntireFieldWrapper<Scalars['Boolean']['output']>;
  hasPremium: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isInGracePeriod: EntireFieldWrapper<Scalars['Boolean']['output']>;
  subscriptionEndDate?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  trainerId?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
};

export type GQLUserWithSubscription = {
  __typename?: 'UserWithSubscription';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  email: EntireFieldWrapper<Scalars['String']['output']>;
  hasActiveSubscription: EntireFieldWrapper<Scalars['Boolean']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  name?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  role: EntireFieldWrapper<Scalars['String']['output']>;
  subscription?: EntireFieldWrapper<Maybe<GQLUserSubscription>>;
};

export type GQLUsersWithSubscriptionsResult = {
  __typename?: 'UsersWithSubscriptionsResult';
  totalCount: EntireFieldWrapper<Scalars['Int']['output']>;
  users: EntireFieldWrapper<Array<GQLUserWithSubscription>>;
};

export type GQLVolumeEntry = {
  __typename?: 'VolumeEntry';
  totalSets: EntireFieldWrapper<Scalars['Int']['output']>;
  totalVolume: EntireFieldWrapper<Scalars['Float']['output']>;
  week: EntireFieldWrapper<Scalars['String']['output']>;
};

export enum GQLWeightUnit {
  Kg = 'kg',
  Lbs = 'lbs'
}

export type GQLWorkoutExerciseNotes = {
  __typename?: 'WorkoutExerciseNotes';
  exerciseName: EntireFieldWrapper<Scalars['String']['output']>;
  notes: EntireFieldWrapper<Array<GQLNote>>;
};

export enum GQLWorkoutSessionEvent {
  Complete = 'COMPLETE',
  Progress = 'PROGRESS'
}

export enum GQLWorkoutType {
  Abs = 'Abs',
  Arms = 'Arms',
  Back = 'Back',
  Biceps = 'Biceps',
  Calves = 'Calves',
  Cardio = 'Cardio',
  Chest = 'Chest',
  Core = 'Core',
  Custom = 'Custom',
  FullBody = 'FullBody',
  Glutes = 'Glutes',
  Hiit = 'HIIT',
  Hams = 'Hams',
  Liss = 'LISS',
  Legs = 'Legs',
  LowerBody = 'LowerBody',
  Mobility = 'Mobility',
  Pull = 'Pull',
  Push = 'Push',
  Quads = 'Quads',
  Stretching = 'Stretching',
  Triceps = 'Triceps',
  UpperBody = 'UpperBody'
}



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type GQLResolversTypes = {
  ActivityLevel: GQLActivityLevel;
  AddAiExerciseToWorkoutInput: GQLAddAiExerciseToWorkoutInput;
  AddBodyMeasurementInput: GQLAddBodyMeasurementInput;
  AddCustomFoodToMealInput: GQLAddCustomFoodToMealInput;
  AddExerciseToDayInput: GQLAddExerciseToDayInput;
  AddExercisesToWorkoutInput: GQLAddExercisesToWorkoutInput;
  AddFoodToPersonalLogInput: GQLAddFoodToPersonalLogInput;
  AddMealPlanCollaboratorInput: GQLAddMealPlanCollaboratorInput;
  AddSetExerciseFormInput: GQLAddSetExerciseFormInput;
  AddSetExerciseFormSetInput: GQLAddSetExerciseFormSetInput;
  AddSetToExerciseInput: GQLAddSetToExerciseInput;
  AddSubstituteExerciseInput: GQLAddSubstituteExerciseInput;
  AddTrainingPlanCollaboratorInput: GQLAddTrainingPlanCollaboratorInput;
  AddTrainingWeekInput: GQLAddTrainingWeekInput;
  AdminUserFilters: GQLAdminUserFilters;
  AdminUserListItem: ResolverTypeWrapper<GQLAdminUserListItem>;
  AdminUserListResponse: ResolverTypeWrapper<GQLAdminUserListResponse>;
  AdminUserStats: ResolverTypeWrapper<GQLAdminUserStats>;
  AiExerciseSuggestion: ResolverTypeWrapper<GQLAiExerciseSuggestion>;
  AiMeta: ResolverTypeWrapper<GQLAiMeta>;
  AiWorkoutExercise: ResolverTypeWrapper<GQLAiWorkoutExercise>;
  AiWorkoutResult: ResolverTypeWrapper<GQLAiWorkoutResult>;
  AssignMealPlanToClientInput: GQLAssignMealPlanToClientInput;
  AssignTrainingPlanToClientInput: GQLAssignTrainingPlanToClientInput;
  AvailablePlan: ResolverTypeWrapper<GQLAvailablePlan>;
  BaseExercise: ResolverTypeWrapper<GQLBaseExercise>;
  BaseExerciseSubstitute: ResolverTypeWrapper<GQLBaseExerciseSubstitute>;
  BatchLogMealFoodInput: GQLBatchLogMealFoodInput;
  BatchLogMealFoodItemInput: GQLBatchLogMealFoodItemInput;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BulkUpdatePlanPermissionsInput: GQLBulkUpdatePlanPermissionsInput;
  CoachingRequest: ResolverTypeWrapper<GQLCoachingRequest>;
  CoachingRequestStatus: GQLCoachingRequestStatus;
  CollaborationInvitation: ResolverTypeWrapper<GQLCollaborationInvitation>;
  CollaborationInvitationAction: GQLCollaborationInvitationAction;
  CollaborationInvitationStatus: GQLCollaborationInvitationStatus;
  CollaborationPermission: GQLCollaborationPermission;
  CopyExercisesFromDayInput: GQLCopyExercisesFromDayInput;
  CreateExerciseInput: GQLCreateExerciseInput;
  CreateExerciseNoteInput: GQLCreateExerciseNoteInput;
  CreateExerciseSetInput: GQLCreateExerciseSetInput;
  CreateFavouriteWorkoutExerciseInput: GQLCreateFavouriteWorkoutExerciseInput;
  CreateFavouriteWorkoutInput: GQLCreateFavouriteWorkoutInput;
  CreateFavouriteWorkoutSetInput: GQLCreateFavouriteWorkoutSetInput;
  CreateMealDayInput: GQLCreateMealDayInput;
  CreateMealFoodInput: GQLCreateMealFoodInput;
  CreateMealInput: GQLCreateMealInput;
  CreateMealPlanInput: GQLCreateMealPlanInput;
  CreateMealPlanPayload: ResolverTypeWrapper<GQLCreateMealPlanPayload>;
  CreateMealWeekInput: GQLCreateMealWeekInput;
  CreateNoteInput: GQLCreateNoteInput;
  CreateNoteReplyInput: GQLCreateNoteReplyInput;
  CreateNotificationInput: GQLCreateNotificationInput;
  CreatePushSubscriptionInput: GQLCreatePushSubscriptionInput;
  CreateQuickWorkoutInput: GQLCreateQuickWorkoutInput;
  CreateReviewInput: GQLCreateReviewInput;
  CreateTrainerNoteForClientInput: GQLCreateTrainerNoteForClientInput;
  CreateTrainingDayInput: GQLCreateTrainingDayInput;
  CreateTrainingExerciseInput: GQLCreateTrainingExerciseInput;
  CreateTrainingPlanInput: GQLCreateTrainingPlanInput;
  CreateTrainingPlanPayload: ResolverTypeWrapper<GQLCreateTrainingPlanPayload>;
  CreateTrainingWeekInput: GQLCreateTrainingWeekInput;
  CurrentWorkoutWeekPayload: ResolverTypeWrapper<GQLCurrentWorkoutWeekPayload>;
  DeleteReviewInput: GQLDeleteReviewInput;
  DeliveryStatus: GQLDeliveryStatus;
  Difficulty: GQLDifficulty;
  DuplicateTrainingWeekInput: GQLDuplicateTrainingWeekInput;
  Equipment: GQLEquipment;
  ExerciseLog: ResolverTypeWrapper<GQLExerciseLog>;
  ExerciseProgress: ResolverTypeWrapper<GQLExerciseProgress>;
  ExerciseSet: ResolverTypeWrapper<GQLExerciseSet>;
  ExerciseSetLog: ResolverTypeWrapper<GQLExerciseSetLog>;
  ExerciseType: GQLExerciseType;
  ExerciseWhereInput: GQLExerciseWhereInput;
  FavouriteWorkout: ResolverTypeWrapper<GQLFavouriteWorkout>;
  FavouriteWorkoutExercise: ResolverTypeWrapper<GQLFavouriteWorkoutExercise>;
  FavouriteWorkoutSet: ResolverTypeWrapper<GQLFavouriteWorkoutSet>;
  FitnessLevel: GQLFitnessLevel;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  FocusTag: GQLFocusTag;
  GenerateAiWorkoutInput: GQLGenerateAiWorkoutInput;
  GetExercisesResponse: ResolverTypeWrapper<GQLGetExercisesResponse>;
  GetMealPlanPayload: ResolverTypeWrapper<GQLGetMealPlanPayload>;
  GetWorkoutPayload: ResolverTypeWrapper<GQLGetWorkoutPayload>;
  Goal: GQLGoal;
  HeightUnit: GQLHeightUnit;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Image: ResolverTypeWrapper<GQLImage>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LogSetInput: GQLLogSetInput;
  Meal: ResolverTypeWrapper<GQLMeal>;
  MealDay: ResolverTypeWrapper<GQLMealDay>;
  MealFood: ResolverTypeWrapper<GQLMealFood>;
  MealFoodInput: GQLMealFoodInput;
  MealFoodLog: ResolverTypeWrapper<GQLMealFoodLog>;
  MealPlan: ResolverTypeWrapper<GQLMealPlan>;
  MealPlanCollaborator: ResolverTypeWrapper<GQLMealPlanCollaborator>;
  MealWeek: ResolverTypeWrapper<GQLMealWeek>;
  ModerateReviewInput: GQLModerateReviewInput;
  MoveExerciseInput: GQLMoveExerciseInput;
  MuscleGroup: ResolverTypeWrapper<GQLMuscleGroup>;
  MuscleGroupCategory: ResolverTypeWrapper<GQLMuscleGroupCategory>;
  Mutation: ResolverTypeWrapper<{}>;
  MyMealPlansPayload: ResolverTypeWrapper<GQLMyMealPlansPayload>;
  MyPlansPayload: ResolverTypeWrapper<GQLMyPlansPayload>;
  Note: ResolverTypeWrapper<GQLNote>;
  Notification: ResolverTypeWrapper<GQLNotification>;
  NotificationPreferences: ResolverTypeWrapper<GQLNotificationPreferences>;
  NotificationPreferencesInput: GQLNotificationPreferencesInput;
  NotificationType: GQLNotificationType;
  OneRmEntry: ResolverTypeWrapper<GQLOneRmEntry>;
  OneRmLog: ResolverTypeWrapper<GQLOneRmLog>;
  PackageTemplate: ResolverTypeWrapper<GQLPackageTemplate>;
  PlanCollaboratorSummary: ResolverTypeWrapper<GQLPlanCollaboratorSummary>;
  PlanPermissionUpdateInput: GQLPlanPermissionUpdateInput;
  PlanWithPermissions: ResolverTypeWrapper<GQLPlanWithPermissions>;
  PublicTrainer: ResolverTypeWrapper<GQLPublicTrainer>;
  PushSubscription: ResolverTypeWrapper<GQLPushSubscription>;
  Query: ResolverTypeWrapper<{}>;
  QuickWorkoutExerciseInput: GQLQuickWorkoutExerciseInput;
  QuickWorkoutSetInput: GQLQuickWorkoutSetInput;
  RemoveAllExercisesFromDayInput: GQLRemoveAllExercisesFromDayInput;
  RemoveMealPlanCollaboratorInput: GQLRemoveMealPlanCollaboratorInput;
  RemoveSubstituteExerciseInput: GQLRemoveSubstituteExerciseInput;
  RemoveTrainingPlanCollaboratorInput: GQLRemoveTrainingPlanCollaboratorInput;
  RepFocus: GQLRepFocus;
  RespondToCollaborationInvitationInput: GQLRespondToCollaborationInvitationInput;
  Review: ResolverTypeWrapper<GQLReview>;
  RpeRange: GQLRpeRange;
  SaveMealInput: GQLSaveMealInput;
  SendCollaborationInvitationInput: GQLSendCollaborationInvitationInput;
  ServiceDelivery: ResolverTypeWrapper<GQLServiceDelivery>;
  ServiceTask: ResolverTypeWrapper<GQLServiceTask>;
  ServiceType: GQLServiceType;
  StartWorkoutFromFavouriteInput: GQLStartWorkoutFromFavouriteInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  SubscriptionDuration: GQLSubscriptionDuration;
  SubscriptionStats: ResolverTypeWrapper<GQLSubscriptionStats>;
  SubscriptionStatus: GQLSubscriptionStatus;
  Substitute: ResolverTypeWrapper<GQLSubstitute>;
  SuggestedSets: ResolverTypeWrapper<GQLSuggestedSets>;
  SuggestedSetsInput: GQLSuggestedSetsInput;
  TargetGoal: GQLTargetGoal;
  TaskStatus: GQLTaskStatus;
  TaskType: GQLTaskType;
  TeamMember: ResolverTypeWrapper<GQLTeamMember>;
  Theme: GQLTheme;
  TimeFormat: GQLTimeFormat;
  TrainingDay: ResolverTypeWrapper<GQLTrainingDay>;
  TrainingExercise: ResolverTypeWrapper<GQLTrainingExercise>;
  TrainingPlan: ResolverTypeWrapper<GQLTrainingPlan>;
  TrainingPlanCollaborator: ResolverTypeWrapper<GQLTrainingPlanCollaborator>;
  TrainingView: GQLTrainingView;
  TrainingWeek: ResolverTypeWrapper<GQLTrainingWeek>;
  UpdateBodyMeasurementInput: GQLUpdateBodyMeasurementInput;
  UpdateExerciseFormInput: GQLUpdateExerciseFormInput;
  UpdateExerciseInput: GQLUpdateExerciseInput;
  UpdateExerciseSetFormInput: GQLUpdateExerciseSetFormInput;
  UpdateExerciseSetInput: GQLUpdateExerciseSetInput;
  UpdateFavouriteWorkoutExerciseInput: GQLUpdateFavouriteWorkoutExerciseInput;
  UpdateFavouriteWorkoutInput: GQLUpdateFavouriteWorkoutInput;
  UpdateFavouriteWorkoutSetInput: GQLUpdateFavouriteWorkoutSetInput;
  UpdateMealPlanCollaboratorPermissionInput: GQLUpdateMealPlanCollaboratorPermissionInput;
  UpdateMealPlanDetailsInput: GQLUpdateMealPlanDetailsInput;
  UpdateNoteInput: GQLUpdateNoteInput;
  UpdateNotificationInput: GQLUpdateNotificationInput;
  UpdateProfileInput: GQLUpdateProfileInput;
  UpdatePushSubscriptionInput: GQLUpdatePushSubscriptionInput;
  UpdateReviewInput: GQLUpdateReviewInput;
  UpdateServiceTaskInput: GQLUpdateServiceTaskInput;
  UpdateSubstituteExerciseInput: GQLUpdateSubstituteExerciseInput;
  UpdateTrainingDayDataInput: GQLUpdateTrainingDayDataInput;
  UpdateTrainingDayInput: GQLUpdateTrainingDayInput;
  UpdateTrainingExerciseInput: GQLUpdateTrainingExerciseInput;
  UpdateTrainingPlanCollaboratorPermissionInput: GQLUpdateTrainingPlanCollaboratorPermissionInput;
  UpdateTrainingPlanDetailsInput: GQLUpdateTrainingPlanDetailsInput;
  UpdateTrainingPlanInput: GQLUpdateTrainingPlanInput;
  UpdateTrainingWeekDetailsInput: GQLUpdateTrainingWeekDetailsInput;
  UpdateTrainingWeekInput: GQLUpdateTrainingWeekInput;
  UpdateUserFeaturedInput: GQLUpdateUserFeaturedInput;
  UpdateUserRoleInput: GQLUpdateUserRoleInput;
  User: ResolverTypeWrapper<GQLUser>;
  UserBodyMeasure: ResolverTypeWrapper<GQLUserBodyMeasure>;
  UserProfile: ResolverTypeWrapper<GQLUserProfile>;
  UserPublic: ResolverTypeWrapper<GQLUserPublic>;
  UserRole: GQLUserRole;
  UserSession: ResolverTypeWrapper<GQLUserSession>;
  UserSubscription: ResolverTypeWrapper<GQLUserSubscription>;
  UserSubscriptionStatus: ResolverTypeWrapper<GQLUserSubscriptionStatus>;
  UserWithSubscription: ResolverTypeWrapper<GQLUserWithSubscription>;
  UsersWithSubscriptionsResult: ResolverTypeWrapper<GQLUsersWithSubscriptionsResult>;
  VolumeEntry: ResolverTypeWrapper<GQLVolumeEntry>;
  WeightUnit: GQLWeightUnit;
  WorkoutExerciseNotes: ResolverTypeWrapper<GQLWorkoutExerciseNotes>;
  WorkoutSessionEvent: GQLWorkoutSessionEvent;
  WorkoutType: GQLWorkoutType;
};

/** Mapping between all available schema types and the resolvers parents */
export type GQLResolversParentTypes = {
  AddAiExerciseToWorkoutInput: GQLAddAiExerciseToWorkoutInput;
  AddBodyMeasurementInput: GQLAddBodyMeasurementInput;
  AddCustomFoodToMealInput: GQLAddCustomFoodToMealInput;
  AddExerciseToDayInput: GQLAddExerciseToDayInput;
  AddExercisesToWorkoutInput: GQLAddExercisesToWorkoutInput;
  AddFoodToPersonalLogInput: GQLAddFoodToPersonalLogInput;
  AddMealPlanCollaboratorInput: GQLAddMealPlanCollaboratorInput;
  AddSetExerciseFormInput: GQLAddSetExerciseFormInput;
  AddSetExerciseFormSetInput: GQLAddSetExerciseFormSetInput;
  AddSetToExerciseInput: GQLAddSetToExerciseInput;
  AddSubstituteExerciseInput: GQLAddSubstituteExerciseInput;
  AddTrainingPlanCollaboratorInput: GQLAddTrainingPlanCollaboratorInput;
  AddTrainingWeekInput: GQLAddTrainingWeekInput;
  AdminUserFilters: GQLAdminUserFilters;
  AdminUserListItem: GQLAdminUserListItem;
  AdminUserListResponse: GQLAdminUserListResponse;
  AdminUserStats: GQLAdminUserStats;
  AiExerciseSuggestion: GQLAiExerciseSuggestion;
  AiMeta: GQLAiMeta;
  AiWorkoutExercise: GQLAiWorkoutExercise;
  AiWorkoutResult: GQLAiWorkoutResult;
  AssignMealPlanToClientInput: GQLAssignMealPlanToClientInput;
  AssignTrainingPlanToClientInput: GQLAssignTrainingPlanToClientInput;
  AvailablePlan: GQLAvailablePlan;
  BaseExercise: GQLBaseExercise;
  BaseExerciseSubstitute: GQLBaseExerciseSubstitute;
  BatchLogMealFoodInput: GQLBatchLogMealFoodInput;
  BatchLogMealFoodItemInput: GQLBatchLogMealFoodItemInput;
  Boolean: Scalars['Boolean']['output'];
  BulkUpdatePlanPermissionsInput: GQLBulkUpdatePlanPermissionsInput;
  CoachingRequest: GQLCoachingRequest;
  CollaborationInvitation: GQLCollaborationInvitation;
  CopyExercisesFromDayInput: GQLCopyExercisesFromDayInput;
  CreateExerciseInput: GQLCreateExerciseInput;
  CreateExerciseNoteInput: GQLCreateExerciseNoteInput;
  CreateExerciseSetInput: GQLCreateExerciseSetInput;
  CreateFavouriteWorkoutExerciseInput: GQLCreateFavouriteWorkoutExerciseInput;
  CreateFavouriteWorkoutInput: GQLCreateFavouriteWorkoutInput;
  CreateFavouriteWorkoutSetInput: GQLCreateFavouriteWorkoutSetInput;
  CreateMealDayInput: GQLCreateMealDayInput;
  CreateMealFoodInput: GQLCreateMealFoodInput;
  CreateMealInput: GQLCreateMealInput;
  CreateMealPlanInput: GQLCreateMealPlanInput;
  CreateMealPlanPayload: GQLCreateMealPlanPayload;
  CreateMealWeekInput: GQLCreateMealWeekInput;
  CreateNoteInput: GQLCreateNoteInput;
  CreateNoteReplyInput: GQLCreateNoteReplyInput;
  CreateNotificationInput: GQLCreateNotificationInput;
  CreatePushSubscriptionInput: GQLCreatePushSubscriptionInput;
  CreateQuickWorkoutInput: GQLCreateQuickWorkoutInput;
  CreateReviewInput: GQLCreateReviewInput;
  CreateTrainerNoteForClientInput: GQLCreateTrainerNoteForClientInput;
  CreateTrainingDayInput: GQLCreateTrainingDayInput;
  CreateTrainingExerciseInput: GQLCreateTrainingExerciseInput;
  CreateTrainingPlanInput: GQLCreateTrainingPlanInput;
  CreateTrainingPlanPayload: GQLCreateTrainingPlanPayload;
  CreateTrainingWeekInput: GQLCreateTrainingWeekInput;
  CurrentWorkoutWeekPayload: GQLCurrentWorkoutWeekPayload;
  DeleteReviewInput: GQLDeleteReviewInput;
  DuplicateTrainingWeekInput: GQLDuplicateTrainingWeekInput;
  ExerciseLog: GQLExerciseLog;
  ExerciseProgress: GQLExerciseProgress;
  ExerciseSet: GQLExerciseSet;
  ExerciseSetLog: GQLExerciseSetLog;
  ExerciseWhereInput: GQLExerciseWhereInput;
  FavouriteWorkout: GQLFavouriteWorkout;
  FavouriteWorkoutExercise: GQLFavouriteWorkoutExercise;
  FavouriteWorkoutSet: GQLFavouriteWorkoutSet;
  Float: Scalars['Float']['output'];
  GenerateAiWorkoutInput: GQLGenerateAiWorkoutInput;
  GetExercisesResponse: GQLGetExercisesResponse;
  GetMealPlanPayload: GQLGetMealPlanPayload;
  GetWorkoutPayload: GQLGetWorkoutPayload;
  ID: Scalars['ID']['output'];
  Image: GQLImage;
  Int: Scalars['Int']['output'];
  LogSetInput: GQLLogSetInput;
  Meal: GQLMeal;
  MealDay: GQLMealDay;
  MealFood: GQLMealFood;
  MealFoodInput: GQLMealFoodInput;
  MealFoodLog: GQLMealFoodLog;
  MealPlan: GQLMealPlan;
  MealPlanCollaborator: GQLMealPlanCollaborator;
  MealWeek: GQLMealWeek;
  ModerateReviewInput: GQLModerateReviewInput;
  MoveExerciseInput: GQLMoveExerciseInput;
  MuscleGroup: GQLMuscleGroup;
  MuscleGroupCategory: GQLMuscleGroupCategory;
  Mutation: {};
  MyMealPlansPayload: GQLMyMealPlansPayload;
  MyPlansPayload: GQLMyPlansPayload;
  Note: GQLNote;
  Notification: GQLNotification;
  NotificationPreferences: GQLNotificationPreferences;
  NotificationPreferencesInput: GQLNotificationPreferencesInput;
  OneRmEntry: GQLOneRmEntry;
  OneRmLog: GQLOneRmLog;
  PackageTemplate: GQLPackageTemplate;
  PlanCollaboratorSummary: GQLPlanCollaboratorSummary;
  PlanPermissionUpdateInput: GQLPlanPermissionUpdateInput;
  PlanWithPermissions: GQLPlanWithPermissions;
  PublicTrainer: GQLPublicTrainer;
  PushSubscription: GQLPushSubscription;
  Query: {};
  QuickWorkoutExerciseInput: GQLQuickWorkoutExerciseInput;
  QuickWorkoutSetInput: GQLQuickWorkoutSetInput;
  RemoveAllExercisesFromDayInput: GQLRemoveAllExercisesFromDayInput;
  RemoveMealPlanCollaboratorInput: GQLRemoveMealPlanCollaboratorInput;
  RemoveSubstituteExerciseInput: GQLRemoveSubstituteExerciseInput;
  RemoveTrainingPlanCollaboratorInput: GQLRemoveTrainingPlanCollaboratorInput;
  RespondToCollaborationInvitationInput: GQLRespondToCollaborationInvitationInput;
  Review: GQLReview;
  SaveMealInput: GQLSaveMealInput;
  SendCollaborationInvitationInput: GQLSendCollaborationInvitationInput;
  ServiceDelivery: GQLServiceDelivery;
  ServiceTask: GQLServiceTask;
  StartWorkoutFromFavouriteInput: GQLStartWorkoutFromFavouriteInput;
  String: Scalars['String']['output'];
  SubscriptionStats: GQLSubscriptionStats;
  Substitute: GQLSubstitute;
  SuggestedSets: GQLSuggestedSets;
  SuggestedSetsInput: GQLSuggestedSetsInput;
  TeamMember: GQLTeamMember;
  TrainingDay: GQLTrainingDay;
  TrainingExercise: GQLTrainingExercise;
  TrainingPlan: GQLTrainingPlan;
  TrainingPlanCollaborator: GQLTrainingPlanCollaborator;
  TrainingWeek: GQLTrainingWeek;
  UpdateBodyMeasurementInput: GQLUpdateBodyMeasurementInput;
  UpdateExerciseFormInput: GQLUpdateExerciseFormInput;
  UpdateExerciseInput: GQLUpdateExerciseInput;
  UpdateExerciseSetFormInput: GQLUpdateExerciseSetFormInput;
  UpdateExerciseSetInput: GQLUpdateExerciseSetInput;
  UpdateFavouriteWorkoutExerciseInput: GQLUpdateFavouriteWorkoutExerciseInput;
  UpdateFavouriteWorkoutInput: GQLUpdateFavouriteWorkoutInput;
  UpdateFavouriteWorkoutSetInput: GQLUpdateFavouriteWorkoutSetInput;
  UpdateMealPlanCollaboratorPermissionInput: GQLUpdateMealPlanCollaboratorPermissionInput;
  UpdateMealPlanDetailsInput: GQLUpdateMealPlanDetailsInput;
  UpdateNoteInput: GQLUpdateNoteInput;
  UpdateNotificationInput: GQLUpdateNotificationInput;
  UpdateProfileInput: GQLUpdateProfileInput;
  UpdatePushSubscriptionInput: GQLUpdatePushSubscriptionInput;
  UpdateReviewInput: GQLUpdateReviewInput;
  UpdateServiceTaskInput: GQLUpdateServiceTaskInput;
  UpdateSubstituteExerciseInput: GQLUpdateSubstituteExerciseInput;
  UpdateTrainingDayDataInput: GQLUpdateTrainingDayDataInput;
  UpdateTrainingDayInput: GQLUpdateTrainingDayInput;
  UpdateTrainingExerciseInput: GQLUpdateTrainingExerciseInput;
  UpdateTrainingPlanCollaboratorPermissionInput: GQLUpdateTrainingPlanCollaboratorPermissionInput;
  UpdateTrainingPlanDetailsInput: GQLUpdateTrainingPlanDetailsInput;
  UpdateTrainingPlanInput: GQLUpdateTrainingPlanInput;
  UpdateTrainingWeekDetailsInput: GQLUpdateTrainingWeekDetailsInput;
  UpdateTrainingWeekInput: GQLUpdateTrainingWeekInput;
  UpdateUserFeaturedInput: GQLUpdateUserFeaturedInput;
  UpdateUserRoleInput: GQLUpdateUserRoleInput;
  User: GQLUser;
  UserBodyMeasure: GQLUserBodyMeasure;
  UserProfile: GQLUserProfile;
  UserPublic: GQLUserPublic;
  UserSession: GQLUserSession;
  UserSubscription: GQLUserSubscription;
  UserSubscriptionStatus: GQLUserSubscriptionStatus;
  UserWithSubscription: GQLUserWithSubscription;
  UsersWithSubscriptionsResult: GQLUsersWithSubscriptionsResult;
  VolumeEntry: GQLVolumeEntry;
  WorkoutExerciseNotes: GQLWorkoutExerciseNotes;
};

export type GQLAdminUserListItemResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['AdminUserListItem'] = GQLResolversParentTypes['AdminUserListItem']> = {
  clientCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  featured?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  lastLoginAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  profile?: Resolver<Maybe<GQLResolversTypes['UserProfile']>, ParentType, ContextType>;
  role?: Resolver<GQLResolversTypes['UserRole'], ParentType, ContextType>;
  sessionCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  trainer?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLAdminUserListResponseResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['AdminUserListResponse'] = GQLResolversParentTypes['AdminUserListResponse']> = {
  hasMore?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  total?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  users?: Resolver<Array<GQLResolversTypes['AdminUserListItem']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLAdminUserStatsResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['AdminUserStats'] = GQLResolversParentTypes['AdminUserStats']> = {
  activeUsers?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  inactiveUsers?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  recentSignups?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  totalAdmins?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  totalClients?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  totalTrainers?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  totalUsers?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  usersWithoutProfiles?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLAiExerciseSuggestionResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['AiExerciseSuggestion'] = GQLResolversParentTypes['AiExerciseSuggestion']> = {
  aiMeta?: Resolver<GQLResolversTypes['AiMeta'], ParentType, ContextType>;
  exercise?: Resolver<GQLResolversTypes['BaseExercise'], ParentType, ContextType>;
  sets?: Resolver<Array<Maybe<GQLResolversTypes['SuggestedSets']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLAiMetaResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['AiMeta'] = GQLResolversParentTypes['AiMeta']> = {
  explanation?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLAiWorkoutExerciseResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['AiWorkoutExercise'] = GQLResolversParentTypes['AiWorkoutExercise']> = {
  exercise?: Resolver<GQLResolversTypes['BaseExercise'], ParentType, ContextType>;
  order?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  sets?: Resolver<Array<Maybe<GQLResolversTypes['SuggestedSets']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLAiWorkoutResultResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['AiWorkoutResult'] = GQLResolversParentTypes['AiWorkoutResult']> = {
  exercises?: Resolver<Array<GQLResolversTypes['AiWorkoutExercise']>, ParentType, ContextType>;
  totalDuration?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLAvailablePlanResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['AvailablePlan'] = GQLResolversParentTypes['AvailablePlan']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isTemplate?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  planType?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLBaseExerciseResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['BaseExercise'] = GQLResolversParentTypes['BaseExercise']> = {
  additionalInstructions?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  canBeSubstitutedBy?: Resolver<Array<GQLResolversTypes['BaseExerciseSubstitute']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  difficulty?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  equipment?: Resolver<Maybe<GQLResolversTypes['Equipment']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Array<GQLResolversTypes['Image']>, ParentType, ContextType>;
  instructions?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  isPremium?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isPublic?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  muscleGroupCategories?: Resolver<Array<GQLResolversTypes['MuscleGroupCategory']>, ParentType, ContextType>;
  muscleGroups?: Resolver<Array<GQLResolversTypes['MuscleGroup']>, ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  secondaryMuscleGroups?: Resolver<Array<GQLResolversTypes['MuscleGroup']>, ParentType, ContextType>;
  substitutes?: Resolver<Array<GQLResolversTypes['BaseExerciseSubstitute']>, ParentType, ContextType>;
  tips?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<GQLResolversTypes['ExerciseType']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  version?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  videoUrl?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLBaseExerciseSubstituteResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['BaseExerciseSubstitute'] = GQLResolversParentTypes['BaseExerciseSubstitute']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  original?: Resolver<GQLResolversTypes['BaseExercise'], ParentType, ContextType>;
  originalId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  reason?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  substitute?: Resolver<GQLResolversTypes['BaseExercise'], ParentType, ContextType>;
  substituteId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLCoachingRequestResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['CoachingRequest'] = GQLResolversParentTypes['CoachingRequest']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  message?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  recipient?: Resolver<GQLResolversTypes['User'], ParentType, ContextType>;
  sender?: Resolver<GQLResolversTypes['User'], ParentType, ContextType>;
  status?: Resolver<GQLResolversTypes['CoachingRequestStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLCollaborationInvitationResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['CollaborationInvitation'] = GQLResolversParentTypes['CollaborationInvitation']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  message?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  recipient?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  sender?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  status?: Resolver<GQLResolversTypes['CollaborationInvitationStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLCreateMealPlanPayloadResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['CreateMealPlanPayload'] = GQLResolversParentTypes['CreateMealPlanPayload']> = {
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  success?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLCreateTrainingPlanPayloadResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['CreateTrainingPlanPayload'] = GQLResolversParentTypes['CreateTrainingPlanPayload']> = {
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  success?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLCurrentWorkoutWeekPayloadResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['CurrentWorkoutWeekPayload'] = GQLResolversParentTypes['CurrentWorkoutWeekPayload']> = {
  currentWeekIndex?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  plan?: Resolver<Maybe<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType>;
  totalWeeks?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLExerciseLogResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['ExerciseLog'] = GQLResolversParentTypes['ExerciseLog']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  exerciseId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  notes?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  performedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLExerciseProgressResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['ExerciseProgress'] = GQLResolversParentTypes['ExerciseProgress']> = {
  averageRpe?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  baseExercise?: Resolver<Maybe<GQLResolversTypes['BaseExercise']>, ParentType, ContextType>;
  estimated1RMProgress?: Resolver<Array<GQLResolversTypes['OneRmEntry']>, ParentType, ContextType>;
  lastPerformed?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  totalSets?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  totalVolumeProgress?: Resolver<Array<GQLResolversTypes['VolumeEntry']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLExerciseSetResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['ExerciseSet'] = GQLResolversParentTypes['ExerciseSet']> = {
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  exerciseId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isExtra?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  log?: Resolver<Maybe<GQLResolversTypes['ExerciseSetLog']>, ParentType, ContextType>;
  maxReps?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  minReps?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  order?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  reps?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  rpe?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  weight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLExerciseSetLogResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['ExerciseSetLog'] = GQLResolversParentTypes['ExerciseSetLog']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  reps?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  rpe?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  weight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLFavouriteWorkoutResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['FavouriteWorkout'] = GQLResolversParentTypes['FavouriteWorkout']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  createdById?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  exercises?: Resolver<Array<GQLResolversTypes['FavouriteWorkoutExercise']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLFavouriteWorkoutExerciseResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['FavouriteWorkoutExercise'] = GQLResolversParentTypes['FavouriteWorkoutExercise']> = {
  additionalInstructions?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  base?: Resolver<Maybe<GQLResolversTypes['BaseExercise']>, ParentType, ContextType>;
  baseId?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  difficulty?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  favouriteWorkoutId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  instructions?: Resolver<Maybe<Array<GQLResolversTypes['String']>>, ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  order?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  restSeconds?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  sets?: Resolver<Array<GQLResolversTypes['FavouriteWorkoutSet']>, ParentType, ContextType>;
  tips?: Resolver<Maybe<Array<GQLResolversTypes['String']>>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLFavouriteWorkoutSetResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['FavouriteWorkoutSet'] = GQLResolversParentTypes['FavouriteWorkoutSet']> = {
  exerciseId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  maxReps?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  minReps?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  order?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  reps?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  rpe?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  weight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLGetExercisesResponseResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['GetExercisesResponse'] = GQLResolversParentTypes['GetExercisesResponse']> = {
  publicExercises?: Resolver<Array<GQLResolversTypes['BaseExercise']>, ParentType, ContextType>;
  trainerExercises?: Resolver<Array<GQLResolversTypes['BaseExercise']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLGetMealPlanPayloadResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['GetMealPlanPayload'] = GQLResolversParentTypes['GetMealPlanPayload']> = {
  plan?: Resolver<GQLResolversTypes['MealPlan'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLGetWorkoutPayloadResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['GetWorkoutPayload'] = GQLResolversParentTypes['GetWorkoutPayload']> = {
  plan?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLImageResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Image'] = GQLResolversParentTypes['Image']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  entityId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  entityType?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  order?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMealResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Meal'] = GQLResolversParentTypes['Meal']> = {
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  dateTime?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  day?: Resolver<Maybe<GQLResolversTypes['MealDay']>, ParentType, ContextType>;
  foods?: Resolver<Array<GQLResolversTypes['MealFood']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  instructions?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  plannedCalories?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  plannedCarbs?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  plannedFat?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  plannedProtein?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMealDayResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MealDay'] = GQLResolversParentTypes['MealDay']> = {
  actualCalories?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  actualCarbs?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  actualFat?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  actualProtein?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  dayOfWeek?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  meals?: Resolver<Array<GQLResolversTypes['Meal']>, ParentType, ContextType>;
  plannedCalories?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  plannedCarbs?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  plannedFat?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  plannedProtein?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  scheduledAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  targetCalories?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  targetCarbs?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  targetFat?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  targetProtein?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  week?: Resolver<Maybe<GQLResolversTypes['MealWeek']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMealFoodResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MealFood'] = GQLResolversParentTypes['MealFood']> = {
  addedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  addedBy?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  caloriesPer100g?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  carbsPer100g?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  fatPer100g?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  fiberPer100g?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isCustomAddition?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  latestLog?: Resolver<Maybe<GQLResolversTypes['MealFoodLog']>, ParentType, ContextType>;
  log?: Resolver<Maybe<GQLResolversTypes['MealFoodLog']>, ParentType, ContextType>;
  meal?: Resolver<Maybe<GQLResolversTypes['Meal']>, ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  openFoodFactsId?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  productData?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  proteinPer100g?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  quantity?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  totalCalories?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  totalCarbs?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  totalFat?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  totalFiber?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  totalProtein?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  unit?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMealFoodLogResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MealFoodLog'] = GQLResolversParentTypes['MealFoodLog']> = {
  calories?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  carbs?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  fat?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  fiber?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  loggedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  loggedQuantity?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  mealFood?: Resolver<GQLResolversTypes['MealFood'], ParentType, ContextType>;
  notes?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  protein?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  quantity?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  unit?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMealPlanResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MealPlan'] = GQLResolversParentTypes['MealPlan']> = {
  active?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  assignedCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  assignedTo?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  collaboratorCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  collaborators?: Resolver<Array<GQLResolversTypes['MealPlanCollaborator']>, ParentType, ContextType>;
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  dailyCalories?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  dailyCarbs?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  dailyFat?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  dailyProtein?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isDraft?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isPublic?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isTemplate?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  startDate?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  weekCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  weeks?: Resolver<Array<GQLResolversTypes['MealWeek']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMealPlanCollaboratorResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MealPlanCollaborator'] = GQLResolversParentTypes['MealPlanCollaborator']> = {
  addedBy?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  collaborator?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  mealPlan?: Resolver<GQLResolversTypes['MealPlan'], ParentType, ContextType>;
  permission?: Resolver<GQLResolversTypes['CollaborationPermission'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMealWeekResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MealWeek'] = GQLResolversParentTypes['MealWeek']> = {
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  days?: Resolver<Array<GQLResolversTypes['MealDay']>, ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isExtra?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  plan?: Resolver<Maybe<GQLResolversTypes['MealPlan']>, ParentType, ContextType>;
  totalCalories?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  totalCarbs?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  totalFat?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  totalProtein?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  weekNumber?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMuscleGroupResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MuscleGroup'] = GQLResolversParentTypes['MuscleGroup']> = {
  alias?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  category?: Resolver<GQLResolversTypes['MuscleGroupCategory'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  exercises?: Resolver<Array<GQLResolversTypes['BaseExercise']>, ParentType, ContextType>;
  groupSlug?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isPrimary?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMuscleGroupCategoryResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MuscleGroupCategory'] = GQLResolversParentTypes['MuscleGroupCategory']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  muscles?: Resolver<Array<GQLResolversTypes['MuscleGroup']>, ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMutationResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Mutation'] = GQLResolversParentTypes['Mutation']> = {
  acceptCoachingRequest?: Resolver<Maybe<GQLResolversTypes['CoachingRequest']>, ParentType, ContextType, RequireFields<GQLMutationAcceptCoachingRequestArgs, 'id'>>;
  activatePlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationActivatePlanArgs, 'planId' | 'resume' | 'startDate'>>;
  activateUser?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationActivateUserArgs, 'userId'>>;
  addAiExerciseToWorkout?: Resolver<GQLResolversTypes['TrainingExercise'], ParentType, ContextType, RequireFields<GQLMutationAddAiExerciseToWorkoutArgs, 'input'>>;
  addBodyMeasurement?: Resolver<GQLResolversTypes['UserBodyMeasure'], ParentType, ContextType, RequireFields<GQLMutationAddBodyMeasurementArgs, 'input'>>;
  addCustomFoodToMeal?: Resolver<GQLResolversTypes['MealFoodLog'], ParentType, ContextType, RequireFields<GQLMutationAddCustomFoodToMealArgs, 'input'>>;
  addExerciseToDay?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationAddExerciseToDayArgs, 'input'>>;
  addExercisesToQuickWorkout?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType, RequireFields<GQLMutationAddExercisesToQuickWorkoutArgs, 'exercises'>>;
  addExercisesToWorkout?: Resolver<Array<GQLResolversTypes['TrainingExercise']>, ParentType, ContextType, RequireFields<GQLMutationAddExercisesToWorkoutArgs, 'input'>>;
  addFoodToPersonalLog?: Resolver<GQLResolversTypes['MealFoodLog'], ParentType, ContextType, RequireFields<GQLMutationAddFoodToPersonalLogArgs, 'input'>>;
  addMealPlanCollaborator?: Resolver<GQLResolversTypes['MealPlanCollaborator'], ParentType, ContextType, RequireFields<GQLMutationAddMealPlanCollaboratorArgs, 'input'>>;
  addSet?: Resolver<GQLResolversTypes['ExerciseSet'], ParentType, ContextType, RequireFields<GQLMutationAddSetArgs, 'exerciseId'>>;
  addSetExerciseForm?: Resolver<GQLResolversTypes['ExerciseSet'], ParentType, ContextType, RequireFields<GQLMutationAddSetExerciseFormArgs, 'input'>>;
  addSetToExercise?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationAddSetToExerciseArgs, 'input'>>;
  addSubstituteExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationAddSubstituteExerciseArgs, 'input'>>;
  addTrainingPlanCollaborator?: Resolver<GQLResolversTypes['TrainingPlanCollaborator'], ParentType, ContextType, RequireFields<GQLMutationAddTrainingPlanCollaboratorArgs, 'input'>>;
  addTrainingWeek?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationAddTrainingWeekArgs, 'input'>>;
  assignMealPlanToClient?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationAssignMealPlanToClientArgs, 'input'>>;
  assignTemplateToSelf?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationAssignTemplateToSelfArgs, 'planId'>>;
  assignTrainingPlanToClient?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationAssignTrainingPlanToClientArgs, 'input'>>;
  batchLogMealFood?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationBatchLogMealFoodArgs, 'input'>>;
  bulkUpdatePlanPermissions?: Resolver<Array<GQLResolversTypes['PlanCollaboratorSummary']>, ParentType, ContextType, RequireFields<GQLMutationBulkUpdatePlanPermissionsArgs, 'input'>>;
  cancelCoaching?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  cancelCoachingRequest?: Resolver<Maybe<GQLResolversTypes['CoachingRequest']>, ParentType, ContextType, RequireFields<GQLMutationCancelCoachingRequestArgs, 'id'>>;
  clearTodaysWorkout?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  clearUserSessions?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationClearUserSessionsArgs, 'userId'>>;
  closePlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationClosePlanArgs, 'planId'>>;
  completeMeal?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationCompleteMealArgs, 'mealId'>>;
  copyExercisesFromDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationCopyExercisesFromDayArgs, 'input'>>;
  createCoachingRequest?: Resolver<GQLResolversTypes['CoachingRequest'], ParentType, ContextType, RequireFields<GQLMutationCreateCoachingRequestArgs, 'recipientEmail'>>;
  createDraftMealTemplate?: Resolver<GQLResolversTypes['MealPlan'], ParentType, ContextType>;
  createDraftTemplate?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType>;
  createExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationCreateExerciseArgs, 'input'>>;
  createExerciseNote?: Resolver<GQLResolversTypes['Note'], ParentType, ContextType, RequireFields<GQLMutationCreateExerciseNoteArgs, 'input'>>;
  createFavouriteWorkout?: Resolver<GQLResolversTypes['FavouriteWorkout'], ParentType, ContextType, RequireFields<GQLMutationCreateFavouriteWorkoutArgs, 'input'>>;
  createMealPlan?: Resolver<GQLResolversTypes['CreateMealPlanPayload'], ParentType, ContextType, RequireFields<GQLMutationCreateMealPlanArgs, 'input'>>;
  createNote?: Resolver<GQLResolversTypes['Note'], ParentType, ContextType, RequireFields<GQLMutationCreateNoteArgs, 'input'>>;
  createNoteReply?: Resolver<GQLResolversTypes['Note'], ParentType, ContextType, RequireFields<GQLMutationCreateNoteReplyArgs, 'input'>>;
  createNotification?: Resolver<GQLResolversTypes['Notification'], ParentType, ContextType, RequireFields<GQLMutationCreateNotificationArgs, 'input'>>;
  createPushSubscription?: Resolver<GQLResolversTypes['PushSubscription'], ParentType, ContextType, RequireFields<GQLMutationCreatePushSubscriptionArgs, 'input'>>;
  createQuickWorkout?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType, RequireFields<GQLMutationCreateQuickWorkoutArgs, 'input'>>;
  createReview?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationCreateReviewArgs, 'input'>>;
  createTrainerNoteForClient?: Resolver<GQLResolversTypes['Note'], ParentType, ContextType, RequireFields<GQLMutationCreateTrainerNoteForClientArgs, 'input'>>;
  createTrainingPlan?: Resolver<GQLResolversTypes['CreateTrainingPlanPayload'], ParentType, ContextType, RequireFields<GQLMutationCreateTrainingPlanArgs, 'input'>>;
  deactivateUser?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeactivateUserArgs, 'userId'>>;
  deleteBodyMeasurement?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteBodyMeasurementArgs, 'id'>>;
  deleteExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteExerciseArgs, 'id'>>;
  deleteFavouriteWorkout?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteFavouriteWorkoutArgs, 'id'>>;
  deleteNote?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteNoteArgs, 'id'>>;
  deleteNotification?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteNotificationArgs, 'id'>>;
  deletePlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeletePlanArgs, 'planId'>>;
  deletePushSubscription?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeletePushSubscriptionArgs, 'endpoint'>>;
  deleteReview?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteReviewArgs, 'input'>>;
  deleteTrainingPlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteTrainingPlanArgs, 'id'>>;
  deleteUserAccount?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  duplicateMealPlan?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationDuplicateMealPlanArgs, 'id'>>;
  duplicateTrainingPlan?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationDuplicateTrainingPlanArgs, 'id'>>;
  duplicateTrainingWeek?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationDuplicateTrainingWeekArgs, 'input'>>;
  extendPlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationExtendPlanArgs, 'planId' | 'weeks'>>;
  fitspaceActivateMealPlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationFitspaceActivateMealPlanArgs, 'planId'>>;
  fitspaceDeactivateMealPlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationFitspaceDeactivateMealPlanArgs, 'planId'>>;
  fitspaceDeleteMealPlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationFitspaceDeleteMealPlanArgs, 'planId'>>;
  generateAiWorkout?: Resolver<GQLResolversTypes['AiWorkoutResult'], ParentType, ContextType, RequireFields<GQLMutationGenerateAiWorkoutArgs, 'input'>>;
  getAiExerciseSuggestions?: Resolver<Array<GQLResolversTypes['AiExerciseSuggestion']>, ParentType, ContextType, RequireFields<GQLMutationGetAiExerciseSuggestionsArgs, 'dayId'>>;
  giveLifetimePremium?: Resolver<GQLResolversTypes['UserSubscription'], ParentType, ContextType, RequireFields<GQLMutationGiveLifetimePremiumArgs, 'userId'>>;
  logWorkoutProgress?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationLogWorkoutProgressArgs, 'dayId' | 'tick'>>;
  logWorkoutSessionEvent?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationLogWorkoutSessionEventArgs, 'dayId' | 'event'>>;
  markAllNotificationsRead?: Resolver<Array<GQLResolversTypes['Notification']>, ParentType, ContextType, RequireFields<GQLMutationMarkAllNotificationsReadArgs, 'userId'>>;
  markExerciseAsCompleted?: Resolver<Maybe<GQLResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<GQLMutationMarkExerciseAsCompletedArgs, 'completed' | 'exerciseId'>>;
  markNotificationRead?: Resolver<GQLResolversTypes['Notification'], ParentType, ContextType, RequireFields<GQLMutationMarkNotificationReadArgs, 'id'>>;
  markSetAsCompleted?: Resolver<Maybe<GQLResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<GQLMutationMarkSetAsCompletedArgs, 'completed' | 'setId'>>;
  markWorkoutAsCompleted?: Resolver<Maybe<GQLResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<GQLMutationMarkWorkoutAsCompletedArgs, 'dayId'>>;
  moderateReview?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationModerateReviewArgs, 'input'>>;
  moveExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationMoveExerciseArgs, 'input'>>;
  pausePlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationPausePlanArgs, 'planId'>>;
  rejectCoachingRequest?: Resolver<Maybe<GQLResolversTypes['CoachingRequest']>, ParentType, ContextType, RequireFields<GQLMutationRejectCoachingRequestArgs, 'id'>>;
  removeAllExercisesFromDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveAllExercisesFromDayArgs, 'input'>>;
  removeExerciseFromDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveExerciseFromDayArgs, 'exerciseId'>>;
  removeExerciseFromWorkout?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveExerciseFromWorkoutArgs, 'exerciseId'>>;
  removeMealLog?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveMealLogArgs, 'foodId'>>;
  removeMealPlanCollaborator?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveMealPlanCollaboratorArgs, 'input'>>;
  removeMealPlanFromClient?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveMealPlanFromClientArgs, 'clientId' | 'planId'>>;
  removeSet?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveSetArgs, 'setId'>>;
  removeSetExerciseForm?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveSetExerciseFormArgs, 'setId'>>;
  removeSetFromExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveSetFromExerciseArgs, 'setId'>>;
  removeSubstituteExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveSubstituteExerciseArgs, 'input'>>;
  removeTrainingPlanCollaborator?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveTrainingPlanCollaboratorArgs, 'input'>>;
  removeTrainingPlanFromClient?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveTrainingPlanFromClientArgs, 'clientId' | 'planId'>>;
  removeTrainingWeek?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveTrainingWeekArgs, 'weekId'>>;
  removeUserSubscription?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveUserSubscriptionArgs, 'userId'>>;
  removeWeek?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveWeekArgs, 'planId' | 'weekId'>>;
  resetUserLogs?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  respondToCollaborationInvitation?: Resolver<GQLResolversTypes['CollaborationInvitation'], ParentType, ContextType, RequireFields<GQLMutationRespondToCollaborationInvitationArgs, 'input'>>;
  saveMeal?: Resolver<Maybe<GQLResolversTypes['Meal']>, ParentType, ContextType, RequireFields<GQLMutationSaveMealArgs, 'input'>>;
  sendCollaborationInvitation?: Resolver<GQLResolversTypes['CollaborationInvitation'], ParentType, ContextType, RequireFields<GQLMutationSendCollaborationInvitationArgs, 'input'>>;
  startWorkoutFromFavourite?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationStartWorkoutFromFavouriteArgs, 'input'>>;
  swapExercise?: Resolver<GQLResolversTypes['Substitute'], ParentType, ContextType, RequireFields<GQLMutationSwapExerciseArgs, 'exerciseId' | 'substituteId'>>;
  uncompleteMeal?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUncompleteMealArgs, 'mealId'>>;
  updateBodyMeasurement?: Resolver<GQLResolversTypes['UserBodyMeasure'], ParentType, ContextType, RequireFields<GQLMutationUpdateBodyMeasurementArgs, 'input'>>;
  updateExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateExerciseArgs, 'id' | 'input'>>;
  updateExerciseForm?: Resolver<GQLResolversTypes['TrainingExercise'], ParentType, ContextType, RequireFields<GQLMutationUpdateExerciseFormArgs, 'input'>>;
  updateExerciseSet?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateExerciseSetArgs, 'input'>>;
  updateFavouriteWorkout?: Resolver<GQLResolversTypes['FavouriteWorkout'], ParentType, ContextType, RequireFields<GQLMutationUpdateFavouriteWorkoutArgs, 'input'>>;
  updateMealPlanCollaboratorPermission?: Resolver<GQLResolversTypes['MealPlanCollaborator'], ParentType, ContextType, RequireFields<GQLMutationUpdateMealPlanCollaboratorPermissionArgs, 'input'>>;
  updateMealPlanDetails?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateMealPlanDetailsArgs, 'input'>>;
  updateNote?: Resolver<GQLResolversTypes['Note'], ParentType, ContextType, RequireFields<GQLMutationUpdateNoteArgs, 'input'>>;
  updateNotification?: Resolver<GQLResolversTypes['Notification'], ParentType, ContextType, RequireFields<GQLMutationUpdateNotificationArgs, 'input'>>;
  updateProfile?: Resolver<Maybe<GQLResolversTypes['UserProfile']>, ParentType, ContextType, RequireFields<GQLMutationUpdateProfileArgs, 'input'>>;
  updatePushSubscription?: Resolver<GQLResolversTypes['PushSubscription'], ParentType, ContextType, RequireFields<GQLMutationUpdatePushSubscriptionArgs, 'input'>>;
  updateReview?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateReviewArgs, 'input'>>;
  updateServiceDelivery?: Resolver<GQLResolversTypes['ServiceDelivery'], ParentType, ContextType, RequireFields<GQLMutationUpdateServiceDeliveryArgs, 'deliveryId' | 'status'>>;
  updateServiceTask?: Resolver<GQLResolversTypes['ServiceTask'], ParentType, ContextType, RequireFields<GQLMutationUpdateServiceTaskArgs, 'input' | 'taskId'>>;
  updateSetLog?: Resolver<Maybe<GQLResolversTypes['ExerciseSetLog']>, ParentType, ContextType, RequireFields<GQLMutationUpdateSetLogArgs, 'input'>>;
  updateSubstituteExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateSubstituteExerciseArgs, 'input'>>;
  updateTrainingDayData?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingDayDataArgs, 'input'>>;
  updateTrainingExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingExerciseArgs, 'input'>>;
  updateTrainingPlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingPlanArgs, 'input'>>;
  updateTrainingPlanCollaboratorPermission?: Resolver<GQLResolversTypes['TrainingPlanCollaborator'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingPlanCollaboratorPermissionArgs, 'input'>>;
  updateTrainingPlanDetails?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingPlanDetailsArgs, 'input'>>;
  updateTrainingWeekDetails?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingWeekDetailsArgs, 'input'>>;
  updateUserFeatured?: Resolver<GQLResolversTypes['AdminUserListItem'], ParentType, ContextType, RequireFields<GQLMutationUpdateUserFeaturedArgs, 'input'>>;
  updateUserRole?: Resolver<GQLResolversTypes['AdminUserListItem'], ParentType, ContextType, RequireFields<GQLMutationUpdateUserRoleArgs, 'input'>>;
};

export type GQLMyMealPlansPayloadResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MyMealPlansPayload'] = GQLResolversParentTypes['MyMealPlansPayload']> = {
  activePlan?: Resolver<Maybe<GQLResolversTypes['MealPlan']>, ParentType, ContextType>;
  availablePlans?: Resolver<Array<GQLResolversTypes['MealPlan']>, ParentType, ContextType>;
  completedPlans?: Resolver<Array<GQLResolversTypes['MealPlan']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMyPlansPayloadResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MyPlansPayload'] = GQLResolversParentTypes['MyPlansPayload']> = {
  activePlan?: Resolver<Maybe<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType>;
  availablePlans?: Resolver<Array<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType>;
  completedPlans?: Resolver<Array<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType>;
  quickWorkoutPlan?: Resolver<Maybe<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLNoteResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Note'] = GQLResolversParentTypes['Note']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  parentNoteId?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  relatedTo?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  replies?: Resolver<Array<GQLResolversTypes['Note']>, ParentType, ContextType>;
  shareWithClient?: Resolver<Maybe<GQLResolversTypes['Boolean']>, ParentType, ContextType>;
  shareWithTrainer?: Resolver<Maybe<GQLResolversTypes['Boolean']>, ParentType, ContextType>;
  text?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLNotificationResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Notification'] = GQLResolversParentTypes['Notification']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  creator?: Resolver<Maybe<GQLResolversTypes['User']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  link?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  message?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  read?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  relatedItemId?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<GQLResolversTypes['NotificationType'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLNotificationPreferencesResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['NotificationPreferences'] = GQLResolversParentTypes['NotificationPreferences']> = {
  collaborationNotifications?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  emailNotifications?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  mealReminders?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  progressUpdates?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  pushNotifications?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  systemNotifications?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  workoutReminders?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLOneRmEntryResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['OneRmEntry'] = GQLResolversParentTypes['OneRmEntry']> = {
  average1RM?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  date?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  detailedLogs?: Resolver<Array<GQLResolversTypes['OneRmLog']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLOneRmLogResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['OneRmLog'] = GQLResolversParentTypes['OneRmLog']> = {
  estimated1RM?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  reps?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  weight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPackageTemplateResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PackageTemplate'] = GQLResolversParentTypes['PackageTemplate']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  duration?: Resolver<GQLResolversTypes['SubscriptionDuration'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  serviceType?: Resolver<Maybe<GQLResolversTypes['ServiceType']>, ParentType, ContextType>;
  stripePriceId?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  stripeProductId?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  trainer?: Resolver<Maybe<GQLResolversTypes['User']>, ParentType, ContextType>;
  trainerId?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPlanCollaboratorSummaryResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PlanCollaboratorSummary'] = GQLResolversParentTypes['PlanCollaboratorSummary']> = {
  addedBy?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  collaborator?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  permission?: Resolver<GQLResolversTypes['CollaborationPermission'], ParentType, ContextType>;
  planId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  planTitle?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  planType?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPlanWithPermissionsResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PlanWithPermissions'] = GQLResolversParentTypes['PlanWithPermissions']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  currentPermission?: Resolver<Maybe<GQLResolversTypes['CollaborationPermission']>, ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  hasAccess?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isTemplate?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  planType?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPublicTrainerResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PublicTrainer'] = GQLResolversParentTypes['PublicTrainer']> = {
  clientCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  credentials?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  profile?: Resolver<Maybe<GQLResolversTypes['UserProfile']>, ParentType, ContextType>;
  role?: Resolver<GQLResolversTypes['UserRole'], ParentType, ContextType>;
  specialization?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  successStories?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  trainerSince?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPushSubscriptionResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PushSubscription'] = GQLResolversParentTypes['PushSubscription']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  endpoint?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  userAgent?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLQueryResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Query'] = GQLResolversParentTypes['Query']> = {
  adminUserById?: Resolver<Maybe<GQLResolversTypes['AdminUserListItem']>, ParentType, ContextType, RequireFields<GQLQueryAdminUserByIdArgs, 'id'>>;
  adminUserList?: Resolver<GQLResolversTypes['AdminUserListResponse'], ParentType, ContextType, Partial<GQLQueryAdminUserListArgs>>;
  adminUserStats?: Resolver<GQLResolversTypes['AdminUserStats'], ParentType, ContextType>;
  allPlansWithPermissions?: Resolver<Array<GQLResolversTypes['PlanWithPermissions']>, ParentType, ContextType, RequireFields<GQLQueryAllPlansWithPermissionsArgs, 'userId'>>;
  availablePlansForTeamMember?: Resolver<Array<GQLResolversTypes['AvailablePlan']>, ParentType, ContextType, RequireFields<GQLQueryAvailablePlansForTeamMemberArgs, 'userId'>>;
  bodyMeasures?: Resolver<Array<GQLResolversTypes['UserBodyMeasure']>, ParentType, ContextType>;
  checkPremiumAccess?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  clientBodyMeasures?: Resolver<Array<GQLResolversTypes['UserBodyMeasure']>, ParentType, ContextType, RequireFields<GQLQueryClientBodyMeasuresArgs, 'clientId'>>;
  clientSharedNotes?: Resolver<Array<GQLResolversTypes['Note']>, ParentType, ContextType, RequireFields<GQLQueryClientSharedNotesArgs, 'clientId'>>;
  coachingRequest?: Resolver<Maybe<GQLResolversTypes['CoachingRequest']>, ParentType, ContextType, RequireFields<GQLQueryCoachingRequestArgs, 'id'>>;
  coachingRequests?: Resolver<Array<GQLResolversTypes['CoachingRequest']>, ParentType, ContextType>;
  exercise?: Resolver<Maybe<GQLResolversTypes['BaseExercise']>, ParentType, ContextType, RequireFields<GQLQueryExerciseArgs, 'id'>>;
  exerciseNotes?: Resolver<Array<GQLResolversTypes['Note']>, ParentType, ContextType, RequireFields<GQLQueryExerciseNotesArgs, 'exerciseName'>>;
  exercisesProgressByUser?: Resolver<Array<GQLResolversTypes['ExerciseProgress']>, ParentType, ContextType, Partial<GQLQueryExercisesProgressByUserArgs>>;
  getActiveMealPlan?: Resolver<Maybe<GQLResolversTypes['MealPlan']>, ParentType, ContextType, Partial<GQLQueryGetActiveMealPlanArgs>>;
  getActivePackageTemplates?: Resolver<Array<GQLResolversTypes['PackageTemplate']>, ParentType, ContextType, Partial<GQLQueryGetActivePackageTemplatesArgs>>;
  getActivePlanId?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  getAllUsersWithSubscriptions?: Resolver<GQLResolversTypes['UsersWithSubscriptionsResult'], ParentType, ContextType, Partial<GQLQueryGetAllUsersWithSubscriptionsArgs>>;
  getClientActivePlan?: Resolver<Maybe<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType, RequireFields<GQLQueryGetClientActivePlanArgs, 'clientId'>>;
  getClientMealPlans?: Resolver<Array<GQLResolversTypes['MealPlan']>, ParentType, ContextType, RequireFields<GQLQueryGetClientMealPlansArgs, 'clientId'>>;
  getClientTrainingPlans?: Resolver<Array<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType, RequireFields<GQLQueryGetClientTrainingPlansArgs, 'clientId'>>;
  getCollaborationMealPlanTemplates?: Resolver<Array<GQLResolversTypes['MealPlan']>, ParentType, ContextType, Partial<GQLQueryGetCollaborationMealPlanTemplatesArgs>>;
  getCollaborationTemplates?: Resolver<Array<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType, Partial<GQLQueryGetCollaborationTemplatesArgs>>;
  getCurrentWorkoutWeek?: Resolver<Maybe<GQLResolversTypes['CurrentWorkoutWeekPayload']>, ParentType, ContextType>;
  getDefaultMealPlan?: Resolver<GQLResolversTypes['MealPlan'], ParentType, ContextType, Partial<GQLQueryGetDefaultMealPlanArgs>>;
  getExercises?: Resolver<GQLResolversTypes['GetExercisesResponse'], ParentType, ContextType>;
  getFavouriteWorkout?: Resolver<Maybe<GQLResolversTypes['FavouriteWorkout']>, ParentType, ContextType, RequireFields<GQLQueryGetFavouriteWorkoutArgs, 'id'>>;
  getFavouriteWorkouts?: Resolver<Array<GQLResolversTypes['FavouriteWorkout']>, ParentType, ContextType>;
  getFeaturedTrainers?: Resolver<Array<GQLResolversTypes['PublicTrainer']>, ParentType, ContextType, Partial<GQLQueryGetFeaturedTrainersArgs>>;
  getMealPlanById?: Resolver<GQLResolversTypes['MealPlan'], ParentType, ContextType, RequireFields<GQLQueryGetMealPlanByIdArgs, 'id'>>;
  getMealPlanTemplates?: Resolver<Array<GQLResolversTypes['MealPlan']>, ParentType, ContextType, Partial<GQLQueryGetMealPlanTemplatesArgs>>;
  getMyMealPlansOverview?: Resolver<GQLResolversTypes['MyMealPlansPayload'], ParentType, ContextType>;
  getMyPlansOverview?: Resolver<GQLResolversTypes['MyPlansPayload'], ParentType, ContextType>;
  getMyPlansOverviewFull?: Resolver<GQLResolversTypes['MyPlansPayload'], ParentType, ContextType>;
  getMyPlansOverviewLite?: Resolver<GQLResolversTypes['MyPlansPayload'], ParentType, ContextType>;
  getMyServiceDeliveries?: Resolver<Array<GQLResolversTypes['ServiceDelivery']>, ParentType, ContextType, Partial<GQLQueryGetMyServiceDeliveriesArgs>>;
  getMySubscriptionStatus?: Resolver<GQLResolversTypes['UserSubscriptionStatus'], ParentType, ContextType>;
  getMySubscriptions?: Resolver<Array<GQLResolversTypes['UserSubscription']>, ParentType, ContextType>;
  getMyTrainer?: Resolver<Maybe<GQLResolversTypes['PublicTrainer']>, ParentType, ContextType>;
  getPackageTemplate?: Resolver<Maybe<GQLResolversTypes['PackageTemplate']>, ParentType, ContextType, RequireFields<GQLQueryGetPackageTemplateArgs, 'id'>>;
  getPublicTrainingPlans?: Resolver<Array<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType, Partial<GQLQueryGetPublicTrainingPlansArgs>>;
  getQuickWorkoutPlan?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType>;
  getRecentCompletedWorkouts?: Resolver<Array<GQLResolversTypes['TrainingDay']>, ParentType, ContextType>;
  getServiceDeliveryTasks?: Resolver<Array<GQLResolversTypes['ServiceTask']>, ParentType, ContextType, RequireFields<GQLQueryGetServiceDeliveryTasksArgs, 'serviceDeliveryId'>>;
  getSubscriptionStats?: Resolver<GQLResolversTypes['SubscriptionStats'], ParentType, ContextType>;
  getTemplates?: Resolver<Array<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType, Partial<GQLQueryGetTemplatesArgs>>;
  getTrainerDeliveries?: Resolver<Array<GQLResolversTypes['ServiceDelivery']>, ParentType, ContextType, RequireFields<GQLQueryGetTrainerDeliveriesArgs, 'trainerId'>>;
  getTrainerTasks?: Resolver<Array<GQLResolversTypes['ServiceTask']>, ParentType, ContextType, RequireFields<GQLQueryGetTrainerTasksArgs, 'trainerId'>>;
  getTrainingExercise?: Resolver<Maybe<GQLResolversTypes['TrainingExercise']>, ParentType, ContextType, RequireFields<GQLQueryGetTrainingExerciseArgs, 'id'>>;
  getTrainingPlanById?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType, RequireFields<GQLQueryGetTrainingPlanByIdArgs, 'id'>>;
  getWorkout?: Resolver<Maybe<GQLResolversTypes['GetWorkoutPayload']>, ParentType, ContextType, Partial<GQLQueryGetWorkoutArgs>>;
  getWorkoutInfo?: Resolver<GQLResolversTypes['TrainingDay'], ParentType, ContextType, RequireFields<GQLQueryGetWorkoutInfoArgs, 'dayId'>>;
  mealPlanCollaborators?: Resolver<Array<GQLResolversTypes['MealPlanCollaborator']>, ParentType, ContextType, RequireFields<GQLQueryMealPlanCollaboratorsArgs, 'mealPlanId'>>;
  muscleGroupCategories?: Resolver<Array<GQLResolversTypes['MuscleGroupCategory']>, ParentType, ContextType>;
  muscleGroupCategory?: Resolver<GQLResolversTypes['MuscleGroupCategory'], ParentType, ContextType, RequireFields<GQLQueryMuscleGroupCategoryArgs, 'id'>>;
  myClients?: Resolver<Array<GQLResolversTypes['UserPublic']>, ParentType, ContextType, Partial<GQLQueryMyClientsArgs>>;
  myCollaborationInvitations?: Resolver<Array<GQLResolversTypes['CollaborationInvitation']>, ParentType, ContextType>;
  myMealPlanCollaborations?: Resolver<Array<GQLResolversTypes['MealPlanCollaborator']>, ParentType, ContextType>;
  myPlanCollaborators?: Resolver<Array<GQLResolversTypes['PlanCollaboratorSummary']>, ParentType, ContextType>;
  myTeamMembers?: Resolver<Array<GQLResolversTypes['TeamMember']>, ParentType, ContextType>;
  myTrainer?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  myTrainingPlanCollaborations?: Resolver<Array<GQLResolversTypes['TrainingPlanCollaborator']>, ParentType, ContextType>;
  note?: Resolver<Maybe<GQLResolversTypes['Note']>, ParentType, ContextType, RequireFields<GQLQueryNoteArgs, 'id'>>;
  noteReplies?: Resolver<Array<GQLResolversTypes['Note']>, ParentType, ContextType, RequireFields<GQLQueryNoteRepliesArgs, 'noteId'>>;
  notes?: Resolver<Array<GQLResolversTypes['Note']>, ParentType, ContextType, Partial<GQLQueryNotesArgs>>;
  notification?: Resolver<Maybe<GQLResolversTypes['Notification']>, ParentType, ContextType, RequireFields<GQLQueryNotificationArgs, 'id'>>;
  notifications?: Resolver<Array<GQLResolversTypes['Notification']>, ParentType, ContextType, RequireFields<GQLQueryNotificationsArgs, 'userId'>>;
  profile?: Resolver<Maybe<GQLResolversTypes['UserProfile']>, ParentType, ContextType>;
  publicExercises?: Resolver<Array<GQLResolversTypes['BaseExercise']>, ParentType, ContextType, Partial<GQLQueryPublicExercisesArgs>>;
  pushSubscription?: Resolver<Maybe<GQLResolversTypes['PushSubscription']>, ParentType, ContextType, RequireFields<GQLQueryPushSubscriptionArgs, 'endpoint'>>;
  pushSubscriptions?: Resolver<Array<GQLResolversTypes['PushSubscription']>, ParentType, ContextType>;
  sentCollaborationInvitations?: Resolver<Array<GQLResolversTypes['CollaborationInvitation']>, ParentType, ContextType>;
  trainerSharedNotes?: Resolver<Array<GQLResolversTypes['Note']>, ParentType, ContextType, Partial<GQLQueryTrainerSharedNotesArgs>>;
  trainingPlanCollaborators?: Resolver<Array<GQLResolversTypes['TrainingPlanCollaborator']>, ParentType, ContextType, RequireFields<GQLQueryTrainingPlanCollaboratorsArgs, 'trainingPlanId'>>;
  user?: Resolver<Maybe<GQLResolversTypes['User']>, ParentType, ContextType>;
  userBasic?: Resolver<Maybe<GQLResolversTypes['User']>, ParentType, ContextType>;
  userExercises?: Resolver<Array<GQLResolversTypes['BaseExercise']>, ParentType, ContextType, Partial<GQLQueryUserExercisesArgs>>;
  userPublic?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType, RequireFields<GQLQueryUserPublicArgs, 'id'>>;
  userWithAllData?: Resolver<Maybe<GQLResolversTypes['User']>, ParentType, ContextType>;
  workoutExerciseNotes?: Resolver<Array<GQLResolversTypes['WorkoutExerciseNotes']>, ParentType, ContextType, RequireFields<GQLQueryWorkoutExerciseNotesArgs, 'exerciseNames'>>;
};

export type GQLReviewResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Review'] = GQLResolversParentTypes['Review']> = {
  comment?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  creatorName?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  flagReason?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  flagged?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isEdited?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isHidden?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  rating?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLServiceDeliveryResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['ServiceDelivery'] = GQLResolversParentTypes['ServiceDelivery']> = {
  client?: Resolver<GQLResolversTypes['User'], ParentType, ContextType>;
  clientId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  deliveredAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  deliveryNotes?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  packageName?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  quantity?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  serviceType?: Resolver<Maybe<GQLResolversTypes['ServiceType']>, ParentType, ContextType>;
  status?: Resolver<GQLResolversTypes['DeliveryStatus'], ParentType, ContextType>;
  trainer?: Resolver<GQLResolversTypes['User'], ParentType, ContextType>;
  trainerId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLServiceTaskResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['ServiceTask'] = GQLResolversParentTypes['ServiceTask']> = {
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  estimatedDuration?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  intervalDays?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  isRecurring?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isRequired?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  location?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  recurrenceCount?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  requiresScheduling?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  scheduledAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  serviceDelivery?: Resolver<GQLResolversTypes['ServiceDelivery'], ParentType, ContextType>;
  serviceDeliveryId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  status?: Resolver<GQLResolversTypes['TaskStatus'], ParentType, ContextType>;
  taskType?: Resolver<GQLResolversTypes['TaskType'], ParentType, ContextType>;
  templateId?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLSubscriptionStatsResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['SubscriptionStats'] = GQLResolversParentTypes['SubscriptionStats']> = {
  totalLifetimeSubscriptions?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  totalUsers?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  usersWithActiveSubscriptions?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  usersWithExpiredSubscriptions?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  usersWithoutSubscriptions?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLSubstituteResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Substitute'] = GQLResolversParentTypes['Substitute']> = {
  additionalInstructions?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  baseId?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  dayId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  difficulty?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  instructions?: Resolver<Maybe<Array<GQLResolversTypes['String']>>, ParentType, ContextType>;
  isPublic?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  muscleGroups?: Resolver<Array<GQLResolversTypes['MuscleGroup']>, ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  sets?: Resolver<Array<GQLResolversTypes['ExerciseSet']>, ParentType, ContextType>;
  tips?: Resolver<Maybe<Array<GQLResolversTypes['String']>>, ParentType, ContextType>;
  type?: Resolver<Maybe<GQLResolversTypes['ExerciseType']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  videoUrl?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLSuggestedSetsResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['SuggestedSets'] = GQLResolversParentTypes['SuggestedSets']> = {
  reps?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  rpe?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLTeamMemberResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['TeamMember'] = GQLResolversParentTypes['TeamMember']> = {
  addedBy?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isCurrentUserSender?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLTrainingDayResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['TrainingDay'] = GQLResolversParentTypes['TrainingDay']> = {
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  dayOfWeek?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  duration?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  exercises?: Resolver<Array<GQLResolversTypes['TrainingExercise']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isRestDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  scheduledAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  startedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  trainingWeekId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  workoutType?: Resolver<Maybe<GQLResolversTypes['WorkoutType']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLTrainingExerciseResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['TrainingExercise'] = GQLResolversParentTypes['TrainingExercise']> = {
  additionalInstructions?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  baseId?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  dayId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  difficulty?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  equipment?: Resolver<Maybe<GQLResolversTypes['Equipment']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  images?: Resolver<Array<GQLResolversTypes['Image']>, ParentType, ContextType>;
  instructions?: Resolver<Maybe<Array<GQLResolversTypes['String']>>, ParentType, ContextType>;
  isExtra?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isPublic?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  logs?: Resolver<Array<GQLResolversTypes['ExerciseLog']>, ParentType, ContextType>;
  muscleGroups?: Resolver<Array<GQLResolversTypes['MuscleGroup']>, ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  order?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  restSeconds?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  sets?: Resolver<Array<GQLResolversTypes['ExerciseSet']>, ParentType, ContextType>;
  substitutedBy?: Resolver<Maybe<GQLResolversTypes['Substitute']>, ParentType, ContextType>;
  substitutes?: Resolver<Array<GQLResolversTypes['BaseExerciseSubstitute']>, ParentType, ContextType>;
  tempo?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  tips?: Resolver<Maybe<Array<GQLResolversTypes['String']>>, ParentType, ContextType>;
  type?: Resolver<Maybe<GQLResolversTypes['ExerciseType']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  videoUrl?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  warmupSets?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLTrainingPlanResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['TrainingPlan'] = GQLResolversParentTypes['TrainingPlan']> = {
  active?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  adherence?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  assignedCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  assignedTo?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  assignmentCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  avgSessionTime?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  collaboratorCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  collaborators?: Resolver<Array<GQLResolversTypes['TrainingPlanCollaborator']>, ParentType, ContextType>;
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  completedWorkoutsDays?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  currentWeekNumber?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  difficulty?: Resolver<Maybe<GQLResolversTypes['Difficulty']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  equipment?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  focusTags?: Resolver<Array<GQLResolversTypes['FocusTag']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isDemo?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isDraft?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isPremium?: Resolver<Maybe<GQLResolversTypes['Boolean']>, ParentType, ContextType>;
  isPublic?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isTemplate?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  lastSessionActivity?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  nextSession?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  premium?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  progress?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  rating?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  reviews?: Resolver<Array<GQLResolversTypes['Review']>, ParentType, ContextType>;
  sessionsPerWeek?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  targetGoals?: Resolver<Array<GQLResolversTypes['TargetGoal']>, ParentType, ContextType>;
  title?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  totalReviews?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  totalWorkouts?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  userReview?: Resolver<Maybe<GQLResolversTypes['Review']>, ParentType, ContextType>;
  weekCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  weeks?: Resolver<Array<GQLResolversTypes['TrainingWeek']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLTrainingPlanCollaboratorResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['TrainingPlanCollaborator'] = GQLResolversParentTypes['TrainingPlanCollaborator']> = {
  addedBy?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  collaborator?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  permission?: Resolver<GQLResolversTypes['CollaborationPermission'], ParentType, ContextType>;
  trainingPlan?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLTrainingWeekResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['TrainingWeek'] = GQLResolversParentTypes['TrainingWeek']> = {
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  days?: Resolver<Array<GQLResolversTypes['TrainingDay']>, ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isExtra?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  scheduledAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  trainingPlanId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  weekNumber?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLUserResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['User'] = GQLResolversParentTypes['User']> = {
  clients?: Resolver<Array<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  createdNotifications?: Resolver<Array<GQLResolversTypes['Notification']>, ParentType, ContextType>;
  email?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  notifications?: Resolver<Array<GQLResolversTypes['Notification']>, ParentType, ContextType>;
  profile?: Resolver<Maybe<GQLResolversTypes['UserProfile']>, ParentType, ContextType>;
  role?: Resolver<GQLResolversTypes['UserRole'], ParentType, ContextType>;
  sessions?: Resolver<Array<GQLResolversTypes['UserSession']>, ParentType, ContextType>;
  trainer?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLUserBodyMeasureResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['UserBodyMeasure'] = GQLResolversParentTypes['UserBodyMeasure']> = {
  bicepsLeft?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  bicepsRight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  bodyFat?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  calfLeft?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  calfRight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  chest?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  hips?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  measuredAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  neck?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  thighLeft?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  thighRight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  waist?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  weight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLUserProfileResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['UserProfile'] = GQLResolversParentTypes['UserProfile']> = {
  activityLevel?: Resolver<Maybe<GQLResolversTypes['ActivityLevel']>, ParentType, ContextType>;
  allergies?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  avatarUrl?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  bio?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  birthday?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  bodyMeasures?: Resolver<Array<GQLResolversTypes['UserBodyMeasure']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  credentials?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  fitnessLevel?: Resolver<Maybe<GQLResolversTypes['FitnessLevel']>, ParentType, ContextType>;
  goals?: Resolver<Array<GQLResolversTypes['Goal']>, ParentType, ContextType>;
  height?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  heightUnit?: Resolver<GQLResolversTypes['HeightUnit'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  notificationPreferences?: Resolver<GQLResolversTypes['NotificationPreferences'], ParentType, ContextType>;
  phone?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  sex?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  specialization?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  successStories?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  theme?: Resolver<GQLResolversTypes['Theme'], ParentType, ContextType>;
  timeFormat?: Resolver<GQLResolversTypes['TimeFormat'], ParentType, ContextType>;
  trainerSince?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  trainingView?: Resolver<GQLResolversTypes['TrainingView'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  weekStartsOn?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  weight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  weightUnit?: Resolver<GQLResolversTypes['WeightUnit'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLUserPublicResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['UserPublic'] = GQLResolversParentTypes['UserPublic']> = {
  activePlan?: Resolver<Maybe<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType>;
  allergies?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  averageRating?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  birthday?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  currentWeight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  email?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  firstName?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  goals?: Resolver<Array<GQLResolversTypes['Goal']>, ParentType, ContextType>;
  height?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  lastName?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<GQLResolversTypes['UserRole'], ParentType, ContextType>;
  sex?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  yearsOfExperience?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLUserSessionResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['UserSession'] = GQLResolversParentTypes['UserSession']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  expiresAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  otp?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<GQLResolversTypes['User'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLUserSubscriptionResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['UserSubscription'] = GQLResolversParentTypes['UserSubscription']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  daysUntilExpiry?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  endDate?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  packageId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  startDate?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<GQLResolversTypes['SubscriptionStatus'], ParentType, ContextType>;
  stripePriceId?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  stripeSubscriptionId?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  trainer?: Resolver<Maybe<GQLResolversTypes['User']>, ParentType, ContextType>;
  trainerId?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  userId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLUserSubscriptionStatusResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['UserSubscriptionStatus'] = GQLResolversParentTypes['UserSubscriptionStatus']> = {
  canAccessMealPlans?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  canAccessPremiumExercises?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  canAccessPremiumTrainingPlans?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  hasPremium?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isInGracePeriod?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  subscriptionEndDate?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  trainerId?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLUserWithSubscriptionResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['UserWithSubscription'] = GQLResolversParentTypes['UserWithSubscription']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  email?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  hasActiveSubscription?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<GQLResolversTypes['UserSubscription']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLUsersWithSubscriptionsResultResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['UsersWithSubscriptionsResult'] = GQLResolversParentTypes['UsersWithSubscriptionsResult']> = {
  totalCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  users?: Resolver<Array<GQLResolversTypes['UserWithSubscription']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLVolumeEntryResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['VolumeEntry'] = GQLResolversParentTypes['VolumeEntry']> = {
  totalSets?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  totalVolume?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  week?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLWorkoutExerciseNotesResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['WorkoutExerciseNotes'] = GQLResolversParentTypes['WorkoutExerciseNotes']> = {
  exerciseName?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  notes?: Resolver<Array<GQLResolversTypes['Note']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLResolvers<ContextType = GQLContext> = {
  AdminUserListItem?: GQLAdminUserListItemResolvers<ContextType>;
  AdminUserListResponse?: GQLAdminUserListResponseResolvers<ContextType>;
  AdminUserStats?: GQLAdminUserStatsResolvers<ContextType>;
  AiExerciseSuggestion?: GQLAiExerciseSuggestionResolvers<ContextType>;
  AiMeta?: GQLAiMetaResolvers<ContextType>;
  AiWorkoutExercise?: GQLAiWorkoutExerciseResolvers<ContextType>;
  AiWorkoutResult?: GQLAiWorkoutResultResolvers<ContextType>;
  AvailablePlan?: GQLAvailablePlanResolvers<ContextType>;
  BaseExercise?: GQLBaseExerciseResolvers<ContextType>;
  BaseExerciseSubstitute?: GQLBaseExerciseSubstituteResolvers<ContextType>;
  CoachingRequest?: GQLCoachingRequestResolvers<ContextType>;
  CollaborationInvitation?: GQLCollaborationInvitationResolvers<ContextType>;
  CreateMealPlanPayload?: GQLCreateMealPlanPayloadResolvers<ContextType>;
  CreateTrainingPlanPayload?: GQLCreateTrainingPlanPayloadResolvers<ContextType>;
  CurrentWorkoutWeekPayload?: GQLCurrentWorkoutWeekPayloadResolvers<ContextType>;
  ExerciseLog?: GQLExerciseLogResolvers<ContextType>;
  ExerciseProgress?: GQLExerciseProgressResolvers<ContextType>;
  ExerciseSet?: GQLExerciseSetResolvers<ContextType>;
  ExerciseSetLog?: GQLExerciseSetLogResolvers<ContextType>;
  FavouriteWorkout?: GQLFavouriteWorkoutResolvers<ContextType>;
  FavouriteWorkoutExercise?: GQLFavouriteWorkoutExerciseResolvers<ContextType>;
  FavouriteWorkoutSet?: GQLFavouriteWorkoutSetResolvers<ContextType>;
  GetExercisesResponse?: GQLGetExercisesResponseResolvers<ContextType>;
  GetMealPlanPayload?: GQLGetMealPlanPayloadResolvers<ContextType>;
  GetWorkoutPayload?: GQLGetWorkoutPayloadResolvers<ContextType>;
  Image?: GQLImageResolvers<ContextType>;
  Meal?: GQLMealResolvers<ContextType>;
  MealDay?: GQLMealDayResolvers<ContextType>;
  MealFood?: GQLMealFoodResolvers<ContextType>;
  MealFoodLog?: GQLMealFoodLogResolvers<ContextType>;
  MealPlan?: GQLMealPlanResolvers<ContextType>;
  MealPlanCollaborator?: GQLMealPlanCollaboratorResolvers<ContextType>;
  MealWeek?: GQLMealWeekResolvers<ContextType>;
  MuscleGroup?: GQLMuscleGroupResolvers<ContextType>;
  MuscleGroupCategory?: GQLMuscleGroupCategoryResolvers<ContextType>;
  Mutation?: GQLMutationResolvers<ContextType>;
  MyMealPlansPayload?: GQLMyMealPlansPayloadResolvers<ContextType>;
  MyPlansPayload?: GQLMyPlansPayloadResolvers<ContextType>;
  Note?: GQLNoteResolvers<ContextType>;
  Notification?: GQLNotificationResolvers<ContextType>;
  NotificationPreferences?: GQLNotificationPreferencesResolvers<ContextType>;
  OneRmEntry?: GQLOneRmEntryResolvers<ContextType>;
  OneRmLog?: GQLOneRmLogResolvers<ContextType>;
  PackageTemplate?: GQLPackageTemplateResolvers<ContextType>;
  PlanCollaboratorSummary?: GQLPlanCollaboratorSummaryResolvers<ContextType>;
  PlanWithPermissions?: GQLPlanWithPermissionsResolvers<ContextType>;
  PublicTrainer?: GQLPublicTrainerResolvers<ContextType>;
  PushSubscription?: GQLPushSubscriptionResolvers<ContextType>;
  Query?: GQLQueryResolvers<ContextType>;
  Review?: GQLReviewResolvers<ContextType>;
  ServiceDelivery?: GQLServiceDeliveryResolvers<ContextType>;
  ServiceTask?: GQLServiceTaskResolvers<ContextType>;
  SubscriptionStats?: GQLSubscriptionStatsResolvers<ContextType>;
  Substitute?: GQLSubstituteResolvers<ContextType>;
  SuggestedSets?: GQLSuggestedSetsResolvers<ContextType>;
  TeamMember?: GQLTeamMemberResolvers<ContextType>;
  TrainingDay?: GQLTrainingDayResolvers<ContextType>;
  TrainingExercise?: GQLTrainingExerciseResolvers<ContextType>;
  TrainingPlan?: GQLTrainingPlanResolvers<ContextType>;
  TrainingPlanCollaborator?: GQLTrainingPlanCollaboratorResolvers<ContextType>;
  TrainingWeek?: GQLTrainingWeekResolvers<ContextType>;
  User?: GQLUserResolvers<ContextType>;
  UserBodyMeasure?: GQLUserBodyMeasureResolvers<ContextType>;
  UserProfile?: GQLUserProfileResolvers<ContextType>;
  UserPublic?: GQLUserPublicResolvers<ContextType>;
  UserSession?: GQLUserSessionResolvers<ContextType>;
  UserSubscription?: GQLUserSubscriptionResolvers<ContextType>;
  UserSubscriptionStatus?: GQLUserSubscriptionStatusResolvers<ContextType>;
  UserWithSubscription?: GQLUserWithSubscriptionResolvers<ContextType>;
  UsersWithSubscriptionsResult?: GQLUsersWithSubscriptionsResultResolvers<ContextType>;
  VolumeEntry?: GQLVolumeEntryResolvers<ContextType>;
  WorkoutExerciseNotes?: GQLWorkoutExerciseNotesResolvers<ContextType>;
};

