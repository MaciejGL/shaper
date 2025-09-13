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

export type GQLAddTeamLocationInput = {
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  countryCode: Scalars['String']['input'];
  teamId: Scalars['ID']['input'];
};

export type GQLAddTrainingWeekInput = {
  trainingPlanId: Scalars['ID']['input'];
  weekNumber: Scalars['Int']['input'];
};

export type GQLAddUserLocationInput = {
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  countryCode: Scalars['String']['input'];
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

export type GQLAssignTrainingPlanToClientInput = {
  clientId: Scalars['ID']['input'];
  planId: Scalars['ID']['input'];
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type GQLBaseExercise = {
  __typename?: 'BaseExercise';
  additionalInstructions?: Maybe<Scalars['String']['output']>;
  canBeSubstitutedBy: Array<GQLBaseExerciseSubstitute>;
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<GQLUserPublic>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty?: Maybe<Scalars['String']['output']>;
  equipment?: Maybe<GQLEquipment>;
  id: Scalars['ID']['output'];
  images: Array<GQLImage>;
  instructions: Array<Scalars['String']['output']>;
  isPremium: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  muscleGroupCategories: Array<GQLMuscleGroupCategory>;
  muscleGroups: Array<GQLMuscleGroup>;
  name: Scalars['String']['output'];
  secondaryMuscleGroups: Array<GQLMuscleGroup>;
  substitutes: Array<GQLBaseExerciseSubstitute>;
  tips: Array<Scalars['String']['output']>;
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

export type GQLBodyProgressLog = {
  __typename?: 'BodyProgressLog';
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  image1?: Maybe<GQLOptimizedImage>;
  image2?: Maybe<GQLOptimizedImage>;
  image3?: Maybe<GQLOptimizedImage>;
  loggedAt: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  shareWithTrainer: Scalars['Boolean']['output'];
  updatedAt: Scalars['String']['output'];
};

export type GQLChat = {
  __typename?: 'Chat';
  client: GQLUserPublic;
  clientId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastMessage?: Maybe<GQLMessage>;
  messages: Array<GQLMessage>;
  trainer: GQLUserPublic;
  trainerId: Scalars['ID']['output'];
  unreadCount: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
};


export type GQLChatMessagesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type GQLChatWithMessages = {
  __typename?: 'ChatWithMessages';
  client: GQLUserPublic;
  clientId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  hasMoreMessages: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  lastMessage?: Maybe<GQLMessage>;
  messages: Array<GQLMessage>;
  trainer: GQLUserPublic;
  trainerId: Scalars['ID']['output'];
  unreadCount: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
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

export type GQLCopyExercisesFromDayInput = {
  sourceDayId: Scalars['ID']['input'];
  targetDayId: Scalars['ID']['input'];
};

export type GQLCreateBodyProgressLogInput = {
  image1Url?: InputMaybe<Scalars['String']['input']>;
  image2Url?: InputMaybe<Scalars['String']['input']>;
  image3Url?: InputMaybe<Scalars['String']['input']>;
  loggedAt?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  shareWithTrainer?: InputMaybe<Scalars['Boolean']['input']>;
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

export type GQLCreateTeamInput = {
  locations: Array<GQLTeamLocationInput>;
  name: Scalars['String']['input'];
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
  id: Scalars['ID']['output'];
  success: Scalars['Boolean']['output'];
};

export type GQLCreateTrainingWeekInput = {
  days?: InputMaybe<Array<GQLCreateTrainingDayInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  weekNumber: Scalars['Int']['input'];
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

export type GQLEditMessageInput = {
  content: Scalars['String']['input'];
  id: Scalars['ID']['input'];
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
  additionalInstructions?: Maybe<Scalars['String']['output']>;
  base?: Maybe<GQLBaseExercise>;
  baseId?: Maybe<Scalars['ID']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty?: Maybe<Scalars['String']['output']>;
  favouriteWorkoutId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  instructions?: Maybe<Array<Scalars['String']['output']>>;
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  restSeconds?: Maybe<Scalars['Int']['output']>;
  sets: Array<GQLFavouriteWorkoutSet>;
  tips?: Maybe<Array<Scalars['String']['output']>>;
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
  BeginnerFriendly = 'BEGINNER_FRIENDLY',
  Bodyweight = 'BODYWEIGHT',
  BodyRecomposition = 'BODY_RECOMPOSITION',
  Cardio = 'CARDIO',
  Endurance = 'ENDURANCE',
  FunctionalFitness = 'FUNCTIONAL_FITNESS',
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

export type GQLGetWorkoutDayPayload = {
  __typename?: 'GetWorkoutDayPayload';
  day: GQLTrainingDay;
  previousDayLogs: Array<GQLPreviousExerciseLog>;
};

export type GQLGetWorkoutNavigationPayload = {
  __typename?: 'GetWorkoutNavigationPayload';
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
  large?: Maybe<Scalars['String']['output']>;
  medium?: Maybe<Scalars['String']['output']>;
  order: Scalars['Int']['output'];
  thumbnail?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
  url: Scalars['String']['output'];
};

export enum GQLInvitationStatus {
  Accepted = 'ACCEPTED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type GQLInviteTeamMemberInput = {
  email: Scalars['String']['input'];
  teamId: Scalars['ID']['input'];
};

export type GQLLocation = {
  __typename?: 'Location';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  countryCode: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type GQLLogSetInput = {
  loggedReps?: InputMaybe<Scalars['Int']['input']>;
  loggedWeight?: InputMaybe<Scalars['Float']['input']>;
  setId: Scalars['ID']['input'];
};

export type GQLMacroTarget = {
  __typename?: 'MacroTarget';
  calories?: Maybe<Scalars['Int']['output']>;
  carbs?: Maybe<Scalars['Float']['output']>;
  clientId: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  fat?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  protein?: Maybe<Scalars['Float']['output']>;
  trainerId: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export type GQLMarkMessagesAsReadInput = {
  chatId: Scalars['ID']['input'];
};

export type GQLMessage = {
  __typename?: 'Message';
  chatId: Scalars['ID']['output'];
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  isDeleted: Scalars['Boolean']['output'];
  isEdited: Scalars['Boolean']['output'];
  readAt?: Maybe<Scalars['String']['output']>;
  sender: GQLUserPublic;
  senderId: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
};

export type GQLMessengerInitialData = {
  __typename?: 'MessengerInitialData';
  chats: Array<GQLChatWithMessages>;
  totalUnreadCount: Scalars['Int']['output'];
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

export type GQLMuscleGroupDistribution = {
  __typename?: 'MuscleGroupDistribution';
  arms: Scalars['Int']['output'];
  back: Scalars['Int']['output'];
  chest: Scalars['Int']['output'];
  core: Scalars['Int']['output'];
  legs: Scalars['Int']['output'];
  shoulders: Scalars['Int']['output'];
};

export type GQLMuscleGroupFrequency = {
  __typename?: 'MuscleGroupFrequency';
  groupName: Scalars['String']['output'];
  groupSlug: Scalars['String']['output'];
  lastTrained?: Maybe<Scalars['String']['output']>;
  sessionsCount: Scalars['Int']['output'];
  totalSets: Scalars['Int']['output'];
};

export type GQLMutation = {
  __typename?: 'Mutation';
  acceptCoachingRequest?: Maybe<GQLCoachingRequest>;
  activatePlan: Scalars['Boolean']['output'];
  activateUser: Scalars['Boolean']['output'];
  addAiExerciseToWorkout: GQLTrainingExercise;
  addBodyMeasurement: GQLUserBodyMeasure;
  addExerciseToDay: Scalars['ID']['output'];
  addExercisesToQuickWorkout: GQLTrainingPlan;
  addExercisesToWorkout: Array<GQLTrainingExercise>;
  addSet: GQLExerciseSet;
  addSetExerciseForm: GQLExerciseSet;
  addSetToExercise: Scalars['ID']['output'];
  addSubstituteExercise: Scalars['Boolean']['output'];
  addTeamLocation: GQLTeam;
  addTrainingWeek: Scalars['ID']['output'];
  addUserLocation: GQLUserProfile;
  assignTemplateToSelf: Scalars['Boolean']['output'];
  assignTrainingPlanToClient: Scalars['Boolean']['output'];
  cancelCoaching: Scalars['Boolean']['output'];
  cancelCoachingRequest?: Maybe<GQLCoachingRequest>;
  clearTodaysWorkout: Scalars['Boolean']['output'];
  clearUserSessions: Scalars['Boolean']['output'];
  closePlan: Scalars['Boolean']['output'];
  copyExercisesFromDay: Scalars['Boolean']['output'];
  createBodyProgressLog: GQLBodyProgressLog;
  createCoachingRequest: GQLCoachingRequest;
  createDraftTemplate: GQLTrainingPlan;
  createExercise: Scalars['Boolean']['output'];
  createExerciseNote: GQLNote;
  createFavouriteWorkout: GQLFavouriteWorkout;
  createNote: GQLNote;
  createNoteReply: GQLNote;
  createNotification: GQLNotification;
  createPushSubscription: GQLPushSubscription;
  createQuickWorkout: GQLTrainingPlan;
  createReview: Scalars['Boolean']['output'];
  createTeam: GQLTeam;
  createTrainerNoteForClient: GQLNote;
  createTrainingPlan: GQLCreateTrainingPlanPayload;
  deactivateUser: Scalars['Boolean']['output'];
  deleteBodyMeasurement: Scalars['Boolean']['output'];
  deleteBodyProgressLog: Scalars['Boolean']['output'];
  deleteExercise: Scalars['Boolean']['output'];
  deleteFavouriteWorkout: Scalars['Boolean']['output'];
  deleteMessage: Scalars['Boolean']['output'];
  deleteNote: Scalars['Boolean']['output'];
  deleteNotification: Scalars['Boolean']['output'];
  deletePlan: Scalars['Boolean']['output'];
  deletePushSubscription: Scalars['Boolean']['output'];
  deleteReview: Scalars['Boolean']['output'];
  deleteTrainingPlan: Scalars['Boolean']['output'];
  deleteUserAccount: Scalars['Boolean']['output'];
  duplicateTrainingPlan: Scalars['ID']['output'];
  duplicateTrainingWeek: Scalars['ID']['output'];
  editMessage: GQLMessage;
  extendPlan: Scalars['Boolean']['output'];
  generateAiWorkout: GQLAiWorkoutResult;
  getAiExerciseSuggestions: Array<GQLAiExerciseSuggestion>;
  giveLifetimePremium: GQLUserSubscription;
  inviteTeamMember: GQLTeamInvitation;
  logWorkoutProgress: Scalars['ID']['output'];
  logWorkoutSessionEvent: Scalars['ID']['output'];
  markAllNotificationsRead: Array<GQLNotification>;
  markExerciseAsCompleted?: Maybe<Scalars['Boolean']['output']>;
  markMessagesAsRead: Scalars['Boolean']['output'];
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
  removeSet: Scalars['Boolean']['output'];
  removeSetExerciseForm: Scalars['Boolean']['output'];
  removeSetFromExercise: Scalars['Boolean']['output'];
  removeSubstituteExercise: Scalars['Boolean']['output'];
  removeTeamLocation: GQLTeam;
  removeTeamMember: Scalars['Boolean']['output'];
  removeTrainingPlanFromClient: Scalars['Boolean']['output'];
  removeTrainingWeek: Scalars['Boolean']['output'];
  removeUserLocation: GQLUserProfile;
  removeUserSubscription: Scalars['Boolean']['output'];
  removeWeek: Scalars['Boolean']['output'];
  resetUserLogs: Scalars['Boolean']['output'];
  respondToTeamInvitation: GQLTeamInvitation;
  sendMessage: GQLMessage;
  setMacroTargets: GQLMacroTarget;
  startWorkoutFromFavourite: Scalars['ID']['output'];
  swapExercise: GQLSubstitute;
  updateBodyMeasurement: GQLUserBodyMeasure;
  updateBodyProgressLog: GQLBodyProgressLog;
  updateBodyProgressLogSharingStatus: GQLBodyProgressLog;
  updateExercise: Scalars['Boolean']['output'];
  updateExerciseForm: GQLTrainingExercise;
  updateExerciseSet: Scalars['Boolean']['output'];
  updateFavouriteWorkout: GQLFavouriteWorkout;
  updateNote: GQLNote;
  updateNotification: GQLNotification;
  updateProfile?: Maybe<GQLUserProfile>;
  updatePushSubscription: GQLPushSubscription;
  updateReview: Scalars['Boolean']['output'];
  updateServiceDelivery: GQLServiceDelivery;
  updateServiceTask: GQLServiceTask;
  updateSetLog?: Maybe<GQLExerciseSetLog>;
  updateSubstituteExercise: Scalars['Boolean']['output'];
  updateTeam: GQLTeam;
  updateTrainerCapacity: GQLUser;
  updateTrainingDayData: Scalars['Boolean']['output'];
  updateTrainingExercise: Scalars['Boolean']['output'];
  updateTrainingPlan: Scalars['Boolean']['output'];
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


export type GQLMutationAddExerciseToDayArgs = {
  input: GQLAddExerciseToDayInput;
};


export type GQLMutationAddExercisesToQuickWorkoutArgs = {
  exercises: Array<GQLQuickWorkoutExerciseInput>;
};


export type GQLMutationAddExercisesToWorkoutArgs = {
  input: GQLAddExercisesToWorkoutInput;
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


export type GQLMutationAddTeamLocationArgs = {
  input: GQLAddTeamLocationInput;
};


export type GQLMutationAddTrainingWeekArgs = {
  input: GQLAddTrainingWeekInput;
};


export type GQLMutationAddUserLocationArgs = {
  input: GQLAddUserLocationInput;
};


export type GQLMutationAssignTemplateToSelfArgs = {
  planId: Scalars['ID']['input'];
};


export type GQLMutationAssignTrainingPlanToClientArgs = {
  input: GQLAssignTrainingPlanToClientInput;
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


export type GQLMutationCopyExercisesFromDayArgs = {
  input: GQLCopyExercisesFromDayInput;
};


export type GQLMutationCreateBodyProgressLogArgs = {
  input: GQLCreateBodyProgressLogInput;
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


export type GQLMutationCreateTeamArgs = {
  input: GQLCreateTeamInput;
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


export type GQLMutationDeleteBodyProgressLogArgs = {
  id: Scalars['String']['input'];
};


export type GQLMutationDeleteExerciseArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationDeleteFavouriteWorkoutArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationDeleteMessageArgs = {
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


export type GQLMutationDuplicateTrainingPlanArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationDuplicateTrainingWeekArgs = {
  input: GQLDuplicateTrainingWeekInput;
};


export type GQLMutationEditMessageArgs = {
  input: GQLEditMessageInput;
};


export type GQLMutationExtendPlanArgs = {
  planId: Scalars['ID']['input'];
  weeks: Array<Scalars['ID']['input']>;
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


export type GQLMutationInviteTeamMemberArgs = {
  input: GQLInviteTeamMemberInput;
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


export type GQLMutationMarkMessagesAsReadArgs = {
  input: GQLMarkMessagesAsReadInput;
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


export type GQLMutationRemoveTeamLocationArgs = {
  input: GQLRemoveTeamLocationInput;
};


export type GQLMutationRemoveTeamMemberArgs = {
  input: GQLRemoveTeamMemberInput;
};


export type GQLMutationRemoveTrainingPlanFromClientArgs = {
  clientId: Scalars['ID']['input'];
  planId: Scalars['ID']['input'];
};


export type GQLMutationRemoveTrainingWeekArgs = {
  weekId: Scalars['ID']['input'];
};


export type GQLMutationRemoveUserLocationArgs = {
  locationId: Scalars['ID']['input'];
};


export type GQLMutationRemoveUserSubscriptionArgs = {
  userId: Scalars['ID']['input'];
};


export type GQLMutationRemoveWeekArgs = {
  planId: Scalars['ID']['input'];
  weekId: Scalars['ID']['input'];
};


export type GQLMutationRespondToTeamInvitationArgs = {
  input: GQLRespondToTeamInvitationInput;
};


export type GQLMutationSendMessageArgs = {
  input: GQLSendMessageInput;
};


export type GQLMutationSetMacroTargetsArgs = {
  input: GQLSetMacroTargetsInput;
};


export type GQLMutationStartWorkoutFromFavouriteArgs = {
  input: GQLStartWorkoutFromFavouriteInput;
};


export type GQLMutationSwapExerciseArgs = {
  exerciseId: Scalars['ID']['input'];
  substituteId: Scalars['ID']['input'];
};


export type GQLMutationUpdateBodyMeasurementArgs = {
  input: GQLUpdateBodyMeasurementInput;
};


export type GQLMutationUpdateBodyProgressLogArgs = {
  id: Scalars['String']['input'];
  input: GQLUpdateBodyProgressLogInput;
};


export type GQLMutationUpdateBodyProgressLogSharingStatusArgs = {
  id: Scalars['String']['input'];
  shareWithTrainer: Scalars['Boolean']['input'];
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


export type GQLMutationUpdateTeamArgs = {
  input: GQLUpdateTeamInput;
};


export type GQLMutationUpdateTrainerCapacityArgs = {
  input: GQLUpdateTrainerCapacityInput;
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
  shareWithClient?: Maybe<Scalars['Boolean']['output']>;
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
  emailNotifications: Scalars['Boolean']['output'];
  progressUpdates: Scalars['Boolean']['output'];
  pushNotifications: Scalars['Boolean']['output'];
  systemNotifications: Scalars['Boolean']['output'];
  workoutReminders: Scalars['Boolean']['output'];
};

export type GQLNotificationPreferencesInput = {
  emailNotifications?: InputMaybe<Scalars['Boolean']['input']>;
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
  ExerciseNoteAdded = 'EXERCISE_NOTE_ADDED',
  ExerciseNoteReply = 'EXERCISE_NOTE_REPLY',
  Message = 'MESSAGE',
  NewMealPlanAssigned = 'NEW_MEAL_PLAN_ASSIGNED',
  NewTrainingPlanAssigned = 'NEW_TRAINING_PLAN_ASSIGNED',
  PlanCompleted = 'PLAN_COMPLETED',
  Reminder = 'REMINDER',
  System = 'SYSTEM',
  TeamInvitation = 'TEAM_INVITATION',
  TrainerNoteShared = 'TRAINER_NOTE_SHARED',
  TrainerOfferReceived = 'TRAINER_OFFER_RECEIVED',
  TrainerWorkoutCompleted = 'TRAINER_WORKOUT_COMPLETED',
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

export type GQLOptimizedImage = {
  __typename?: 'OptimizedImage';
  large?: Maybe<Scalars['String']['output']>;
  medium?: Maybe<Scalars['String']['output']>;
  thumbnail?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type GQLPackageSummaryItem = {
  __typename?: 'PackageSummaryItem';
  name: Scalars['String']['output'];
  packageId: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
};

export type GQLPackageTemplate = {
  __typename?: 'PackageTemplate';
  createdAt: Scalars['String']['output'];
  description?: Maybe<Scalars['String']['output']>;
  duration: GQLSubscriptionDuration;
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  serviceType?: Maybe<GQLServiceType>;
  stripePriceId?: Maybe<Scalars['String']['output']>;
  stripeProductId?: Maybe<Scalars['String']['output']>;
  trainer?: Maybe<GQLUser>;
  trainerId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type GQLPreviousExerciseLog = {
  __typename?: 'PreviousExerciseLog';
  completedAt?: Maybe<Scalars['String']['output']>;
  exerciseName: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  sets: Array<GQLExerciseSet>;
};

export type GQLPublicTrainer = {
  __typename?: 'PublicTrainer';
  capacity?: Maybe<Scalars['Int']['output']>;
  clientCount: Scalars['Int']['output'];
  credentials: Array<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isAtCapacity: Scalars['Boolean']['output'];
  name?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<GQLUserProfile>;
  role: GQLUserRole;
  specialization: Array<Scalars['String']['output']>;
  spotsLeft?: Maybe<Scalars['Int']['output']>;
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
  bodyMeasures: Array<GQLUserBodyMeasure>;
  checkPremiumAccess: Scalars['Boolean']['output'];
  clientBodyMeasures: Array<GQLUserBodyMeasure>;
  clientBodyProgressLogs: Array<GQLBodyProgressLog>;
  clientSharedNotes: Array<GQLNote>;
  coachingRequest?: Maybe<GQLCoachingRequest>;
  coachingRequests: Array<GQLCoachingRequest>;
  exercise?: Maybe<GQLBaseExercise>;
  exerciseNotes: Array<GQLNote>;
  exercisesProgressByUser: Array<GQLExerciseProgress>;
  getActivePackageTemplates: Array<GQLPackageTemplate>;
  getActivePlanId?: Maybe<Scalars['ID']['output']>;
  getAllUsersWithSubscriptions: GQLUsersWithSubscriptionsResult;
  getChatMessages: Array<GQLMessage>;
  getClientActivePlan?: Maybe<GQLTrainingPlan>;
  getClientMacroTargets?: Maybe<GQLMacroTarget>;
  getClientTrainerOffers: Array<GQLTrainerOffer>;
  getClientTrainingPlans: Array<GQLTrainingPlan>;
  getExercises: GQLGetExercisesResponse;
  getFavouriteWorkout?: Maybe<GQLFavouriteWorkout>;
  getFavouriteWorkouts: Array<GQLFavouriteWorkout>;
  getFeaturedTrainers: Array<GQLPublicTrainer>;
  getMessengerInitialData: GQLMessengerInitialData;
  getMyChats: Array<GQLChat>;
  getMyMacroTargets?: Maybe<GQLMacroTarget>;
  getMyPlansOverview: GQLMyPlansPayload;
  getMyPlansOverviewFull: GQLMyPlansPayload;
  getMyPlansOverviewLite: GQLMyPlansPayload;
  getMyServiceDeliveries: Array<GQLServiceDelivery>;
  getMySubscriptionStatus: GQLUserSubscriptionStatus;
  getMySubscriptions: Array<GQLUserSubscription>;
  getMyTrainer?: Maybe<GQLPublicTrainer>;
  getOrCreateChat: GQLChat;
  getPackageTemplate?: Maybe<GQLPackageTemplate>;
  getPublicTrainingPlans: Array<GQLTrainingPlan>;
  getQuickWorkoutPlan: GQLTrainingPlan;
  getServiceDeliveryTasks: Array<GQLServiceTask>;
  getSubscriptionStats: GQLSubscriptionStats;
  getTemplates: Array<GQLTrainingPlan>;
  getTotalUnreadCount: Scalars['Int']['output'];
  getTrainerDeliveries: Array<GQLServiceDelivery>;
  getTrainerTasks: Array<GQLServiceTask>;
  getTrainingExercise?: Maybe<GQLTrainingExercise>;
  getTrainingPlanById: GQLTrainingPlan;
  getWorkoutDay?: Maybe<GQLGetWorkoutDayPayload>;
  getWorkoutInfo: GQLTrainingDay;
  getWorkoutNavigation?: Maybe<GQLGetWorkoutNavigationPayload>;
  locations: Array<GQLLocation>;
  muscleGroupCategories: Array<GQLMuscleGroupCategory>;
  muscleGroupCategory: GQLMuscleGroupCategory;
  muscleGroupDistribution: GQLMuscleGroupDistribution;
  muscleGroupFrequency: Array<GQLMuscleGroupFrequency>;
  myClients: Array<GQLUserPublic>;
  myTeams: Array<GQLTeam>;
  myTrainer?: Maybe<GQLUserPublic>;
  note?: Maybe<GQLNote>;
  noteReplies: Array<GQLNote>;
  notes: Array<GQLNote>;
  notification?: Maybe<GQLNotification>;
  notifications: Array<GQLNotification>;
  profile?: Maybe<GQLUserProfile>;
  publicExercises: Array<GQLBaseExercise>;
  pushSubscription?: Maybe<GQLPushSubscription>;
  pushSubscriptions: Array<GQLPushSubscription>;
  sentTeamInvitations: Array<GQLTeamInvitation>;
  team?: Maybe<GQLTeam>;
  teamInvitations: Array<GQLTeamInvitation>;
  trainerSharedNotes: Array<GQLNote>;
  user?: Maybe<GQLUser>;
  userBasic?: Maybe<GQLUser>;
  userBodyProgressLogs: Array<GQLBodyProgressLog>;
  userExercises: Array<GQLBaseExercise>;
  userPublic?: Maybe<GQLUserPublic>;
  workoutExerciseNotes: Array<GQLWorkoutExerciseNotes>;
};


export type GQLQueryAdminUserByIdArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryAdminUserListArgs = {
  filters?: InputMaybe<GQLAdminUserFilters>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryClientBodyMeasuresArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLQueryClientBodyProgressLogsArgs = {
  clientId: Scalars['String']['input'];
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


export type GQLQueryGetActivePackageTemplatesArgs = {
  trainerId?: InputMaybe<Scalars['ID']['input']>;
};


export type GQLQueryGetAllUsersWithSubscriptionsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
};


export type GQLQueryGetChatMessagesArgs = {
  chatId: Scalars['ID']['input'];
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryGetClientActivePlanArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLQueryGetClientMacroTargetsArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLQueryGetClientTrainerOffersArgs = {
  clientEmail: Scalars['String']['input'];
  status?: InputMaybe<GQLTrainerOfferStatus>;
  trainerId: Scalars['ID']['input'];
};


export type GQLQueryGetClientTrainingPlansArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLQueryGetFavouriteWorkoutArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryGetFeaturedTrainersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryGetMessengerInitialDataArgs = {
  messagesPerChat?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryGetMyServiceDeliveriesArgs = {
  status?: InputMaybe<GQLDeliveryStatus>;
};


export type GQLQueryGetOrCreateChatArgs = {
  partnerId: Scalars['ID']['input'];
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


export type GQLQueryGetWorkoutDayArgs = {
  dayId?: InputMaybe<Scalars['ID']['input']>;
};


export type GQLQueryGetWorkoutInfoArgs = {
  dayId: Scalars['ID']['input'];
};


export type GQLQueryGetWorkoutNavigationArgs = {
  trainingId?: InputMaybe<Scalars['ID']['input']>;
};


export type GQLQueryMuscleGroupCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryMuscleGroupDistributionArgs = {
  days?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['ID']['input'];
};


export type GQLQueryMuscleGroupFrequencyArgs = {
  days?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['ID']['input'];
};


export type GQLQueryMyClientsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  trainerId?: InputMaybe<Scalars['ID']['input']>;
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


export type GQLQueryTeamArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryTrainerSharedNotesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryUserBodyProgressLogsArgs = {
  userProfileId: Scalars['String']['input'];
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

export type GQLRemoveSubstituteExerciseInput = {
  originalId: Scalars['ID']['input'];
  substituteId: Scalars['ID']['input'];
};

export type GQLRemoveTeamLocationInput = {
  locationId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};

export type GQLRemoveTeamMemberInput = {
  memberId: Scalars['ID']['input'];
  teamId: Scalars['ID']['input'];
};

export enum GQLRepFocus {
  Endurance = 'ENDURANCE',
  Hypertrophy = 'HYPERTROPHY',
  Strength = 'STRENGTH'
}

export type GQLRespondToTeamInvitationInput = {
  accept: Scalars['Boolean']['input'];
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

export type GQLSendMessageInput = {
  chatId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
};

export type GQLServiceDelivery = {
  __typename?: 'ServiceDelivery';
  client: GQLUser;
  clientId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  deliveredAt?: Maybe<Scalars['String']['output']>;
  deliveryNotes?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  packageName: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  serviceType?: Maybe<GQLServiceType>;
  status: GQLDeliveryStatus;
  tasks: Array<GQLServiceTask>;
  trainer: GQLUser;
  trainerId: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
};

export type GQLServiceTask = {
  __typename?: 'ServiceTask';
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  estimatedDuration?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  intervalDays?: Maybe<Scalars['Int']['output']>;
  isRecurring: Scalars['Boolean']['output'];
  isRequired: Scalars['Boolean']['output'];
  location?: Maybe<Scalars['String']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  order: Scalars['Int']['output'];
  recurrenceCount?: Maybe<Scalars['Int']['output']>;
  requiresScheduling: Scalars['Boolean']['output'];
  scheduledAt?: Maybe<Scalars['String']['output']>;
  serviceDelivery: GQLServiceDelivery;
  serviceDeliveryId: Scalars['ID']['output'];
  status: GQLTaskStatus;
  taskType: GQLTaskType;
  templateId: Scalars['String']['output'];
  title: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

export enum GQLServiceType {
  CoachingComplete = 'coaching_complete',
  InPersonMeeting = 'in_person_meeting',
  MealPlan = 'meal_plan',
  PremiumAccess = 'premium_access',
  WorkoutPlan = 'workout_plan'
}

export type GQLSetMacroTargetsInput = {
  calories?: InputMaybe<Scalars['Int']['input']>;
  carbs?: InputMaybe<Scalars['Float']['input']>;
  clientId: Scalars['ID']['input'];
  fat?: InputMaybe<Scalars['Float']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  protein?: InputMaybe<Scalars['Float']['input']>;
};

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
  totalLifetimeSubscriptions: Scalars['Int']['output'];
  totalUsers: Scalars['Int']['output'];
  usersWithActiveSubscriptions: Scalars['Int']['output'];
  usersWithExpiredSubscriptions: Scalars['Int']['output'];
  usersWithoutSubscriptions: Scalars['Int']['output'];
};

export enum GQLSubscriptionStatus {
  Active = 'ACTIVE',
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
  Pending = 'PENDING'
}

export type GQLSubstitute = {
  __typename?: 'Substitute';
  additionalInstructions?: Maybe<Scalars['String']['output']>;
  baseId?: Maybe<Scalars['ID']['output']>;
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  dayId: Scalars['ID']['output'];
  description?: Maybe<Scalars['String']['output']>;
  difficulty?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  instructions?: Maybe<Array<Scalars['String']['output']>>;
  isPublic: Scalars['Boolean']['output'];
  muscleGroups: Array<GQLMuscleGroup>;
  name: Scalars['String']['output'];
  sets: Array<GQLExerciseSet>;
  tips?: Maybe<Array<Scalars['String']['output']>>;
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

export type GQLTeam = {
  __typename?: 'Team';
  createdAt: Scalars['String']['output'];
  hasStripeConnect: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  isAdmin: Scalars['Boolean']['output'];
  locations: Array<GQLLocation>;
  memberCount: Scalars['Int']['output'];
  members: Array<GQLTeamMember>;
  name: Scalars['String']['output'];
  stripeConnectedAccountId?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
};

export type GQLTeamInvitation = {
  __typename?: 'TeamInvitation';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  invitedBy: GQLUserPublic;
  invitedEmail: Scalars['String']['output'];
  status: GQLInvitationStatus;
  team: GQLTeam;
};

export type GQLTeamLocationInput = {
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  countryCode: Scalars['String']['input'];
};

export type GQLTeamMember = {
  __typename?: 'TeamMember';
  id: Scalars['ID']['output'];
  joinedAt: Scalars['String']['output'];
  role: GQLTeamRole;
  user: GQLUserPublic;
};

export enum GQLTeamRole {
  Admin = 'ADMIN',
  Member = 'MEMBER'
}

export enum GQLTheme {
  Dark = 'dark',
  Light = 'light',
  System = 'system'
}

export enum GQLTimeFormat {
  H12 = 'h12',
  H24 = 'h24'
}

export type GQLTrainerOffer = {
  __typename?: 'TrainerOffer';
  clientEmail: Scalars['String']['output'];
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  expiresAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  packageSummary: Array<GQLPackageSummaryItem>;
  personalMessage?: Maybe<Scalars['String']['output']>;
  serviceDeliveries: Array<GQLServiceDelivery>;
  status: GQLTrainerOfferStatus;
  stripeCheckoutSessionId?: Maybe<Scalars['String']['output']>;
  stripePaymentIntentId?: Maybe<Scalars['String']['output']>;
  token: Scalars['String']['output'];
  trainer: GQLUser;
  trainerId: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
};

export enum GQLTrainerOfferStatus {
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
  Paid = 'PAID',
  Pending = 'PENDING'
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
  description?: Maybe<Scalars['String']['output']>;
  difficulty?: Maybe<Scalars['String']['output']>;
  equipment?: Maybe<GQLEquipment>;
  id: Scalars['ID']['output'];
  images: Array<GQLImage>;
  instructions?: Maybe<Array<Scalars['String']['output']>>;
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
  tips?: Maybe<Array<Scalars['String']['output']>>;
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

export type GQLUpdateBodyProgressLogInput = {
  image1Url?: InputMaybe<Scalars['String']['input']>;
  image2Url?: InputMaybe<Scalars['String']['input']>;
  image3Url?: InputMaybe<Scalars['String']['input']>;
  loggedAt?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  shareWithTrainer?: InputMaybe<Scalars['Boolean']['input']>;
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
  hasCompletedOnboarding?: InputMaybe<Scalars['Boolean']['input']>;
  height?: InputMaybe<Scalars['Float']['input']>;
  heightUnit?: InputMaybe<GQLHeightUnit>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  locationCity?: InputMaybe<Scalars['String']['input']>;
  locationCountry?: InputMaybe<Scalars['String']['input']>;
  locationCountryCode?: InputMaybe<Scalars['String']['input']>;
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

export type GQLUpdateTeamInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  teamId: Scalars['ID']['input'];
};

export type GQLUpdateTrainerCapacityInput = {
  capacity?: InputMaybe<Scalars['Int']['input']>;
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
  capacity?: Maybe<Scalars['Int']['output']>;
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
  trainerId?: Maybe<Scalars['ID']['output']>;
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
  hasCompletedOnboarding: Scalars['Boolean']['output'];
  height?: Maybe<Scalars['Float']['output']>;
  heightUnit: GQLHeightUnit;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  locations: Array<GQLLocation>;
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

export type GQLUserSubscription = {
  __typename?: 'UserSubscription';
  createdAt: Scalars['String']['output'];
  daysUntilExpiry: Scalars['Int']['output'];
  endDate: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  isActive: Scalars['Boolean']['output'];
  packageId: Scalars['ID']['output'];
  startDate: Scalars['String']['output'];
  status: GQLSubscriptionStatus;
  stripePriceId?: Maybe<Scalars['String']['output']>;
  stripeSubscriptionId?: Maybe<Scalars['String']['output']>;
  trainer?: Maybe<GQLUser>;
  trainerId?: Maybe<Scalars['ID']['output']>;
  updatedAt: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type GQLUserSubscriptionStatus = {
  __typename?: 'UserSubscriptionStatus';
  canAccessMealPlans: Scalars['Boolean']['output'];
  canAccessPremiumExercises: Scalars['Boolean']['output'];
  canAccessPremiumTrainingPlans: Scalars['Boolean']['output'];
  hasPremium: Scalars['Boolean']['output'];
  isInGracePeriod: Scalars['Boolean']['output'];
  subscriptionEndDate?: Maybe<Scalars['String']['output']>;
  trainerId?: Maybe<Scalars['ID']['output']>;
};

export type GQLUserWithSubscription = {
  __typename?: 'UserWithSubscription';
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  hasActiveSubscription: Scalars['Boolean']['output'];
  id: Scalars['ID']['output'];
  name?: Maybe<Scalars['String']['output']>;
  role: Scalars['String']['output'];
  subscription?: Maybe<GQLUserSubscription>;
};

export type GQLUsersWithSubscriptionsResult = {
  __typename?: 'UsersWithSubscriptionsResult';
  totalCount: Scalars['Int']['output'];
  users: Array<GQLUserWithSubscription>;
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

export type GQLWorkoutExerciseNotes = {
  __typename?: 'WorkoutExerciseNotes';
  exerciseName: Scalars['String']['output'];
  notes: Array<GQLNote>;
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

export type GQLGetPublicTrainingPlansQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GQLGetPublicTrainingPlansQuery = { __typename?: 'Query', getPublicTrainingPlans: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isPremium?: boolean | undefined | null, difficulty?: GQLDifficulty | undefined | null, focusTags: Array<GQLFocusTag>, targetGoals: Array<GQLTargetGoal>, weekCount: number, assignmentCount: number, sessionsPerWeek?: number | undefined | null, avgSessionTime?: number | undefined | null, equipment: Array<string>, rating?: number | undefined | null, totalReviews: number, createdAt: string, updatedAt: string, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null } | undefined | null }> };

export type GQLGetFeaturedTrainersQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GQLGetFeaturedTrainersQuery = { __typename?: 'Query', getFeaturedTrainers: Array<{ __typename?: 'PublicTrainer', id: string, name?: string | undefined | null, role: GQLUserRole, clientCount: number, email: string, capacity?: number | undefined | null, spotsLeft?: number | undefined | null, isAtCapacity: boolean, profile?: { __typename?: 'UserProfile', firstName?: string | undefined | null, lastName?: string | undefined | null, bio?: string | undefined | null, avatarUrl?: string | undefined | null, specialization: Array<string>, credentials: Array<string>, successStories: Array<string>, trainerSince?: string | undefined | null } | undefined | null }> };

export type GQLGetFavouriteWorkoutsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetFavouriteWorkoutsQuery = { __typename?: 'Query', getFavouriteWorkouts: Array<{ __typename?: 'FavouriteWorkout', id: string, title: string, description?: string | undefined | null, createdById: string, createdAt: string, updatedAt: string, exercises: Array<{ __typename?: 'FavouriteWorkoutExercise', id: string, name: string, order: number, baseId?: string | undefined | null, favouriteWorkoutId: string, restSeconds?: number | undefined | null, description?: string | undefined | null, additionalInstructions?: string | undefined | null, instructions?: Array<string> | undefined | null, tips?: Array<string> | undefined | null, difficulty?: string | undefined | null, base?: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, difficulty?: string | undefined | null, tips: Array<string>, instructions: Array<string>, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }>, images: Array<{ __typename?: 'Image', id: string, thumbnail?: string | undefined | null, medium?: string | undefined | null, order: number }> } | undefined | null, sets: Array<{ __typename?: 'FavouriteWorkoutSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> }> };

export type GQLGetFavouriteWorkoutQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLGetFavouriteWorkoutQuery = { __typename?: 'Query', getFavouriteWorkout?: { __typename?: 'FavouriteWorkout', id: string, title: string, description?: string | undefined | null, createdById: string, createdAt: string, updatedAt: string, exercises: Array<{ __typename?: 'FavouriteWorkoutExercise', id: string, name: string, order: number, baseId?: string | undefined | null, favouriteWorkoutId: string, restSeconds?: number | undefined | null, instructions?: Array<string> | undefined | null, base?: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }>, images: Array<{ __typename?: 'Image', id: string, thumbnail?: string | undefined | null, medium?: string | undefined | null, order: number }> } | undefined | null, sets: Array<{ __typename?: 'FavouriteWorkoutSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> } | undefined | null };

export type GQLCreateFavouriteWorkoutMutationVariables = Exact<{
  input: GQLCreateFavouriteWorkoutInput;
}>;


export type GQLCreateFavouriteWorkoutMutation = { __typename?: 'Mutation', createFavouriteWorkout: { __typename?: 'FavouriteWorkout', id: string, title: string, description?: string | undefined | null, createdAt: string, exercises: Array<{ __typename?: 'FavouriteWorkoutExercise', id: string, name: string, order: number, baseId?: string | undefined | null, restSeconds?: number | undefined | null, instructions?: Array<string> | undefined | null, sets: Array<{ __typename?: 'FavouriteWorkoutSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> } };

export type GQLUpdateFavouriteWorkoutMutationVariables = Exact<{
  input: GQLUpdateFavouriteWorkoutInput;
}>;


export type GQLUpdateFavouriteWorkoutMutation = { __typename?: 'Mutation', updateFavouriteWorkout: { __typename?: 'FavouriteWorkout', id: string, title: string, description?: string | undefined | null, updatedAt: string, exercises: Array<{ __typename?: 'FavouriteWorkoutExercise', id: string, name: string, order: number, baseId?: string | undefined | null, restSeconds?: number | undefined | null, instructions?: Array<string> | undefined | null, sets: Array<{ __typename?: 'FavouriteWorkoutSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> } };

export type GQLDeleteFavouriteWorkoutMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLDeleteFavouriteWorkoutMutation = { __typename?: 'Mutation', deleteFavouriteWorkout: boolean };

export type GQLStartWorkoutFromFavouriteMutationVariables = Exact<{
  input: GQLStartWorkoutFromFavouriteInput;
}>;


export type GQLStartWorkoutFromFavouriteMutation = { __typename?: 'Mutation', startWorkoutFromFavourite: string };

export type GQLFitspaceMyPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceMyPlansQuery = { __typename?: 'Query', getMyPlansOverviewFull: { __typename?: 'MyPlansPayload', activePlan?: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, difficulty?: GQLDifficulty | undefined | null, totalWorkouts: number, rating?: number | undefined | null, totalReviews: number, weekCount: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, startDate?: string | undefined | null, endDate?: string | undefined | null, updatedAt: string, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, scheduledAt?: string | undefined | null, completedAt?: string | undefined | null, isExtra: boolean, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, restSeconds?: number | undefined | null, videoUrl?: string | undefined | null, instructions?: Array<string> | undefined | null, name: string, warmupSets?: number | undefined | null, completedAt?: string | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number }> }> }> }> } | undefined | null, quickWorkoutPlan?: { __typename?: 'TrainingPlan', id: string, totalWorkouts: number, weekCount: number, completedWorkoutsDays: number, adherence: number, updatedAt: string, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, scheduledAt?: string | undefined | null, completedAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, videoUrl?: string | undefined | null, instructions?: Array<string> | undefined | null, name: string, completedAt?: string | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null }>, sets: Array<{ __typename?: 'ExerciseSet', id: string }> }> }> }> } | undefined | null, availablePlans: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, difficulty?: GQLDifficulty | undefined | null, totalWorkouts: number, rating?: number | undefined | null, totalReviews: number, weekCount: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, startDate?: string | undefined | null, endDate?: string | undefined | null, updatedAt: string, focusTags: Array<GQLFocusTag>, targetGoals: Array<GQLTargetGoal>, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, scheduledAt?: string | undefined | null, completedAt?: string | undefined | null, isExtra: boolean, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, restSeconds?: number | undefined | null, videoUrl?: string | undefined | null, instructions?: Array<string> | undefined | null, name: string, warmupSets?: number | undefined | null, completedAt?: string | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number }> }> }> }>, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, sex?: string | undefined | null } | undefined | null }>, completedPlans: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, difficulty?: GQLDifficulty | undefined | null, totalWorkouts: number, rating?: number | undefined | null, totalReviews: number, weekCount: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, startDate?: string | undefined | null, endDate?: string | undefined | null, completedAt?: string | undefined | null, updatedAt: string, userReview?: { __typename?: 'Review', id: string, rating: number, comment?: string | undefined | null, createdAt: string, updatedAt: string } | undefined | null, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, sex?: string | undefined | null } | undefined | null }> } };

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

export type GQLGetMyTrainerQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetMyTrainerQuery = { __typename?: 'Query', getMyTrainer?: { __typename?: 'PublicTrainer', id: string, name?: string | undefined | null, role: GQLUserRole, clientCount: number, email: string, capacity?: number | undefined | null, spotsLeft?: number | undefined | null, isAtCapacity: boolean, profile?: { __typename?: 'UserProfile', firstName?: string | undefined | null, lastName?: string | undefined | null, bio?: string | undefined | null, avatarUrl?: string | undefined | null, specialization: Array<string>, credentials: Array<string>, successStories: Array<string>, trainerSince?: string | undefined | null } | undefined | null } | undefined | null };

export type GQLCancelCoachingMutationVariables = Exact<{ [key: string]: never; }>;


export type GQLCancelCoachingMutation = { __typename?: 'Mutation', cancelCoaching: boolean };

export type GQLFitGetMyTrainerOffersQueryVariables = Exact<{
  clientEmail: Scalars['String']['input'];
  trainerId: Scalars['ID']['input'];
  status?: InputMaybe<GQLTrainerOfferStatus>;
}>;


export type GQLFitGetMyTrainerOffersQuery = { __typename?: 'Query', getClientTrainerOffers: Array<{ __typename?: 'TrainerOffer', id: string, token: string, trainerId: string, clientEmail: string, personalMessage?: string | undefined | null, status: GQLTrainerOfferStatus, createdAt: string, updatedAt: string, expiresAt: string, completedAt?: string | undefined | null, packageSummary: Array<{ __typename?: 'PackageSummaryItem', packageId: string, quantity: number, name: string }>, serviceDeliveries: Array<{ __typename?: 'ServiceDelivery', id: string, serviceType?: GQLServiceType | undefined | null, packageName: string, quantity: number, status: GQLDeliveryStatus, deliveredAt?: string | undefined | null, deliveryNotes?: string | undefined | null, createdAt: string, updatedAt: string, tasks: Array<{ __typename?: 'ServiceTask', id: string, title: string, taskType: GQLTaskType, status: GQLTaskStatus, isRequired: boolean, requiresScheduling: boolean, scheduledAt?: string | undefined | null, completedAt?: string | undefined | null, notes?: string | undefined | null, order: number }> }>, trainer: { __typename?: 'User', id: string, name?: string | undefined | null, email: string } }> };

export type GQLProfileFragmentFragment = { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null, avatarUrl?: string | undefined | null, height?: number | undefined | null, weight?: number | undefined | null, fitnessLevel?: GQLFitnessLevel | undefined | null, allergies?: string | undefined | null, activityLevel?: GQLActivityLevel | undefined | null, goals: Array<GQLGoal>, bio?: string | undefined | null, specialization: Array<string>, credentials: Array<string>, successStories: Array<string>, trainerSince?: string | undefined | null, createdAt: string, updatedAt: string, email?: string | undefined | null, weekStartsOn?: number | undefined | null, weightUnit: GQLWeightUnit, heightUnit: GQLHeightUnit, theme: GQLTheme, timeFormat: GQLTimeFormat, trainingView: GQLTrainingView, hasCompletedOnboarding: boolean, notificationPreferences: { __typename?: 'NotificationPreferences', workoutReminders: boolean, progressUpdates: boolean, systemNotifications: boolean, emailNotifications: boolean, pushNotifications: boolean } };

export type GQLProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLProfileQuery = { __typename?: 'Query', profile?: { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null, avatarUrl?: string | undefined | null, height?: number | undefined | null, weight?: number | undefined | null, fitnessLevel?: GQLFitnessLevel | undefined | null, allergies?: string | undefined | null, activityLevel?: GQLActivityLevel | undefined | null, goals: Array<GQLGoal>, bio?: string | undefined | null, specialization: Array<string>, credentials: Array<string>, successStories: Array<string>, trainerSince?: string | undefined | null, createdAt: string, updatedAt: string, email?: string | undefined | null, weekStartsOn?: number | undefined | null, weightUnit: GQLWeightUnit, heightUnit: GQLHeightUnit, theme: GQLTheme, timeFormat: GQLTimeFormat, trainingView: GQLTrainingView, hasCompletedOnboarding: boolean, notificationPreferences: { __typename?: 'NotificationPreferences', workoutReminders: boolean, progressUpdates: boolean, systemNotifications: boolean, emailNotifications: boolean, pushNotifications: boolean } } | undefined | null, userBasic?: { __typename?: 'User', id: string, capacity?: number | undefined | null } | undefined | null };

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

export type GQLMuscleGroupDistributionQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
  days?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GQLMuscleGroupDistributionQuery = { __typename?: 'Query', muscleGroupDistribution: { __typename?: 'MuscleGroupDistribution', chest: number, back: number, shoulders: number, arms: number, legs: number, core: number } };

export type GQLMuscleGroupFrequencyQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
  days?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GQLMuscleGroupFrequencyQuery = { __typename?: 'Query', muscleGroupFrequency: Array<{ __typename?: 'MuscleGroupFrequency', groupSlug: string, groupName: string, sessionsCount: number, totalSets: number, lastTrained?: string | undefined | null }> };

export type GQLAvailableExercisesForProgressQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GQLAvailableExercisesForProgressQuery = { __typename?: 'Query', exercisesProgressByUser: Array<{ __typename?: 'ExerciseProgress', baseExercise?: { __typename?: 'BaseExercise', id: string, name: string, equipment?: GQLEquipment | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', alias?: string | undefined | null, name: string }> } | undefined | null }> };

export type GQLSelectedExercisesProgressQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
  exerciseIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type GQLSelectedExercisesProgressQuery = { __typename?: 'Query', exercisesProgressByUser: Array<{ __typename?: 'ExerciseProgress', averageRpe?: number | undefined | null, totalSets?: number | undefined | null, lastPerformed?: string | undefined | null, baseExercise?: { __typename?: 'BaseExercise', id: string, name: string, muscleGroups: Array<{ __typename?: 'MuscleGroup', alias?: string | undefined | null, name: string, groupSlug: string, category: { __typename?: 'MuscleGroupCategory', name: string } }> } | undefined | null, estimated1RMProgress: Array<{ __typename?: 'OneRmEntry', date: string, average1RM: number, detailedLogs: Array<{ __typename?: 'OneRmLog', estimated1RM: number, weight?: number | undefined | null, reps?: number | undefined | null }> }>, totalVolumeProgress: Array<{ __typename?: 'VolumeEntry', week: string, totalVolume: number, totalSets: number }> }> };

export type GQLGetUserBodyProgressLogsQueryVariables = Exact<{
  userProfileId: Scalars['String']['input'];
}>;


export type GQLGetUserBodyProgressLogsQuery = { __typename?: 'Query', userBodyProgressLogs: Array<{ __typename?: 'BodyProgressLog', id: string, loggedAt: string, notes?: string | undefined | null, shareWithTrainer: boolean, createdAt: string, updatedAt: string, image1?: { __typename?: 'OptimizedImage', thumbnail?: string | undefined | null, medium?: string | undefined | null, large?: string | undefined | null, url?: string | undefined | null } | undefined | null, image2?: { __typename?: 'OptimizedImage', thumbnail?: string | undefined | null, medium?: string | undefined | null, large?: string | undefined | null, url?: string | undefined | null } | undefined | null, image3?: { __typename?: 'OptimizedImage', thumbnail?: string | undefined | null, medium?: string | undefined | null, large?: string | undefined | null, url?: string | undefined | null } | undefined | null }> };

export type GQLCreateBodyProgressLogMutationVariables = Exact<{
  input: GQLCreateBodyProgressLogInput;
}>;


export type GQLCreateBodyProgressLogMutation = { __typename?: 'Mutation', createBodyProgressLog: { __typename?: 'BodyProgressLog', id: string, loggedAt: string, notes?: string | undefined | null, shareWithTrainer: boolean, createdAt: string, updatedAt: string, image1?: { __typename?: 'OptimizedImage', thumbnail?: string | undefined | null, medium?: string | undefined | null, large?: string | undefined | null, url?: string | undefined | null } | undefined | null, image2?: { __typename?: 'OptimizedImage', thumbnail?: string | undefined | null, medium?: string | undefined | null, large?: string | undefined | null, url?: string | undefined | null } | undefined | null, image3?: { __typename?: 'OptimizedImage', thumbnail?: string | undefined | null, medium?: string | undefined | null, large?: string | undefined | null, url?: string | undefined | null } | undefined | null } };

export type GQLUpdateBodyProgressLogMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: GQLUpdateBodyProgressLogInput;
}>;


export type GQLUpdateBodyProgressLogMutation = { __typename?: 'Mutation', updateBodyProgressLog: { __typename?: 'BodyProgressLog', id: string, loggedAt: string, notes?: string | undefined | null, shareWithTrainer: boolean, createdAt: string, updatedAt: string, image1?: { __typename?: 'OptimizedImage', thumbnail?: string | undefined | null, medium?: string | undefined | null, large?: string | undefined | null, url?: string | undefined | null } | undefined | null, image2?: { __typename?: 'OptimizedImage', thumbnail?: string | undefined | null, medium?: string | undefined | null, large?: string | undefined | null, url?: string | undefined | null } | undefined | null, image3?: { __typename?: 'OptimizedImage', thumbnail?: string | undefined | null, medium?: string | undefined | null, large?: string | undefined | null, url?: string | undefined | null } | undefined | null } };

export type GQLDeleteBodyProgressLogMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type GQLDeleteBodyProgressLogMutation = { __typename?: 'Mutation', deleteBodyProgressLog: boolean };

export type GQLUpdateBodyProgressLogSharingStatusMutationVariables = Exact<{
  id: Scalars['String']['input'];
  shareWithTrainer: Scalars['Boolean']['input'];
}>;


export type GQLUpdateBodyProgressLogSharingStatusMutation = { __typename?: 'Mutation', updateBodyProgressLogSharingStatus: { __typename?: 'BodyProgressLog', id: string, shareWithTrainer: boolean } };

export type GQLResetUserLogsMutationVariables = Exact<{ [key: string]: never; }>;


export type GQLResetUserLogsMutation = { __typename?: 'Mutation', resetUserLogs: boolean };

export type GQLDeleteUserAccountMutationVariables = Exact<{ [key: string]: never; }>;


export type GQLDeleteUserAccountMutation = { __typename?: 'Mutation', deleteUserAccount: boolean };

export type GQLFitspaceGetCurrentWorkoutIdQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceGetCurrentWorkoutIdQuery = { __typename?: 'Query', getMyPlansOverview: { __typename?: 'MyPlansPayload', activePlan?: { __typename?: 'TrainingPlan', id: string } | undefined | null } };

export type GQLFitspaceGetActivePlanIdQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceGetActivePlanIdQuery = { __typename?: 'Query', getActivePlanId?: string | undefined | null };

export type GQLFitspaceGetExercisesQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceGetExercisesQuery = { __typename?: 'Query', getExercises: { __typename?: 'GetExercisesResponse', publicExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, instructions: Array<string>, tips: Array<string>, difficulty?: string | undefined | null, images: Array<{ __typename?: 'Image', id: string, thumbnail?: string | undefined | null, medium?: string | undefined | null, order: number }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }>, secondaryMuscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }> }>, trainerExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, instructions: Array<string>, tips: Array<string>, difficulty?: string | undefined | null, images: Array<{ __typename?: 'Image', id: string, thumbnail?: string | undefined | null, medium?: string | undefined | null, order: number }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }>, secondaryMuscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }> }> }, muscleGroupCategories: Array<{ __typename?: 'MuscleGroupCategory', id: string, name: string, slug: string, muscles: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }> }> };

export type GQLFitspaceGetWorkoutInfoQueryVariables = Exact<{
  dayId: Scalars['ID']['input'];
}>;


export type GQLFitspaceGetWorkoutInfoQuery = { __typename?: 'Query', getWorkoutInfo: { __typename?: 'TrainingDay', id: string, duration?: number | undefined | null } };

export type GQLFitspaceGetWorkoutDayQueryVariables = Exact<{
  dayId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GQLFitspaceGetWorkoutDayQuery = { __typename?: 'Query', getWorkoutDay?: { __typename?: 'GetWorkoutDayPayload', day: { __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, startedAt?: string | undefined | null, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, duration?: number | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, restSeconds?: number | undefined | null, tempo?: string | undefined | null, warmupSets?: number | undefined | null, description?: string | undefined | null, tips?: Array<string> | undefined | null, difficulty?: string | undefined | null, instructions?: Array<string> | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, order: number, videoUrl?: string | undefined | null, completedAt?: string | undefined | null, isExtra: boolean, images: Array<{ __typename?: 'Image', id: string, thumbnail?: string | undefined | null, medium?: string | undefined | null, order: number }>, substitutedBy?: { __typename?: 'Substitute', id: string, name: string, instructions?: Array<string> | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, videoUrl?: string | undefined | null, completedAt?: string | undefined | null, baseId?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, isExtra: boolean, completedAt?: string | undefined | null, log?: { __typename?: 'ExerciseSetLog', id: string, weight?: number | undefined | null, rpe?: number | undefined | null, reps?: number | undefined | null, createdAt: string } | undefined | null }> } | undefined | null, substitutes: Array<{ __typename?: 'BaseExerciseSubstitute', id: string, substitute: { __typename?: 'BaseExercise', id: string, name: string } }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, isExtra: boolean, completedAt?: string | undefined | null, log?: { __typename?: 'ExerciseSetLog', id: string, weight?: number | undefined | null, rpe?: number | undefined | null, reps?: number | undefined | null, createdAt: string } | undefined | null }> }> }, previousDayLogs: Array<{ __typename?: 'PreviousExerciseLog', id: string, exerciseName: string, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, log?: { __typename?: 'ExerciseSetLog', id: string, weight?: number | undefined | null, reps?: number | undefined | null, createdAt: string } | undefined | null }> }> } | undefined | null };

export type GQLFitspaceGetWorkoutNavigationQueryVariables = Exact<{
  trainingId: Scalars['ID']['input'];
}>;


export type GQLFitspaceGetWorkoutNavigationQuery = { __typename?: 'Query', getWorkoutNavigation?: { __typename?: 'GetWorkoutNavigationPayload', plan: { __typename?: 'TrainingPlan', id: string, startDate?: string | undefined | null, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null }> }> } } | undefined | null };

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
  reps?: InputMaybe<Scalars['Int']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
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


export type GQLQuickWorkoutExercisesQuery = { __typename?: 'Query', publicExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, type?: GQLExerciseType | undefined | null, images: Array<{ __typename?: 'Image', id: string, url: string, order: number, thumbnail?: string | undefined | null, medium?: string | undefined | null }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }>, secondaryMuscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }> }> };

export type GQLFitspaceGetUserQuickWorkoutPlanQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceGetUserQuickWorkoutPlanQuery = { __typename?: 'Query', getQuickWorkoutPlan: { __typename?: 'TrainingPlan', id: string, title: string, weeks: Array<{ __typename?: 'TrainingWeek', id: string, scheduledAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, baseId?: string | undefined | null, order: number, completedAt?: string | undefined | null, equipment?: GQLEquipment | undefined | null, images: Array<{ __typename?: 'Image', id: string, thumbnail?: string | undefined | null, medium?: string | undefined | null, order: number }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> }> }> } };

export type GQLFitspaceCreateQuickWorkoutMutationVariables = Exact<{
  input: GQLCreateQuickWorkoutInput;
}>;


export type GQLFitspaceCreateQuickWorkoutMutation = { __typename?: 'Mutation', createQuickWorkout: { __typename?: 'TrainingPlan', id: string, title: string, isDraft: boolean, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, order: number, isExtra: boolean, baseId?: string | undefined | null, images: Array<{ __typename?: 'Image', id: string, thumbnail?: string | undefined | null, medium?: string | undefined | null, order: number }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, minReps?: number | undefined | null, maxReps?: number | undefined | null, reps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> }> }> } };

export type GQLFitspaceGenerateAiWorkoutMutationVariables = Exact<{
  input: GQLGenerateAiWorkoutInput;
}>;


export type GQLFitspaceGenerateAiWorkoutMutation = { __typename?: 'Mutation', generateAiWorkout: { __typename?: 'AiWorkoutResult', totalDuration?: number | undefined | null, exercises: Array<{ __typename?: 'AiWorkoutExercise', order: number, exercise: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, images: Array<{ __typename?: 'Image', id: string, thumbnail?: string | undefined | null, medium?: string | undefined | null, order: number }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }> }, sets: Array<{ __typename?: 'SuggestedSets', reps?: number | undefined | null, rpe?: number | undefined | null } | undefined | null> }> } };

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

export type GQLGetClientsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  trainerId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GQLGetClientsQuery = { __typename?: 'Query', myClients: Array<{ __typename?: 'UserPublic', id: string, email: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole, updatedAt: string, createdAt: string, activePlan?: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, weekCount: number, startDate?: string | undefined | null, endDate?: string | undefined | null, lastSessionActivity?: string | undefined | null, progress?: number | undefined | null } | undefined | null }> };

export type GQLCreateCoachingRequestMutationVariables = Exact<{
  recipientEmail: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
}>;


export type GQLCreateCoachingRequestMutation = { __typename?: 'Mutation', createCoachingRequest: { __typename?: 'CoachingRequest', id: string } };

export type GQLGetClientByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLGetClientByIdQuery = { __typename?: 'Query', userPublic?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string, phone?: string | undefined | null, image?: string | undefined | null, sex?: string | undefined | null, birthday?: string | undefined | null, goals: Array<GQLGoal>, currentWeight?: number | undefined | null, height?: number | undefined | null, allergies?: string | undefined | null } | undefined | null, getClientTrainingPlans: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, weekCount: number, startDate?: string | undefined | null, endDate?: string | undefined | null, active: boolean, progress?: number | undefined | null, nextSession?: string | undefined | null }>, getClientActivePlan?: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, weekCount: number, startDate?: string | undefined | null, endDate?: string | undefined | null, active: boolean, progress?: number | undefined | null, nextSession?: string | undefined | null, difficulty?: GQLDifficulty | undefined | null, totalWorkouts: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, weeks: Array<{ __typename?: 'TrainingWeek', id: string, name: string, completedAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, completedAt?: string | undefined | null, duration?: number | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, completedAt?: string | undefined | null, log?: { __typename?: 'ExerciseSetLog', id: string, reps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null } | undefined | null }> }> }> }> } | undefined | null };

export type GQLClientBodyMeasuresQueryVariables = Exact<{
  clientId: Scalars['ID']['input'];
}>;


export type GQLClientBodyMeasuresQuery = { __typename?: 'Query', clientBodyMeasures: Array<{ __typename?: 'UserBodyMeasure', id: string, measuredAt: string, weight?: number | undefined | null, chest?: number | undefined | null, waist?: number | undefined | null, hips?: number | undefined | null, neck?: number | undefined | null, bicepsLeft?: number | undefined | null, bicepsRight?: number | undefined | null, thighLeft?: number | undefined | null, thighRight?: number | undefined | null, calfLeft?: number | undefined | null, calfRight?: number | undefined | null, bodyFat?: number | undefined | null, notes?: string | undefined | null }> };

export type GQLExercisesProgressByUserQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GQLExercisesProgressByUserQuery = { __typename?: 'Query', exercisesProgressByUser: Array<{ __typename?: 'ExerciseProgress', averageRpe?: number | undefined | null, totalSets?: number | undefined | null, lastPerformed?: string | undefined | null, baseExercise?: { __typename?: 'BaseExercise', id: string, name: string, muscleGroups: Array<{ __typename?: 'MuscleGroup', alias?: string | undefined | null, name: string, groupSlug: string, category: { __typename?: 'MuscleGroupCategory', name: string } }> } | undefined | null, estimated1RMProgress: Array<{ __typename?: 'OneRmEntry', date: string, average1RM: number, detailedLogs: Array<{ __typename?: 'OneRmLog', estimated1RM: number, weight?: number | undefined | null, reps?: number | undefined | null }> }>, totalVolumeProgress: Array<{ __typename?: 'VolumeEntry', week: string, totalVolume: number, totalSets: number }> }> };

export type GQLGetTrainerServiceDeliveriesQueryVariables = Exact<{
  trainerId: Scalars['ID']['input'];
}>;


export type GQLGetTrainerServiceDeliveriesQuery = { __typename?: 'Query', getTrainerDeliveries: Array<{ __typename?: 'ServiceDelivery', id: string, serviceType?: GQLServiceType | undefined | null, packageName: string, quantity: number, status: GQLDeliveryStatus, deliveredAt?: string | undefined | null, deliveryNotes?: string | undefined | null, createdAt: string, client: { __typename?: 'User', id: string, name?: string | undefined | null, email: string } }> };

export type GQLGetTrainerTasksQueryVariables = Exact<{
  trainerId: Scalars['ID']['input'];
  status?: InputMaybe<GQLTaskStatus>;
}>;


export type GQLGetTrainerTasksQuery = { __typename?: 'Query', getTrainerTasks: Array<{ __typename?: 'ServiceTask', id: string, serviceDeliveryId: string, templateId: string, title: string, taskType: GQLTaskType, status: GQLTaskStatus, order: number, isRequired: boolean, completedAt?: string | undefined | null, notes?: string | undefined | null, requiresScheduling: boolean, scheduledAt?: string | undefined | null, estimatedDuration?: number | undefined | null, location?: string | undefined | null, isRecurring: boolean, createdAt: string, updatedAt: string }> };

export type GQLUpdateServiceTaskMutationVariables = Exact<{
  taskId: Scalars['ID']['input'];
  input: GQLUpdateServiceTaskInput;
}>;


export type GQLUpdateServiceTaskMutation = { __typename?: 'Mutation', updateServiceTask: { __typename?: 'ServiceTask', id: string, serviceDeliveryId: string, templateId: string, title: string, taskType: GQLTaskType, status: GQLTaskStatus, order: number, isRequired: boolean, completedAt?: string | undefined | null, notes?: string | undefined | null, requiresScheduling: boolean, scheduledAt?: string | undefined | null, estimatedDuration?: number | undefined | null, location?: string | undefined | null, isRecurring: boolean, createdAt: string, updatedAt: string } };

export type GQLMuscleGroupCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLMuscleGroupCategoriesQuery = { __typename?: 'Query', muscleGroupCategories: Array<{ __typename?: 'MuscleGroupCategory', id: string, name: string, slug: string, muscles: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string, isPrimary: boolean }> }> };

export type GQLExercisesBasicInfoQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLExercisesBasicInfoQuery = { __typename?: 'Query', userExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string }>, publicExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string }> };

export type GQLTrainerExercisesQueryVariables = Exact<{
  where?: InputMaybe<GQLExerciseWhereInput>;
}>;


export type GQLTrainerExercisesQuery = { __typename?: 'Query', userExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, instructions: Array<string>, tips: Array<string>, difficulty?: string | undefined | null, additionalInstructions?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, images: Array<{ __typename?: 'Image', id: string, thumbnail?: string | undefined | null, medium?: string | undefined | null, order: number }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }>, secondaryMuscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }> }>, publicExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, instructions: Array<string>, tips: Array<string>, difficulty?: string | undefined | null, additionalInstructions?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, images: Array<{ __typename?: 'Image', id: string, thumbnail?: string | undefined | null, medium?: string | undefined | null, order: number }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }>, secondaryMuscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }> }> };

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

export type GQLUpdateTrainerCapacityMutationVariables = Exact<{
  input: GQLUpdateTrainerCapacityInput;
}>;


export type GQLUpdateTrainerCapacityMutation = { __typename?: 'Mutation', updateTrainerCapacity: { __typename?: 'User', id: string, capacity?: number | undefined | null } };

export type GQLMyTeamsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLMyTeamsQuery = { __typename?: 'Query', myTeams: Array<{ __typename?: 'Team', id: string, name: string, memberCount: number, isAdmin: boolean, createdAt: string, updatedAt: string, hasStripeConnect: boolean, stripeConnectedAccountId?: string | undefined | null, locations: Array<{ __typename?: 'Location', id: string, city: string, country: string, countryCode: string }>, members: Array<{ __typename?: 'TeamMember', id: string, role: GQLTeamRole, joinedAt: string, user: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string, image?: string | undefined | null } }> }> };

export type GQLTeamInvitationsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLTeamInvitationsQuery = { __typename?: 'Query', teamInvitations: Array<{ __typename?: 'TeamInvitation', id: string, invitedEmail: string, status: GQLInvitationStatus, createdAt: string, team: { __typename?: 'Team', id: string, name: string, locations: Array<{ __typename?: 'Location', id: string, city: string, country: string, countryCode: string }> }, invitedBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string, image?: string | undefined | null } }> };

export type GQLCreateTeamMutationVariables = Exact<{
  input: GQLCreateTeamInput;
}>;


export type GQLCreateTeamMutation = { __typename?: 'Mutation', createTeam: { __typename?: 'Team', id: string, name: string, memberCount: number, isAdmin: boolean, createdAt: string, locations: Array<{ __typename?: 'Location', id: string, city: string, country: string, countryCode: string }>, members: Array<{ __typename?: 'TeamMember', id: string, role: GQLTeamRole, joinedAt: string, user: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string, image?: string | undefined | null } }> } };

export type GQLInviteTeamMemberMutationVariables = Exact<{
  input: GQLInviteTeamMemberInput;
}>;


export type GQLInviteTeamMemberMutation = { __typename?: 'Mutation', inviteTeamMember: { __typename?: 'TeamInvitation', id: string, invitedEmail: string, status: GQLInvitationStatus, createdAt: string } };

export type GQLRemoveTeamMemberMutationVariables = Exact<{
  input: GQLRemoveTeamMemberInput;
}>;


export type GQLRemoveTeamMemberMutation = { __typename?: 'Mutation', removeTeamMember: boolean };

export type GQLRespondToTeamInvitationMutationVariables = Exact<{
  input: GQLRespondToTeamInvitationInput;
}>;


export type GQLRespondToTeamInvitationMutation = { __typename?: 'Mutation', respondToTeamInvitation: { __typename?: 'TeamInvitation', id: string, status: GQLInvitationStatus } };

export type GQLUpdateTeamMutationVariables = Exact<{
  input: GQLUpdateTeamInput;
}>;


export type GQLUpdateTeamMutation = { __typename?: 'Mutation', updateTeam: { __typename?: 'Team', id: string, name: string } };

export type GQLTrainingTemplateFragment = { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, difficulty?: GQLDifficulty | undefined | null, focusTags: Array<GQLFocusTag>, targetGoals: Array<GQLTargetGoal>, createdAt: string, updatedAt: string, assignedCount: number, completedAt?: string | undefined | null, assignedTo?: { __typename?: 'UserPublic', id: string } | undefined | null, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } | undefined | null, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, completedAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, completedAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, restSeconds?: number | undefined | null, tempo?: string | undefined | null, warmupSets?: number | undefined | null, description?: string | undefined | null, instructions?: Array<string> | undefined | null, tips?: Array<string> | undefined | null, difficulty?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, order: number, videoUrl?: string | undefined | null, completedAt?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, completedAt?: string | undefined | null }> }> }> }> };

export type GQLGetTemplatesQueryVariables = Exact<{
  draft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GQLGetTemplatesQuery = { __typename?: 'Query', getTemplates: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isDraft: boolean, weekCount: number, assignedCount: number }> };

export type GQLGetTemplateTrainingPlanByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLGetTemplateTrainingPlanByIdQuery = { __typename?: 'Query', getTrainingPlanById: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, difficulty?: GQLDifficulty | undefined | null, focusTags: Array<GQLFocusTag>, targetGoals: Array<GQLTargetGoal>, createdAt: string, updatedAt: string, assignedCount: number, completedAt?: string | undefined | null, assignedTo?: { __typename?: 'UserPublic', id: string } | undefined | null, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string } | undefined | null, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, completedAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, completedAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, restSeconds?: number | undefined | null, tempo?: string | undefined | null, warmupSets?: number | undefined | null, description?: string | undefined | null, instructions?: Array<string> | undefined | null, tips?: Array<string> | undefined | null, difficulty?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, order: number, videoUrl?: string | undefined | null, completedAt?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, completedAt?: string | undefined | null }> }> }> }> } };

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


export type GQLGetExerciseFormDataQuery = { __typename?: 'Query', exercise?: { __typename?: 'TrainingExercise', id: string, name: string, description?: string | undefined | null, instructions?: Array<string> | undefined | null, tips?: Array<string> | undefined | null, difficulty?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, restSeconds?: number | undefined | null, warmupSets?: number | undefined | null, tempo?: string | undefined | null, videoUrl?: string | undefined | null, completedAt?: string | undefined | null, substitutes: Array<{ __typename?: 'BaseExerciseSubstitute', id: string, substitute: { __typename?: 'BaseExercise', name: string } }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, completedAt?: string | undefined | null }> } | undefined | null };

export type GQLUpdateExerciseFormMutationVariables = Exact<{
  input: GQLUpdateExerciseFormInput;
}>;


export type GQLUpdateExerciseFormMutation = { __typename?: 'Mutation', updateExerciseForm: { __typename?: 'TrainingExercise', id: string, name: string, description?: string | undefined | null, instructions?: Array<string> | undefined | null, tips?: Array<string> | undefined | null, difficulty?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, restSeconds?: number | undefined | null, warmupSets?: number | undefined | null, tempo?: string | undefined | null, videoUrl?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> } };

export type GQLAddSetExerciseFormMutationVariables = Exact<{
  input: GQLAddSetExerciseFormInput;
}>;


export type GQLAddSetExerciseFormMutation = { __typename?: 'Mutation', addSetExerciseForm: { __typename?: 'ExerciseSet', id: string } };

export type GQLRemoveSetExerciseFormMutationVariables = Exact<{
  setId: Scalars['ID']['input'];
}>;


export type GQLRemoveSetExerciseFormMutation = { __typename?: 'Mutation', removeSetExerciseForm: boolean };

export type GQLGetAllUsersWithSubscriptionsQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
}>;


export type GQLGetAllUsersWithSubscriptionsQuery = { __typename?: 'Query', getAllUsersWithSubscriptions: { __typename?: 'UsersWithSubscriptionsResult', totalCount: number, users: Array<{ __typename?: 'UserWithSubscription', id: string, email: string, name?: string | undefined | null, role: string, hasActiveSubscription: boolean, createdAt: string, subscription?: { __typename?: 'UserSubscription', id: string, status: GQLSubscriptionStatus, startDate: string, endDate: string, isActive: boolean, stripeSubscriptionId?: string | undefined | null } | undefined | null }> } };

export type GQLGiveLifetimePremiumMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GQLGiveLifetimePremiumMutation = { __typename?: 'Mutation', giveLifetimePremium: { __typename?: 'UserSubscription', id: string, status: GQLSubscriptionStatus, startDate: string, endDate: string, isActive: boolean } };

export type GQLRemoveUserSubscriptionMutationVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GQLRemoveUserSubscriptionMutation = { __typename?: 'Mutation', removeUserSubscription: boolean };

export type GQLGetSubscriptionStatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetSubscriptionStatsQuery = { __typename?: 'Query', getSubscriptionStats: { __typename?: 'SubscriptionStats', totalUsers: number, usersWithActiveSubscriptions: number, usersWithExpiredSubscriptions: number, usersWithoutSubscriptions: number, totalLifetimeSubscriptions: number } };

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


export type GQLGetNotesQuery = { __typename?: 'Query', notes: Array<{ __typename?: 'Note', id: string, text: string, createdAt: string, updatedAt: string, shareWithTrainer?: boolean | undefined | null, shareWithClient?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } }> };

export type GQLGetNoteQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  relatedTo?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GQLGetNoteQuery = { __typename?: 'Query', note?: { __typename?: 'Note', id: string, text: string, createdAt: string, updatedAt: string, shareWithTrainer?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } } | undefined | null };

export type GQLGetExerciseNotesQueryVariables = Exact<{
  exerciseName: Scalars['String']['input'];
}>;


export type GQLGetExerciseNotesQuery = { __typename?: 'Query', exerciseNotes: Array<{ __typename?: 'Note', id: string, text: string, createdAt: string, updatedAt: string, shareWithTrainer?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } }> };

export type GQLGetWorkoutExerciseNotesQueryVariables = Exact<{
  exerciseNames: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type GQLGetWorkoutExerciseNotesQuery = { __typename?: 'Query', workoutExerciseNotes: Array<{ __typename?: 'WorkoutExerciseNotes', exerciseName: string, notes: Array<{ __typename?: 'Note', id: string, text: string, createdAt: string, updatedAt: string, shareWithTrainer?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole }, replies: Array<{ __typename?: 'Note', id: string, text: string, createdAt: string, updatedAt: string, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } }> }> }> };

export type GQLGetClientSharedNotesQueryVariables = Exact<{
  clientId: Scalars['String']['input'];
}>;


export type GQLGetClientSharedNotesQuery = { __typename?: 'Query', clientSharedNotes: Array<{ __typename?: 'Note', id: string, text: string, relatedTo?: string | undefined | null, createdAt: string, updatedAt: string, shareWithTrainer?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } }> };

export type GQLGetTrainerSharedNotesQueryVariables = Exact<{
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GQLGetTrainerSharedNotesQuery = { __typename?: 'Query', trainerSharedNotes: Array<{ __typename?: 'Note', id: string, text: string, relatedTo?: string | undefined | null, createdAt: string, updatedAt: string, shareWithClient?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole }, replies: Array<{ __typename?: 'Note', id: string, text: string, createdAt: string, updatedAt: string, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } }> }> };

export type GQLGetTrainerSharedNotesLimitedQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetTrainerSharedNotesLimitedQuery = { __typename?: 'Query', trainerSharedNotes: Array<{ __typename?: 'Note', id: string, text: string, relatedTo?: string | undefined | null, createdAt: string, updatedAt: string, shareWithClient?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } }> };

export type GQLGetAllTrainerSharedNotesQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetAllTrainerSharedNotesQuery = { __typename?: 'Query', trainerSharedNotes: Array<{ __typename?: 'Note', id: string, text: string, relatedTo?: string | undefined | null, createdAt: string, updatedAt: string, shareWithClient?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } }> };

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

export type GQLCreateTrainerNoteForClientMutationVariables = Exact<{
  input: GQLCreateTrainerNoteForClientInput;
}>;


export type GQLCreateTrainerNoteForClientMutation = { __typename?: 'Mutation', createTrainerNoteForClient: { __typename?: 'Note', id: string, text: string, relatedTo?: string | undefined | null, createdAt: string, updatedAt: string, shareWithClient?: boolean | undefined | null, createdBy: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } } };

export type GQLGetMySubscriptionStatusQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetMySubscriptionStatusQuery = { __typename?: 'Query', getMySubscriptionStatus: { __typename?: 'UserSubscriptionStatus', hasPremium: boolean, trainerId?: string | undefined | null, canAccessPremiumTrainingPlans: boolean, canAccessPremiumExercises: boolean, canAccessMealPlans: boolean, subscriptionEndDate?: string | undefined | null, isInGracePeriod: boolean } };

export type GQLCheckPremiumAccessQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLCheckPremiumAccessQuery = { __typename?: 'Query', checkPremiumAccess: boolean };

export type GQLGetMySubscriptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetMySubscriptionsQuery = { __typename?: 'Query', getMySubscriptions: Array<{ __typename?: 'UserSubscription', id: string, userId: string, packageId: string, trainerId?: string | undefined | null, status: GQLSubscriptionStatus, startDate: string, endDate: string, stripeSubscriptionId?: string | undefined | null, stripePriceId?: string | undefined | null, isActive: boolean, daysUntilExpiry: number, createdAt: string, updatedAt: string, trainer?: { __typename?: 'User', id: string, name?: string | undefined | null, email: string } | undefined | null }> };

export type GQLGetMyServiceDeliveriesQueryVariables = Exact<{
  status?: InputMaybe<GQLDeliveryStatus>;
}>;


export type GQLGetMyServiceDeliveriesQuery = { __typename?: 'Query', getMyServiceDeliveries: Array<{ __typename?: 'ServiceDelivery', id: string, serviceType?: GQLServiceType | undefined | null, packageName: string, quantity: number, status: GQLDeliveryStatus, deliveredAt?: string | undefined | null, deliveryNotes?: string | undefined | null, createdAt: string, updatedAt: string, trainer: { __typename?: 'User', id: string, name?: string | undefined | null, email: string } }> };

export type GQLGetTrainerDeliveriesQueryVariables = Exact<{
  trainerId: Scalars['ID']['input'];
  status?: InputMaybe<GQLDeliveryStatus>;
}>;


export type GQLGetTrainerDeliveriesQuery = { __typename?: 'Query', getTrainerDeliveries: Array<{ __typename?: 'ServiceDelivery', id: string, serviceType?: GQLServiceType | undefined | null, packageName: string, quantity: number, status: GQLDeliveryStatus, deliveredAt?: string | undefined | null, deliveryNotes?: string | undefined | null, createdAt: string, updatedAt: string, client: { __typename?: 'User', id: string, name?: string | undefined | null, email: string } }> };

export type GQLUpdateServiceDeliveryMutationVariables = Exact<{
  deliveryId: Scalars['ID']['input'];
  status: GQLDeliveryStatus;
  notes?: InputMaybe<Scalars['String']['input']>;
}>;


export type GQLUpdateServiceDeliveryMutation = { __typename?: 'Mutation', updateServiceDelivery: { __typename?: 'ServiceDelivery', id: string, status: GQLDeliveryStatus, deliveredAt?: string | undefined | null, deliveryNotes?: string | undefined | null, updatedAt: string } };

export type GQLGetActivePackageTemplatesQueryVariables = Exact<{
  trainerId?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GQLGetActivePackageTemplatesQuery = { __typename?: 'Query', getActivePackageTemplates: Array<{ __typename?: 'PackageTemplate', id: string, name: string, description?: string | undefined | null, duration: GQLSubscriptionDuration, isActive: boolean, stripeProductId?: string | undefined | null, stripePriceId?: string | undefined | null, trainerId?: string | undefined | null, serviceType?: GQLServiceType | undefined | null, createdAt: string, updatedAt: string }> };

export type GQLAssignTemplateToSelfMutationVariables = Exact<{
  planId: Scalars['ID']['input'];
}>;


export type GQLAssignTemplateToSelfMutation = { __typename?: 'Mutation', assignTemplateToSelf: boolean };

export type GQLUserBasicQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLUserBasicQuery = { __typename?: 'Query', userBasic?: { __typename?: 'User', id: string, email: string, name?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string, capacity?: number | undefined | null, trainerId?: string | undefined | null, profile?: { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null, avatarUrl?: string | undefined | null, hasCompletedOnboarding: boolean, height?: number | undefined | null, weight?: number | undefined | null, weekStartsOn?: number | undefined | null, weightUnit: GQLWeightUnit, heightUnit: GQLHeightUnit, theme: GQLTheme, timeFormat: GQLTimeFormat, trainingView: GQLTrainingView, notificationPreferences: { __typename?: 'NotificationPreferences', workoutReminders: boolean, progressUpdates: boolean, systemNotifications: boolean, emailNotifications: boolean, pushNotifications: boolean } } | undefined | null } | undefined | null };

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

export type GQLGetOrCreateChatQueryVariables = Exact<{
  partnerId: Scalars['ID']['input'];
}>;


export type GQLGetOrCreateChatQuery = { __typename?: 'Query', getOrCreateChat: { __typename?: 'Chat', id: string, trainerId: string, clientId: string, unreadCount: number, createdAt: string, updatedAt: string, trainer: { __typename?: 'UserPublic', id: string, email: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null }, client: { __typename?: 'UserPublic', id: string, email: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null }, lastMessage?: { __typename?: 'Message', id: string, content: string, createdAt: string, sender: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null } } | undefined | null } };

export type GQLGetChatMessagesQueryVariables = Exact<{
  chatId: Scalars['ID']['input'];
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GQLGetChatMessagesQuery = { __typename?: 'Query', getChatMessages: Array<{ __typename?: 'Message', id: string, chatId: string, content: string, imageUrl?: string | undefined | null, isEdited: boolean, isDeleted: boolean, readAt?: string | undefined | null, createdAt: string, updatedAt: string, sender: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string, image?: string | undefined | null } }> };

export type GQLGetMyChatsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetMyChatsQuery = { __typename?: 'Query', getMyChats: Array<{ __typename?: 'Chat', id: string, trainerId: string, clientId: string, unreadCount: number, createdAt: string, updatedAt: string, trainer: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string, image?: string | undefined | null }, client: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string, image?: string | undefined | null }, lastMessage?: { __typename?: 'Message', id: string, content: string, createdAt: string } | undefined | null }> };

export type GQLGetTotalUnreadCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetTotalUnreadCountQuery = { __typename?: 'Query', getTotalUnreadCount: number };

export type GQLGetMessengerInitialDataQueryVariables = Exact<{
  messagesPerChat?: InputMaybe<Scalars['Int']['input']>;
}>;


export type GQLGetMessengerInitialDataQuery = { __typename?: 'Query', getMessengerInitialData: { __typename?: 'MessengerInitialData', totalUnreadCount: number, chats: Array<{ __typename?: 'ChatWithMessages', id: string, trainerId: string, clientId: string, hasMoreMessages: boolean, unreadCount: number, createdAt: string, updatedAt: string, trainer: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string, image?: string | undefined | null }, client: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string, image?: string | undefined | null }, messages: Array<{ __typename?: 'Message', id: string, chatId: string, content: string, imageUrl?: string | undefined | null, isEdited: boolean, isDeleted: boolean, readAt?: string | undefined | null, createdAt: string, updatedAt: string, sender: { __typename?: 'UserPublic', id: string, email: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null } }>, lastMessage?: { __typename?: 'Message', id: string, content: string, createdAt: string, sender: { __typename?: 'UserPublic', id: string, email: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null } } | undefined | null }> } };

export type GQLSendMessageMutationVariables = Exact<{
  input: GQLSendMessageInput;
}>;


export type GQLSendMessageMutation = { __typename?: 'Mutation', sendMessage: { __typename?: 'Message', id: string, chatId: string, content: string, imageUrl?: string | undefined | null, isEdited: boolean, isDeleted: boolean, readAt?: string | undefined | null, createdAt: string, updatedAt: string, sender: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null } } };

export type GQLEditMessageMutationVariables = Exact<{
  input: GQLEditMessageInput;
}>;


export type GQLEditMessageMutation = { __typename?: 'Mutation', editMessage: { __typename?: 'Message', id: string, chatId: string, content: string, imageUrl?: string | undefined | null, isEdited: boolean, isDeleted: boolean, readAt?: string | undefined | null, createdAt: string, updatedAt: string, sender: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null } } };

export type GQLDeleteMessageMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLDeleteMessageMutation = { __typename?: 'Mutation', deleteMessage: boolean };

export type GQLMarkMessagesAsReadMutationVariables = Exact<{
  input: GQLMarkMessagesAsReadInput;
}>;


export type GQLMarkMessagesAsReadMutation = { __typename?: 'Mutation', markMessagesAsRead: boolean };


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
  hasCompletedOnboarding
  notificationPreferences {
    workoutReminders
    progressUpdates
    systemNotifications
    emailNotifications
    pushNotifications
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
  focusTags
  targetGoals
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
        description
        instructions
        tips
        difficulty
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
    capacity
    spotsLeft
    isAtCapacity
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
      description
      additionalInstructions
      instructions
      tips
      difficulty
      base {
        id
        name
        description
        videoUrl
        equipment
        isPublic
        difficulty
        tips
        instructions
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
          thumbnail
          medium
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
          thumbnail
          medium
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
              order
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
      focusTags
      targetGoals
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
              order
            }
          }
        }
      }
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

export const GetMyTrainerDocument = `
    query GetMyTrainer {
  getMyTrainer {
    id
    name
    role
    clientCount
    email
    capacity
    spotsLeft
    isAtCapacity
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

export const useGetMyTrainerQuery = <
      TData = GQLGetMyTrainerQuery,
      TError = unknown
    >(
      variables?: GQLGetMyTrainerQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetMyTrainerQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetMyTrainerQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetMyTrainerQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetMyTrainer'] : ['GetMyTrainer', variables],
    queryFn: fetchData<GQLGetMyTrainerQuery, GQLGetMyTrainerQueryVariables>(GetMyTrainerDocument, variables),
    ...options
  }
    )};

useGetMyTrainerQuery.getKey = (variables?: GQLGetMyTrainerQueryVariables) => variables === undefined ? ['GetMyTrainer'] : ['GetMyTrainer', variables];

export const useInfiniteGetMyTrainerQuery = <
      TData = InfiniteData<GQLGetMyTrainerQuery>,
      TError = unknown
    >(
      variables: GQLGetMyTrainerQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetMyTrainerQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetMyTrainerQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetMyTrainerQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetMyTrainer.infinite'] : ['GetMyTrainer.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetMyTrainerQuery, GQLGetMyTrainerQueryVariables>(GetMyTrainerDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMyTrainerQuery.getKey = (variables?: GQLGetMyTrainerQueryVariables) => variables === undefined ? ['GetMyTrainer.infinite'] : ['GetMyTrainer.infinite', variables];


useGetMyTrainerQuery.fetcher = (variables?: GQLGetMyTrainerQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetMyTrainerQuery, GQLGetMyTrainerQueryVariables>(GetMyTrainerDocument, variables, options);

export const CancelCoachingDocument = `
    mutation CancelCoaching {
  cancelCoaching
}
    `;

export const useCancelCoachingMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCancelCoachingMutation, TError, GQLCancelCoachingMutationVariables, TContext>) => {
    
    return useMutation<GQLCancelCoachingMutation, TError, GQLCancelCoachingMutationVariables, TContext>(
      {
    mutationKey: ['CancelCoaching'],
    mutationFn: (variables?: GQLCancelCoachingMutationVariables) => fetchData<GQLCancelCoachingMutation, GQLCancelCoachingMutationVariables>(CancelCoachingDocument, variables)(),
    ...options
  }
    )};

useCancelCoachingMutation.getKey = () => ['CancelCoaching'];


useCancelCoachingMutation.fetcher = (variables?: GQLCancelCoachingMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCancelCoachingMutation, GQLCancelCoachingMutationVariables>(CancelCoachingDocument, variables, options);

export const FitGetMyTrainerOffersDocument = `
    query FitGetMyTrainerOffers($clientEmail: String!, $trainerId: ID!, $status: TrainerOfferStatus) {
  getClientTrainerOffers(
    clientEmail: $clientEmail
    trainerId: $trainerId
    status: $status
  ) {
    id
    token
    trainerId
    clientEmail
    personalMessage
    status
    packageSummary {
      packageId
      quantity
      name
    }
    serviceDeliveries {
      id
      serviceType
      packageName
      quantity
      status
      deliveredAt
      deliveryNotes
      tasks {
        id
        title
        taskType
        status
        isRequired
        requiresScheduling
        scheduledAt
        completedAt
        notes
        order
      }
      createdAt
      updatedAt
    }
    trainer {
      id
      name
      email
    }
    createdAt
    updatedAt
    expiresAt
    completedAt
  }
}
    `;

export const useFitGetMyTrainerOffersQuery = <
      TData = GQLFitGetMyTrainerOffersQuery,
      TError = unknown
    >(
      variables: GQLFitGetMyTrainerOffersQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitGetMyTrainerOffersQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitGetMyTrainerOffersQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitGetMyTrainerOffersQuery, TError, TData>(
      {
    queryKey: ['FitGetMyTrainerOffers', variables],
    queryFn: fetchData<GQLFitGetMyTrainerOffersQuery, GQLFitGetMyTrainerOffersQueryVariables>(FitGetMyTrainerOffersDocument, variables),
    ...options
  }
    )};

useFitGetMyTrainerOffersQuery.getKey = (variables: GQLFitGetMyTrainerOffersQueryVariables) => ['FitGetMyTrainerOffers', variables];

export const useInfiniteFitGetMyTrainerOffersQuery = <
      TData = InfiniteData<GQLFitGetMyTrainerOffersQuery>,
      TError = unknown
    >(
      variables: GQLFitGetMyTrainerOffersQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitGetMyTrainerOffersQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitGetMyTrainerOffersQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitGetMyTrainerOffersQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['FitGetMyTrainerOffers.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitGetMyTrainerOffersQuery, GQLFitGetMyTrainerOffersQueryVariables>(FitGetMyTrainerOffersDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitGetMyTrainerOffersQuery.getKey = (variables: GQLFitGetMyTrainerOffersQueryVariables) => ['FitGetMyTrainerOffers.infinite', variables];


useFitGetMyTrainerOffersQuery.fetcher = (variables: GQLFitGetMyTrainerOffersQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitGetMyTrainerOffersQuery, GQLFitGetMyTrainerOffersQueryVariables>(FitGetMyTrainerOffersDocument, variables, options);

export const ProfileDocument = `
    query Profile {
  profile {
    ...ProfileFragment
  }
  userBasic {
    id
    capacity
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

export const MuscleGroupDistributionDocument = `
    query MuscleGroupDistribution($userId: ID!, $days: Int = 30) {
  muscleGroupDistribution(userId: $userId, days: $days) {
    chest
    back
    shoulders
    arms
    legs
    core
  }
}
    `;

export const useMuscleGroupDistributionQuery = <
      TData = GQLMuscleGroupDistributionQuery,
      TError = unknown
    >(
      variables: GQLMuscleGroupDistributionQueryVariables,
      options?: Omit<UseQueryOptions<GQLMuscleGroupDistributionQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLMuscleGroupDistributionQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLMuscleGroupDistributionQuery, TError, TData>(
      {
    queryKey: ['MuscleGroupDistribution', variables],
    queryFn: fetchData<GQLMuscleGroupDistributionQuery, GQLMuscleGroupDistributionQueryVariables>(MuscleGroupDistributionDocument, variables),
    ...options
  }
    )};

useMuscleGroupDistributionQuery.getKey = (variables: GQLMuscleGroupDistributionQueryVariables) => ['MuscleGroupDistribution', variables];

export const useInfiniteMuscleGroupDistributionQuery = <
      TData = InfiniteData<GQLMuscleGroupDistributionQuery>,
      TError = unknown
    >(
      variables: GQLMuscleGroupDistributionQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLMuscleGroupDistributionQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLMuscleGroupDistributionQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLMuscleGroupDistributionQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['MuscleGroupDistribution.infinite', variables],
      queryFn: (metaData) => fetchData<GQLMuscleGroupDistributionQuery, GQLMuscleGroupDistributionQueryVariables>(MuscleGroupDistributionDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteMuscleGroupDistributionQuery.getKey = (variables: GQLMuscleGroupDistributionQueryVariables) => ['MuscleGroupDistribution.infinite', variables];


useMuscleGroupDistributionQuery.fetcher = (variables: GQLMuscleGroupDistributionQueryVariables, options?: RequestInit['headers']) => fetchData<GQLMuscleGroupDistributionQuery, GQLMuscleGroupDistributionQueryVariables>(MuscleGroupDistributionDocument, variables, options);

export const MuscleGroupFrequencyDocument = `
    query MuscleGroupFrequency($userId: ID!, $days: Int = 30) {
  muscleGroupFrequency(userId: $userId, days: $days) {
    groupSlug
    groupName
    sessionsCount
    totalSets
    lastTrained
  }
}
    `;

export const useMuscleGroupFrequencyQuery = <
      TData = GQLMuscleGroupFrequencyQuery,
      TError = unknown
    >(
      variables: GQLMuscleGroupFrequencyQueryVariables,
      options?: Omit<UseQueryOptions<GQLMuscleGroupFrequencyQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLMuscleGroupFrequencyQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLMuscleGroupFrequencyQuery, TError, TData>(
      {
    queryKey: ['MuscleGroupFrequency', variables],
    queryFn: fetchData<GQLMuscleGroupFrequencyQuery, GQLMuscleGroupFrequencyQueryVariables>(MuscleGroupFrequencyDocument, variables),
    ...options
  }
    )};

useMuscleGroupFrequencyQuery.getKey = (variables: GQLMuscleGroupFrequencyQueryVariables) => ['MuscleGroupFrequency', variables];

export const useInfiniteMuscleGroupFrequencyQuery = <
      TData = InfiniteData<GQLMuscleGroupFrequencyQuery>,
      TError = unknown
    >(
      variables: GQLMuscleGroupFrequencyQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLMuscleGroupFrequencyQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLMuscleGroupFrequencyQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLMuscleGroupFrequencyQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['MuscleGroupFrequency.infinite', variables],
      queryFn: (metaData) => fetchData<GQLMuscleGroupFrequencyQuery, GQLMuscleGroupFrequencyQueryVariables>(MuscleGroupFrequencyDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteMuscleGroupFrequencyQuery.getKey = (variables: GQLMuscleGroupFrequencyQueryVariables) => ['MuscleGroupFrequency.infinite', variables];


useMuscleGroupFrequencyQuery.fetcher = (variables: GQLMuscleGroupFrequencyQueryVariables, options?: RequestInit['headers']) => fetchData<GQLMuscleGroupFrequencyQuery, GQLMuscleGroupFrequencyQueryVariables>(MuscleGroupFrequencyDocument, variables, options);

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

export const GetUserBodyProgressLogsDocument = `
    query GetUserBodyProgressLogs($userProfileId: String!) {
  userBodyProgressLogs(userProfileId: $userProfileId) {
    id
    loggedAt
    notes
    image1 {
      thumbnail
      medium
      large
      url
    }
    image2 {
      thumbnail
      medium
      large
      url
    }
    image3 {
      thumbnail
      medium
      large
      url
    }
    shareWithTrainer
    createdAt
    updatedAt
  }
}
    `;

export const useGetUserBodyProgressLogsQuery = <
      TData = GQLGetUserBodyProgressLogsQuery,
      TError = unknown
    >(
      variables: GQLGetUserBodyProgressLogsQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetUserBodyProgressLogsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetUserBodyProgressLogsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetUserBodyProgressLogsQuery, TError, TData>(
      {
    queryKey: ['GetUserBodyProgressLogs', variables],
    queryFn: fetchData<GQLGetUserBodyProgressLogsQuery, GQLGetUserBodyProgressLogsQueryVariables>(GetUserBodyProgressLogsDocument, variables),
    ...options
  }
    )};

useGetUserBodyProgressLogsQuery.getKey = (variables: GQLGetUserBodyProgressLogsQueryVariables) => ['GetUserBodyProgressLogs', variables];

export const useInfiniteGetUserBodyProgressLogsQuery = <
      TData = InfiniteData<GQLGetUserBodyProgressLogsQuery>,
      TError = unknown
    >(
      variables: GQLGetUserBodyProgressLogsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetUserBodyProgressLogsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetUserBodyProgressLogsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetUserBodyProgressLogsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetUserBodyProgressLogs.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetUserBodyProgressLogsQuery, GQLGetUserBodyProgressLogsQueryVariables>(GetUserBodyProgressLogsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetUserBodyProgressLogsQuery.getKey = (variables: GQLGetUserBodyProgressLogsQueryVariables) => ['GetUserBodyProgressLogs.infinite', variables];


useGetUserBodyProgressLogsQuery.fetcher = (variables: GQLGetUserBodyProgressLogsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetUserBodyProgressLogsQuery, GQLGetUserBodyProgressLogsQueryVariables>(GetUserBodyProgressLogsDocument, variables, options);

export const CreateBodyProgressLogDocument = `
    mutation CreateBodyProgressLog($input: CreateBodyProgressLogInput!) {
  createBodyProgressLog(input: $input) {
    id
    loggedAt
    notes
    image1 {
      thumbnail
      medium
      large
      url
    }
    image2 {
      thumbnail
      medium
      large
      url
    }
    image3 {
      thumbnail
      medium
      large
      url
    }
    shareWithTrainer
    createdAt
    updatedAt
  }
}
    `;

export const useCreateBodyProgressLogMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateBodyProgressLogMutation, TError, GQLCreateBodyProgressLogMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateBodyProgressLogMutation, TError, GQLCreateBodyProgressLogMutationVariables, TContext>(
      {
    mutationKey: ['CreateBodyProgressLog'],
    mutationFn: (variables?: GQLCreateBodyProgressLogMutationVariables) => fetchData<GQLCreateBodyProgressLogMutation, GQLCreateBodyProgressLogMutationVariables>(CreateBodyProgressLogDocument, variables)(),
    ...options
  }
    )};

useCreateBodyProgressLogMutation.getKey = () => ['CreateBodyProgressLog'];


useCreateBodyProgressLogMutation.fetcher = (variables: GQLCreateBodyProgressLogMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateBodyProgressLogMutation, GQLCreateBodyProgressLogMutationVariables>(CreateBodyProgressLogDocument, variables, options);

export const UpdateBodyProgressLogDocument = `
    mutation UpdateBodyProgressLog($id: String!, $input: UpdateBodyProgressLogInput!) {
  updateBodyProgressLog(id: $id, input: $input) {
    id
    loggedAt
    notes
    image1 {
      thumbnail
      medium
      large
      url
    }
    image2 {
      thumbnail
      medium
      large
      url
    }
    image3 {
      thumbnail
      medium
      large
      url
    }
    shareWithTrainer
    createdAt
    updatedAt
  }
}
    `;

export const useUpdateBodyProgressLogMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateBodyProgressLogMutation, TError, GQLUpdateBodyProgressLogMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateBodyProgressLogMutation, TError, GQLUpdateBodyProgressLogMutationVariables, TContext>(
      {
    mutationKey: ['UpdateBodyProgressLog'],
    mutationFn: (variables?: GQLUpdateBodyProgressLogMutationVariables) => fetchData<GQLUpdateBodyProgressLogMutation, GQLUpdateBodyProgressLogMutationVariables>(UpdateBodyProgressLogDocument, variables)(),
    ...options
  }
    )};

useUpdateBodyProgressLogMutation.getKey = () => ['UpdateBodyProgressLog'];


useUpdateBodyProgressLogMutation.fetcher = (variables: GQLUpdateBodyProgressLogMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateBodyProgressLogMutation, GQLUpdateBodyProgressLogMutationVariables>(UpdateBodyProgressLogDocument, variables, options);

export const DeleteBodyProgressLogDocument = `
    mutation DeleteBodyProgressLog($id: String!) {
  deleteBodyProgressLog(id: $id)
}
    `;

export const useDeleteBodyProgressLogMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDeleteBodyProgressLogMutation, TError, GQLDeleteBodyProgressLogMutationVariables, TContext>) => {
    
    return useMutation<GQLDeleteBodyProgressLogMutation, TError, GQLDeleteBodyProgressLogMutationVariables, TContext>(
      {
    mutationKey: ['DeleteBodyProgressLog'],
    mutationFn: (variables?: GQLDeleteBodyProgressLogMutationVariables) => fetchData<GQLDeleteBodyProgressLogMutation, GQLDeleteBodyProgressLogMutationVariables>(DeleteBodyProgressLogDocument, variables)(),
    ...options
  }
    )};

useDeleteBodyProgressLogMutation.getKey = () => ['DeleteBodyProgressLog'];


useDeleteBodyProgressLogMutation.fetcher = (variables: GQLDeleteBodyProgressLogMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDeleteBodyProgressLogMutation, GQLDeleteBodyProgressLogMutationVariables>(DeleteBodyProgressLogDocument, variables, options);

export const UpdateBodyProgressLogSharingStatusDocument = `
    mutation UpdateBodyProgressLogSharingStatus($id: String!, $shareWithTrainer: Boolean!) {
  updateBodyProgressLogSharingStatus(id: $id, shareWithTrainer: $shareWithTrainer) {
    id
    shareWithTrainer
  }
}
    `;

export const useUpdateBodyProgressLogSharingStatusMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateBodyProgressLogSharingStatusMutation, TError, GQLUpdateBodyProgressLogSharingStatusMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateBodyProgressLogSharingStatusMutation, TError, GQLUpdateBodyProgressLogSharingStatusMutationVariables, TContext>(
      {
    mutationKey: ['UpdateBodyProgressLogSharingStatus'],
    mutationFn: (variables?: GQLUpdateBodyProgressLogSharingStatusMutationVariables) => fetchData<GQLUpdateBodyProgressLogSharingStatusMutation, GQLUpdateBodyProgressLogSharingStatusMutationVariables>(UpdateBodyProgressLogSharingStatusDocument, variables)(),
    ...options
  }
    )};

useUpdateBodyProgressLogSharingStatusMutation.getKey = () => ['UpdateBodyProgressLogSharingStatus'];


useUpdateBodyProgressLogSharingStatusMutation.fetcher = (variables: GQLUpdateBodyProgressLogSharingStatusMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateBodyProgressLogSharingStatusMutation, GQLUpdateBodyProgressLogSharingStatusMutationVariables>(UpdateBodyProgressLogSharingStatusDocument, variables, options);

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
      instructions
      tips
      difficulty
      images {
        id
        thumbnail
        medium
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
      instructions
      tips
      difficulty
      images {
        id
        thumbnail
        medium
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

export const FitspaceGetWorkoutDayDocument = `
    query FitspaceGetWorkoutDay($dayId: ID) {
  getWorkoutDay(dayId: $dayId) {
    day {
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
        description
        tips
        difficulty
        instructions
        additionalInstructions
        type
        order
        videoUrl
        images {
          id
          thumbnail
          medium
          order
        }
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
    previousDayLogs {
      id
      exerciseName
      sets {
        id
        order
        log {
          id
          weight
          reps
          createdAt
        }
      }
    }
  }
}
    `;

export const useFitspaceGetWorkoutDayQuery = <
      TData = GQLFitspaceGetWorkoutDayQuery,
      TError = unknown
    >(
      variables?: GQLFitspaceGetWorkoutDayQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitspaceGetWorkoutDayQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitspaceGetWorkoutDayQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitspaceGetWorkoutDayQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['FitspaceGetWorkoutDay'] : ['FitspaceGetWorkoutDay', variables],
    queryFn: fetchData<GQLFitspaceGetWorkoutDayQuery, GQLFitspaceGetWorkoutDayQueryVariables>(FitspaceGetWorkoutDayDocument, variables),
    ...options
  }
    )};

useFitspaceGetWorkoutDayQuery.getKey = (variables?: GQLFitspaceGetWorkoutDayQueryVariables) => variables === undefined ? ['FitspaceGetWorkoutDay'] : ['FitspaceGetWorkoutDay', variables];

export const useInfiniteFitspaceGetWorkoutDayQuery = <
      TData = InfiniteData<GQLFitspaceGetWorkoutDayQuery>,
      TError = unknown
    >(
      variables: GQLFitspaceGetWorkoutDayQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitspaceGetWorkoutDayQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitspaceGetWorkoutDayQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitspaceGetWorkoutDayQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['FitspaceGetWorkoutDay.infinite'] : ['FitspaceGetWorkoutDay.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitspaceGetWorkoutDayQuery, GQLFitspaceGetWorkoutDayQueryVariables>(FitspaceGetWorkoutDayDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitspaceGetWorkoutDayQuery.getKey = (variables?: GQLFitspaceGetWorkoutDayQueryVariables) => variables === undefined ? ['FitspaceGetWorkoutDay.infinite'] : ['FitspaceGetWorkoutDay.infinite', variables];


useFitspaceGetWorkoutDayQuery.fetcher = (variables?: GQLFitspaceGetWorkoutDayQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceGetWorkoutDayQuery, GQLFitspaceGetWorkoutDayQueryVariables>(FitspaceGetWorkoutDayDocument, variables, options);

export const FitspaceGetWorkoutNavigationDocument = `
    query FitspaceGetWorkoutNavigation($trainingId: ID!) {
  getWorkoutNavigation(trainingId: $trainingId) {
    plan {
      id
      startDate
      weeks {
        id
        weekNumber
        completedAt
        scheduledAt
        days {
          id
          dayOfWeek
          isRestDay
          completedAt
          scheduledAt
        }
      }
    }
  }
}
    `;

export const useFitspaceGetWorkoutNavigationQuery = <
      TData = GQLFitspaceGetWorkoutNavigationQuery,
      TError = unknown
    >(
      variables: GQLFitspaceGetWorkoutNavigationQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitspaceGetWorkoutNavigationQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitspaceGetWorkoutNavigationQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitspaceGetWorkoutNavigationQuery, TError, TData>(
      {
    queryKey: ['FitspaceGetWorkoutNavigation', variables],
    queryFn: fetchData<GQLFitspaceGetWorkoutNavigationQuery, GQLFitspaceGetWorkoutNavigationQueryVariables>(FitspaceGetWorkoutNavigationDocument, variables),
    ...options
  }
    )};

useFitspaceGetWorkoutNavigationQuery.getKey = (variables: GQLFitspaceGetWorkoutNavigationQueryVariables) => ['FitspaceGetWorkoutNavigation', variables];

export const useInfiniteFitspaceGetWorkoutNavigationQuery = <
      TData = InfiniteData<GQLFitspaceGetWorkoutNavigationQuery>,
      TError = unknown
    >(
      variables: GQLFitspaceGetWorkoutNavigationQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitspaceGetWorkoutNavigationQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitspaceGetWorkoutNavigationQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitspaceGetWorkoutNavigationQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['FitspaceGetWorkoutNavigation.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitspaceGetWorkoutNavigationQuery, GQLFitspaceGetWorkoutNavigationQueryVariables>(FitspaceGetWorkoutNavigationDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitspaceGetWorkoutNavigationQuery.getKey = (variables: GQLFitspaceGetWorkoutNavigationQueryVariables) => ['FitspaceGetWorkoutNavigation.infinite', variables];


useFitspaceGetWorkoutNavigationQuery.fetcher = (variables: GQLFitspaceGetWorkoutNavigationQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceGetWorkoutNavigationQuery, GQLFitspaceGetWorkoutNavigationQueryVariables>(FitspaceGetWorkoutNavigationDocument, variables, options);

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
    mutation FitspaceMarkSetAsCompleted($setId: ID!, $completed: Boolean!, $reps: Int, $weight: Float) {
  markSetAsCompleted(
    setId: $setId
    completed: $completed
    reps: $reps
    weight: $weight
  )
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
      thumbnail
      medium
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
            thumbnail
            medium
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
            thumbnail
            medium
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
        images {
          id
          thumbnail
          medium
          order
        }
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
    query GetClients($limit: Int, $offset: Int, $trainerId: ID) {
  myClients(limit: $limit, offset: $offset, trainerId: $trainerId) {
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

export const GetTrainerServiceDeliveriesDocument = `
    query GetTrainerServiceDeliveries($trainerId: ID!) {
  getTrainerDeliveries(trainerId: $trainerId) {
    id
    serviceType
    packageName
    quantity
    status
    deliveredAt
    deliveryNotes
    createdAt
    client {
      id
      name
      email
    }
  }
}
    `;

export const useGetTrainerServiceDeliveriesQuery = <
      TData = GQLGetTrainerServiceDeliveriesQuery,
      TError = unknown
    >(
      variables: GQLGetTrainerServiceDeliveriesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetTrainerServiceDeliveriesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetTrainerServiceDeliveriesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetTrainerServiceDeliveriesQuery, TError, TData>(
      {
    queryKey: ['GetTrainerServiceDeliveries', variables],
    queryFn: fetchData<GQLGetTrainerServiceDeliveriesQuery, GQLGetTrainerServiceDeliveriesQueryVariables>(GetTrainerServiceDeliveriesDocument, variables),
    ...options
  }
    )};

useGetTrainerServiceDeliveriesQuery.getKey = (variables: GQLGetTrainerServiceDeliveriesQueryVariables) => ['GetTrainerServiceDeliveries', variables];

export const useInfiniteGetTrainerServiceDeliveriesQuery = <
      TData = InfiniteData<GQLGetTrainerServiceDeliveriesQuery>,
      TError = unknown
    >(
      variables: GQLGetTrainerServiceDeliveriesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetTrainerServiceDeliveriesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetTrainerServiceDeliveriesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetTrainerServiceDeliveriesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetTrainerServiceDeliveries.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetTrainerServiceDeliveriesQuery, GQLGetTrainerServiceDeliveriesQueryVariables>(GetTrainerServiceDeliveriesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTrainerServiceDeliveriesQuery.getKey = (variables: GQLGetTrainerServiceDeliveriesQueryVariables) => ['GetTrainerServiceDeliveries.infinite', variables];


useGetTrainerServiceDeliveriesQuery.fetcher = (variables: GQLGetTrainerServiceDeliveriesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetTrainerServiceDeliveriesQuery, GQLGetTrainerServiceDeliveriesQueryVariables>(GetTrainerServiceDeliveriesDocument, variables, options);

export const GetTrainerTasksDocument = `
    query GetTrainerTasks($trainerId: ID!, $status: TaskStatus) {
  getTrainerTasks(trainerId: $trainerId, status: $status) {
    id
    serviceDeliveryId
    templateId
    title
    taskType
    status
    order
    isRequired
    completedAt
    notes
    requiresScheduling
    scheduledAt
    estimatedDuration
    location
    isRecurring
    createdAt
    updatedAt
  }
}
    `;

export const useGetTrainerTasksQuery = <
      TData = GQLGetTrainerTasksQuery,
      TError = unknown
    >(
      variables: GQLGetTrainerTasksQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetTrainerTasksQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetTrainerTasksQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetTrainerTasksQuery, TError, TData>(
      {
    queryKey: ['GetTrainerTasks', variables],
    queryFn: fetchData<GQLGetTrainerTasksQuery, GQLGetTrainerTasksQueryVariables>(GetTrainerTasksDocument, variables),
    ...options
  }
    )};

useGetTrainerTasksQuery.getKey = (variables: GQLGetTrainerTasksQueryVariables) => ['GetTrainerTasks', variables];

export const useInfiniteGetTrainerTasksQuery = <
      TData = InfiniteData<GQLGetTrainerTasksQuery>,
      TError = unknown
    >(
      variables: GQLGetTrainerTasksQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetTrainerTasksQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetTrainerTasksQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetTrainerTasksQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetTrainerTasks.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetTrainerTasksQuery, GQLGetTrainerTasksQueryVariables>(GetTrainerTasksDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTrainerTasksQuery.getKey = (variables: GQLGetTrainerTasksQueryVariables) => ['GetTrainerTasks.infinite', variables];


useGetTrainerTasksQuery.fetcher = (variables: GQLGetTrainerTasksQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetTrainerTasksQuery, GQLGetTrainerTasksQueryVariables>(GetTrainerTasksDocument, variables, options);

export const UpdateServiceTaskDocument = `
    mutation UpdateServiceTask($taskId: ID!, $input: UpdateServiceTaskInput!) {
  updateServiceTask(taskId: $taskId, input: $input) {
    id
    serviceDeliveryId
    templateId
    title
    taskType
    status
    order
    isRequired
    completedAt
    notes
    requiresScheduling
    scheduledAt
    estimatedDuration
    location
    isRecurring
    createdAt
    updatedAt
  }
}
    `;

export const useUpdateServiceTaskMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateServiceTaskMutation, TError, GQLUpdateServiceTaskMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateServiceTaskMutation, TError, GQLUpdateServiceTaskMutationVariables, TContext>(
      {
    mutationKey: ['UpdateServiceTask'],
    mutationFn: (variables?: GQLUpdateServiceTaskMutationVariables) => fetchData<GQLUpdateServiceTaskMutation, GQLUpdateServiceTaskMutationVariables>(UpdateServiceTaskDocument, variables)(),
    ...options
  }
    )};

useUpdateServiceTaskMutation.getKey = () => ['UpdateServiceTask'];


useUpdateServiceTaskMutation.fetcher = (variables: GQLUpdateServiceTaskMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateServiceTaskMutation, GQLUpdateServiceTaskMutationVariables>(UpdateServiceTaskDocument, variables, options);

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
    instructions
    tips
    difficulty
    additionalInstructions
    videoUrl
    equipment
    isPublic
    videoUrl
    images {
      id
      thumbnail
      medium
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
    instructions
    tips
    difficulty
    additionalInstructions
    videoUrl
    equipment
    isPublic
    images {
      id
      thumbnail
      medium
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

export const UpdateTrainerCapacityDocument = `
    mutation UpdateTrainerCapacity($input: UpdateTrainerCapacityInput!) {
  updateTrainerCapacity(input: $input) {
    id
    capacity
  }
}
    `;

export const useUpdateTrainerCapacityMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateTrainerCapacityMutation, TError, GQLUpdateTrainerCapacityMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateTrainerCapacityMutation, TError, GQLUpdateTrainerCapacityMutationVariables, TContext>(
      {
    mutationKey: ['UpdateTrainerCapacity'],
    mutationFn: (variables?: GQLUpdateTrainerCapacityMutationVariables) => fetchData<GQLUpdateTrainerCapacityMutation, GQLUpdateTrainerCapacityMutationVariables>(UpdateTrainerCapacityDocument, variables)(),
    ...options
  }
    )};

useUpdateTrainerCapacityMutation.getKey = () => ['UpdateTrainerCapacity'];


useUpdateTrainerCapacityMutation.fetcher = (variables: GQLUpdateTrainerCapacityMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateTrainerCapacityMutation, GQLUpdateTrainerCapacityMutationVariables>(UpdateTrainerCapacityDocument, variables, options);

export const MyTeamsDocument = `
    query MyTeams {
  myTeams {
    id
    name
    memberCount
    isAdmin
    createdAt
    updatedAt
    hasStripeConnect
    stripeConnectedAccountId
    locations {
      id
      city
      country
      countryCode
    }
    members {
      id
      role
      joinedAt
      user {
        id
        firstName
        lastName
        email
        image
      }
    }
  }
}
    `;

export const useMyTeamsQuery = <
      TData = GQLMyTeamsQuery,
      TError = unknown
    >(
      variables?: GQLMyTeamsQueryVariables,
      options?: Omit<UseQueryOptions<GQLMyTeamsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLMyTeamsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLMyTeamsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['MyTeams'] : ['MyTeams', variables],
    queryFn: fetchData<GQLMyTeamsQuery, GQLMyTeamsQueryVariables>(MyTeamsDocument, variables),
    ...options
  }
    )};

useMyTeamsQuery.getKey = (variables?: GQLMyTeamsQueryVariables) => variables === undefined ? ['MyTeams'] : ['MyTeams', variables];

export const useInfiniteMyTeamsQuery = <
      TData = InfiniteData<GQLMyTeamsQuery>,
      TError = unknown
    >(
      variables: GQLMyTeamsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLMyTeamsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLMyTeamsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLMyTeamsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['MyTeams.infinite'] : ['MyTeams.infinite', variables],
      queryFn: (metaData) => fetchData<GQLMyTeamsQuery, GQLMyTeamsQueryVariables>(MyTeamsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteMyTeamsQuery.getKey = (variables?: GQLMyTeamsQueryVariables) => variables === undefined ? ['MyTeams.infinite'] : ['MyTeams.infinite', variables];


useMyTeamsQuery.fetcher = (variables?: GQLMyTeamsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLMyTeamsQuery, GQLMyTeamsQueryVariables>(MyTeamsDocument, variables, options);

export const TeamInvitationsDocument = `
    query TeamInvitations {
  teamInvitations {
    id
    invitedEmail
    status
    createdAt
    team {
      id
      name
      locations {
        id
        city
        country
        countryCode
      }
    }
    invitedBy {
      id
      firstName
      lastName
      email
      image
    }
  }
}
    `;

export const useTeamInvitationsQuery = <
      TData = GQLTeamInvitationsQuery,
      TError = unknown
    >(
      variables?: GQLTeamInvitationsQueryVariables,
      options?: Omit<UseQueryOptions<GQLTeamInvitationsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLTeamInvitationsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLTeamInvitationsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['TeamInvitations'] : ['TeamInvitations', variables],
    queryFn: fetchData<GQLTeamInvitationsQuery, GQLTeamInvitationsQueryVariables>(TeamInvitationsDocument, variables),
    ...options
  }
    )};

useTeamInvitationsQuery.getKey = (variables?: GQLTeamInvitationsQueryVariables) => variables === undefined ? ['TeamInvitations'] : ['TeamInvitations', variables];

export const useInfiniteTeamInvitationsQuery = <
      TData = InfiniteData<GQLTeamInvitationsQuery>,
      TError = unknown
    >(
      variables: GQLTeamInvitationsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLTeamInvitationsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLTeamInvitationsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLTeamInvitationsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['TeamInvitations.infinite'] : ['TeamInvitations.infinite', variables],
      queryFn: (metaData) => fetchData<GQLTeamInvitationsQuery, GQLTeamInvitationsQueryVariables>(TeamInvitationsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteTeamInvitationsQuery.getKey = (variables?: GQLTeamInvitationsQueryVariables) => variables === undefined ? ['TeamInvitations.infinite'] : ['TeamInvitations.infinite', variables];


useTeamInvitationsQuery.fetcher = (variables?: GQLTeamInvitationsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLTeamInvitationsQuery, GQLTeamInvitationsQueryVariables>(TeamInvitationsDocument, variables, options);

export const CreateTeamDocument = `
    mutation CreateTeam($input: CreateTeamInput!) {
  createTeam(input: $input) {
    id
    name
    memberCount
    isAdmin
    createdAt
    locations {
      id
      city
      country
      countryCode
    }
    members {
      id
      role
      joinedAt
      user {
        id
        firstName
        lastName
        email
        image
      }
    }
  }
}
    `;

export const useCreateTeamMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateTeamMutation, TError, GQLCreateTeamMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateTeamMutation, TError, GQLCreateTeamMutationVariables, TContext>(
      {
    mutationKey: ['CreateTeam'],
    mutationFn: (variables?: GQLCreateTeamMutationVariables) => fetchData<GQLCreateTeamMutation, GQLCreateTeamMutationVariables>(CreateTeamDocument, variables)(),
    ...options
  }
    )};

useCreateTeamMutation.getKey = () => ['CreateTeam'];


useCreateTeamMutation.fetcher = (variables: GQLCreateTeamMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateTeamMutation, GQLCreateTeamMutationVariables>(CreateTeamDocument, variables, options);

export const InviteTeamMemberDocument = `
    mutation InviteTeamMember($input: InviteTeamMemberInput!) {
  inviteTeamMember(input: $input) {
    id
    invitedEmail
    status
    createdAt
  }
}
    `;

export const useInviteTeamMemberMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLInviteTeamMemberMutation, TError, GQLInviteTeamMemberMutationVariables, TContext>) => {
    
    return useMutation<GQLInviteTeamMemberMutation, TError, GQLInviteTeamMemberMutationVariables, TContext>(
      {
    mutationKey: ['InviteTeamMember'],
    mutationFn: (variables?: GQLInviteTeamMemberMutationVariables) => fetchData<GQLInviteTeamMemberMutation, GQLInviteTeamMemberMutationVariables>(InviteTeamMemberDocument, variables)(),
    ...options
  }
    )};

useInviteTeamMemberMutation.getKey = () => ['InviteTeamMember'];


useInviteTeamMemberMutation.fetcher = (variables: GQLInviteTeamMemberMutationVariables, options?: RequestInit['headers']) => fetchData<GQLInviteTeamMemberMutation, GQLInviteTeamMemberMutationVariables>(InviteTeamMemberDocument, variables, options);

export const RemoveTeamMemberDocument = `
    mutation RemoveTeamMember($input: RemoveTeamMemberInput!) {
  removeTeamMember(input: $input)
}
    `;

export const useRemoveTeamMemberMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveTeamMemberMutation, TError, GQLRemoveTeamMemberMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveTeamMemberMutation, TError, GQLRemoveTeamMemberMutationVariables, TContext>(
      {
    mutationKey: ['RemoveTeamMember'],
    mutationFn: (variables?: GQLRemoveTeamMemberMutationVariables) => fetchData<GQLRemoveTeamMemberMutation, GQLRemoveTeamMemberMutationVariables>(RemoveTeamMemberDocument, variables)(),
    ...options
  }
    )};

useRemoveTeamMemberMutation.getKey = () => ['RemoveTeamMember'];


useRemoveTeamMemberMutation.fetcher = (variables: GQLRemoveTeamMemberMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveTeamMemberMutation, GQLRemoveTeamMemberMutationVariables>(RemoveTeamMemberDocument, variables, options);

export const RespondToTeamInvitationDocument = `
    mutation RespondToTeamInvitation($input: RespondToTeamInvitationInput!) {
  respondToTeamInvitation(input: $input) {
    id
    status
  }
}
    `;

export const useRespondToTeamInvitationMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRespondToTeamInvitationMutation, TError, GQLRespondToTeamInvitationMutationVariables, TContext>) => {
    
    return useMutation<GQLRespondToTeamInvitationMutation, TError, GQLRespondToTeamInvitationMutationVariables, TContext>(
      {
    mutationKey: ['RespondToTeamInvitation'],
    mutationFn: (variables?: GQLRespondToTeamInvitationMutationVariables) => fetchData<GQLRespondToTeamInvitationMutation, GQLRespondToTeamInvitationMutationVariables>(RespondToTeamInvitationDocument, variables)(),
    ...options
  }
    )};

useRespondToTeamInvitationMutation.getKey = () => ['RespondToTeamInvitation'];


useRespondToTeamInvitationMutation.fetcher = (variables: GQLRespondToTeamInvitationMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRespondToTeamInvitationMutation, GQLRespondToTeamInvitationMutationVariables>(RespondToTeamInvitationDocument, variables, options);

export const UpdateTeamDocument = `
    mutation UpdateTeam($input: UpdateTeamInput!) {
  updateTeam(input: $input) {
    id
    name
  }
}
    `;

export const useUpdateTeamMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateTeamMutation, TError, GQLUpdateTeamMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateTeamMutation, TError, GQLUpdateTeamMutationVariables, TContext>(
      {
    mutationKey: ['UpdateTeam'],
    mutationFn: (variables?: GQLUpdateTeamMutationVariables) => fetchData<GQLUpdateTeamMutation, GQLUpdateTeamMutationVariables>(UpdateTeamDocument, variables)(),
    ...options
  }
    )};

useUpdateTeamMutation.getKey = () => ['UpdateTeam'];


useUpdateTeamMutation.fetcher = (variables: GQLUpdateTeamMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateTeamMutation, GQLUpdateTeamMutationVariables>(UpdateTeamDocument, variables, options);

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
    description
    instructions
    tips
    difficulty
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
    description
    instructions
    tips
    difficulty
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

export const GetAllUsersWithSubscriptionsDocument = `
    query GetAllUsersWithSubscriptions($limit: Int, $offset: Int, $searchQuery: String) {
  getAllUsersWithSubscriptions(
    limit: $limit
    offset: $offset
    searchQuery: $searchQuery
  ) {
    users {
      id
      email
      name
      role
      hasActiveSubscription
      subscription {
        id
        status
        startDate
        endDate
        isActive
        stripeSubscriptionId
      }
      createdAt
    }
    totalCount
  }
}
    `;

export const useGetAllUsersWithSubscriptionsQuery = <
      TData = GQLGetAllUsersWithSubscriptionsQuery,
      TError = unknown
    >(
      variables?: GQLGetAllUsersWithSubscriptionsQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetAllUsersWithSubscriptionsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetAllUsersWithSubscriptionsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetAllUsersWithSubscriptionsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetAllUsersWithSubscriptions'] : ['GetAllUsersWithSubscriptions', variables],
    queryFn: fetchData<GQLGetAllUsersWithSubscriptionsQuery, GQLGetAllUsersWithSubscriptionsQueryVariables>(GetAllUsersWithSubscriptionsDocument, variables),
    ...options
  }
    )};

useGetAllUsersWithSubscriptionsQuery.getKey = (variables?: GQLGetAllUsersWithSubscriptionsQueryVariables) => variables === undefined ? ['GetAllUsersWithSubscriptions'] : ['GetAllUsersWithSubscriptions', variables];

export const useInfiniteGetAllUsersWithSubscriptionsQuery = <
      TData = InfiniteData<GQLGetAllUsersWithSubscriptionsQuery>,
      TError = unknown
    >(
      variables: GQLGetAllUsersWithSubscriptionsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetAllUsersWithSubscriptionsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetAllUsersWithSubscriptionsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetAllUsersWithSubscriptionsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetAllUsersWithSubscriptions.infinite'] : ['GetAllUsersWithSubscriptions.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetAllUsersWithSubscriptionsQuery, GQLGetAllUsersWithSubscriptionsQueryVariables>(GetAllUsersWithSubscriptionsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetAllUsersWithSubscriptionsQuery.getKey = (variables?: GQLGetAllUsersWithSubscriptionsQueryVariables) => variables === undefined ? ['GetAllUsersWithSubscriptions.infinite'] : ['GetAllUsersWithSubscriptions.infinite', variables];


useGetAllUsersWithSubscriptionsQuery.fetcher = (variables?: GQLGetAllUsersWithSubscriptionsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetAllUsersWithSubscriptionsQuery, GQLGetAllUsersWithSubscriptionsQueryVariables>(GetAllUsersWithSubscriptionsDocument, variables, options);

export const GiveLifetimePremiumDocument = `
    mutation GiveLifetimePremium($userId: ID!) {
  giveLifetimePremium(userId: $userId) {
    id
    status
    startDate
    endDate
    isActive
  }
}
    `;

export const useGiveLifetimePremiumMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLGiveLifetimePremiumMutation, TError, GQLGiveLifetimePremiumMutationVariables, TContext>) => {
    
    return useMutation<GQLGiveLifetimePremiumMutation, TError, GQLGiveLifetimePremiumMutationVariables, TContext>(
      {
    mutationKey: ['GiveLifetimePremium'],
    mutationFn: (variables?: GQLGiveLifetimePremiumMutationVariables) => fetchData<GQLGiveLifetimePremiumMutation, GQLGiveLifetimePremiumMutationVariables>(GiveLifetimePremiumDocument, variables)(),
    ...options
  }
    )};

useGiveLifetimePremiumMutation.getKey = () => ['GiveLifetimePremium'];


useGiveLifetimePremiumMutation.fetcher = (variables: GQLGiveLifetimePremiumMutationVariables, options?: RequestInit['headers']) => fetchData<GQLGiveLifetimePremiumMutation, GQLGiveLifetimePremiumMutationVariables>(GiveLifetimePremiumDocument, variables, options);

export const RemoveUserSubscriptionDocument = `
    mutation RemoveUserSubscription($userId: ID!) {
  removeUserSubscription(userId: $userId)
}
    `;

export const useRemoveUserSubscriptionMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveUserSubscriptionMutation, TError, GQLRemoveUserSubscriptionMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveUserSubscriptionMutation, TError, GQLRemoveUserSubscriptionMutationVariables, TContext>(
      {
    mutationKey: ['RemoveUserSubscription'],
    mutationFn: (variables?: GQLRemoveUserSubscriptionMutationVariables) => fetchData<GQLRemoveUserSubscriptionMutation, GQLRemoveUserSubscriptionMutationVariables>(RemoveUserSubscriptionDocument, variables)(),
    ...options
  }
    )};

useRemoveUserSubscriptionMutation.getKey = () => ['RemoveUserSubscription'];


useRemoveUserSubscriptionMutation.fetcher = (variables: GQLRemoveUserSubscriptionMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveUserSubscriptionMutation, GQLRemoveUserSubscriptionMutationVariables>(RemoveUserSubscriptionDocument, variables, options);

export const GetSubscriptionStatsDocument = `
    query GetSubscriptionStats {
  getSubscriptionStats {
    totalUsers
    usersWithActiveSubscriptions
    usersWithExpiredSubscriptions
    usersWithoutSubscriptions
    totalLifetimeSubscriptions
  }
}
    `;

export const useGetSubscriptionStatsQuery = <
      TData = GQLGetSubscriptionStatsQuery,
      TError = unknown
    >(
      variables?: GQLGetSubscriptionStatsQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetSubscriptionStatsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetSubscriptionStatsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetSubscriptionStatsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetSubscriptionStats'] : ['GetSubscriptionStats', variables],
    queryFn: fetchData<GQLGetSubscriptionStatsQuery, GQLGetSubscriptionStatsQueryVariables>(GetSubscriptionStatsDocument, variables),
    ...options
  }
    )};

useGetSubscriptionStatsQuery.getKey = (variables?: GQLGetSubscriptionStatsQueryVariables) => variables === undefined ? ['GetSubscriptionStats'] : ['GetSubscriptionStats', variables];

export const useInfiniteGetSubscriptionStatsQuery = <
      TData = InfiniteData<GQLGetSubscriptionStatsQuery>,
      TError = unknown
    >(
      variables: GQLGetSubscriptionStatsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetSubscriptionStatsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetSubscriptionStatsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetSubscriptionStatsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetSubscriptionStats.infinite'] : ['GetSubscriptionStats.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetSubscriptionStatsQuery, GQLGetSubscriptionStatsQueryVariables>(GetSubscriptionStatsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetSubscriptionStatsQuery.getKey = (variables?: GQLGetSubscriptionStatsQueryVariables) => variables === undefined ? ['GetSubscriptionStats.infinite'] : ['GetSubscriptionStats.infinite', variables];


useGetSubscriptionStatsQuery.fetcher = (variables?: GQLGetSubscriptionStatsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetSubscriptionStatsQuery, GQLGetSubscriptionStatsQueryVariables>(GetSubscriptionStatsDocument, variables, options);

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
    shareWithClient
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

export const GetWorkoutExerciseNotesDocument = `
    query GetWorkoutExerciseNotes($exerciseNames: [String!]!) {
  workoutExerciseNotes(exerciseNames: $exerciseNames) {
    exerciseName
    notes {
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
      replies {
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
  }
}
    `;

export const useGetWorkoutExerciseNotesQuery = <
      TData = GQLGetWorkoutExerciseNotesQuery,
      TError = unknown
    >(
      variables: GQLGetWorkoutExerciseNotesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetWorkoutExerciseNotesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetWorkoutExerciseNotesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetWorkoutExerciseNotesQuery, TError, TData>(
      {
    queryKey: ['GetWorkoutExerciseNotes', variables],
    queryFn: fetchData<GQLGetWorkoutExerciseNotesQuery, GQLGetWorkoutExerciseNotesQueryVariables>(GetWorkoutExerciseNotesDocument, variables),
    ...options
  }
    )};

useGetWorkoutExerciseNotesQuery.getKey = (variables: GQLGetWorkoutExerciseNotesQueryVariables) => ['GetWorkoutExerciseNotes', variables];

export const useInfiniteGetWorkoutExerciseNotesQuery = <
      TData = InfiniteData<GQLGetWorkoutExerciseNotesQuery>,
      TError = unknown
    >(
      variables: GQLGetWorkoutExerciseNotesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetWorkoutExerciseNotesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetWorkoutExerciseNotesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetWorkoutExerciseNotesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetWorkoutExerciseNotes.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetWorkoutExerciseNotesQuery, GQLGetWorkoutExerciseNotesQueryVariables>(GetWorkoutExerciseNotesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetWorkoutExerciseNotesQuery.getKey = (variables: GQLGetWorkoutExerciseNotesQueryVariables) => ['GetWorkoutExerciseNotes.infinite', variables];


useGetWorkoutExerciseNotesQuery.fetcher = (variables: GQLGetWorkoutExerciseNotesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetWorkoutExerciseNotesQuery, GQLGetWorkoutExerciseNotesQueryVariables>(GetWorkoutExerciseNotesDocument, variables, options);

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

export const GetTrainerSharedNotesDocument = `
    query GetTrainerSharedNotes($limit: Int, $offset: Int) {
  trainerSharedNotes(limit: $limit, offset: $offset) {
    id
    text
    relatedTo
    createdAt
    updatedAt
    shareWithClient
    createdBy {
      id
      firstName
      lastName
      image
      role
    }
    replies {
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
}
    `;

export const useGetTrainerSharedNotesQuery = <
      TData = GQLGetTrainerSharedNotesQuery,
      TError = unknown
    >(
      variables?: GQLGetTrainerSharedNotesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetTrainerSharedNotesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetTrainerSharedNotesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetTrainerSharedNotesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetTrainerSharedNotes'] : ['GetTrainerSharedNotes', variables],
    queryFn: fetchData<GQLGetTrainerSharedNotesQuery, GQLGetTrainerSharedNotesQueryVariables>(GetTrainerSharedNotesDocument, variables),
    ...options
  }
    )};

useGetTrainerSharedNotesQuery.getKey = (variables?: GQLGetTrainerSharedNotesQueryVariables) => variables === undefined ? ['GetTrainerSharedNotes'] : ['GetTrainerSharedNotes', variables];

export const useInfiniteGetTrainerSharedNotesQuery = <
      TData = InfiniteData<GQLGetTrainerSharedNotesQuery>,
      TError = unknown
    >(
      variables: GQLGetTrainerSharedNotesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetTrainerSharedNotesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetTrainerSharedNotesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetTrainerSharedNotesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetTrainerSharedNotes.infinite'] : ['GetTrainerSharedNotes.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetTrainerSharedNotesQuery, GQLGetTrainerSharedNotesQueryVariables>(GetTrainerSharedNotesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTrainerSharedNotesQuery.getKey = (variables?: GQLGetTrainerSharedNotesQueryVariables) => variables === undefined ? ['GetTrainerSharedNotes.infinite'] : ['GetTrainerSharedNotes.infinite', variables];


useGetTrainerSharedNotesQuery.fetcher = (variables?: GQLGetTrainerSharedNotesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetTrainerSharedNotesQuery, GQLGetTrainerSharedNotesQueryVariables>(GetTrainerSharedNotesDocument, variables, options);

export const GetTrainerSharedNotesLimitedDocument = `
    query GetTrainerSharedNotesLimited {
  trainerSharedNotes(limit: 5) {
    id
    text
    relatedTo
    createdAt
    updatedAt
    shareWithClient
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

export const useGetTrainerSharedNotesLimitedQuery = <
      TData = GQLGetTrainerSharedNotesLimitedQuery,
      TError = unknown
    >(
      variables?: GQLGetTrainerSharedNotesLimitedQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetTrainerSharedNotesLimitedQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetTrainerSharedNotesLimitedQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetTrainerSharedNotesLimitedQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetTrainerSharedNotesLimited'] : ['GetTrainerSharedNotesLimited', variables],
    queryFn: fetchData<GQLGetTrainerSharedNotesLimitedQuery, GQLGetTrainerSharedNotesLimitedQueryVariables>(GetTrainerSharedNotesLimitedDocument, variables),
    ...options
  }
    )};

useGetTrainerSharedNotesLimitedQuery.getKey = (variables?: GQLGetTrainerSharedNotesLimitedQueryVariables) => variables === undefined ? ['GetTrainerSharedNotesLimited'] : ['GetTrainerSharedNotesLimited', variables];

export const useInfiniteGetTrainerSharedNotesLimitedQuery = <
      TData = InfiniteData<GQLGetTrainerSharedNotesLimitedQuery>,
      TError = unknown
    >(
      variables: GQLGetTrainerSharedNotesLimitedQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetTrainerSharedNotesLimitedQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetTrainerSharedNotesLimitedQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetTrainerSharedNotesLimitedQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetTrainerSharedNotesLimited.infinite'] : ['GetTrainerSharedNotesLimited.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetTrainerSharedNotesLimitedQuery, GQLGetTrainerSharedNotesLimitedQueryVariables>(GetTrainerSharedNotesLimitedDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTrainerSharedNotesLimitedQuery.getKey = (variables?: GQLGetTrainerSharedNotesLimitedQueryVariables) => variables === undefined ? ['GetTrainerSharedNotesLimited.infinite'] : ['GetTrainerSharedNotesLimited.infinite', variables];


useGetTrainerSharedNotesLimitedQuery.fetcher = (variables?: GQLGetTrainerSharedNotesLimitedQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetTrainerSharedNotesLimitedQuery, GQLGetTrainerSharedNotesLimitedQueryVariables>(GetTrainerSharedNotesLimitedDocument, variables, options);

export const GetAllTrainerSharedNotesDocument = `
    query GetAllTrainerSharedNotes {
  trainerSharedNotes {
    id
    text
    relatedTo
    createdAt
    updatedAt
    shareWithClient
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

export const useGetAllTrainerSharedNotesQuery = <
      TData = GQLGetAllTrainerSharedNotesQuery,
      TError = unknown
    >(
      variables?: GQLGetAllTrainerSharedNotesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetAllTrainerSharedNotesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetAllTrainerSharedNotesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetAllTrainerSharedNotesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetAllTrainerSharedNotes'] : ['GetAllTrainerSharedNotes', variables],
    queryFn: fetchData<GQLGetAllTrainerSharedNotesQuery, GQLGetAllTrainerSharedNotesQueryVariables>(GetAllTrainerSharedNotesDocument, variables),
    ...options
  }
    )};

useGetAllTrainerSharedNotesQuery.getKey = (variables?: GQLGetAllTrainerSharedNotesQueryVariables) => variables === undefined ? ['GetAllTrainerSharedNotes'] : ['GetAllTrainerSharedNotes', variables];

export const useInfiniteGetAllTrainerSharedNotesQuery = <
      TData = InfiniteData<GQLGetAllTrainerSharedNotesQuery>,
      TError = unknown
    >(
      variables: GQLGetAllTrainerSharedNotesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetAllTrainerSharedNotesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetAllTrainerSharedNotesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetAllTrainerSharedNotesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetAllTrainerSharedNotes.infinite'] : ['GetAllTrainerSharedNotes.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetAllTrainerSharedNotesQuery, GQLGetAllTrainerSharedNotesQueryVariables>(GetAllTrainerSharedNotesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetAllTrainerSharedNotesQuery.getKey = (variables?: GQLGetAllTrainerSharedNotesQueryVariables) => variables === undefined ? ['GetAllTrainerSharedNotes.infinite'] : ['GetAllTrainerSharedNotes.infinite', variables];


useGetAllTrainerSharedNotesQuery.fetcher = (variables?: GQLGetAllTrainerSharedNotesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetAllTrainerSharedNotesQuery, GQLGetAllTrainerSharedNotesQueryVariables>(GetAllTrainerSharedNotesDocument, variables, options);

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

export const CreateTrainerNoteForClientDocument = `
    mutation CreateTrainerNoteForClient($input: CreateTrainerNoteForClientInput!) {
  createTrainerNoteForClient(input: $input) {
    id
    text
    relatedTo
    createdAt
    updatedAt
    shareWithClient
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

export const useCreateTrainerNoteForClientMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLCreateTrainerNoteForClientMutation, TError, GQLCreateTrainerNoteForClientMutationVariables, TContext>) => {
    
    return useMutation<GQLCreateTrainerNoteForClientMutation, TError, GQLCreateTrainerNoteForClientMutationVariables, TContext>(
      {
    mutationKey: ['CreateTrainerNoteForClient'],
    mutationFn: (variables?: GQLCreateTrainerNoteForClientMutationVariables) => fetchData<GQLCreateTrainerNoteForClientMutation, GQLCreateTrainerNoteForClientMutationVariables>(CreateTrainerNoteForClientDocument, variables)(),
    ...options
  }
    )};

useCreateTrainerNoteForClientMutation.getKey = () => ['CreateTrainerNoteForClient'];


useCreateTrainerNoteForClientMutation.fetcher = (variables: GQLCreateTrainerNoteForClientMutationVariables, options?: RequestInit['headers']) => fetchData<GQLCreateTrainerNoteForClientMutation, GQLCreateTrainerNoteForClientMutationVariables>(CreateTrainerNoteForClientDocument, variables, options);

export const GetMySubscriptionStatusDocument = `
    query GetMySubscriptionStatus {
  getMySubscriptionStatus {
    hasPremium
    trainerId
    canAccessPremiumTrainingPlans
    canAccessPremiumExercises
    canAccessMealPlans
    subscriptionEndDate
    isInGracePeriod
  }
}
    `;

export const useGetMySubscriptionStatusQuery = <
      TData = GQLGetMySubscriptionStatusQuery,
      TError = unknown
    >(
      variables?: GQLGetMySubscriptionStatusQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetMySubscriptionStatusQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetMySubscriptionStatusQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetMySubscriptionStatusQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetMySubscriptionStatus'] : ['GetMySubscriptionStatus', variables],
    queryFn: fetchData<GQLGetMySubscriptionStatusQuery, GQLGetMySubscriptionStatusQueryVariables>(GetMySubscriptionStatusDocument, variables),
    ...options
  }
    )};

useGetMySubscriptionStatusQuery.getKey = (variables?: GQLGetMySubscriptionStatusQueryVariables) => variables === undefined ? ['GetMySubscriptionStatus'] : ['GetMySubscriptionStatus', variables];

export const useInfiniteGetMySubscriptionStatusQuery = <
      TData = InfiniteData<GQLGetMySubscriptionStatusQuery>,
      TError = unknown
    >(
      variables: GQLGetMySubscriptionStatusQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetMySubscriptionStatusQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetMySubscriptionStatusQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetMySubscriptionStatusQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetMySubscriptionStatus.infinite'] : ['GetMySubscriptionStatus.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetMySubscriptionStatusQuery, GQLGetMySubscriptionStatusQueryVariables>(GetMySubscriptionStatusDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMySubscriptionStatusQuery.getKey = (variables?: GQLGetMySubscriptionStatusQueryVariables) => variables === undefined ? ['GetMySubscriptionStatus.infinite'] : ['GetMySubscriptionStatus.infinite', variables];


useGetMySubscriptionStatusQuery.fetcher = (variables?: GQLGetMySubscriptionStatusQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetMySubscriptionStatusQuery, GQLGetMySubscriptionStatusQueryVariables>(GetMySubscriptionStatusDocument, variables, options);

export const CheckPremiumAccessDocument = `
    query CheckPremiumAccess {
  checkPremiumAccess
}
    `;

export const useCheckPremiumAccessQuery = <
      TData = GQLCheckPremiumAccessQuery,
      TError = unknown
    >(
      variables?: GQLCheckPremiumAccessQueryVariables,
      options?: Omit<UseQueryOptions<GQLCheckPremiumAccessQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLCheckPremiumAccessQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLCheckPremiumAccessQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['CheckPremiumAccess'] : ['CheckPremiumAccess', variables],
    queryFn: fetchData<GQLCheckPremiumAccessQuery, GQLCheckPremiumAccessQueryVariables>(CheckPremiumAccessDocument, variables),
    ...options
  }
    )};

useCheckPremiumAccessQuery.getKey = (variables?: GQLCheckPremiumAccessQueryVariables) => variables === undefined ? ['CheckPremiumAccess'] : ['CheckPremiumAccess', variables];

export const useInfiniteCheckPremiumAccessQuery = <
      TData = InfiniteData<GQLCheckPremiumAccessQuery>,
      TError = unknown
    >(
      variables: GQLCheckPremiumAccessQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLCheckPremiumAccessQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLCheckPremiumAccessQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLCheckPremiumAccessQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['CheckPremiumAccess.infinite'] : ['CheckPremiumAccess.infinite', variables],
      queryFn: (metaData) => fetchData<GQLCheckPremiumAccessQuery, GQLCheckPremiumAccessQueryVariables>(CheckPremiumAccessDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteCheckPremiumAccessQuery.getKey = (variables?: GQLCheckPremiumAccessQueryVariables) => variables === undefined ? ['CheckPremiumAccess.infinite'] : ['CheckPremiumAccess.infinite', variables];


useCheckPremiumAccessQuery.fetcher = (variables?: GQLCheckPremiumAccessQueryVariables, options?: RequestInit['headers']) => fetchData<GQLCheckPremiumAccessQuery, GQLCheckPremiumAccessQueryVariables>(CheckPremiumAccessDocument, variables, options);

export const GetMySubscriptionsDocument = `
    query GetMySubscriptions {
  getMySubscriptions {
    id
    userId
    packageId
    trainerId
    status
    startDate
    endDate
    stripeSubscriptionId
    stripePriceId
    isActive
    daysUntilExpiry
    packageId
    trainer {
      id
      name
      email
    }
    createdAt
    updatedAt
  }
}
    `;

export const useGetMySubscriptionsQuery = <
      TData = GQLGetMySubscriptionsQuery,
      TError = unknown
    >(
      variables?: GQLGetMySubscriptionsQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetMySubscriptionsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetMySubscriptionsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetMySubscriptionsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetMySubscriptions'] : ['GetMySubscriptions', variables],
    queryFn: fetchData<GQLGetMySubscriptionsQuery, GQLGetMySubscriptionsQueryVariables>(GetMySubscriptionsDocument, variables),
    ...options
  }
    )};

useGetMySubscriptionsQuery.getKey = (variables?: GQLGetMySubscriptionsQueryVariables) => variables === undefined ? ['GetMySubscriptions'] : ['GetMySubscriptions', variables];

export const useInfiniteGetMySubscriptionsQuery = <
      TData = InfiniteData<GQLGetMySubscriptionsQuery>,
      TError = unknown
    >(
      variables: GQLGetMySubscriptionsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetMySubscriptionsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetMySubscriptionsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetMySubscriptionsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetMySubscriptions.infinite'] : ['GetMySubscriptions.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetMySubscriptionsQuery, GQLGetMySubscriptionsQueryVariables>(GetMySubscriptionsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMySubscriptionsQuery.getKey = (variables?: GQLGetMySubscriptionsQueryVariables) => variables === undefined ? ['GetMySubscriptions.infinite'] : ['GetMySubscriptions.infinite', variables];


useGetMySubscriptionsQuery.fetcher = (variables?: GQLGetMySubscriptionsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetMySubscriptionsQuery, GQLGetMySubscriptionsQueryVariables>(GetMySubscriptionsDocument, variables, options);

export const GetMyServiceDeliveriesDocument = `
    query GetMyServiceDeliveries($status: DeliveryStatus) {
  getMyServiceDeliveries(status: $status) {
    id
    serviceType
    packageName
    quantity
    status
    deliveredAt
    deliveryNotes
    trainer {
      id
      name
      email
    }
    createdAt
    updatedAt
  }
}
    `;

export const useGetMyServiceDeliveriesQuery = <
      TData = GQLGetMyServiceDeliveriesQuery,
      TError = unknown
    >(
      variables?: GQLGetMyServiceDeliveriesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetMyServiceDeliveriesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetMyServiceDeliveriesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetMyServiceDeliveriesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetMyServiceDeliveries'] : ['GetMyServiceDeliveries', variables],
    queryFn: fetchData<GQLGetMyServiceDeliveriesQuery, GQLGetMyServiceDeliveriesQueryVariables>(GetMyServiceDeliveriesDocument, variables),
    ...options
  }
    )};

useGetMyServiceDeliveriesQuery.getKey = (variables?: GQLGetMyServiceDeliveriesQueryVariables) => variables === undefined ? ['GetMyServiceDeliveries'] : ['GetMyServiceDeliveries', variables];

export const useInfiniteGetMyServiceDeliveriesQuery = <
      TData = InfiniteData<GQLGetMyServiceDeliveriesQuery>,
      TError = unknown
    >(
      variables: GQLGetMyServiceDeliveriesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetMyServiceDeliveriesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetMyServiceDeliveriesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetMyServiceDeliveriesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetMyServiceDeliveries.infinite'] : ['GetMyServiceDeliveries.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetMyServiceDeliveriesQuery, GQLGetMyServiceDeliveriesQueryVariables>(GetMyServiceDeliveriesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMyServiceDeliveriesQuery.getKey = (variables?: GQLGetMyServiceDeliveriesQueryVariables) => variables === undefined ? ['GetMyServiceDeliveries.infinite'] : ['GetMyServiceDeliveries.infinite', variables];


useGetMyServiceDeliveriesQuery.fetcher = (variables?: GQLGetMyServiceDeliveriesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetMyServiceDeliveriesQuery, GQLGetMyServiceDeliveriesQueryVariables>(GetMyServiceDeliveriesDocument, variables, options);

export const GetTrainerDeliveriesDocument = `
    query GetTrainerDeliveries($trainerId: ID!, $status: DeliveryStatus) {
  getTrainerDeliveries(trainerId: $trainerId, status: $status) {
    id
    serviceType
    packageName
    quantity
    status
    deliveredAt
    deliveryNotes
    client {
      id
      name
      email
    }
    createdAt
    updatedAt
  }
}
    `;

export const useGetTrainerDeliveriesQuery = <
      TData = GQLGetTrainerDeliveriesQuery,
      TError = unknown
    >(
      variables: GQLGetTrainerDeliveriesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetTrainerDeliveriesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetTrainerDeliveriesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetTrainerDeliveriesQuery, TError, TData>(
      {
    queryKey: ['GetTrainerDeliveries', variables],
    queryFn: fetchData<GQLGetTrainerDeliveriesQuery, GQLGetTrainerDeliveriesQueryVariables>(GetTrainerDeliveriesDocument, variables),
    ...options
  }
    )};

useGetTrainerDeliveriesQuery.getKey = (variables: GQLGetTrainerDeliveriesQueryVariables) => ['GetTrainerDeliveries', variables];

export const useInfiniteGetTrainerDeliveriesQuery = <
      TData = InfiniteData<GQLGetTrainerDeliveriesQuery>,
      TError = unknown
    >(
      variables: GQLGetTrainerDeliveriesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetTrainerDeliveriesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetTrainerDeliveriesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetTrainerDeliveriesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetTrainerDeliveries.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetTrainerDeliveriesQuery, GQLGetTrainerDeliveriesQueryVariables>(GetTrainerDeliveriesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTrainerDeliveriesQuery.getKey = (variables: GQLGetTrainerDeliveriesQueryVariables) => ['GetTrainerDeliveries.infinite', variables];


useGetTrainerDeliveriesQuery.fetcher = (variables: GQLGetTrainerDeliveriesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetTrainerDeliveriesQuery, GQLGetTrainerDeliveriesQueryVariables>(GetTrainerDeliveriesDocument, variables, options);

export const UpdateServiceDeliveryDocument = `
    mutation UpdateServiceDelivery($deliveryId: ID!, $status: DeliveryStatus!, $notes: String) {
  updateServiceDelivery(deliveryId: $deliveryId, status: $status, notes: $notes) {
    id
    status
    deliveredAt
    deliveryNotes
    updatedAt
  }
}
    `;

export const useUpdateServiceDeliveryMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateServiceDeliveryMutation, TError, GQLUpdateServiceDeliveryMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateServiceDeliveryMutation, TError, GQLUpdateServiceDeliveryMutationVariables, TContext>(
      {
    mutationKey: ['UpdateServiceDelivery'],
    mutationFn: (variables?: GQLUpdateServiceDeliveryMutationVariables) => fetchData<GQLUpdateServiceDeliveryMutation, GQLUpdateServiceDeliveryMutationVariables>(UpdateServiceDeliveryDocument, variables)(),
    ...options
  }
    )};

useUpdateServiceDeliveryMutation.getKey = () => ['UpdateServiceDelivery'];


useUpdateServiceDeliveryMutation.fetcher = (variables: GQLUpdateServiceDeliveryMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateServiceDeliveryMutation, GQLUpdateServiceDeliveryMutationVariables>(UpdateServiceDeliveryDocument, variables, options);

export const GetActivePackageTemplatesDocument = `
    query GetActivePackageTemplates($trainerId: ID) {
  getActivePackageTemplates(trainerId: $trainerId) {
    id
    name
    description
    duration
    isActive
    stripeProductId
    stripePriceId
    trainerId
    serviceType
    createdAt
    updatedAt
  }
}
    `;

export const useGetActivePackageTemplatesQuery = <
      TData = GQLGetActivePackageTemplatesQuery,
      TError = unknown
    >(
      variables?: GQLGetActivePackageTemplatesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetActivePackageTemplatesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetActivePackageTemplatesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetActivePackageTemplatesQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetActivePackageTemplates'] : ['GetActivePackageTemplates', variables],
    queryFn: fetchData<GQLGetActivePackageTemplatesQuery, GQLGetActivePackageTemplatesQueryVariables>(GetActivePackageTemplatesDocument, variables),
    ...options
  }
    )};

useGetActivePackageTemplatesQuery.getKey = (variables?: GQLGetActivePackageTemplatesQueryVariables) => variables === undefined ? ['GetActivePackageTemplates'] : ['GetActivePackageTemplates', variables];

export const useInfiniteGetActivePackageTemplatesQuery = <
      TData = InfiniteData<GQLGetActivePackageTemplatesQuery>,
      TError = unknown
    >(
      variables: GQLGetActivePackageTemplatesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetActivePackageTemplatesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetActivePackageTemplatesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetActivePackageTemplatesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetActivePackageTemplates.infinite'] : ['GetActivePackageTemplates.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetActivePackageTemplatesQuery, GQLGetActivePackageTemplatesQueryVariables>(GetActivePackageTemplatesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetActivePackageTemplatesQuery.getKey = (variables?: GQLGetActivePackageTemplatesQueryVariables) => variables === undefined ? ['GetActivePackageTemplates.infinite'] : ['GetActivePackageTemplates.infinite', variables];


useGetActivePackageTemplatesQuery.fetcher = (variables?: GQLGetActivePackageTemplatesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetActivePackageTemplatesQuery, GQLGetActivePackageTemplatesQueryVariables>(GetActivePackageTemplatesDocument, variables, options);

export const AssignTemplateToSelfDocument = `
    mutation AssignTemplateToSelf($planId: ID!) {
  assignTemplateToSelf(planId: $planId)
}
    `;

export const useAssignTemplateToSelfMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAssignTemplateToSelfMutation, TError, GQLAssignTemplateToSelfMutationVariables, TContext>) => {
    
    return useMutation<GQLAssignTemplateToSelfMutation, TError, GQLAssignTemplateToSelfMutationVariables, TContext>(
      {
    mutationKey: ['AssignTemplateToSelf'],
    mutationFn: (variables?: GQLAssignTemplateToSelfMutationVariables) => fetchData<GQLAssignTemplateToSelfMutation, GQLAssignTemplateToSelfMutationVariables>(AssignTemplateToSelfDocument, variables)(),
    ...options
  }
    )};

useAssignTemplateToSelfMutation.getKey = () => ['AssignTemplateToSelf'];


useAssignTemplateToSelfMutation.fetcher = (variables: GQLAssignTemplateToSelfMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAssignTemplateToSelfMutation, GQLAssignTemplateToSelfMutationVariables>(AssignTemplateToSelfDocument, variables, options);

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
      avatarUrl
      hasCompletedOnboarding
      height
      weight
      weekStartsOn
      weightUnit
      heightUnit
      theme
      timeFormat
      trainingView
      hasCompletedOnboarding
      notificationPreferences {
        workoutReminders
        progressUpdates
        systemNotifications
        emailNotifications
        pushNotifications
      }
    }
    capacity
    trainerId
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

export const GetOrCreateChatDocument = `
    query GetOrCreateChat($partnerId: ID!) {
  getOrCreateChat(partnerId: $partnerId) {
    id
    trainerId
    clientId
    trainer {
      id
      email
      firstName
      lastName
      image
    }
    client {
      id
      email
      firstName
      lastName
      image
    }
    unreadCount
    lastMessage {
      id
      content
      createdAt
      sender {
        id
        firstName
        lastName
      }
    }
    createdAt
    updatedAt
  }
}
    `;

export const useGetOrCreateChatQuery = <
      TData = GQLGetOrCreateChatQuery,
      TError = unknown
    >(
      variables: GQLGetOrCreateChatQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetOrCreateChatQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetOrCreateChatQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetOrCreateChatQuery, TError, TData>(
      {
    queryKey: ['GetOrCreateChat', variables],
    queryFn: fetchData<GQLGetOrCreateChatQuery, GQLGetOrCreateChatQueryVariables>(GetOrCreateChatDocument, variables),
    ...options
  }
    )};

useGetOrCreateChatQuery.getKey = (variables: GQLGetOrCreateChatQueryVariables) => ['GetOrCreateChat', variables];

export const useInfiniteGetOrCreateChatQuery = <
      TData = InfiniteData<GQLGetOrCreateChatQuery>,
      TError = unknown
    >(
      variables: GQLGetOrCreateChatQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetOrCreateChatQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetOrCreateChatQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetOrCreateChatQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetOrCreateChat.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetOrCreateChatQuery, GQLGetOrCreateChatQueryVariables>(GetOrCreateChatDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetOrCreateChatQuery.getKey = (variables: GQLGetOrCreateChatQueryVariables) => ['GetOrCreateChat.infinite', variables];


useGetOrCreateChatQuery.fetcher = (variables: GQLGetOrCreateChatQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetOrCreateChatQuery, GQLGetOrCreateChatQueryVariables>(GetOrCreateChatDocument, variables, options);

export const GetChatMessagesDocument = `
    query GetChatMessages($chatId: ID!, $skip: Int, $take: Int) {
  getChatMessages(chatId: $chatId, skip: $skip, take: $take) {
    id
    chatId
    content
    imageUrl
    isEdited
    isDeleted
    readAt
    createdAt
    updatedAt
    sender {
      id
      firstName
      lastName
      email
      image
    }
  }
}
    `;

export const useGetChatMessagesQuery = <
      TData = GQLGetChatMessagesQuery,
      TError = unknown
    >(
      variables: GQLGetChatMessagesQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetChatMessagesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetChatMessagesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetChatMessagesQuery, TError, TData>(
      {
    queryKey: ['GetChatMessages', variables],
    queryFn: fetchData<GQLGetChatMessagesQuery, GQLGetChatMessagesQueryVariables>(GetChatMessagesDocument, variables),
    ...options
  }
    )};

useGetChatMessagesQuery.getKey = (variables: GQLGetChatMessagesQueryVariables) => ['GetChatMessages', variables];

export const useInfiniteGetChatMessagesQuery = <
      TData = InfiniteData<GQLGetChatMessagesQuery>,
      TError = unknown
    >(
      variables: GQLGetChatMessagesQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetChatMessagesQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetChatMessagesQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetChatMessagesQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? ['GetChatMessages.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetChatMessagesQuery, GQLGetChatMessagesQueryVariables>(GetChatMessagesDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetChatMessagesQuery.getKey = (variables: GQLGetChatMessagesQueryVariables) => ['GetChatMessages.infinite', variables];


useGetChatMessagesQuery.fetcher = (variables: GQLGetChatMessagesQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetChatMessagesQuery, GQLGetChatMessagesQueryVariables>(GetChatMessagesDocument, variables, options);

export const GetMyChatsDocument = `
    query GetMyChats {
  getMyChats {
    id
    trainerId
    clientId
    trainer {
      id
      firstName
      lastName
      email
      image
    }
    client {
      id
      firstName
      lastName
      email
      image
    }
    unreadCount
    lastMessage {
      id
      content
      createdAt
    }
    createdAt
    updatedAt
  }
}
    `;

export const useGetMyChatsQuery = <
      TData = GQLGetMyChatsQuery,
      TError = unknown
    >(
      variables?: GQLGetMyChatsQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetMyChatsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetMyChatsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetMyChatsQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetMyChats'] : ['GetMyChats', variables],
    queryFn: fetchData<GQLGetMyChatsQuery, GQLGetMyChatsQueryVariables>(GetMyChatsDocument, variables),
    ...options
  }
    )};

useGetMyChatsQuery.getKey = (variables?: GQLGetMyChatsQueryVariables) => variables === undefined ? ['GetMyChats'] : ['GetMyChats', variables];

export const useInfiniteGetMyChatsQuery = <
      TData = InfiniteData<GQLGetMyChatsQuery>,
      TError = unknown
    >(
      variables: GQLGetMyChatsQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetMyChatsQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetMyChatsQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetMyChatsQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetMyChats.infinite'] : ['GetMyChats.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetMyChatsQuery, GQLGetMyChatsQueryVariables>(GetMyChatsDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMyChatsQuery.getKey = (variables?: GQLGetMyChatsQueryVariables) => variables === undefined ? ['GetMyChats.infinite'] : ['GetMyChats.infinite', variables];


useGetMyChatsQuery.fetcher = (variables?: GQLGetMyChatsQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetMyChatsQuery, GQLGetMyChatsQueryVariables>(GetMyChatsDocument, variables, options);

export const GetTotalUnreadCountDocument = `
    query GetTotalUnreadCount {
  getTotalUnreadCount
}
    `;

export const useGetTotalUnreadCountQuery = <
      TData = GQLGetTotalUnreadCountQuery,
      TError = unknown
    >(
      variables?: GQLGetTotalUnreadCountQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetTotalUnreadCountQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetTotalUnreadCountQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetTotalUnreadCountQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetTotalUnreadCount'] : ['GetTotalUnreadCount', variables],
    queryFn: fetchData<GQLGetTotalUnreadCountQuery, GQLGetTotalUnreadCountQueryVariables>(GetTotalUnreadCountDocument, variables),
    ...options
  }
    )};

useGetTotalUnreadCountQuery.getKey = (variables?: GQLGetTotalUnreadCountQueryVariables) => variables === undefined ? ['GetTotalUnreadCount'] : ['GetTotalUnreadCount', variables];

export const useInfiniteGetTotalUnreadCountQuery = <
      TData = InfiniteData<GQLGetTotalUnreadCountQuery>,
      TError = unknown
    >(
      variables: GQLGetTotalUnreadCountQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetTotalUnreadCountQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetTotalUnreadCountQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetTotalUnreadCountQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetTotalUnreadCount.infinite'] : ['GetTotalUnreadCount.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetTotalUnreadCountQuery, GQLGetTotalUnreadCountQueryVariables>(GetTotalUnreadCountDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetTotalUnreadCountQuery.getKey = (variables?: GQLGetTotalUnreadCountQueryVariables) => variables === undefined ? ['GetTotalUnreadCount.infinite'] : ['GetTotalUnreadCount.infinite', variables];


useGetTotalUnreadCountQuery.fetcher = (variables?: GQLGetTotalUnreadCountQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetTotalUnreadCountQuery, GQLGetTotalUnreadCountQueryVariables>(GetTotalUnreadCountDocument, variables, options);

export const GetMessengerInitialDataDocument = `
    query GetMessengerInitialData($messagesPerChat: Int) {
  getMessengerInitialData(messagesPerChat: $messagesPerChat) {
    chats {
      id
      trainerId
      clientId
      trainer {
        id
        firstName
        lastName
        email
        image
      }
      client {
        id
        firstName
        lastName
        email
        image
      }
      messages {
        id
        chatId
        content
        imageUrl
        isEdited
        isDeleted
        readAt
        createdAt
        updatedAt
        sender {
          id
          email
          firstName
          lastName
          image
        }
      }
      hasMoreMessages
      lastMessage {
        id
        content
        createdAt
        sender {
          id
          email
          firstName
          lastName
          image
        }
      }
      unreadCount
      createdAt
      updatedAt
    }
    totalUnreadCount
  }
}
    `;

export const useGetMessengerInitialDataQuery = <
      TData = GQLGetMessengerInitialDataQuery,
      TError = unknown
    >(
      variables?: GQLGetMessengerInitialDataQueryVariables,
      options?: Omit<UseQueryOptions<GQLGetMessengerInitialDataQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLGetMessengerInitialDataQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLGetMessengerInitialDataQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['GetMessengerInitialData'] : ['GetMessengerInitialData', variables],
    queryFn: fetchData<GQLGetMessengerInitialDataQuery, GQLGetMessengerInitialDataQueryVariables>(GetMessengerInitialDataDocument, variables),
    ...options
  }
    )};

useGetMessengerInitialDataQuery.getKey = (variables?: GQLGetMessengerInitialDataQueryVariables) => variables === undefined ? ['GetMessengerInitialData'] : ['GetMessengerInitialData', variables];

export const useInfiniteGetMessengerInitialDataQuery = <
      TData = InfiniteData<GQLGetMessengerInitialDataQuery>,
      TError = unknown
    >(
      variables: GQLGetMessengerInitialDataQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLGetMessengerInitialDataQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLGetMessengerInitialDataQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLGetMessengerInitialDataQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['GetMessengerInitialData.infinite'] : ['GetMessengerInitialData.infinite', variables],
      queryFn: (metaData) => fetchData<GQLGetMessengerInitialDataQuery, GQLGetMessengerInitialDataQueryVariables>(GetMessengerInitialDataDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteGetMessengerInitialDataQuery.getKey = (variables?: GQLGetMessengerInitialDataQueryVariables) => variables === undefined ? ['GetMessengerInitialData.infinite'] : ['GetMessengerInitialData.infinite', variables];


useGetMessengerInitialDataQuery.fetcher = (variables?: GQLGetMessengerInitialDataQueryVariables, options?: RequestInit['headers']) => fetchData<GQLGetMessengerInitialDataQuery, GQLGetMessengerInitialDataQueryVariables>(GetMessengerInitialDataDocument, variables, options);

export const SendMessageDocument = `
    mutation SendMessage($input: SendMessageInput!) {
  sendMessage(input: $input) {
    id
    chatId
    content
    imageUrl
    isEdited
    isDeleted
    readAt
    createdAt
    updatedAt
    sender {
      id
      firstName
      lastName
      image
    }
  }
}
    `;

export const useSendMessageMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLSendMessageMutation, TError, GQLSendMessageMutationVariables, TContext>) => {
    
    return useMutation<GQLSendMessageMutation, TError, GQLSendMessageMutationVariables, TContext>(
      {
    mutationKey: ['SendMessage'],
    mutationFn: (variables?: GQLSendMessageMutationVariables) => fetchData<GQLSendMessageMutation, GQLSendMessageMutationVariables>(SendMessageDocument, variables)(),
    ...options
  }
    )};

useSendMessageMutation.getKey = () => ['SendMessage'];


useSendMessageMutation.fetcher = (variables: GQLSendMessageMutationVariables, options?: RequestInit['headers']) => fetchData<GQLSendMessageMutation, GQLSendMessageMutationVariables>(SendMessageDocument, variables, options);

export const EditMessageDocument = `
    mutation EditMessage($input: EditMessageInput!) {
  editMessage(input: $input) {
    id
    chatId
    content
    imageUrl
    isEdited
    isDeleted
    readAt
    createdAt
    updatedAt
    sender {
      id
      firstName
      lastName
      image
    }
  }
}
    `;

export const useEditMessageMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLEditMessageMutation, TError, GQLEditMessageMutationVariables, TContext>) => {
    
    return useMutation<GQLEditMessageMutation, TError, GQLEditMessageMutationVariables, TContext>(
      {
    mutationKey: ['EditMessage'],
    mutationFn: (variables?: GQLEditMessageMutationVariables) => fetchData<GQLEditMessageMutation, GQLEditMessageMutationVariables>(EditMessageDocument, variables)(),
    ...options
  }
    )};

useEditMessageMutation.getKey = () => ['EditMessage'];


useEditMessageMutation.fetcher = (variables: GQLEditMessageMutationVariables, options?: RequestInit['headers']) => fetchData<GQLEditMessageMutation, GQLEditMessageMutationVariables>(EditMessageDocument, variables, options);

export const DeleteMessageDocument = `
    mutation DeleteMessage($id: ID!) {
  deleteMessage(id: $id)
}
    `;

export const useDeleteMessageMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDeleteMessageMutation, TError, GQLDeleteMessageMutationVariables, TContext>) => {
    
    return useMutation<GQLDeleteMessageMutation, TError, GQLDeleteMessageMutationVariables, TContext>(
      {
    mutationKey: ['DeleteMessage'],
    mutationFn: (variables?: GQLDeleteMessageMutationVariables) => fetchData<GQLDeleteMessageMutation, GQLDeleteMessageMutationVariables>(DeleteMessageDocument, variables)(),
    ...options
  }
    )};

useDeleteMessageMutation.getKey = () => ['DeleteMessage'];


useDeleteMessageMutation.fetcher = (variables: GQLDeleteMessageMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDeleteMessageMutation, GQLDeleteMessageMutationVariables>(DeleteMessageDocument, variables, options);

export const MarkMessagesAsReadDocument = `
    mutation MarkMessagesAsRead($input: MarkMessagesAsReadInput!) {
  markMessagesAsRead(input: $input)
}
    `;

export const useMarkMessagesAsReadMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLMarkMessagesAsReadMutation, TError, GQLMarkMessagesAsReadMutationVariables, TContext>) => {
    
    return useMutation<GQLMarkMessagesAsReadMutation, TError, GQLMarkMessagesAsReadMutationVariables, TContext>(
      {
    mutationKey: ['MarkMessagesAsRead'],
    mutationFn: (variables?: GQLMarkMessagesAsReadMutationVariables) => fetchData<GQLMarkMessagesAsReadMutation, GQLMarkMessagesAsReadMutationVariables>(MarkMessagesAsReadDocument, variables)(),
    ...options
  }
    )};

useMarkMessagesAsReadMutation.getKey = () => ['MarkMessagesAsRead'];


useMarkMessagesAsReadMutation.fetcher = (variables: GQLMarkMessagesAsReadMutationVariables, options?: RequestInit['headers']) => fetchData<GQLMarkMessagesAsReadMutation, GQLMarkMessagesAsReadMutationVariables>(MarkMessagesAsReadDocument, variables, options);
