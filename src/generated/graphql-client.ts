import { useQuery, useInfiniteQuery, useMutation, UseQueryOptions, UseInfiniteQueryOptions, InfiniteData, UseMutationOptions } from '@tanstack/react-query';
import { fetchData } from '@/lib/graphql';
export type Maybe<T> = T | undefined | null;
export type InputMaybe<T> = T | undefined | null;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
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
  instructions?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  order: Scalars['Int']['input'];
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  tempo?: InputMaybe<Scalars['String']['input']>;
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
  clientCount: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  featured: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  lastLoginAt?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<GQLUserProfile>;
  role: GQLUserRole;
  sessionCount: Scalars['Int']['output'];
  trainer?: Maybe<GQLUserPublic>;
  updatedAt: Scalars['String']['output'];
};

export type GQLAdminUserListResponse = {
  __typename?: 'AdminUserListResponse';
  hasMore: Scalars['Boolean']['output'];
  total: Scalars['Int']['output'];
  users: Array<GQLAdminUserListItem>;
};

export type GQLAdminUserStats = {
  __typename?: 'AdminUserStats';
  activeUsers: Scalars['Int']['output'];
  inactiveUsers: Scalars['Int']['output'];
  recentSignups: Scalars['Int']['output'];
  totalAdmins: Scalars['Int']['output'];
  totalClients: Scalars['Int']['output'];
  totalTrainers: Scalars['Int']['output'];
  totalUsers: Scalars['Int']['output'];
  usersWithoutProfiles: Scalars['Int']['output'];
};

export type GQLAiExerciseSuggestion = {
  __typename?: 'AiExerciseSuggestion';
  aiMeta: GQLAiMeta;
  exercise: GQLBaseExercise;
  sets: Array<Maybe<GQLSuggestedSets>>;
};

export type GQLAiMeta = {
  __typename?: 'AiMeta';
  explanation: Scalars['String']['output'];
};

export type GQLAiWorkoutExercise = {
  __typename?: 'AiWorkoutExercise';
  exercise: GQLBaseExercise;
  order: Scalars['Int']['output'];
  sets: Array<Maybe<GQLSuggestedSets>>;
};

export type GQLAiWorkoutResult = {
  __typename?: 'AiWorkoutResult';
  exercises: Array<GQLAiWorkoutExercise>;
  totalDuration?: Maybe<Scalars['Int']['output']>;
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
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isTemplate: Scalars['Boolean']['output'];
  planType: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type GQLBaseExercise = {
  __typename?: 'BaseExercise';
  additionalInstructions?: Maybe<Scalars['String']['output']>;
  canBeSubstitutedBy: Array<GQLBaseExerciseSubstitute>;
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<GQLUserPublic>;
  dataSource?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty?: Maybe<Scalars['String']['output']>;
  equipment?: Maybe<GQLEquipment>;
  id: Scalars['ID']['output'];
  images: Array<GQLImage>;
  importedAt?: Maybe<Scalars['String']['output']>;
  instructions?: Maybe<Scalars['String']['output']>;
  isPremium: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  muscleGroupCategories: Array<GQLMuscleGroupCategory>;
  muscleGroups: Array<GQLMuscleGroup>;
  name: Scalars['String']['output'];
  secondaryMuscleGroups: Array<GQLMuscleGroup>;
  sourceId?: Maybe<Scalars['String']['output']>;
  substitutes: Array<GQLBaseExerciseSubstitute>;
  tips?: Maybe<Scalars['String']['output']>;
  type?: Maybe<GQLExerciseType>;
  updatedAt: Scalars['String']['output'];
  version: Scalars['Int']['output'];
  videoUrl?: Maybe<Scalars['String']['output']>;
};

export type GQLBaseExerciseSubstitute = {
  __typename?: 'BaseExerciseSubstitute';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  original: GQLBaseExercise;
  originalId: Scalars['ID']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  substitute: GQLBaseExercise;
  substituteId: Scalars['ID']['output'];
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
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  message?: Maybe<Scalars['String']['output']>;
  recipient: GQLUser;
  sender: GQLUser;
  status: GQLCoachingRequestStatus;
  updatedAt: Scalars['String']['output'];
};

export enum GQLCoachingRequestStatus {
  Accepted = 'ACCEPTED',
  Cancelled = 'CANCELLED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type GQLCollaborationInvitation = {
  __typename?: 'CollaborationInvitation';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  message?: Maybe<Scalars['String']['output']>;
  recipient: GQLUserPublic;
  sender: GQLUserPublic;
  status: GQLCollaborationInvitationStatus;
  updatedAt: Scalars['String']['output'];
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
  baseId?: InputMaybe<Scalars['ID']['input']>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  order: Scalars['Int']['input'];
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  sets: Array<GQLCreateFavouriteWorkoutSetInput>;
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
  id: Scalars['ID']['output'];
  success: Scalars['Boolean']['output'];
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

export type GQLCreateTrainingDayInput = {
  dayOfWeek: Scalars['Int']['input'];
  exercises?: InputMaybe<Array<GQLCreateTrainingExerciseInput>>;
  isRestDay: Scalars['Boolean']['input'];
  workoutType?: InputMaybe<Scalars['String']['input']>;
};

export type GQLCreateTrainingExerciseInput = {
  additionalInstructions?: InputMaybe<Scalars['String']['input']>;
  baseId?: InputMaybe<Scalars['ID']['input']>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  order: Scalars['Int']['input'];
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  sets?: InputMaybe<Array<GQLCreateExerciseSetInput>>;
  tempo?: InputMaybe<Scalars['String']['input']>;
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
  id: Scalars['ID']['output'];
  success: Scalars['Boolean']['output'];
};

export type GQLCreateTrainingWeekInput = {
  days?: InputMaybe<Array<GQLCreateTrainingDayInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  weekNumber: Scalars['Int']['input'];
};

export type GQLCurrentWorkoutWeekPayload = {
  __typename?: 'CurrentWorkoutWeekPayload';
  currentWeekIndex: Scalars['Int']['output'];
  plan?: Maybe<GQLTrainingPlan>;
  totalWeeks: Scalars['Int']['output'];
};

export type GQLDeleteReviewInput = {
  reviewId: Scalars['ID']['input'];
};

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
  ExerciseBall = 'EXERCISE_BALL',
  EzBar = 'EZ_BAR',
  FoamRoller = 'FOAM_ROLLER',
  InclineBench = 'INCLINE_BENCH',
  Kettlebell = 'KETTLEBELL',
  Machine = 'MACHINE',
  Mat = 'MAT',
  MedicineBall = 'MEDICINE_BALL',
  Other = 'OTHER',
  PullUpBar = 'PULL_UP_BAR',
  SmithMachine = 'SMITH_MACHINE'
}

export type GQLExerciseLog = {
  __typename?: 'ExerciseLog';
  createdAt: Scalars['String']['output'];
  exerciseId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  performedAt: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type GQLExerciseProgress = {
  __typename?: 'ExerciseProgress';
  averageRpe?: Maybe<Scalars['Float']['output']>;
  baseExercise?: Maybe<GQLBaseExercise>;
  estimated1RMProgress: Array<GQLOneRmEntry>;
  lastPerformed?: Maybe<Scalars['String']['output']>;
  totalSets?: Maybe<Scalars['Int']['output']>;
  totalVolumeProgress: Array<GQLVolumeEntry>;
};

export type GQLExerciseSet = {
  __typename?: 'ExerciseSet';
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  exerciseId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  isExtra: Scalars['Boolean']['output'];
  log?: Maybe<GQLExerciseSetLog>;
  maxReps?: Maybe<Scalars['Int']['output']>;
  minReps?: Maybe<Scalars['Int']['output']>;
  order: Scalars['Int']['output'];
  reps?: Maybe<Scalars['Int']['output']>;
  rpe?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['String']['output'];
  weight?: Maybe<Scalars['Float']['output']>;
};

export type GQLExerciseSetLog = {
  __typename?: 'ExerciseSetLog';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  reps?: Maybe<Scalars['Int']['output']>;
  rpe?: Maybe<Scalars['Int']['output']>;
  updatedAt: Scalars['String']['output'];
  weight?: Maybe<Scalars['Float']['output']>;
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
  createdAt: Scalars['String']['output'];
  createdById: Scalars['ID']['output'];
  description?: Maybe<Scalars['String']['output']>;
  exercises: Array<GQLFavouriteWorkoutExercise>;
  id: Scalars['ID']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type GQLFavouriteWorkoutExercise = {
  __typename?: 'FavouriteWorkoutExercise';
  base?: Maybe<GQLBaseExercise>;
  baseId?: Maybe<Scalars['ID']['output']>;
  favouriteWorkoutId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  instructions?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  restSeconds?: Maybe<Scalars['Int']['output']>;
  sets: Array<GQLFavouriteWorkoutSet>;
};

export type GQLFavouriteWorkoutSet = {
  __typename?: 'FavouriteWorkoutSet';
  exerciseId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  maxReps?: Maybe<Scalars['Int']['output']>;
  minReps?: Maybe<Scalars['Int']['output']>;
  order: Scalars['Int']['output'];
  reps?: Maybe<Scalars['Int']['output']>;
  rpe?: Maybe<Scalars['Int']['output']>;
  weight?: Maybe<Scalars['Float']['output']>;
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
  publicExercises: Array<GQLBaseExercise>;
  trainerExercises: Array<GQLBaseExercise>;
};

export type GQLGetMealPlanPayload = {
  __typename?: 'GetMealPlanPayload';
  plan: GQLMealPlan;
};

export type GQLGetWorkoutPayload = {
  __typename?: 'GetWorkoutPayload';
  plan: GQLTrainingPlan;
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
  createdAt: Scalars['String']['output'];
  entityId: Scalars['ID']['output'];
  entityType: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  order: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export type GQLLogSetInput = {
  loggedReps?: InputMaybe<Scalars['Int']['input']>;
  loggedWeight?: InputMaybe<Scalars['Float']['input']>;
  setId: Scalars['ID']['input'];
};

export type GQLMeal = {
  __typename?: 'Meal';
  completedAt?: Maybe<Scalars['String']['output']>;
  dateTime: Scalars['String']['output'];
  day?: Maybe<GQLMealDay>;
  foods: Array<GQLMealFood>;
  id: Scalars['ID']['output'];
  instructions?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  plannedCalories: Scalars['Float']['output'];
  plannedCarbs: Scalars['Float']['output'];
  plannedFat: Scalars['Float']['output'];
  plannedProtein: Scalars['Float']['output'];
};

export type GQLMealDay = {
  __typename?: 'MealDay';
  actualCalories: Scalars['Float']['output'];
  actualCarbs: Scalars['Float']['output'];
  actualFat: Scalars['Float']['output'];
  actualProtein: Scalars['Float']['output'];
  completedAt?: Maybe<Scalars['String']['output']>;
  dayOfWeek: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  meals: Array<GQLMeal>;
  plannedCalories: Scalars['Float']['output'];
  plannedCarbs: Scalars['Float']['output'];
  plannedFat: Scalars['Float']['output'];
  plannedProtein: Scalars['Float']['output'];
  scheduledAt?: Maybe<Scalars['String']['output']>;
  targetCalories?: Maybe<Scalars['Float']['output']>;
  targetCarbs?: Maybe<Scalars['Float']['output']>;
  targetFat?: Maybe<Scalars['Float']['output']>;
  targetProtein?: Maybe<Scalars['Float']['output']>;
  week?: Maybe<GQLMealWeek>;
};

export type GQLMealFood = {
  __typename?: 'MealFood';
  addedAt: Scalars['String']['output'];
  addedBy?: Maybe<GQLUserPublic>;
  caloriesPer100g?: Maybe<Scalars['Float']['output']>;
  carbsPer100g?: Maybe<Scalars['Float']['output']>;
  fatPer100g?: Maybe<Scalars['Float']['output']>;
  fiberPer100g?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  isCustomAddition: Scalars['Boolean']['output'];
  latestLog?: Maybe<GQLMealFoodLog>;
  log?: Maybe<GQLMealFoodLog>;
  meal?: Maybe<GQLMeal>;
  name: Scalars['String']['output'];
  openFoodFactsId?: Maybe<Scalars['String']['output']>;
  productData?: Maybe<Scalars['String']['output']>;
  proteinPer100g?: Maybe<Scalars['Float']['output']>;
  quantity: Scalars['Float']['output'];
  totalCalories: Scalars['Float']['output'];
  totalCarbs: Scalars['Float']['output'];
  totalFat: Scalars['Float']['output'];
  totalFiber: Scalars['Float']['output'];
  totalProtein: Scalars['Float']['output'];
  unit: Scalars['String']['output'];
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
  calories?: Maybe<Scalars['Float']['output']>;
  carbs?: Maybe<Scalars['Float']['output']>;
  fat?: Maybe<Scalars['Float']['output']>;
  fiber?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  loggedAt: Scalars['String']['output'];
  loggedQuantity: Scalars['Float']['output'];
  mealFood: GQLMealFood;
  notes?: Maybe<Scalars['String']['output']>;
  protein?: Maybe<Scalars['Float']['output']>;
  quantity: Scalars['Float']['output'];
  unit: Scalars['String']['output'];
  user: GQLUserPublic;
};

export type GQLMealPlan = {
  __typename?: 'MealPlan';
  active: Scalars['Boolean']['output'];
  assignedCount: Scalars['Int']['output'];
  assignedTo?: Maybe<GQLUserPublic>;
  collaboratorCount: Scalars['Int']['output'];
  collaborators: Array<GQLMealPlanCollaborator>;
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<GQLUserPublic>;
  dailyCalories?: Maybe<Scalars['Float']['output']>;
  dailyCarbs?: Maybe<Scalars['Float']['output']>;
  dailyFat?: Maybe<Scalars['Float']['output']>;
  dailyProtein?: Maybe<Scalars['Float']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  endDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDraft: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  isTemplate: Scalars['Boolean']['output'];
  startDate?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  weekCount: Scalars['Int']['output'];
  weeks: Array<GQLMealWeek>;
};

export type GQLMealPlanCollaborator = {
  __typename?: 'MealPlanCollaborator';
  addedBy: GQLUserPublic;
  collaborator: GQLUserPublic;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  mealPlan: GQLMealPlan;
  permission: GQLCollaborationPermission;
  updatedAt: Scalars['String']['output'];
};

export type GQLMealWeek = {
  __typename?: 'MealWeek';
  completedAt?: Maybe<Scalars['String']['output']>;
  days: Array<GQLMealDay>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isExtra: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  plan?: Maybe<GQLMealPlan>;
  totalCalories: Scalars['Float']['output'];
  totalCarbs: Scalars['Float']['output'];
  totalFat: Scalars['Float']['output'];
  totalProtein: Scalars['Float']['output'];
  weekNumber: Scalars['Int']['output'];
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
  alias?: Maybe<Scalars['String']['output']>;
  category: GQLMuscleGroupCategory;
  createdAt: Scalars['String']['output'];
  exercises: Array<GQLBaseExercise>;
  groupSlug: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isPrimary: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
};

export type GQLMuscleGroupCategory = {
  __typename?: 'MuscleGroupCategory';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  muscles: Array<GQLMuscleGroup>;
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type GQLMutation = {
  __typename?: 'Mutation';
  acceptCoachingRequest?: Maybe<GQLCoachingRequest>;
  activatePlan: Scalars['Boolean']['output'];
  activateUser: Scalars['Boolean']['output'];
  addAiExerciseToWorkout: GQLTrainingExercise;
  addBodyMeasurement: GQLUserBodyMeasure;
  addCustomFoodToMeal: GQLMealFoodLog;
  addExerciseToDay: Scalars['ID']['output'];
  addExercisesToQuickWorkout: GQLTrainingPlan;
  addExercisesToWorkout: Array<GQLTrainingExercise>;
  addFoodToPersonalLog: GQLMealFoodLog;
  addMealPlanCollaborator: GQLMealPlanCollaborator;
  addSet: GQLExerciseSet;
  addSetExerciseForm: GQLExerciseSet;
  addSetToExercise: Scalars['ID']['output'];
  addSubstituteExercise: Scalars['Boolean']['output'];
  addTrainingPlanCollaborator: GQLTrainingPlanCollaborator;
  addTrainingWeek: Scalars['ID']['output'];
  assignMealPlanToClient: Scalars['Boolean']['output'];
  assignTrainingPlanToClient: Scalars['Boolean']['output'];
  batchLogMealFood: Scalars['Boolean']['output'];
  bulkUpdatePlanPermissions: Array<GQLPlanCollaboratorSummary>;
  cancelCoachingRequest?: Maybe<GQLCoachingRequest>;
  clearTodaysWorkout: Scalars['Boolean']['output'];
  clearUserSessions: Scalars['Boolean']['output'];
  closePlan: Scalars['Boolean']['output'];
  completeMeal: Scalars['Boolean']['output'];
  copyExercisesFromDay: Scalars['Boolean']['output'];
  createCoachingRequest: GQLCoachingRequest;
  createDraftMealTemplate: GQLMealPlan;
  createDraftTemplate: GQLTrainingPlan;
  createExercise: Scalars['Boolean']['output'];
  createExerciseNote: GQLNote;
  createFavouriteWorkout: GQLFavouriteWorkout;
  createMealPlan: GQLCreateMealPlanPayload;
  createNote: GQLNote;
  createNoteReply: GQLNote;
  createNotification: GQLNotification;
  createPushSubscription: GQLPushSubscription;
  createQuickWorkout: GQLTrainingPlan;
  createReview: Scalars['Boolean']['output'];
  createTrainingPlan: GQLCreateTrainingPlanPayload;
  deactivateUser: Scalars['Boolean']['output'];
  deleteBodyMeasurement: Scalars['Boolean']['output'];
  deleteExercise: Scalars['Boolean']['output'];
  deleteFavouriteWorkout: Scalars['Boolean']['output'];
  deleteNote: Scalars['Boolean']['output'];
  deleteNotification: Scalars['Boolean']['output'];
  deletePlan: Scalars['Boolean']['output'];
  deletePushSubscription: Scalars['Boolean']['output'];
  deleteReview: Scalars['Boolean']['output'];
  deleteTrainingPlan: Scalars['Boolean']['output'];
  deleteUserAccount: Scalars['Boolean']['output'];
  duplicateMealPlan: Scalars['ID']['output'];
  duplicateTrainingPlan: Scalars['ID']['output'];
  duplicateTrainingWeek: Scalars['ID']['output'];
  extendPlan: Scalars['Boolean']['output'];
  fitspaceActivateMealPlan: Scalars['Boolean']['output'];
  fitspaceDeactivateMealPlan: Scalars['Boolean']['output'];
  fitspaceDeleteMealPlan: Scalars['Boolean']['output'];
  generateAiWorkout: GQLAiWorkoutResult;
  getAiExerciseSuggestions: Array<GQLAiExerciseSuggestion>;
  logWorkoutProgress: Scalars['ID']['output'];
  logWorkoutSessionEvent: Scalars['ID']['output'];
  markAllNotificationsRead: Array<GQLNotification>;
  markExerciseAsCompleted?: Maybe<Scalars['Boolean']['output']>;
  markNotificationRead: GQLNotification;
  markSetAsCompleted?: Maybe<Scalars['Boolean']['output']>;
  markWorkoutAsCompleted?: Maybe<Scalars['Boolean']['output']>;
  moderateReview: Scalars['Boolean']['output'];
  moveExercise: Scalars['Boolean']['output'];
  pausePlan: Scalars['Boolean']['output'];
  rejectCoachingRequest?: Maybe<GQLCoachingRequest>;
  removeAllExercisesFromDay: Scalars['Boolean']['output'];
  removeExerciseFromDay: Scalars['Boolean']['output'];
  removeExerciseFromWorkout: Scalars['Boolean']['output'];
  removeMealLog: Scalars['Boolean']['output'];
  removeMealPlanCollaborator: Scalars['Boolean']['output'];
  removeMealPlanFromClient: Scalars['Boolean']['output'];
  removeSet: Scalars['Boolean']['output'];
  removeSetExerciseForm: Scalars['Boolean']['output'];
  removeSetFromExercise: Scalars['Boolean']['output'];
  removeSubstituteExercise: Scalars['Boolean']['output'];
  removeTrainingPlanCollaborator: Scalars['Boolean']['output'];
  removeTrainingPlanFromClient: Scalars['Boolean']['output'];
  removeTrainingWeek: Scalars['Boolean']['output'];
  removeWeek: Scalars['Boolean']['output'];
  resetUserLogs: Scalars['Boolean']['output'];
  respondToCollaborationInvitation: GQLCollaborationInvitation;
  saveMeal?: Maybe<GQLMeal>;
  sendCollaborationInvitation: GQLCollaborationInvitation;
  startWorkoutFromFavourite: Scalars['ID']['output'];
  swapExercise: GQLSubstitute;
  uncompleteMeal: Scalars['Boolean']['output'];
  updateBodyMeasurement: GQLUserBodyMeasure;
  updateExercise: Scalars['Boolean']['output'];
  updateExerciseForm: GQLTrainingExercise;
  updateExerciseSet: Scalars['Boolean']['output'];
  updateFavouriteWorkout: GQLFavouriteWorkout;
  updateMealPlanCollaboratorPermission: GQLMealPlanCollaborator;
  updateMealPlanDetails: Scalars['Boolean']['output'];
  updateNote: GQLNote;
  updateNotification: GQLNotification;
  updateProfile?: Maybe<GQLUserProfile>;
  updatePushSubscription: GQLPushSubscription;
  updateReview: Scalars['Boolean']['output'];
  updateSetLog?: Maybe<GQLExerciseSetLog>;
  updateSubstituteExercise: Scalars['Boolean']['output'];
  updateTrainingDayData: Scalars['Boolean']['output'];
  updateTrainingExercise: Scalars['Boolean']['output'];
  updateTrainingPlan: Scalars['Boolean']['output'];
  updateTrainingPlanCollaboratorPermission: GQLTrainingPlanCollaborator;
  updateTrainingPlanDetails: Scalars['Boolean']['output'];
  updateTrainingWeekDetails: Scalars['Boolean']['output'];
  updateUserFeatured: GQLAdminUserListItem;
  updateUserRole: GQLAdminUserListItem;
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
  setId: Scalars['ID']['input'];
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
  activePlan?: Maybe<GQLMealPlan>;
  availablePlans: Array<GQLMealPlan>;
  completedPlans: Array<GQLMealPlan>;
};

export type GQLMyPlansPayload = {
  __typename?: 'MyPlansPayload';
  activePlan?: Maybe<GQLTrainingPlan>;
  availablePlans: Array<GQLTrainingPlan>;
  completedPlans: Array<GQLTrainingPlan>;
  quickWorkoutPlan?: Maybe<GQLTrainingPlan>;
};

export type GQLNote = {
  __typename?: 'Note';
  createdAt: Scalars['String']['output'];
  createdBy: GQLUserPublic;
  id: Scalars['ID']['output'];
  parentNoteId?: Maybe<Scalars['ID']['output']>;
  relatedTo?: Maybe<Scalars['ID']['output']>;
  replies: Array<GQLNote>;
  shareWithTrainer?: Maybe<Scalars['Boolean']['output']>;
  text: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type GQLNotification = {
  __typename?: 'Notification';
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  creator?: Maybe<GQLUser>;
  id: Scalars['ID']['output'];
  link?: Maybe<Scalars['String']['output']>;
  message: Scalars['String']['output'];
  read: Scalars['Boolean']['output'];
  relatedItemId?: Maybe<Scalars['String']['output']>;
  type: GQLNotificationType;
};

export type GQLNotificationPreferences = {
  __typename?: 'NotificationPreferences';
  collaborationNotifications: Scalars['Boolean']['output'];
  emailNotifications: Scalars['Boolean']['output'];
  mealReminders: Scalars['Boolean']['output'];
  progressUpdates: Scalars['Boolean']['output'];
  pushNotifications: Scalars['Boolean']['output'];
  systemNotifications: Scalars['Boolean']['output'];
  workoutReminders: Scalars['Boolean']['output'];
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
  TrainerWorkoutCompleted = 'TRAINER_WORKOUT_COMPLETED',
  TrainingPlanCollaboration = 'TRAINING_PLAN_COLLABORATION',
  TrainingPlanCollaborationRemoved = 'TRAINING_PLAN_COLLABORATION_REMOVED',
  WorkoutCompleted = 'WORKOUT_COMPLETED'
}

export type GQLOneRmEntry = {
  __typename?: 'OneRmEntry';
  average1RM: Scalars['Float']['output'];
  date: Scalars['String']['output'];
  detailedLogs: Array<GQLOneRmLog>;
};

export type GQLOneRmLog = {
  __typename?: 'OneRmLog';
  estimated1RM: Scalars['Float']['output'];
  reps?: Maybe<Scalars['Int']['output']>;
  weight?: Maybe<Scalars['Float']['output']>;
};

export type GQLPlanCollaboratorSummary = {
  __typename?: 'PlanCollaboratorSummary';
  addedBy: GQLUserPublic;
  collaborator: GQLUserPublic;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  permission: GQLCollaborationPermission;
  planId: Scalars['ID']['output'];
  planTitle: Scalars['String']['output'];
  planType: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type GQLPlanPermissionUpdateInput = {
  permission?: InputMaybe<GQLCollaborationPermission>;
  planId: Scalars['ID']['input'];
  planType: Scalars['String']['input'];
  removeAccess?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GQLPlanWithPermissions = {
  __typename?: 'PlanWithPermissions';
  createdAt: Scalars['String']['output'];
  currentPermission?: Maybe<GQLCollaborationPermission>;
  description?: Maybe<Scalars['String']['output']>;
  hasAccess: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isTemplate: Scalars['Boolean']['output'];
  planType: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type GQLPublicTrainer = {
  __typename?: 'PublicTrainer';
  clientCount: Scalars['Int']['output'];
  credentials: Array<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<GQLUserProfile>;
  role: GQLUserRole;
  specialization: Array<Scalars['String']['output']>;
  successStories: Array<Scalars['String']['output']>;
  trainerSince?: Maybe<Scalars['String']['output']>;
};

export type GQLPushSubscription = {
  __typename?: 'PushSubscription';
  createdAt: Scalars['String']['output'];
  endpoint: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
  userAgent?: Maybe<Scalars['String']['output']>;
};

export type GQLQuery = {
  __typename?: 'Query';
  adminUserById?: Maybe<GQLAdminUserListItem>;
  adminUserList: GQLAdminUserListResponse;
  adminUserStats: GQLAdminUserStats;
  allPlansWithPermissions: Array<GQLPlanWithPermissions>;
  availablePlansForTeamMember: Array<GQLAvailablePlan>;
  bodyMeasures: Array<GQLUserBodyMeasure>;
  clientBodyMeasures: Array<GQLUserBodyMeasure>;
  clientSharedNotes: Array<GQLNote>;
  coachingRequest?: Maybe<GQLCoachingRequest>;
  coachingRequests: Array<GQLCoachingRequest>;
  exercise?: Maybe<GQLBaseExercise>;
  exerciseNotes: Array<GQLNote>;
  exercisesProgressByUser: Array<GQLExerciseProgress>;
  getActiveMealPlan?: Maybe<GQLMealPlan>;
  getActivePlanId?: Maybe<Scalars['ID']['output']>;
  getClientActivePlan?: Maybe<GQLTrainingPlan>;
  getClientMealPlans: Array<GQLMealPlan>;
  getClientTrainingPlans: Array<GQLTrainingPlan>;
  getCollaborationMealPlanTemplates: Array<GQLMealPlan>;
  getCollaborationTemplates: Array<GQLTrainingPlan>;
  getCurrentWorkoutWeek?: Maybe<GQLCurrentWorkoutWeekPayload>;
  getDefaultMealPlan: GQLMealPlan;
  getExercises: GQLGetExercisesResponse;
  getFavouriteWorkout?: Maybe<GQLFavouriteWorkout>;
  getFavouriteWorkouts: Array<GQLFavouriteWorkout>;
  getFeaturedTrainers: Array<GQLPublicTrainer>;
  getMealPlanById: GQLMealPlan;
  getMealPlanTemplates: Array<GQLMealPlan>;
  getMyMealPlansOverview: GQLMyMealPlansPayload;
  getMyPlansOverview: GQLMyPlansPayload;
  getMyPlansOverviewFull: GQLMyPlansPayload;
  getMyPlansOverviewLite: GQLMyPlansPayload;
  getPublicTrainingPlans: Array<GQLTrainingPlan>;
  getQuickWorkoutPlan: GQLTrainingPlan;
  getRecentCompletedWorkouts: Array<GQLTrainingDay>;
  getTemplates: Array<GQLTrainingPlan>;
  getTrainingExercise?: Maybe<GQLTrainingExercise>;
  getTrainingPlanById: GQLTrainingPlan;
  getWorkout?: Maybe<GQLGetWorkoutPayload>;
  getWorkoutInfo: GQLTrainingDay;
  mealPlanCollaborators: Array<GQLMealPlanCollaborator>;
  muscleGroupCategories: Array<GQLMuscleGroupCategory>;
  muscleGroupCategory: GQLMuscleGroupCategory;
  myClients: Array<GQLUserPublic>;
  myCollaborationInvitations: Array<GQLCollaborationInvitation>;
  myMealPlanCollaborations: Array<GQLMealPlanCollaborator>;
  myPlanCollaborators: Array<GQLPlanCollaboratorSummary>;
  myTeamMembers: Array<GQLTeamMember>;
  myTrainer?: Maybe<GQLUserPublic>;
  myTrainingPlanCollaborations: Array<GQLTrainingPlanCollaborator>;
  note?: Maybe<GQLNote>;
  noteReplies: Array<GQLNote>;
  notes: Array<GQLNote>;
  notification?: Maybe<GQLNotification>;
  notifications: Array<GQLNotification>;
  profile?: Maybe<GQLUserProfile>;
  publicExercises: Array<GQLBaseExercise>;
  pushSubscription?: Maybe<GQLPushSubscription>;
  pushSubscriptions: Array<GQLPushSubscription>;
  sentCollaborationInvitations: Array<GQLCollaborationInvitation>;
  trainingPlanCollaborators: Array<GQLTrainingPlanCollaborator>;
  user?: Maybe<GQLUser>;
  userBasic?: Maybe<GQLUser>;
  userExercises: Array<GQLBaseExercise>;
  userPublic?: Maybe<GQLUserPublic>;
  userWithAllData?: Maybe<GQLUser>;
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


export type GQLQueryGetPublicTrainingPlansArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryGetTemplatesArgs = {
  draft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
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


export type GQLQueryTrainingPlanCollaboratorsArgs = {
  trainingPlanId: Scalars['ID']['input'];
};


export type GQLQueryUserExercisesArgs = {
  where?: InputMaybe<GQLExerciseWhereInput>;
};


export type GQLQueryUserPublicArgs = {
  id: Scalars['ID']['input'];
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
  comment?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  creatorName?: Maybe<Scalars['String']['output']>;
  flagReason?: Maybe<Scalars['String']['output']>;
  flagged: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isEdited: Scalars['Boolean']['output'];
  isHidden: Scalars['Boolean']['output'];
  rating: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
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

export type GQLStartWorkoutFromFavouriteInput = {
  favouriteWorkoutId: Scalars['ID']['input'];
  replaceExisting?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GQLSubstitute = {
  __typename?: 'Substitute';
  additionalInstructions?: Maybe<Scalars['String']['output']>;
  baseId?: Maybe<Scalars['ID']['output']>;
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  dayId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  instructions?: Maybe<Scalars['String']['output']>;
  isPublic: Scalars['Boolean']['output'];
  muscleGroups: Array<GQLMuscleGroup>;
  name: Scalars['String']['output'];
  sets: Array<GQLExerciseSet>;
  type?: Maybe<GQLExerciseType>;
  updatedAt: Scalars['String']['output'];
  videoUrl?: Maybe<Scalars['String']['output']>;
};

export type GQLSuggestedSets = {
  __typename?: 'SuggestedSets';
  reps?: Maybe<Scalars['Int']['output']>;
  rpe?: Maybe<Scalars['Int']['output']>;
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

export type GQLTeamMember = {
  __typename?: 'TeamMember';
  addedBy: GQLUserPublic;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isCurrentUserSender: Scalars['Boolean']['output'];
  updatedAt: Scalars['String']['output'];
  user: GQLUserPublic;
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
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  dayOfWeek: Scalars['Int']['output'];
  duration?: Maybe<Scalars['Int']['output']>;
  exercises: Array<GQLTrainingExercise>;
  id: Scalars['ID']['output'];
  isRestDay: Scalars['Boolean']['output'];
  scheduledAt?: Maybe<Scalars['String']['output']>;
  startedAt?: Maybe<Scalars['String']['output']>;
  trainingWeekId: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
  workoutType?: Maybe<GQLWorkoutType>;
};

export type GQLTrainingExercise = {
  __typename?: 'TrainingExercise';
  additionalInstructions?: Maybe<Scalars['String']['output']>;
  baseId?: Maybe<Scalars['ID']['output']>;
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  dayId: Scalars['ID']['output'];
  equipment?: Maybe<GQLEquipment>;
  id: Scalars['ID']['output'];
  images: Array<GQLImage>;
  instructions?: Maybe<Scalars['String']['output']>;
  isExtra: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  logs: Array<GQLExerciseLog>;
  muscleGroups: Array<GQLMuscleGroup>;
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  restSeconds?: Maybe<Scalars['Int']['output']>;
  sets: Array<GQLExerciseSet>;
  substitutedBy?: Maybe<GQLSubstitute>;
  substitutes: Array<GQLBaseExerciseSubstitute>;
  tempo?: Maybe<Scalars['String']['output']>;
  type?: Maybe<GQLExerciseType>;
  updatedAt: Scalars['String']['output'];
  videoUrl?: Maybe<Scalars['String']['output']>;
  warmupSets?: Maybe<Scalars['Int']['output']>;
};

export type GQLTrainingPlan = {
  __typename?: 'TrainingPlan';
  active: Scalars['Boolean']['output'];
  adherence: Scalars['Float']['output'];
  assignedCount: Scalars['Int']['output'];
  assignedTo?: Maybe<GQLUserPublic>;
  assignmentCount: Scalars['Int']['output'];
  avgSessionTime?: Maybe<Scalars['Int']['output']>;
  collaboratorCount: Scalars['Int']['output'];
  collaborators: Array<GQLTrainingPlanCollaborator>;
  completedAt?: Maybe<Scalars['String']['output']>;
  completedWorkoutsDays: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<GQLUserPublic>;
  currentWeekNumber?: Maybe<Scalars['Int']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty?: Maybe<GQLDifficulty>;
  endDate?: Maybe<Scalars['String']['output']>;
  equipment: Array<Scalars['String']['output']>;
  focusTags: Array<GQLFocusTag>;
  id: Scalars['ID']['output'];
  isDemo: Scalars['Boolean']['output'];
  isDraft: Scalars['Boolean']['output'];
  isPremium?: Maybe<Scalars['Boolean']['output']>;
  isPublic: Scalars['Boolean']['output'];
  isTemplate: Scalars['Boolean']['output'];
  lastSessionActivity?: Maybe<Scalars['String']['output']>;
  nextSession?: Maybe<Scalars['String']['output']>;
  premium: Scalars['Boolean']['output'];
  progress?: Maybe<Scalars['Float']['output']>;
  rating?: Maybe<Scalars['Float']['output']>;
  reviews: Array<GQLReview>;
  sessionsPerWeek?: Maybe<Scalars['Int']['output']>;
  startDate?: Maybe<Scalars['String']['output']>;
  targetGoals: Array<GQLTargetGoal>;
  title: Scalars['String']['output'];
  totalReviews: Scalars['Int']['output'];
  totalWorkouts: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
  userReview?: Maybe<GQLReview>;
  weekCount: Scalars['Int']['output'];
  weeks: Array<GQLTrainingWeek>;
};

export type GQLTrainingPlanCollaborator = {
  __typename?: 'TrainingPlanCollaborator';
  addedBy: GQLUserPublic;
  collaborator: GQLUserPublic;
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  permission: GQLCollaborationPermission;
  trainingPlan: GQLTrainingPlan;
  updatedAt: Scalars['String']['output'];
};

export enum GQLTrainingView {
  Advanced = 'ADVANCED',
  Simple = 'SIMPLE'
}

export type GQLTrainingWeek = {
  __typename?: 'TrainingWeek';
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  days: Array<GQLTrainingDay>;
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isExtra: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  scheduledAt?: Maybe<Scalars['String']['output']>;
  trainingPlanId: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
  weekNumber: Scalars['Int']['output'];
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
  exerciseId: Scalars['ID']['input'];
  instructions?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  sets?: InputMaybe<Array<GQLUpdateExerciseSetFormInput>>;
  tempo?: InputMaybe<Scalars['String']['input']>;
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
  baseId?: InputMaybe<Scalars['ID']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  order: Scalars['Int']['input'];
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  sets: Array<GQLUpdateFavouriteWorkoutSetInput>;
};

export type GQLUpdateFavouriteWorkoutInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  exercises?: InputMaybe<Array<GQLUpdateFavouriteWorkoutExerciseInput>>;
  id: Scalars['ID']['input'];
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
  id: Scalars['ID']['input'];
  instructions?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order: Scalars['Int']['input'];
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  sets?: InputMaybe<Array<GQLUpdateExerciseSetInput>>;
  tempo?: InputMaybe<Scalars['String']['input']>;
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
  clients: Array<GQLUserPublic>;
  createdAt: Scalars['String']['output'];
  createdNotifications: Array<GQLNotification>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  notifications: Array<GQLNotification>;
  profile?: Maybe<GQLUserProfile>;
  role: GQLUserRole;
  sessions: Array<GQLUserSession>;
  trainer?: Maybe<GQLUserPublic>;
  updatedAt: Scalars['String']['output'];
};

export type GQLUserBodyMeasure = {
  __typename?: 'UserBodyMeasure';
  bicepsLeft?: Maybe<Scalars['Float']['output']>;
  bicepsRight?: Maybe<Scalars['Float']['output']>;
  bodyFat?: Maybe<Scalars['Float']['output']>;
  calfLeft?: Maybe<Scalars['Float']['output']>;
  calfRight?: Maybe<Scalars['Float']['output']>;
  chest?: Maybe<Scalars['Float']['output']>;
  hips?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  measuredAt: Scalars['String']['output'];
  neck?: Maybe<Scalars['Float']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  thighLeft?: Maybe<Scalars['Float']['output']>;
  thighRight?: Maybe<Scalars['Float']['output']>;
  waist?: Maybe<Scalars['Float']['output']>;
  weight?: Maybe<Scalars['Float']['output']>;
};

export type GQLUserProfile = {
  __typename?: 'UserProfile';
  activityLevel?: Maybe<GQLActivityLevel>;
  allergies?: Maybe<Scalars['String']['output']>;
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  birthday?: Maybe<Scalars['String']['output']>;
  bodyMeasures: Array<GQLUserBodyMeasure>;
  createdAt: Scalars['String']['output'];
  credentials: Array<Scalars['String']['output']>;
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  fitnessLevel?: Maybe<GQLFitnessLevel>;
  goals: Array<GQLGoal>;
  height?: Maybe<Scalars['Float']['output']>;
  heightUnit: GQLHeightUnit;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  notificationPreferences: GQLNotificationPreferences;
  phone?: Maybe<Scalars['String']['output']>;
  sex?: Maybe<Scalars['String']['output']>;
  specialization: Array<Scalars['String']['output']>;
  successStories: Array<Scalars['String']['output']>;
  theme: GQLTheme;
  timeFormat: GQLTimeFormat;
  trainerSince?: Maybe<Scalars['String']['output']>;
  trainingView: GQLTrainingView;
  updatedAt: Scalars['String']['output'];
  weekStartsOn?: Maybe<Scalars['Int']['output']>;
  weight?: Maybe<Scalars['Float']['output']>;
  weightUnit: GQLWeightUnit;
};

export type GQLUserPublic = {
  __typename?: 'UserPublic';
  activePlan?: Maybe<GQLTrainingPlan>;
  allergies?: Maybe<Scalars['String']['output']>;
  averageRating?: Maybe<Scalars['Float']['output']>;
  birthday?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  currentWeight?: Maybe<Scalars['Float']['output']>;
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  goals: Array<GQLGoal>;
  height?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  role: GQLUserRole;
  sex?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
  yearsOfExperience?: Maybe<Scalars['Int']['output']>;
};

export enum GQLUserRole {
  Admin = 'ADMIN',
  Client = 'CLIENT',
  Trainer = 'TRAINER'
}

export type GQLUserSession = {
  __typename?: 'UserSession';
  createdAt: Scalars['String']['output'];
  expiresAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  otp: Scalars['String']['output'];
  user: GQLUser;
};

export type GQLVolumeEntry = {
  __typename?: 'VolumeEntry';
  totalSets: Scalars['Int']['output'];
  totalVolume: Scalars['Float']['output'];
  week: Scalars['String']['output'];
};

export enum GQLWeightUnit {
  Kg = 'kg',
  Lbs = 'lbs'
}

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

export type GQLGetAdminUserStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetAdminUserStatsQuery = { __typename?: 'Query', adminUserStats: { __typename?: 'AdminUserStats', totalUsers: number, totalTrainers: number, activeUsers: number, inactiveUsers: number } };

export type GQLGetTrainersListQueryVariables = Exact<{
  filters?: InputMaybe<GQLAdminUserFilters>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GQLGetTrainersListQuery = { __typename?: 'Query', adminUserList: { __typename?: 'AdminUserListResponse', total: number, hasMore: boolean, users: Array<{ __typename?: 'AdminUserListItem', id: string, email: string, name?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string, lastLoginAt?: string | undefined | null, sessionCount: number, clientCount: number, isActive: boolean, featured: boolean, profile?: { __typename?: 'UserProfile', firstName?: string | undefined | null, lastName?: string | undefined | null, bio?: string | undefined | null, avatarUrl?: string | undefined | null } | undefined | null }> } };

export type GQLUpdateUserFeaturedMutationVariables = Exact<{
  input: GQLUpdateUserFeaturedInput;
}>;


export type GQLUpdateUserFeaturedMutation = { __typename?: 'Mutation', updateUserFeatured: { __typename?: 'AdminUserListItem', id: string, featured: boolean } };

export type GQLFitspaceDashboardGetWorkoutQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceDashboardGetWorkoutQuery = { __typename?: 'Query', getWorkout?: { __typename?: 'GetWorkoutPayload', plan: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, startDate?: string | undefined | null, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, startedAt?: string | undefined | null, completedAt?: string | undefined | null, duration?: number | undefined | null, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, sets: Array<{ __typename?: 'ExerciseSet', id: string }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null }> }> }> }> } } | undefined | null };

export type GQLFitspaceDashboardGetCurrentWeekQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceDashboardGetCurrentWeekQuery = { __typename?: 'Query', getCurrentWorkoutWeek?: { __typename?: 'CurrentWorkoutWeekPayload', currentWeekIndex: number, totalWeeks: number, plan?: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, startDate?: string | undefined | null, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, startedAt?: string | undefined | null, completedAt?: string | undefined | null, duration?: number | undefined | null, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, sets: Array<{ __typename?: 'ExerciseSet', id: string }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null }> }> }> }> } | undefined | null } | undefined | null };

export type GQLFitspaceDashboardGetRecentProgressQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceDashboardGetRecentProgressQuery = { __typename?: 'Query', getRecentCompletedWorkouts: Array<{ __typename?: 'TrainingDay', id: string, completedAt?: string | undefined | null, dayOfWeek: number, duration?: number | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, baseId?: string | undefined | null, completedAt?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, weight?: number | undefined | null, completedAt?: string | undefined | null, log?: { __typename?: 'ExerciseSetLog', id: string, weight?: number | undefined | null, reps?: number | undefined | null, rpe?: number | undefined | null, createdAt: string } | undefined | null }> }> }> };

export type GQLGetPublicTrainingPlansQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GQLGetPublicTrainingPlansQuery = { __typename?: 'Query', getPublicTrainingPlans: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isPremium?: boolean | undefined | null, difficulty?: GQLDifficulty | undefined | null, focusTags: Array<GQLFocusTag>, targetGoals: Array<GQLTargetGoal>, weekCount: number, assignmentCount: number, sessionsPerWeek?: number | undefined | null, avgSessionTime?: number | undefined | null, equipment: Array<string>, rating?: number | undefined | null, totalReviews: number, createdAt: string, updatedAt: string, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null } | undefined | null }> };

export type GQLGetFeaturedTrainersQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GQLGetFeaturedTrainersQuery = { __typename?: 'Query', getFeaturedTrainers: Array<{ __typename?: 'PublicTrainer', id: string, name?: string | undefined | null, role: GQLUserRole, clientCount: number, email: string, profile?: { __typename?: 'UserProfile', firstName?: string | undefined | null, lastName?: string | undefined | null, bio?: string | undefined | null, avatarUrl?: string | undefined | null, specialization: Array<string>, credentials: Array<string>, successStories: Array<string>, trainerSince?: string | undefined | null } | undefined | null }> };

export type GQLGetActiveMealPlanQueryVariables = Exact<{
  date?: InputMaybe<Scalars['String']['input']>;
}>;


export type GQLGetActiveMealPlanQuery = { __typename?: 'Query', getActiveMealPlan?: { __typename?: 'MealPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, active: boolean, startDate?: string | undefined | null, endDate?: string | undefined | null, dailyCalories?: number | undefined | null, dailyProtein?: number | undefined | null, dailyCarbs?: number | undefined | null, dailyFat?: number | undefined | null, weeks: Array<{ __typename?: 'MealWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, completedAt?: string | undefined | null, days: Array<{ __typename?: 'MealDay', id: string, dayOfWeek: number, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, targetCalories?: number | undefined | null, targetProtein?: number | undefined | null, targetCarbs?: number | undefined | null, targetFat?: number | undefined | null, meals: Array<{ __typename?: 'Meal', id: string, name: string, dateTime: string, instructions?: string | undefined | null, completedAt?: string | undefined | null, plannedCalories: number, plannedProtein: number, plannedCarbs: number, plannedFat: number, foods: Array<{ __typename?: 'MealFood', id: string, name: string, quantity: number, unit: string, addedAt: string, caloriesPer100g?: number | undefined | null, proteinPer100g?: number | undefined | null, carbsPer100g?: number | undefined | null, fatPer100g?: number | undefined | null, fiberPer100g?: number | undefined | null, totalCalories: number, totalProtein: number, totalCarbs: number, totalFat: number, totalFiber: number, openFoodFactsId?: string | undefined | null, productData?: string | undefined | null, isCustomAddition: boolean, addedBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null } | undefined | null, log?: { __typename?: 'MealFoodLog', id: string, quantity: number, loggedQuantity: number, unit: string, loggedAt: string, notes?: string | undefined | null, calories?: number | undefined | null, protein?: number | undefined | null, carbs?: number | undefined | null, fat?: number | undefined | null, fiber?: number | undefined | null, mealFood: { __typename?: 'MealFood', id: string, name: string }, user: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null } } | undefined | null }> }> }> }> } | undefined | null };

export type GQLGetDefaultMealPlanQueryVariables = Exact<{
  date?: InputMaybe<Scalars['String']['input']>;
}>;


export type GQLGetDefaultMealPlanQuery = { __typename?: 'Query', getDefaultMealPlan: { __typename?: 'MealPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, active: boolean, startDate?: string | undefined | null, endDate?: string | undefined | null, dailyCalories?: number | undefined | null, dailyProtein?: number | undefined | null, dailyCarbs?: number | undefined | null, dailyFat?: number | undefined | null, weeks: Array<{ __typename?: 'MealWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, completedAt?: string | undefined | null, days: Array<{ __typename?: 'MealDay', id: string, dayOfWeek: number, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, targetCalories?: number | undefined | null, targetProtein?: number | undefined | null, targetCarbs?: number | undefined | null, targetFat?: number | undefined | null, meals: Array<{ __typename?: 'Meal', id: string, name: string, dateTime: string, instructions?: string | undefined | null, completedAt?: string | undefined | null, plannedCalories: number, plannedProtein: number, plannedCarbs: number, plannedFat: number, foods: Array<{ __typename?: 'MealFood', id: string, name: string, quantity: number, unit: string, addedAt: string, caloriesPer100g?: number | undefined | null, proteinPer100g?: number | undefined | null, carbsPer100g?: number | undefined | null, fatPer100g?: number | undefined | null, fiberPer100g?: number | undefined | null, totalCalories: number, totalProtein: number, totalCarbs: number, totalFat: number, totalFiber: number, openFoodFactsId?: string | undefined | null, productData?: string | undefined | null, isCustomAddition: boolean, addedBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null } | undefined | null, log?: { __typename?: 'MealFoodLog', id: string, quantity: number, loggedQuantity: number, unit: string, loggedAt: string, notes?: string | undefined | null, calories?: number | undefined | null, protein?: number | undefined | null, carbs?: number | undefined | null, fat?: number | undefined | null, fiber?: number | undefined | null, mealFood: { __typename?: 'MealFood', id: string, name: string }, user: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null } } | undefined | null }> }> }> }> } };

export type GQLBatchLogMealFoodMutationVariables = Exact<{
  input: GQLBatchLogMealFoodInput;
}>;


export type GQLBatchLogMealFoodMutation = { __typename?: 'Mutation', batchLogMealFood: boolean };

export type GQLCompleteMealMutationVariables = Exact<{
  mealId: Scalars['ID']['input'];
}>;


export type GQLCompleteMealMutation = { __typename?: 'Mutation', completeMeal: boolean };

export type GQLUncompleteMealMutationVariables = Exact<{
  mealId: Scalars['ID']['input'];
}>;


export type GQLUncompleteMealMutation = { __typename?: 'Mutation', uncompleteMeal: boolean };

export type GQLAddCustomFoodToMealMutationVariables = Exact<{
  input: GQLAddCustomFoodToMealInput;
}>;


export type GQLAddCustomFoodToMealMutation = { __typename?: 'Mutation', addCustomFoodToMeal: { __typename?: 'MealFoodLog', id: string, quantity: number, loggedQuantity: number, unit: string, loggedAt: string, notes?: string | undefined | null, calories?: number | undefined | null, protein?: number | undefined | null, carbs?: number | undefined | null, fat?: number | undefined | null, fiber?: number | undefined | null, mealFood: { __typename?: 'MealFood', id: string, name: string, addedAt: string, addedBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null } | undefined | null }, user: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null } } };

export type GQLAddFoodToPersonalLogMutationVariables = Exact<{
  input: GQLAddFoodToPersonalLogInput;
}>;


export type GQLAddFoodToPersonalLogMutation = { __typename?: 'Mutation', addFoodToPersonalLog: { __typename?: 'MealFoodLog', id: string, quantity: number, loggedQuantity: number, unit: string, loggedAt: string, notes?: string | undefined | null, calories?: number | undefined | null, protein?: number | undefined | null, carbs?: number | undefined | null, fat?: number | undefined | null, fiber?: number | undefined | null, mealFood: { __typename?: 'MealFood', id: string, name: string, addedAt: string, addedBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null } | undefined | null }, user: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null } } };

export type GQLRemoveMealLogMutationVariables = Exact<{
  foodId: Scalars['ID']['input'];
}>;


export type GQLRemoveMealLogMutation = { __typename?: 'Mutation', removeMealLog: boolean };

export type GQLFitspaceMealPlansOverviewQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceMealPlansOverviewQuery = { __typename?: 'Query', getMyMealPlansOverview: { __typename?: 'MyMealPlansPayload', activePlan?: { __typename?: 'MealPlan', id: string, title: string, description?: string | undefined | null, dailyCalories?: number | undefined | null, dailyProtein?: number | undefined | null, dailyCarbs?: number | undefined | null, dailyFat?: number | undefined | null, startDate?: string | undefined | null, endDate?: string | undefined | null, active: boolean, weekCount: number, createdAt: string, updatedAt: string, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null } | undefined | null, weeks: Array<{ __typename?: 'MealWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, completedAt?: string | undefined | null, days: Array<{ __typename?: 'MealDay', id: string, dayOfWeek: number, targetCalories?: number | undefined | null, targetProtein?: number | undefined | null, targetCarbs?: number | undefined | null, targetFat?: number | undefined | null, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, meals: Array<{ __typename?: 'Meal', id: string, name: string, dateTime: string, completedAt?: string | undefined | null, instructions?: string | undefined | null, foods: Array<{ __typename?: 'MealFood', id: string, name: string, quantity: number, unit: string, caloriesPer100g?: number | undefined | null, proteinPer100g?: number | undefined | null, carbsPer100g?: number | undefined | null, fatPer100g?: number | undefined | null, fiberPer100g?: number | undefined | null }> }> }> }> } | undefined | null, availablePlans: Array<{ __typename?: 'MealPlan', id: string, title: string, description?: string | undefined | null, dailyCalories?: number | undefined | null, dailyProtein?: number | undefined | null, dailyCarbs?: number | undefined | null, dailyFat?: number | undefined | null, startDate?: string | undefined | null, endDate?: string | undefined | null, active: boolean, weekCount: number, createdAt: string, updatedAt: string, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null } | undefined | null }> } };

export type GQLFitspaceActivateMealPlanMutationVariables = Exact<{
  planId: Scalars['ID']['input'];
}>;


export type GQLFitspaceActivateMealPlanMutation = { __typename?: 'Mutation', fitspaceActivateMealPlan: boolean };

export type GQLFitspaceDeactivateMealPlanMutationVariables = Exact<{
  planId: Scalars['ID']['input'];
}>;


export type GQLFitspaceDeactivateMealPlanMutation = { __typename?: 'Mutation', fitspaceDeactivateMealPlan: boolean };

export type GQLFitspaceDeleteMealPlanMutationVariables = Exact<{
  planId: Scalars['ID']['input'];
}>;


export type GQLFitspaceDeleteMealPlanMutation = { __typename?: 'Mutation', fitspaceDeleteMealPlan: boolean };

export type GQLGetFavouriteWorkoutsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetFavouriteWorkoutsQuery = { __typename?: 'Query', getFavouriteWorkouts: Array<{ __typename?: 'FavouriteWorkout', id: string, title: string, description?: string | undefined | null, createdById: string, createdAt: string, updatedAt: string, exercises: Array<{ __typename?: 'FavouriteWorkoutExercise', id: string, name: string, order: number, baseId?: string | undefined | null, favouriteWorkoutId: string, restSeconds?: number | undefined | null, instructions?: string | undefined | null, base?: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }>, images: Array<{ __typename?: 'Image', id: string, url: string, order: number }> } | undefined | null, sets: Array<{ __typename?: 'FavouriteWorkoutSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> }> };

export type GQLGetFavouriteWorkoutQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLGetFavouriteWorkoutQuery = { __typename?: 'Query', getFavouriteWorkout?: { __typename?: 'FavouriteWorkout', id: string, title: string, description?: string | undefined | null, createdById: string, createdAt: string, updatedAt: string, exercises: Array<{ __typename?: 'FavouriteWorkoutExercise', id: string, name: string, order: number, baseId?: string | undefined | null, favouriteWorkoutId: string, restSeconds?: number | undefined | null, instructions?: string | undefined | null, base?: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }>, images: Array<{ __typename?: 'Image', id: string, url: string, order: number }> } | undefined | null, sets: Array<{ __typename?: 'FavouriteWorkoutSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> } | undefined | null };

export type GQLCreateFavouriteWorkoutMutationVariables = Exact<{
  input: GQLCreateFavouriteWorkoutInput;
}>;


export type GQLCreateFavouriteWorkoutMutation = { __typename?: 'Mutation', createFavouriteWorkout: { __typename?: 'FavouriteWorkout', id: string, title: string, description?: string | undefined | null, createdAt: string, exercises: Array<{ __typename?: 'FavouriteWorkoutExercise', id: string, name: string, order: number, baseId?: string | undefined | null, restSeconds?: number | undefined | null, instructions?: string | undefined | null, sets: Array<{ __typename?: 'FavouriteWorkoutSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> } };

export type GQLUpdateFavouriteWorkoutMutationVariables = Exact<{
  input: GQLUpdateFavouriteWorkoutInput;
}>;


export type GQLUpdateFavouriteWorkoutMutation = { __typename?: 'Mutation', updateFavouriteWorkout: { __typename?: 'FavouriteWorkout', id: string, title: string, description?: string | undefined | null, updatedAt: string, exercises: Array<{ __typename?: 'FavouriteWorkoutExercise', id: string, name: string, order: number, baseId?: string | undefined | null, restSeconds?: number | undefined | null, instructions?: string | undefined | null, sets: Array<{ __typename?: 'FavouriteWorkoutSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> } };

export type GQLDeleteFavouriteWorkoutMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLDeleteFavouriteWorkoutMutation = { __typename?: 'Mutation', deleteFavouriteWorkout: boolean };

export type GQLStartWorkoutFromFavouriteMutationVariables = Exact<{
  input: GQLStartWorkoutFromFavouriteInput;
}>;


export type GQLStartWorkoutFromFavouriteMutation = { __typename?: 'Mutation', startWorkoutFromFavourite: string };

export type GQLFitspaceMyPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceMyPlansQuery = { __typename?: 'Query', getMyPlansOverviewFull: { __typename?: 'MyPlansPayload', activePlan?: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, difficulty?: GQLDifficulty | undefined | null, totalWorkouts: number, rating?: number | undefined | null, totalReviews: number, weekCount: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, startDate?: string | undefined | null, endDate?: string | undefined | null, updatedAt: string, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, scheduledAt?: string | undefined | null, completedAt?: string | undefined | null, isExtra: boolean, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, restSeconds?: number | undefined | null, videoUrl?: string | undefined | null, instructions?: string | undefined | null, name: string, warmupSets?: number | undefined | null, completedAt?: string | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null }>, sets: Array<{ __typename?: 'ExerciseSet', id: string }> }> }> }> } | undefined | null, quickWorkoutPlan?: { __typename?: 'TrainingPlan', id: string, totalWorkouts: number, weekCount: number, completedWorkoutsDays: number, adherence: number, updatedAt: string, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, scheduledAt?: string | undefined | null, completedAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, videoUrl?: string | undefined | null, instructions?: string | undefined | null, name: string, completedAt?: string | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null }>, sets: Array<{ __typename?: 'ExerciseSet', id: string }> }> }> }> } | undefined | null, availablePlans: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, difficulty?: GQLDifficulty | undefined | null, totalWorkouts: number, rating?: number | undefined | null, totalReviews: number, weekCount: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, startDate?: string | undefined | null, endDate?: string | undefined | null, updatedAt: string, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, sex?: string | undefined | null } | undefined | null }>, completedPlans: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, difficulty?: GQLDifficulty | undefined | null, totalWorkouts: number, rating?: number | undefined | null, totalReviews: number, weekCount: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, startDate?: string | undefined | null, endDate?: string | undefined | null, completedAt?: string | undefined | null, updatedAt: string, userReview?: { __typename?: 'Review', id: string, rating: number, comment?: string | undefined | null, createdAt: string, updatedAt: string } | undefined | null, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, sex?: string | undefined | null } | undefined | null }> } };

export type GQLActivatePlanMutationVariables = Exact<{
  planId: Scalars['ID']['input'];
  startDate: Scalars['String']['input'];
  resume: Scalars['Boolean']['input'];
}>;


export type GQLActivatePlanMutation = { __typename?: 'Mutation', activatePlan: boolean };

export type GQLPausePlanMutationVariables = Exact<{
  planId: Scalars['ID']['input'];
}>;


export type GQLPausePlanMutation = { __typename?: 'Mutation', pausePlan: boolean };

export type GQLClosePlanMutationVariables = Exact<{
  planId: Scalars['ID']['input'];
}>;


export type GQLClosePlanMutation = { __typename?: 'Mutation', closePlan: boolean };

export type GQLDeletePlanMutationVariables = Exact<{
  planId: Scalars['ID']['input'];
}>;


export type GQLDeletePlanMutation = { __typename?: 'Mutation', deletePlan: boolean };

export type GQLCreateReviewMutationVariables = Exact<{
  input: GQLCreateReviewInput;
}>;


export type GQLCreateReviewMutation = { __typename?: 'Mutation', createReview: boolean };

export type GQLUpdateReviewMutationVariables = Exact<{
  input: GQLUpdateReviewInput;
}>;


export type GQLUpdateReviewMutation = { __typename?: 'Mutation', updateReview: boolean };

export type GQLDeleteReviewMutationVariables = Exact<{
  input: GQLDeleteReviewInput;
}>;


export type GQLDeleteReviewMutation = { __typename?: 'Mutation', deleteReview: boolean };

export type GQLExtendPlanMutationVariables = Exact<{
  planId: Scalars['ID']['input'];
  weeks: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type GQLExtendPlanMutation = { __typename?: 'Mutation', extendPlan: boolean };

export type GQLRemoveWeekMutationVariables = Exact<{
  planId: Scalars['ID']['input'];
  weekId: Scalars['ID']['input'];
}>;


export type GQLRemoveWeekMutation = { __typename?: 'Mutation', removeWeek: boolean };

export type GQLProfileFragmentFragment = { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null, avatarUrl?: string | undefined | null, height?: number | undefined | null, weight?: number | undefined | null, fitnessLevel?: GQLFitnessLevel | undefined | null, allergies?: string | undefined | null, activityLevel?: GQLActivityLevel | undefined | null, goals: Array<GQLGoal>, bio?: string | undefined | null, specialization: Array<string>, credentials: Array<string>, successStories: Array<string>, trainerSince?: string | undefined | null, createdAt: string, updatedAt: string, email?: string | undefined | null, weekStartsOn?: number | undefined | null, weightUnit: GQLWeightUnit, heightUnit: GQLHeightUnit, theme: GQLTheme, timeFormat: GQLTimeFormat, trainingView: GQLTrainingView, notificationPreferences: { __typename?: 'NotificationPreferences', workoutReminders: boolean, mealReminders: boolean, progressUpdates: boolean, collaborationNotifications: boolean, systemNotifications: boolean, emailNotifications: boolean, pushNotifications: boolean } };

export type GQLProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLProfileQuery = { __typename?: 'Query', profile?: { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null, avatarUrl?: string | undefined | null, height?: number | undefined | null, weight?: number | undefined | null, fitnessLevel?: GQLFitnessLevel | undefined | null, allergies?: string | undefined | null, activityLevel?: GQLActivityLevel | undefined | null, goals: Array<GQLGoal>, bio?: string | undefined | null, specialization: Array<string>, credentials: Array<string>, successStories: Array<string>, trainerSince?: string | undefined | null, createdAt: string, updatedAt: string, email?: string | undefined | null, weekStartsOn?: number | undefined | null, weightUnit: GQLWeightUnit, heightUnit: GQLHeightUnit, theme: GQLTheme, timeFormat: GQLTimeFormat, trainingView: GQLTrainingView, notificationPreferences: { __typename?: 'NotificationPreferences', workoutReminders: boolean, mealReminders: boolean, progressUpdates: boolean, collaborationNotifications: boolean, systemNotifications: boolean, emailNotifications: boolean, pushNotifications: boolean } } | undefined | null };

export type GQLUpdateProfileMutationVariables = Exact<{
  input: GQLUpdateProfileInput;
}>;


export type GQLUpdateProfileMutation = { __typename?: 'Mutation', updateProfile?: { __typename?: 'UserProfile', id: string } | undefined | null };

export type GQLBodyMeasuresQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLBodyMeasuresQuery = { __typename?: 'Query', bodyMeasures: Array<{ __typename?: 'UserBodyMeasure', id: string, measuredAt: string, weight?: number | undefined | null, chest?: number | undefined | null, waist?: number | undefined | null, hips?: number | undefined | null, neck?: number | undefined | null, bicepsLeft?: number | undefined | null, bicepsRight?: number | undefined | null, thighLeft?: number | undefined | null, thighRight?: number | undefined | null, calfLeft?: number | undefined | null, calfRight?: number | undefined | null, bodyFat?: number | undefined | null, notes?: string | undefined | null }> };

export type GQLAddBodyMeasurementMutationVariables = Exact<{
  input: GQLAddBodyMeasurementInput;
}>;


export type GQLAddBodyMeasurementMutation = { __typename?: 'Mutation', addBodyMeasurement: { __typename?: 'UserBodyMeasure', id: string, measuredAt: string, weight?: number | undefined | null, chest?: number | undefined | null, waist?: number | undefined | null, hips?: number | undefined | null, neck?: number | undefined | null, bicepsLeft?: number | undefined | null, bicepsRight?: number | undefined | null, thighLeft?: number | undefined | null, thighRight?: number | undefined | null, calfLeft?: number | undefined | null, calfRight?: number | undefined | null, bodyFat?: number | undefined | null, notes?: string | undefined | null } };

export type GQLUpdateBodyMeasurementMutationVariables = Exact<{
  input: GQLUpdateBodyMeasurementInput;
}>;


export type GQLUpdateBodyMeasurementMutation = { __typename?: 'Mutation', updateBodyMeasurement: { __typename?: 'UserBodyMeasure', id: string, measuredAt: string, weight?: number | undefined | null, chest?: number | undefined | null, waist?: number | undefined | null, hips?: number | undefined | null, neck?: number | undefined | null, bicepsLeft?: number | undefined | null, bicepsRight?: number | undefined | null, thighLeft?: number | undefined | null, thighRight?: number | undefined | null, calfLeft?: number | undefined | null, calfRight?: number | undefined | null, bodyFat?: number | undefined | null, notes?: string | undefined | null } };

export type GQLDeleteBodyMeasurementMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLDeleteBodyMeasurementMutation = { __typename?: 'Mutation', deleteBodyMeasurement: boolean };

export type GQLProgressUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLProgressUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, email: string, name?: string | undefined | null, role: GQLUserRole } | undefined | null };

export type GQLAvailableExercisesForProgressQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GQLAvailableExercisesForProgressQuery = { __typename?: 'Query', exercisesProgressByUser: Array<{ __typename?: 'ExerciseProgress', baseExercise?: { __typename?: 'BaseExercise', id: string, name: string, equipment?: GQLEquipment | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', alias?: string | undefined | null, name: string }> } | undefined | null }> };

export type GQLSelectedExercisesProgressQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
  exerciseIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type GQLSelectedExercisesProgressQuery = { __typename?: 'Query', exercisesProgressByUser: Array<{ __typename?: 'ExerciseProgress', averageRpe?: number | undefined | null, totalSets?: number | undefined | null, lastPerformed?: string | undefined | null, baseExercise?: { __typename?: 'BaseExercise', id: string, name: string, muscleGroups: Array<{ __typename?: 'MuscleGroup', alias?: string | undefined | null, name: string, groupSlug: string, category: { __typename?: 'MuscleGroupCategory', name: string } }> } | undefined | null, estimated1RMProgress: Array<{ __typename?: 'OneRmEntry', date: string, average1RM: number, detailedLogs: Array<{ __typename?: 'OneRmLog', estimated1RM: number, weight?: number | undefined | null, reps?: number | undefined | null }> }>, totalVolumeProgress: Array<{ __typename?: 'VolumeEntry', week: string, totalVolume: number, totalSets: number }> }> };

export type GQLResetUserLogsMutationVariables = Exact<{ [key: string]: never; }>;


export type GQLResetUserLogsMutation = { __typename?: 'Mutation', resetUserLogs: boolean };

export type GQLDeleteUserAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type GQLDeleteUserAccountMutation = { __typename?: 'Mutation', deleteUserAccount: boolean };

export type GQLGetTrainingPlanPreviewByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLGetTrainingPlanPreviewByIdQuery = { __typename?: 'Query', getTrainingPlanById: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isDemo: boolean, rating?: number | undefined | null, totalReviews: number, difficulty?: GQLDifficulty | undefined | null, weekCount: number, totalWorkouts: number, assignedCount: number, startDate?: string | undefined | null, active: boolean, assignedTo?: { __typename?: 'UserPublic', id: string } | undefined | null, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, restSeconds?: number | undefined | null, tempo?: string | undefined | null, warmupSets?: number | undefined | null, instructions?: string | undefined | null, order: number, videoUrl?: string | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, groupSlug: string, alias?: string | undefined | null }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> }> }> } };

export type GQLFitspaceGetCurrentWorkoutIdQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceGetCurrentWorkoutIdQuery = { __typename?: 'Query', getMyPlansOverview: { __typename?: 'MyPlansPayload', activePlan?: { __typename?: 'TrainingPlan', id: string } | undefined | null } };

export type GQLFitspaceGetActivePlanIdQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceGetActivePlanIdQuery = { __typename?: 'Query', getActivePlanId?: string | undefined | null };

export type GQLFitspaceGetWorkoutQueryVariables = Exact<{
  trainingId: Scalars['ID']['input'];
}>;


export type GQLFitspaceGetWorkoutQuery = { __typename?: 'Query', getWorkout?: { __typename?: 'GetWorkoutPayload', plan: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, startDate?: string | undefined | null, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, startedAt?: string | undefined | null, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, duration?: number | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, restSeconds?: number | undefined | null, tempo?: string | undefined | null, warmupSets?: number | undefined | null, instructions?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, order: number, videoUrl?: string | undefined | null, completedAt?: string | undefined | null, isExtra: boolean, substitutedBy?: { __typename?: 'Substitute', id: string, name: string, instructions?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, videoUrl?: string | undefined | null, completedAt?: string | undefined | null, baseId?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, isExtra: boolean, completedAt?: string | undefined | null, log?: { __typename?: 'ExerciseSetLog', id: string, weight?: number | undefined | null, rpe?: number | undefined | null, reps?: number | undefined | null, createdAt: string } | undefined | null }> } | undefined | null, substitutes: Array<{ __typename?: 'BaseExerciseSubstitute', id: string, substitute: { __typename?: 'BaseExercise', id: string, name: string } }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, isExtra: boolean, completedAt?: string | undefined | null, log?: { __typename?: 'ExerciseSetLog', id: string, weight?: number | undefined | null, rpe?: number | undefined | null, reps?: number | undefined | null, createdAt: string } | undefined | null }> }> }> }> } } | undefined | null };

export type GQLFitspaceGetExercisesQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceGetExercisesQuery = { __typename?: 'Query', getExercises: { __typename?: 'GetExercisesResponse', publicExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, images: Array<{ __typename?: 'Image', id: string, url: string, order: number }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }>, secondaryMuscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }> }>, trainerExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, images: Array<{ __typename?: 'Image', id: string, url: string, order: number }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }>, secondaryMuscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }> }> }, muscleGroupCategories: Array<{ __typename?: 'MuscleGroupCategory', id: string, name: string, slug: string, muscles: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }> }> };

export type GQLFitspaceGetWorkoutInfoQueryVariables = Exact<{
  dayId: Scalars['ID']['input'];
}>;


export type GQLFitspaceGetWorkoutInfoQuery = { __typename?: 'Query', getWorkoutInfo: { __typename?: 'TrainingDay', id: string, duration?: number | undefined | null } };

export type GQLFitspaceGetAiExerciseSuggestionsMutationVariables = Exact<{
  dayId: Scalars['ID']['input'];
}>;


export type GQLFitspaceGetAiExerciseSuggestionsMutation = { __typename?: 'Mutation', getAiExerciseSuggestions: Array<{ __typename?: 'AiExerciseSuggestion', exercise: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }>, secondaryMuscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }> }, sets: Array<{ __typename?: 'SuggestedSets', reps?: number | undefined | null, rpe?: number | undefined | null } | undefined | null>, aiMeta: { __typename?: 'AiMeta', explanation: string } }> };

export type GQLFitspaceAddAiExerciseToWorkoutMutationVariables = Exact<{
  input: GQLAddAiExerciseToWorkoutInput;
}>;


export type GQLFitspaceAddAiExerciseToWorkoutMutation = { __typename?: 'Mutation', addAiExerciseToWorkout: { __typename?: 'TrainingExercise', id: string } };

export type GQLFitspaceMarkSetAsCompletedMutationVariables = Exact<{
  setId: Scalars['ID']['input'];
  completed: Scalars['Boolean']['input'];
}>;


export type GQLFitspaceMarkSetAsCompletedMutation = { __typename?: 'Mutation', markSetAsCompleted?: boolean | undefined | null };

export type GQLFitspaceMarkExerciseAsCompletedMutationVariables = Exact<{
  exerciseId: Scalars['ID']['input'];
  completed: Scalars['Boolean']['input'];
}>;


export type GQLFitspaceMarkExerciseAsCompletedMutation = { __typename?: 'Mutation', markExerciseAsCompleted?: boolean | undefined | null };

export type GQLFitspaceUpdateSetLogMutationVariables = Exact<{
  input: GQLLogSetInput;
}>;


export type GQLFitspaceUpdateSetLogMutation = { __typename?: 'Mutation', updateSetLog?: { __typename?: 'ExerciseSetLog', id: string, reps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null } | undefined | null };

export type GQLFitspaceLogWorkoutProgressMutationVariables = Exact<{
  dayId: Scalars['ID']['input'];
  tick: Scalars['Int']['input'];
}>;


export type GQLFitspaceLogWorkoutProgressMutation = { __typename?: 'Mutation', logWorkoutProgress: string };

export type GQLFitspaceMarkWorkoutAsCompletedMutationVariables = Exact<{
  dayId: Scalars['ID']['input'];
}>;


export type GQLFitspaceMarkWorkoutAsCompletedMutation = { __typename?: 'Mutation', markWorkoutAsCompleted?: boolean | undefined | null };

export type GQLFitspaceAddExercisesToWorkoutMutationVariables = Exact<{
  input: GQLAddExercisesToWorkoutInput;
}>;


export type GQLFitspaceAddExercisesToWorkoutMutation = { __typename?: 'Mutation', addExercisesToWorkout: Array<{ __typename?: 'TrainingExercise', id: string }> };

export type GQLFitspaceRemoveExerciseFromWorkoutMutationVariables = Exact<{
  exerciseId: Scalars['ID']['input'];
}>;


export type GQLFitspaceRemoveExerciseFromWorkoutMutation = { __typename?: 'Mutation', removeExerciseFromWorkout: boolean };

export type GQLFitspaceClearTodaysWorkoutMutationVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceClearTodaysWorkoutMutation = { __typename?: 'Mutation', clearTodaysWorkout: boolean };

export type GQLFitspaceAddSetMutationVariables = Exact<{
  exerciseId: Scalars['ID']['input'];
}>;


export type GQLFitspaceAddSetMutation = { __typename?: 'Mutation', addSet: { __typename?: 'ExerciseSet', id: string } };

export type GQLFitspaceRemoveSetMutationVariables = Exact<{
  setId: Scalars['ID']['input'];
}>;


export type GQLFitspaceRemoveSetMutation = { __typename?: 'Mutation', removeSet: boolean };

export type GQLFitspaceSwapExerciseMutationVariables = Exact<{
  exerciseId: Scalars['ID']['input'];
  substituteId: Scalars['ID']['input'];
}>;


export type GQLFitspaceSwapExerciseMutation = { __typename?: 'Mutation', swapExercise: { __typename?: 'Substitute', id: string } };

export type GQLQuickWorkoutExercisesQueryVariables = Exact<{
  where?: InputMaybe<GQLExerciseWhereInput>;
}>;


export type GQLQuickWorkoutExercisesQuery = { __typename?: 'Query', publicExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, type?: GQLExerciseType | undefined | null, images: Array<{ __typename?: 'Image', id: string, url: string, order: number }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }>, secondaryMuscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }> }> };

export type GQLFitspaceGetUserQuickWorkoutPlanQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceGetUserQuickWorkoutPlanQuery = { __typename?: 'Query', getQuickWorkoutPlan: { __typename?: 'TrainingPlan', id: string, title: string, weeks: Array<{ __typename?: 'TrainingWeek', id: string, scheduledAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, baseId?: string | undefined | null, order: number, completedAt?: string | undefined | null, equipment?: GQLEquipment | undefined | null, images: Array<{ __typename?: 'Image', id: string, url: string, order: number }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> }> }> } };

export type GQLFitspaceCreateQuickWorkoutMutationVariables = Exact<{
  input: GQLCreateQuickWorkoutInput;
}>;


export type GQLFitspaceCreateQuickWorkoutMutation = { __typename?: 'Mutation', createQuickWorkout: { __typename?: 'TrainingPlan', id: string, title: string, isDraft: boolean, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, order: number, isExtra: boolean, baseId?: string | undefined | null, images: Array<{ __typename?: 'Image', id: string, url: string, order: number }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, minReps?: number | undefined | null, maxReps?: number | undefined | null, reps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> }> }> } };

export type GQLFitspaceGenerateAiWorkoutMutationVariables = Exact<{
  input: GQLGenerateAiWorkoutInput;
}>;


export type GQLFitspaceGenerateAiWorkoutMutation = { __typename?: 'Mutation', generateAiWorkout: { __typename?: 'AiWorkoutResult', totalDuration?: number | undefined | null, exercises: Array<{ __typename?: 'AiWorkoutExercise', order: number, exercise: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }> }, sets: Array<{ __typename?: 'SuggestedSets', reps?: number | undefined | null, rpe?: number | undefined | null } | undefined | null> }> } };

export type GQLCreateQuickWorkoutPlanMutationVariables = Exact<{
  input: GQLCreateTrainingPlanInput;
}>;


export type GQLCreateQuickWorkoutPlanMutation = { __typename?: 'Mutation', createTrainingPlan: { __typename?: 'CreateTrainingPlanPayload', id: string, success: boolean } };

export type GQLAssignQuickWorkoutPlanMutationVariables = Exact<{
  input: GQLAssignTrainingPlanToClientInput;
}>;


export type GQLAssignQuickWorkoutPlanMutation = { __typename?: 'Mutation', assignTrainingPlanToClient: boolean };

export type GQLAddExercisesToQuickWorkoutMutationVariables = Exact<{
  exercises: Array<GQLQuickWorkoutExerciseInput> | GQLQuickWorkoutExerciseInput;
}>;


export type GQLAddExercisesToQuickWorkoutMutation = { __typename?: 'Mutation', addExercisesToQuickWorkout: { __typename?: 'TrainingPlan', id: string } };

export type GQLFitspaceAddExercisesToQuickWorkoutMutationVariables = Exact<{
  exercises: Array<GQLQuickWorkoutExerciseInput> | GQLQuickWorkoutExerciseInput;
}>;


export type GQLFitspaceAddExercisesToQuickWorkoutMutation = { __typename?: 'Mutation', addExercisesToQuickWorkout: { __typename?: 'TrainingPlan', id: string, title: string, isDraft: boolean, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, order: number, isExtra: boolean, baseId?: string | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, minReps?: number | undefined | null, maxReps?: number | undefined | null, reps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> }> }> } };

export type GQLGetClientsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetClientsQuery = { __typename?: 'Query', myClients: Array<{ __typename?: 'UserPublic', id: string, email: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole, updatedAt: string, createdAt: string, activePlan?: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, weekCount: number, startDate?: string | undefined | null, endDate?: string | undefined | null, lastSessionActivity?: string | undefined | null, progress?: number | undefined | null } | undefined | null }> };

export type GQLCreateCoachingRequestMutationVariables = Exact<{
  recipientEmail: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
}>;


export type GQLCreateCoachingRequestMutation = { __typename?: 'Mutation', createCoachingRequest: { __typename?: 'CoachingRequest', id: string } };

export type GQLGetClientByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLGetClientByIdQuery = { __typename?: 'Query', userPublic?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string, phone?: string | undefined | null, image?: string | undefined | null, sex?: string | undefined | null, birthday?: string | undefined | null, goals: Array<GQLGoal>, currentWeight?: number | undefined | null, height?: number | undefined | null, allergies?: string | undefined | null } | undefined | null, getClientTrainingPlans: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, weekCount: number, startDate?: string | undefined | null, endDate?: string | undefined | null, active: boolean, progress?: number | undefined | null, nextSession?: string | undefined | null }>, getClientActivePlan?: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, weekCount: number, startDate?: string | undefined | null, endDate?: string | undefined | null, active: boolean, progress?: number | undefined | null, nextSession?: string | undefined | null, difficulty?: GQLDifficulty | undefined | null, totalWorkouts: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, weeks: Array<{ __typename?: 'TrainingWeek', id: string, name: string, completedAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, completedAt?: string | undefined | null, duration?: number | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, completedAt?: string | undefined | null, log?: { __typename?: 'ExerciseSetLog', id: string, reps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null } | undefined | null }> }> }> }> } | undefined | null, getClientMealPlans: Array<{ __typename?: 'MealPlan', id: string, title: string, description?: string | undefined | null, isDraft: boolean, dailyCalories?: number | undefined | null, dailyProtein?: number | undefined | null, dailyCarbs?: number | undefined | null, dailyFat?: number | undefined | null, weekCount: number, startDate?: string | undefined | null, endDate?: string | undefined | null, active: boolean, assignedCount: number, createdAt: string, updatedAt: string }> };

export type GQLClientBodyMeasuresQueryVariables = Exact<{
  clientId: Scalars['ID']['input'];
}>;


export type GQLClientBodyMeasuresQuery = { __typename?: 'Query', clientBodyMeasures: Array<{ __typename?: 'UserBodyMeasure', id: string, measuredAt: string, weight?: number | undefined | null, chest?: number | undefined | null, waist?: number | undefined | null, hips?: number | undefined | null, neck?: number | undefined | null, bicepsLeft?: number | undefined | null, bicepsRight?: number | undefined | null, thighLeft?: number | undefined | null, thighRight?: number | undefined | null, calfLeft?: number | undefined | null, calfRight?: number | undefined | null, bodyFat?: number | undefined | null, notes?: string | undefined | null }> };

export type GQLExercisesProgressByUserQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GQLExercisesProgressByUserQuery = { __typename?: 'Query', exercisesProgressByUser: Array<{ __typename?: 'ExerciseProgress', averageRpe?: number | undefined | null, totalSets?: number | undefined | null, lastPerformed?: string | undefined | null, baseExercise?: { __typename?: 'BaseExercise', id: string, name: string, muscleGroups: Array<{ __typename?: 'MuscleGroup', alias?: string | undefined | null, name: string, groupSlug: string, category: { __typename?: 'MuscleGroupCategory', name: string } }> } | undefined | null, estimated1RMProgress: Array<{ __typename?: 'OneRmEntry', date: string, average1RM: number, detailedLogs: Array<{ __typename?: 'OneRmLog', estimated1RM: number, weight?: number | undefined | null, reps?: number | undefined | null }> }>, totalVolumeProgress: Array<{ __typename?: 'VolumeEntry', week: string, totalVolume: number, totalSets: number }> }> };

export type GQLMyCollaborationInvitationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLMyCollaborationInvitationsQuery = { __typename?: 'Query', myCollaborationInvitations: Array<{ __typename?: 'CollaborationInvitation', id: string, status: GQLCollaborationInvitationStatus, message?: string | undefined | null, createdAt: string, updatedAt: string, sender: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string }, recipient: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }> };

export type GQLSentCollaborationInvitationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLSentCollaborationInvitationsQuery = { __typename?: 'Query', sentCollaborationInvitations: Array<{ __typename?: 'CollaborationInvitation', id: string, status: GQLCollaborationInvitationStatus, message?: string | undefined | null, createdAt: string, updatedAt: string, sender: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string }, recipient: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }> };

export type GQLSendCollaborationInvitationMutationVariables = Exact<{
  input: GQLSendCollaborationInvitationInput;
}>;


export type GQLSendCollaborationInvitationMutation = { __typename?: 'Mutation', sendCollaborationInvitation: { __typename?: 'CollaborationInvitation', id: string, status: GQLCollaborationInvitationStatus, message?: string | undefined | null, createdAt: string, updatedAt: string, sender: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string }, recipient: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } } };

export type GQLRespondToCollaborationInvitationMutationVariables = Exact<{
  input: GQLRespondToCollaborationInvitationInput;
}>;


export type GQLRespondToCollaborationInvitationMutation = { __typename?: 'Mutation', respondToCollaborationInvitation: { __typename?: 'CollaborationInvitation', id: string, status: GQLCollaborationInvitationStatus, message?: string | undefined | null, createdAt: string, updatedAt: string, sender: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string }, recipient: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } } };

export type GQLMyTrainingPlanCollaborationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLMyTrainingPlanCollaborationsQuery = { __typename?: 'Query', myTrainingPlanCollaborations: Array<{ __typename?: 'TrainingPlanCollaborator', id: string, permission: GQLCollaborationPermission, createdAt: string, updatedAt: string, trainingPlan: { __typename?: 'TrainingPlan', id: string, title: string }, addedBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }> };

export type GQLMyMealPlanCollaborationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLMyMealPlanCollaborationsQuery = { __typename?: 'Query', myMealPlanCollaborations: Array<{ __typename?: 'MealPlanCollaborator', id: string, permission: GQLCollaborationPermission, createdAt: string, updatedAt: string, mealPlan: { __typename?: 'MealPlan', id: string, title: string }, addedBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }> };

export type GQLRemoveTrainingPlanCollaboratorMutationVariables = Exact<{
  input: GQLRemoveTrainingPlanCollaboratorInput;
}>;


export type GQLRemoveTrainingPlanCollaboratorMutation = { __typename?: 'Mutation', removeTrainingPlanCollaborator: boolean };

export type GQLRemoveMealPlanCollaboratorMutationVariables = Exact<{
  input: GQLRemoveMealPlanCollaboratorInput;
}>;


export type GQLRemoveMealPlanCollaboratorMutation = { __typename?: 'Mutation', removeMealPlanCollaborator: boolean };

export type GQLMyTeamMembersQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLMyTeamMembersQuery = { __typename?: 'Query', myTeamMembers: Array<{ __typename?: 'TeamMember', id: string, isCurrentUserSender: boolean, createdAt: string, updatedAt: string, user: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string }, addedBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }> };

export type GQLMyPlanCollaboratorsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLMyPlanCollaboratorsQuery = { __typename?: 'Query', myPlanCollaborators: Array<{ __typename?: 'PlanCollaboratorSummary', id: string, permission: GQLCollaborationPermission, planType: string, planId: string, planTitle: string, createdAt: string, updatedAt: string, collaborator: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string }, addedBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }> };

export type GQLUpdateTrainingPlanCollaboratorPermissionMutationVariables = Exact<{
  input: GQLUpdateTrainingPlanCollaboratorPermissionInput;
}>;


export type GQLUpdateTrainingPlanCollaboratorPermissionMutation = { __typename?: 'Mutation', updateTrainingPlanCollaboratorPermission: { __typename?: 'TrainingPlanCollaborator', id: string, permission: GQLCollaborationPermission } };

export type GQLUpdateMealPlanCollaboratorPermissionMutationVariables = Exact<{
  input: GQLUpdateMealPlanCollaboratorPermissionInput;
}>;


export type GQLUpdateMealPlanCollaboratorPermissionMutation = { __typename?: 'Mutation', updateMealPlanCollaboratorPermission: { __typename?: 'MealPlanCollaborator', id: string, permission: GQLCollaborationPermission } };

export type GQLTrainingPlanCollaboratorsQueryVariables = Exact<{
  trainingPlanId: Scalars['ID']['input'];
}>;


export type GQLTrainingPlanCollaboratorsQuery = { __typename?: 'Query', trainingPlanCollaborators: Array<{ __typename?: 'TrainingPlanCollaborator', id: string, permission: GQLCollaborationPermission, createdAt: string, updatedAt: string, collaborator: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }> };

export type GQLMealPlanCollaboratorsQueryVariables = Exact<{
  mealPlanId: Scalars['ID']['input'];
}>;


export type GQLMealPlanCollaboratorsQuery = { __typename?: 'Query', mealPlanCollaborators: Array<{ __typename?: 'MealPlanCollaborator', id: string, permission: GQLCollaborationPermission, createdAt: string, updatedAt: string, collaborator: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }> };

export type GQLAddTrainingPlanCollaboratorMutationVariables = Exact<{
  input: GQLAddTrainingPlanCollaboratorInput;
}>;


export type GQLAddTrainingPlanCollaboratorMutation = { __typename?: 'Mutation', addTrainingPlanCollaborator: { __typename?: 'TrainingPlanCollaborator', id: string, permission: GQLCollaborationPermission, createdAt: string, updatedAt: string, collaborator: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } } };

export type GQLAddMealPlanCollaboratorMutationVariables = Exact<{
  input: GQLAddMealPlanCollaboratorInput;
}>;


export type GQLAddMealPlanCollaboratorMutation = { __typename?: 'Mutation', addMealPlanCollaborator: { __typename?: 'MealPlanCollaborator', id: string, permission: GQLCollaborationPermission, createdAt: string, updatedAt: string, collaborator: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } } };

export type GQLAllPlansWithPermissionsQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GQLAllPlansWithPermissionsQuery = { __typename?: 'Query', allPlansWithPermissions: Array<{ __typename?: 'PlanWithPermissions', id: string, title: string, planType: string, description?: string | undefined | null, isTemplate: boolean, createdAt: string, currentPermission?: GQLCollaborationPermission | undefined | null, hasAccess: boolean }> };

export type GQLBulkUpdatePlanPermissionsMutationVariables = Exact<{
  input: GQLBulkUpdatePlanPermissionsInput;
}>;


export type GQLBulkUpdatePlanPermissionsMutation = { __typename?: 'Mutation', bulkUpdatePlanPermissions: Array<{ __typename?: 'PlanCollaboratorSummary', id: string, planId: string, planTitle: string, planType: string, permission: GQLCollaborationPermission, createdAt: string, updatedAt: string, collaborator: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string }, addedBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }> };

export type GQLTrainerDashboardUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLTrainerDashboardUserQuery = { __typename?: 'Query', userWithAllData?: { __typename?: 'User', id: string, email: string, name?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string, profile?: { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null, avatarUrl?: string | undefined | null, activityLevel?: GQLActivityLevel | undefined | null, goals: Array<GQLGoal>, bio?: string | undefined | null, createdAt: string, updatedAt: string, bodyMeasures: Array<{ __typename?: 'UserBodyMeasure', id: string, measuredAt: string, weight?: number | undefined | null, chest?: number | undefined | null, waist?: number | undefined | null, hips?: number | undefined | null, neck?: number | undefined | null, bicepsLeft?: number | undefined | null, bicepsRight?: number | undefined | null, thighLeft?: number | undefined | null, thighRight?: number | undefined | null, calfLeft?: number | undefined | null, calfRight?: number | undefined | null, bodyFat?: number | undefined | null, notes?: string | undefined | null }> } | undefined | null, trainer?: { __typename?: 'UserPublic', id: string, email: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string } | undefined | null, clients: Array<{ __typename?: 'UserPublic', id: string, email: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string }>, sessions: Array<{ __typename?: 'UserSession', id: string, createdAt: string, expiresAt: string }> } | undefined | null };

export type GQLBasicUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLBasicUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, email: string, name?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string } | undefined | null };

export type GQLMuscleGroupCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLMuscleGroupCategoriesQuery = { __typename?: 'Query', muscleGroupCategories: Array<{ __typename?: 'MuscleGroupCategory', id: string, name: string, slug: string, muscles: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string, isPrimary: boolean }> }> };

export type GQLExercisesBasicInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLExercisesBasicInfoQuery = { __typename?: 'Query', userExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string }>, publicExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string }> };

export type GQLTrainerExercisesQueryVariables = Exact<{
  where?: InputMaybe<GQLExerciseWhereInput>;
}>;


export type GQLTrainerExercisesQuery = { __typename?: 'Query', userExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, images: Array<{ __typename?: 'Image', id: string, url: string, order: number }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }>, secondaryMuscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }> }>, publicExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, images: Array<{ __typename?: 'Image', id: string, url: string, order: number }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }>, secondaryMuscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }> }> };

export type GQLPublicExercisesQueryVariables = Exact<{
  where?: InputMaybe<GQLExerciseWhereInput>;
}>;


export type GQLPublicExercisesQuery = { __typename?: 'Query', publicExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }>, secondaryMuscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }> }> };

export type GQLExerciseQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLExerciseQuery = { __typename?: 'Query', exercise?: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null }> } | undefined | null };

export type GQLCreateExerciseMutationVariables = Exact<{
  input: GQLCreateExerciseInput;
}>;


export type GQLCreateExerciseMutation = { __typename?: 'Mutation', createExercise: boolean };

export type GQLUpdateExerciseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: GQLUpdateExerciseInput;
}>;


export type GQLUpdateExerciseMutation = { __typename?: 'Mutation', updateExercise: boolean };

export type GQLDeleteExerciseMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLDeleteExerciseMutation = { __typename?: 'Mutation', deleteExercise: boolean };

export type GQLAddSubstituteExerciseMutationVariables = Exact<{
  input: GQLAddSubstituteExerciseInput;
}>;


export type GQLAddSubstituteExerciseMutation = { __typename?: 'Mutation', addSubstituteExercise: boolean };

export type GQLRemoveSubstituteExerciseMutationVariables = Exact<{
  input: GQLRemoveSubstituteExerciseInput;
}>;


export type GQLRemoveSubstituteExerciseMutation = { __typename?: 'Mutation', removeSubstituteExercise: boolean };

export type GQLUpdateSubstituteExerciseMutationVariables = Exact<{
  input: GQLUpdateSubstituteExerciseInput;
}>;


export type GQLUpdateSubstituteExerciseMutation = { __typename?: 'Mutation', updateSubstituteExercise: boolean };

export type GQLGetExerciseWithSubstitutesQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLGetExerciseWithSubstitutesQuery = { __typename?: 'Query', exercise?: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, equipment?: GQLEquipment | undefined | null, images: Array<{ __typename?: 'Image', id: string, url: string, order: number, createdAt: string }>, substitutes: Array<{ __typename?: 'BaseExerciseSubstitute', id: string, originalId: string, substituteId: string, reason?: string | undefined | null, createdAt: string, substitute: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, equipment?: GQLEquipment | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, groupSlug: string }> } }>, canBeSubstitutedBy: Array<{ __typename?: 'BaseExerciseSubstitute', id: string, originalId: string, substituteId: string, reason?: string | undefined | null, createdAt: string, original: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, equipment?: GQLEquipment | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, groupSlug: string }> } }> } | undefined | null };

export type GQLMealPlanTemplateFragment = { __typename?: 'MealPlan', id: string, title: string, description?: string | undefined | null, isDraft: boolean, dailyCalories?: number | undefined | null, dailyProtein?: number | undefined | null, dailyCarbs?: number | undefined | null, dailyFat?: number | undefined | null, createdAt: string, updatedAt: string, assignedCount: number, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } | undefined | null, collaborators: Array<{ __typename?: 'MealPlanCollaborator', id: string, permission: GQLCollaborationPermission, createdAt: string, collaborator: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string }, addedBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }>, weeks: Array<{ __typename?: 'MealWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, days: Array<{ __typename?: 'MealDay', id: string, dayOfWeek: number, targetCalories?: number | undefined | null, targetProtein?: number | undefined | null, targetCarbs?: number | undefined | null, targetFat?: number | undefined | null, meals: Array<{ __typename?: 'Meal', id: string, name: string, dateTime: string, instructions?: string | undefined | null, foods: Array<{ __typename?: 'MealFood', id: string, name: string, quantity: number, unit: string, addedAt: string, caloriesPer100g?: number | undefined | null, proteinPer100g?: number | undefined | null, carbsPer100g?: number | undefined | null, fatPer100g?: number | undefined | null, fiberPer100g?: number | undefined | null, openFoodFactsId?: string | undefined | null, addedBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null } | undefined | null }> }> }> }> };

export type GQLGetMealPlanTemplatesQueryVariables = Exact<{
  draft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GQLGetMealPlanTemplatesQuery = { __typename?: 'Query', getMealPlanTemplates: Array<{ __typename?: 'MealPlan', id: string, title: string, description?: string | undefined | null, isDraft: boolean, dailyCalories?: number | undefined | null, dailyProtein?: number | undefined | null, dailyCarbs?: number | undefined | null, dailyFat?: number | undefined | null, weekCount: number, assignedCount: number, collaboratorCount: number, createdAt: string, updatedAt: string }> };

export type GQLGetCollaborationMealPlanTemplatesQueryVariables = Exact<{
  draft?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GQLGetCollaborationMealPlanTemplatesQuery = { __typename?: 'Query', getCollaborationMealPlanTemplates: Array<{ __typename?: 'MealPlan', id: string, title: string, description?: string | undefined | null, isDraft: boolean, dailyCalories?: number | undefined | null, dailyProtein?: number | undefined | null, dailyCarbs?: number | undefined | null, dailyFat?: number | undefined | null, weekCount: number, assignedCount: number, collaboratorCount: number, createdAt: string, updatedAt: string, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null } | undefined | null, collaborators: Array<{ __typename?: 'MealPlanCollaborator', id: string, permission: GQLCollaborationPermission, collaborator: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }> }> };

export type GQLGetMealPlanByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLGetMealPlanByIdQuery = { __typename?: 'Query', getMealPlanById: { __typename?: 'MealPlan', id: string, title: string, description?: string | undefined | null, isDraft: boolean, dailyCalories?: number | undefined | null, dailyProtein?: number | undefined | null, dailyCarbs?: number | undefined | null, dailyFat?: number | undefined | null, createdAt: string, updatedAt: string, assignedCount: number, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } | undefined | null, collaborators: Array<{ __typename?: 'MealPlanCollaborator', id: string, permission: GQLCollaborationPermission, createdAt: string, collaborator: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string }, addedBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }>, weeks: Array<{ __typename?: 'MealWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, days: Array<{ __typename?: 'MealDay', id: string, dayOfWeek: number, targetCalories?: number | undefined | null, targetProtein?: number | undefined | null, targetCarbs?: number | undefined | null, targetFat?: number | undefined | null, meals: Array<{ __typename?: 'Meal', id: string, name: string, dateTime: string, instructions?: string | undefined | null, foods: Array<{ __typename?: 'MealFood', id: string, name: string, quantity: number, unit: string, addedAt: string, caloriesPer100g?: number | undefined | null, proteinPer100g?: number | undefined | null, carbsPer100g?: number | undefined | null, fatPer100g?: number | undefined | null, fiberPer100g?: number | undefined | null, openFoodFactsId?: string | undefined | null, addedBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null } | undefined | null }> }> }> }> } };

export type GQLCreateMealPlanMutationVariables = Exact<{
  input: GQLCreateMealPlanInput;
}>;


export type GQLCreateMealPlanMutation = { __typename?: 'Mutation', createMealPlan: { __typename?: 'CreateMealPlanPayload', id: string, success: boolean } };

export type GQLCreateDraftMealTemplateMutationVariables = Exact<{ [key: string]: never; }>;


export type GQLCreateDraftMealTemplateMutation = { __typename?: 'Mutation', createDraftMealTemplate: { __typename?: 'MealPlan', id: string, title: string, description?: string | undefined | null, isDraft: boolean, dailyCalories?: number | undefined | null, dailyProtein?: number | undefined | null, dailyCarbs?: number | undefined | null, dailyFat?: number | undefined | null, createdAt: string, updatedAt: string } };

export type GQLDuplicateMealPlanMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLDuplicateMealPlanMutation = { __typename?: 'Mutation', duplicateMealPlan: string };

export type GQLAssignMealPlanToClientMutationVariables = Exact<{
  input: GQLAssignMealPlanToClientInput;
}>;


export type GQLAssignMealPlanToClientMutation = { __typename?: 'Mutation', assignMealPlanToClient: boolean };

export type GQLRemoveMealPlanFromClientMutationVariables = Exact<{
  planId: Scalars['ID']['input'];
  clientId: Scalars['ID']['input'];
}>;


export type GQLRemoveMealPlanFromClientMutation = { __typename?: 'Mutation', removeMealPlanFromClient: boolean };

export type GQLSaveMealMutationVariables = Exact<{
  input: GQLSaveMealInput;
}>;


export type GQLSaveMealMutation = { __typename?: 'Mutation', saveMeal?: { __typename?: 'Meal', id: string, name: string, dateTime: string, instructions?: string | undefined | null, foods: Array<{ __typename?: 'MealFood', id: string, name: string, quantity: number, unit: string, caloriesPer100g?: number | undefined | null, proteinPer100g?: number | undefined | null, carbsPer100g?: number | undefined | null, fatPer100g?: number | undefined | null, fiberPer100g?: number | undefined | null, openFoodFactsId?: string | undefined | null, addedAt: string }> } | undefined | null };

export type GQLUpdateMealPlanDetailsMutationVariables = Exact<{
  input: GQLUpdateMealPlanDetailsInput;
}>;


export type GQLUpdateMealPlanDetailsMutation = { __typename?: 'Mutation', updateMealPlanDetails: boolean };

export type GQLTrainingTemplateFragment = { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, difficulty?: GQLDifficulty | undefined | null, createdAt: string, updatedAt: string, assignedCount: number, completedAt?: string | undefined | null, assignedTo?: { __typename?: 'UserPublic', id: string } | undefined | null, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } | undefined | null, collaborators: Array<{ __typename?: 'TrainingPlanCollaborator', id: string, permission: GQLCollaborationPermission, createdAt: string, updatedAt: string, collaborator: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string }, addedBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }>, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, completedAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, completedAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, restSeconds?: number | undefined | null, tempo?: string | undefined | null, warmupSets?: number | undefined | null, instructions?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, order: number, videoUrl?: string | undefined | null, completedAt?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, completedAt?: string | undefined | null }> }> }> }> };

export type GQLGetTemplatesQueryVariables = Exact<{
  draft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GQLGetTemplatesQuery = { __typename?: 'Query', getTemplates: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isDraft: boolean, weekCount: number, assignedCount: number, collaboratorCount: number }> };

export type GQLGetCollaborationTemplatesQueryVariables = Exact<{
  draft?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GQLGetCollaborationTemplatesQuery = { __typename?: 'Query', getCollaborationTemplates: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isDraft: boolean, weekCount: number, assignedCount: number, collaboratorCount: number, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null } | undefined | null, collaborators: Array<{ __typename?: 'TrainingPlanCollaborator', id: string, permission: GQLCollaborationPermission, collaborator: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }> }> };

export type GQLGetTemplateTrainingPlanByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLGetTemplateTrainingPlanByIdQuery = { __typename?: 'Query', getTrainingPlanById: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, difficulty?: GQLDifficulty | undefined | null, createdAt: string, updatedAt: string, assignedCount: number, completedAt?: string | undefined | null, assignedTo?: { __typename?: 'UserPublic', id: string } | undefined | null, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } | undefined | null, collaborators: Array<{ __typename?: 'TrainingPlanCollaborator', id: string, permission: GQLCollaborationPermission, createdAt: string, updatedAt: string, collaborator: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string }, addedBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } }>, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, completedAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, completedAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, restSeconds?: number | undefined | null, tempo?: string | undefined | null, warmupSets?: number | undefined | null, instructions?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, order: number, videoUrl?: string | undefined | null, completedAt?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, completedAt?: string | undefined | null }> }> }> }> } };

export type GQLCreateTrainingPlanMutationVariables = Exact<{
  input: GQLCreateTrainingPlanInput;
}>;


export type GQLCreateTrainingPlanMutation = { __typename?: 'Mutation', createTrainingPlan: { __typename?: 'CreateTrainingPlanPayload', id: string, success: boolean } };

export type GQLUpdateTrainingPlanMutationVariables = Exact<{
  input: GQLUpdateTrainingPlanInput;
}>;


export type GQLUpdateTrainingPlanMutation = { __typename?: 'Mutation', updateTrainingPlan: boolean };

export type GQLDeleteTrainingPlanMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLDeleteTrainingPlanMutation = { __typename?: 'Mutation', deleteTrainingPlan: boolean };

export type GQLDuplicateTrainingPlanMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLDuplicateTrainingPlanMutation = { __typename?: 'Mutation', duplicateTrainingPlan: string };

export type GQLAssignTrainingPlanToClientMutationVariables = Exact<{
  input: GQLAssignTrainingPlanToClientInput;
}>;


export type GQLAssignTrainingPlanToClientMutation = { __typename?: 'Mutation', assignTrainingPlanToClient: boolean };

export type GQLRemoveTrainingPlanFromClientMutationVariables = Exact<{
  planId: Scalars['ID']['input'];
  clientId: Scalars['ID']['input'];
}>;


export type GQLRemoveTrainingPlanFromClientMutation = { __typename?: 'Mutation', removeTrainingPlanFromClient: boolean };

export type GQLUpdateTrainingPlanDetailsMutationVariables = Exact<{
  input: GQLUpdateTrainingPlanDetailsInput;
}>;


export type GQLUpdateTrainingPlanDetailsMutation = { __typename?: 'Mutation', updateTrainingPlanDetails: boolean };

export type GQLUpdateTrainingWeekDetailsMutationVariables = Exact<{
  input: GQLUpdateTrainingWeekDetailsInput;
}>;


export type GQLUpdateTrainingWeekDetailsMutation = { __typename?: 'Mutation', updateTrainingWeekDetails: boolean };

export type GQLDuplicateTrainingWeekMutationVariables = Exact<{
  input: GQLDuplicateTrainingWeekInput;
}>;


export type GQLDuplicateTrainingWeekMutation = { __typename?: 'Mutation', duplicateTrainingWeek: string };

export type GQLRemoveTrainingWeekMutationVariables = Exact<{
  weekId: Scalars['ID']['input'];
}>;


export type GQLRemoveTrainingWeekMutation = { __typename?: 'Mutation', removeTrainingWeek: boolean };

export type GQLAddTrainingWeekMutationVariables = Exact<{
  input: GQLAddTrainingWeekInput;
}>;


export type GQLAddTrainingWeekMutation = { __typename?: 'Mutation', addTrainingWeek: string };

export type GQLUpdateTrainingDayDataMutationVariables = Exact<{
  input: GQLUpdateTrainingDayDataInput;
}>;


export type GQLUpdateTrainingDayDataMutation = { __typename?: 'Mutation', updateTrainingDayData: boolean };

export type GQLUpdateTrainingExerciseMutationVariables = Exact<{
  input: GQLUpdateTrainingExerciseInput;
}>;


export type GQLUpdateTrainingExerciseMutation = { __typename?: 'Mutation', updateTrainingExercise: boolean };

export type GQLUpdateExerciseSetMutationVariables = Exact<{
  input: GQLUpdateExerciseSetInput;
}>;


export type GQLUpdateExerciseSetMutation = { __typename?: 'Mutation', updateExerciseSet: boolean };

export type GQLAddExerciseToDayMutationVariables = Exact<{
  input: GQLAddExerciseToDayInput;
}>;


export type GQLAddExerciseToDayMutation = { __typename?: 'Mutation', addExerciseToDay: string };

export type GQLRemoveExerciseFromDayMutationVariables = Exact<{
  exerciseId: Scalars['ID']['input'];
}>;


export type GQLRemoveExerciseFromDayMutation = { __typename?: 'Mutation', removeExerciseFromDay: boolean };

export type GQLRemoveAllExercisesFromDayMutationVariables = Exact<{
  input: GQLRemoveAllExercisesFromDayInput;
}>;


export type GQLRemoveAllExercisesFromDayMutation = { __typename?: 'Mutation', removeAllExercisesFromDay: boolean };

export type GQLMoveExerciseMutationVariables = Exact<{
  input: GQLMoveExerciseInput;
}>;


export type GQLMoveExerciseMutation = { __typename?: 'Mutation', moveExercise: boolean };

export type GQLAddSetToExerciseMutationVariables = Exact<{
  input: GQLAddSetToExerciseInput;
}>;


export type GQLAddSetToExerciseMutation = { __typename?: 'Mutation', addSetToExercise: string };

export type GQLRemoveSetFromExerciseMutationVariables = Exact<{
  setId: Scalars['ID']['input'];
}>;


export type GQLRemoveSetFromExerciseMutation = { __typename?: 'Mutation', removeSetFromExercise: boolean };

export type GQLCopyExercisesFromDayMutationVariables = Exact<{
  input: GQLCopyExercisesFromDayInput;
}>;


export type GQLCopyExercisesFromDayMutation = { __typename?: 'Mutation', copyExercisesFromDay: boolean };

export type GQLCreateDraftTemplateMutationVariables = Exact<{ [key: string]: never; }>;


export type GQLCreateDraftTemplateMutation = { __typename?: 'Mutation', createDraftTemplate: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null }> }> } };

export type GQLGetExerciseFormDataQueryVariables = Exact<{
  exerciseId: Scalars['ID']['input'];
}>;


export type GQLGetExerciseFormDataQuery = { __typename?: 'Query', exercise?: { __typename?: 'TrainingExercise', id: string, name: string, instructions?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, restSeconds?: number | undefined | null, warmupSets?: number | undefined | null, tempo?: string | undefined | null, videoUrl?: string | undefined | null, completedAt?: string | undefined | null, substitutes: Array<{ __typename?: 'BaseExerciseSubstitute', id: string, substitute: { __typename?: 'BaseExercise', name: string } }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, completedAt?: string | undefined | null }> } | undefined | null };

export type GQLUpdateExerciseFormMutationVariables = Exact<{
  input: GQLUpdateExerciseFormInput;
}>;


export type GQLUpdateExerciseFormMutation = { __typename?: 'Mutation', updateExerciseForm: { __typename?: 'TrainingExercise', id: string, name: string, instructions?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, restSeconds?: number | undefined | null, warmupSets?: number | undefined | null, tempo?: string | undefined | null, videoUrl?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> } };

export type GQLAddSetExerciseFormMutationVariables = Exact<{
  input: GQLAddSetExerciseFormInput;
}>;


export type GQLAddSetExerciseFormMutation = { __typename?: 'Mutation', addSetExerciseForm: { __typename?: 'ExerciseSet', id: string } };

export type GQLRemoveSetExerciseFormMutationVariables = Exact<{
  setId: Scalars['ID']['input'];
}>;


export type GQLRemoveSetExerciseFormMutation = { __typename?: 'Mutation', removeSetExerciseForm: boolean };

export type GQLMyCoachingRequestsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLMyCoachingRequestsQuery = { __typename?: 'Query', coachingRequests: Array<{ __typename?: 'CoachingRequest', id: string, message?: string | undefined | null, createdAt: string, updatedAt: string, status: GQLCoachingRequestStatus, recipient: { __typename?: 'User', id: string, name?: string | undefined | null, email: string }, sender: { __typename?: 'User', id: string, name?: string | undefined | null, email: string } }> };

export type GQLMyCoachingRequestQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLMyCoachingRequestQuery = { __typename?: 'Query', coachingRequest?: { __typename?: 'CoachingRequest', id: string, message?: string | undefined | null, createdAt: string, updatedAt: string, status: GQLCoachingRequestStatus, recipient: { __typename?: 'User', id: string, name?: string | undefined | null, email: string }, sender: { __typename?: 'User', id: string, name?: string | undefined | null, email: string } } | undefined | null };

export type GQLAcceptCoachingRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLAcceptCoachingRequestMutation = { __typename?: 'Mutation', acceptCoachingRequest?: { __typename?: 'CoachingRequest', id: string } | undefined | null };

export type GQLRejectCoachingRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLRejectCoachingRequestMutation = { __typename?: 'Mutation', rejectCoachingRequest?: { __typename?: 'CoachingRequest', id: string } | undefined | null };

export type GQLCancelCoachingRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLCancelCoachingRequestMutation = { __typename?: 'Mutation', cancelCoachingRequest?: { __typename?: 'CoachingRequest', id: string } | undefined | null };

export type GQLGetNotesQueryVariables = Exact<{
  relatedTo?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GQLGetNotesQuery = { __typename?: 'Query', notes: Array<{ __typename?: 'Note', id: string, text: string, createdAt: string, updatedAt: string, shareWithTrainer?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } }> };

export type GQLGetNoteQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  relatedTo?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GQLGetNoteQuery = { __typename?: 'Query', note?: { __typename?: 'Note', id: string, text: string, createdAt: string, updatedAt: string, shareWithTrainer?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } } | undefined | null };

export type GQLGetExerciseNotesQueryVariables = Exact<{
  exerciseName: Scalars['String']['input'];
}>;


export type GQLGetExerciseNotesQuery = { __typename?: 'Query', exerciseNotes: Array<{ __typename?: 'Note', id: string, text: string, createdAt: string, updatedAt: string, shareWithTrainer?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } }> };

export type GQLGetClientSharedNotesQueryVariables = Exact<{
  clientId: Scalars['String']['input'];
}>;


export type GQLGetClientSharedNotesQuery = { __typename?: 'Query', clientSharedNotes: Array<{ __typename?: 'Note', id: string, text: string, relatedTo?: string | undefined | null, createdAt: string, updatedAt: string, shareWithTrainer?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } }> };

export type GQLGetNoteRepliesQueryVariables = Exact<{
  noteId: Scalars['String']['input'];
}>;


export type GQLGetNoteRepliesQuery = { __typename?: 'Query', noteReplies: Array<{ __typename?: 'Note', id: string, text: string, createdAt: string, updatedAt: string, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } }> };

export type GQLCreateNoteMutationVariables = Exact<{
  input: GQLCreateNoteInput;
}>;


export type GQLCreateNoteMutation = { __typename?: 'Mutation', createNote: { __typename?: 'Note', id: string, text: string, shareWithTrainer?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } } };

export type GQLCreateExerciseNoteMutationVariables = Exact<{
  input: GQLCreateExerciseNoteInput;
}>;


export type GQLCreateExerciseNoteMutation = { __typename?: 'Mutation', createExerciseNote: { __typename?: 'Note', id: string, text: string, shareWithTrainer?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } } };

export type GQLCreateNoteReplyMutationVariables = Exact<{
  input: GQLCreateNoteReplyInput;
}>;


export type GQLCreateNoteReplyMutation = { __typename?: 'Mutation', createNoteReply: { __typename?: 'Note', id: string, text: string, createdAt: string, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } } };

export type GQLUpdateNoteMutationVariables = Exact<{
  input: GQLUpdateNoteInput;
}>;


export type GQLUpdateNoteMutation = { __typename?: 'Mutation', updateNote: { __typename?: 'Note', id: string, text: string, shareWithTrainer?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } } };

export type GQLDeleteNoteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLDeleteNoteMutation = { __typename?: 'Mutation', deleteNote: boolean };

export type GQLUserWithAllDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLUserWithAllDataQuery = { __typename?: 'Query', userWithAllData?: { __typename?: 'User', id: string, email: string, name?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string, profile?: { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null } | undefined | null, trainer?: { __typename?: 'UserPublic', id: string } | undefined | null, clients: Array<{ __typename?: 'UserPublic', id: string }> } | undefined | null };

export type GQLUserBasicQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLUserBasicQuery = { __typename?: 'Query', userBasic?: { __typename?: 'User', id: string, email: string, name?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string, profile?: { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null } | undefined | null, trainer?: { __typename?: 'UserPublic', id: string } | undefined | null } | undefined | null };

export type GQLNotificationsQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
  read?: InputMaybe<Scalars['Boolean']['input']>;
  type?: InputMaybe<GQLNotificationType>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GQLNotificationsQuery = { __typename?: 'Query', notifications: Array<{ __typename?: 'Notification', id: string, message: string, createdAt: string, type: GQLNotificationType, read: boolean, link?: string | undefined | null, createdBy?: string | undefined | null, relatedItemId?: string | undefined | null }> };

export type GQLMarkNotificationAsReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLMarkNotificationAsReadMutation = { __typename?: 'Mutation', markNotificationRead: { __typename?: 'Notification', id: string } };

export type GQLMarkAllNotificationsAsReadMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GQLMarkAllNotificationsAsReadMutation = { __typename?: 'Mutation', markAllNotificationsRead: Array<{ __typename?: 'Notification', id: string }> };


export const ProfileFragmentFragmentDoc = `
    fragment ProfileFragment on UserProfile {
  id
  firstName
  lastName
  phone
  birthday
  sex
  avatarUrl
  height
  weight
  fitnessLevel
  allergies
  activityLevel
  goals
  bio
  specialization
  credentials
  successStories
  trainerSince
  createdAt
  updatedAt
  email
  weekStartsOn
  weightUnit
  heightUnit
  theme
  timeFormat
  trainingView
  notificationPreferences {
    workoutReminders
    mealReminders
    progressUpdates
    collaborationNotifications
    systemNotifications
    emailNotifications
    pushNotifications
  }
}
    `;
export const MealPlanTemplateFragmentDoc = `
    fragment MealPlanTemplate on MealPlan {
  id
  title
  description
  isDraft
  dailyCalories
  dailyProtein
  dailyCarbs
  dailyFat
  createdAt
  updatedAt
  assignedCount
  createdBy {
    id
    firstName
    lastName
    email
  }
  collaborators {
    id
    collaborator {
      id
      firstName
      lastName
      email
    }
    permission
    addedBy {
      id
      firstName
      lastName
      email
    }
    createdAt
  }
  weeks {
    id
    weekNumber
    name
    description
    days {
      id
      dayOfWeek
      targetCalories
      targetProtein
      targetCarbs
      targetFat
      meals {
        id
        name
        dateTime
        instructions
        foods {
          id
          name
          quantity
          unit
          addedAt
          caloriesPer100g
          proteinPer100g
          carbsPer100g
          fatPer100g
          fiberPer100g
          openFoodFactsId
          addedBy {
            id
            firstName
            lastName
          }
        }
      }
    }
  }
}
    `;
export const TrainingTemplateFragmentDoc = `
    fragment TrainingTemplate on TrainingPlan {
  id
  title
  description
  isPublic
  isTemplate
  isDraft
  difficulty
  createdAt
  updatedAt
  assignedCount
  completedAt
  assignedTo {
    id
  }
  createdBy {
    id
    firstName
    lastName
    email
  }
  collaborators {
    id
    collaborator {
      id
      firstName
      lastName
      email
    }
    addedBy {
      id
      firstName
      lastName
      email
    }
    permission
    createdAt
    updatedAt
  }
  weeks {
    id
    weekNumber
    name
    description
    completedAt
    days {
      id
      dayOfWeek
      isRestDay
      workoutType
      completedAt
      exercises {
        id
        name
        restSeconds
        tempo
        warmupSets
        instructions
        additionalInstructions
        type
        order
        videoUrl
        completedAt
        sets {
          id
          order
          reps
          minReps
          maxReps
          weight
          rpe
          completedAt
        }
      }
    }
  }
}
    `;
export const GetAdminUserStatsDocument = `
    query GetAdminUserStats {
  adminUserStats {
    totalUsers
    totalTrainers
    activeUsers
    inactiveUsers
  }
}
    `;

export const useGetAdminUserStatsQuery = <
      TData = GQLGetAdminUserStatsQuery,
      TError = unknown
    >(
      variables?: GQLGetAdminUserStatsQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetAdminUserStatsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetAdminUserStatsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetAdminUserStatsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetAdminUserStats'] : ['GetAdminUserStats', variables],
    queryFn: fetchData<GQLGetAdminUserStatsQuery, GQLGetAdminUserStatsQueryVariables>(GetAdminUserStatsDocument, variables),
    ...options
  }
    )};

useGetAdminUserStatsQuery.getKey = (variables?: GQLGetAdminUserStatsQueryVariables) => variables === undefined ? ['GetAdminUserStats'] : ['GetAdminUserStats', variables];

export const useInfiniteGetAdminUserStatsQuery = <
      TData = InfiniteData<GQLGetAdminUserStatsQuery>,
      TError = unknown
    >(
      variables: GQLGetAdminUserStatsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetAdminUserStatsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetAdminUserStatsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetAdminUserStatsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetAdminUserStats.infinite'] : ['GetAdminUserStats.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetAdminUserStatsQuery, GQLGetAdminUserStatsQueryVariables>(GetAdminUserStatsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetAdminUserStatsQuery.getKey = (variables?: GQLGetAdminUserStatsQueryVariables) => variables === undefined ? ['GetAdminUserStats.infinite'] : ['GetAdminUserStats.infinite', variables];


useGetAdminUserStatsQuery.fetcher = (variables?: GQLGetAdminUserStatsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetAdminUserStatsQuery, GQLGetAdminUserStatsQueryVariables>(GetAdminUserStatsDocument, variables, options);

export const GetTrainersListDocument = `
    query GetTrainersList($filters: AdminUserFilters, $limit: Int, $offset: Int) {
  adminUserList(filters: $filters, limit: $limit, offset: $offset) {
    users {
      id
      email
      name
      role
      createdAt
      updatedAt
      lastLoginAt
      sessionCount
      clientCount
      isActive
      featured
      profile {
        firstName
        lastName
        bio
        avatarUrl
      }
    }
    total
    hasMore
  }
}
    `;

export const useGetTrainersListQuery = <
      TData = GQLGetTrainersListQuery,
      TError = unknown
    >(
      variables?: GQLGetTrainersListQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetTrainersListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetTrainersListQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetTrainersListQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetTrainersList'] : ['GetTrainersList', variables],
    queryFn: fetchData<GQLGetTrainersListQuery, GQLGetTrainersListQueryVariables>(GetTrainersListDocument, variables),
    ...options
  }
    )};

useGetTrainersListQuery.getKey = (variables?: GQLGetTrainersListQueryVariables) => variables === undefined ? ['GetTrainersList'] : ['GetTrainersList', variables];

export const useInfiniteGetTrainersListQuery = <
      TData = InfiniteData<GQLGetTrainersListQuery>,
      TError = unknown
    >(
      variables: GQLGetTrainersListQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetTrainersListQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetTrainersListQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetTrainersListQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetTrainersList.infinite'] : ['GetTrainersList.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetTrainersListQuery, GQLGetTrainersListQueryVariables>(GetTrainersListDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTrainersListQuery.getKey = (variables?: GQLGetTrainersListQueryVariables) => variables === undefined ? ['GetTrainersList.infinite'] : ['GetTrainersList.infinite', variables];


useGetTrainersListQuery.fetcher = (variables?: GQLGetTrainersListQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetTrainersListQuery, GQLGetTrainersListQueryVariables>(GetTrainersListDocument, variables, options);

export const UpdateUserFeaturedDocument = `
    mutation UpdateUserFeatured($input: UpdateUserFeaturedInput!) {
  updateUserFeatured(input: $input) {
    id
    featured
  }
}
    `;

export const useUpdateUserFeaturedMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateUserFeaturedMutation, TError, GQLUpdateUserFeaturedMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateUserFeaturedMutation, TError, GQLUpdateUserFeaturedMutationVariables, TContext>(
      {
    mutationKey: ['UpdateUserFeatured'],
    mutationFn: (variables?: GQLUpdateUserFeaturedMutationVariables) => fetchData<GQLUpdateUserFeaturedMutation, GQLUpdateUserFeaturedMutationVariables>(UpdateUserFeaturedDocument, variables)(),
    ...options
  }
    )};

useUpdateUserFeaturedMutation.getKey = () => ['UpdateUserFeatured'];


useUpdateUserFeaturedMutation.fetcher = (variables: GQLUpdateUserFeaturedMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateUserFeaturedMutation, GQLUpdateUserFeaturedMutationVariables>(UpdateUserFeaturedDocument, variables, options);

export const FitspaceDashboardGetWorkoutDocument = `
    query FitspaceDashboardGetWorkout {
  getWorkout {
    plan {
      id
      title
      description
      isPublic
      isTemplate
      isDraft
      startDate
      weeks {
        id
        weekNumber
        name
        completedAt
        scheduledAt
        days {
          id
          dayOfWeek
          isRestDay
          workoutType
          startedAt
          completedAt
          duration
          scheduledAt
          exercises {
            id
            name
            sets {
              id
            }
            muscleGroups {
              id
              name
              alias
            }
          }
        }
      }
    }
  }
}
    `;

export const useFitspaceDashboardGetWorkoutQuery = <
      TData = GQLFitspaceDashboardGetWorkoutQuery,
      TError = unknown
    >(
      variables?: GQLFitspaceDashboardGetWorkoutQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitspaceDashboardGetWorkoutQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitspaceDashboardGetWorkoutQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitspaceDashboardGetWorkoutQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['FitspaceDashboardGetWorkout'] : ['FitspaceDashboardGetWorkout', variables],
    queryFn: fetchData<GQLFitspaceDashboardGetWorkoutQuery, GQLFitspaceDashboardGetWorkoutQueryVariables>(FitspaceDashboardGetWorkoutDocument, variables),
    ...options
  }
    )};

useFitspaceDashboardGetWorkoutQuery.getKey = (variables?: GQLFitspaceDashboardGetWorkoutQueryVariables) => variables === undefined ? ['FitspaceDashboardGetWorkout'] : ['FitspaceDashboardGetWorkout', variables];

export const useInfiniteFitspaceDashboardGetWorkoutQuery = <
      TData = InfiniteData<GQLFitspaceDashboardGetWorkoutQuery>,
      TError = unknown
    >(
      variables: GQLFitspaceDashboardGetWorkoutQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitspaceDashboardGetWorkoutQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitspaceDashboardGetWorkoutQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitspaceDashboardGetWorkoutQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['FitspaceDashboardGetWorkout.infinite'] : ['FitspaceDashboardGetWorkout.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitspaceDashboardGetWorkoutQuery, GQLFitspaceDashboardGetWorkoutQueryVariables>(FitspaceDashboardGetWorkoutDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitspaceDashboardGetWorkoutQuery.getKey = (variables?: GQLFitspaceDashboardGetWorkoutQueryVariables) => variables === undefined ? ['FitspaceDashboardGetWorkout.infinite'] : ['FitspaceDashboardGetWorkout.infinite', variables];


useFitspaceDashboardGetWorkoutQuery.fetcher = (variables?: GQLFitspaceDashboardGetWorkoutQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceDashboardGetWorkoutQuery, GQLFitspaceDashboardGetWorkoutQueryVariables>(FitspaceDashboardGetWorkoutDocument, variables, options);

export const FitspaceDashboardGetCurrentWeekDocument = `
    query FitspaceDashboardGetCurrentWeek {
  getCurrentWorkoutWeek {
    plan {
      id
      title
      description
      isPublic
      isTemplate
      isDraft
      startDate
      weeks {
        id
        weekNumber
        name
        completedAt
        scheduledAt
        days {
          id
          dayOfWeek
          isRestDay
          workoutType
          startedAt
          completedAt
          duration
          scheduledAt
          exercises {
            id
            name
            sets {
              id
            }
            muscleGroups {
              id
              name
              alias
            }
          }
        }
      }
    }
    currentWeekIndex
    totalWeeks
  }
}
    `;

export const useFitspaceDashboardGetCurrentWeekQuery = <
      TData = GQLFitspaceDashboardGetCurrentWeekQuery,
      TError = unknown
    >(
      variables?: GQLFitspaceDashboardGetCurrentWeekQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitspaceDashboardGetCurrentWeekQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitspaceDashboardGetCurrentWeekQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitspaceDashboardGetCurrentWeekQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['FitspaceDashboardGetCurrentWeek'] : ['FitspaceDashboardGetCurrentWeek', variables],
    queryFn: fetchData<GQLFitspaceDashboardGetCurrentWeekQuery, GQLFitspaceDashboardGetCurrentWeekQueryVariables>(FitspaceDashboardGetCurrentWeekDocument, variables),
    ...options
  }
    )};

useFitspaceDashboardGetCurrentWeekQuery.getKey = (variables?: GQLFitspaceDashboardGetCurrentWeekQueryVariables) => variables === undefined ? ['FitspaceDashboardGetCurrentWeek'] : ['FitspaceDashboardGetCurrentWeek', variables];

export const useInfiniteFitspaceDashboardGetCurrentWeekQuery = <
      TData = InfiniteData<GQLFitspaceDashboardGetCurrentWeekQuery>,
      TError = unknown
    >(
      variables: GQLFitspaceDashboardGetCurrentWeekQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitspaceDashboardGetCurrentWeekQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitspaceDashboardGetCurrentWeekQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitspaceDashboardGetCurrentWeekQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['FitspaceDashboardGetCurrentWeek.infinite'] : ['FitspaceDashboardGetCurrentWeek.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitspaceDashboardGetCurrentWeekQuery, GQLFitspaceDashboardGetCurrentWeekQueryVariables>(FitspaceDashboardGetCurrentWeekDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitspaceDashboardGetCurrentWeekQuery.getKey = (variables?: GQLFitspaceDashboardGetCurrentWeekQueryVariables) => variables === undefined ? ['FitspaceDashboardGetCurrentWeek.infinite'] : ['FitspaceDashboardGetCurrentWeek.infinite', variables];


useFitspaceDashboardGetCurrentWeekQuery.fetcher = (variables?: GQLFitspaceDashboardGetCurrentWeekQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceDashboardGetCurrentWeekQuery, GQLFitspaceDashboardGetCurrentWeekQueryVariables>(FitspaceDashboardGetCurrentWeekDocument, variables, options);

export const FitspaceDashboardGetRecentProgressDocument = `
    query FitspaceDashboardGetRecentProgress {
  getRecentCompletedWorkouts {
    id
    completedAt
    dayOfWeek
    duration
    exercises {
      id
      name
      baseId
      completedAt
      sets {
        id
        order
        reps
        weight
        completedAt
        log {
          id
          weight
          reps
          rpe
          createdAt
        }
      }
    }
  }
}
    `;

export const useFitspaceDashboardGetRecentProgressQuery = <
      TData = GQLFitspaceDashboardGetRecentProgressQuery,
      TError = unknown
    >(
      variables?: GQLFitspaceDashboardGetRecentProgressQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitspaceDashboardGetRecentProgressQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitspaceDashboardGetRecentProgressQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitspaceDashboardGetRecentProgressQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['FitspaceDashboardGetRecentProgress'] : ['FitspaceDashboardGetRecentProgress', variables],
    queryFn: fetchData<GQLFitspaceDashboardGetRecentProgressQuery, GQLFitspaceDashboardGetRecentProgressQueryVariables>(FitspaceDashboardGetRecentProgressDocument, variables),
    ...options
  }
    )};

useFitspaceDashboardGetRecentProgressQuery.getKey = (variables?: GQLFitspaceDashboardGetRecentProgressQueryVariables) => variables === undefined ? ['FitspaceDashboardGetRecentProgress'] : ['FitspaceDashboardGetRecentProgress', variables];

export const useInfiniteFitspaceDashboardGetRecentProgressQuery = <
      TData = InfiniteData<GQLFitspaceDashboardGetRecentProgressQuery>,
      TError = unknown
    >(
      variables: GQLFitspaceDashboardGetRecentProgressQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitspaceDashboardGetRecentProgressQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitspaceDashboardGetRecentProgressQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitspaceDashboardGetRecentProgressQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['FitspaceDashboardGetRecentProgress.infinite'] : ['FitspaceDashboardGetRecentProgress.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitspaceDashboardGetRecentProgressQuery, GQLFitspaceDashboardGetRecentProgressQueryVariables>(FitspaceDashboardGetRecentProgressDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitspaceDashboardGetRecentProgressQuery.getKey = (variables?: GQLFitspaceDashboardGetRecentProgressQueryVariables) => variables === undefined ? ['FitspaceDashboardGetRecentProgress.infinite'] : ['FitspaceDashboardGetRecentProgress.infinite', variables];


useFitspaceDashboardGetRecentProgressQuery.fetcher = (variables?: GQLFitspaceDashboardGetRecentProgressQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceDashboardGetRecentProgressQuery, GQLFitspaceDashboardGetRecentProgressQueryVariables>(FitspaceDashboardGetRecentProgressDocument, variables, options);

export const GetPublicTrainingPlansDocument = `
    query GetPublicTrainingPlans($limit: Int) {
  getPublicTrainingPlans(limit: $limit) {
    id
    title
    description
    isPublic
    isPremium
    difficulty
    focusTags
    targetGoals
    weekCount
    assignmentCount
    sessionsPerWeek
    avgSessionTime
    equipment
    rating
    totalReviews
    createdBy {
      id
      firstName
      lastName
      image
    }
    createdAt
    updatedAt
  }
}
    `;

export const useGetPublicTrainingPlansQuery = <
      TData = GQLGetPublicTrainingPlansQuery,
      TError = unknown
    >(
      variables?: GQLGetPublicTrainingPlansQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetPublicTrainingPlansQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetPublicTrainingPlansQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetPublicTrainingPlansQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetPublicTrainingPlans'] : ['GetPublicTrainingPlans', variables],
    queryFn: fetchData<GQLGetPublicTrainingPlansQuery, GQLGetPublicTrainingPlansQueryVariables>(GetPublicTrainingPlansDocument, variables),
    ...options
  }
    )};

useGetPublicTrainingPlansQuery.getKey = (variables?: GQLGetPublicTrainingPlansQueryVariables) => variables === undefined ? ['GetPublicTrainingPlans'] : ['GetPublicTrainingPlans', variables];

export const useInfiniteGetPublicTrainingPlansQuery = <
      TData = InfiniteData<GQLGetPublicTrainingPlansQuery>,
      TError = unknown
    >(
      variables: GQLGetPublicTrainingPlansQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetPublicTrainingPlansQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetPublicTrainingPlansQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetPublicTrainingPlansQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetPublicTrainingPlans.infinite'] : ['GetPublicTrainingPlans.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetPublicTrainingPlansQuery, GQLGetPublicTrainingPlansQueryVariables>(GetPublicTrainingPlansDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetPublicTrainingPlansQuery.getKey = (variables?: GQLGetPublicTrainingPlansQueryVariables) => variables === undefined ? ['GetPublicTrainingPlans.infinite'] : ['GetPublicTrainingPlans.infinite', variables];


useGetPublicTrainingPlansQuery.fetcher = (variables?: GQLGetPublicTrainingPlansQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetPublicTrainingPlansQuery, GQLGetPublicTrainingPlansQueryVariables>(GetPublicTrainingPlansDocument, variables, options);

export const GetFeaturedTrainersDocument = `
    query GetFeaturedTrainers($limit: Int) {
  getFeaturedTrainers(limit: $limit) {
    id
    name
    role
    clientCount
    email
    profile {
      firstName
      lastName
      bio
      avatarUrl
      specialization
      credentials
      successStories
      trainerSince
    }
  }
}
    `;

export const useGetFeaturedTrainersQuery = <
      TData = GQLGetFeaturedTrainersQuery,
      TError = unknown
    >(
      variables?: GQLGetFeaturedTrainersQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetFeaturedTrainersQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetFeaturedTrainersQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetFeaturedTrainersQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetFeaturedTrainers'] : ['GetFeaturedTrainers', variables],
    queryFn: fetchData<GQLGetFeaturedTrainersQuery, GQLGetFeaturedTrainersQueryVariables>(GetFeaturedTrainersDocument, variables),
    ...options
  }
    )};

useGetFeaturedTrainersQuery.getKey = (variables?: GQLGetFeaturedTrainersQueryVariables) => variables === undefined ? ['GetFeaturedTrainers'] : ['GetFeaturedTrainers', variables];

export const useInfiniteGetFeaturedTrainersQuery = <
      TData = InfiniteData<GQLGetFeaturedTrainersQuery>,
      TError = unknown
    >(
      variables: GQLGetFeaturedTrainersQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetFeaturedTrainersQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetFeaturedTrainersQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetFeaturedTrainersQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetFeaturedTrainers.infinite'] : ['GetFeaturedTrainers.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetFeaturedTrainersQuery, GQLGetFeaturedTrainersQueryVariables>(GetFeaturedTrainersDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetFeaturedTrainersQuery.getKey = (variables?: GQLGetFeaturedTrainersQueryVariables) => variables === undefined ? ['GetFeaturedTrainers.infinite'] : ['GetFeaturedTrainers.infinite', variables];


useGetFeaturedTrainersQuery.fetcher = (variables?: GQLGetFeaturedTrainersQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetFeaturedTrainersQuery, GQLGetFeaturedTrainersQueryVariables>(GetFeaturedTrainersDocument, variables, options);

export const GetActiveMealPlanDocument = `
    query GetActiveMealPlan($date: String) {
  getActiveMealPlan(date: $date) {
    id
    title
    description
    isPublic
    isTemplate
    isDraft
    active
    startDate
    endDate
    dailyCalories
    dailyProtein
    dailyCarbs
    dailyFat
    weeks {
      id
      weekNumber
      name
      description
      completedAt
      days {
        id
        dayOfWeek
        completedAt
        scheduledAt
        targetCalories
        targetProtein
        targetCarbs
        targetFat
        meals {
          id
          name
          dateTime
          instructions
          completedAt
          foods {
            id
            name
            quantity
            unit
            addedAt
            caloriesPer100g
            proteinPer100g
            carbsPer100g
            fatPer100g
            fiberPer100g
            totalCalories
            totalProtein
            totalCarbs
            totalFat
            totalFiber
            openFoodFactsId
            productData
            isCustomAddition
            addedBy {
              id
              firstName
              lastName
            }
            log {
              id
              quantity
              loggedQuantity
              unit
              loggedAt
              notes
              calories
              protein
              carbs
              fat
              fiber
              mealFood {
                id
                name
              }
              user {
                id
                firstName
                lastName
              }
            }
          }
          plannedCalories
          plannedProtein
          plannedCarbs
          plannedFat
        }
      }
    }
  }
}
    `;

export const useGetActiveMealPlanQuery = <
      TData = GQLGetActiveMealPlanQuery,
      TError = unknown
    >(
      variables?: GQLGetActiveMealPlanQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetActiveMealPlanQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetActiveMealPlanQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetActiveMealPlanQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetActiveMealPlan'] : ['GetActiveMealPlan', variables],
    queryFn: fetchData<GQLGetActiveMealPlanQuery, GQLGetActiveMealPlanQueryVariables>(GetActiveMealPlanDocument, variables),
    ...options
  }
    )};

useGetActiveMealPlanQuery.getKey = (variables?: GQLGetActiveMealPlanQueryVariables) => variables === undefined ? ['GetActiveMealPlan'] : ['GetActiveMealPlan', variables];

export const useInfiniteGetActiveMealPlanQuery = <
      TData = InfiniteData<GQLGetActiveMealPlanQuery>,
      TError = unknown
    >(
      variables: GQLGetActiveMealPlanQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetActiveMealPlanQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetActiveMealPlanQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetActiveMealPlanQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetActiveMealPlan.infinite'] : ['GetActiveMealPlan.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetActiveMealPlanQuery, GQLGetActiveMealPlanQueryVariables>(GetActiveMealPlanDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetActiveMealPlanQuery.getKey = (variables?: GQLGetActiveMealPlanQueryVariables) => variables === undefined ? ['GetActiveMealPlan.infinite'] : ['GetActiveMealPlan.infinite', variables];


useGetActiveMealPlanQuery.fetcher = (variables?: GQLGetActiveMealPlanQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetActiveMealPlanQuery, GQLGetActiveMealPlanQueryVariables>(GetActiveMealPlanDocument, variables, options);

export const GetDefaultMealPlanDocument = `
    query GetDefaultMealPlan($date: String) {
  getDefaultMealPlan(date: $date) {
    id
    title
    description
    isPublic
    isTemplate
    isDraft
    active
    startDate
    endDate
    dailyCalories
    dailyProtein
    dailyCarbs
    dailyFat
    weeks {
      id
      weekNumber
      name
      description
      completedAt
      days {
        id
        dayOfWeek
        completedAt
        scheduledAt
        targetCalories
        targetProtein
        targetCarbs
        targetFat
        meals {
          id
          name
          dateTime
          instructions
          completedAt
          foods {
            id
            name
            quantity
            unit
            addedAt
            caloriesPer100g
            proteinPer100g
            carbsPer100g
            fatPer100g
            fiberPer100g
            totalCalories
            totalProtein
            totalCarbs
            totalFat
            totalFiber
            openFoodFactsId
            productData
            isCustomAddition
            addedBy {
              id
              firstName
              lastName
            }
            log {
              id
              quantity
              loggedQuantity
              unit
              loggedAt
              notes
              calories
              protein
              carbs
              fat
              fiber
              mealFood {
                id
                name
              }
              user {
                id
                firstName
                lastName
              }
            }
          }
          plannedCalories
          plannedProtein
          plannedCarbs
          plannedFat
        }
      }
    }
  }
}
    `;

export const useGetDefaultMealPlanQuery = <
      TData = GQLGetDefaultMealPlanQuery,
      TError = unknown
    >(
      variables?: GQLGetDefaultMealPlanQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetDefaultMealPlanQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetDefaultMealPlanQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetDefaultMealPlanQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetDefaultMealPlan'] : ['GetDefaultMealPlan', variables],
    queryFn: fetchData<GQLGetDefaultMealPlanQuery, GQLGetDefaultMealPlanQueryVariables>(GetDefaultMealPlanDocument, variables),
    ...options
  }
    )};

useGetDefaultMealPlanQuery.getKey = (variables?: GQLGetDefaultMealPlanQueryVariables) => variables === undefined ? ['GetDefaultMealPlan'] : ['GetDefaultMealPlan', variables];

export const useInfiniteGetDefaultMealPlanQuery = <
      TData = InfiniteData<GQLGetDefaultMealPlanQuery>,
      TError = unknown
    >(
      variables: GQLGetDefaultMealPlanQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetDefaultMealPlanQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetDefaultMealPlanQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetDefaultMealPlanQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetDefaultMealPlan.infinite'] : ['GetDefaultMealPlan.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetDefaultMealPlanQuery, GQLGetDefaultMealPlanQueryVariables>(GetDefaultMealPlanDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetDefaultMealPlanQuery.getKey = (variables?: GQLGetDefaultMealPlanQueryVariables) => variables === undefined ? ['GetDefaultMealPlan.infinite'] : ['GetDefaultMealPlan.infinite', variables];


useGetDefaultMealPlanQuery.fetcher = (variables?: GQLGetDefaultMealPlanQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetDefaultMealPlanQuery, GQLGetDefaultMealPlanQueryVariables>(GetDefaultMealPlanDocument, variables, options);

export const BatchLogMealFoodDocument = `
    mutation BatchLogMealFood($input: BatchLogMealFoodInput!) {
  batchLogMealFood(input: $input)
}
    `;

export const useBatchLogMealFoodMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLBatchLogMealFoodMutation, TError, GQLBatchLogMealFoodMutationVariables, TContext>) => {
    
    return useMutation<GQLBatchLogMealFoodMutation, TError, GQLBatchLogMealFoodMutationVariables, TContext>(
      {
    mutationKey: ['BatchLogMealFood'],
    mutationFn: (variables?: GQLBatchLogMealFoodMutationVariables) => fetchData<GQLBatchLogMealFoodMutation, GQLBatchLogMealFoodMutationVariables>(BatchLogMealFoodDocument, variables)(),
    ...options
  }
    )};

useBatchLogMealFoodMutation.getKey = () => ['BatchLogMealFood'];


useBatchLogMealFoodMutation.fetcher = (variables: GQLBatchLogMealFoodMutationVariables, options?: RequestInit['headers']) => fetchData<GQLBatchLogMealFoodMutation, GQLBatchLogMealFoodMutationVariables>(BatchLogMealFoodDocument, variables, options);

export const CompleteMealDocument = `
    mutation CompleteMeal($mealId: ID!) {
  completeMeal(mealId: $mealId)
}
    `;

export const useCompleteMealMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCompleteMealMutation, TError, GQLCompleteMealMutationVariables, TContext>) => {
    
    return useMutation<GQLCompleteMealMutation, TError, GQLCompleteMealMutationVariables, TContext>(
      {
    mutationKey: ['CompleteMeal'],
    mutationFn: (variables?: GQLCompleteMealMutationVariables) => fetchData<GQLCompleteMealMutation, GQLCompleteMealMutationVariables>(CompleteMealDocument, variables)(),
    ...options
  }
    )};

useCompleteMealMutation.getKey = () => ['CompleteMeal'];


useCompleteMealMutation.fetcher = (variables: GQLCompleteMealMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCompleteMealMutation, GQLCompleteMealMutationVariables>(CompleteMealDocument, variables, options);

export const UncompleteMealDocument = `
    mutation UncompleteMeal($mealId: ID!) {
  uncompleteMeal(mealId: $mealId)
}
    `;

export const useUncompleteMealMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUncompleteMealMutation, TError, GQLUncompleteMealMutationVariables, TContext>) => {
    
    return useMutation<GQLUncompleteMealMutation, TError, GQLUncompleteMealMutationVariables, TContext>(
      {
    mutationKey: ['UncompleteMeal'],
    mutationFn: (variables?: GQLUncompleteMealMutationVariables) => fetchData<GQLUncompleteMealMutation, GQLUncompleteMealMutationVariables>(UncompleteMealDocument, variables)(),
    ...options
  }
    )};

useUncompleteMealMutation.getKey = () => ['UncompleteMeal'];


useUncompleteMealMutation.fetcher = (variables: GQLUncompleteMealMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUncompleteMealMutation, GQLUncompleteMealMutationVariables>(UncompleteMealDocument, variables, options);

export const AddCustomFoodToMealDocument = `
    mutation AddCustomFoodToMeal($input: AddCustomFoodToMealInput!) {
  addCustomFoodToMeal(input: $input) {
    id
    quantity
    loggedQuantity
    unit
    loggedAt
    notes
    calories
    protein
    carbs
    fat
    fiber
    mealFood {
      id
      name
      addedAt
      addedBy {
        id
        firstName
        lastName
      }
    }
    user {
      id
      firstName
      lastName
    }
  }
}
    `;

export const useAddCustomFoodToMealMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAddCustomFoodToMealMutation, TError, GQLAddCustomFoodToMealMutationVariables, TContext>) => {
    
    return useMutation<GQLAddCustomFoodToMealMutation, TError, GQLAddCustomFoodToMealMutationVariables, TContext>(
      {
    mutationKey: ['AddCustomFoodToMeal'],
    mutationFn: (variables?: GQLAddCustomFoodToMealMutationVariables) => fetchData<GQLAddCustomFoodToMealMutation, GQLAddCustomFoodToMealMutationVariables>(AddCustomFoodToMealDocument, variables)(),
    ...options
  }
    )};

useAddCustomFoodToMealMutation.getKey = () => ['AddCustomFoodToMeal'];


useAddCustomFoodToMealMutation.fetcher = (variables: GQLAddCustomFoodToMealMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAddCustomFoodToMealMutation, GQLAddCustomFoodToMealMutationVariables>(AddCustomFoodToMealDocument, variables, options);

export const AddFoodToPersonalLogDocument = `
    mutation AddFoodToPersonalLog($input: AddFoodToPersonalLogInput!) {
  addFoodToPersonalLog(input: $input) {
    id
    quantity
    loggedQuantity
    unit
    loggedAt
    notes
    calories
    protein
    carbs
    fat
    fiber
    mealFood {
      id
      name
      addedAt
      addedBy {
        id
        firstName
        lastName
      }
    }
    user {
      id
      firstName
      lastName
    }
  }
}
    `;

export const useAddFoodToPersonalLogMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAddFoodToPersonalLogMutation, TError, GQLAddFoodToPersonalLogMutationVariables, TContext>) => {
    
    return useMutation<GQLAddFoodToPersonalLogMutation, TError, GQLAddFoodToPersonalLogMutationVariables, TContext>(
      {
    mutationKey: ['AddFoodToPersonalLog'],
    mutationFn: (variables?: GQLAddFoodToPersonalLogMutationVariables) => fetchData<GQLAddFoodToPersonalLogMutation, GQLAddFoodToPersonalLogMutationVariables>(AddFoodToPersonalLogDocument, variables)(),
    ...options
  }
    )};

useAddFoodToPersonalLogMutation.getKey = () => ['AddFoodToPersonalLog'];


useAddFoodToPersonalLogMutation.fetcher = (variables: GQLAddFoodToPersonalLogMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAddFoodToPersonalLogMutation, GQLAddFoodToPersonalLogMutationVariables>(AddFoodToPersonalLogDocument, variables, options);

export const RemoveMealLogDocument = `
    mutation RemoveMealLog($foodId: ID!) {
  removeMealLog(foodId: $foodId)
}
    `;

export const useRemoveMealLogMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveMealLogMutation, TError, GQLRemoveMealLogMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveMealLogMutation, TError, GQLRemoveMealLogMutationVariables, TContext>(
      {
    mutationKey: ['RemoveMealLog'],
    mutationFn: (variables?: GQLRemoveMealLogMutationVariables) => fetchData<GQLRemoveMealLogMutation, GQLRemoveMealLogMutationVariables>(RemoveMealLogDocument, variables)(),
    ...options
  }
    )};

useRemoveMealLogMutation.getKey = () => ['RemoveMealLog'];


useRemoveMealLogMutation.fetcher = (variables: GQLRemoveMealLogMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveMealLogMutation, GQLRemoveMealLogMutationVariables>(RemoveMealLogDocument, variables, options);

export const FitspaceMealPlansOverviewDocument = `
    query FitspaceMealPlansOverview {
  getMyMealPlansOverview {
    activePlan {
      id
      title
      description
      dailyCalories
      dailyProtein
      dailyCarbs
      dailyFat
      startDate
      endDate
      active
      weekCount
      createdAt
      updatedAt
      createdBy {
        id
        firstName
        lastName
        image
      }
      weeks {
        id
        weekNumber
        name
        description
        completedAt
        days {
          id
          dayOfWeek
          targetCalories
          targetProtein
          targetCarbs
          targetFat
          completedAt
          scheduledAt
          meals {
            id
            name
            dateTime
            completedAt
            instructions
            foods {
              id
              name
              quantity
              unit
              caloriesPer100g
              proteinPer100g
              carbsPer100g
              fatPer100g
              fiberPer100g
            }
          }
        }
      }
    }
    availablePlans {
      id
      title
      description
      dailyCalories
      dailyProtein
      dailyCarbs
      dailyFat
      startDate
      endDate
      active
      weekCount
      createdAt
      updatedAt
      createdBy {
        id
        firstName
        lastName
        image
      }
    }
  }
}
    `;

export const useFitspaceMealPlansOverviewQuery = <
      TData = GQLFitspaceMealPlansOverviewQuery,
      TError = unknown
    >(
      variables?: GQLFitspaceMealPlansOverviewQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitspaceMealPlansOverviewQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitspaceMealPlansOverviewQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitspaceMealPlansOverviewQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['FitspaceMealPlansOverview'] : ['FitspaceMealPlansOverview', variables],
    queryFn: fetchData<GQLFitspaceMealPlansOverviewQuery, GQLFitspaceMealPlansOverviewQueryVariables>(FitspaceMealPlansOverviewDocument, variables),
    ...options
  }
    )};

useFitspaceMealPlansOverviewQuery.getKey = (variables?: GQLFitspaceMealPlansOverviewQueryVariables) => variables === undefined ? ['FitspaceMealPlansOverview'] : ['FitspaceMealPlansOverview', variables];

export const useInfiniteFitspaceMealPlansOverviewQuery = <
      TData = InfiniteData<GQLFitspaceMealPlansOverviewQuery>,
      TError = unknown
    >(
      variables: GQLFitspaceMealPlansOverviewQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitspaceMealPlansOverviewQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitspaceMealPlansOverviewQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitspaceMealPlansOverviewQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['FitspaceMealPlansOverview.infinite'] : ['FitspaceMealPlansOverview.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitspaceMealPlansOverviewQuery, GQLFitspaceMealPlansOverviewQueryVariables>(FitspaceMealPlansOverviewDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitspaceMealPlansOverviewQuery.getKey = (variables?: GQLFitspaceMealPlansOverviewQueryVariables) => variables === undefined ? ['FitspaceMealPlansOverview.infinite'] : ['FitspaceMealPlansOverview.infinite', variables];


useFitspaceMealPlansOverviewQuery.fetcher = (variables?: GQLFitspaceMealPlansOverviewQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceMealPlansOverviewQuery, GQLFitspaceMealPlansOverviewQueryVariables>(FitspaceMealPlansOverviewDocument, variables, options);

export const FitspaceActivateMealPlanDocument = `
    mutation FitspaceActivateMealPlan($planId: ID!) {
  fitspaceActivateMealPlan(planId: $planId)
}
    `;

export const useFitspaceActivateMealPlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceActivateMealPlanMutation, TError, GQLFitspaceActivateMealPlanMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceActivateMealPlanMutation, TError, GQLFitspaceActivateMealPlanMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceActivateMealPlan'],
    mutationFn: (variables?: GQLFitspaceActivateMealPlanMutationVariables) => fetchData<GQLFitspaceActivateMealPlanMutation, GQLFitspaceActivateMealPlanMutationVariables>(FitspaceActivateMealPlanDocument, variables)(),
    ...options
  }
    )};

useFitspaceActivateMealPlanMutation.getKey = () => ['FitspaceActivateMealPlan'];


useFitspaceActivateMealPlanMutation.fetcher = (variables: GQLFitspaceActivateMealPlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceActivateMealPlanMutation, GQLFitspaceActivateMealPlanMutationVariables>(FitspaceActivateMealPlanDocument, variables, options);

export const FitspaceDeactivateMealPlanDocument = `
    mutation FitspaceDeactivateMealPlan($planId: ID!) {
  fitspaceDeactivateMealPlan(planId: $planId)
}
    `;

export const useFitspaceDeactivateMealPlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceDeactivateMealPlanMutation, TError, GQLFitspaceDeactivateMealPlanMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceDeactivateMealPlanMutation, TError, GQLFitspaceDeactivateMealPlanMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceDeactivateMealPlan'],
    mutationFn: (variables?: GQLFitspaceDeactivateMealPlanMutationVariables) => fetchData<GQLFitspaceDeactivateMealPlanMutation, GQLFitspaceDeactivateMealPlanMutationVariables>(FitspaceDeactivateMealPlanDocument, variables)(),
    ...options
  }
    )};

useFitspaceDeactivateMealPlanMutation.getKey = () => ['FitspaceDeactivateMealPlan'];


useFitspaceDeactivateMealPlanMutation.fetcher = (variables: GQLFitspaceDeactivateMealPlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceDeactivateMealPlanMutation, GQLFitspaceDeactivateMealPlanMutationVariables>(FitspaceDeactivateMealPlanDocument, variables, options);

export const FitspaceDeleteMealPlanDocument = `
    mutation FitspaceDeleteMealPlan($planId: ID!) {
  fitspaceDeleteMealPlan(planId: $planId)
}
    `;

export const useFitspaceDeleteMealPlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceDeleteMealPlanMutation, TError, GQLFitspaceDeleteMealPlanMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceDeleteMealPlanMutation, TError, GQLFitspaceDeleteMealPlanMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceDeleteMealPlan'],
    mutationFn: (variables?: GQLFitspaceDeleteMealPlanMutationVariables) => fetchData<GQLFitspaceDeleteMealPlanMutation, GQLFitspaceDeleteMealPlanMutationVariables>(FitspaceDeleteMealPlanDocument, variables)(),
    ...options
  }
    )};

useFitspaceDeleteMealPlanMutation.getKey = () => ['FitspaceDeleteMealPlan'];


useFitspaceDeleteMealPlanMutation.fetcher = (variables: GQLFitspaceDeleteMealPlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceDeleteMealPlanMutation, GQLFitspaceDeleteMealPlanMutationVariables>(FitspaceDeleteMealPlanDocument, variables, options);

export const GetFavouriteWorkoutsDocument = `
    query GetFavouriteWorkouts {
  getFavouriteWorkouts {
    id
    title
    description
    createdById
    createdAt
    updatedAt
    exercises {
      id
      name
      order
      baseId
      favouriteWorkoutId
      restSeconds
      instructions
      base {
        id
        name
        description
        videoUrl
        equipment
        isPublic
        additionalInstructions
        type
        muscleGroups {
          id
          name
          alias
          groupSlug
        }
        images {
          id
          url
          order
        }
      }
      sets {
        id
        order
        reps
        minReps
        maxReps
        weight
        rpe
      }
    }
  }
}
    `;

export const useGetFavouriteWorkoutsQuery = <
      TData = GQLGetFavouriteWorkoutsQuery,
      TError = unknown
    >(
      variables?: GQLGetFavouriteWorkoutsQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetFavouriteWorkoutsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetFavouriteWorkoutsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetFavouriteWorkoutsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetFavouriteWorkouts'] : ['GetFavouriteWorkouts', variables],
    queryFn: fetchData<GQLGetFavouriteWorkoutsQuery, GQLGetFavouriteWorkoutsQueryVariables>(GetFavouriteWorkoutsDocument, variables),
    ...options
  }
    )};

useGetFavouriteWorkoutsQuery.getKey = (variables?: GQLGetFavouriteWorkoutsQueryVariables) => variables === undefined ? ['GetFavouriteWorkouts'] : ['GetFavouriteWorkouts', variables];

export const useInfiniteGetFavouriteWorkoutsQuery = <
      TData = InfiniteData<GQLGetFavouriteWorkoutsQuery>,
      TError = unknown
    >(
      variables: GQLGetFavouriteWorkoutsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetFavouriteWorkoutsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetFavouriteWorkoutsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetFavouriteWorkoutsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetFavouriteWorkouts.infinite'] : ['GetFavouriteWorkouts.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetFavouriteWorkoutsQuery, GQLGetFavouriteWorkoutsQueryVariables>(GetFavouriteWorkoutsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetFavouriteWorkoutsQuery.getKey = (variables?: GQLGetFavouriteWorkoutsQueryVariables) => variables === undefined ? ['GetFavouriteWorkouts.infinite'] : ['GetFavouriteWorkouts.infinite', variables];


useGetFavouriteWorkoutsQuery.fetcher = (variables?: GQLGetFavouriteWorkoutsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetFavouriteWorkoutsQuery, GQLGetFavouriteWorkoutsQueryVariables>(GetFavouriteWorkoutsDocument, variables, options);

export const GetFavouriteWorkoutDocument = `
    query GetFavouriteWorkout($id: ID!) {
  getFavouriteWorkout(id: $id) {
    id
    title
    description
    createdById
    createdAt
    updatedAt
    exercises {
      id
      name
      order
      baseId
      favouriteWorkoutId
      restSeconds
      instructions
      base {
        id
        name
        description
        videoUrl
        equipment
        isPublic
        additionalInstructions
        type
        muscleGroups {
          id
          name
          alias
          groupSlug
        }
        images {
          id
          url
          order
        }
      }
      sets {
        id
        order
        reps
        minReps
        maxReps
        weight
        rpe
      }
    }
  }
}
    `;

export const useGetFavouriteWorkoutQuery = <
      TData = GQLGetFavouriteWorkoutQuery,
      TError = unknown
    >(
      variables: GQLGetFavouriteWorkoutQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetFavouriteWorkoutQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetFavouriteWorkoutQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetFavouriteWorkoutQuery, TError, TData>(
      {
    queryKey: ['GetFavouriteWorkout', variables],
    queryFn: fetchData<GQLGetFavouriteWorkoutQuery, GQLGetFavouriteWorkoutQueryVariables>(GetFavouriteWorkoutDocument, variables),
    ...options
  }
    )};

useGetFavouriteWorkoutQuery.getKey = (variables: GQLGetFavouriteWorkoutQueryVariables) => ['GetFavouriteWorkout', variables];

export const useInfiniteGetFavouriteWorkoutQuery = <
      TData = InfiniteData<GQLGetFavouriteWorkoutQuery>,
      TError = unknown
    >(
      variables: GQLGetFavouriteWorkoutQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetFavouriteWorkoutQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetFavouriteWorkoutQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetFavouriteWorkoutQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetFavouriteWorkout.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetFavouriteWorkoutQuery, GQLGetFavouriteWorkoutQueryVariables>(GetFavouriteWorkoutDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetFavouriteWorkoutQuery.getKey = (variables: GQLGetFavouriteWorkoutQueryVariables) => ['GetFavouriteWorkout.infinite', variables];


useGetFavouriteWorkoutQuery.fetcher = (variables: GQLGetFavouriteWorkoutQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetFavouriteWorkoutQuery, GQLGetFavouriteWorkoutQueryVariables>(GetFavouriteWorkoutDocument, variables, options);

export const CreateFavouriteWorkoutDocument = `
    mutation CreateFavouriteWorkout($input: CreateFavouriteWorkoutInput!) {
  createFavouriteWorkout(input: $input) {
    id
    title
    description
    createdAt
    exercises {
      id
      name
      order
      baseId
      restSeconds
      instructions
      sets {
        id
        order
        reps
        minReps
        maxReps
        weight
        rpe
      }
    }
  }
}
    `;

export const useCreateFavouriteWorkoutMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateFavouriteWorkoutMutation, TError, GQLCreateFavouriteWorkoutMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateFavouriteWorkoutMutation, TError, GQLCreateFavouriteWorkoutMutationVariables, TContext>(
      {
    mutationKey: ['CreateFavouriteWorkout'],
    mutationFn: (variables?: GQLCreateFavouriteWorkoutMutationVariables) => fetchData<GQLCreateFavouriteWorkoutMutation, GQLCreateFavouriteWorkoutMutationVariables>(CreateFavouriteWorkoutDocument, variables)(),
    ...options
  }
    )};

useCreateFavouriteWorkoutMutation.getKey = () => ['CreateFavouriteWorkout'];


useCreateFavouriteWorkoutMutation.fetcher = (variables: GQLCreateFavouriteWorkoutMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateFavouriteWorkoutMutation, GQLCreateFavouriteWorkoutMutationVariables>(CreateFavouriteWorkoutDocument, variables, options);

export const UpdateFavouriteWorkoutDocument = `
    mutation UpdateFavouriteWorkout($input: UpdateFavouriteWorkoutInput!) {
  updateFavouriteWorkout(input: $input) {
    id
    title
    description
    updatedAt
    exercises {
      id
      name
      order
      baseId
      restSeconds
      instructions
      sets {
        id
        order
        reps
        minReps
        maxReps
        weight
        rpe
      }
    }
  }
}
    `;

export const useUpdateFavouriteWorkoutMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateFavouriteWorkoutMutation, TError, GQLUpdateFavouriteWorkoutMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateFavouriteWorkoutMutation, TError, GQLUpdateFavouriteWorkoutMutationVariables, TContext>(
      {
    mutationKey: ['UpdateFavouriteWorkout'],
    mutationFn: (variables?: GQLUpdateFavouriteWorkoutMutationVariables) => fetchData<GQLUpdateFavouriteWorkoutMutation, GQLUpdateFavouriteWorkoutMutationVariables>(UpdateFavouriteWorkoutDocument, variables)(),
    ...options
  }
    )};

useUpdateFavouriteWorkoutMutation.getKey = () => ['UpdateFavouriteWorkout'];


useUpdateFavouriteWorkoutMutation.fetcher = (variables: GQLUpdateFavouriteWorkoutMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateFavouriteWorkoutMutation, GQLUpdateFavouriteWorkoutMutationVariables>(UpdateFavouriteWorkoutDocument, variables, options);

export const DeleteFavouriteWorkoutDocument = `
    mutation DeleteFavouriteWorkout($id: ID!) {
  deleteFavouriteWorkout(id: $id)
}
    `;

export const useDeleteFavouriteWorkoutMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDeleteFavouriteWorkoutMutation, TError, GQLDeleteFavouriteWorkoutMutationVariables, TContext>) => {
    
    return useMutation<GQLDeleteFavouriteWorkoutMutation, TError, GQLDeleteFavouriteWorkoutMutationVariables, TContext>(
      {
    mutationKey: ['DeleteFavouriteWorkout'],
    mutationFn: (variables?: GQLDeleteFavouriteWorkoutMutationVariables) => fetchData<GQLDeleteFavouriteWorkoutMutation, GQLDeleteFavouriteWorkoutMutationVariables>(DeleteFavouriteWorkoutDocument, variables)(),
    ...options
  }
    )};

useDeleteFavouriteWorkoutMutation.getKey = () => ['DeleteFavouriteWorkout'];


useDeleteFavouriteWorkoutMutation.fetcher = (variables: GQLDeleteFavouriteWorkoutMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDeleteFavouriteWorkoutMutation, GQLDeleteFavouriteWorkoutMutationVariables>(DeleteFavouriteWorkoutDocument, variables, options);

export const StartWorkoutFromFavouriteDocument = `
    mutation StartWorkoutFromFavourite($input: StartWorkoutFromFavouriteInput!) {
  startWorkoutFromFavourite(input: $input)
}
    `;

export const useStartWorkoutFromFavouriteMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLStartWorkoutFromFavouriteMutation, TError, GQLStartWorkoutFromFavouriteMutationVariables, TContext>) => {
    
    return useMutation<GQLStartWorkoutFromFavouriteMutation, TError, GQLStartWorkoutFromFavouriteMutationVariables, TContext>(
      {
    mutationKey: ['StartWorkoutFromFavourite'],
    mutationFn: (variables?: GQLStartWorkoutFromFavouriteMutationVariables) => fetchData<GQLStartWorkoutFromFavouriteMutation, GQLStartWorkoutFromFavouriteMutationVariables>(StartWorkoutFromFavouriteDocument, variables)(),
    ...options
  }
    )};

useStartWorkoutFromFavouriteMutation.getKey = () => ['StartWorkoutFromFavourite'];


useStartWorkoutFromFavouriteMutation.fetcher = (variables: GQLStartWorkoutFromFavouriteMutationVariables, options?: RequestInit['headers']) => fetchData<GQLStartWorkoutFromFavouriteMutation, GQLStartWorkoutFromFavouriteMutationVariables>(StartWorkoutFromFavouriteDocument, variables, options);

export const FitspaceMyPlansDocument = `
    query FitspaceMyPlans {
  getMyPlansOverviewFull {
    activePlan {
      id
      title
      description
      difficulty
      totalWorkouts
      rating
      totalReviews
      weekCount
      currentWeekNumber
      completedWorkoutsDays
      adherence
      startDate
      endDate
      updatedAt
      weeks {
        id
        weekNumber
        scheduledAt
        completedAt
        isExtra
        days {
          id
          dayOfWeek
          isRestDay
          workoutType
          completedAt
          scheduledAt
          exercises {
            id
            restSeconds
            videoUrl
            instructions
            name
            warmupSets
            muscleGroups {
              id
              name
              alias
            }
            completedAt
            sets {
              id
            }
          }
        }
      }
    }
    quickWorkoutPlan {
      id
      totalWorkouts
      weekCount
      completedWorkoutsDays
      adherence
      updatedAt
      weeks {
        id
        weekNumber
        scheduledAt
        completedAt
        days {
          id
          dayOfWeek
          completedAt
          scheduledAt
          exercises {
            id
            videoUrl
            instructions
            name
            muscleGroups {
              id
              name
              alias
            }
            completedAt
            sets {
              id
            }
          }
        }
      }
    }
    availablePlans {
      id
      title
      description
      difficulty
      totalWorkouts
      rating
      totalReviews
      weekCount
      currentWeekNumber
      completedWorkoutsDays
      adherence
      startDate
      endDate
      updatedAt
      createdBy {
        id
        firstName
        lastName
        image
        sex
      }
    }
    completedPlans {
      id
      title
      description
      difficulty
      totalWorkouts
      rating
      userReview {
        id
        rating
        comment
        createdAt
        updatedAt
      }
      totalReviews
      weekCount
      currentWeekNumber
      completedWorkoutsDays
      adherence
      startDate
      endDate
      completedAt
      updatedAt
      createdBy {
        id
        firstName
        lastName
        image
        sex
      }
    }
  }
}
    `;

export const useFitspaceMyPlansQuery = <
      TData = GQLFitspaceMyPlansQuery,
      TError = unknown
    >(
      variables?: GQLFitspaceMyPlansQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitspaceMyPlansQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitspaceMyPlansQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitspaceMyPlansQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['FitspaceMyPlans'] : ['FitspaceMyPlans', variables],
    queryFn: fetchData<GQLFitspaceMyPlansQuery, GQLFitspaceMyPlansQueryVariables>(FitspaceMyPlansDocument, variables),
    ...options
  }
    )};

useFitspaceMyPlansQuery.getKey = (variables?: GQLFitspaceMyPlansQueryVariables) => variables === undefined ? ['FitspaceMyPlans'] : ['FitspaceMyPlans', variables];

export const useInfiniteFitspaceMyPlansQuery = <
      TData = InfiniteData<GQLFitspaceMyPlansQuery>,
      TError = unknown
    >(
      variables: GQLFitspaceMyPlansQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitspaceMyPlansQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitspaceMyPlansQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitspaceMyPlansQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['FitspaceMyPlans.infinite'] : ['FitspaceMyPlans.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitspaceMyPlansQuery, GQLFitspaceMyPlansQueryVariables>(FitspaceMyPlansDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitspaceMyPlansQuery.getKey = (variables?: GQLFitspaceMyPlansQueryVariables) => variables === undefined ? ['FitspaceMyPlans.infinite'] : ['FitspaceMyPlans.infinite', variables];


useFitspaceMyPlansQuery.fetcher = (variables?: GQLFitspaceMyPlansQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceMyPlansQuery, GQLFitspaceMyPlansQueryVariables>(FitspaceMyPlansDocument, variables, options);

export const ActivatePlanDocument = `
    mutation ActivatePlan($planId: ID!, $startDate: String!, $resume: Boolean!) {
  activatePlan(planId: $planId, startDate: $startDate, resume: $resume)
}
    `;

export const useActivatePlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLActivatePlanMutation, TError, GQLActivatePlanMutationVariables, TContext>) => {
    
    return useMutation<GQLActivatePlanMutation, TError, GQLActivatePlanMutationVariables, TContext>(
      {
    mutationKey: ['ActivatePlan'],
    mutationFn: (variables?: GQLActivatePlanMutationVariables) => fetchData<GQLActivatePlanMutation, GQLActivatePlanMutationVariables>(ActivatePlanDocument, variables)(),
    ...options
  }
    )};

useActivatePlanMutation.getKey = () => ['ActivatePlan'];


useActivatePlanMutation.fetcher = (variables: GQLActivatePlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLActivatePlanMutation, GQLActivatePlanMutationVariables>(ActivatePlanDocument, variables, options);

export const PausePlanDocument = `
    mutation PausePlan($planId: ID!) {
  pausePlan(planId: $planId)
}
    `;

export const usePausePlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLPausePlanMutation, TError, GQLPausePlanMutationVariables, TContext>) => {
    
    return useMutation<GQLPausePlanMutation, TError, GQLPausePlanMutationVariables, TContext>(
      {
    mutationKey: ['PausePlan'],
    mutationFn: (variables?: GQLPausePlanMutationVariables) => fetchData<GQLPausePlanMutation, GQLPausePlanMutationVariables>(PausePlanDocument, variables)(),
    ...options
  }
    )};

usePausePlanMutation.getKey = () => ['PausePlan'];


usePausePlanMutation.fetcher = (variables: GQLPausePlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLPausePlanMutation, GQLPausePlanMutationVariables>(PausePlanDocument, variables, options);

export const ClosePlanDocument = `
    mutation ClosePlan($planId: ID!) {
  closePlan(planId: $planId)
}
    `;

export const useClosePlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLClosePlanMutation, TError, GQLClosePlanMutationVariables, TContext>) => {
    
    return useMutation<GQLClosePlanMutation, TError, GQLClosePlanMutationVariables, TContext>(
      {
    mutationKey: ['ClosePlan'],
    mutationFn: (variables?: GQLClosePlanMutationVariables) => fetchData<GQLClosePlanMutation, GQLClosePlanMutationVariables>(ClosePlanDocument, variables)(),
    ...options
  }
    )};

useClosePlanMutation.getKey = () => ['ClosePlan'];


useClosePlanMutation.fetcher = (variables: GQLClosePlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLClosePlanMutation, GQLClosePlanMutationVariables>(ClosePlanDocument, variables, options);

export const DeletePlanDocument = `
    mutation DeletePlan($planId: ID!) {
  deletePlan(planId: $planId)
}
    `;

export const useDeletePlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDeletePlanMutation, TError, GQLDeletePlanMutationVariables, TContext>) => {
    
    return useMutation<GQLDeletePlanMutation, TError, GQLDeletePlanMutationVariables, TContext>(
      {
    mutationKey: ['DeletePlan'],
    mutationFn: (variables?: GQLDeletePlanMutationVariables) => fetchData<GQLDeletePlanMutation, GQLDeletePlanMutationVariables>(DeletePlanDocument, variables)(),
    ...options
  }
    )};

useDeletePlanMutation.getKey = () => ['DeletePlan'];


useDeletePlanMutation.fetcher = (variables: GQLDeletePlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDeletePlanMutation, GQLDeletePlanMutationVariables>(DeletePlanDocument, variables, options);

export const CreateReviewDocument = `
    mutation CreateReview($input: CreateReviewInput!) {
  createReview(input: $input)
}
    `;

export const useCreateReviewMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateReviewMutation, TError, GQLCreateReviewMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateReviewMutation, TError, GQLCreateReviewMutationVariables, TContext>(
      {
    mutationKey: ['CreateReview'],
    mutationFn: (variables?: GQLCreateReviewMutationVariables) => fetchData<GQLCreateReviewMutation, GQLCreateReviewMutationVariables>(CreateReviewDocument, variables)(),
    ...options
  }
    )};

useCreateReviewMutation.getKey = () => ['CreateReview'];


useCreateReviewMutation.fetcher = (variables: GQLCreateReviewMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateReviewMutation, GQLCreateReviewMutationVariables>(CreateReviewDocument, variables, options);

export const UpdateReviewDocument = `
    mutation UpdateReview($input: UpdateReviewInput!) {
  updateReview(input: $input)
}
    `;

export const useUpdateReviewMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateReviewMutation, TError, GQLUpdateReviewMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateReviewMutation, TError, GQLUpdateReviewMutationVariables, TContext>(
      {
    mutationKey: ['UpdateReview'],
    mutationFn: (variables?: GQLUpdateReviewMutationVariables) => fetchData<GQLUpdateReviewMutation, GQLUpdateReviewMutationVariables>(UpdateReviewDocument, variables)(),
    ...options
  }
    )};

useUpdateReviewMutation.getKey = () => ['UpdateReview'];


useUpdateReviewMutation.fetcher = (variables: GQLUpdateReviewMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateReviewMutation, GQLUpdateReviewMutationVariables>(UpdateReviewDocument, variables, options);

export const DeleteReviewDocument = `
    mutation DeleteReview($input: DeleteReviewInput!) {
  deleteReview(input: $input)
}
    `;

export const useDeleteReviewMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDeleteReviewMutation, TError, GQLDeleteReviewMutationVariables, TContext>) => {
    
    return useMutation<GQLDeleteReviewMutation, TError, GQLDeleteReviewMutationVariables, TContext>(
      {
    mutationKey: ['DeleteReview'],
    mutationFn: (variables?: GQLDeleteReviewMutationVariables) => fetchData<GQLDeleteReviewMutation, GQLDeleteReviewMutationVariables>(DeleteReviewDocument, variables)(),
    ...options
  }
    )};

useDeleteReviewMutation.getKey = () => ['DeleteReview'];


useDeleteReviewMutation.fetcher = (variables: GQLDeleteReviewMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDeleteReviewMutation, GQLDeleteReviewMutationVariables>(DeleteReviewDocument, variables, options);

export const ExtendPlanDocument = `
    mutation ExtendPlan($planId: ID!, $weeks: [ID!]!) {
  extendPlan(planId: $planId, weeks: $weeks)
}
    `;

export const useExtendPlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLExtendPlanMutation, TError, GQLExtendPlanMutationVariables, TContext>) => {
    
    return useMutation<GQLExtendPlanMutation, TError, GQLExtendPlanMutationVariables, TContext>(
      {
    mutationKey: ['ExtendPlan'],
    mutationFn: (variables?: GQLExtendPlanMutationVariables) => fetchData<GQLExtendPlanMutation, GQLExtendPlanMutationVariables>(ExtendPlanDocument, variables)(),
    ...options
  }
    )};

useExtendPlanMutation.getKey = () => ['ExtendPlan'];


useExtendPlanMutation.fetcher = (variables: GQLExtendPlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLExtendPlanMutation, GQLExtendPlanMutationVariables>(ExtendPlanDocument, variables, options);

export const RemoveWeekDocument = `
    mutation RemoveWeek($planId: ID!, $weekId: ID!) {
  removeWeek(planId: $planId, weekId: $weekId)
}
    `;

export const useRemoveWeekMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveWeekMutation, TError, GQLRemoveWeekMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveWeekMutation, TError, GQLRemoveWeekMutationVariables, TContext>(
      {
    mutationKey: ['RemoveWeek'],
    mutationFn: (variables?: GQLRemoveWeekMutationVariables) => fetchData<GQLRemoveWeekMutation, GQLRemoveWeekMutationVariables>(RemoveWeekDocument, variables)(),
    ...options
  }
    )};

useRemoveWeekMutation.getKey = () => ['RemoveWeek'];


useRemoveWeekMutation.fetcher = (variables: GQLRemoveWeekMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveWeekMutation, GQLRemoveWeekMutationVariables>(RemoveWeekDocument, variables, options);

export const ProfileDocument = `
    query Profile {
  profile {
    ...ProfileFragment
  }
}
    ${ProfileFragmentFragmentDoc}`;

export const useProfileQuery = <
      TData = GQLProfileQuery,
      TError = unknown
    >(
      variables?: GQLProfileQueryVariables,
      options?: Omit<UseQueryOptions<GQLProfileQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLProfileQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLProfileQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['Profile'] : ['Profile', variables],
    queryFn: fetchData<GQLProfileQuery, GQLProfileQueryVariables>(ProfileDocument, variables),
    ...options
  }
    )};

useProfileQuery.getKey = (variables?: GQLProfileQueryVariables) => variables === undefined ? ['Profile'] : ['Profile', variables];

export const useInfiniteProfileQuery = <
      TData = InfiniteData<GQLProfileQuery>,
      TError = unknown
    >(
      variables: GQLProfileQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLProfileQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLProfileQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLProfileQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['Profile.infinite'] : ['Profile.infinite', variables],
      queryFn: (metaData) => fetchData<GQLProfileQuery, GQLProfileQueryVariables>(ProfileDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteProfileQuery.getKey = (variables?: GQLProfileQueryVariables) => variables === undefined ? ['Profile.infinite'] : ['Profile.infinite', variables];


useProfileQuery.fetcher = (variables?: GQLProfileQueryVariables, options?: RequestInit['headers']) => fetchData<GQLProfileQuery, GQLProfileQueryVariables>(ProfileDocument, variables, options);

export const UpdateProfileDocument = `
    mutation UpdateProfile($input: UpdateProfileInput!) {
  updateProfile(input: $input) {
    id
  }
}
    `;

export const useUpdateProfileMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateProfileMutation, TError, GQLUpdateProfileMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateProfileMutation, TError, GQLUpdateProfileMutationVariables, TContext>(
      {
    mutationKey: ['UpdateProfile'],
    mutationFn: (variables?: GQLUpdateProfileMutationVariables) => fetchData<GQLUpdateProfileMutation, GQLUpdateProfileMutationVariables>(UpdateProfileDocument, variables)(),
    ...options
  }
    )};

useUpdateProfileMutation.getKey = () => ['UpdateProfile'];


useUpdateProfileMutation.fetcher = (variables: GQLUpdateProfileMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateProfileMutation, GQLUpdateProfileMutationVariables>(UpdateProfileDocument, variables, options);

export const BodyMeasuresDocument = `
    query BodyMeasures {
  bodyMeasures {
    id
    measuredAt
    weight
    chest
    waist
    hips
    neck
    bicepsLeft
    bicepsRight
    thighLeft
    thighRight
    calfLeft
    calfRight
    bodyFat
    notes
  }
}
    `;

export const useBodyMeasuresQuery = <
      TData = GQLBodyMeasuresQuery,
      TError = unknown
    >(
      variables?: GQLBodyMeasuresQueryVariables,
      options?: Omit<UseQueryOptions<GQLBodyMeasuresQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLBodyMeasuresQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLBodyMeasuresQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['BodyMeasures'] : ['BodyMeasures', variables],
    queryFn: fetchData<GQLBodyMeasuresQuery, GQLBodyMeasuresQueryVariables>(BodyMeasuresDocument, variables),
    ...options
  }
    )};

useBodyMeasuresQuery.getKey = (variables?: GQLBodyMeasuresQueryVariables) => variables === undefined ? ['BodyMeasures'] : ['BodyMeasures', variables];

export const useInfiniteBodyMeasuresQuery = <
      TData = InfiniteData<GQLBodyMeasuresQuery>,
      TError = unknown
    >(
      variables: GQLBodyMeasuresQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLBodyMeasuresQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLBodyMeasuresQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLBodyMeasuresQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['BodyMeasures.infinite'] : ['BodyMeasures.infinite', variables],
      queryFn: (metaData) => fetchData<GQLBodyMeasuresQuery, GQLBodyMeasuresQueryVariables>(BodyMeasuresDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteBodyMeasuresQuery.getKey = (variables?: GQLBodyMeasuresQueryVariables) => variables === undefined ? ['BodyMeasures.infinite'] : ['BodyMeasures.infinite', variables];


useBodyMeasuresQuery.fetcher = (variables?: GQLBodyMeasuresQueryVariables, options?: RequestInit['headers']) => fetchData<GQLBodyMeasuresQuery, GQLBodyMeasuresQueryVariables>(BodyMeasuresDocument, variables, options);

export const AddBodyMeasurementDocument = `
    mutation AddBodyMeasurement($input: AddBodyMeasurementInput!) {
  addBodyMeasurement(input: $input) {
    id
    measuredAt
    weight
    chest
    waist
    hips
    neck
    bicepsLeft
    bicepsRight
    thighLeft
    thighRight
    calfLeft
    calfRight
    bodyFat
    notes
  }
}
    `;

export const useAddBodyMeasurementMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAddBodyMeasurementMutation, TError, GQLAddBodyMeasurementMutationVariables, TContext>) => {
    
    return useMutation<GQLAddBodyMeasurementMutation, TError, GQLAddBodyMeasurementMutationVariables, TContext>(
      {
    mutationKey: ['AddBodyMeasurement'],
    mutationFn: (variables?: GQLAddBodyMeasurementMutationVariables) => fetchData<GQLAddBodyMeasurementMutation, GQLAddBodyMeasurementMutationVariables>(AddBodyMeasurementDocument, variables)(),
    ...options
  }
    )};

useAddBodyMeasurementMutation.getKey = () => ['AddBodyMeasurement'];


useAddBodyMeasurementMutation.fetcher = (variables: GQLAddBodyMeasurementMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAddBodyMeasurementMutation, GQLAddBodyMeasurementMutationVariables>(AddBodyMeasurementDocument, variables, options);

export const UpdateBodyMeasurementDocument = `
    mutation UpdateBodyMeasurement($input: UpdateBodyMeasurementInput!) {
  updateBodyMeasurement(input: $input) {
    id
    measuredAt
    weight
    chest
    waist
    hips
    neck
    bicepsLeft
    bicepsRight
    thighLeft
    thighRight
    calfLeft
    calfRight
    bodyFat
    notes
  }
}
    `;

export const useUpdateBodyMeasurementMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateBodyMeasurementMutation, TError, GQLUpdateBodyMeasurementMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateBodyMeasurementMutation, TError, GQLUpdateBodyMeasurementMutationVariables, TContext>(
      {
    mutationKey: ['UpdateBodyMeasurement'],
    mutationFn: (variables?: GQLUpdateBodyMeasurementMutationVariables) => fetchData<GQLUpdateBodyMeasurementMutation, GQLUpdateBodyMeasurementMutationVariables>(UpdateBodyMeasurementDocument, variables)(),
    ...options
  }
    )};

useUpdateBodyMeasurementMutation.getKey = () => ['UpdateBodyMeasurement'];


useUpdateBodyMeasurementMutation.fetcher = (variables: GQLUpdateBodyMeasurementMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateBodyMeasurementMutation, GQLUpdateBodyMeasurementMutationVariables>(UpdateBodyMeasurementDocument, variables, options);

export const DeleteBodyMeasurementDocument = `
    mutation DeleteBodyMeasurement($id: ID!) {
  deleteBodyMeasurement(id: $id)
}
    `;

export const useDeleteBodyMeasurementMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDeleteBodyMeasurementMutation, TError, GQLDeleteBodyMeasurementMutationVariables, TContext>) => {
    
    return useMutation<GQLDeleteBodyMeasurementMutation, TError, GQLDeleteBodyMeasurementMutationVariables, TContext>(
      {
    mutationKey: ['DeleteBodyMeasurement'],
    mutationFn: (variables?: GQLDeleteBodyMeasurementMutationVariables) => fetchData<GQLDeleteBodyMeasurementMutation, GQLDeleteBodyMeasurementMutationVariables>(DeleteBodyMeasurementDocument, variables)(),
    ...options
  }
    )};

useDeleteBodyMeasurementMutation.getKey = () => ['DeleteBodyMeasurement'];


useDeleteBodyMeasurementMutation.fetcher = (variables: GQLDeleteBodyMeasurementMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDeleteBodyMeasurementMutation, GQLDeleteBodyMeasurementMutationVariables>(DeleteBodyMeasurementDocument, variables, options);

export const ProgressUserDocument = `
    query ProgressUser {
  user {
    id
    email
    name
    role
  }
}
    `;

export const useProgressUserQuery = <
      TData = GQLProgressUserQuery,
      TError = unknown
    >(
      variables?: GQLProgressUserQueryVariables,
      options?: Omit<UseQueryOptions<GQLProgressUserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLProgressUserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLProgressUserQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['ProgressUser'] : ['ProgressUser', variables],
    queryFn: fetchData<GQLProgressUserQuery, GQLProgressUserQueryVariables>(ProgressUserDocument, variables),
    ...options
  }
    )};

useProgressUserQuery.getKey = (variables?: GQLProgressUserQueryVariables) => variables === undefined ? ['ProgressUser'] : ['ProgressUser', variables];

export const useInfiniteProgressUserQuery = <
      TData = InfiniteData<GQLProgressUserQuery>,
      TError = unknown
    >(
      variables: GQLProgressUserQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLProgressUserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLProgressUserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLProgressUserQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['ProgressUser.infinite'] : ['ProgressUser.infinite', variables],
      queryFn: (metaData) => fetchData<GQLProgressUserQuery, GQLProgressUserQueryVariables>(ProgressUserDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteProgressUserQuery.getKey = (variables?: GQLProgressUserQueryVariables) => variables === undefined ? ['ProgressUser.infinite'] : ['ProgressUser.infinite', variables];


useProgressUserQuery.fetcher = (variables?: GQLProgressUserQueryVariables, options?: RequestInit['headers']) => fetchData<GQLProgressUserQuery, GQLProgressUserQueryVariables>(ProgressUserDocument, variables, options);

export const AvailableExercisesForProgressDocument = `
    query AvailableExercisesForProgress($userId: ID!) {
  exercisesProgressByUser(userId: $userId) {
    baseExercise {
      id
      name
      muscleGroups {
        alias
        name
      }
      equipment
    }
  }
}
    `;

export const useAvailableExercisesForProgressQuery = <
      TData = GQLAvailableExercisesForProgressQuery,
      TError = unknown
    >(
      variables: GQLAvailableExercisesForProgressQueryVariables,
      options?: Omit<UseQueryOptions<GQLAvailableExercisesForProgressQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLAvailableExercisesForProgressQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLAvailableExercisesForProgressQuery, TError, TData>(
      {
    queryKey: ['AvailableExercisesForProgress', variables],
    queryFn: fetchData<GQLAvailableExercisesForProgressQuery, GQLAvailableExercisesForProgressQueryVariables>(AvailableExercisesForProgressDocument, variables),
    ...options
  }
    )};

useAvailableExercisesForProgressQuery.getKey = (variables: GQLAvailableExercisesForProgressQueryVariables) => ['AvailableExercisesForProgress', variables];

export const useInfiniteAvailableExercisesForProgressQuery = <
      TData = InfiniteData<GQLAvailableExercisesForProgressQuery>,
      TError = unknown
    >(
      variables: GQLAvailableExercisesForProgressQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLAvailableExercisesForProgressQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLAvailableExercisesForProgressQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLAvailableExercisesForProgressQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['AvailableExercisesForProgress.infinite', variables],
      queryFn: (metaData) => fetchData<GQLAvailableExercisesForProgressQuery, GQLAvailableExercisesForProgressQueryVariables>(AvailableExercisesForProgressDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteAvailableExercisesForProgressQuery.getKey = (variables: GQLAvailableExercisesForProgressQueryVariables) => ['AvailableExercisesForProgress.infinite', variables];


useAvailableExercisesForProgressQuery.fetcher = (variables: GQLAvailableExercisesForProgressQueryVariables, options?: RequestInit['headers']) => fetchData<GQLAvailableExercisesForProgressQuery, GQLAvailableExercisesForProgressQueryVariables>(AvailableExercisesForProgressDocument, variables, options);

export const SelectedExercisesProgressDocument = `
    query SelectedExercisesProgress($userId: ID!, $exerciseIds: [ID!]!) {
  exercisesProgressByUser(userId: $userId) {
    baseExercise {
      id
      name
      muscleGroups {
        alias
        name
        groupSlug
        category {
          name
        }
      }
    }
    estimated1RMProgress {
      date
      average1RM
      detailedLogs {
        estimated1RM
        weight
        reps
      }
    }
    totalVolumeProgress {
      week
      totalVolume
      totalSets
    }
    averageRpe
    totalSets
    lastPerformed
  }
}
    `;

export const useSelectedExercisesProgressQuery = <
      TData = GQLSelectedExercisesProgressQuery,
      TError = unknown
    >(
      variables: GQLSelectedExercisesProgressQueryVariables,
      options?: Omit<UseQueryOptions<GQLSelectedExercisesProgressQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLSelectedExercisesProgressQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLSelectedExercisesProgressQuery, TError, TData>(
      {
    queryKey: ['SelectedExercisesProgress', variables],
    queryFn: fetchData<GQLSelectedExercisesProgressQuery, GQLSelectedExercisesProgressQueryVariables>(SelectedExercisesProgressDocument, variables),
    ...options
  }
    )};

useSelectedExercisesProgressQuery.getKey = (variables: GQLSelectedExercisesProgressQueryVariables) => ['SelectedExercisesProgress', variables];

export const useInfiniteSelectedExercisesProgressQuery = <
      TData = InfiniteData<GQLSelectedExercisesProgressQuery>,
      TError = unknown
    >(
      variables: GQLSelectedExercisesProgressQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLSelectedExercisesProgressQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLSelectedExercisesProgressQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLSelectedExercisesProgressQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['SelectedExercisesProgress.infinite', variables],
      queryFn: (metaData) => fetchData<GQLSelectedExercisesProgressQuery, GQLSelectedExercisesProgressQueryVariables>(SelectedExercisesProgressDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteSelectedExercisesProgressQuery.getKey = (variables: GQLSelectedExercisesProgressQueryVariables) => ['SelectedExercisesProgress.infinite', variables];


useSelectedExercisesProgressQuery.fetcher = (variables: GQLSelectedExercisesProgressQueryVariables, options?: RequestInit['headers']) => fetchData<GQLSelectedExercisesProgressQuery, GQLSelectedExercisesProgressQueryVariables>(SelectedExercisesProgressDocument, variables, options);

export const ResetUserLogsDocument = `
    mutation ResetUserLogs {
  resetUserLogs
}
    `;

export const useResetUserLogsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLResetUserLogsMutation, TError, GQLResetUserLogsMutationVariables, TContext>) => {
    
    return useMutation<GQLResetUserLogsMutation, TError, GQLResetUserLogsMutationVariables, TContext>(
      {
    mutationKey: ['ResetUserLogs'],
    mutationFn: (variables?: GQLResetUserLogsMutationVariables) => fetchData<GQLResetUserLogsMutation, GQLResetUserLogsMutationVariables>(ResetUserLogsDocument, variables)(),
    ...options
  }
    )};

useResetUserLogsMutation.getKey = () => ['ResetUserLogs'];


useResetUserLogsMutation.fetcher = (variables?: GQLResetUserLogsMutationVariables, options?: RequestInit['headers']) => fetchData<GQLResetUserLogsMutation, GQLResetUserLogsMutationVariables>(ResetUserLogsDocument, variables, options);

export const DeleteUserAccountDocument = `
    mutation DeleteUserAccount {
  deleteUserAccount
}
    `;

export const useDeleteUserAccountMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDeleteUserAccountMutation, TError, GQLDeleteUserAccountMutationVariables, TContext>) => {
    
    return useMutation<GQLDeleteUserAccountMutation, TError, GQLDeleteUserAccountMutationVariables, TContext>(
      {
    mutationKey: ['DeleteUserAccount'],
    mutationFn: (variables?: GQLDeleteUserAccountMutationVariables) => fetchData<GQLDeleteUserAccountMutation, GQLDeleteUserAccountMutationVariables>(DeleteUserAccountDocument, variables)(),
    ...options
  }
    )};

useDeleteUserAccountMutation.getKey = () => ['DeleteUserAccount'];


useDeleteUserAccountMutation.fetcher = (variables?: GQLDeleteUserAccountMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDeleteUserAccountMutation, GQLDeleteUserAccountMutationVariables>(DeleteUserAccountDocument, variables, options);

export const GetTrainingPlanPreviewByIdDocument = `
    query GetTrainingPlanPreviewById($id: ID!) {
  getTrainingPlanById(id: $id) {
    id
    title
    description
    isDemo
    rating
    totalReviews
    difficulty
    weekCount
    totalWorkouts
    assignedCount
    startDate
    active
    assignedTo {
      id
    }
    weeks {
      id
      weekNumber
      name
      description
      days {
        id
        dayOfWeek
        isRestDay
        workoutType
        exercises {
          id
          name
          restSeconds
          tempo
          warmupSets
          instructions
          order
          videoUrl
          muscleGroups {
            id
            groupSlug
            alias
          }
          sets {
            id
            order
            reps
            minReps
            maxReps
            weight
            rpe
          }
        }
      }
    }
  }
}
    `;

export const useGetTrainingPlanPreviewByIdQuery = <
      TData = GQLGetTrainingPlanPreviewByIdQuery,
      TError = unknown
    >(
      variables: GQLGetTrainingPlanPreviewByIdQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetTrainingPlanPreviewByIdQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetTrainingPlanPreviewByIdQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetTrainingPlanPreviewByIdQuery, TError, TData>(
      {
    queryKey: ['GetTrainingPlanPreviewById', variables],
    queryFn: fetchData<GQLGetTrainingPlanPreviewByIdQuery, GQLGetTrainingPlanPreviewByIdQueryVariables>(GetTrainingPlanPreviewByIdDocument, variables),
    ...options
  }
    )};

useGetTrainingPlanPreviewByIdQuery.getKey = (variables: GQLGetTrainingPlanPreviewByIdQueryVariables) => ['GetTrainingPlanPreviewById', variables];

export const useInfiniteGetTrainingPlanPreviewByIdQuery = <
      TData = InfiniteData<GQLGetTrainingPlanPreviewByIdQuery>,
      TError = unknown
    >(
      variables: GQLGetTrainingPlanPreviewByIdQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetTrainingPlanPreviewByIdQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetTrainingPlanPreviewByIdQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetTrainingPlanPreviewByIdQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetTrainingPlanPreviewById.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetTrainingPlanPreviewByIdQuery, GQLGetTrainingPlanPreviewByIdQueryVariables>(GetTrainingPlanPreviewByIdDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTrainingPlanPreviewByIdQuery.getKey = (variables: GQLGetTrainingPlanPreviewByIdQueryVariables) => ['GetTrainingPlanPreviewById.infinite', variables];


useGetTrainingPlanPreviewByIdQuery.fetcher = (variables: GQLGetTrainingPlanPreviewByIdQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetTrainingPlanPreviewByIdQuery, GQLGetTrainingPlanPreviewByIdQueryVariables>(GetTrainingPlanPreviewByIdDocument, variables, options);

export const FitspaceGetCurrentWorkoutIdDocument = `
    query FitspaceGetCurrentWorkoutId {
  getMyPlansOverview {
    activePlan {
      id
    }
  }
}
    `;

export const useFitspaceGetCurrentWorkoutIdQuery = <
      TData = GQLFitspaceGetCurrentWorkoutIdQuery,
      TError = unknown
    >(
      variables?: GQLFitspaceGetCurrentWorkoutIdQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitspaceGetCurrentWorkoutIdQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitspaceGetCurrentWorkoutIdQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitspaceGetCurrentWorkoutIdQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['FitspaceGetCurrentWorkoutId'] : ['FitspaceGetCurrentWorkoutId', variables],
    queryFn: fetchData<GQLFitspaceGetCurrentWorkoutIdQuery, GQLFitspaceGetCurrentWorkoutIdQueryVariables>(FitspaceGetCurrentWorkoutIdDocument, variables),
    ...options
  }
    )};

useFitspaceGetCurrentWorkoutIdQuery.getKey = (variables?: GQLFitspaceGetCurrentWorkoutIdQueryVariables) => variables === undefined ? ['FitspaceGetCurrentWorkoutId'] : ['FitspaceGetCurrentWorkoutId', variables];

export const useInfiniteFitspaceGetCurrentWorkoutIdQuery = <
      TData = InfiniteData<GQLFitspaceGetCurrentWorkoutIdQuery>,
      TError = unknown
    >(
      variables: GQLFitspaceGetCurrentWorkoutIdQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitspaceGetCurrentWorkoutIdQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitspaceGetCurrentWorkoutIdQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitspaceGetCurrentWorkoutIdQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['FitspaceGetCurrentWorkoutId.infinite'] : ['FitspaceGetCurrentWorkoutId.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitspaceGetCurrentWorkoutIdQuery, GQLFitspaceGetCurrentWorkoutIdQueryVariables>(FitspaceGetCurrentWorkoutIdDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitspaceGetCurrentWorkoutIdQuery.getKey = (variables?: GQLFitspaceGetCurrentWorkoutIdQueryVariables) => variables === undefined ? ['FitspaceGetCurrentWorkoutId.infinite'] : ['FitspaceGetCurrentWorkoutId.infinite', variables];


useFitspaceGetCurrentWorkoutIdQuery.fetcher = (variables?: GQLFitspaceGetCurrentWorkoutIdQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceGetCurrentWorkoutIdQuery, GQLFitspaceGetCurrentWorkoutIdQueryVariables>(FitspaceGetCurrentWorkoutIdDocument, variables, options);

export const FitspaceGetActivePlanIdDocument = `
    query FitspaceGetActivePlanId {
  getActivePlanId
}
    `;

export const useFitspaceGetActivePlanIdQuery = <
      TData = GQLFitspaceGetActivePlanIdQuery,
      TError = unknown
    >(
      variables?: GQLFitspaceGetActivePlanIdQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitspaceGetActivePlanIdQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitspaceGetActivePlanIdQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitspaceGetActivePlanIdQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['FitspaceGetActivePlanId'] : ['FitspaceGetActivePlanId', variables],
    queryFn: fetchData<GQLFitspaceGetActivePlanIdQuery, GQLFitspaceGetActivePlanIdQueryVariables>(FitspaceGetActivePlanIdDocument, variables),
    ...options
  }
    )};

useFitspaceGetActivePlanIdQuery.getKey = (variables?: GQLFitspaceGetActivePlanIdQueryVariables) => variables === undefined ? ['FitspaceGetActivePlanId'] : ['FitspaceGetActivePlanId', variables];

export const useInfiniteFitspaceGetActivePlanIdQuery = <
      TData = InfiniteData<GQLFitspaceGetActivePlanIdQuery>,
      TError = unknown
    >(
      variables: GQLFitspaceGetActivePlanIdQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitspaceGetActivePlanIdQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitspaceGetActivePlanIdQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitspaceGetActivePlanIdQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['FitspaceGetActivePlanId.infinite'] : ['FitspaceGetActivePlanId.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitspaceGetActivePlanIdQuery, GQLFitspaceGetActivePlanIdQueryVariables>(FitspaceGetActivePlanIdDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitspaceGetActivePlanIdQuery.getKey = (variables?: GQLFitspaceGetActivePlanIdQueryVariables) => variables === undefined ? ['FitspaceGetActivePlanId.infinite'] : ['FitspaceGetActivePlanId.infinite', variables];


useFitspaceGetActivePlanIdQuery.fetcher = (variables?: GQLFitspaceGetActivePlanIdQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceGetActivePlanIdQuery, GQLFitspaceGetActivePlanIdQueryVariables>(FitspaceGetActivePlanIdDocument, variables, options);

export const FitspaceGetWorkoutDocument = `
    query FitspaceGetWorkout($trainingId: ID!) {
  getWorkout(trainingId: $trainingId) {
    plan {
      id
      title
      description
      isPublic
      isTemplate
      isDraft
      startDate
      weeks {
        id
        weekNumber
        name
        description
        completedAt
        scheduledAt
        days {
          id
          dayOfWeek
          isRestDay
          workoutType
          startedAt
          completedAt
          scheduledAt
          duration
          exercises {
            id
            name
            restSeconds
            tempo
            warmupSets
            instructions
            additionalInstructions
            type
            order
            videoUrl
            completedAt
            isExtra
            substitutedBy {
              id
              name
              instructions
              additionalInstructions
              type
              videoUrl
              completedAt
              baseId
              sets {
                id
                order
                reps
                minReps
                maxReps
                weight
                rpe
                isExtra
                completedAt
                log {
                  id
                  weight
                  rpe
                  reps
                  createdAt
                }
              }
            }
            substitutes {
              id
              substitute {
                id
                name
              }
            }
            muscleGroups {
              id
              alias
              groupSlug
            }
            sets {
              id
              order
              reps
              minReps
              maxReps
              weight
              rpe
              isExtra
              completedAt
              log {
                id
                weight
                rpe
                reps
                createdAt
              }
            }
          }
        }
      }
    }
  }
}
    `;

export const useFitspaceGetWorkoutQuery = <
      TData = GQLFitspaceGetWorkoutQuery,
      TError = unknown
    >(
      variables: GQLFitspaceGetWorkoutQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitspaceGetWorkoutQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitspaceGetWorkoutQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitspaceGetWorkoutQuery, TError, TData>(
      {
    queryKey: ['FitspaceGetWorkout', variables],
    queryFn: fetchData<GQLFitspaceGetWorkoutQuery, GQLFitspaceGetWorkoutQueryVariables>(FitspaceGetWorkoutDocument, variables),
    ...options
  }
    )};

useFitspaceGetWorkoutQuery.getKey = (variables: GQLFitspaceGetWorkoutQueryVariables) => ['FitspaceGetWorkout', variables];

export const useInfiniteFitspaceGetWorkoutQuery = <
      TData = InfiniteData<GQLFitspaceGetWorkoutQuery>,
      TError = unknown
    >(
      variables: GQLFitspaceGetWorkoutQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitspaceGetWorkoutQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitspaceGetWorkoutQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitspaceGetWorkoutQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['FitspaceGetWorkout.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitspaceGetWorkoutQuery, GQLFitspaceGetWorkoutQueryVariables>(FitspaceGetWorkoutDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitspaceGetWorkoutQuery.getKey = (variables: GQLFitspaceGetWorkoutQueryVariables) => ['FitspaceGetWorkout.infinite', variables];


useFitspaceGetWorkoutQuery.fetcher = (variables: GQLFitspaceGetWorkoutQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceGetWorkoutQuery, GQLFitspaceGetWorkoutQueryVariables>(FitspaceGetWorkoutDocument, variables, options);

export const FitspaceGetExercisesDocument = `
    query FitspaceGetExercises {
  getExercises {
    publicExercises {
      id
      name
      description
      videoUrl
      equipment
      isPublic
      images {
        id
        url
        order
      }
      muscleGroups {
        id
        alias
        groupSlug
      }
      secondaryMuscleGroups {
        id
        alias
        groupSlug
      }
    }
    trainerExercises {
      id
      name
      description
      videoUrl
      equipment
      isPublic
      images {
        id
        url
        order
      }
      muscleGroups {
        id
        alias
        groupSlug
      }
      secondaryMuscleGroups {
        id
        alias
        groupSlug
      }
    }
  }
  muscleGroupCategories {
    id
    name
    slug
    muscles {
      id
      alias
      groupSlug
    }
  }
}
    `;

export const useFitspaceGetExercisesQuery = <
      TData = GQLFitspaceGetExercisesQuery,
      TError = unknown
    >(
      variables?: GQLFitspaceGetExercisesQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitspaceGetExercisesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitspaceGetExercisesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitspaceGetExercisesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['FitspaceGetExercises'] : ['FitspaceGetExercises', variables],
    queryFn: fetchData<GQLFitspaceGetExercisesQuery, GQLFitspaceGetExercisesQueryVariables>(FitspaceGetExercisesDocument, variables),
    ...options
  }
    )};

useFitspaceGetExercisesQuery.getKey = (variables?: GQLFitspaceGetExercisesQueryVariables) => variables === undefined ? ['FitspaceGetExercises'] : ['FitspaceGetExercises', variables];

export const useInfiniteFitspaceGetExercisesQuery = <
      TData = InfiniteData<GQLFitspaceGetExercisesQuery>,
      TError = unknown
    >(
      variables: GQLFitspaceGetExercisesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitspaceGetExercisesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitspaceGetExercisesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitspaceGetExercisesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['FitspaceGetExercises.infinite'] : ['FitspaceGetExercises.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitspaceGetExercisesQuery, GQLFitspaceGetExercisesQueryVariables>(FitspaceGetExercisesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitspaceGetExercisesQuery.getKey = (variables?: GQLFitspaceGetExercisesQueryVariables) => variables === undefined ? ['FitspaceGetExercises.infinite'] : ['FitspaceGetExercises.infinite', variables];


useFitspaceGetExercisesQuery.fetcher = (variables?: GQLFitspaceGetExercisesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceGetExercisesQuery, GQLFitspaceGetExercisesQueryVariables>(FitspaceGetExercisesDocument, variables, options);

export const FitspaceGetWorkoutInfoDocument = `
    query FitspaceGetWorkoutInfo($dayId: ID!) {
  getWorkoutInfo(dayId: $dayId) {
    id
    duration
  }
}
    `;

export const useFitspaceGetWorkoutInfoQuery = <
      TData = GQLFitspaceGetWorkoutInfoQuery,
      TError = unknown
    >(
      variables: GQLFitspaceGetWorkoutInfoQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitspaceGetWorkoutInfoQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitspaceGetWorkoutInfoQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitspaceGetWorkoutInfoQuery, TError, TData>(
      {
    queryKey: ['FitspaceGetWorkoutInfo', variables],
    queryFn: fetchData<GQLFitspaceGetWorkoutInfoQuery, GQLFitspaceGetWorkoutInfoQueryVariables>(FitspaceGetWorkoutInfoDocument, variables),
    ...options
  }
    )};

useFitspaceGetWorkoutInfoQuery.getKey = (variables: GQLFitspaceGetWorkoutInfoQueryVariables) => ['FitspaceGetWorkoutInfo', variables];

export const useInfiniteFitspaceGetWorkoutInfoQuery = <
      TData = InfiniteData<GQLFitspaceGetWorkoutInfoQuery>,
      TError = unknown
    >(
      variables: GQLFitspaceGetWorkoutInfoQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitspaceGetWorkoutInfoQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitspaceGetWorkoutInfoQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitspaceGetWorkoutInfoQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['FitspaceGetWorkoutInfo.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitspaceGetWorkoutInfoQuery, GQLFitspaceGetWorkoutInfoQueryVariables>(FitspaceGetWorkoutInfoDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitspaceGetWorkoutInfoQuery.getKey = (variables: GQLFitspaceGetWorkoutInfoQueryVariables) => ['FitspaceGetWorkoutInfo.infinite', variables];


useFitspaceGetWorkoutInfoQuery.fetcher = (variables: GQLFitspaceGetWorkoutInfoQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceGetWorkoutInfoQuery, GQLFitspaceGetWorkoutInfoQueryVariables>(FitspaceGetWorkoutInfoDocument, variables, options);

export const FitspaceGetAiExerciseSuggestionsDocument = `
    mutation FitspaceGetAiExerciseSuggestions($dayId: ID!) {
  getAiExerciseSuggestions(dayId: $dayId) {
    exercise {
      id
      name
      description
      videoUrl
      equipment
      isPublic
      muscleGroups {
        id
        alias
        groupSlug
      }
      secondaryMuscleGroups {
        id
        alias
        groupSlug
      }
    }
    sets {
      reps
      rpe
    }
    aiMeta {
      explanation
    }
  }
}
    `;

export const useFitspaceGetAiExerciseSuggestionsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceGetAiExerciseSuggestionsMutation, TError, GQLFitspaceGetAiExerciseSuggestionsMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceGetAiExerciseSuggestionsMutation, TError, GQLFitspaceGetAiExerciseSuggestionsMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceGetAiExerciseSuggestions'],
    mutationFn: (variables?: GQLFitspaceGetAiExerciseSuggestionsMutationVariables) => fetchData<GQLFitspaceGetAiExerciseSuggestionsMutation, GQLFitspaceGetAiExerciseSuggestionsMutationVariables>(FitspaceGetAiExerciseSuggestionsDocument, variables)(),
    ...options
  }
    )};

useFitspaceGetAiExerciseSuggestionsMutation.getKey = () => ['FitspaceGetAiExerciseSuggestions'];


useFitspaceGetAiExerciseSuggestionsMutation.fetcher = (variables: GQLFitspaceGetAiExerciseSuggestionsMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceGetAiExerciseSuggestionsMutation, GQLFitspaceGetAiExerciseSuggestionsMutationVariables>(FitspaceGetAiExerciseSuggestionsDocument, variables, options);

export const FitspaceAddAiExerciseToWorkoutDocument = `
    mutation FitspaceAddAiExerciseToWorkout($input: AddAiExerciseToWorkoutInput!) {
  addAiExerciseToWorkout(input: $input) {
    id
  }
}
    `;

export const useFitspaceAddAiExerciseToWorkoutMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceAddAiExerciseToWorkoutMutation, TError, GQLFitspaceAddAiExerciseToWorkoutMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceAddAiExerciseToWorkoutMutation, TError, GQLFitspaceAddAiExerciseToWorkoutMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceAddAiExerciseToWorkout'],
    mutationFn: (variables?: GQLFitspaceAddAiExerciseToWorkoutMutationVariables) => fetchData<GQLFitspaceAddAiExerciseToWorkoutMutation, GQLFitspaceAddAiExerciseToWorkoutMutationVariables>(FitspaceAddAiExerciseToWorkoutDocument, variables)(),
    ...options
  }
    )};

useFitspaceAddAiExerciseToWorkoutMutation.getKey = () => ['FitspaceAddAiExerciseToWorkout'];


useFitspaceAddAiExerciseToWorkoutMutation.fetcher = (variables: GQLFitspaceAddAiExerciseToWorkoutMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceAddAiExerciseToWorkoutMutation, GQLFitspaceAddAiExerciseToWorkoutMutationVariables>(FitspaceAddAiExerciseToWorkoutDocument, variables, options);

export const FitspaceMarkSetAsCompletedDocument = `
    mutation FitspaceMarkSetAsCompleted($setId: ID!, $completed: Boolean!) {
  markSetAsCompleted(setId: $setId, completed: $completed)
}
    `;

export const useFitspaceMarkSetAsCompletedMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceMarkSetAsCompletedMutation, TError, GQLFitspaceMarkSetAsCompletedMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceMarkSetAsCompletedMutation, TError, GQLFitspaceMarkSetAsCompletedMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceMarkSetAsCompleted'],
    mutationFn: (variables?: GQLFitspaceMarkSetAsCompletedMutationVariables) => fetchData<GQLFitspaceMarkSetAsCompletedMutation, GQLFitspaceMarkSetAsCompletedMutationVariables>(FitspaceMarkSetAsCompletedDocument, variables)(),
    ...options
  }
    )};

useFitspaceMarkSetAsCompletedMutation.getKey = () => ['FitspaceMarkSetAsCompleted'];


useFitspaceMarkSetAsCompletedMutation.fetcher = (variables: GQLFitspaceMarkSetAsCompletedMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceMarkSetAsCompletedMutation, GQLFitspaceMarkSetAsCompletedMutationVariables>(FitspaceMarkSetAsCompletedDocument, variables, options);

export const FitspaceMarkExerciseAsCompletedDocument = `
    mutation FitspaceMarkExerciseAsCompleted($exerciseId: ID!, $completed: Boolean!) {
  markExerciseAsCompleted(exerciseId: $exerciseId, completed: $completed)
}
    `;

export const useFitspaceMarkExerciseAsCompletedMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceMarkExerciseAsCompletedMutation, TError, GQLFitspaceMarkExerciseAsCompletedMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceMarkExerciseAsCompletedMutation, TError, GQLFitspaceMarkExerciseAsCompletedMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceMarkExerciseAsCompleted'],
    mutationFn: (variables?: GQLFitspaceMarkExerciseAsCompletedMutationVariables) => fetchData<GQLFitspaceMarkExerciseAsCompletedMutation, GQLFitspaceMarkExerciseAsCompletedMutationVariables>(FitspaceMarkExerciseAsCompletedDocument, variables)(),
    ...options
  }
    )};

useFitspaceMarkExerciseAsCompletedMutation.getKey = () => ['FitspaceMarkExerciseAsCompleted'];


useFitspaceMarkExerciseAsCompletedMutation.fetcher = (variables: GQLFitspaceMarkExerciseAsCompletedMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceMarkExerciseAsCompletedMutation, GQLFitspaceMarkExerciseAsCompletedMutationVariables>(FitspaceMarkExerciseAsCompletedDocument, variables, options);

export const FitspaceUpdateSetLogDocument = `
    mutation FitspaceUpdateSetLog($input: LogSetInput!) {
  updateSetLog(input: $input) {
    id
    reps
    weight
    rpe
  }
}
    `;

export const useFitspaceUpdateSetLogMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceUpdateSetLogMutation, TError, GQLFitspaceUpdateSetLogMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceUpdateSetLogMutation, TError, GQLFitspaceUpdateSetLogMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceUpdateSetLog'],
    mutationFn: (variables?: GQLFitspaceUpdateSetLogMutationVariables) => fetchData<GQLFitspaceUpdateSetLogMutation, GQLFitspaceUpdateSetLogMutationVariables>(FitspaceUpdateSetLogDocument, variables)(),
    ...options
  }
    )};

useFitspaceUpdateSetLogMutation.getKey = () => ['FitspaceUpdateSetLog'];


useFitspaceUpdateSetLogMutation.fetcher = (variables: GQLFitspaceUpdateSetLogMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceUpdateSetLogMutation, GQLFitspaceUpdateSetLogMutationVariables>(FitspaceUpdateSetLogDocument, variables, options);

export const FitspaceLogWorkoutProgressDocument = `
    mutation FitspaceLogWorkoutProgress($dayId: ID!, $tick: Int!) {
  logWorkoutProgress(dayId: $dayId, tick: $tick)
}
    `;

export const useFitspaceLogWorkoutProgressMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceLogWorkoutProgressMutation, TError, GQLFitspaceLogWorkoutProgressMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceLogWorkoutProgressMutation, TError, GQLFitspaceLogWorkoutProgressMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceLogWorkoutProgress'],
    mutationFn: (variables?: GQLFitspaceLogWorkoutProgressMutationVariables) => fetchData<GQLFitspaceLogWorkoutProgressMutation, GQLFitspaceLogWorkoutProgressMutationVariables>(FitspaceLogWorkoutProgressDocument, variables)(),
    ...options
  }
    )};

useFitspaceLogWorkoutProgressMutation.getKey = () => ['FitspaceLogWorkoutProgress'];


useFitspaceLogWorkoutProgressMutation.fetcher = (variables: GQLFitspaceLogWorkoutProgressMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceLogWorkoutProgressMutation, GQLFitspaceLogWorkoutProgressMutationVariables>(FitspaceLogWorkoutProgressDocument, variables, options);

export const FitspaceMarkWorkoutAsCompletedDocument = `
    mutation FitspaceMarkWorkoutAsCompleted($dayId: ID!) {
  markWorkoutAsCompleted(dayId: $dayId)
}
    `;

export const useFitspaceMarkWorkoutAsCompletedMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceMarkWorkoutAsCompletedMutation, TError, GQLFitspaceMarkWorkoutAsCompletedMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceMarkWorkoutAsCompletedMutation, TError, GQLFitspaceMarkWorkoutAsCompletedMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceMarkWorkoutAsCompleted'],
    mutationFn: (variables?: GQLFitspaceMarkWorkoutAsCompletedMutationVariables) => fetchData<GQLFitspaceMarkWorkoutAsCompletedMutation, GQLFitspaceMarkWorkoutAsCompletedMutationVariables>(FitspaceMarkWorkoutAsCompletedDocument, variables)(),
    ...options
  }
    )};

useFitspaceMarkWorkoutAsCompletedMutation.getKey = () => ['FitspaceMarkWorkoutAsCompleted'];


useFitspaceMarkWorkoutAsCompletedMutation.fetcher = (variables: GQLFitspaceMarkWorkoutAsCompletedMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceMarkWorkoutAsCompletedMutation, GQLFitspaceMarkWorkoutAsCompletedMutationVariables>(FitspaceMarkWorkoutAsCompletedDocument, variables, options);

export const FitspaceAddExercisesToWorkoutDocument = `
    mutation FitspaceAddExercisesToWorkout($input: AddExercisesToWorkoutInput!) {
  addExercisesToWorkout(input: $input) {
    id
  }
}
    `;

export const useFitspaceAddExercisesToWorkoutMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceAddExercisesToWorkoutMutation, TError, GQLFitspaceAddExercisesToWorkoutMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceAddExercisesToWorkoutMutation, TError, GQLFitspaceAddExercisesToWorkoutMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceAddExercisesToWorkout'],
    mutationFn: (variables?: GQLFitspaceAddExercisesToWorkoutMutationVariables) => fetchData<GQLFitspaceAddExercisesToWorkoutMutation, GQLFitspaceAddExercisesToWorkoutMutationVariables>(FitspaceAddExercisesToWorkoutDocument, variables)(),
    ...options
  }
    )};

useFitspaceAddExercisesToWorkoutMutation.getKey = () => ['FitspaceAddExercisesToWorkout'];


useFitspaceAddExercisesToWorkoutMutation.fetcher = (variables: GQLFitspaceAddExercisesToWorkoutMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceAddExercisesToWorkoutMutation, GQLFitspaceAddExercisesToWorkoutMutationVariables>(FitspaceAddExercisesToWorkoutDocument, variables, options);

export const FitspaceRemoveExerciseFromWorkoutDocument = `
    mutation FitspaceRemoveExerciseFromWorkout($exerciseId: ID!) {
  removeExerciseFromWorkout(exerciseId: $exerciseId)
}
    `;

export const useFitspaceRemoveExerciseFromWorkoutMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceRemoveExerciseFromWorkoutMutation, TError, GQLFitspaceRemoveExerciseFromWorkoutMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceRemoveExerciseFromWorkoutMutation, TError, GQLFitspaceRemoveExerciseFromWorkoutMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceRemoveExerciseFromWorkout'],
    mutationFn: (variables?: GQLFitspaceRemoveExerciseFromWorkoutMutationVariables) => fetchData<GQLFitspaceRemoveExerciseFromWorkoutMutation, GQLFitspaceRemoveExerciseFromWorkoutMutationVariables>(FitspaceRemoveExerciseFromWorkoutDocument, variables)(),
    ...options
  }
    )};

useFitspaceRemoveExerciseFromWorkoutMutation.getKey = () => ['FitspaceRemoveExerciseFromWorkout'];


useFitspaceRemoveExerciseFromWorkoutMutation.fetcher = (variables: GQLFitspaceRemoveExerciseFromWorkoutMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceRemoveExerciseFromWorkoutMutation, GQLFitspaceRemoveExerciseFromWorkoutMutationVariables>(FitspaceRemoveExerciseFromWorkoutDocument, variables, options);

export const FitspaceClearTodaysWorkoutDocument = `
    mutation FitspaceClearTodaysWorkout {
  clearTodaysWorkout
}
    `;

export const useFitspaceClearTodaysWorkoutMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceClearTodaysWorkoutMutation, TError, GQLFitspaceClearTodaysWorkoutMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceClearTodaysWorkoutMutation, TError, GQLFitspaceClearTodaysWorkoutMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceClearTodaysWorkout'],
    mutationFn: (variables?: GQLFitspaceClearTodaysWorkoutMutationVariables) => fetchData<GQLFitspaceClearTodaysWorkoutMutation, GQLFitspaceClearTodaysWorkoutMutationVariables>(FitspaceClearTodaysWorkoutDocument, variables)(),
    ...options
  }
    )};

useFitspaceClearTodaysWorkoutMutation.getKey = () => ['FitspaceClearTodaysWorkout'];


useFitspaceClearTodaysWorkoutMutation.fetcher = (variables?: GQLFitspaceClearTodaysWorkoutMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceClearTodaysWorkoutMutation, GQLFitspaceClearTodaysWorkoutMutationVariables>(FitspaceClearTodaysWorkoutDocument, variables, options);

export const FitspaceAddSetDocument = `
    mutation FitspaceAddSet($exerciseId: ID!) {
  addSet(exerciseId: $exerciseId) {
    id
  }
}
    `;

export const useFitspaceAddSetMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceAddSetMutation, TError, GQLFitspaceAddSetMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceAddSetMutation, TError, GQLFitspaceAddSetMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceAddSet'],
    mutationFn: (variables?: GQLFitspaceAddSetMutationVariables) => fetchData<GQLFitspaceAddSetMutation, GQLFitspaceAddSetMutationVariables>(FitspaceAddSetDocument, variables)(),
    ...options
  }
    )};

useFitspaceAddSetMutation.getKey = () => ['FitspaceAddSet'];


useFitspaceAddSetMutation.fetcher = (variables: GQLFitspaceAddSetMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceAddSetMutation, GQLFitspaceAddSetMutationVariables>(FitspaceAddSetDocument, variables, options);

export const FitspaceRemoveSetDocument = `
    mutation FitspaceRemoveSet($setId: ID!) {
  removeSet(setId: $setId)
}
    `;

export const useFitspaceRemoveSetMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceRemoveSetMutation, TError, GQLFitspaceRemoveSetMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceRemoveSetMutation, TError, GQLFitspaceRemoveSetMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceRemoveSet'],
    mutationFn: (variables?: GQLFitspaceRemoveSetMutationVariables) => fetchData<GQLFitspaceRemoveSetMutation, GQLFitspaceRemoveSetMutationVariables>(FitspaceRemoveSetDocument, variables)(),
    ...options
  }
    )};

useFitspaceRemoveSetMutation.getKey = () => ['FitspaceRemoveSet'];


useFitspaceRemoveSetMutation.fetcher = (variables: GQLFitspaceRemoveSetMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceRemoveSetMutation, GQLFitspaceRemoveSetMutationVariables>(FitspaceRemoveSetDocument, variables, options);

export const FitspaceSwapExerciseDocument = `
    mutation FitspaceSwapExercise($exerciseId: ID!, $substituteId: ID!) {
  swapExercise(exerciseId: $exerciseId, substituteId: $substituteId) {
    id
  }
}
    `;

export const useFitspaceSwapExerciseMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceSwapExerciseMutation, TError, GQLFitspaceSwapExerciseMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceSwapExerciseMutation, TError, GQLFitspaceSwapExerciseMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceSwapExercise'],
    mutationFn: (variables?: GQLFitspaceSwapExerciseMutationVariables) => fetchData<GQLFitspaceSwapExerciseMutation, GQLFitspaceSwapExerciseMutationVariables>(FitspaceSwapExerciseDocument, variables)(),
    ...options
  }
    )};

useFitspaceSwapExerciseMutation.getKey = () => ['FitspaceSwapExercise'];


useFitspaceSwapExerciseMutation.fetcher = (variables: GQLFitspaceSwapExerciseMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceSwapExerciseMutation, GQLFitspaceSwapExerciseMutationVariables>(FitspaceSwapExerciseDocument, variables, options);

export const QuickWorkoutExercisesDocument = `
    query QuickWorkoutExercises($where: ExerciseWhereInput) {
  publicExercises(where: $where) {
    id
    name
    description
    videoUrl
    equipment
    type
    description
    images {
      id
      url
      order
    }
    muscleGroups {
      id
      name
      alias
      groupSlug
    }
    secondaryMuscleGroups {
      id
      name
      alias
      groupSlug
    }
  }
  publicExercises(where: $where) {
    id
    name
    description
    videoUrl
    equipment
    type
    description
    images {
      id
      url
      order
    }
    muscleGroups {
      id
      name
      alias
      groupSlug
    }
    secondaryMuscleGroups {
      id
      name
      alias
      groupSlug
    }
  }
}
    `;

export const useQuickWorkoutExercisesQuery = <
      TData = GQLQuickWorkoutExercisesQuery,
      TError = unknown
    >(
      variables?: GQLQuickWorkoutExercisesQueryVariables,
      options?: Omit<UseQueryOptions<GQLQuickWorkoutExercisesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLQuickWorkoutExercisesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLQuickWorkoutExercisesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['QuickWorkoutExercises'] : ['QuickWorkoutExercises', variables],
    queryFn: fetchData<GQLQuickWorkoutExercisesQuery, GQLQuickWorkoutExercisesQueryVariables>(QuickWorkoutExercisesDocument, variables),
    ...options
  }
    )};

useQuickWorkoutExercisesQuery.getKey = (variables?: GQLQuickWorkoutExercisesQueryVariables) => variables === undefined ? ['QuickWorkoutExercises'] : ['QuickWorkoutExercises', variables];

export const useInfiniteQuickWorkoutExercisesQuery = <
      TData = InfiniteData<GQLQuickWorkoutExercisesQuery>,
      TError = unknown
    >(
      variables: GQLQuickWorkoutExercisesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLQuickWorkoutExercisesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLQuickWorkoutExercisesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLQuickWorkoutExercisesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['QuickWorkoutExercises.infinite'] : ['QuickWorkoutExercises.infinite', variables],
      queryFn: (metaData) => fetchData<GQLQuickWorkoutExercisesQuery, GQLQuickWorkoutExercisesQueryVariables>(QuickWorkoutExercisesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteQuickWorkoutExercisesQuery.getKey = (variables?: GQLQuickWorkoutExercisesQueryVariables) => variables === undefined ? ['QuickWorkoutExercises.infinite'] : ['QuickWorkoutExercises.infinite', variables];


useQuickWorkoutExercisesQuery.fetcher = (variables?: GQLQuickWorkoutExercisesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLQuickWorkoutExercisesQuery, GQLQuickWorkoutExercisesQueryVariables>(QuickWorkoutExercisesDocument, variables, options);

export const FitspaceGetUserQuickWorkoutPlanDocument = `
    query FitspaceGetUserQuickWorkoutPlan {
  getQuickWorkoutPlan {
    id
    title
    weeks {
      id
      scheduledAt
      days {
        id
        dayOfWeek
        isRestDay
        scheduledAt
        exercises {
          id
          name
          baseId
          order
          completedAt
          equipment
          images {
            id
            url
            order
          }
          muscleGroups {
            id
            name
            alias
            groupSlug
          }
          sets {
            id
            order
            reps
            minReps
            maxReps
            weight
            rpe
          }
        }
      }
    }
  }
}
    `;

export const useFitspaceGetUserQuickWorkoutPlanQuery = <
      TData = GQLFitspaceGetUserQuickWorkoutPlanQuery,
      TError = unknown
    >(
      variables?: GQLFitspaceGetUserQuickWorkoutPlanQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitspaceGetUserQuickWorkoutPlanQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitspaceGetUserQuickWorkoutPlanQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitspaceGetUserQuickWorkoutPlanQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['FitspaceGetUserQuickWorkoutPlan'] : ['FitspaceGetUserQuickWorkoutPlan', variables],
    queryFn: fetchData<GQLFitspaceGetUserQuickWorkoutPlanQuery, GQLFitspaceGetUserQuickWorkoutPlanQueryVariables>(FitspaceGetUserQuickWorkoutPlanDocument, variables),
    ...options
  }
    )};

useFitspaceGetUserQuickWorkoutPlanQuery.getKey = (variables?: GQLFitspaceGetUserQuickWorkoutPlanQueryVariables) => variables === undefined ? ['FitspaceGetUserQuickWorkoutPlan'] : ['FitspaceGetUserQuickWorkoutPlan', variables];

export const useInfiniteFitspaceGetUserQuickWorkoutPlanQuery = <
      TData = InfiniteData<GQLFitspaceGetUserQuickWorkoutPlanQuery>,
      TError = unknown
    >(
      variables: GQLFitspaceGetUserQuickWorkoutPlanQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitspaceGetUserQuickWorkoutPlanQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitspaceGetUserQuickWorkoutPlanQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitspaceGetUserQuickWorkoutPlanQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['FitspaceGetUserQuickWorkoutPlan.infinite'] : ['FitspaceGetUserQuickWorkoutPlan.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitspaceGetUserQuickWorkoutPlanQuery, GQLFitspaceGetUserQuickWorkoutPlanQueryVariables>(FitspaceGetUserQuickWorkoutPlanDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitspaceGetUserQuickWorkoutPlanQuery.getKey = (variables?: GQLFitspaceGetUserQuickWorkoutPlanQueryVariables) => variables === undefined ? ['FitspaceGetUserQuickWorkoutPlan.infinite'] : ['FitspaceGetUserQuickWorkoutPlan.infinite', variables];


useFitspaceGetUserQuickWorkoutPlanQuery.fetcher = (variables?: GQLFitspaceGetUserQuickWorkoutPlanQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceGetUserQuickWorkoutPlanQuery, GQLFitspaceGetUserQuickWorkoutPlanQueryVariables>(FitspaceGetUserQuickWorkoutPlanDocument, variables, options);

export const FitspaceCreateQuickWorkoutDocument = `
    mutation FitspaceCreateQuickWorkout($input: CreateQuickWorkoutInput!) {
  createQuickWorkout(input: $input) {
    id
    title
    isDraft
    weeks {
      id
      weekNumber
      days {
        id
        dayOfWeek
        isRestDay
        scheduledAt
        exercises {
          id
          name
          order
          isExtra
          baseId
          images {
            id
            url
            order
          }
          muscleGroups {
            id
            alias
            groupSlug
          }
          sets {
            id
            order
            minReps
            maxReps
            reps
            weight
            rpe
          }
        }
      }
    }
  }
}
    `;

export const useFitspaceCreateQuickWorkoutMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceCreateQuickWorkoutMutation, TError, GQLFitspaceCreateQuickWorkoutMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceCreateQuickWorkoutMutation, TError, GQLFitspaceCreateQuickWorkoutMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceCreateQuickWorkout'],
    mutationFn: (variables?: GQLFitspaceCreateQuickWorkoutMutationVariables) => fetchData<GQLFitspaceCreateQuickWorkoutMutation, GQLFitspaceCreateQuickWorkoutMutationVariables>(FitspaceCreateQuickWorkoutDocument, variables)(),
    ...options
  }
    )};

useFitspaceCreateQuickWorkoutMutation.getKey = () => ['FitspaceCreateQuickWorkout'];


useFitspaceCreateQuickWorkoutMutation.fetcher = (variables: GQLFitspaceCreateQuickWorkoutMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceCreateQuickWorkoutMutation, GQLFitspaceCreateQuickWorkoutMutationVariables>(FitspaceCreateQuickWorkoutDocument, variables, options);

export const FitspaceGenerateAiWorkoutDocument = `
    mutation FitspaceGenerateAiWorkout($input: GenerateAiWorkoutInput!) {
  generateAiWorkout(input: $input) {
    exercises {
      exercise {
        id
        name
        description
        videoUrl
        equipment
        muscleGroups {
          id
          alias
          groupSlug
        }
      }
      sets {
        reps
        rpe
      }
      order
    }
    totalDuration
  }
}
    `;

export const useFitspaceGenerateAiWorkoutMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceGenerateAiWorkoutMutation, TError, GQLFitspaceGenerateAiWorkoutMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceGenerateAiWorkoutMutation, TError, GQLFitspaceGenerateAiWorkoutMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceGenerateAiWorkout'],
    mutationFn: (variables?: GQLFitspaceGenerateAiWorkoutMutationVariables) => fetchData<GQLFitspaceGenerateAiWorkoutMutation, GQLFitspaceGenerateAiWorkoutMutationVariables>(FitspaceGenerateAiWorkoutDocument, variables)(),
    ...options
  }
    )};

useFitspaceGenerateAiWorkoutMutation.getKey = () => ['FitspaceGenerateAiWorkout'];


useFitspaceGenerateAiWorkoutMutation.fetcher = (variables: GQLFitspaceGenerateAiWorkoutMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceGenerateAiWorkoutMutation, GQLFitspaceGenerateAiWorkoutMutationVariables>(FitspaceGenerateAiWorkoutDocument, variables, options);

export const CreateQuickWorkoutPlanDocument = `
    mutation CreateQuickWorkoutPlan($input: CreateTrainingPlanInput!) {
  createTrainingPlan(input: $input) {
    id
    success
  }
}
    `;

export const useCreateQuickWorkoutPlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateQuickWorkoutPlanMutation, TError, GQLCreateQuickWorkoutPlanMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateQuickWorkoutPlanMutation, TError, GQLCreateQuickWorkoutPlanMutationVariables, TContext>(
      {
    mutationKey: ['CreateQuickWorkoutPlan'],
    mutationFn: (variables?: GQLCreateQuickWorkoutPlanMutationVariables) => fetchData<GQLCreateQuickWorkoutPlanMutation, GQLCreateQuickWorkoutPlanMutationVariables>(CreateQuickWorkoutPlanDocument, variables)(),
    ...options
  }
    )};

useCreateQuickWorkoutPlanMutation.getKey = () => ['CreateQuickWorkoutPlan'];


useCreateQuickWorkoutPlanMutation.fetcher = (variables: GQLCreateQuickWorkoutPlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateQuickWorkoutPlanMutation, GQLCreateQuickWorkoutPlanMutationVariables>(CreateQuickWorkoutPlanDocument, variables, options);

export const AssignQuickWorkoutPlanDocument = `
    mutation AssignQuickWorkoutPlan($input: AssignTrainingPlanToClientInput!) {
  assignTrainingPlanToClient(input: $input)
}
    `;

export const useAssignQuickWorkoutPlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAssignQuickWorkoutPlanMutation, TError, GQLAssignQuickWorkoutPlanMutationVariables, TContext>) => {
    
    return useMutation<GQLAssignQuickWorkoutPlanMutation, TError, GQLAssignQuickWorkoutPlanMutationVariables, TContext>(
      {
    mutationKey: ['AssignQuickWorkoutPlan'],
    mutationFn: (variables?: GQLAssignQuickWorkoutPlanMutationVariables) => fetchData<GQLAssignQuickWorkoutPlanMutation, GQLAssignQuickWorkoutPlanMutationVariables>(AssignQuickWorkoutPlanDocument, variables)(),
    ...options
  }
    )};

useAssignQuickWorkoutPlanMutation.getKey = () => ['AssignQuickWorkoutPlan'];


useAssignQuickWorkoutPlanMutation.fetcher = (variables: GQLAssignQuickWorkoutPlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAssignQuickWorkoutPlanMutation, GQLAssignQuickWorkoutPlanMutationVariables>(AssignQuickWorkoutPlanDocument, variables, options);

export const AddExercisesToQuickWorkoutDocument = `
    mutation AddExercisesToQuickWorkout($exercises: [QuickWorkoutExerciseInput!]!) {
  addExercisesToQuickWorkout(exercises: $exercises) {
    id
  }
}
    `;

export const useAddExercisesToQuickWorkoutMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAddExercisesToQuickWorkoutMutation, TError, GQLAddExercisesToQuickWorkoutMutationVariables, TContext>) => {
    
    return useMutation<GQLAddExercisesToQuickWorkoutMutation, TError, GQLAddExercisesToQuickWorkoutMutationVariables, TContext>(
      {
    mutationKey: ['AddExercisesToQuickWorkout'],
    mutationFn: (variables?: GQLAddExercisesToQuickWorkoutMutationVariables) => fetchData<GQLAddExercisesToQuickWorkoutMutation, GQLAddExercisesToQuickWorkoutMutationVariables>(AddExercisesToQuickWorkoutDocument, variables)(),
    ...options
  }
    )};

useAddExercisesToQuickWorkoutMutation.getKey = () => ['AddExercisesToQuickWorkout'];


useAddExercisesToQuickWorkoutMutation.fetcher = (variables: GQLAddExercisesToQuickWorkoutMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAddExercisesToQuickWorkoutMutation, GQLAddExercisesToQuickWorkoutMutationVariables>(AddExercisesToQuickWorkoutDocument, variables, options);

export const FitspaceAddExercisesToQuickWorkoutDocument = `
    mutation FitspaceAddExercisesToQuickWorkout($exercises: [QuickWorkoutExerciseInput!]!) {
  addExercisesToQuickWorkout(exercises: $exercises) {
    id
    title
    isDraft
    weeks {
      id
      weekNumber
      days {
        id
        dayOfWeek
        isRestDay
        scheduledAt
        exercises {
          id
          name
          order
          isExtra
          baseId
          muscleGroups {
            id
            alias
            groupSlug
          }
          sets {
            id
            order
            minReps
            maxReps
            reps
            weight
            rpe
          }
        }
      }
    }
  }
}
    `;

export const useFitspaceAddExercisesToQuickWorkoutMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLFitspaceAddExercisesToQuickWorkoutMutation, TError, GQLFitspaceAddExercisesToQuickWorkoutMutationVariables, TContext>) => {
    
    return useMutation<GQLFitspaceAddExercisesToQuickWorkoutMutation, TError, GQLFitspaceAddExercisesToQuickWorkoutMutationVariables, TContext>(
      {
    mutationKey: ['FitspaceAddExercisesToQuickWorkout'],
    mutationFn: (variables?: GQLFitspaceAddExercisesToQuickWorkoutMutationVariables) => fetchData<GQLFitspaceAddExercisesToQuickWorkoutMutation, GQLFitspaceAddExercisesToQuickWorkoutMutationVariables>(FitspaceAddExercisesToQuickWorkoutDocument, variables)(),
    ...options
  }
    )};

useFitspaceAddExercisesToQuickWorkoutMutation.getKey = () => ['FitspaceAddExercisesToQuickWorkout'];


useFitspaceAddExercisesToQuickWorkoutMutation.fetcher = (variables: GQLFitspaceAddExercisesToQuickWorkoutMutationVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceAddExercisesToQuickWorkoutMutation, GQLFitspaceAddExercisesToQuickWorkoutMutationVariables>(FitspaceAddExercisesToQuickWorkoutDocument, variables, options);

export const GetClientsDocument = `
    query GetClients {
  myClients {
    id
    email
    firstName
    lastName
    image
    role
    updatedAt
    createdAt
    activePlan {
      id
      title
      description
      weekCount
      startDate
      endDate
      lastSessionActivity
      progress
    }
  }
}
    `;

export const useGetClientsQuery = <
      TData = GQLGetClientsQuery,
      TError = unknown
    >(
      variables?: GQLGetClientsQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetClientsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetClientsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetClientsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetClients'] : ['GetClients', variables],
    queryFn: fetchData<GQLGetClientsQuery, GQLGetClientsQueryVariables>(GetClientsDocument, variables),
    ...options
  }
    )};

useGetClientsQuery.getKey = (variables?: GQLGetClientsQueryVariables) => variables === undefined ? ['GetClients'] : ['GetClients', variables];

export const useInfiniteGetClientsQuery = <
      TData = InfiniteData<GQLGetClientsQuery>,
      TError = unknown
    >(
      variables: GQLGetClientsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetClientsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetClientsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetClientsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetClients.infinite'] : ['GetClients.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetClientsQuery, GQLGetClientsQueryVariables>(GetClientsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetClientsQuery.getKey = (variables?: GQLGetClientsQueryVariables) => variables === undefined ? ['GetClients.infinite'] : ['GetClients.infinite', variables];


useGetClientsQuery.fetcher = (variables?: GQLGetClientsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetClientsQuery, GQLGetClientsQueryVariables>(GetClientsDocument, variables, options);

export const CreateCoachingRequestDocument = `
    mutation CreateCoachingRequest($recipientEmail: String!, $message: String) {
  createCoachingRequest(recipientEmail: $recipientEmail, message: $message) {
    id
  }
}
    `;

export const useCreateCoachingRequestMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateCoachingRequestMutation, TError, GQLCreateCoachingRequestMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateCoachingRequestMutation, TError, GQLCreateCoachingRequestMutationVariables, TContext>(
      {
    mutationKey: ['CreateCoachingRequest'],
    mutationFn: (variables?: GQLCreateCoachingRequestMutationVariables) => fetchData<GQLCreateCoachingRequestMutation, GQLCreateCoachingRequestMutationVariables>(CreateCoachingRequestDocument, variables)(),
    ...options
  }
    )};

useCreateCoachingRequestMutation.getKey = () => ['CreateCoachingRequest'];


useCreateCoachingRequestMutation.fetcher = (variables: GQLCreateCoachingRequestMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateCoachingRequestMutation, GQLCreateCoachingRequestMutationVariables>(CreateCoachingRequestDocument, variables, options);

export const GetClientByIdDocument = `
    query GetClientById($id: ID!) {
  userPublic(id: $id) {
    id
    firstName
    lastName
    email
    phone
    image
    sex
    birthday
    goals
    currentWeight
    height
    allergies
  }
  getClientTrainingPlans(clientId: $id) {
    id
    title
    description
    weekCount
    startDate
    endDate
    active
    progress
    nextSession
  }
  getClientActivePlan(clientId: $id) {
    id
    title
    description
    weekCount
    startDate
    endDate
    active
    progress
    nextSession
    difficulty
    totalWorkouts
    currentWeekNumber
    completedWorkoutsDays
    adherence
    weeks {
      id
      name
      completedAt
      days {
        id
        dayOfWeek
        isRestDay
        workoutType
        completedAt
        duration
        exercises {
          id
          name
          sets {
            id
            order
            reps
            minReps
            maxReps
            weight
            rpe
            completedAt
            log {
              id
              reps
              weight
              rpe
            }
          }
        }
      }
    }
  }
  getClientMealPlans(clientId: $id) {
    id
    title
    description
    isDraft
    dailyCalories
    dailyProtein
    dailyCarbs
    dailyFat
    weekCount
    startDate
    endDate
    active
    assignedCount
    createdAt
    updatedAt
  }
}
    `;

export const useGetClientByIdQuery = <
      TData = GQLGetClientByIdQuery,
      TError = unknown
    >(
      variables: GQLGetClientByIdQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetClientByIdQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetClientByIdQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetClientByIdQuery, TError, TData>(
      {
    queryKey: ['GetClientById', variables],
    queryFn: fetchData<GQLGetClientByIdQuery, GQLGetClientByIdQueryVariables>(GetClientByIdDocument, variables),
    ...options
  }
    )};

useGetClientByIdQuery.getKey = (variables: GQLGetClientByIdQueryVariables) => ['GetClientById', variables];

export const useInfiniteGetClientByIdQuery = <
      TData = InfiniteData<GQLGetClientByIdQuery>,
      TError = unknown
    >(
      variables: GQLGetClientByIdQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetClientByIdQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetClientByIdQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetClientByIdQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetClientById.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetClientByIdQuery, GQLGetClientByIdQueryVariables>(GetClientByIdDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetClientByIdQuery.getKey = (variables: GQLGetClientByIdQueryVariables) => ['GetClientById.infinite', variables];


useGetClientByIdQuery.fetcher = (variables: GQLGetClientByIdQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetClientByIdQuery, GQLGetClientByIdQueryVariables>(GetClientByIdDocument, variables, options);

export const ClientBodyMeasuresDocument = `
    query ClientBodyMeasures($clientId: ID!) {
  clientBodyMeasures(clientId: $clientId) {
    id
    measuredAt
    weight
    chest
    waist
    hips
    neck
    bicepsLeft
    bicepsRight
    thighLeft
    thighRight
    calfLeft
    calfRight
    bodyFat
    notes
  }
}
    `;

export const useClientBodyMeasuresQuery = <
      TData = GQLClientBodyMeasuresQuery,
      TError = unknown
    >(
      variables: GQLClientBodyMeasuresQueryVariables,
      options?: Omit<UseQueryOptions<GQLClientBodyMeasuresQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLClientBodyMeasuresQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLClientBodyMeasuresQuery, TError, TData>(
      {
    queryKey: ['ClientBodyMeasures', variables],
    queryFn: fetchData<GQLClientBodyMeasuresQuery, GQLClientBodyMeasuresQueryVariables>(ClientBodyMeasuresDocument, variables),
    ...options
  }
    )};

useClientBodyMeasuresQuery.getKey = (variables: GQLClientBodyMeasuresQueryVariables) => ['ClientBodyMeasures', variables];

export const useInfiniteClientBodyMeasuresQuery = <
      TData = InfiniteData<GQLClientBodyMeasuresQuery>,
      TError = unknown
    >(
      variables: GQLClientBodyMeasuresQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLClientBodyMeasuresQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLClientBodyMeasuresQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLClientBodyMeasuresQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['ClientBodyMeasures.infinite', variables],
      queryFn: (metaData) => fetchData<GQLClientBodyMeasuresQuery, GQLClientBodyMeasuresQueryVariables>(ClientBodyMeasuresDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteClientBodyMeasuresQuery.getKey = (variables: GQLClientBodyMeasuresQueryVariables) => ['ClientBodyMeasures.infinite', variables];


useClientBodyMeasuresQuery.fetcher = (variables: GQLClientBodyMeasuresQueryVariables, options?: RequestInit['headers']) => fetchData<GQLClientBodyMeasuresQuery, GQLClientBodyMeasuresQueryVariables>(ClientBodyMeasuresDocument, variables, options);

export const ExercisesProgressByUserDocument = `
    query ExercisesProgressByUser($userId: ID!) {
  exercisesProgressByUser(userId: $userId) {
    baseExercise {
      id
      name
      muscleGroups {
        alias
        name
        groupSlug
        category {
          name
        }
      }
    }
    estimated1RMProgress {
      date
      average1RM
      detailedLogs {
        estimated1RM
        weight
        reps
      }
    }
    totalVolumeProgress {
      week
      totalVolume
      totalSets
    }
    averageRpe
    totalSets
    lastPerformed
  }
}
    `;

export const useExercisesProgressByUserQuery = <
      TData = GQLExercisesProgressByUserQuery,
      TError = unknown
    >(
      variables: GQLExercisesProgressByUserQueryVariables,
      options?: Omit<UseQueryOptions<GQLExercisesProgressByUserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLExercisesProgressByUserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLExercisesProgressByUserQuery, TError, TData>(
      {
    queryKey: ['ExercisesProgressByUser', variables],
    queryFn: fetchData<GQLExercisesProgressByUserQuery, GQLExercisesProgressByUserQueryVariables>(ExercisesProgressByUserDocument, variables),
    ...options
  }
    )};

useExercisesProgressByUserQuery.getKey = (variables: GQLExercisesProgressByUserQueryVariables) => ['ExercisesProgressByUser', variables];

export const useInfiniteExercisesProgressByUserQuery = <
      TData = InfiniteData<GQLExercisesProgressByUserQuery>,
      TError = unknown
    >(
      variables: GQLExercisesProgressByUserQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLExercisesProgressByUserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLExercisesProgressByUserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLExercisesProgressByUserQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['ExercisesProgressByUser.infinite', variables],
      queryFn: (metaData) => fetchData<GQLExercisesProgressByUserQuery, GQLExercisesProgressByUserQueryVariables>(ExercisesProgressByUserDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteExercisesProgressByUserQuery.getKey = (variables: GQLExercisesProgressByUserQueryVariables) => ['ExercisesProgressByUser.infinite', variables];


useExercisesProgressByUserQuery.fetcher = (variables: GQLExercisesProgressByUserQueryVariables, options?: RequestInit['headers']) => fetchData<GQLExercisesProgressByUserQuery, GQLExercisesProgressByUserQueryVariables>(ExercisesProgressByUserDocument, variables, options);

export const MyCollaborationInvitationsDocument = `
    query MyCollaborationInvitations {
  myCollaborationInvitations {
    id
    sender {
      id
      firstName
      lastName
      email
    }
    recipient {
      id
      firstName
      lastName
      email
    }
    status
    message
    createdAt
    updatedAt
  }
}
    `;

export const useMyCollaborationInvitationsQuery = <
      TData = GQLMyCollaborationInvitationsQuery,
      TError = unknown
    >(
      variables?: GQLMyCollaborationInvitationsQueryVariables,
      options?: Omit<UseQueryOptions<GQLMyCollaborationInvitationsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLMyCollaborationInvitationsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLMyCollaborationInvitationsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['MyCollaborationInvitations'] : ['MyCollaborationInvitations', variables],
    queryFn: fetchData<GQLMyCollaborationInvitationsQuery, GQLMyCollaborationInvitationsQueryVariables>(MyCollaborationInvitationsDocument, variables),
    ...options
  }
    )};

useMyCollaborationInvitationsQuery.getKey = (variables?: GQLMyCollaborationInvitationsQueryVariables) => variables === undefined ? ['MyCollaborationInvitations'] : ['MyCollaborationInvitations', variables];

export const useInfiniteMyCollaborationInvitationsQuery = <
      TData = InfiniteData<GQLMyCollaborationInvitationsQuery>,
      TError = unknown
    >(
      variables: GQLMyCollaborationInvitationsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLMyCollaborationInvitationsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLMyCollaborationInvitationsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLMyCollaborationInvitationsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['MyCollaborationInvitations.infinite'] : ['MyCollaborationInvitations.infinite', variables],
      queryFn: (metaData) => fetchData<GQLMyCollaborationInvitationsQuery, GQLMyCollaborationInvitationsQueryVariables>(MyCollaborationInvitationsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteMyCollaborationInvitationsQuery.getKey = (variables?: GQLMyCollaborationInvitationsQueryVariables) => variables === undefined ? ['MyCollaborationInvitations.infinite'] : ['MyCollaborationInvitations.infinite', variables];


useMyCollaborationInvitationsQuery.fetcher = (variables?: GQLMyCollaborationInvitationsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLMyCollaborationInvitationsQuery, GQLMyCollaborationInvitationsQueryVariables>(MyCollaborationInvitationsDocument, variables, options);

export const SentCollaborationInvitationsDocument = `
    query SentCollaborationInvitations {
  sentCollaborationInvitations {
    id
    sender {
      id
      firstName
      lastName
      email
    }
    recipient {
      id
      firstName
      lastName
      email
    }
    status
    message
    createdAt
    updatedAt
  }
}
    `;

export const useSentCollaborationInvitationsQuery = <
      TData = GQLSentCollaborationInvitationsQuery,
      TError = unknown
    >(
      variables?: GQLSentCollaborationInvitationsQueryVariables,
      options?: Omit<UseQueryOptions<GQLSentCollaborationInvitationsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLSentCollaborationInvitationsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLSentCollaborationInvitationsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['SentCollaborationInvitations'] : ['SentCollaborationInvitations', variables],
    queryFn: fetchData<GQLSentCollaborationInvitationsQuery, GQLSentCollaborationInvitationsQueryVariables>(SentCollaborationInvitationsDocument, variables),
    ...options
  }
    )};

useSentCollaborationInvitationsQuery.getKey = (variables?: GQLSentCollaborationInvitationsQueryVariables) => variables === undefined ? ['SentCollaborationInvitations'] : ['SentCollaborationInvitations', variables];

export const useInfiniteSentCollaborationInvitationsQuery = <
      TData = InfiniteData<GQLSentCollaborationInvitationsQuery>,
      TError = unknown
    >(
      variables: GQLSentCollaborationInvitationsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLSentCollaborationInvitationsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLSentCollaborationInvitationsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLSentCollaborationInvitationsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['SentCollaborationInvitations.infinite'] : ['SentCollaborationInvitations.infinite', variables],
      queryFn: (metaData) => fetchData<GQLSentCollaborationInvitationsQuery, GQLSentCollaborationInvitationsQueryVariables>(SentCollaborationInvitationsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteSentCollaborationInvitationsQuery.getKey = (variables?: GQLSentCollaborationInvitationsQueryVariables) => variables === undefined ? ['SentCollaborationInvitations.infinite'] : ['SentCollaborationInvitations.infinite', variables];


useSentCollaborationInvitationsQuery.fetcher = (variables?: GQLSentCollaborationInvitationsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLSentCollaborationInvitationsQuery, GQLSentCollaborationInvitationsQueryVariables>(SentCollaborationInvitationsDocument, variables, options);

export const SendCollaborationInvitationDocument = `
    mutation SendCollaborationInvitation($input: SendCollaborationInvitationInput!) {
  sendCollaborationInvitation(input: $input) {
    id
    sender {
      id
      firstName
      lastName
      email
    }
    recipient {
      id
      firstName
      lastName
      email
    }
    status
    message
    createdAt
    updatedAt
  }
}
    `;

export const useSendCollaborationInvitationMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLSendCollaborationInvitationMutation, TError, GQLSendCollaborationInvitationMutationVariables, TContext>) => {
    
    return useMutation<GQLSendCollaborationInvitationMutation, TError, GQLSendCollaborationInvitationMutationVariables, TContext>(
      {
    mutationKey: ['SendCollaborationInvitation'],
    mutationFn: (variables?: GQLSendCollaborationInvitationMutationVariables) => fetchData<GQLSendCollaborationInvitationMutation, GQLSendCollaborationInvitationMutationVariables>(SendCollaborationInvitationDocument, variables)(),
    ...options
  }
    )};

useSendCollaborationInvitationMutation.getKey = () => ['SendCollaborationInvitation'];


useSendCollaborationInvitationMutation.fetcher = (variables: GQLSendCollaborationInvitationMutationVariables, options?: RequestInit['headers']) => fetchData<GQLSendCollaborationInvitationMutation, GQLSendCollaborationInvitationMutationVariables>(SendCollaborationInvitationDocument, variables, options);

export const RespondToCollaborationInvitationDocument = `
    mutation RespondToCollaborationInvitation($input: RespondToCollaborationInvitationInput!) {
  respondToCollaborationInvitation(input: $input) {
    id
    sender {
      id
      firstName
      lastName
      email
    }
    recipient {
      id
      firstName
      lastName
      email
    }
    status
    message
    createdAt
    updatedAt
  }
}
    `;

export const useRespondToCollaborationInvitationMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRespondToCollaborationInvitationMutation, TError, GQLRespondToCollaborationInvitationMutationVariables, TContext>) => {
    
    return useMutation<GQLRespondToCollaborationInvitationMutation, TError, GQLRespondToCollaborationInvitationMutationVariables, TContext>(
      {
    mutationKey: ['RespondToCollaborationInvitation'],
    mutationFn: (variables?: GQLRespondToCollaborationInvitationMutationVariables) => fetchData<GQLRespondToCollaborationInvitationMutation, GQLRespondToCollaborationInvitationMutationVariables>(RespondToCollaborationInvitationDocument, variables)(),
    ...options
  }
    )};

useRespondToCollaborationInvitationMutation.getKey = () => ['RespondToCollaborationInvitation'];


useRespondToCollaborationInvitationMutation.fetcher = (variables: GQLRespondToCollaborationInvitationMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRespondToCollaborationInvitationMutation, GQLRespondToCollaborationInvitationMutationVariables>(RespondToCollaborationInvitationDocument, variables, options);

export const MyTrainingPlanCollaborationsDocument = `
    query MyTrainingPlanCollaborations {
  myTrainingPlanCollaborations {
    id
    trainingPlan {
      id
      title
    }
    addedBy {
      id
      firstName
      lastName
      email
    }
    permission
    createdAt
    updatedAt
  }
}
    `;

export const useMyTrainingPlanCollaborationsQuery = <
      TData = GQLMyTrainingPlanCollaborationsQuery,
      TError = unknown
    >(
      variables?: GQLMyTrainingPlanCollaborationsQueryVariables,
      options?: Omit<UseQueryOptions<GQLMyTrainingPlanCollaborationsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLMyTrainingPlanCollaborationsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLMyTrainingPlanCollaborationsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['MyTrainingPlanCollaborations'] : ['MyTrainingPlanCollaborations', variables],
    queryFn: fetchData<GQLMyTrainingPlanCollaborationsQuery, GQLMyTrainingPlanCollaborationsQueryVariables>(MyTrainingPlanCollaborationsDocument, variables),
    ...options
  }
    )};

useMyTrainingPlanCollaborationsQuery.getKey = (variables?: GQLMyTrainingPlanCollaborationsQueryVariables) => variables === undefined ? ['MyTrainingPlanCollaborations'] : ['MyTrainingPlanCollaborations', variables];

export const useInfiniteMyTrainingPlanCollaborationsQuery = <
      TData = InfiniteData<GQLMyTrainingPlanCollaborationsQuery>,
      TError = unknown
    >(
      variables: GQLMyTrainingPlanCollaborationsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLMyTrainingPlanCollaborationsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLMyTrainingPlanCollaborationsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLMyTrainingPlanCollaborationsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['MyTrainingPlanCollaborations.infinite'] : ['MyTrainingPlanCollaborations.infinite', variables],
      queryFn: (metaData) => fetchData<GQLMyTrainingPlanCollaborationsQuery, GQLMyTrainingPlanCollaborationsQueryVariables>(MyTrainingPlanCollaborationsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteMyTrainingPlanCollaborationsQuery.getKey = (variables?: GQLMyTrainingPlanCollaborationsQueryVariables) => variables === undefined ? ['MyTrainingPlanCollaborations.infinite'] : ['MyTrainingPlanCollaborations.infinite', variables];


useMyTrainingPlanCollaborationsQuery.fetcher = (variables?: GQLMyTrainingPlanCollaborationsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLMyTrainingPlanCollaborationsQuery, GQLMyTrainingPlanCollaborationsQueryVariables>(MyTrainingPlanCollaborationsDocument, variables, options);

export const MyMealPlanCollaborationsDocument = `
    query MyMealPlanCollaborations {
  myMealPlanCollaborations {
    id
    mealPlan {
      id
      title
    }
    addedBy {
      id
      firstName
      lastName
      email
    }
    permission
    createdAt
    updatedAt
  }
}
    `;

export const useMyMealPlanCollaborationsQuery = <
      TData = GQLMyMealPlanCollaborationsQuery,
      TError = unknown
    >(
      variables?: GQLMyMealPlanCollaborationsQueryVariables,
      options?: Omit<UseQueryOptions<GQLMyMealPlanCollaborationsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLMyMealPlanCollaborationsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLMyMealPlanCollaborationsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['MyMealPlanCollaborations'] : ['MyMealPlanCollaborations', variables],
    queryFn: fetchData<GQLMyMealPlanCollaborationsQuery, GQLMyMealPlanCollaborationsQueryVariables>(MyMealPlanCollaborationsDocument, variables),
    ...options
  }
    )};

useMyMealPlanCollaborationsQuery.getKey = (variables?: GQLMyMealPlanCollaborationsQueryVariables) => variables === undefined ? ['MyMealPlanCollaborations'] : ['MyMealPlanCollaborations', variables];

export const useInfiniteMyMealPlanCollaborationsQuery = <
      TData = InfiniteData<GQLMyMealPlanCollaborationsQuery>,
      TError = unknown
    >(
      variables: GQLMyMealPlanCollaborationsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLMyMealPlanCollaborationsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLMyMealPlanCollaborationsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLMyMealPlanCollaborationsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['MyMealPlanCollaborations.infinite'] : ['MyMealPlanCollaborations.infinite', variables],
      queryFn: (metaData) => fetchData<GQLMyMealPlanCollaborationsQuery, GQLMyMealPlanCollaborationsQueryVariables>(MyMealPlanCollaborationsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteMyMealPlanCollaborationsQuery.getKey = (variables?: GQLMyMealPlanCollaborationsQueryVariables) => variables === undefined ? ['MyMealPlanCollaborations.infinite'] : ['MyMealPlanCollaborations.infinite', variables];


useMyMealPlanCollaborationsQuery.fetcher = (variables?: GQLMyMealPlanCollaborationsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLMyMealPlanCollaborationsQuery, GQLMyMealPlanCollaborationsQueryVariables>(MyMealPlanCollaborationsDocument, variables, options);

export const RemoveTrainingPlanCollaboratorDocument = `
    mutation RemoveTrainingPlanCollaborator($input: RemoveTrainingPlanCollaboratorInput!) {
  removeTrainingPlanCollaborator(input: $input)
}
    `;

export const useRemoveTrainingPlanCollaboratorMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveTrainingPlanCollaboratorMutation, TError, GQLRemoveTrainingPlanCollaboratorMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveTrainingPlanCollaboratorMutation, TError, GQLRemoveTrainingPlanCollaboratorMutationVariables, TContext>(
      {
    mutationKey: ['RemoveTrainingPlanCollaborator'],
    mutationFn: (variables?: GQLRemoveTrainingPlanCollaboratorMutationVariables) => fetchData<GQLRemoveTrainingPlanCollaboratorMutation, GQLRemoveTrainingPlanCollaboratorMutationVariables>(RemoveTrainingPlanCollaboratorDocument, variables)(),
    ...options
  }
    )};

useRemoveTrainingPlanCollaboratorMutation.getKey = () => ['RemoveTrainingPlanCollaborator'];


useRemoveTrainingPlanCollaboratorMutation.fetcher = (variables: GQLRemoveTrainingPlanCollaboratorMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveTrainingPlanCollaboratorMutation, GQLRemoveTrainingPlanCollaboratorMutationVariables>(RemoveTrainingPlanCollaboratorDocument, variables, options);

export const RemoveMealPlanCollaboratorDocument = `
    mutation RemoveMealPlanCollaborator($input: RemoveMealPlanCollaboratorInput!) {
  removeMealPlanCollaborator(input: $input)
}
    `;

export const useRemoveMealPlanCollaboratorMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveMealPlanCollaboratorMutation, TError, GQLRemoveMealPlanCollaboratorMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveMealPlanCollaboratorMutation, TError, GQLRemoveMealPlanCollaboratorMutationVariables, TContext>(
      {
    mutationKey: ['RemoveMealPlanCollaborator'],
    mutationFn: (variables?: GQLRemoveMealPlanCollaboratorMutationVariables) => fetchData<GQLRemoveMealPlanCollaboratorMutation, GQLRemoveMealPlanCollaboratorMutationVariables>(RemoveMealPlanCollaboratorDocument, variables)(),
    ...options
  }
    )};

useRemoveMealPlanCollaboratorMutation.getKey = () => ['RemoveMealPlanCollaborator'];


useRemoveMealPlanCollaboratorMutation.fetcher = (variables: GQLRemoveMealPlanCollaboratorMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveMealPlanCollaboratorMutation, GQLRemoveMealPlanCollaboratorMutationVariables>(RemoveMealPlanCollaboratorDocument, variables, options);

export const MyTeamMembersDocument = `
    query MyTeamMembers {
  myTeamMembers {
    id
    user {
      id
      firstName
      lastName
      email
    }
    addedBy {
      id
      firstName
      lastName
      email
    }
    isCurrentUserSender
    createdAt
    updatedAt
  }
}
    `;

export const useMyTeamMembersQuery = <
      TData = GQLMyTeamMembersQuery,
      TError = unknown
    >(
      variables?: GQLMyTeamMembersQueryVariables,
      options?: Omit<UseQueryOptions<GQLMyTeamMembersQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLMyTeamMembersQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLMyTeamMembersQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['MyTeamMembers'] : ['MyTeamMembers', variables],
    queryFn: fetchData<GQLMyTeamMembersQuery, GQLMyTeamMembersQueryVariables>(MyTeamMembersDocument, variables),
    ...options
  }
    )};

useMyTeamMembersQuery.getKey = (variables?: GQLMyTeamMembersQueryVariables) => variables === undefined ? ['MyTeamMembers'] : ['MyTeamMembers', variables];

export const useInfiniteMyTeamMembersQuery = <
      TData = InfiniteData<GQLMyTeamMembersQuery>,
      TError = unknown
    >(
      variables: GQLMyTeamMembersQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLMyTeamMembersQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLMyTeamMembersQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLMyTeamMembersQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['MyTeamMembers.infinite'] : ['MyTeamMembers.infinite', variables],
      queryFn: (metaData) => fetchData<GQLMyTeamMembersQuery, GQLMyTeamMembersQueryVariables>(MyTeamMembersDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteMyTeamMembersQuery.getKey = (variables?: GQLMyTeamMembersQueryVariables) => variables === undefined ? ['MyTeamMembers.infinite'] : ['MyTeamMembers.infinite', variables];


useMyTeamMembersQuery.fetcher = (variables?: GQLMyTeamMembersQueryVariables, options?: RequestInit['headers']) => fetchData<GQLMyTeamMembersQuery, GQLMyTeamMembersQueryVariables>(MyTeamMembersDocument, variables, options);

export const MyPlanCollaboratorsDocument = `
    query MyPlanCollaborators {
  myPlanCollaborators {
    id
    collaborator {
      id
      firstName
      lastName
      email
    }
    addedBy {
      id
      firstName
      lastName
      email
    }
    permission
    planType
    planId
    planTitle
    createdAt
    updatedAt
  }
}
    `;

export const useMyPlanCollaboratorsQuery = <
      TData = GQLMyPlanCollaboratorsQuery,
      TError = unknown
    >(
      variables?: GQLMyPlanCollaboratorsQueryVariables,
      options?: Omit<UseQueryOptions<GQLMyPlanCollaboratorsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLMyPlanCollaboratorsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLMyPlanCollaboratorsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['MyPlanCollaborators'] : ['MyPlanCollaborators', variables],
    queryFn: fetchData<GQLMyPlanCollaboratorsQuery, GQLMyPlanCollaboratorsQueryVariables>(MyPlanCollaboratorsDocument, variables),
    ...options
  }
    )};

useMyPlanCollaboratorsQuery.getKey = (variables?: GQLMyPlanCollaboratorsQueryVariables) => variables === undefined ? ['MyPlanCollaborators'] : ['MyPlanCollaborators', variables];

export const useInfiniteMyPlanCollaboratorsQuery = <
      TData = InfiniteData<GQLMyPlanCollaboratorsQuery>,
      TError = unknown
    >(
      variables: GQLMyPlanCollaboratorsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLMyPlanCollaboratorsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLMyPlanCollaboratorsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLMyPlanCollaboratorsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['MyPlanCollaborators.infinite'] : ['MyPlanCollaborators.infinite', variables],
      queryFn: (metaData) => fetchData<GQLMyPlanCollaboratorsQuery, GQLMyPlanCollaboratorsQueryVariables>(MyPlanCollaboratorsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteMyPlanCollaboratorsQuery.getKey = (variables?: GQLMyPlanCollaboratorsQueryVariables) => variables === undefined ? ['MyPlanCollaborators.infinite'] : ['MyPlanCollaborators.infinite', variables];


useMyPlanCollaboratorsQuery.fetcher = (variables?: GQLMyPlanCollaboratorsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLMyPlanCollaboratorsQuery, GQLMyPlanCollaboratorsQueryVariables>(MyPlanCollaboratorsDocument, variables, options);

export const UpdateTrainingPlanCollaboratorPermissionDocument = `
    mutation UpdateTrainingPlanCollaboratorPermission($input: UpdateTrainingPlanCollaboratorPermissionInput!) {
  updateTrainingPlanCollaboratorPermission(input: $input) {
    id
    permission
  }
}
    `;

export const useUpdateTrainingPlanCollaboratorPermissionMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateTrainingPlanCollaboratorPermissionMutation, TError, GQLUpdateTrainingPlanCollaboratorPermissionMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateTrainingPlanCollaboratorPermissionMutation, TError, GQLUpdateTrainingPlanCollaboratorPermissionMutationVariables, TContext>(
      {
    mutationKey: ['UpdateTrainingPlanCollaboratorPermission'],
    mutationFn: (variables?: GQLUpdateTrainingPlanCollaboratorPermissionMutationVariables) => fetchData<GQLUpdateTrainingPlanCollaboratorPermissionMutation, GQLUpdateTrainingPlanCollaboratorPermissionMutationVariables>(UpdateTrainingPlanCollaboratorPermissionDocument, variables)(),
    ...options
  }
    )};

useUpdateTrainingPlanCollaboratorPermissionMutation.getKey = () => ['UpdateTrainingPlanCollaboratorPermission'];


useUpdateTrainingPlanCollaboratorPermissionMutation.fetcher = (variables: GQLUpdateTrainingPlanCollaboratorPermissionMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateTrainingPlanCollaboratorPermissionMutation, GQLUpdateTrainingPlanCollaboratorPermissionMutationVariables>(UpdateTrainingPlanCollaboratorPermissionDocument, variables, options);

export const UpdateMealPlanCollaboratorPermissionDocument = `
    mutation UpdateMealPlanCollaboratorPermission($input: UpdateMealPlanCollaboratorPermissionInput!) {
  updateMealPlanCollaboratorPermission(input: $input) {
    id
    permission
  }
}
    `;

export const useUpdateMealPlanCollaboratorPermissionMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateMealPlanCollaboratorPermissionMutation, TError, GQLUpdateMealPlanCollaboratorPermissionMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateMealPlanCollaboratorPermissionMutation, TError, GQLUpdateMealPlanCollaboratorPermissionMutationVariables, TContext>(
      {
    mutationKey: ['UpdateMealPlanCollaboratorPermission'],
    mutationFn: (variables?: GQLUpdateMealPlanCollaboratorPermissionMutationVariables) => fetchData<GQLUpdateMealPlanCollaboratorPermissionMutation, GQLUpdateMealPlanCollaboratorPermissionMutationVariables>(UpdateMealPlanCollaboratorPermissionDocument, variables)(),
    ...options
  }
    )};

useUpdateMealPlanCollaboratorPermissionMutation.getKey = () => ['UpdateMealPlanCollaboratorPermission'];


useUpdateMealPlanCollaboratorPermissionMutation.fetcher = (variables: GQLUpdateMealPlanCollaboratorPermissionMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateMealPlanCollaboratorPermissionMutation, GQLUpdateMealPlanCollaboratorPermissionMutationVariables>(UpdateMealPlanCollaboratorPermissionDocument, variables, options);

export const TrainingPlanCollaboratorsDocument = `
    query TrainingPlanCollaborators($trainingPlanId: ID!) {
  trainingPlanCollaborators(trainingPlanId: $trainingPlanId) {
    id
    collaborator {
      id
      firstName
      lastName
      email
    }
    permission
    createdAt
    updatedAt
  }
}
    `;

export const useTrainingPlanCollaboratorsQuery = <
      TData = GQLTrainingPlanCollaboratorsQuery,
      TError = unknown
    >(
      variables: GQLTrainingPlanCollaboratorsQueryVariables,
      options?: Omit<UseQueryOptions<GQLTrainingPlanCollaboratorsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLTrainingPlanCollaboratorsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLTrainingPlanCollaboratorsQuery, TError, TData>(
      {
    queryKey: ['TrainingPlanCollaborators', variables],
    queryFn: fetchData<GQLTrainingPlanCollaboratorsQuery, GQLTrainingPlanCollaboratorsQueryVariables>(TrainingPlanCollaboratorsDocument, variables),
    ...options
  }
    )};

useTrainingPlanCollaboratorsQuery.getKey = (variables: GQLTrainingPlanCollaboratorsQueryVariables) => ['TrainingPlanCollaborators', variables];

export const useInfiniteTrainingPlanCollaboratorsQuery = <
      TData = InfiniteData<GQLTrainingPlanCollaboratorsQuery>,
      TError = unknown
    >(
      variables: GQLTrainingPlanCollaboratorsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLTrainingPlanCollaboratorsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLTrainingPlanCollaboratorsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLTrainingPlanCollaboratorsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['TrainingPlanCollaborators.infinite', variables],
      queryFn: (metaData) => fetchData<GQLTrainingPlanCollaboratorsQuery, GQLTrainingPlanCollaboratorsQueryVariables>(TrainingPlanCollaboratorsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteTrainingPlanCollaboratorsQuery.getKey = (variables: GQLTrainingPlanCollaboratorsQueryVariables) => ['TrainingPlanCollaborators.infinite', variables];


useTrainingPlanCollaboratorsQuery.fetcher = (variables: GQLTrainingPlanCollaboratorsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLTrainingPlanCollaboratorsQuery, GQLTrainingPlanCollaboratorsQueryVariables>(TrainingPlanCollaboratorsDocument, variables, options);

export const MealPlanCollaboratorsDocument = `
    query MealPlanCollaborators($mealPlanId: ID!) {
  mealPlanCollaborators(mealPlanId: $mealPlanId) {
    id
    collaborator {
      id
      firstName
      lastName
      email
    }
    permission
    createdAt
    updatedAt
  }
}
    `;

export const useMealPlanCollaboratorsQuery = <
      TData = GQLMealPlanCollaboratorsQuery,
      TError = unknown
    >(
      variables: GQLMealPlanCollaboratorsQueryVariables,
      options?: Omit<UseQueryOptions<GQLMealPlanCollaboratorsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLMealPlanCollaboratorsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLMealPlanCollaboratorsQuery, TError, TData>(
      {
    queryKey: ['MealPlanCollaborators', variables],
    queryFn: fetchData<GQLMealPlanCollaboratorsQuery, GQLMealPlanCollaboratorsQueryVariables>(MealPlanCollaboratorsDocument, variables),
    ...options
  }
    )};

useMealPlanCollaboratorsQuery.getKey = (variables: GQLMealPlanCollaboratorsQueryVariables) => ['MealPlanCollaborators', variables];

export const useInfiniteMealPlanCollaboratorsQuery = <
      TData = InfiniteData<GQLMealPlanCollaboratorsQuery>,
      TError = unknown
    >(
      variables: GQLMealPlanCollaboratorsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLMealPlanCollaboratorsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLMealPlanCollaboratorsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLMealPlanCollaboratorsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['MealPlanCollaborators.infinite', variables],
      queryFn: (metaData) => fetchData<GQLMealPlanCollaboratorsQuery, GQLMealPlanCollaboratorsQueryVariables>(MealPlanCollaboratorsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteMealPlanCollaboratorsQuery.getKey = (variables: GQLMealPlanCollaboratorsQueryVariables) => ['MealPlanCollaborators.infinite', variables];


useMealPlanCollaboratorsQuery.fetcher = (variables: GQLMealPlanCollaboratorsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLMealPlanCollaboratorsQuery, GQLMealPlanCollaboratorsQueryVariables>(MealPlanCollaboratorsDocument, variables, options);

export const AddTrainingPlanCollaboratorDocument = `
    mutation AddTrainingPlanCollaborator($input: AddTrainingPlanCollaboratorInput!) {
  addTrainingPlanCollaborator(input: $input) {
    id
    collaborator {
      id
      firstName
      lastName
      email
    }
    permission
    createdAt
    updatedAt
  }
}
    `;

export const useAddTrainingPlanCollaboratorMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAddTrainingPlanCollaboratorMutation, TError, GQLAddTrainingPlanCollaboratorMutationVariables, TContext>) => {
    
    return useMutation<GQLAddTrainingPlanCollaboratorMutation, TError, GQLAddTrainingPlanCollaboratorMutationVariables, TContext>(
      {
    mutationKey: ['AddTrainingPlanCollaborator'],
    mutationFn: (variables?: GQLAddTrainingPlanCollaboratorMutationVariables) => fetchData<GQLAddTrainingPlanCollaboratorMutation, GQLAddTrainingPlanCollaboratorMutationVariables>(AddTrainingPlanCollaboratorDocument, variables)(),
    ...options
  }
    )};

useAddTrainingPlanCollaboratorMutation.getKey = () => ['AddTrainingPlanCollaborator'];


useAddTrainingPlanCollaboratorMutation.fetcher = (variables: GQLAddTrainingPlanCollaboratorMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAddTrainingPlanCollaboratorMutation, GQLAddTrainingPlanCollaboratorMutationVariables>(AddTrainingPlanCollaboratorDocument, variables, options);

export const AddMealPlanCollaboratorDocument = `
    mutation AddMealPlanCollaborator($input: AddMealPlanCollaboratorInput!) {
  addMealPlanCollaborator(input: $input) {
    id
    collaborator {
      id
      firstName
      lastName
      email
    }
    permission
    createdAt
    updatedAt
  }
}
    `;

export const useAddMealPlanCollaboratorMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAddMealPlanCollaboratorMutation, TError, GQLAddMealPlanCollaboratorMutationVariables, TContext>) => {
    
    return useMutation<GQLAddMealPlanCollaboratorMutation, TError, GQLAddMealPlanCollaboratorMutationVariables, TContext>(
      {
    mutationKey: ['AddMealPlanCollaborator'],
    mutationFn: (variables?: GQLAddMealPlanCollaboratorMutationVariables) => fetchData<GQLAddMealPlanCollaboratorMutation, GQLAddMealPlanCollaboratorMutationVariables>(AddMealPlanCollaboratorDocument, variables)(),
    ...options
  }
    )};

useAddMealPlanCollaboratorMutation.getKey = () => ['AddMealPlanCollaborator'];


useAddMealPlanCollaboratorMutation.fetcher = (variables: GQLAddMealPlanCollaboratorMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAddMealPlanCollaboratorMutation, GQLAddMealPlanCollaboratorMutationVariables>(AddMealPlanCollaboratorDocument, variables, options);

export const AllPlansWithPermissionsDocument = `
    query AllPlansWithPermissions($userId: ID!) {
  allPlansWithPermissions(userId: $userId) {
    id
    title
    planType
    description
    isTemplate
    createdAt
    currentPermission
    hasAccess
  }
}
    `;

export const useAllPlansWithPermissionsQuery = <
      TData = GQLAllPlansWithPermissionsQuery,
      TError = unknown
    >(
      variables: GQLAllPlansWithPermissionsQueryVariables,
      options?: Omit<UseQueryOptions<GQLAllPlansWithPermissionsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLAllPlansWithPermissionsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLAllPlansWithPermissionsQuery, TError, TData>(
      {
    queryKey: ['AllPlansWithPermissions', variables],
    queryFn: fetchData<GQLAllPlansWithPermissionsQuery, GQLAllPlansWithPermissionsQueryVariables>(AllPlansWithPermissionsDocument, variables),
    ...options
  }
    )};

useAllPlansWithPermissionsQuery.getKey = (variables: GQLAllPlansWithPermissionsQueryVariables) => ['AllPlansWithPermissions', variables];

export const useInfiniteAllPlansWithPermissionsQuery = <
      TData = InfiniteData<GQLAllPlansWithPermissionsQuery>,
      TError = unknown
    >(
      variables: GQLAllPlansWithPermissionsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLAllPlansWithPermissionsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLAllPlansWithPermissionsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLAllPlansWithPermissionsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['AllPlansWithPermissions.infinite', variables],
      queryFn: (metaData) => fetchData<GQLAllPlansWithPermissionsQuery, GQLAllPlansWithPermissionsQueryVariables>(AllPlansWithPermissionsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteAllPlansWithPermissionsQuery.getKey = (variables: GQLAllPlansWithPermissionsQueryVariables) => ['AllPlansWithPermissions.infinite', variables];


useAllPlansWithPermissionsQuery.fetcher = (variables: GQLAllPlansWithPermissionsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLAllPlansWithPermissionsQuery, GQLAllPlansWithPermissionsQueryVariables>(AllPlansWithPermissionsDocument, variables, options);

export const BulkUpdatePlanPermissionsDocument = `
    mutation BulkUpdatePlanPermissions($input: BulkUpdatePlanPermissionsInput!) {
  bulkUpdatePlanPermissions(input: $input) {
    id
    planId
    planTitle
    planType
    permission
    createdAt
    updatedAt
    collaborator {
      id
      firstName
      lastName
      email
    }
    addedBy {
      id
      firstName
      lastName
      email
    }
  }
}
    `;

export const useBulkUpdatePlanPermissionsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLBulkUpdatePlanPermissionsMutation, TError, GQLBulkUpdatePlanPermissionsMutationVariables, TContext>) => {
    
    return useMutation<GQLBulkUpdatePlanPermissionsMutation, TError, GQLBulkUpdatePlanPermissionsMutationVariables, TContext>(
      {
    mutationKey: ['BulkUpdatePlanPermissions'],
    mutationFn: (variables?: GQLBulkUpdatePlanPermissionsMutationVariables) => fetchData<GQLBulkUpdatePlanPermissionsMutation, GQLBulkUpdatePlanPermissionsMutationVariables>(BulkUpdatePlanPermissionsDocument, variables)(),
    ...options
  }
    )};

useBulkUpdatePlanPermissionsMutation.getKey = () => ['BulkUpdatePlanPermissions'];


useBulkUpdatePlanPermissionsMutation.fetcher = (variables: GQLBulkUpdatePlanPermissionsMutationVariables, options?: RequestInit['headers']) => fetchData<GQLBulkUpdatePlanPermissionsMutation, GQLBulkUpdatePlanPermissionsMutationVariables>(BulkUpdatePlanPermissionsDocument, variables, options);

export const TrainerDashboardUserDocument = `
    query TrainerDashboardUser {
  userWithAllData {
    id
    email
    name
    image
    role
    createdAt
    updatedAt
    profile {
      id
      firstName
      lastName
      phone
      birthday
      sex
      avatarUrl
      activityLevel
      goals
      bio
      createdAt
      updatedAt
      bodyMeasures {
        id
        measuredAt
        weight
        chest
        waist
        hips
        neck
        bicepsLeft
        bicepsRight
        thighLeft
        thighRight
        calfLeft
        calfRight
        bodyFat
        notes
      }
    }
    trainer {
      id
      email
      firstName
      lastName
      image
      role
      createdAt
      updatedAt
    }
    clients {
      id
      email
      firstName
      lastName
      image
      role
      createdAt
      updatedAt
    }
    sessions {
      id
      createdAt
      expiresAt
    }
  }
}
    `;

export const useTrainerDashboardUserQuery = <
      TData = GQLTrainerDashboardUserQuery,
      TError = unknown
    >(
      variables?: GQLTrainerDashboardUserQueryVariables,
      options?: Omit<UseQueryOptions<GQLTrainerDashboardUserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLTrainerDashboardUserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLTrainerDashboardUserQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['TrainerDashboardUser'] : ['TrainerDashboardUser', variables],
    queryFn: fetchData<GQLTrainerDashboardUserQuery, GQLTrainerDashboardUserQueryVariables>(TrainerDashboardUserDocument, variables),
    ...options
  }
    )};

useTrainerDashboardUserQuery.getKey = (variables?: GQLTrainerDashboardUserQueryVariables) => variables === undefined ? ['TrainerDashboardUser'] : ['TrainerDashboardUser', variables];

export const useInfiniteTrainerDashboardUserQuery = <
      TData = InfiniteData<GQLTrainerDashboardUserQuery>,
      TError = unknown
    >(
      variables: GQLTrainerDashboardUserQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLTrainerDashboardUserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLTrainerDashboardUserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLTrainerDashboardUserQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['TrainerDashboardUser.infinite'] : ['TrainerDashboardUser.infinite', variables],
      queryFn: (metaData) => fetchData<GQLTrainerDashboardUserQuery, GQLTrainerDashboardUserQueryVariables>(TrainerDashboardUserDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteTrainerDashboardUserQuery.getKey = (variables?: GQLTrainerDashboardUserQueryVariables) => variables === undefined ? ['TrainerDashboardUser.infinite'] : ['TrainerDashboardUser.infinite', variables];


useTrainerDashboardUserQuery.fetcher = (variables?: GQLTrainerDashboardUserQueryVariables, options?: RequestInit['headers']) => fetchData<GQLTrainerDashboardUserQuery, GQLTrainerDashboardUserQueryVariables>(TrainerDashboardUserDocument, variables, options);

export const BasicUserDocument = `
    query BasicUser {
  user {
    id
    email
    name
    image
    role
    createdAt
    updatedAt
  }
}
    `;

export const useBasicUserQuery = <
      TData = GQLBasicUserQuery,
      TError = unknown
    >(
      variables?: GQLBasicUserQueryVariables,
      options?: Omit<UseQueryOptions<GQLBasicUserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLBasicUserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLBasicUserQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['BasicUser'] : ['BasicUser', variables],
    queryFn: fetchData<GQLBasicUserQuery, GQLBasicUserQueryVariables>(BasicUserDocument, variables),
    ...options
  }
    )};

useBasicUserQuery.getKey = (variables?: GQLBasicUserQueryVariables) => variables === undefined ? ['BasicUser'] : ['BasicUser', variables];

export const useInfiniteBasicUserQuery = <
      TData = InfiniteData<GQLBasicUserQuery>,
      TError = unknown
    >(
      variables: GQLBasicUserQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLBasicUserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLBasicUserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLBasicUserQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['BasicUser.infinite'] : ['BasicUser.infinite', variables],
      queryFn: (metaData) => fetchData<GQLBasicUserQuery, GQLBasicUserQueryVariables>(BasicUserDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteBasicUserQuery.getKey = (variables?: GQLBasicUserQueryVariables) => variables === undefined ? ['BasicUser.infinite'] : ['BasicUser.infinite', variables];


useBasicUserQuery.fetcher = (variables?: GQLBasicUserQueryVariables, options?: RequestInit['headers']) => fetchData<GQLBasicUserQuery, GQLBasicUserQueryVariables>(BasicUserDocument, variables, options);

export const MuscleGroupCategoriesDocument = `
    query MuscleGroupCategories {
  muscleGroupCategories {
    id
    name
    slug
    muscles {
      id
      name
      alias
      groupSlug
      isPrimary
    }
  }
}
    `;

export const useMuscleGroupCategoriesQuery = <
      TData = GQLMuscleGroupCategoriesQuery,
      TError = unknown
    >(
      variables?: GQLMuscleGroupCategoriesQueryVariables,
      options?: Omit<UseQueryOptions<GQLMuscleGroupCategoriesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLMuscleGroupCategoriesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLMuscleGroupCategoriesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['MuscleGroupCategories'] : ['MuscleGroupCategories', variables],
    queryFn: fetchData<GQLMuscleGroupCategoriesQuery, GQLMuscleGroupCategoriesQueryVariables>(MuscleGroupCategoriesDocument, variables),
    ...options
  }
    )};

useMuscleGroupCategoriesQuery.getKey = (variables?: GQLMuscleGroupCategoriesQueryVariables) => variables === undefined ? ['MuscleGroupCategories'] : ['MuscleGroupCategories', variables];

export const useInfiniteMuscleGroupCategoriesQuery = <
      TData = InfiniteData<GQLMuscleGroupCategoriesQuery>,
      TError = unknown
    >(
      variables: GQLMuscleGroupCategoriesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLMuscleGroupCategoriesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLMuscleGroupCategoriesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLMuscleGroupCategoriesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['MuscleGroupCategories.infinite'] : ['MuscleGroupCategories.infinite', variables],
      queryFn: (metaData) => fetchData<GQLMuscleGroupCategoriesQuery, GQLMuscleGroupCategoriesQueryVariables>(MuscleGroupCategoriesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteMuscleGroupCategoriesQuery.getKey = (variables?: GQLMuscleGroupCategoriesQueryVariables) => variables === undefined ? ['MuscleGroupCategories.infinite'] : ['MuscleGroupCategories.infinite', variables];


useMuscleGroupCategoriesQuery.fetcher = (variables?: GQLMuscleGroupCategoriesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLMuscleGroupCategoriesQuery, GQLMuscleGroupCategoriesQueryVariables>(MuscleGroupCategoriesDocument, variables, options);

export const ExercisesBasicInfoDocument = `
    query ExercisesBasicInfo {
  userExercises {
    id
    name
  }
  publicExercises {
    id
    name
  }
}
    `;

export const useExercisesBasicInfoQuery = <
      TData = GQLExercisesBasicInfoQuery,
      TError = unknown
    >(
      variables?: GQLExercisesBasicInfoQueryVariables,
      options?: Omit<UseQueryOptions<GQLExercisesBasicInfoQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLExercisesBasicInfoQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLExercisesBasicInfoQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['ExercisesBasicInfo'] : ['ExercisesBasicInfo', variables],
    queryFn: fetchData<GQLExercisesBasicInfoQuery, GQLExercisesBasicInfoQueryVariables>(ExercisesBasicInfoDocument, variables),
    ...options
  }
    )};

useExercisesBasicInfoQuery.getKey = (variables?: GQLExercisesBasicInfoQueryVariables) => variables === undefined ? ['ExercisesBasicInfo'] : ['ExercisesBasicInfo', variables];

export const useInfiniteExercisesBasicInfoQuery = <
      TData = InfiniteData<GQLExercisesBasicInfoQuery>,
      TError = unknown
    >(
      variables: GQLExercisesBasicInfoQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLExercisesBasicInfoQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLExercisesBasicInfoQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLExercisesBasicInfoQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['ExercisesBasicInfo.infinite'] : ['ExercisesBasicInfo.infinite', variables],
      queryFn: (metaData) => fetchData<GQLExercisesBasicInfoQuery, GQLExercisesBasicInfoQueryVariables>(ExercisesBasicInfoDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteExercisesBasicInfoQuery.getKey = (variables?: GQLExercisesBasicInfoQueryVariables) => variables === undefined ? ['ExercisesBasicInfo.infinite'] : ['ExercisesBasicInfo.infinite', variables];


useExercisesBasicInfoQuery.fetcher = (variables?: GQLExercisesBasicInfoQueryVariables, options?: RequestInit['headers']) => fetchData<GQLExercisesBasicInfoQuery, GQLExercisesBasicInfoQueryVariables>(ExercisesBasicInfoDocument, variables, options);

export const TrainerExercisesDocument = `
    query TrainerExercises($where: ExerciseWhereInput) {
  userExercises(where: $where) {
    id
    name
    description
    videoUrl
    equipment
    isPublic
    videoUrl
    images {
      id
      url
      order
    }
    muscleGroups {
      id
      name
      alias
      groupSlug
    }
    secondaryMuscleGroups {
      id
      name
      alias
      groupSlug
    }
  }
  publicExercises(where: $where) {
    id
    name
    description
    videoUrl
    equipment
    isPublic
    images {
      id
      url
      order
    }
    muscleGroups {
      id
      name
      alias
      groupSlug
    }
    secondaryMuscleGroups {
      id
      name
      alias
      groupSlug
    }
  }
}
    `;

export const useTrainerExercisesQuery = <
      TData = GQLTrainerExercisesQuery,
      TError = unknown
    >(
      variables?: GQLTrainerExercisesQueryVariables,
      options?: Omit<UseQueryOptions<GQLTrainerExercisesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLTrainerExercisesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLTrainerExercisesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['TrainerExercises'] : ['TrainerExercises', variables],
    queryFn: fetchData<GQLTrainerExercisesQuery, GQLTrainerExercisesQueryVariables>(TrainerExercisesDocument, variables),
    ...options
  }
    )};

useTrainerExercisesQuery.getKey = (variables?: GQLTrainerExercisesQueryVariables) => variables === undefined ? ['TrainerExercises'] : ['TrainerExercises', variables];

export const useInfiniteTrainerExercisesQuery = <
      TData = InfiniteData<GQLTrainerExercisesQuery>,
      TError = unknown
    >(
      variables: GQLTrainerExercisesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLTrainerExercisesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLTrainerExercisesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLTrainerExercisesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['TrainerExercises.infinite'] : ['TrainerExercises.infinite', variables],
      queryFn: (metaData) => fetchData<GQLTrainerExercisesQuery, GQLTrainerExercisesQueryVariables>(TrainerExercisesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteTrainerExercisesQuery.getKey = (variables?: GQLTrainerExercisesQueryVariables) => variables === undefined ? ['TrainerExercises.infinite'] : ['TrainerExercises.infinite', variables];


useTrainerExercisesQuery.fetcher = (variables?: GQLTrainerExercisesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLTrainerExercisesQuery, GQLTrainerExercisesQueryVariables>(TrainerExercisesDocument, variables, options);

export const PublicExercisesDocument = `
    query PublicExercises($where: ExerciseWhereInput) {
  publicExercises(where: $where) {
    id
    name
    description
    videoUrl
    equipment
    isPublic
    muscleGroups {
      id
      name
      alias
      groupSlug
    }
    secondaryMuscleGroups {
      id
      name
      alias
      groupSlug
    }
  }
}
    `;

export const usePublicExercisesQuery = <
      TData = GQLPublicExercisesQuery,
      TError = unknown
    >(
      variables?: GQLPublicExercisesQueryVariables,
      options?: Omit<UseQueryOptions<GQLPublicExercisesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLPublicExercisesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLPublicExercisesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['PublicExercises'] : ['PublicExercises', variables],
    queryFn: fetchData<GQLPublicExercisesQuery, GQLPublicExercisesQueryVariables>(PublicExercisesDocument, variables),
    ...options
  }
    )};

usePublicExercisesQuery.getKey = (variables?: GQLPublicExercisesQueryVariables) => variables === undefined ? ['PublicExercises'] : ['PublicExercises', variables];

export const useInfinitePublicExercisesQuery = <
      TData = InfiniteData<GQLPublicExercisesQuery>,
      TError = unknown
    >(
      variables: GQLPublicExercisesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLPublicExercisesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLPublicExercisesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLPublicExercisesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['PublicExercises.infinite'] : ['PublicExercises.infinite', variables],
      queryFn: (metaData) => fetchData<GQLPublicExercisesQuery, GQLPublicExercisesQueryVariables>(PublicExercisesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfinitePublicExercisesQuery.getKey = (variables?: GQLPublicExercisesQueryVariables) => variables === undefined ? ['PublicExercises.infinite'] : ['PublicExercises.infinite', variables];


usePublicExercisesQuery.fetcher = (variables?: GQLPublicExercisesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLPublicExercisesQuery, GQLPublicExercisesQueryVariables>(PublicExercisesDocument, variables, options);

export const ExerciseDocument = `
    query Exercise($id: ID!) {
  exercise(id: $id) {
    id
    name
    description
    videoUrl
    equipment
    isPublic
    muscleGroups {
      id
      name
      alias
    }
  }
}
    `;

export const useExerciseQuery = <
      TData = GQLExerciseQuery,
      TError = unknown
    >(
      variables: GQLExerciseQueryVariables,
      options?: Omit<UseQueryOptions<GQLExerciseQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLExerciseQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLExerciseQuery, TError, TData>(
      {
    queryKey: ['Exercise', variables],
    queryFn: fetchData<GQLExerciseQuery, GQLExerciseQueryVariables>(ExerciseDocument, variables),
    ...options
  }
    )};

useExerciseQuery.getKey = (variables: GQLExerciseQueryVariables) => ['Exercise', variables];

export const useInfiniteExerciseQuery = <
      TData = InfiniteData<GQLExerciseQuery>,
      TError = unknown
    >(
      variables: GQLExerciseQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLExerciseQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLExerciseQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLExerciseQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['Exercise.infinite', variables],
      queryFn: (metaData) => fetchData<GQLExerciseQuery, GQLExerciseQueryVariables>(ExerciseDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteExerciseQuery.getKey = (variables: GQLExerciseQueryVariables) => ['Exercise.infinite', variables];


useExerciseQuery.fetcher = (variables: GQLExerciseQueryVariables, options?: RequestInit['headers']) => fetchData<GQLExerciseQuery, GQLExerciseQueryVariables>(ExerciseDocument, variables, options);

export const CreateExerciseDocument = `
    mutation CreateExercise($input: CreateExerciseInput!) {
  createExercise(input: $input)
}
    `;

export const useCreateExerciseMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateExerciseMutation, TError, GQLCreateExerciseMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateExerciseMutation, TError, GQLCreateExerciseMutationVariables, TContext>(
      {
    mutationKey: ['CreateExercise'],
    mutationFn: (variables?: GQLCreateExerciseMutationVariables) => fetchData<GQLCreateExerciseMutation, GQLCreateExerciseMutationVariables>(CreateExerciseDocument, variables)(),
    ...options
  }
    )};

useCreateExerciseMutation.getKey = () => ['CreateExercise'];


useCreateExerciseMutation.fetcher = (variables: GQLCreateExerciseMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateExerciseMutation, GQLCreateExerciseMutationVariables>(CreateExerciseDocument, variables, options);

export const UpdateExerciseDocument = `
    mutation UpdateExercise($id: ID!, $input: UpdateExerciseInput!) {
  updateExercise(id: $id, input: $input)
}
    `;

export const useUpdateExerciseMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateExerciseMutation, TError, GQLUpdateExerciseMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateExerciseMutation, TError, GQLUpdateExerciseMutationVariables, TContext>(
      {
    mutationKey: ['UpdateExercise'],
    mutationFn: (variables?: GQLUpdateExerciseMutationVariables) => fetchData<GQLUpdateExerciseMutation, GQLUpdateExerciseMutationVariables>(UpdateExerciseDocument, variables)(),
    ...options
  }
    )};

useUpdateExerciseMutation.getKey = () => ['UpdateExercise'];


useUpdateExerciseMutation.fetcher = (variables: GQLUpdateExerciseMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateExerciseMutation, GQLUpdateExerciseMutationVariables>(UpdateExerciseDocument, variables, options);

export const DeleteExerciseDocument = `
    mutation DeleteExercise($id: ID!) {
  deleteExercise(id: $id)
}
    `;

export const useDeleteExerciseMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDeleteExerciseMutation, TError, GQLDeleteExerciseMutationVariables, TContext>) => {
    
    return useMutation<GQLDeleteExerciseMutation, TError, GQLDeleteExerciseMutationVariables, TContext>(
      {
    mutationKey: ['DeleteExercise'],
    mutationFn: (variables?: GQLDeleteExerciseMutationVariables) => fetchData<GQLDeleteExerciseMutation, GQLDeleteExerciseMutationVariables>(DeleteExerciseDocument, variables)(),
    ...options
  }
    )};

useDeleteExerciseMutation.getKey = () => ['DeleteExercise'];


useDeleteExerciseMutation.fetcher = (variables: GQLDeleteExerciseMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDeleteExerciseMutation, GQLDeleteExerciseMutationVariables>(DeleteExerciseDocument, variables, options);

export const AddSubstituteExerciseDocument = `
    mutation AddSubstituteExercise($input: AddSubstituteExerciseInput!) {
  addSubstituteExercise(input: $input)
}
    `;

export const useAddSubstituteExerciseMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAddSubstituteExerciseMutation, TError, GQLAddSubstituteExerciseMutationVariables, TContext>) => {
    
    return useMutation<GQLAddSubstituteExerciseMutation, TError, GQLAddSubstituteExerciseMutationVariables, TContext>(
      {
    mutationKey: ['AddSubstituteExercise'],
    mutationFn: (variables?: GQLAddSubstituteExerciseMutationVariables) => fetchData<GQLAddSubstituteExerciseMutation, GQLAddSubstituteExerciseMutationVariables>(AddSubstituteExerciseDocument, variables)(),
    ...options
  }
    )};

useAddSubstituteExerciseMutation.getKey = () => ['AddSubstituteExercise'];


useAddSubstituteExerciseMutation.fetcher = (variables: GQLAddSubstituteExerciseMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAddSubstituteExerciseMutation, GQLAddSubstituteExerciseMutationVariables>(AddSubstituteExerciseDocument, variables, options);

export const RemoveSubstituteExerciseDocument = `
    mutation RemoveSubstituteExercise($input: RemoveSubstituteExerciseInput!) {
  removeSubstituteExercise(input: $input)
}
    `;

export const useRemoveSubstituteExerciseMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveSubstituteExerciseMutation, TError, GQLRemoveSubstituteExerciseMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveSubstituteExerciseMutation, TError, GQLRemoveSubstituteExerciseMutationVariables, TContext>(
      {
    mutationKey: ['RemoveSubstituteExercise'],
    mutationFn: (variables?: GQLRemoveSubstituteExerciseMutationVariables) => fetchData<GQLRemoveSubstituteExerciseMutation, GQLRemoveSubstituteExerciseMutationVariables>(RemoveSubstituteExerciseDocument, variables)(),
    ...options
  }
    )};

useRemoveSubstituteExerciseMutation.getKey = () => ['RemoveSubstituteExercise'];


useRemoveSubstituteExerciseMutation.fetcher = (variables: GQLRemoveSubstituteExerciseMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveSubstituteExerciseMutation, GQLRemoveSubstituteExerciseMutationVariables>(RemoveSubstituteExerciseDocument, variables, options);

export const UpdateSubstituteExerciseDocument = `
    mutation UpdateSubstituteExercise($input: UpdateSubstituteExerciseInput!) {
  updateSubstituteExercise(input: $input)
}
    `;

export const useUpdateSubstituteExerciseMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateSubstituteExerciseMutation, TError, GQLUpdateSubstituteExerciseMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateSubstituteExerciseMutation, TError, GQLUpdateSubstituteExerciseMutationVariables, TContext>(
      {
    mutationKey: ['UpdateSubstituteExercise'],
    mutationFn: (variables?: GQLUpdateSubstituteExerciseMutationVariables) => fetchData<GQLUpdateSubstituteExerciseMutation, GQLUpdateSubstituteExerciseMutationVariables>(UpdateSubstituteExerciseDocument, variables)(),
    ...options
  }
    )};

useUpdateSubstituteExerciseMutation.getKey = () => ['UpdateSubstituteExercise'];


useUpdateSubstituteExerciseMutation.fetcher = (variables: GQLUpdateSubstituteExerciseMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateSubstituteExerciseMutation, GQLUpdateSubstituteExerciseMutationVariables>(UpdateSubstituteExerciseDocument, variables, options);

export const GetExerciseWithSubstitutesDocument = `
    query GetExerciseWithSubstitutes($id: ID!) {
  exercise(id: $id) {
    id
    name
    description
    equipment
    images {
      id
      url
      order
      createdAt
    }
    substitutes {
      id
      originalId
      substituteId
      reason
      createdAt
      substitute {
        id
        name
        description
        equipment
        muscleGroups {
          id
          name
          groupSlug
        }
      }
    }
    canBeSubstitutedBy {
      id
      originalId
      substituteId
      reason
      createdAt
      original {
        id
        name
        description
        equipment
        muscleGroups {
          id
          name
          groupSlug
        }
      }
    }
  }
}
    `;

export const useGetExerciseWithSubstitutesQuery = <
      TData = GQLGetExerciseWithSubstitutesQuery,
      TError = unknown
    >(
      variables: GQLGetExerciseWithSubstitutesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetExerciseWithSubstitutesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetExerciseWithSubstitutesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetExerciseWithSubstitutesQuery, TError, TData>(
      {
    queryKey: ['GetExerciseWithSubstitutes', variables],
    queryFn: fetchData<GQLGetExerciseWithSubstitutesQuery, GQLGetExerciseWithSubstitutesQueryVariables>(GetExerciseWithSubstitutesDocument, variables),
    ...options
  }
    )};

useGetExerciseWithSubstitutesQuery.getKey = (variables: GQLGetExerciseWithSubstitutesQueryVariables) => ['GetExerciseWithSubstitutes', variables];

export const useInfiniteGetExerciseWithSubstitutesQuery = <
      TData = InfiniteData<GQLGetExerciseWithSubstitutesQuery>,
      TError = unknown
    >(
      variables: GQLGetExerciseWithSubstitutesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetExerciseWithSubstitutesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetExerciseWithSubstitutesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetExerciseWithSubstitutesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetExerciseWithSubstitutes.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetExerciseWithSubstitutesQuery, GQLGetExerciseWithSubstitutesQueryVariables>(GetExerciseWithSubstitutesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetExerciseWithSubstitutesQuery.getKey = (variables: GQLGetExerciseWithSubstitutesQueryVariables) => ['GetExerciseWithSubstitutes.infinite', variables];


useGetExerciseWithSubstitutesQuery.fetcher = (variables: GQLGetExerciseWithSubstitutesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetExerciseWithSubstitutesQuery, GQLGetExerciseWithSubstitutesQueryVariables>(GetExerciseWithSubstitutesDocument, variables, options);

export const GetMealPlanTemplatesDocument = `
    query GetMealPlanTemplates($draft: Boolean, $limit: Int) {
  getMealPlanTemplates(draft: $draft, limit: $limit) {
    id
    title
    description
    isDraft
    dailyCalories
    dailyProtein
    dailyCarbs
    dailyFat
    weekCount
    assignedCount
    collaboratorCount
    createdAt
    updatedAt
  }
}
    `;

export const useGetMealPlanTemplatesQuery = <
      TData = GQLGetMealPlanTemplatesQuery,
      TError = unknown
    >(
      variables?: GQLGetMealPlanTemplatesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetMealPlanTemplatesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetMealPlanTemplatesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetMealPlanTemplatesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetMealPlanTemplates'] : ['GetMealPlanTemplates', variables],
    queryFn: fetchData<GQLGetMealPlanTemplatesQuery, GQLGetMealPlanTemplatesQueryVariables>(GetMealPlanTemplatesDocument, variables),
    ...options
  }
    )};

useGetMealPlanTemplatesQuery.getKey = (variables?: GQLGetMealPlanTemplatesQueryVariables) => variables === undefined ? ['GetMealPlanTemplates'] : ['GetMealPlanTemplates', variables];

export const useInfiniteGetMealPlanTemplatesQuery = <
      TData = InfiniteData<GQLGetMealPlanTemplatesQuery>,
      TError = unknown
    >(
      variables: GQLGetMealPlanTemplatesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetMealPlanTemplatesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetMealPlanTemplatesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetMealPlanTemplatesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetMealPlanTemplates.infinite'] : ['GetMealPlanTemplates.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetMealPlanTemplatesQuery, GQLGetMealPlanTemplatesQueryVariables>(GetMealPlanTemplatesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMealPlanTemplatesQuery.getKey = (variables?: GQLGetMealPlanTemplatesQueryVariables) => variables === undefined ? ['GetMealPlanTemplates.infinite'] : ['GetMealPlanTemplates.infinite', variables];


useGetMealPlanTemplatesQuery.fetcher = (variables?: GQLGetMealPlanTemplatesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetMealPlanTemplatesQuery, GQLGetMealPlanTemplatesQueryVariables>(GetMealPlanTemplatesDocument, variables, options);

export const GetCollaborationMealPlanTemplatesDocument = `
    query GetCollaborationMealPlanTemplates($draft: Boolean) {
  getCollaborationMealPlanTemplates(draft: $draft) {
    id
    title
    description
    isDraft
    dailyCalories
    dailyProtein
    dailyCarbs
    dailyFat
    weekCount
    assignedCount
    collaboratorCount
    createdBy {
      id
      firstName
      lastName
    }
    collaborators {
      id
      collaborator {
        id
        firstName
        lastName
        email
      }
      permission
    }
    createdAt
    updatedAt
  }
}
    `;

export const useGetCollaborationMealPlanTemplatesQuery = <
      TData = GQLGetCollaborationMealPlanTemplatesQuery,
      TError = unknown
    >(
      variables?: GQLGetCollaborationMealPlanTemplatesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetCollaborationMealPlanTemplatesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetCollaborationMealPlanTemplatesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetCollaborationMealPlanTemplatesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetCollaborationMealPlanTemplates'] : ['GetCollaborationMealPlanTemplates', variables],
    queryFn: fetchData<GQLGetCollaborationMealPlanTemplatesQuery, GQLGetCollaborationMealPlanTemplatesQueryVariables>(GetCollaborationMealPlanTemplatesDocument, variables),
    ...options
  }
    )};

useGetCollaborationMealPlanTemplatesQuery.getKey = (variables?: GQLGetCollaborationMealPlanTemplatesQueryVariables) => variables === undefined ? ['GetCollaborationMealPlanTemplates'] : ['GetCollaborationMealPlanTemplates', variables];

export const useInfiniteGetCollaborationMealPlanTemplatesQuery = <
      TData = InfiniteData<GQLGetCollaborationMealPlanTemplatesQuery>,
      TError = unknown
    >(
      variables: GQLGetCollaborationMealPlanTemplatesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetCollaborationMealPlanTemplatesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetCollaborationMealPlanTemplatesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetCollaborationMealPlanTemplatesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetCollaborationMealPlanTemplates.infinite'] : ['GetCollaborationMealPlanTemplates.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetCollaborationMealPlanTemplatesQuery, GQLGetCollaborationMealPlanTemplatesQueryVariables>(GetCollaborationMealPlanTemplatesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetCollaborationMealPlanTemplatesQuery.getKey = (variables?: GQLGetCollaborationMealPlanTemplatesQueryVariables) => variables === undefined ? ['GetCollaborationMealPlanTemplates.infinite'] : ['GetCollaborationMealPlanTemplates.infinite', variables];


useGetCollaborationMealPlanTemplatesQuery.fetcher = (variables?: GQLGetCollaborationMealPlanTemplatesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetCollaborationMealPlanTemplatesQuery, GQLGetCollaborationMealPlanTemplatesQueryVariables>(GetCollaborationMealPlanTemplatesDocument, variables, options);

export const GetMealPlanByIdDocument = `
    query GetMealPlanById($id: ID!) {
  getMealPlanById(id: $id) {
    ...MealPlanTemplate
  }
}
    ${MealPlanTemplateFragmentDoc}`;

export const useGetMealPlanByIdQuery = <
      TData = GQLGetMealPlanByIdQuery,
      TError = unknown
    >(
      variables: GQLGetMealPlanByIdQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetMealPlanByIdQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetMealPlanByIdQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetMealPlanByIdQuery, TError, TData>(
      {
    queryKey: ['GetMealPlanById', variables],
    queryFn: fetchData<GQLGetMealPlanByIdQuery, GQLGetMealPlanByIdQueryVariables>(GetMealPlanByIdDocument, variables),
    ...options
  }
    )};

useGetMealPlanByIdQuery.getKey = (variables: GQLGetMealPlanByIdQueryVariables) => ['GetMealPlanById', variables];

export const useInfiniteGetMealPlanByIdQuery = <
      TData = InfiniteData<GQLGetMealPlanByIdQuery>,
      TError = unknown
    >(
      variables: GQLGetMealPlanByIdQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetMealPlanByIdQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetMealPlanByIdQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetMealPlanByIdQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetMealPlanById.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetMealPlanByIdQuery, GQLGetMealPlanByIdQueryVariables>(GetMealPlanByIdDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMealPlanByIdQuery.getKey = (variables: GQLGetMealPlanByIdQueryVariables) => ['GetMealPlanById.infinite', variables];


useGetMealPlanByIdQuery.fetcher = (variables: GQLGetMealPlanByIdQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetMealPlanByIdQuery, GQLGetMealPlanByIdQueryVariables>(GetMealPlanByIdDocument, variables, options);

export const CreateMealPlanDocument = `
    mutation CreateMealPlan($input: CreateMealPlanInput!) {
  createMealPlan(input: $input) {
    id
    success
  }
}
    `;

export const useCreateMealPlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateMealPlanMutation, TError, GQLCreateMealPlanMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateMealPlanMutation, TError, GQLCreateMealPlanMutationVariables, TContext>(
      {
    mutationKey: ['CreateMealPlan'],
    mutationFn: (variables?: GQLCreateMealPlanMutationVariables) => fetchData<GQLCreateMealPlanMutation, GQLCreateMealPlanMutationVariables>(CreateMealPlanDocument, variables)(),
    ...options
  }
    )};

useCreateMealPlanMutation.getKey = () => ['CreateMealPlan'];


useCreateMealPlanMutation.fetcher = (variables: GQLCreateMealPlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateMealPlanMutation, GQLCreateMealPlanMutationVariables>(CreateMealPlanDocument, variables, options);

export const CreateDraftMealTemplateDocument = `
    mutation CreateDraftMealTemplate {
  createDraftMealTemplate {
    id
    title
    description
    isDraft
    dailyCalories
    dailyProtein
    dailyCarbs
    dailyFat
    createdAt
    updatedAt
  }
}
    `;

export const useCreateDraftMealTemplateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateDraftMealTemplateMutation, TError, GQLCreateDraftMealTemplateMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateDraftMealTemplateMutation, TError, GQLCreateDraftMealTemplateMutationVariables, TContext>(
      {
    mutationKey: ['CreateDraftMealTemplate'],
    mutationFn: (variables?: GQLCreateDraftMealTemplateMutationVariables) => fetchData<GQLCreateDraftMealTemplateMutation, GQLCreateDraftMealTemplateMutationVariables>(CreateDraftMealTemplateDocument, variables)(),
    ...options
  }
    )};

useCreateDraftMealTemplateMutation.getKey = () => ['CreateDraftMealTemplate'];


useCreateDraftMealTemplateMutation.fetcher = (variables?: GQLCreateDraftMealTemplateMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateDraftMealTemplateMutation, GQLCreateDraftMealTemplateMutationVariables>(CreateDraftMealTemplateDocument, variables, options);

export const DuplicateMealPlanDocument = `
    mutation DuplicateMealPlan($id: ID!) {
  duplicateMealPlan(id: $id)
}
    `;

export const useDuplicateMealPlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDuplicateMealPlanMutation, TError, GQLDuplicateMealPlanMutationVariables, TContext>) => {
    
    return useMutation<GQLDuplicateMealPlanMutation, TError, GQLDuplicateMealPlanMutationVariables, TContext>(
      {
    mutationKey: ['DuplicateMealPlan'],
    mutationFn: (variables?: GQLDuplicateMealPlanMutationVariables) => fetchData<GQLDuplicateMealPlanMutation, GQLDuplicateMealPlanMutationVariables>(DuplicateMealPlanDocument, variables)(),
    ...options
  }
    )};

useDuplicateMealPlanMutation.getKey = () => ['DuplicateMealPlan'];


useDuplicateMealPlanMutation.fetcher = (variables: GQLDuplicateMealPlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDuplicateMealPlanMutation, GQLDuplicateMealPlanMutationVariables>(DuplicateMealPlanDocument, variables, options);

export const AssignMealPlanToClientDocument = `
    mutation AssignMealPlanToClient($input: AssignMealPlanToClientInput!) {
  assignMealPlanToClient(input: $input)
}
    `;

export const useAssignMealPlanToClientMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAssignMealPlanToClientMutation, TError, GQLAssignMealPlanToClientMutationVariables, TContext>) => {
    
    return useMutation<GQLAssignMealPlanToClientMutation, TError, GQLAssignMealPlanToClientMutationVariables, TContext>(
      {
    mutationKey: ['AssignMealPlanToClient'],
    mutationFn: (variables?: GQLAssignMealPlanToClientMutationVariables) => fetchData<GQLAssignMealPlanToClientMutation, GQLAssignMealPlanToClientMutationVariables>(AssignMealPlanToClientDocument, variables)(),
    ...options
  }
    )};

useAssignMealPlanToClientMutation.getKey = () => ['AssignMealPlanToClient'];


useAssignMealPlanToClientMutation.fetcher = (variables: GQLAssignMealPlanToClientMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAssignMealPlanToClientMutation, GQLAssignMealPlanToClientMutationVariables>(AssignMealPlanToClientDocument, variables, options);

export const RemoveMealPlanFromClientDocument = `
    mutation RemoveMealPlanFromClient($planId: ID!, $clientId: ID!) {
  removeMealPlanFromClient(planId: $planId, clientId: $clientId)
}
    `;

export const useRemoveMealPlanFromClientMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveMealPlanFromClientMutation, TError, GQLRemoveMealPlanFromClientMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveMealPlanFromClientMutation, TError, GQLRemoveMealPlanFromClientMutationVariables, TContext>(
      {
    mutationKey: ['RemoveMealPlanFromClient'],
    mutationFn: (variables?: GQLRemoveMealPlanFromClientMutationVariables) => fetchData<GQLRemoveMealPlanFromClientMutation, GQLRemoveMealPlanFromClientMutationVariables>(RemoveMealPlanFromClientDocument, variables)(),
    ...options
  }
    )};

useRemoveMealPlanFromClientMutation.getKey = () => ['RemoveMealPlanFromClient'];


useRemoveMealPlanFromClientMutation.fetcher = (variables: GQLRemoveMealPlanFromClientMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveMealPlanFromClientMutation, GQLRemoveMealPlanFromClientMutationVariables>(RemoveMealPlanFromClientDocument, variables, options);

export const SaveMealDocument = `
    mutation SaveMeal($input: SaveMealInput!) {
  saveMeal(input: $input) {
    id
    name
    dateTime
    instructions
    foods {
      id
      name
      quantity
      unit
      caloriesPer100g
      proteinPer100g
      carbsPer100g
      fatPer100g
      fiberPer100g
      openFoodFactsId
      addedAt
    }
  }
}
    `;

export const useSaveMealMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLSaveMealMutation, TError, GQLSaveMealMutationVariables, TContext>) => {
    
    return useMutation<GQLSaveMealMutation, TError, GQLSaveMealMutationVariables, TContext>(
      {
    mutationKey: ['SaveMeal'],
    mutationFn: (variables?: GQLSaveMealMutationVariables) => fetchData<GQLSaveMealMutation, GQLSaveMealMutationVariables>(SaveMealDocument, variables)(),
    ...options
  }
    )};

useSaveMealMutation.getKey = () => ['SaveMeal'];


useSaveMealMutation.fetcher = (variables: GQLSaveMealMutationVariables, options?: RequestInit['headers']) => fetchData<GQLSaveMealMutation, GQLSaveMealMutationVariables>(SaveMealDocument, variables, options);

export const UpdateMealPlanDetailsDocument = `
    mutation UpdateMealPlanDetails($input: UpdateMealPlanDetailsInput!) {
  updateMealPlanDetails(input: $input)
}
    `;

export const useUpdateMealPlanDetailsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateMealPlanDetailsMutation, TError, GQLUpdateMealPlanDetailsMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateMealPlanDetailsMutation, TError, GQLUpdateMealPlanDetailsMutationVariables, TContext>(
      {
    mutationKey: ['UpdateMealPlanDetails'],
    mutationFn: (variables?: GQLUpdateMealPlanDetailsMutationVariables) => fetchData<GQLUpdateMealPlanDetailsMutation, GQLUpdateMealPlanDetailsMutationVariables>(UpdateMealPlanDetailsDocument, variables)(),
    ...options
  }
    )};

useUpdateMealPlanDetailsMutation.getKey = () => ['UpdateMealPlanDetails'];


useUpdateMealPlanDetailsMutation.fetcher = (variables: GQLUpdateMealPlanDetailsMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateMealPlanDetailsMutation, GQLUpdateMealPlanDetailsMutationVariables>(UpdateMealPlanDetailsDocument, variables, options);

export const GetTemplatesDocument = `
    query GetTemplates($draft: Boolean, $limit: Int) {
  getTemplates(draft: $draft, limit: $limit) {
    id
    title
    description
    isPublic
    isDraft
    weekCount
    assignedCount
    collaboratorCount
  }
}
    `;

export const useGetTemplatesQuery = <
      TData = GQLGetTemplatesQuery,
      TError = unknown
    >(
      variables?: GQLGetTemplatesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetTemplatesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetTemplatesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetTemplatesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetTemplates'] : ['GetTemplates', variables],
    queryFn: fetchData<GQLGetTemplatesQuery, GQLGetTemplatesQueryVariables>(GetTemplatesDocument, variables),
    ...options
  }
    )};

useGetTemplatesQuery.getKey = (variables?: GQLGetTemplatesQueryVariables) => variables === undefined ? ['GetTemplates'] : ['GetTemplates', variables];

export const useInfiniteGetTemplatesQuery = <
      TData = InfiniteData<GQLGetTemplatesQuery>,
      TError = unknown
    >(
      variables: GQLGetTemplatesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetTemplatesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetTemplatesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetTemplatesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetTemplates.infinite'] : ['GetTemplates.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetTemplatesQuery, GQLGetTemplatesQueryVariables>(GetTemplatesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTemplatesQuery.getKey = (variables?: GQLGetTemplatesQueryVariables) => variables === undefined ? ['GetTemplates.infinite'] : ['GetTemplates.infinite', variables];


useGetTemplatesQuery.fetcher = (variables?: GQLGetTemplatesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetTemplatesQuery, GQLGetTemplatesQueryVariables>(GetTemplatesDocument, variables, options);

export const GetCollaborationTemplatesDocument = `
    query GetCollaborationTemplates($draft: Boolean) {
  getCollaborationTemplates(draft: $draft) {
    id
    title
    description
    isPublic
    isDraft
    weekCount
    assignedCount
    collaboratorCount
    createdBy {
      id
      firstName
      lastName
    }
    collaborators {
      id
      collaborator {
        id
        firstName
        lastName
        email
      }
      permission
    }
  }
}
    `;

export const useGetCollaborationTemplatesQuery = <
      TData = GQLGetCollaborationTemplatesQuery,
      TError = unknown
    >(
      variables?: GQLGetCollaborationTemplatesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetCollaborationTemplatesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetCollaborationTemplatesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetCollaborationTemplatesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetCollaborationTemplates'] : ['GetCollaborationTemplates', variables],
    queryFn: fetchData<GQLGetCollaborationTemplatesQuery, GQLGetCollaborationTemplatesQueryVariables>(GetCollaborationTemplatesDocument, variables),
    ...options
  }
    )};

useGetCollaborationTemplatesQuery.getKey = (variables?: GQLGetCollaborationTemplatesQueryVariables) => variables === undefined ? ['GetCollaborationTemplates'] : ['GetCollaborationTemplates', variables];

export const useInfiniteGetCollaborationTemplatesQuery = <
      TData = InfiniteData<GQLGetCollaborationTemplatesQuery>,
      TError = unknown
    >(
      variables: GQLGetCollaborationTemplatesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetCollaborationTemplatesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetCollaborationTemplatesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetCollaborationTemplatesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetCollaborationTemplates.infinite'] : ['GetCollaborationTemplates.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetCollaborationTemplatesQuery, GQLGetCollaborationTemplatesQueryVariables>(GetCollaborationTemplatesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetCollaborationTemplatesQuery.getKey = (variables?: GQLGetCollaborationTemplatesQueryVariables) => variables === undefined ? ['GetCollaborationTemplates.infinite'] : ['GetCollaborationTemplates.infinite', variables];


useGetCollaborationTemplatesQuery.fetcher = (variables?: GQLGetCollaborationTemplatesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetCollaborationTemplatesQuery, GQLGetCollaborationTemplatesQueryVariables>(GetCollaborationTemplatesDocument, variables, options);

export const GetTemplateTrainingPlanByIdDocument = `
    query GetTemplateTrainingPlanById($id: ID!) {
  getTrainingPlanById(id: $id) {
    ...TrainingTemplate
  }
}
    ${TrainingTemplateFragmentDoc}`;

export const useGetTemplateTrainingPlanByIdQuery = <
      TData = GQLGetTemplateTrainingPlanByIdQuery,
      TError = unknown
    >(
      variables: GQLGetTemplateTrainingPlanByIdQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetTemplateTrainingPlanByIdQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetTemplateTrainingPlanByIdQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetTemplateTrainingPlanByIdQuery, TError, TData>(
      {
    queryKey: ['GetTemplateTrainingPlanById', variables],
    queryFn: fetchData<GQLGetTemplateTrainingPlanByIdQuery, GQLGetTemplateTrainingPlanByIdQueryVariables>(GetTemplateTrainingPlanByIdDocument, variables),
    ...options
  }
    )};

useGetTemplateTrainingPlanByIdQuery.getKey = (variables: GQLGetTemplateTrainingPlanByIdQueryVariables) => ['GetTemplateTrainingPlanById', variables];

export const useInfiniteGetTemplateTrainingPlanByIdQuery = <
      TData = InfiniteData<GQLGetTemplateTrainingPlanByIdQuery>,
      TError = unknown
    >(
      variables: GQLGetTemplateTrainingPlanByIdQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetTemplateTrainingPlanByIdQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetTemplateTrainingPlanByIdQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetTemplateTrainingPlanByIdQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetTemplateTrainingPlanById.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetTemplateTrainingPlanByIdQuery, GQLGetTemplateTrainingPlanByIdQueryVariables>(GetTemplateTrainingPlanByIdDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTemplateTrainingPlanByIdQuery.getKey = (variables: GQLGetTemplateTrainingPlanByIdQueryVariables) => ['GetTemplateTrainingPlanById.infinite', variables];


useGetTemplateTrainingPlanByIdQuery.fetcher = (variables: GQLGetTemplateTrainingPlanByIdQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetTemplateTrainingPlanByIdQuery, GQLGetTemplateTrainingPlanByIdQueryVariables>(GetTemplateTrainingPlanByIdDocument, variables, options);

export const CreateTrainingPlanDocument = `
    mutation CreateTrainingPlan($input: CreateTrainingPlanInput!) {
  createTrainingPlan(input: $input) {
    id
    success
  }
}
    `;

export const useCreateTrainingPlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateTrainingPlanMutation, TError, GQLCreateTrainingPlanMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateTrainingPlanMutation, TError, GQLCreateTrainingPlanMutationVariables, TContext>(
      {
    mutationKey: ['CreateTrainingPlan'],
    mutationFn: (variables?: GQLCreateTrainingPlanMutationVariables) => fetchData<GQLCreateTrainingPlanMutation, GQLCreateTrainingPlanMutationVariables>(CreateTrainingPlanDocument, variables)(),
    ...options
  }
    )};

useCreateTrainingPlanMutation.getKey = () => ['CreateTrainingPlan'];


useCreateTrainingPlanMutation.fetcher = (variables: GQLCreateTrainingPlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateTrainingPlanMutation, GQLCreateTrainingPlanMutationVariables>(CreateTrainingPlanDocument, variables, options);

export const UpdateTrainingPlanDocument = `
    mutation UpdateTrainingPlan($input: UpdateTrainingPlanInput!) {
  updateTrainingPlan(input: $input)
}
    `;

export const useUpdateTrainingPlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateTrainingPlanMutation, TError, GQLUpdateTrainingPlanMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateTrainingPlanMutation, TError, GQLUpdateTrainingPlanMutationVariables, TContext>(
      {
    mutationKey: ['UpdateTrainingPlan'],
    mutationFn: (variables?: GQLUpdateTrainingPlanMutationVariables) => fetchData<GQLUpdateTrainingPlanMutation, GQLUpdateTrainingPlanMutationVariables>(UpdateTrainingPlanDocument, variables)(),
    ...options
  }
    )};

useUpdateTrainingPlanMutation.getKey = () => ['UpdateTrainingPlan'];


useUpdateTrainingPlanMutation.fetcher = (variables: GQLUpdateTrainingPlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateTrainingPlanMutation, GQLUpdateTrainingPlanMutationVariables>(UpdateTrainingPlanDocument, variables, options);

export const DeleteTrainingPlanDocument = `
    mutation DeleteTrainingPlan($id: ID!) {
  deleteTrainingPlan(id: $id)
}
    `;

export const useDeleteTrainingPlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDeleteTrainingPlanMutation, TError, GQLDeleteTrainingPlanMutationVariables, TContext>) => {
    
    return useMutation<GQLDeleteTrainingPlanMutation, TError, GQLDeleteTrainingPlanMutationVariables, TContext>(
      {
    mutationKey: ['DeleteTrainingPlan'],
    mutationFn: (variables?: GQLDeleteTrainingPlanMutationVariables) => fetchData<GQLDeleteTrainingPlanMutation, GQLDeleteTrainingPlanMutationVariables>(DeleteTrainingPlanDocument, variables)(),
    ...options
  }
    )};

useDeleteTrainingPlanMutation.getKey = () => ['DeleteTrainingPlan'];


useDeleteTrainingPlanMutation.fetcher = (variables: GQLDeleteTrainingPlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDeleteTrainingPlanMutation, GQLDeleteTrainingPlanMutationVariables>(DeleteTrainingPlanDocument, variables, options);

export const DuplicateTrainingPlanDocument = `
    mutation DuplicateTrainingPlan($id: ID!) {
  duplicateTrainingPlan(id: $id)
}
    `;

export const useDuplicateTrainingPlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDuplicateTrainingPlanMutation, TError, GQLDuplicateTrainingPlanMutationVariables, TContext>) => {
    
    return useMutation<GQLDuplicateTrainingPlanMutation, TError, GQLDuplicateTrainingPlanMutationVariables, TContext>(
      {
    mutationKey: ['DuplicateTrainingPlan'],
    mutationFn: (variables?: GQLDuplicateTrainingPlanMutationVariables) => fetchData<GQLDuplicateTrainingPlanMutation, GQLDuplicateTrainingPlanMutationVariables>(DuplicateTrainingPlanDocument, variables)(),
    ...options
  }
    )};

useDuplicateTrainingPlanMutation.getKey = () => ['DuplicateTrainingPlan'];


useDuplicateTrainingPlanMutation.fetcher = (variables: GQLDuplicateTrainingPlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDuplicateTrainingPlanMutation, GQLDuplicateTrainingPlanMutationVariables>(DuplicateTrainingPlanDocument, variables, options);

export const AssignTrainingPlanToClientDocument = `
    mutation AssignTrainingPlanToClient($input: AssignTrainingPlanToClientInput!) {
  assignTrainingPlanToClient(input: $input)
}
    `;

export const useAssignTrainingPlanToClientMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAssignTrainingPlanToClientMutation, TError, GQLAssignTrainingPlanToClientMutationVariables, TContext>) => {
    
    return useMutation<GQLAssignTrainingPlanToClientMutation, TError, GQLAssignTrainingPlanToClientMutationVariables, TContext>(
      {
    mutationKey: ['AssignTrainingPlanToClient'],
    mutationFn: (variables?: GQLAssignTrainingPlanToClientMutationVariables) => fetchData<GQLAssignTrainingPlanToClientMutation, GQLAssignTrainingPlanToClientMutationVariables>(AssignTrainingPlanToClientDocument, variables)(),
    ...options
  }
    )};

useAssignTrainingPlanToClientMutation.getKey = () => ['AssignTrainingPlanToClient'];


useAssignTrainingPlanToClientMutation.fetcher = (variables: GQLAssignTrainingPlanToClientMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAssignTrainingPlanToClientMutation, GQLAssignTrainingPlanToClientMutationVariables>(AssignTrainingPlanToClientDocument, variables, options);

export const RemoveTrainingPlanFromClientDocument = `
    mutation RemoveTrainingPlanFromClient($planId: ID!, $clientId: ID!) {
  removeTrainingPlanFromClient(planId: $planId, clientId: $clientId)
}
    `;

export const useRemoveTrainingPlanFromClientMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveTrainingPlanFromClientMutation, TError, GQLRemoveTrainingPlanFromClientMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveTrainingPlanFromClientMutation, TError, GQLRemoveTrainingPlanFromClientMutationVariables, TContext>(
      {
    mutationKey: ['RemoveTrainingPlanFromClient'],
    mutationFn: (variables?: GQLRemoveTrainingPlanFromClientMutationVariables) => fetchData<GQLRemoveTrainingPlanFromClientMutation, GQLRemoveTrainingPlanFromClientMutationVariables>(RemoveTrainingPlanFromClientDocument, variables)(),
    ...options
  }
    )};

useRemoveTrainingPlanFromClientMutation.getKey = () => ['RemoveTrainingPlanFromClient'];


useRemoveTrainingPlanFromClientMutation.fetcher = (variables: GQLRemoveTrainingPlanFromClientMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveTrainingPlanFromClientMutation, GQLRemoveTrainingPlanFromClientMutationVariables>(RemoveTrainingPlanFromClientDocument, variables, options);

export const UpdateTrainingPlanDetailsDocument = `
    mutation UpdateTrainingPlanDetails($input: UpdateTrainingPlanDetailsInput!) {
  updateTrainingPlanDetails(input: $input)
}
    `;

export const useUpdateTrainingPlanDetailsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateTrainingPlanDetailsMutation, TError, GQLUpdateTrainingPlanDetailsMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateTrainingPlanDetailsMutation, TError, GQLUpdateTrainingPlanDetailsMutationVariables, TContext>(
      {
    mutationKey: ['UpdateTrainingPlanDetails'],
    mutationFn: (variables?: GQLUpdateTrainingPlanDetailsMutationVariables) => fetchData<GQLUpdateTrainingPlanDetailsMutation, GQLUpdateTrainingPlanDetailsMutationVariables>(UpdateTrainingPlanDetailsDocument, variables)(),
    ...options
  }
    )};

useUpdateTrainingPlanDetailsMutation.getKey = () => ['UpdateTrainingPlanDetails'];


useUpdateTrainingPlanDetailsMutation.fetcher = (variables: GQLUpdateTrainingPlanDetailsMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateTrainingPlanDetailsMutation, GQLUpdateTrainingPlanDetailsMutationVariables>(UpdateTrainingPlanDetailsDocument, variables, options);

export const UpdateTrainingWeekDetailsDocument = `
    mutation UpdateTrainingWeekDetails($input: UpdateTrainingWeekDetailsInput!) {
  updateTrainingWeekDetails(input: $input)
}
    `;

export const useUpdateTrainingWeekDetailsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateTrainingWeekDetailsMutation, TError, GQLUpdateTrainingWeekDetailsMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateTrainingWeekDetailsMutation, TError, GQLUpdateTrainingWeekDetailsMutationVariables, TContext>(
      {
    mutationKey: ['UpdateTrainingWeekDetails'],
    mutationFn: (variables?: GQLUpdateTrainingWeekDetailsMutationVariables) => fetchData<GQLUpdateTrainingWeekDetailsMutation, GQLUpdateTrainingWeekDetailsMutationVariables>(UpdateTrainingWeekDetailsDocument, variables)(),
    ...options
  }
    )};

useUpdateTrainingWeekDetailsMutation.getKey = () => ['UpdateTrainingWeekDetails'];


useUpdateTrainingWeekDetailsMutation.fetcher = (variables: GQLUpdateTrainingWeekDetailsMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateTrainingWeekDetailsMutation, GQLUpdateTrainingWeekDetailsMutationVariables>(UpdateTrainingWeekDetailsDocument, variables, options);

export const DuplicateTrainingWeekDocument = `
    mutation DuplicateTrainingWeek($input: DuplicateTrainingWeekInput!) {
  duplicateTrainingWeek(input: $input)
}
    `;

export const useDuplicateTrainingWeekMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDuplicateTrainingWeekMutation, TError, GQLDuplicateTrainingWeekMutationVariables, TContext>) => {
    
    return useMutation<GQLDuplicateTrainingWeekMutation, TError, GQLDuplicateTrainingWeekMutationVariables, TContext>(
      {
    mutationKey: ['DuplicateTrainingWeek'],
    mutationFn: (variables?: GQLDuplicateTrainingWeekMutationVariables) => fetchData<GQLDuplicateTrainingWeekMutation, GQLDuplicateTrainingWeekMutationVariables>(DuplicateTrainingWeekDocument, variables)(),
    ...options
  }
    )};

useDuplicateTrainingWeekMutation.getKey = () => ['DuplicateTrainingWeek'];


useDuplicateTrainingWeekMutation.fetcher = (variables: GQLDuplicateTrainingWeekMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDuplicateTrainingWeekMutation, GQLDuplicateTrainingWeekMutationVariables>(DuplicateTrainingWeekDocument, variables, options);

export const RemoveTrainingWeekDocument = `
    mutation RemoveTrainingWeek($weekId: ID!) {
  removeTrainingWeek(weekId: $weekId)
}
    `;

export const useRemoveTrainingWeekMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveTrainingWeekMutation, TError, GQLRemoveTrainingWeekMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveTrainingWeekMutation, TError, GQLRemoveTrainingWeekMutationVariables, TContext>(
      {
    mutationKey: ['RemoveTrainingWeek'],
    mutationFn: (variables?: GQLRemoveTrainingWeekMutationVariables) => fetchData<GQLRemoveTrainingWeekMutation, GQLRemoveTrainingWeekMutationVariables>(RemoveTrainingWeekDocument, variables)(),
    ...options
  }
    )};

useRemoveTrainingWeekMutation.getKey = () => ['RemoveTrainingWeek'];


useRemoveTrainingWeekMutation.fetcher = (variables: GQLRemoveTrainingWeekMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveTrainingWeekMutation, GQLRemoveTrainingWeekMutationVariables>(RemoveTrainingWeekDocument, variables, options);

export const AddTrainingWeekDocument = `
    mutation AddTrainingWeek($input: AddTrainingWeekInput!) {
  addTrainingWeek(input: $input)
}
    `;

export const useAddTrainingWeekMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAddTrainingWeekMutation, TError, GQLAddTrainingWeekMutationVariables, TContext>) => {
    
    return useMutation<GQLAddTrainingWeekMutation, TError, GQLAddTrainingWeekMutationVariables, TContext>(
      {
    mutationKey: ['AddTrainingWeek'],
    mutationFn: (variables?: GQLAddTrainingWeekMutationVariables) => fetchData<GQLAddTrainingWeekMutation, GQLAddTrainingWeekMutationVariables>(AddTrainingWeekDocument, variables)(),
    ...options
  }
    )};

useAddTrainingWeekMutation.getKey = () => ['AddTrainingWeek'];


useAddTrainingWeekMutation.fetcher = (variables: GQLAddTrainingWeekMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAddTrainingWeekMutation, GQLAddTrainingWeekMutationVariables>(AddTrainingWeekDocument, variables, options);

export const UpdateTrainingDayDataDocument = `
    mutation UpdateTrainingDayData($input: UpdateTrainingDayDataInput!) {
  updateTrainingDayData(input: $input)
}
    `;

export const useUpdateTrainingDayDataMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateTrainingDayDataMutation, TError, GQLUpdateTrainingDayDataMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateTrainingDayDataMutation, TError, GQLUpdateTrainingDayDataMutationVariables, TContext>(
      {
    mutationKey: ['UpdateTrainingDayData'],
    mutationFn: (variables?: GQLUpdateTrainingDayDataMutationVariables) => fetchData<GQLUpdateTrainingDayDataMutation, GQLUpdateTrainingDayDataMutationVariables>(UpdateTrainingDayDataDocument, variables)(),
    ...options
  }
    )};

useUpdateTrainingDayDataMutation.getKey = () => ['UpdateTrainingDayData'];


useUpdateTrainingDayDataMutation.fetcher = (variables: GQLUpdateTrainingDayDataMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateTrainingDayDataMutation, GQLUpdateTrainingDayDataMutationVariables>(UpdateTrainingDayDataDocument, variables, options);

export const UpdateTrainingExerciseDocument = `
    mutation UpdateTrainingExercise($input: UpdateTrainingExerciseInput!) {
  updateTrainingExercise(input: $input)
}
    `;

export const useUpdateTrainingExerciseMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateTrainingExerciseMutation, TError, GQLUpdateTrainingExerciseMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateTrainingExerciseMutation, TError, GQLUpdateTrainingExerciseMutationVariables, TContext>(
      {
    mutationKey: ['UpdateTrainingExercise'],
    mutationFn: (variables?: GQLUpdateTrainingExerciseMutationVariables) => fetchData<GQLUpdateTrainingExerciseMutation, GQLUpdateTrainingExerciseMutationVariables>(UpdateTrainingExerciseDocument, variables)(),
    ...options
  }
    )};

useUpdateTrainingExerciseMutation.getKey = () => ['UpdateTrainingExercise'];


useUpdateTrainingExerciseMutation.fetcher = (variables: GQLUpdateTrainingExerciseMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateTrainingExerciseMutation, GQLUpdateTrainingExerciseMutationVariables>(UpdateTrainingExerciseDocument, variables, options);

export const UpdateExerciseSetDocument = `
    mutation UpdateExerciseSet($input: UpdateExerciseSetInput!) {
  updateExerciseSet(input: $input)
}
    `;

export const useUpdateExerciseSetMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateExerciseSetMutation, TError, GQLUpdateExerciseSetMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateExerciseSetMutation, TError, GQLUpdateExerciseSetMutationVariables, TContext>(
      {
    mutationKey: ['UpdateExerciseSet'],
    mutationFn: (variables?: GQLUpdateExerciseSetMutationVariables) => fetchData<GQLUpdateExerciseSetMutation, GQLUpdateExerciseSetMutationVariables>(UpdateExerciseSetDocument, variables)(),
    ...options
  }
    )};

useUpdateExerciseSetMutation.getKey = () => ['UpdateExerciseSet'];


useUpdateExerciseSetMutation.fetcher = (variables: GQLUpdateExerciseSetMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateExerciseSetMutation, GQLUpdateExerciseSetMutationVariables>(UpdateExerciseSetDocument, variables, options);

export const AddExerciseToDayDocument = `
    mutation AddExerciseToDay($input: AddExerciseToDayInput!) {
  addExerciseToDay(input: $input)
}
    `;

export const useAddExerciseToDayMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAddExerciseToDayMutation, TError, GQLAddExerciseToDayMutationVariables, TContext>) => {
    
    return useMutation<GQLAddExerciseToDayMutation, TError, GQLAddExerciseToDayMutationVariables, TContext>(
      {
    mutationKey: ['AddExerciseToDay'],
    mutationFn: (variables?: GQLAddExerciseToDayMutationVariables) => fetchData<GQLAddExerciseToDayMutation, GQLAddExerciseToDayMutationVariables>(AddExerciseToDayDocument, variables)(),
    ...options
  }
    )};

useAddExerciseToDayMutation.getKey = () => ['AddExerciseToDay'];


useAddExerciseToDayMutation.fetcher = (variables: GQLAddExerciseToDayMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAddExerciseToDayMutation, GQLAddExerciseToDayMutationVariables>(AddExerciseToDayDocument, variables, options);

export const RemoveExerciseFromDayDocument = `
    mutation RemoveExerciseFromDay($exerciseId: ID!) {
  removeExerciseFromDay(exerciseId: $exerciseId)
}
    `;

export const useRemoveExerciseFromDayMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveExerciseFromDayMutation, TError, GQLRemoveExerciseFromDayMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveExerciseFromDayMutation, TError, GQLRemoveExerciseFromDayMutationVariables, TContext>(
      {
    mutationKey: ['RemoveExerciseFromDay'],
    mutationFn: (variables?: GQLRemoveExerciseFromDayMutationVariables) => fetchData<GQLRemoveExerciseFromDayMutation, GQLRemoveExerciseFromDayMutationVariables>(RemoveExerciseFromDayDocument, variables)(),
    ...options
  }
    )};

useRemoveExerciseFromDayMutation.getKey = () => ['RemoveExerciseFromDay'];


useRemoveExerciseFromDayMutation.fetcher = (variables: GQLRemoveExerciseFromDayMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveExerciseFromDayMutation, GQLRemoveExerciseFromDayMutationVariables>(RemoveExerciseFromDayDocument, variables, options);

export const RemoveAllExercisesFromDayDocument = `
    mutation RemoveAllExercisesFromDay($input: RemoveAllExercisesFromDayInput!) {
  removeAllExercisesFromDay(input: $input)
}
    `;

export const useRemoveAllExercisesFromDayMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveAllExercisesFromDayMutation, TError, GQLRemoveAllExercisesFromDayMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveAllExercisesFromDayMutation, TError, GQLRemoveAllExercisesFromDayMutationVariables, TContext>(
      {
    mutationKey: ['RemoveAllExercisesFromDay'],
    mutationFn: (variables?: GQLRemoveAllExercisesFromDayMutationVariables) => fetchData<GQLRemoveAllExercisesFromDayMutation, GQLRemoveAllExercisesFromDayMutationVariables>(RemoveAllExercisesFromDayDocument, variables)(),
    ...options
  }
    )};

useRemoveAllExercisesFromDayMutation.getKey = () => ['RemoveAllExercisesFromDay'];


useRemoveAllExercisesFromDayMutation.fetcher = (variables: GQLRemoveAllExercisesFromDayMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveAllExercisesFromDayMutation, GQLRemoveAllExercisesFromDayMutationVariables>(RemoveAllExercisesFromDayDocument, variables, options);

export const MoveExerciseDocument = `
    mutation MoveExercise($input: MoveExerciseInput!) {
  moveExercise(input: $input)
}
    `;

export const useMoveExerciseMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLMoveExerciseMutation, TError, GQLMoveExerciseMutationVariables, TContext>) => {
    
    return useMutation<GQLMoveExerciseMutation, TError, GQLMoveExerciseMutationVariables, TContext>(
      {
    mutationKey: ['MoveExercise'],
    mutationFn: (variables?: GQLMoveExerciseMutationVariables) => fetchData<GQLMoveExerciseMutation, GQLMoveExerciseMutationVariables>(MoveExerciseDocument, variables)(),
    ...options
  }
    )};

useMoveExerciseMutation.getKey = () => ['MoveExercise'];


useMoveExerciseMutation.fetcher = (variables: GQLMoveExerciseMutationVariables, options?: RequestInit['headers']) => fetchData<GQLMoveExerciseMutation, GQLMoveExerciseMutationVariables>(MoveExerciseDocument, variables, options);

export const AddSetToExerciseDocument = `
    mutation AddSetToExercise($input: AddSetToExerciseInput!) {
  addSetToExercise(input: $input)
}
    `;

export const useAddSetToExerciseMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAddSetToExerciseMutation, TError, GQLAddSetToExerciseMutationVariables, TContext>) => {
    
    return useMutation<GQLAddSetToExerciseMutation, TError, GQLAddSetToExerciseMutationVariables, TContext>(
      {
    mutationKey: ['AddSetToExercise'],
    mutationFn: (variables?: GQLAddSetToExerciseMutationVariables) => fetchData<GQLAddSetToExerciseMutation, GQLAddSetToExerciseMutationVariables>(AddSetToExerciseDocument, variables)(),
    ...options
  }
    )};

useAddSetToExerciseMutation.getKey = () => ['AddSetToExercise'];


useAddSetToExerciseMutation.fetcher = (variables: GQLAddSetToExerciseMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAddSetToExerciseMutation, GQLAddSetToExerciseMutationVariables>(AddSetToExerciseDocument, variables, options);

export const RemoveSetFromExerciseDocument = `
    mutation RemoveSetFromExercise($setId: ID!) {
  removeSetFromExercise(setId: $setId)
}
    `;

export const useRemoveSetFromExerciseMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveSetFromExerciseMutation, TError, GQLRemoveSetFromExerciseMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveSetFromExerciseMutation, TError, GQLRemoveSetFromExerciseMutationVariables, TContext>(
      {
    mutationKey: ['RemoveSetFromExercise'],
    mutationFn: (variables?: GQLRemoveSetFromExerciseMutationVariables) => fetchData<GQLRemoveSetFromExerciseMutation, GQLRemoveSetFromExerciseMutationVariables>(RemoveSetFromExerciseDocument, variables)(),
    ...options
  }
    )};

useRemoveSetFromExerciseMutation.getKey = () => ['RemoveSetFromExercise'];


useRemoveSetFromExerciseMutation.fetcher = (variables: GQLRemoveSetFromExerciseMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveSetFromExerciseMutation, GQLRemoveSetFromExerciseMutationVariables>(RemoveSetFromExerciseDocument, variables, options);

export const CopyExercisesFromDayDocument = `
    mutation CopyExercisesFromDay($input: CopyExercisesFromDayInput!) {
  copyExercisesFromDay(input: $input)
}
    `;

export const useCopyExercisesFromDayMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCopyExercisesFromDayMutation, TError, GQLCopyExercisesFromDayMutationVariables, TContext>) => {
    
    return useMutation<GQLCopyExercisesFromDayMutation, TError, GQLCopyExercisesFromDayMutationVariables, TContext>(
      {
    mutationKey: ['CopyExercisesFromDay'],
    mutationFn: (variables?: GQLCopyExercisesFromDayMutationVariables) => fetchData<GQLCopyExercisesFromDayMutation, GQLCopyExercisesFromDayMutationVariables>(CopyExercisesFromDayDocument, variables)(),
    ...options
  }
    )};

useCopyExercisesFromDayMutation.getKey = () => ['CopyExercisesFromDay'];


useCopyExercisesFromDayMutation.fetcher = (variables: GQLCopyExercisesFromDayMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCopyExercisesFromDayMutation, GQLCopyExercisesFromDayMutationVariables>(CopyExercisesFromDayDocument, variables, options);

export const CreateDraftTemplateDocument = `
    mutation CreateDraftTemplate {
  createDraftTemplate {
    id
    title
    description
    weeks {
      id
      weekNumber
      name
      days {
        id
        dayOfWeek
        isRestDay
        workoutType
      }
    }
  }
}
    `;

export const useCreateDraftTemplateMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateDraftTemplateMutation, TError, GQLCreateDraftTemplateMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateDraftTemplateMutation, TError, GQLCreateDraftTemplateMutationVariables, TContext>(
      {
    mutationKey: ['CreateDraftTemplate'],
    mutationFn: (variables?: GQLCreateDraftTemplateMutationVariables) => fetchData<GQLCreateDraftTemplateMutation, GQLCreateDraftTemplateMutationVariables>(CreateDraftTemplateDocument, variables)(),
    ...options
  }
    )};

useCreateDraftTemplateMutation.getKey = () => ['CreateDraftTemplate'];


useCreateDraftTemplateMutation.fetcher = (variables?: GQLCreateDraftTemplateMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateDraftTemplateMutation, GQLCreateDraftTemplateMutationVariables>(CreateDraftTemplateDocument, variables, options);

export const GetExerciseFormDataDocument = `
    query GetExerciseFormData($exerciseId: ID!) {
  exercise: getTrainingExercise(id: $exerciseId) {
    id
    name
    instructions
    additionalInstructions
    type
    restSeconds
    warmupSets
    tempo
    videoUrl
    completedAt
    substitutes {
      id
      substitute {
        name
      }
    }
    sets {
      id
      order
      minReps
      maxReps
      weight
      rpe
      completedAt
    }
  }
}
    `;

export const useGetExerciseFormDataQuery = <
      TData = GQLGetExerciseFormDataQuery,
      TError = unknown
    >(
      variables: GQLGetExerciseFormDataQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetExerciseFormDataQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetExerciseFormDataQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetExerciseFormDataQuery, TError, TData>(
      {
    queryKey: ['GetExerciseFormData', variables],
    queryFn: fetchData<GQLGetExerciseFormDataQuery, GQLGetExerciseFormDataQueryVariables>(GetExerciseFormDataDocument, variables),
    ...options
  }
    )};

useGetExerciseFormDataQuery.getKey = (variables: GQLGetExerciseFormDataQueryVariables) => ['GetExerciseFormData', variables];

export const useInfiniteGetExerciseFormDataQuery = <
      TData = InfiniteData<GQLGetExerciseFormDataQuery>,
      TError = unknown
    >(
      variables: GQLGetExerciseFormDataQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetExerciseFormDataQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetExerciseFormDataQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetExerciseFormDataQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetExerciseFormData.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetExerciseFormDataQuery, GQLGetExerciseFormDataQueryVariables>(GetExerciseFormDataDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetExerciseFormDataQuery.getKey = (variables: GQLGetExerciseFormDataQueryVariables) => ['GetExerciseFormData.infinite', variables];


useGetExerciseFormDataQuery.fetcher = (variables: GQLGetExerciseFormDataQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetExerciseFormDataQuery, GQLGetExerciseFormDataQueryVariables>(GetExerciseFormDataDocument, variables, options);

export const UpdateExerciseFormDocument = `
    mutation UpdateExerciseForm($input: UpdateExerciseFormInput!) {
  updateExerciseForm(input: $input) {
    id
    name
    instructions
    additionalInstructions
    type
    restSeconds
    warmupSets
    tempo
    videoUrl
    sets {
      id
      order
      minReps
      maxReps
      weight
      rpe
    }
  }
}
    `;

export const useUpdateExerciseFormMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateExerciseFormMutation, TError, GQLUpdateExerciseFormMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateExerciseFormMutation, TError, GQLUpdateExerciseFormMutationVariables, TContext>(
      {
    mutationKey: ['UpdateExerciseForm'],
    mutationFn: (variables?: GQLUpdateExerciseFormMutationVariables) => fetchData<GQLUpdateExerciseFormMutation, GQLUpdateExerciseFormMutationVariables>(UpdateExerciseFormDocument, variables)(),
    ...options
  }
    )};

useUpdateExerciseFormMutation.getKey = () => ['UpdateExerciseForm'];


useUpdateExerciseFormMutation.fetcher = (variables: GQLUpdateExerciseFormMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateExerciseFormMutation, GQLUpdateExerciseFormMutationVariables>(UpdateExerciseFormDocument, variables, options);

export const AddSetExerciseFormDocument = `
    mutation AddSetExerciseForm($input: AddSetExerciseFormInput!) {
  addSetExerciseForm(input: $input) {
    id
  }
}
    `;

export const useAddSetExerciseFormMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAddSetExerciseFormMutation, TError, GQLAddSetExerciseFormMutationVariables, TContext>) => {
    
    return useMutation<GQLAddSetExerciseFormMutation, TError, GQLAddSetExerciseFormMutationVariables, TContext>(
      {
    mutationKey: ['AddSetExerciseForm'],
    mutationFn: (variables?: GQLAddSetExerciseFormMutationVariables) => fetchData<GQLAddSetExerciseFormMutation, GQLAddSetExerciseFormMutationVariables>(AddSetExerciseFormDocument, variables)(),
    ...options
  }
    )};

useAddSetExerciseFormMutation.getKey = () => ['AddSetExerciseForm'];


useAddSetExerciseFormMutation.fetcher = (variables: GQLAddSetExerciseFormMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAddSetExerciseFormMutation, GQLAddSetExerciseFormMutationVariables>(AddSetExerciseFormDocument, variables, options);

export const RemoveSetExerciseFormDocument = `
    mutation RemoveSetExerciseForm($setId: ID!) {
  removeSetExerciseForm(setId: $setId)
}
    `;

export const useRemoveSetExerciseFormMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveSetExerciseFormMutation, TError, GQLRemoveSetExerciseFormMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveSetExerciseFormMutation, TError, GQLRemoveSetExerciseFormMutationVariables, TContext>(
      {
    mutationKey: ['RemoveSetExerciseForm'],
    mutationFn: (variables?: GQLRemoveSetExerciseFormMutationVariables) => fetchData<GQLRemoveSetExerciseFormMutation, GQLRemoveSetExerciseFormMutationVariables>(RemoveSetExerciseFormDocument, variables)(),
    ...options
  }
    )};

useRemoveSetExerciseFormMutation.getKey = () => ['RemoveSetExerciseForm'];


useRemoveSetExerciseFormMutation.fetcher = (variables: GQLRemoveSetExerciseFormMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveSetExerciseFormMutation, GQLRemoveSetExerciseFormMutationVariables>(RemoveSetExerciseFormDocument, variables, options);

export const MyCoachingRequestsDocument = `
    query MyCoachingRequests {
  coachingRequests {
    id
    message
    createdAt
    updatedAt
    status
    recipient {
      id
      name
      email
    }
    sender {
      id
      name
      email
    }
  }
}
    `;

export const useMyCoachingRequestsQuery = <
      TData = GQLMyCoachingRequestsQuery,
      TError = unknown
    >(
      variables?: GQLMyCoachingRequestsQueryVariables,
      options?: Omit<UseQueryOptions<GQLMyCoachingRequestsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLMyCoachingRequestsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLMyCoachingRequestsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['MyCoachingRequests'] : ['MyCoachingRequests', variables],
    queryFn: fetchData<GQLMyCoachingRequestsQuery, GQLMyCoachingRequestsQueryVariables>(MyCoachingRequestsDocument, variables),
    ...options
  }
    )};

useMyCoachingRequestsQuery.getKey = (variables?: GQLMyCoachingRequestsQueryVariables) => variables === undefined ? ['MyCoachingRequests'] : ['MyCoachingRequests', variables];

export const useInfiniteMyCoachingRequestsQuery = <
      TData = InfiniteData<GQLMyCoachingRequestsQuery>,
      TError = unknown
    >(
      variables: GQLMyCoachingRequestsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLMyCoachingRequestsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLMyCoachingRequestsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLMyCoachingRequestsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['MyCoachingRequests.infinite'] : ['MyCoachingRequests.infinite', variables],
      queryFn: (metaData) => fetchData<GQLMyCoachingRequestsQuery, GQLMyCoachingRequestsQueryVariables>(MyCoachingRequestsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteMyCoachingRequestsQuery.getKey = (variables?: GQLMyCoachingRequestsQueryVariables) => variables === undefined ? ['MyCoachingRequests.infinite'] : ['MyCoachingRequests.infinite', variables];


useMyCoachingRequestsQuery.fetcher = (variables?: GQLMyCoachingRequestsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLMyCoachingRequestsQuery, GQLMyCoachingRequestsQueryVariables>(MyCoachingRequestsDocument, variables, options);

export const MyCoachingRequestDocument = `
    query MyCoachingRequest($id: ID!) {
  coachingRequest(id: $id) {
    id
    message
    createdAt
    updatedAt
    status
    recipient {
      id
      name
      email
    }
    sender {
      id
      name
      email
    }
  }
}
    `;

export const useMyCoachingRequestQuery = <
      TData = GQLMyCoachingRequestQuery,
      TError = unknown
    >(
      variables: GQLMyCoachingRequestQueryVariables,
      options?: Omit<UseQueryOptions<GQLMyCoachingRequestQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLMyCoachingRequestQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLMyCoachingRequestQuery, TError, TData>(
      {
    queryKey: ['MyCoachingRequest', variables],
    queryFn: fetchData<GQLMyCoachingRequestQuery, GQLMyCoachingRequestQueryVariables>(MyCoachingRequestDocument, variables),
    ...options
  }
    )};

useMyCoachingRequestQuery.getKey = (variables: GQLMyCoachingRequestQueryVariables) => ['MyCoachingRequest', variables];

export const useInfiniteMyCoachingRequestQuery = <
      TData = InfiniteData<GQLMyCoachingRequestQuery>,
      TError = unknown
    >(
      variables: GQLMyCoachingRequestQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLMyCoachingRequestQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLMyCoachingRequestQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLMyCoachingRequestQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['MyCoachingRequest.infinite', variables],
      queryFn: (metaData) => fetchData<GQLMyCoachingRequestQuery, GQLMyCoachingRequestQueryVariables>(MyCoachingRequestDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteMyCoachingRequestQuery.getKey = (variables: GQLMyCoachingRequestQueryVariables) => ['MyCoachingRequest.infinite', variables];


useMyCoachingRequestQuery.fetcher = (variables: GQLMyCoachingRequestQueryVariables, options?: RequestInit['headers']) => fetchData<GQLMyCoachingRequestQuery, GQLMyCoachingRequestQueryVariables>(MyCoachingRequestDocument, variables, options);

export const AcceptCoachingRequestDocument = `
    mutation AcceptCoachingRequest($id: ID!) {
  acceptCoachingRequest(id: $id) {
    id
  }
}
    `;

export const useAcceptCoachingRequestMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAcceptCoachingRequestMutation, TError, GQLAcceptCoachingRequestMutationVariables, TContext>) => {
    
    return useMutation<GQLAcceptCoachingRequestMutation, TError, GQLAcceptCoachingRequestMutationVariables, TContext>(
      {
    mutationKey: ['AcceptCoachingRequest'],
    mutationFn: (variables?: GQLAcceptCoachingRequestMutationVariables) => fetchData<GQLAcceptCoachingRequestMutation, GQLAcceptCoachingRequestMutationVariables>(AcceptCoachingRequestDocument, variables)(),
    ...options
  }
    )};

useAcceptCoachingRequestMutation.getKey = () => ['AcceptCoachingRequest'];


useAcceptCoachingRequestMutation.fetcher = (variables: GQLAcceptCoachingRequestMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAcceptCoachingRequestMutation, GQLAcceptCoachingRequestMutationVariables>(AcceptCoachingRequestDocument, variables, options);

export const RejectCoachingRequestDocument = `
    mutation RejectCoachingRequest($id: ID!) {
  rejectCoachingRequest(id: $id) {
    id
  }
}
    `;

export const useRejectCoachingRequestMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRejectCoachingRequestMutation, TError, GQLRejectCoachingRequestMutationVariables, TContext>) => {
    
    return useMutation<GQLRejectCoachingRequestMutation, TError, GQLRejectCoachingRequestMutationVariables, TContext>(
      {
    mutationKey: ['RejectCoachingRequest'],
    mutationFn: (variables?: GQLRejectCoachingRequestMutationVariables) => fetchData<GQLRejectCoachingRequestMutation, GQLRejectCoachingRequestMutationVariables>(RejectCoachingRequestDocument, variables)(),
    ...options
  }
    )};

useRejectCoachingRequestMutation.getKey = () => ['RejectCoachingRequest'];


useRejectCoachingRequestMutation.fetcher = (variables: GQLRejectCoachingRequestMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRejectCoachingRequestMutation, GQLRejectCoachingRequestMutationVariables>(RejectCoachingRequestDocument, variables, options);

export const CancelCoachingRequestDocument = `
    mutation CancelCoachingRequest($id: ID!) {
  cancelCoachingRequest(id: $id) {
    id
  }
}
    `;

export const useCancelCoachingRequestMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCancelCoachingRequestMutation, TError, GQLCancelCoachingRequestMutationVariables, TContext>) => {
    
    return useMutation<GQLCancelCoachingRequestMutation, TError, GQLCancelCoachingRequestMutationVariables, TContext>(
      {
    mutationKey: ['CancelCoachingRequest'],
    mutationFn: (variables?: GQLCancelCoachingRequestMutationVariables) => fetchData<GQLCancelCoachingRequestMutation, GQLCancelCoachingRequestMutationVariables>(CancelCoachingRequestDocument, variables)(),
    ...options
  }
    )};

useCancelCoachingRequestMutation.getKey = () => ['CancelCoachingRequest'];


useCancelCoachingRequestMutation.fetcher = (variables: GQLCancelCoachingRequestMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCancelCoachingRequestMutation, GQLCancelCoachingRequestMutationVariables>(CancelCoachingRequestDocument, variables, options);

export const GetNotesDocument = `
    query GetNotes($relatedTo: ID) {
  notes(relatedTo: $relatedTo) {
    id
    text
    createdAt
    updatedAt
    shareWithTrainer
    createdBy {
      id
      firstName
      lastName
      image
      role
    }
  }
}
    `;

export const useGetNotesQuery = <
      TData = GQLGetNotesQuery,
      TError = unknown
    >(
      variables?: GQLGetNotesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetNotesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetNotesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetNotesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetNotes'] : ['GetNotes', variables],
    queryFn: fetchData<GQLGetNotesQuery, GQLGetNotesQueryVariables>(GetNotesDocument, variables),
    ...options
  }
    )};

useGetNotesQuery.getKey = (variables?: GQLGetNotesQueryVariables) => variables === undefined ? ['GetNotes'] : ['GetNotes', variables];

export const useInfiniteGetNotesQuery = <
      TData = InfiniteData<GQLGetNotesQuery>,
      TError = unknown
    >(
      variables: GQLGetNotesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetNotesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetNotesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetNotesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetNotes.infinite'] : ['GetNotes.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetNotesQuery, GQLGetNotesQueryVariables>(GetNotesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetNotesQuery.getKey = (variables?: GQLGetNotesQueryVariables) => variables === undefined ? ['GetNotes.infinite'] : ['GetNotes.infinite', variables];


useGetNotesQuery.fetcher = (variables?: GQLGetNotesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetNotesQuery, GQLGetNotesQueryVariables>(GetNotesDocument, variables, options);

export const GetNoteDocument = `
    query GetNote($id: ID!, $relatedTo: ID) {
  note(id: $id, relatedTo: $relatedTo) {
    id
    text
    createdAt
    updatedAt
    shareWithTrainer
    createdBy {
      id
      firstName
      lastName
      image
      role
    }
  }
}
    `;

export const useGetNoteQuery = <
      TData = GQLGetNoteQuery,
      TError = unknown
    >(
      variables: GQLGetNoteQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetNoteQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetNoteQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetNoteQuery, TError, TData>(
      {
    queryKey: ['GetNote', variables],
    queryFn: fetchData<GQLGetNoteQuery, GQLGetNoteQueryVariables>(GetNoteDocument, variables),
    ...options
  }
    )};

useGetNoteQuery.getKey = (variables: GQLGetNoteQueryVariables) => ['GetNote', variables];

export const useInfiniteGetNoteQuery = <
      TData = InfiniteData<GQLGetNoteQuery>,
      TError = unknown
    >(
      variables: GQLGetNoteQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetNoteQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetNoteQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetNoteQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetNote.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetNoteQuery, GQLGetNoteQueryVariables>(GetNoteDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetNoteQuery.getKey = (variables: GQLGetNoteQueryVariables) => ['GetNote.infinite', variables];


useGetNoteQuery.fetcher = (variables: GQLGetNoteQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetNoteQuery, GQLGetNoteQueryVariables>(GetNoteDocument, variables, options);

export const GetExerciseNotesDocument = `
    query GetExerciseNotes($exerciseName: String!) {
  exerciseNotes(exerciseName: $exerciseName) {
    id
    text
    createdAt
    updatedAt
    shareWithTrainer
    createdBy {
      id
      firstName
      lastName
      image
      role
    }
  }
}
    `;

export const useGetExerciseNotesQuery = <
      TData = GQLGetExerciseNotesQuery,
      TError = unknown
    >(
      variables: GQLGetExerciseNotesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetExerciseNotesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetExerciseNotesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetExerciseNotesQuery, TError, TData>(
      {
    queryKey: ['GetExerciseNotes', variables],
    queryFn: fetchData<GQLGetExerciseNotesQuery, GQLGetExerciseNotesQueryVariables>(GetExerciseNotesDocument, variables),
    ...options
  }
    )};

useGetExerciseNotesQuery.getKey = (variables: GQLGetExerciseNotesQueryVariables) => ['GetExerciseNotes', variables];

export const useInfiniteGetExerciseNotesQuery = <
      TData = InfiniteData<GQLGetExerciseNotesQuery>,
      TError = unknown
    >(
      variables: GQLGetExerciseNotesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetExerciseNotesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetExerciseNotesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetExerciseNotesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetExerciseNotes.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetExerciseNotesQuery, GQLGetExerciseNotesQueryVariables>(GetExerciseNotesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetExerciseNotesQuery.getKey = (variables: GQLGetExerciseNotesQueryVariables) => ['GetExerciseNotes.infinite', variables];


useGetExerciseNotesQuery.fetcher = (variables: GQLGetExerciseNotesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetExerciseNotesQuery, GQLGetExerciseNotesQueryVariables>(GetExerciseNotesDocument, variables, options);

export const GetClientSharedNotesDocument = `
    query GetClientSharedNotes($clientId: String!) {
  clientSharedNotes(clientId: $clientId) {
    id
    text
    relatedTo
    createdAt
    updatedAt
    shareWithTrainer
    createdBy {
      id
      firstName
      lastName
      image
      role
    }
  }
}
    `;

export const useGetClientSharedNotesQuery = <
      TData = GQLGetClientSharedNotesQuery,
      TError = unknown
    >(
      variables: GQLGetClientSharedNotesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetClientSharedNotesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetClientSharedNotesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetClientSharedNotesQuery, TError, TData>(
      {
    queryKey: ['GetClientSharedNotes', variables],
    queryFn: fetchData<GQLGetClientSharedNotesQuery, GQLGetClientSharedNotesQueryVariables>(GetClientSharedNotesDocument, variables),
    ...options
  }
    )};

useGetClientSharedNotesQuery.getKey = (variables: GQLGetClientSharedNotesQueryVariables) => ['GetClientSharedNotes', variables];

export const useInfiniteGetClientSharedNotesQuery = <
      TData = InfiniteData<GQLGetClientSharedNotesQuery>,
      TError = unknown
    >(
      variables: GQLGetClientSharedNotesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetClientSharedNotesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetClientSharedNotesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetClientSharedNotesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetClientSharedNotes.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetClientSharedNotesQuery, GQLGetClientSharedNotesQueryVariables>(GetClientSharedNotesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetClientSharedNotesQuery.getKey = (variables: GQLGetClientSharedNotesQueryVariables) => ['GetClientSharedNotes.infinite', variables];


useGetClientSharedNotesQuery.fetcher = (variables: GQLGetClientSharedNotesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetClientSharedNotesQuery, GQLGetClientSharedNotesQueryVariables>(GetClientSharedNotesDocument, variables, options);

export const GetNoteRepliesDocument = `
    query GetNoteReplies($noteId: String!) {
  noteReplies(noteId: $noteId) {
    id
    text
    createdAt
    updatedAt
    createdBy {
      id
      firstName
      lastName
      image
      role
    }
  }
}
    `;

export const useGetNoteRepliesQuery = <
      TData = GQLGetNoteRepliesQuery,
      TError = unknown
    >(
      variables: GQLGetNoteRepliesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetNoteRepliesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetNoteRepliesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetNoteRepliesQuery, TError, TData>(
      {
    queryKey: ['GetNoteReplies', variables],
    queryFn: fetchData<GQLGetNoteRepliesQuery, GQLGetNoteRepliesQueryVariables>(GetNoteRepliesDocument, variables),
    ...options
  }
    )};

useGetNoteRepliesQuery.getKey = (variables: GQLGetNoteRepliesQueryVariables) => ['GetNoteReplies', variables];

export const useInfiniteGetNoteRepliesQuery = <
      TData = InfiniteData<GQLGetNoteRepliesQuery>,
      TError = unknown
    >(
      variables: GQLGetNoteRepliesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetNoteRepliesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetNoteRepliesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetNoteRepliesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetNoteReplies.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetNoteRepliesQuery, GQLGetNoteRepliesQueryVariables>(GetNoteRepliesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetNoteRepliesQuery.getKey = (variables: GQLGetNoteRepliesQueryVariables) => ['GetNoteReplies.infinite', variables];


useGetNoteRepliesQuery.fetcher = (variables: GQLGetNoteRepliesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetNoteRepliesQuery, GQLGetNoteRepliesQueryVariables>(GetNoteRepliesDocument, variables, options);

export const CreateNoteDocument = `
    mutation CreateNote($input: CreateNoteInput!) {
  createNote(input: $input) {
    id
    text
    shareWithTrainer
    createdBy {
      id
      firstName
      lastName
      image
      role
    }
  }
}
    `;

export const useCreateNoteMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateNoteMutation, TError, GQLCreateNoteMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateNoteMutation, TError, GQLCreateNoteMutationVariables, TContext>(
      {
    mutationKey: ['CreateNote'],
    mutationFn: (variables?: GQLCreateNoteMutationVariables) => fetchData<GQLCreateNoteMutation, GQLCreateNoteMutationVariables>(CreateNoteDocument, variables)(),
    ...options
  }
    )};

useCreateNoteMutation.getKey = () => ['CreateNote'];


useCreateNoteMutation.fetcher = (variables: GQLCreateNoteMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateNoteMutation, GQLCreateNoteMutationVariables>(CreateNoteDocument, variables, options);

export const CreateExerciseNoteDocument = `
    mutation CreateExerciseNote($input: CreateExerciseNoteInput!) {
  createExerciseNote(input: $input) {
    id
    text
    shareWithTrainer
    createdBy {
      id
      firstName
      lastName
      image
      role
    }
  }
}
    `;

export const useCreateExerciseNoteMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateExerciseNoteMutation, TError, GQLCreateExerciseNoteMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateExerciseNoteMutation, TError, GQLCreateExerciseNoteMutationVariables, TContext>(
      {
    mutationKey: ['CreateExerciseNote'],
    mutationFn: (variables?: GQLCreateExerciseNoteMutationVariables) => fetchData<GQLCreateExerciseNoteMutation, GQLCreateExerciseNoteMutationVariables>(CreateExerciseNoteDocument, variables)(),
    ...options
  }
    )};

useCreateExerciseNoteMutation.getKey = () => ['CreateExerciseNote'];


useCreateExerciseNoteMutation.fetcher = (variables: GQLCreateExerciseNoteMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateExerciseNoteMutation, GQLCreateExerciseNoteMutationVariables>(CreateExerciseNoteDocument, variables, options);

export const CreateNoteReplyDocument = `
    mutation CreateNoteReply($input: CreateNoteReplyInput!) {
  createNoteReply(input: $input) {
    id
    text
    createdAt
    createdBy {
      id
      firstName
      lastName
      image
      role
    }
  }
}
    `;

export const useCreateNoteReplyMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateNoteReplyMutation, TError, GQLCreateNoteReplyMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateNoteReplyMutation, TError, GQLCreateNoteReplyMutationVariables, TContext>(
      {
    mutationKey: ['CreateNoteReply'],
    mutationFn: (variables?: GQLCreateNoteReplyMutationVariables) => fetchData<GQLCreateNoteReplyMutation, GQLCreateNoteReplyMutationVariables>(CreateNoteReplyDocument, variables)(),
    ...options
  }
    )};

useCreateNoteReplyMutation.getKey = () => ['CreateNoteReply'];


useCreateNoteReplyMutation.fetcher = (variables: GQLCreateNoteReplyMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateNoteReplyMutation, GQLCreateNoteReplyMutationVariables>(CreateNoteReplyDocument, variables, options);

export const UpdateNoteDocument = `
    mutation UpdateNote($input: UpdateNoteInput!) {
  updateNote(input: $input) {
    id
    text
    shareWithTrainer
    createdBy {
      id
      firstName
      lastName
      image
      role
    }
  }
}
    `;

export const useUpdateNoteMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateNoteMutation, TError, GQLUpdateNoteMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateNoteMutation, TError, GQLUpdateNoteMutationVariables, TContext>(
      {
    mutationKey: ['UpdateNote'],
    mutationFn: (variables?: GQLUpdateNoteMutationVariables) => fetchData<GQLUpdateNoteMutation, GQLUpdateNoteMutationVariables>(UpdateNoteDocument, variables)(),
    ...options
  }
    )};

useUpdateNoteMutation.getKey = () => ['UpdateNote'];


useUpdateNoteMutation.fetcher = (variables: GQLUpdateNoteMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateNoteMutation, GQLUpdateNoteMutationVariables>(UpdateNoteDocument, variables, options);

export const DeleteNoteDocument = `
    mutation DeleteNote($id: ID!) {
  deleteNote(id: $id)
}
    `;

export const useDeleteNoteMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDeleteNoteMutation, TError, GQLDeleteNoteMutationVariables, TContext>) => {
    
    return useMutation<GQLDeleteNoteMutation, TError, GQLDeleteNoteMutationVariables, TContext>(
      {
    mutationKey: ['DeleteNote'],
    mutationFn: (variables?: GQLDeleteNoteMutationVariables) => fetchData<GQLDeleteNoteMutation, GQLDeleteNoteMutationVariables>(DeleteNoteDocument, variables)(),
    ...options
  }
    )};

useDeleteNoteMutation.getKey = () => ['DeleteNote'];


useDeleteNoteMutation.fetcher = (variables: GQLDeleteNoteMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDeleteNoteMutation, GQLDeleteNoteMutationVariables>(DeleteNoteDocument, variables, options);

export const UserWithAllDataDocument = `
    query UserWithAllData {
  userWithAllData {
    id
    email
    name
    role
    createdAt
    updatedAt
    profile {
      id
      firstName
      lastName
      phone
      birthday
      sex
    }
    trainer {
      id
    }
    clients {
      id
    }
  }
}
    `;

export const useUserWithAllDataQuery = <
      TData = GQLUserWithAllDataQuery,
      TError = unknown
    >(
      variables?: GQLUserWithAllDataQueryVariables,
      options?: Omit<UseQueryOptions<GQLUserWithAllDataQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLUserWithAllDataQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLUserWithAllDataQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['UserWithAllData'] : ['UserWithAllData', variables],
    queryFn: fetchData<GQLUserWithAllDataQuery, GQLUserWithAllDataQueryVariables>(UserWithAllDataDocument, variables),
    ...options
  }
    )};

useUserWithAllDataQuery.getKey = (variables?: GQLUserWithAllDataQueryVariables) => variables === undefined ? ['UserWithAllData'] : ['UserWithAllData', variables];

export const useInfiniteUserWithAllDataQuery = <
      TData = InfiniteData<GQLUserWithAllDataQuery>,
      TError = unknown
    >(
      variables: GQLUserWithAllDataQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLUserWithAllDataQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLUserWithAllDataQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLUserWithAllDataQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['UserWithAllData.infinite'] : ['UserWithAllData.infinite', variables],
      queryFn: (metaData) => fetchData<GQLUserWithAllDataQuery, GQLUserWithAllDataQueryVariables>(UserWithAllDataDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteUserWithAllDataQuery.getKey = (variables?: GQLUserWithAllDataQueryVariables) => variables === undefined ? ['UserWithAllData.infinite'] : ['UserWithAllData.infinite', variables];


useUserWithAllDataQuery.fetcher = (variables?: GQLUserWithAllDataQueryVariables, options?: RequestInit['headers']) => fetchData<GQLUserWithAllDataQuery, GQLUserWithAllDataQueryVariables>(UserWithAllDataDocument, variables, options);

export const UserBasicDocument = `
    query UserBasic {
  userBasic {
    id
    email
    name
    role
    createdAt
    updatedAt
    profile {
      id
      firstName
      lastName
      phone
      birthday
      sex
    }
    trainer {
      id
    }
  }
}
    `;

export const useUserBasicQuery = <
      TData = GQLUserBasicQuery,
      TError = unknown
    >(
      variables?: GQLUserBasicQueryVariables,
      options?: Omit<UseQueryOptions<GQLUserBasicQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLUserBasicQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLUserBasicQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['UserBasic'] : ['UserBasic', variables],
    queryFn: fetchData<GQLUserBasicQuery, GQLUserBasicQueryVariables>(UserBasicDocument, variables),
    ...options
  }
    )};

useUserBasicQuery.getKey = (variables?: GQLUserBasicQueryVariables) => variables === undefined ? ['UserBasic'] : ['UserBasic', variables];

export const useInfiniteUserBasicQuery = <
      TData = InfiniteData<GQLUserBasicQuery>,
      TError = unknown
    >(
      variables: GQLUserBasicQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLUserBasicQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLUserBasicQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLUserBasicQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['UserBasic.infinite'] : ['UserBasic.infinite', variables],
      queryFn: (metaData) => fetchData<GQLUserBasicQuery, GQLUserBasicQueryVariables>(UserBasicDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteUserBasicQuery.getKey = (variables?: GQLUserBasicQueryVariables) => variables === undefined ? ['UserBasic.infinite'] : ['UserBasic.infinite', variables];


useUserBasicQuery.fetcher = (variables?: GQLUserBasicQueryVariables, options?: RequestInit['headers']) => fetchData<GQLUserBasicQuery, GQLUserBasicQueryVariables>(UserBasicDocument, variables, options);

export const NotificationsDocument = `
    query Notifications($userId: ID!, $read: Boolean, $type: NotificationType, $skip: Int, $take: Int) {
  notifications(
    userId: $userId
    read: $read
    type: $type
    skip: $skip
    take: $take
  ) {
    id
    message
    createdAt
    type
    read
    link
    createdBy
    relatedItemId
  }
}
    `;

export const useNotificationsQuery = <
      TData = GQLNotificationsQuery,
      TError = unknown
    >(
      variables: GQLNotificationsQueryVariables,
      options?: Omit<UseQueryOptions<GQLNotificationsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLNotificationsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLNotificationsQuery, TError, TData>(
      {
    queryKey: ['Notifications', variables],
    queryFn: fetchData<GQLNotificationsQuery, GQLNotificationsQueryVariables>(NotificationsDocument, variables),
    ...options
  }
    )};

useNotificationsQuery.getKey = (variables: GQLNotificationsQueryVariables) => ['Notifications', variables];

export const useInfiniteNotificationsQuery = <
      TData = InfiniteData<GQLNotificationsQuery>,
      TError = unknown
    >(
      variables: GQLNotificationsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLNotificationsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLNotificationsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLNotificationsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['Notifications.infinite', variables],
      queryFn: (metaData) => fetchData<GQLNotificationsQuery, GQLNotificationsQueryVariables>(NotificationsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteNotificationsQuery.getKey = (variables: GQLNotificationsQueryVariables) => ['Notifications.infinite', variables];


useNotificationsQuery.fetcher = (variables: GQLNotificationsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLNotificationsQuery, GQLNotificationsQueryVariables>(NotificationsDocument, variables, options);

export const MarkNotificationAsReadDocument = `
    mutation MarkNotificationAsRead($id: ID!) {
  markNotificationRead(id: $id) {
    id
  }
}
    `;

export const useMarkNotificationAsReadMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLMarkNotificationAsReadMutation, TError, GQLMarkNotificationAsReadMutationVariables, TContext>) => {
    
    return useMutation<GQLMarkNotificationAsReadMutation, TError, GQLMarkNotificationAsReadMutationVariables, TContext>(
      {
    mutationKey: ['MarkNotificationAsRead'],
    mutationFn: (variables?: GQLMarkNotificationAsReadMutationVariables) => fetchData<GQLMarkNotificationAsReadMutation, GQLMarkNotificationAsReadMutationVariables>(MarkNotificationAsReadDocument, variables)(),
    ...options
  }
    )};

useMarkNotificationAsReadMutation.getKey = () => ['MarkNotificationAsRead'];


useMarkNotificationAsReadMutation.fetcher = (variables: GQLMarkNotificationAsReadMutationVariables, options?: RequestInit['headers']) => fetchData<GQLMarkNotificationAsReadMutation, GQLMarkNotificationAsReadMutationVariables>(MarkNotificationAsReadDocument, variables, options);

export const MarkAllNotificationsAsReadDocument = `
    mutation MarkAllNotificationsAsRead($userId: ID!) {
  markAllNotificationsRead(userId: $userId) {
    id
  }
}
    `;

export const useMarkAllNotificationsAsReadMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLMarkAllNotificationsAsReadMutation, TError, GQLMarkAllNotificationsAsReadMutationVariables, TContext>) => {
    
    return useMutation<GQLMarkAllNotificationsAsReadMutation, TError, GQLMarkAllNotificationsAsReadMutationVariables, TContext>(
      {
    mutationKey: ['MarkAllNotificationsAsRead'],
    mutationFn: (variables?: GQLMarkAllNotificationsAsReadMutationVariables) => fetchData<GQLMarkAllNotificationsAsReadMutation, GQLMarkAllNotificationsAsReadMutationVariables>(MarkAllNotificationsAsReadDocument, variables)(),
    ...options
  }
    )};

useMarkAllNotificationsAsReadMutation.getKey = () => ['MarkAllNotificationsAsRead'];


useMarkAllNotificationsAsReadMutation.fetcher = (variables: GQLMarkAllNotificationsAsReadMutationVariables, options?: RequestInit['headers']) => fetchData<GQLMarkAllNotificationsAsReadMutation, GQLMarkAllNotificationsAsReadMutationVariables>(MarkAllNotificationsAsReadDocument, variables, options);
