import { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
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
  JSON: { input: any; output: any; }
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

export type GQLAddFreeWorkoutDayInput = {
  heroImageUrl?: InputMaybe<Scalars['String']['input']>;
  planId: Scalars['ID']['input'];
  trainingDayId: Scalars['ID']['input'];
};

export type GQLAddIngredientToMealInput = {
  grams: Scalars['Float']['input'];
  ingredientId: Scalars['ID']['input'];
  mealId: Scalars['ID']['input'];
};

export type GQLAddMealToDayInput = {
  dayId: Scalars['ID']['input'];
  mealId: Scalars['ID']['input'];
};

export type GQLAddNutritionPlanDayInput = {
  dayNumber: Scalars['Int']['input'];
  name: Scalars['String']['input'];
  nutritionPlanId: Scalars['ID']['input'];
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
  variants: EntireFieldWrapper<Array<GQLAiWorkoutVariant>>;
};

export type GQLAiWorkoutVariant = {
  __typename?: 'AiWorkoutVariant';
  exercises: EntireFieldWrapper<Array<GQLAiWorkoutExercise>>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  reasoning: EntireFieldWrapper<Scalars['String']['output']>;
  summary: EntireFieldWrapper<Scalars['String']['output']>;
  totalDuration?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
};

export type GQLAssignTrainingPlanToClientInput = {
  clientId: Scalars['ID']['input'];
  planId: Scalars['ID']['input'];
  startDate?: InputMaybe<Scalars['String']['input']>;
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

export type GQLBodyCompositionChange = {
  __typename?: 'BodyCompositionChange';
  endSnapshot?: EntireFieldWrapper<Maybe<GQLBodyCompositionSnapshot>>;
  endWeight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  startSnapshot?: EntireFieldWrapper<Maybe<GQLBodyCompositionSnapshot>>;
  startWeight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  unit: EntireFieldWrapper<Scalars['String']['output']>;
  weightChange?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
};

export type GQLBodyCompositionSnapshot = {
  __typename?: 'BodyCompositionSnapshot';
  image1Url?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  image2Url?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  image3Url?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  loggedAt: EntireFieldWrapper<Scalars['String']['output']>;
  weight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
};

export type GQLBodyProgressLog = {
  __typename?: 'BodyProgressLog';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['String']['output']>;
  image1?: EntireFieldWrapper<Maybe<GQLOptimizedImage>>;
  image2?: EntireFieldWrapper<Maybe<GQLOptimizedImage>>;
  image3?: EntireFieldWrapper<Maybe<GQLOptimizedImage>>;
  loggedAt: EntireFieldWrapper<Scalars['String']['output']>;
  notes?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  shareWithTrainer: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLChat = {
  __typename?: 'Chat';
  client: EntireFieldWrapper<GQLUserPublic>;
  clientId: EntireFieldWrapper<Scalars['ID']['output']>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  lastMessage?: EntireFieldWrapper<Maybe<GQLMessage>>;
  messages: EntireFieldWrapper<Array<GQLMessage>>;
  trainer: EntireFieldWrapper<GQLUserPublic>;
  trainerId: EntireFieldWrapper<Scalars['ID']['output']>;
  unreadCount: EntireFieldWrapper<Scalars['Int']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};


export type GQLChatMessagesArgs = {
  skip?: InputMaybe<Scalars['Int']['input']>;
  take?: InputMaybe<Scalars['Int']['input']>;
};

export type GQLChatWithMessages = {
  __typename?: 'ChatWithMessages';
  client: EntireFieldWrapper<GQLUserPublic>;
  clientId: EntireFieldWrapper<Scalars['ID']['output']>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  hasMoreMessages: EntireFieldWrapper<Scalars['Boolean']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  lastMessage?: EntireFieldWrapper<Maybe<GQLMessage>>;
  messages: EntireFieldWrapper<Array<GQLMessage>>;
  trainer: EntireFieldWrapper<GQLUserPublic>;
  trainerId: EntireFieldWrapper<Scalars['ID']['output']>;
  unreadCount: EntireFieldWrapper<Scalars['Int']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLCheckinCompletion = {
  __typename?: 'CheckinCompletion';
  completedAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  measurement?: EntireFieldWrapper<Maybe<GQLUserBodyMeasure>>;
  progressLog?: EntireFieldWrapper<Maybe<GQLBodyProgressLog>>;
};

export enum GQLCheckinFrequency {
  Biweekly = 'BIWEEKLY',
  Monthly = 'MONTHLY',
  Weekly = 'WEEKLY'
}

export type GQLCheckinSchedule = {
  __typename?: 'CheckinSchedule';
  completions: EntireFieldWrapper<Array<GQLCheckinCompletion>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  dayOfMonth?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  dayOfWeek?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  frequency: EntireFieldWrapper<GQLCheckinFrequency>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isActive: EntireFieldWrapper<Scalars['Boolean']['output']>;
  nextCheckinDate?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLCheckinStatus = {
  __typename?: 'CheckinStatus';
  daysSinceLastCheckin?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  hasSchedule: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isCheckinDue: EntireFieldWrapper<Scalars['Boolean']['output']>;
  nextCheckinDate?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  schedule?: EntireFieldWrapper<Maybe<GQLCheckinSchedule>>;
};

export type GQLClientSurvey = {
  __typename?: 'ClientSurvey';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  data: EntireFieldWrapper<Scalars['JSON']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  user: EntireFieldWrapper<GQLUser>;
  userId: EntireFieldWrapper<Scalars['ID']['output']>;
  version: EntireFieldWrapper<Scalars['Int']['output']>;
};

export type GQLClientSurveyDataInput = {
  additionalInfo?: InputMaybe<Scalars['String']['input']>;
  allergies?: InputMaybe<Scalars['String']['input']>;
  biggestChallenge?: InputMaybe<Scalars['String']['input']>;
  cuisineTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  currentFitnessLevel?: InputMaybe<Scalars['String']['input']>;
  deadline?: InputMaybe<Scalars['String']['input']>;
  dietQuality?: InputMaybe<Scalars['String']['input']>;
  exerciseFrequency?: InputMaybe<Scalars['String']['input']>;
  exerciseTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  hasAllergies?: InputMaybe<Scalars['Boolean']['input']>;
  hasDeadline?: InputMaybe<Scalars['Boolean']['input']>;
  hasInjuries?: InputMaybe<Scalars['Boolean']['input']>;
  hasRecentBloodTests?: InputMaybe<Scalars['Boolean']['input']>;
  hasSleepIssues?: InputMaybe<Scalars['Boolean']['input']>;
  hatedExercises?: InputMaybe<Scalars['String']['input']>;
  injuries?: InputMaybe<Scalars['String']['input']>;
  lovedExercises?: InputMaybe<Scalars['String']['input']>;
  motivationLevel?: InputMaybe<Scalars['Int']['input']>;
  otherChallenge?: InputMaybe<Scalars['String']['input']>;
  otherCuisine?: InputMaybe<Scalars['String']['input']>;
  otherExerciseType?: InputMaybe<Scalars['String']['input']>;
  otherPrimaryGoal?: InputMaybe<Scalars['String']['input']>;
  otherSecondaryGoal?: InputMaybe<Scalars['String']['input']>;
  otherSupplement?: InputMaybe<Scalars['String']['input']>;
  preferredDuration?: InputMaybe<Scalars['String']['input']>;
  preferredLocation?: InputMaybe<Scalars['String']['input']>;
  primaryGoal?: InputMaybe<Scalars['String']['input']>;
  secondaryGoal?: InputMaybe<Scalars['String']['input']>;
  sleepHours?: InputMaybe<Scalars['String']['input']>;
  supplements?: InputMaybe<Array<Scalars['String']['input']>>;
  tracksNutrition?: InputMaybe<Scalars['String']['input']>;
  trainingDuration?: InputMaybe<Scalars['String']['input']>;
};

export type GQLCoachingRequest = {
  __typename?: 'CoachingRequest';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  interestedServices?: EntireFieldWrapper<Maybe<Array<Scalars['String']['output']>>>;
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

export type GQLCompleteCheckinInput = {
  measurementData?: InputMaybe<GQLAddBodyMeasurementInput>;
  progressLogData?: InputMaybe<GQLCreateBodyProgressLogInput>;
};

export type GQLCopyExercisesFromDayInput = {
  sourceDayId: Scalars['ID']['input'];
  targetDayId: Scalars['ID']['input'];
};

export type GQLCopyNutritionPlanInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  sourceNutritionPlanId: Scalars['ID']['input'];
  targetClientId: Scalars['ID']['input'];
};

export type GQLCopyNutritionPlanPayload = {
  __typename?: 'CopyNutritionPlanPayload';
  nutritionPlan: EntireFieldWrapper<GQLNutritionPlan>;
  success: EntireFieldWrapper<Scalars['Boolean']['output']>;
};

export type GQLCreateBodyProgressLogInput = {
  image1Url?: InputMaybe<Scalars['String']['input']>;
  image2Url?: InputMaybe<Scalars['String']['input']>;
  image3Url?: InputMaybe<Scalars['String']['input']>;
  loggedAt?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  shareWithTrainer?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GQLCreateCheckinScheduleInput = {
  dayOfMonth?: InputMaybe<Scalars['Int']['input']>;
  dayOfWeek?: InputMaybe<Scalars['Int']['input']>;
  frequency: GQLCheckinFrequency;
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

export type GQLCreateIngredientInput = {
  caloriesPer100g: Scalars['Float']['input'];
  carbsPer100g: Scalars['Float']['input'];
  fatPer100g: Scalars['Float']['input'];
  name: Scalars['String']['input'];
  proteinPer100g: Scalars['Float']['input'];
};

export type GQLCreateMealInput = {
  cookingTime?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  instructions?: InputMaybe<Array<Scalars['String']['input']>>;
  name: Scalars['String']['input'];
  preparationTime?: InputMaybe<Scalars['Int']['input']>;
  servings?: InputMaybe<Scalars['Int']['input']>;
};

export type GQLCreateMeetingInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration: Scalars['Int']['input'];
  locationType: GQLLocationType;
  meetingLink?: InputMaybe<Scalars['String']['input']>;
  scheduledAt: Scalars['String']['input'];
  serviceDeliveryId?: InputMaybe<Scalars['ID']['input']>;
  serviceTaskId?: InputMaybe<Scalars['ID']['input']>;
  timezone: Scalars['String']['input'];
  title: Scalars['String']['input'];
  traineeId: Scalars['ID']['input'];
  type: GQLMeetingType;
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

export type GQLCreateNutritionPlanInput = {
  clientId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type GQLCreateNutritionPlanPayload = {
  __typename?: 'CreateNutritionPlanPayload';
  nutritionPlan: EntireFieldWrapper<GQLNutritionPlan>;
  success: EntireFieldWrapper<Scalars['Boolean']['output']>;
};

export type GQLCreatePushSubscriptionInput = {
  auth: Scalars['String']['input'];
  endpoint: Scalars['String']['input'];
  p256dh: Scalars['String']['input'];
  userAgent?: InputMaybe<Scalars['String']['input']>;
};

export type GQLCreateQuickWorkoutInput = {
  dayId?: InputMaybe<Scalars['ID']['input']>;
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
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  success: EntireFieldWrapper<Scalars['Boolean']['output']>;
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
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  exerciseId: EntireFieldWrapper<Scalars['ID']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  notes?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  performedAt: EntireFieldWrapper<Scalars['String']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLExerciseOrderInput = {
  exerciseId: Scalars['ID']['input'];
  order: Scalars['Int']['input'];
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

export type GQLFreeWorkoutDay = {
  __typename?: 'FreeWorkoutDay';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  heroImageUrl?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isVisible: EntireFieldWrapper<Scalars['Boolean']['output']>;
  plan?: EntireFieldWrapper<Maybe<GQLTrainingPlan>>;
  planId: EntireFieldWrapper<Scalars['ID']['output']>;
  trainingDay?: EntireFieldWrapper<Maybe<GQLTrainingDay>>;
  trainingDayId: EntireFieldWrapper<Scalars['ID']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLGenerateAiWorkoutInput = {
  exerciseCount: Scalars['Int']['input'];
  maxSetsPerExercise: Scalars['Int']['input'];
  repFocus: GQLRepFocus;
  selectedEquipment: Array<GQLEquipment>;
  selectedMuscleGroups: Array<Scalars['String']['input']>;
  workoutSubType?: InputMaybe<Scalars['String']['input']>;
  workoutType?: InputMaybe<Scalars['String']['input']>;
};

export type GQLGetExercisesResponse = {
  __typename?: 'GetExercisesResponse';
  publicExercises: EntireFieldWrapper<Array<GQLBaseExercise>>;
  trainerExercises: EntireFieldWrapper<Array<GQLBaseExercise>>;
};

export type GQLGetWorkoutDayPayload = {
  __typename?: 'GetWorkoutDayPayload';
  day: EntireFieldWrapper<GQLTrainingDay>;
  previousDayLogs: EntireFieldWrapper<Array<GQLPreviousExerciseLog>>;
};

export type GQLGetWorkoutNavigationPayload = {
  __typename?: 'GetWorkoutNavigationPayload';
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
  large?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  medium?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  order: EntireFieldWrapper<Scalars['Int']['output']>;
  thumbnail?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  url: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLIngredient = {
  __typename?: 'Ingredient';
  caloriesPer100g: EntireFieldWrapper<Scalars['Float']['output']>;
  carbsPer100g: EntireFieldWrapper<Scalars['Float']['output']>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  createdBy?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  fatPer100g: EntireFieldWrapper<Scalars['Float']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  proteinPer100g: EntireFieldWrapper<Scalars['Float']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
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
  city: EntireFieldWrapper<Scalars['String']['output']>;
  country: EntireFieldWrapper<Scalars['String']['output']>;
  countryCode: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
};

export enum GQLLocationType {
  CoachLocation = 'COACH_LOCATION',
  Other = 'OTHER',
  TraineeLocation = 'TRAINEE_LOCATION',
  Virtual = 'VIRTUAL'
}

export type GQLLogSetInput = {
  loggedReps?: InputMaybe<Scalars['Int']['input']>;
  loggedWeight?: InputMaybe<Scalars['Float']['input']>;
  setId: Scalars['ID']['input'];
};

export type GQLMacroDistribution = {
  __typename?: 'MacroDistribution';
  carbsPercentage: EntireFieldWrapper<Scalars['Int']['output']>;
  fatPercentage: EntireFieldWrapper<Scalars['Int']['output']>;
  proteinPercentage: EntireFieldWrapper<Scalars['Int']['output']>;
};

export type GQLMacroTarget = {
  __typename?: 'MacroTarget';
  calories?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  carbs?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  clientId: EntireFieldWrapper<Scalars['String']['output']>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  fat?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  notes?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  protein?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  trainerId: EntireFieldWrapper<Scalars['String']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLMacroTotals = {
  __typename?: 'MacroTotals';
  calories: EntireFieldWrapper<Scalars['Float']['output']>;
  carbs: EntireFieldWrapper<Scalars['Float']['output']>;
  fat: EntireFieldWrapper<Scalars['Float']['output']>;
  protein: EntireFieldWrapper<Scalars['Float']['output']>;
};

export type GQLMarkMessagesAsReadInput = {
  chatId: Scalars['ID']['input'];
};

export type GQLMeal = {
  __typename?: 'Meal';
  archived: EntireFieldWrapper<Scalars['Boolean']['output']>;
  cookingTime?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  createdBy?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  ingredients: EntireFieldWrapper<Array<GQLMealIngredient>>;
  instructions: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  preparationTime?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  servings?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  team?: EntireFieldWrapper<Maybe<GQLTeam>>;
  totalMacros: EntireFieldWrapper<GQLMacroTotals>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  usageCount: EntireFieldWrapper<Scalars['Int']['output']>;
};

export type GQLMealIngredient = {
  __typename?: 'MealIngredient';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  grams: EntireFieldWrapper<Scalars['Float']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  ingredient: EntireFieldWrapper<GQLIngredient>;
  macros: EntireFieldWrapper<GQLMacroTotals>;
  order: EntireFieldWrapper<Scalars['Int']['output']>;
};

export enum GQLMealSortBy {
  CreatedAt = 'CREATED_AT',
  Name = 'NAME',
  UsageCount = 'USAGE_COUNT'
}

export type GQLMeeting = {
  __typename?: 'Meeting';
  address?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  coach: EntireFieldWrapper<GQLUserPublic>;
  coachId: EntireFieldWrapper<Scalars['ID']['output']>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  duration: EntireFieldWrapper<Scalars['Int']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  locationType: EntireFieldWrapper<GQLLocationType>;
  meetingLink?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  notes?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  scheduledAt: EntireFieldWrapper<Scalars['String']['output']>;
  serviceDelivery?: EntireFieldWrapper<Maybe<GQLServiceDelivery>>;
  serviceDeliveryId?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
  serviceTask?: EntireFieldWrapper<Maybe<GQLServiceTask>>;
  serviceTaskId?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
  status: EntireFieldWrapper<GQLMeetingStatus>;
  timezone: EntireFieldWrapper<Scalars['String']['output']>;
  title: EntireFieldWrapper<Scalars['String']['output']>;
  trainee: EntireFieldWrapper<GQLUserPublic>;
  traineeId: EntireFieldWrapper<Scalars['ID']['output']>;
  type: EntireFieldWrapper<GQLMeetingType>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export enum GQLMeetingStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Confirmed = 'CONFIRMED',
  Pending = 'PENDING',
  Rescheduled = 'RESCHEDULED'
}

export enum GQLMeetingType {
  CheckIn = 'CHECK_IN',
  InitialConsultation = 'INITIAL_CONSULTATION',
  InPersonTraining = 'IN_PERSON_TRAINING',
  PlanReview = 'PLAN_REVIEW'
}

export type GQLMessage = {
  __typename?: 'Message';
  chatId: EntireFieldWrapper<Scalars['ID']['output']>;
  content: EntireFieldWrapper<Scalars['String']['output']>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  imageUrl?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  isDeleted: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isEdited: EntireFieldWrapper<Scalars['Boolean']['output']>;
  readAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  sender: EntireFieldWrapper<GQLUserPublic>;
  senderId: EntireFieldWrapper<Scalars['ID']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLMessengerInitialData = {
  __typename?: 'MessengerInitialData';
  chats: EntireFieldWrapper<Array<GQLChatWithMessages>>;
  totalUnreadCount: EntireFieldWrapper<Scalars['Int']['output']>;
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

export type GQLMuscleFrequency = {
  __typename?: 'MuscleFrequency';
  groupName: EntireFieldWrapper<Scalars['String']['output']>;
  groupSlug: EntireFieldWrapper<Scalars['String']['output']>;
  lastTrained?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  muscleAlias: EntireFieldWrapper<Scalars['String']['output']>;
  muscleId: EntireFieldWrapper<Scalars['String']['output']>;
  muscleName: EntireFieldWrapper<Scalars['String']['output']>;
  sessionsCount: EntireFieldWrapper<Scalars['Int']['output']>;
  totalSets: EntireFieldWrapper<Scalars['Int']['output']>;
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

export type GQLMuscleGroupDistribution = {
  __typename?: 'MuscleGroupDistribution';
  arms: EntireFieldWrapper<Scalars['Int']['output']>;
  back: EntireFieldWrapper<Scalars['Int']['output']>;
  chest: EntireFieldWrapper<Scalars['Int']['output']>;
  core: EntireFieldWrapper<Scalars['Int']['output']>;
  legs: EntireFieldWrapper<Scalars['Int']['output']>;
  shoulders: EntireFieldWrapper<Scalars['Int']['output']>;
};

export type GQLMuscleGroupFrequency = {
  __typename?: 'MuscleGroupFrequency';
  groupName: EntireFieldWrapper<Scalars['String']['output']>;
  groupSlug: EntireFieldWrapper<Scalars['String']['output']>;
  lastTrained?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  sessionsCount: EntireFieldWrapper<Scalars['Int']['output']>;
  totalSets: EntireFieldWrapper<Scalars['Int']['output']>;
};

export type GQLMutation = {
  __typename?: 'Mutation';
  acceptCoachingRequest?: EntireFieldWrapper<Maybe<GQLCoachingRequest>>;
  activatePlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  activateUser: EntireFieldWrapper<Scalars['Boolean']['output']>;
  addAiExerciseToWorkout: EntireFieldWrapper<GQLTrainingExercise>;
  addBodyMeasurement: EntireFieldWrapper<GQLUserBodyMeasure>;
  addExerciseToDay: EntireFieldWrapper<Scalars['ID']['output']>;
  addExercisesToQuickWorkout: EntireFieldWrapper<GQLTrainingPlan>;
  addExercisesToWorkout: EntireFieldWrapper<Array<GQLTrainingExercise>>;
  addFreeWorkoutDay: EntireFieldWrapper<GQLFreeWorkoutDay>;
  addIngredientToMeal: EntireFieldWrapper<GQLMealIngredient>;
  addMealToNutritionPlanDay: EntireFieldWrapper<GQLNutritionPlanMeal>;
  addNutritionPlanDay: EntireFieldWrapper<GQLNutritionPlanDay>;
  addSet: EntireFieldWrapper<GQLExerciseSet>;
  addSetExerciseForm: EntireFieldWrapper<GQLExerciseSet>;
  addSetToExercise: EntireFieldWrapper<Scalars['ID']['output']>;
  addSingleExerciseToDay: EntireFieldWrapper<GQLTrainingExercise>;
  addSubstituteExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  addTeamLocation: EntireFieldWrapper<GQLTeam>;
  addTrainingWeek: EntireFieldWrapper<Scalars['ID']['output']>;
  addUserLocation: EntireFieldWrapper<GQLUserProfile>;
  archiveMeal: EntireFieldWrapper<GQLMeal>;
  assignTemplateToSelf: EntireFieldWrapper<Scalars['ID']['output']>;
  assignTrainingPlanToClient: EntireFieldWrapper<Scalars['Boolean']['output']>;
  cancelCoaching: EntireFieldWrapper<Scalars['Boolean']['output']>;
  cancelCoachingRequest?: EntireFieldWrapper<Maybe<GQLCoachingRequest>>;
  cancelMeeting: EntireFieldWrapper<GQLMeeting>;
  clearUserSessions: EntireFieldWrapper<Scalars['Boolean']['output']>;
  clearWorkoutDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  closePlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  completeCheckin: EntireFieldWrapper<GQLCheckinCompletion>;
  confirmMeeting: EntireFieldWrapper<GQLMeeting>;
  copyExercisesFromDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  copyNutritionPlan: EntireFieldWrapper<GQLCopyNutritionPlanPayload>;
  createBodyProgressLog: EntireFieldWrapper<GQLBodyProgressLog>;
  createCheckinSchedule: EntireFieldWrapper<GQLCheckinSchedule>;
  createCoachingRequest: EntireFieldWrapper<GQLCoachingRequest>;
  createDraftTemplate: EntireFieldWrapper<GQLTrainingPlan>;
  createExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  createExerciseNote: EntireFieldWrapper<GQLNote>;
  createFavouriteWorkout: EntireFieldWrapper<GQLFavouriteWorkout>;
  createIngredient: EntireFieldWrapper<GQLIngredient>;
  createMeal: EntireFieldWrapper<GQLMeal>;
  createMeeting: EntireFieldWrapper<GQLMeeting>;
  createNote: EntireFieldWrapper<GQLNote>;
  createNoteReply: EntireFieldWrapper<GQLNote>;
  createNotification: EntireFieldWrapper<GQLNotification>;
  createNutritionPlan: EntireFieldWrapper<GQLCreateNutritionPlanPayload>;
  createPushSubscription: EntireFieldWrapper<GQLPushSubscription>;
  createQuickWorkout: EntireFieldWrapper<GQLTrainingPlan>;
  createReview: EntireFieldWrapper<Scalars['Boolean']['output']>;
  createTeam: EntireFieldWrapper<GQLTeam>;
  createTrainerNoteForClient: EntireFieldWrapper<GQLNote>;
  createTrainingPlan: EntireFieldWrapper<GQLCreateTrainingPlanPayload>;
  deactivateUser: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteBodyMeasurement: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteBodyProgressLog: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteCheckinSchedule: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteFavouriteWorkout: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteMacroTargets: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteMeal: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteMessage: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteNote: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteNotification: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteNutritionPlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deletePlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deletePushSubscription: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteReview: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteTrainingPlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteUserAccount: EntireFieldWrapper<Scalars['Boolean']['output']>;
  duplicateMeal: EntireFieldWrapper<GQLMeal>;
  duplicateTrainingPlan: EntireFieldWrapper<Scalars['ID']['output']>;
  duplicateTrainingWeek: EntireFieldWrapper<Scalars['ID']['output']>;
  editMessage: EntireFieldWrapper<GQLMessage>;
  extendPlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  generateAiWorkout: EntireFieldWrapper<GQLAiWorkoutResult>;
  getAiExerciseSuggestions: EntireFieldWrapper<Array<GQLAiExerciseSuggestion>>;
  giveLifetimePremium: EntireFieldWrapper<GQLUserSubscription>;
  inviteTeamMember: EntireFieldWrapper<GQLTeamInvitation>;
  logWorkoutProgress: EntireFieldWrapper<Scalars['ID']['output']>;
  logWorkoutSessionEvent: EntireFieldWrapper<Scalars['ID']['output']>;
  markAllNotificationsRead: EntireFieldWrapper<Array<GQLNotification>>;
  markExerciseAsCompleted?: EntireFieldWrapper<Maybe<Scalars['Boolean']['output']>>;
  markMessagesAsRead: EntireFieldWrapper<Scalars['Boolean']['output']>;
  markNotificationRead: EntireFieldWrapper<GQLNotification>;
  markSetAsCompleted: EntireFieldWrapper<GQLSetCompletionResult>;
  markWorkoutAsCompleted?: EntireFieldWrapper<Maybe<Scalars['Boolean']['output']>>;
  moderateReview: EntireFieldWrapper<Scalars['Boolean']['output']>;
  moveExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  pauseClientCoachingSubscription: EntireFieldWrapper<GQLPauseCoachingResult>;
  pausePlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  rejectCoachingRequest?: EntireFieldWrapper<Maybe<GQLCoachingRequest>>;
  rejectTrainerOffer: EntireFieldWrapper<GQLTrainerOffer>;
  removeAllExercisesFromDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeClient: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeExerciseFromDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeExerciseFromWorkout: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeFavouriteExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeFreeWorkoutDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeIngredientFromMeal: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeMealFromNutritionPlanDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeNutritionPlanDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeSet: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeSetExerciseForm: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeSetFromExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeSubstituteExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeTeamLocation: EntireFieldWrapper<GQLTeam>;
  removeTeamMember: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeTrainingPlanFromClient: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeTrainingWeek: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeUserLocation: EntireFieldWrapper<GQLUserProfile>;
  removeUserSubscription: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeWeek: EntireFieldWrapper<Scalars['Boolean']['output']>;
  reorderMealIngredients: EntireFieldWrapper<Array<GQLMealIngredient>>;
  reorderNutritionPlanDayMeals: EntireFieldWrapper<Array<GQLNutritionPlanMeal>>;
  resetUserLogs: EntireFieldWrapper<Scalars['Boolean']['output']>;
  respondToTeamInvitation: EntireFieldWrapper<GQLTeamInvitation>;
  resumeClientCoachingSubscription: EntireFieldWrapper<GQLResumeCoachingResult>;
  sendMessage: EntireFieldWrapper<GQLMessage>;
  setMacroTargets: EntireFieldWrapper<GQLMacroTarget>;
  shareNutritionPlanWithClient: EntireFieldWrapper<GQLNutritionPlan>;
  skipCheckin: EntireFieldWrapper<GQLCheckinCompletion>;
  startFreeWorkoutDay: EntireFieldWrapper<GQLStartFreeWorkoutResult>;
  startWorkoutFromFavourite: EntireFieldWrapper<Scalars['ID']['output']>;
  swapExercise: EntireFieldWrapper<GQLSubstitute>;
  unarchiveMeal: EntireFieldWrapper<GQLMeal>;
  unshareNutritionPlanFromClient: EntireFieldWrapper<GQLNutritionPlan>;
  updateBodyMeasurement: EntireFieldWrapper<GQLUserBodyMeasure>;
  updateBodyProgressLog: EntireFieldWrapper<GQLBodyProgressLog>;
  updateBodyProgressLogSharingStatus: EntireFieldWrapper<GQLBodyProgressLog>;
  updateCheckinSchedule: EntireFieldWrapper<GQLCheckinSchedule>;
  updateExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateExerciseForm: EntireFieldWrapper<GQLTrainingExercise>;
  updateExerciseSet: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateFavouriteExerciseSets: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateFavouriteExercisesOrder: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateFavouriteWorkout: EntireFieldWrapper<GQLFavouriteWorkout>;
  updateFreeWorkoutDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateIngredient: EntireFieldWrapper<GQLIngredient>;
  updateMeal: EntireFieldWrapper<GQLMeal>;
  updateMealIngredient: EntireFieldWrapper<GQLMealIngredient>;
  updateMeeting: EntireFieldWrapper<GQLMeeting>;
  updateNote: EntireFieldWrapper<GQLNote>;
  updateNotification: EntireFieldWrapper<GQLNotification>;
  updateNutritionPlan: EntireFieldWrapper<GQLNutritionPlan>;
  updateNutritionPlanDay: EntireFieldWrapper<GQLNutritionPlanDay>;
  updateNutritionPlanMealIngredient: EntireFieldWrapper<GQLNutritionPlanMealIngredient>;
  updateProfile?: EntireFieldWrapper<Maybe<GQLUserProfile>>;
  updatePushSubscription: EntireFieldWrapper<GQLPushSubscription>;
  updateReview: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateServiceDelivery: EntireFieldWrapper<GQLServiceDelivery>;
  updateServiceTask: EntireFieldWrapper<GQLServiceTask>;
  updateSetLog?: EntireFieldWrapper<Maybe<GQLExerciseSetLog>>;
  updateSubstituteExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTeam: EntireFieldWrapper<GQLTeam>;
  updateTrainerCapacity: EntireFieldWrapper<GQLUser>;
  updateTrainingDayData: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingPlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingPlanDetails: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingPlanHeroImage: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingWeekDetails: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateUserFeatured: EntireFieldWrapper<GQLAdminUserListItem>;
  updateUserRole: EntireFieldWrapper<GQLAdminUserListItem>;
  upsertClientSurvey: EntireFieldWrapper<GQLClientSurvey>;
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


export type GQLMutationAddFreeWorkoutDayArgs = {
  input: GQLAddFreeWorkoutDayInput;
};


export type GQLMutationAddIngredientToMealArgs = {
  input: GQLAddIngredientToMealInput;
};


export type GQLMutationAddMealToNutritionPlanDayArgs = {
  input: GQLAddMealToDayInput;
};


export type GQLMutationAddNutritionPlanDayArgs = {
  input: GQLAddNutritionPlanDayInput;
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


export type GQLMutationAddSingleExerciseToDayArgs = {
  dayId: Scalars['ID']['input'];
  exerciseBaseId: Scalars['ID']['input'];
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


export type GQLMutationArchiveMealArgs = {
  id: Scalars['ID']['input'];
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


export type GQLMutationCancelMeetingArgs = {
  meetingId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type GQLMutationClearUserSessionsArgs = {
  userId: Scalars['ID']['input'];
};


export type GQLMutationClearWorkoutDayArgs = {
  dayId: Scalars['ID']['input'];
};


export type GQLMutationClosePlanArgs = {
  planId: Scalars['ID']['input'];
};


export type GQLMutationCompleteCheckinArgs = {
  input: GQLCompleteCheckinInput;
};


export type GQLMutationConfirmMeetingArgs = {
  meetingId: Scalars['ID']['input'];
};


export type GQLMutationCopyExercisesFromDayArgs = {
  input: GQLCopyExercisesFromDayInput;
};


export type GQLMutationCopyNutritionPlanArgs = {
  input: GQLCopyNutritionPlanInput;
};


export type GQLMutationCreateBodyProgressLogArgs = {
  input: GQLCreateBodyProgressLogInput;
};


export type GQLMutationCreateCheckinScheduleArgs = {
  input: GQLCreateCheckinScheduleInput;
};


export type GQLMutationCreateCoachingRequestArgs = {
  interestedServices?: InputMaybe<Array<Scalars['String']['input']>>;
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


export type GQLMutationCreateIngredientArgs = {
  input: GQLCreateIngredientInput;
};


export type GQLMutationCreateMealArgs = {
  input: GQLCreateMealInput;
};


export type GQLMutationCreateMeetingArgs = {
  input: GQLCreateMeetingInput;
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


export type GQLMutationCreateNutritionPlanArgs = {
  input: GQLCreateNutritionPlanInput;
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


export type GQLMutationDeleteMacroTargetsArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLMutationDeleteMealArgs = {
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


export type GQLMutationDeleteNutritionPlanArgs = {
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


export type GQLMutationDuplicateMealArgs = {
  id: Scalars['ID']['input'];
  newName?: InputMaybe<Scalars['String']['input']>;
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


export type GQLMutationPauseClientCoachingSubscriptionArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLMutationPausePlanArgs = {
  planId: Scalars['ID']['input'];
};


export type GQLMutationRejectCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationRejectTrainerOfferArgs = {
  offerId: Scalars['ID']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type GQLMutationRemoveAllExercisesFromDayArgs = {
  input: GQLRemoveAllExercisesFromDayInput;
};


export type GQLMutationRemoveClientArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLMutationRemoveExerciseFromDayArgs = {
  exerciseId: Scalars['ID']['input'];
};


export type GQLMutationRemoveExerciseFromWorkoutArgs = {
  exerciseId: Scalars['ID']['input'];
};


export type GQLMutationRemoveFavouriteExerciseArgs = {
  exerciseId: Scalars['ID']['input'];
};


export type GQLMutationRemoveFreeWorkoutDayArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationRemoveIngredientFromMealArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationRemoveMealFromNutritionPlanDayArgs = {
  planMealId: Scalars['ID']['input'];
};


export type GQLMutationRemoveNutritionPlanDayArgs = {
  dayId: Scalars['ID']['input'];
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


export type GQLMutationReorderMealIngredientsArgs = {
  input: GQLReorderMealIngredientsInput;
};


export type GQLMutationReorderNutritionPlanDayMealsArgs = {
  input: GQLReorderDayMealsInput;
};


export type GQLMutationRespondToTeamInvitationArgs = {
  input: GQLRespondToTeamInvitationInput;
};


export type GQLMutationResumeClientCoachingSubscriptionArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLMutationSendMessageArgs = {
  input: GQLSendMessageInput;
};


export type GQLMutationSetMacroTargetsArgs = {
  input: GQLSetMacroTargetsInput;
};


export type GQLMutationShareNutritionPlanWithClientArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationStartFreeWorkoutDayArgs = {
  input: GQLStartFreeWorkoutDayInput;
};


export type GQLMutationStartWorkoutFromFavouriteArgs = {
  input: GQLStartWorkoutFromFavouriteInput;
};


export type GQLMutationSwapExerciseArgs = {
  exerciseId: Scalars['ID']['input'];
  substituteId: Scalars['ID']['input'];
};


export type GQLMutationUnarchiveMealArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationUnshareNutritionPlanFromClientArgs = {
  id: Scalars['ID']['input'];
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


export type GQLMutationUpdateCheckinScheduleArgs = {
  input: GQLUpdateCheckinScheduleInput;
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


export type GQLMutationUpdateFavouriteExerciseSetsArgs = {
  exerciseId: Scalars['ID']['input'];
  setCount: Scalars['Int']['input'];
};


export type GQLMutationUpdateFavouriteExercisesOrderArgs = {
  exerciseOrders: Array<GQLExerciseOrderInput>;
  favouriteId: Scalars['ID']['input'];
};


export type GQLMutationUpdateFavouriteWorkoutArgs = {
  input: GQLUpdateFavouriteWorkoutInput;
};


export type GQLMutationUpdateFreeWorkoutDayArgs = {
  heroImageUrl?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isVisible?: InputMaybe<Scalars['Boolean']['input']>;
};


export type GQLMutationUpdateIngredientArgs = {
  id: Scalars['ID']['input'];
  input: GQLUpdateIngredientInput;
};


export type GQLMutationUpdateMealArgs = {
  id: Scalars['ID']['input'];
  input: GQLUpdateMealInput;
};


export type GQLMutationUpdateMealIngredientArgs = {
  input: GQLUpdateMealIngredientInput;
};


export type GQLMutationUpdateMeetingArgs = {
  input: GQLUpdateMeetingInput;
  meetingId: Scalars['ID']['input'];
};


export type GQLMutationUpdateNoteArgs = {
  input: GQLUpdateNoteInput;
};


export type GQLMutationUpdateNotificationArgs = {
  input: GQLUpdateNotificationInput;
};


export type GQLMutationUpdateNutritionPlanArgs = {
  id: Scalars['ID']['input'];
  input: GQLUpdateNutritionPlanInput;
};


export type GQLMutationUpdateNutritionPlanDayArgs = {
  dayId: Scalars['ID']['input'];
  input: GQLUpdateNutritionPlanDayInput;
};


export type GQLMutationUpdateNutritionPlanMealIngredientArgs = {
  input: GQLUpdateNutritionPlanMealIngredientInput;
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


export type GQLMutationUpdateTrainingPlanHeroImageArgs = {
  heroImageUrl: Scalars['String']['input'];
  planId: Scalars['ID']['input'];
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


export type GQLMutationUpsertClientSurveyArgs = {
  data: GQLClientSurveyDataInput;
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
  checkinReminders: EntireFieldWrapper<Scalars['Boolean']['output']>;
  emailNotifications: EntireFieldWrapper<Scalars['Boolean']['output']>;
  progressUpdates: EntireFieldWrapper<Scalars['Boolean']['output']>;
  pushNotifications: EntireFieldWrapper<Scalars['Boolean']['output']>;
  systemNotifications: EntireFieldWrapper<Scalars['Boolean']['output']>;
  workoutReminders: EntireFieldWrapper<Scalars['Boolean']['output']>;
};

export type GQLNotificationPreferencesInput = {
  checkinReminders?: InputMaybe<Scalars['Boolean']['input']>;
  emailNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  progressUpdates?: InputMaybe<Scalars['Boolean']['input']>;
  pushNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  systemNotifications?: InputMaybe<Scalars['Boolean']['input']>;
  workoutReminders?: InputMaybe<Scalars['Boolean']['input']>;
};

export enum GQLNotificationType {
  BodyProgressShared = 'BODY_PROGRESS_SHARED',
  CoachingCancelled = 'COACHING_CANCELLED',
  CoachingRequest = 'COACHING_REQUEST',
  CoachingRequestAccepted = 'COACHING_REQUEST_ACCEPTED',
  CoachingRequestRejected = 'COACHING_REQUEST_REJECTED',
  ExerciseNoteAdded = 'EXERCISE_NOTE_ADDED',
  ExerciseNoteReply = 'EXERCISE_NOTE_REPLY',
  MeetingReminder = 'MEETING_REMINDER',
  Message = 'MESSAGE',
  NewMealPlanAssigned = 'NEW_MEAL_PLAN_ASSIGNED',
  NewTrainingPlanAssigned = 'NEW_TRAINING_PLAN_ASSIGNED',
  PaymentReceived = 'PAYMENT_RECEIVED',
  PlanCompleted = 'PLAN_COMPLETED',
  Reminder = 'REMINDER',
  SubscriptionPaymentReceived = 'SUBSCRIPTION_PAYMENT_RECEIVED',
  System = 'SYSTEM',
  TeamInvitation = 'TEAM_INVITATION',
  TrainerNoteShared = 'TRAINER_NOTE_SHARED',
  TrainerOfferDeclined = 'TRAINER_OFFER_DECLINED',
  TrainerOfferReceived = 'TRAINER_OFFER_RECEIVED',
  TrainerWorkoutCompleted = 'TRAINER_WORKOUT_COMPLETED',
  WorkoutCompleted = 'WORKOUT_COMPLETED'
}

export type GQLNutritionPlan = {
  __typename?: 'NutritionPlan';
  averageDailyMacros: EntireFieldWrapper<GQLMacroTotals>;
  canUnshare: EntireFieldWrapper<Scalars['Boolean']['output']>;
  client?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  completenessScore: EntireFieldWrapper<Scalars['Float']['output']>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  dayCount: EntireFieldWrapper<Scalars['Int']['output']>;
  days: EntireFieldWrapper<Array<GQLNutritionPlanDay>>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  hasConsecutiveDays: EntireFieldWrapper<Scalars['Boolean']['output']>;
  hoursUntilUnshareExpiry?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isSharedWithClient: EntireFieldWrapper<Scalars['Boolean']['output']>;
  macroDistribution: EntireFieldWrapper<GQLMacroDistribution>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  planDurationRange?: EntireFieldWrapper<Maybe<GQLPlanDurationRange>>;
  sharedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  totalMealCount: EntireFieldWrapper<Scalars['Int']['output']>;
  trainer?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLNutritionPlanDay = {
  __typename?: 'NutritionPlanDay';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  dailyMacros: EntireFieldWrapper<GQLMacroTotals>;
  dayNumber: EntireFieldWrapper<Scalars['Int']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  mealCount: EntireFieldWrapper<Scalars['Int']['output']>;
  meals: EntireFieldWrapper<Array<GQLNutritionPlanMeal>>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLNutritionPlanMeal = {
  __typename?: 'NutritionPlanMeal';
  adjustedMacros: EntireFieldWrapper<GQLMacroTotals>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  ingredientOverrides: EntireFieldWrapper<Array<GQLNutritionPlanMealIngredient>>;
  meal: EntireFieldWrapper<GQLMeal>;
  orderIndex: EntireFieldWrapper<Scalars['Int']['output']>;
};

export type GQLNutritionPlanMealIngredient = {
  __typename?: 'NutritionPlanMealIngredient';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  grams: EntireFieldWrapper<Scalars['Float']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  mealIngredient: EntireFieldWrapper<GQLMealIngredient>;
};

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

export type GQLOptimizedImage = {
  __typename?: 'OptimizedImage';
  large?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  medium?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  thumbnail?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  url?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
};

export type GQLPackageSummaryItem = {
  __typename?: 'PackageSummaryItem';
  name: EntireFieldWrapper<Scalars['String']['output']>;
  packageId: EntireFieldWrapper<Scalars['String']['output']>;
  quantity: EntireFieldWrapper<Scalars['Int']['output']>;
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
  stripeLookupKey?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  stripeProductId?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  trainer?: EntireFieldWrapper<Maybe<GQLUser>>;
  trainerId?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLPauseCoachingResult = {
  __typename?: 'PauseCoachingResult';
  message: EntireFieldWrapper<Scalars['String']['output']>;
  pausedUntil?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  subscription?: EntireFieldWrapper<Maybe<GQLUserSubscription>>;
  success: EntireFieldWrapper<Scalars['Boolean']['output']>;
};

export type GQLPerformanceData = {
  __typename?: 'PerformanceData';
  date: EntireFieldWrapper<Scalars['String']['output']>;
  estimated1RM?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  reps?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  weight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
};

export type GQLPersonalRecord = {
  __typename?: 'PersonalRecord';
  estimated1RM: EntireFieldWrapper<Scalars['Float']['output']>;
  exerciseName: EntireFieldWrapper<Scalars['String']['output']>;
  improvement: EntireFieldWrapper<Scalars['Float']['output']>;
  reps: EntireFieldWrapper<Scalars['Int']['output']>;
  weight: EntireFieldWrapper<Scalars['Float']['output']>;
};

export type GQLPersonalRecordHistory = {
  __typename?: 'PersonalRecordHistory';
  achievedAt: EntireFieldWrapper<Scalars['String']['output']>;
  dayId: EntireFieldWrapper<Scalars['ID']['output']>;
  estimated1RM: EntireFieldWrapper<Scalars['Float']['output']>;
  exerciseId: EntireFieldWrapper<Scalars['ID']['output']>;
  exerciseName: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  reps: EntireFieldWrapper<Scalars['Int']['output']>;
  weight: EntireFieldWrapper<Scalars['Float']['output']>;
};

export type GQLPersonalRecordSummary = {
  __typename?: 'PersonalRecordSummary';
  achievedDate: EntireFieldWrapper<Scalars['String']['output']>;
  baseExerciseId: EntireFieldWrapper<Scalars['String']['output']>;
  bestEstimated1RM: EntireFieldWrapper<Scalars['Float']['output']>;
  exerciseName: EntireFieldWrapper<Scalars['String']['output']>;
  reps: EntireFieldWrapper<Scalars['Int']['output']>;
  weekNumber?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  weight: EntireFieldWrapper<Scalars['Float']['output']>;
};

export type GQLPlanDurationRange = {
  __typename?: 'PlanDurationRange';
  maxDay: EntireFieldWrapper<Scalars['Int']['output']>;
  minDay: EntireFieldWrapper<Scalars['Int']['output']>;
};

export type GQLPlanSummary = {
  __typename?: 'PlanSummary';
  adherence: EntireFieldWrapper<Scalars['Float']['output']>;
  bodyComposition?: EntireFieldWrapper<Maybe<GQLBodyCompositionChange>>;
  duration: EntireFieldWrapper<GQLPlanSummaryDuration>;
  personalRecords: EntireFieldWrapper<Array<GQLPersonalRecordSummary>>;
  strengthProgress: EntireFieldWrapper<Array<GQLStrengthProgression>>;
  totalPRsAchieved: EntireFieldWrapper<Scalars['Int']['output']>;
  totalVolumeLifted: EntireFieldWrapper<Scalars['Float']['output']>;
  totalWorkouts: EntireFieldWrapper<Scalars['Int']['output']>;
  workoutsCompleted: EntireFieldWrapper<Scalars['Int']['output']>;
};

export type GQLPlanSummaryDuration = {
  __typename?: 'PlanSummaryDuration';
  endDate?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  startDate: EntireFieldWrapper<Scalars['String']['output']>;
  weeks: EntireFieldWrapper<Scalars['Int']['output']>;
};

export type GQLPreviousExerciseLog = {
  __typename?: 'PreviousExerciseLog';
  baseId?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  exerciseName: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  sets: EntireFieldWrapper<Array<GQLExerciseSet>>;
};

export type GQLPublicTrainer = {
  __typename?: 'PublicTrainer';
  capacity?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  clientCount: EntireFieldWrapper<Scalars['Int']['output']>;
  credentials: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  email: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isAtCapacity: EntireFieldWrapper<Scalars['Boolean']['output']>;
  name?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  profile?: EntireFieldWrapper<Maybe<GQLUserProfile>>;
  role: EntireFieldWrapper<GQLUserRole>;
  specialization: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  spotsLeft?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
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
  bodyMeasures: EntireFieldWrapper<Array<GQLUserBodyMeasure>>;
  checkPremiumAccess: EntireFieldWrapper<Scalars['Boolean']['output']>;
  checkinSchedule?: EntireFieldWrapper<Maybe<GQLCheckinSchedule>>;
  checkinStatus: EntireFieldWrapper<GQLCheckinStatus>;
  clientBodyMeasures: EntireFieldWrapper<Array<GQLUserBodyMeasure>>;
  clientBodyProgressLogs: EntireFieldWrapper<Array<GQLBodyProgressLog>>;
  clientHasActiveCoachingSubscription: EntireFieldWrapper<Scalars['Boolean']['output']>;
  clientNutritionPlans: EntireFieldWrapper<Array<GQLNutritionPlan>>;
  clientSharedNotes: EntireFieldWrapper<Array<GQLNote>>;
  coachingRequest?: EntireFieldWrapper<Maybe<GQLCoachingRequest>>;
  coachingRequests: EntireFieldWrapper<Array<GQLCoachingRequest>>;
  exercise?: EntireFieldWrapper<Maybe<GQLBaseExercise>>;
  exerciseNotes: EntireFieldWrapper<Array<GQLNote>>;
  exercisesProgressByUser: EntireFieldWrapper<Array<GQLExerciseProgress>>;
  getActivePackageTemplates: EntireFieldWrapper<Array<GQLPackageTemplate>>;
  getActivePlanId?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
  getAdminFreeWorkoutDays: EntireFieldWrapper<Array<GQLFreeWorkoutDay>>;
  getAllUsersWithSubscriptions: EntireFieldWrapper<GQLUsersWithSubscriptionsResult>;
  getChatMessages: EntireFieldWrapper<Array<GQLMessage>>;
  getClientActivePlan?: EntireFieldWrapper<Maybe<GQLTrainingPlan>>;
  getClientMacroTargets?: EntireFieldWrapper<Maybe<GQLMacroTarget>>;
  getClientNutritionPlans: EntireFieldWrapper<Array<GQLNutritionPlan>>;
  getClientSurveyForTrainee?: EntireFieldWrapper<Maybe<GQLClientSurvey>>;
  getClientTrainerOffers: EntireFieldWrapper<Array<GQLTrainerOffer>>;
  getClientTrainingPlans: EntireFieldWrapper<Array<GQLTrainingPlan>>;
  getExercises: EntireFieldWrapper<GQLGetExercisesResponse>;
  getFavouriteWorkout?: EntireFieldWrapper<Maybe<GQLFavouriteWorkout>>;
  getFavouriteWorkouts: EntireFieldWrapper<Array<GQLFavouriteWorkout>>;
  getFeaturedTrainers: EntireFieldWrapper<Array<GQLPublicTrainer>>;
  getFreeWorkoutDays: EntireFieldWrapper<Array<GQLFreeWorkoutDay>>;
  getMessengerInitialData: EntireFieldWrapper<GQLMessengerInitialData>;
  getMyChats: EntireFieldWrapper<Array<GQLChat>>;
  getMyClientSurvey?: EntireFieldWrapper<Maybe<GQLClientSurvey>>;
  getMyMacroTargets?: EntireFieldWrapper<Maybe<GQLMacroTarget>>;
  getMyPlansOverview: EntireFieldWrapper<GQLMyPlansPayload>;
  getMyPlansOverviewFull: EntireFieldWrapper<GQLMyPlansPayload>;
  getMyPlansOverviewLite: EntireFieldWrapper<GQLMyPlansPayload>;
  getMyServiceDeliveries: EntireFieldWrapper<Array<GQLServiceDelivery>>;
  getMySubscriptionStatus: EntireFieldWrapper<GQLUserSubscriptionStatus>;
  getMySubscriptions: EntireFieldWrapper<Array<GQLUserSubscription>>;
  getMyTrainer?: EntireFieldWrapper<Maybe<GQLPublicTrainer>>;
  getOrCreateChat: EntireFieldWrapper<GQLChat>;
  getPackageTemplate?: EntireFieldWrapper<Maybe<GQLPackageTemplate>>;
  getPlanPreview: EntireFieldWrapper<GQLTrainingPlan>;
  getPlanSummary: EntireFieldWrapper<GQLPlanSummary>;
  getPublicTrainingPlans: EntireFieldWrapper<Array<GQLTrainingPlan>>;
  getQuickWorkoutDay?: EntireFieldWrapper<Maybe<GQLGetWorkoutDayPayload>>;
  getQuickWorkoutNavigation?: EntireFieldWrapper<Maybe<GQLGetWorkoutNavigationPayload>>;
  getQuickWorkoutPlan: EntireFieldWrapper<GQLTrainingPlan>;
  getServiceDeliveryMeetings: EntireFieldWrapper<Array<GQLMeeting>>;
  getServiceDeliveryTasks: EntireFieldWrapper<Array<GQLServiceTask>>;
  getSubscriptionStats: EntireFieldWrapper<GQLSubscriptionStats>;
  getTemplates: EntireFieldWrapper<Array<GQLTrainingPlan>>;
  getTotalUnreadCount: EntireFieldWrapper<Scalars['Int']['output']>;
  getTraineeMeetings: EntireFieldWrapper<Array<GQLMeeting>>;
  getTrainerDeliveries: EntireFieldWrapper<Array<GQLServiceDelivery>>;
  getTrainerTasks: EntireFieldWrapper<Array<GQLServiceTask>>;
  getTrainingExercise?: EntireFieldWrapper<Maybe<GQLTrainingExercise>>;
  getTrainingPlanById: EntireFieldWrapper<GQLTrainingPlan>;
  getUserPRHistory: EntireFieldWrapper<Array<GQLPersonalRecordHistory>>;
  getWorkoutDay?: EntireFieldWrapper<Maybe<GQLGetWorkoutDayPayload>>;
  getWorkoutInfo: EntireFieldWrapper<GQLTrainingDay>;
  getWorkoutNavigation?: EntireFieldWrapper<Maybe<GQLGetWorkoutNavigationPayload>>;
  ingredient?: EntireFieldWrapper<Maybe<GQLIngredient>>;
  locations: EntireFieldWrapper<Array<GQLLocation>>;
  meal?: EntireFieldWrapper<Maybe<GQLMeal>>;
  muscleFrequency: EntireFieldWrapper<Array<GQLMuscleFrequency>>;
  muscleGroupCategories: EntireFieldWrapper<Array<GQLMuscleGroupCategory>>;
  muscleGroupCategory: EntireFieldWrapper<GQLMuscleGroupCategory>;
  muscleGroupDistribution: EntireFieldWrapper<GQLMuscleGroupDistribution>;
  muscleGroupFrequency: EntireFieldWrapper<Array<GQLMuscleGroupFrequency>>;
  myClients: EntireFieldWrapper<Array<GQLUserPublic>>;
  myTeams: EntireFieldWrapper<Array<GQLTeam>>;
  myTrainer?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  myUpcomingMeetings: EntireFieldWrapper<Array<GQLMeeting>>;
  note?: EntireFieldWrapper<Maybe<GQLNote>>;
  noteReplies: EntireFieldWrapper<Array<GQLNote>>;
  notes: EntireFieldWrapper<Array<GQLNote>>;
  notification?: EntireFieldWrapper<Maybe<GQLNotification>>;
  notifications: EntireFieldWrapper<Array<GQLNotification>>;
  nutritionPlan?: EntireFieldWrapper<Maybe<GQLNutritionPlan>>;
  nutritionPlans: EntireFieldWrapper<Array<GQLNutritionPlan>>;
  popularIngredients: EntireFieldWrapper<Array<GQLIngredient>>;
  profile?: EntireFieldWrapper<Maybe<GQLUserProfile>>;
  publicExercises: EntireFieldWrapper<Array<GQLBaseExercise>>;
  pushSubscription?: EntireFieldWrapper<Maybe<GQLPushSubscription>>;
  pushSubscriptions: EntireFieldWrapper<Array<GQLPushSubscription>>;
  recentIngredients: EntireFieldWrapper<Array<GQLIngredient>>;
  searchIngredients: EntireFieldWrapper<Array<GQLIngredient>>;
  searchUsers: EntireFieldWrapper<Array<GQLSearchUserResult>>;
  sentTeamInvitations: EntireFieldWrapper<Array<GQLTeamInvitation>>;
  team?: EntireFieldWrapper<Maybe<GQLTeam>>;
  teamInvitations: EntireFieldWrapper<Array<GQLTeamInvitation>>;
  teamMeals: EntireFieldWrapper<Array<GQLMeal>>;
  trainerNutritionPlans: EntireFieldWrapper<Array<GQLNutritionPlan>>;
  trainerSharedNotes: EntireFieldWrapper<Array<GQLNote>>;
  user?: EntireFieldWrapper<Maybe<GQLUser>>;
  userBasic?: EntireFieldWrapper<Maybe<GQLUser>>;
  userBodyProgressLogs: EntireFieldWrapper<Array<GQLBodyProgressLog>>;
  userExercises: EntireFieldWrapper<Array<GQLBaseExercise>>;
  userPublic?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
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


export type GQLQueryClientBodyMeasuresArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLQueryClientBodyProgressLogsArgs = {
  clientId: Scalars['String']['input'];
};


export type GQLQueryClientHasActiveCoachingSubscriptionArgs = {
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
  exerciseId?: InputMaybe<Scalars['ID']['input']>;
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


export type GQLQueryGetClientNutritionPlansArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLQueryGetClientSurveyForTraineeArgs = {
  traineeId: Scalars['ID']['input'];
};


export type GQLQueryGetClientTrainerOffersArgs = {
  clientEmail: Scalars['String']['input'];
  status?: InputMaybe<Array<GQLTrainerOfferStatus>>;
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


export type GQLQueryGetPlanPreviewArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryGetPlanSummaryArgs = {
  planId: Scalars['ID']['input'];
};


export type GQLQueryGetPublicTrainingPlansArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryGetQuickWorkoutDayArgs = {
  dayId?: InputMaybe<Scalars['ID']['input']>;
};


export type GQLQueryGetServiceDeliveryMeetingsArgs = {
  serviceDeliveryId: Scalars['ID']['input'];
};


export type GQLQueryGetServiceDeliveryTasksArgs = {
  serviceDeliveryId: Scalars['ID']['input'];
};


export type GQLQueryGetTemplatesArgs = {
  draft?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryGetTraineeMeetingsArgs = {
  traineeId: Scalars['ID']['input'];
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


export type GQLQueryGetUserPrHistoryArgs = {
  exerciseId?: InputMaybe<Scalars['ID']['input']>;
  userId: Scalars['ID']['input'];
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


export type GQLQueryIngredientArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryMealArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryMuscleFrequencyArgs = {
  days?: InputMaybe<Scalars['Int']['input']>;
  userId: Scalars['ID']['input'];
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


export type GQLQueryNutritionPlanArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryPopularIngredientsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryPublicExercisesArgs = {
  where?: InputMaybe<GQLExerciseWhereInput>;
};


export type GQLQueryPushSubscriptionArgs = {
  endpoint: Scalars['String']['input'];
};


export type GQLQueryRecentIngredientsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQuerySearchIngredientsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type GQLQuerySearchUsersArgs = {
  email: Scalars['String']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type GQLQueryTeamArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryTeamMealsArgs = {
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
  searchQuery?: InputMaybe<Scalars['String']['input']>;
  sortBy?: InputMaybe<GQLMealSortBy>;
};


export type GQLQueryTrainerNutritionPlansArgs = {
  clientId?: InputMaybe<Scalars['ID']['input']>;
  sharedOnly?: InputMaybe<Scalars['Boolean']['input']>;
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

export type GQLReorderDayMealsInput = {
  dayId: Scalars['ID']['input'];
  mealIds: Array<Scalars['ID']['input']>;
};

export type GQLReorderMealIngredientsInput = {
  ingredientIds: Array<Scalars['ID']['input']>;
  mealId: Scalars['ID']['input'];
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

export type GQLResumeCoachingResult = {
  __typename?: 'ResumeCoachingResult';
  message: EntireFieldWrapper<Scalars['String']['output']>;
  subscription?: EntireFieldWrapper<Maybe<GQLUserSubscription>>;
  success: EntireFieldWrapper<Scalars['Boolean']['output']>;
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

export type GQLSearchUserResult = {
  __typename?: 'SearchUserResult';
  email: EntireFieldWrapper<Scalars['String']['output']>;
  hasTrainer: EntireFieldWrapper<Scalars['Boolean']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  image?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  name?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  role: EntireFieldWrapper<GQLUserRole>;
};

export type GQLSendMessageInput = {
  chatId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
  imageUrl?: InputMaybe<Scalars['String']['input']>;
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
  tasks: EntireFieldWrapper<Array<GQLServiceTask>>;
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

export type GQLSetCompletionResult = {
  __typename?: 'SetCompletionResult';
  improvement?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  isPersonalRecord: EntireFieldWrapper<Scalars['Boolean']['output']>;
  success: EntireFieldWrapper<Scalars['Boolean']['output']>;
};

export type GQLSetMacroTargetsInput = {
  calories?: InputMaybe<Scalars['Int']['input']>;
  carbs?: InputMaybe<Scalars['Float']['input']>;
  clientId: Scalars['ID']['input'];
  fat?: InputMaybe<Scalars['Float']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  protein?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLStartFreeWorkoutDayInput = {
  dayId?: InputMaybe<Scalars['ID']['input']>;
  replaceExisting?: InputMaybe<Scalars['Boolean']['input']>;
  trainingDayId: Scalars['ID']['input'];
};

export type GQLStartFreeWorkoutResult = {
  __typename?: 'StartFreeWorkoutResult';
  dayId: EntireFieldWrapper<Scalars['ID']['output']>;
  planId: EntireFieldWrapper<Scalars['ID']['output']>;
  weekId: EntireFieldWrapper<Scalars['ID']['output']>;
};

export type GQLStartWorkoutFromFavouriteInput = {
  dayId?: InputMaybe<Scalars['ID']['input']>;
  favouriteWorkoutId: Scalars['ID']['input'];
  replaceExisting?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GQLStrengthProgression = {
  __typename?: 'StrengthProgression';
  baseExerciseId?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  exerciseName: EntireFieldWrapper<Scalars['String']['output']>;
  firstPerformance: EntireFieldWrapper<GQLPerformanceData>;
  improvementPercentage: EntireFieldWrapper<Scalars['Float']['output']>;
  lastPerformance: EntireFieldWrapper<GQLPerformanceData>;
  totalSessions: EntireFieldWrapper<Scalars['Int']['output']>;
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
  maxReps?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  minReps?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
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

export type GQLTeam = {
  __typename?: 'Team';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  hasStripeConnect: EntireFieldWrapper<Scalars['Boolean']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isAdmin: EntireFieldWrapper<Scalars['Boolean']['output']>;
  locations: EntireFieldWrapper<Array<GQLLocation>>;
  memberCount: EntireFieldWrapper<Scalars['Int']['output']>;
  members: EntireFieldWrapper<Array<GQLTeamMember>>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  platformFeePercent: EntireFieldWrapper<Scalars['Float']['output']>;
  stripeConnectedAccountId?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLTeamInvitation = {
  __typename?: 'TeamInvitation';
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  invitedBy: EntireFieldWrapper<GQLUserPublic>;
  invitedEmail: EntireFieldWrapper<Scalars['String']['output']>;
  status: EntireFieldWrapper<GQLInvitationStatus>;
  team: EntireFieldWrapper<GQLTeam>;
};

export type GQLTeamLocationInput = {
  city: Scalars['String']['input'];
  country: Scalars['String']['input'];
  countryCode: Scalars['String']['input'];
};

export type GQLTeamMember = {
  __typename?: 'TeamMember';
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  joinedAt: EntireFieldWrapper<Scalars['String']['output']>;
  role: EntireFieldWrapper<GQLTeamRole>;
  user: EntireFieldWrapper<GQLUserPublic>;
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
  clientEmail: EntireFieldWrapper<Scalars['String']['output']>;
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  expiresAt: EntireFieldWrapper<Scalars['String']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  packageSummary: EntireFieldWrapper<Array<GQLPackageSummaryItem>>;
  personalMessage?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  serviceDeliveries: EntireFieldWrapper<Array<GQLServiceDelivery>>;
  status: EntireFieldWrapper<GQLTrainerOfferStatus>;
  stripeCheckoutSessionId?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  stripePaymentIntentId?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  token: EntireFieldWrapper<Scalars['String']['output']>;
  trainer: EntireFieldWrapper<GQLUser>;
  trainerId: EntireFieldWrapper<Scalars['ID']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
};

export enum GQLTrainerOfferStatus {
  Cancelled = 'CANCELLED',
  Expired = 'EXPIRED',
  Paid = 'PAID',
  Pending = 'PENDING',
  Processing = 'PROCESSING'
}

export type GQLTrainingDay = {
  __typename?: 'TrainingDay';
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  dayOfWeek: EntireFieldWrapper<Scalars['Int']['output']>;
  duration?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  exercises: EntireFieldWrapper<Array<GQLTrainingExercise>>;
  exercisesCount: EntireFieldWrapper<Scalars['Int']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isFreeDemo: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isRestDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  personalRecords?: EntireFieldWrapper<Maybe<Array<GQLPersonalRecord>>>;
  scheduledAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  sourcePlanId?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  startedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  timesStarted: EntireFieldWrapper<Scalars['Int']['output']>;
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
  heroImageUrl?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isDemo: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isDraft: EntireFieldWrapper<Scalars['Boolean']['output']>;
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
  timesStarted: EntireFieldWrapper<Scalars['Int']['output']>;
  title: EntireFieldWrapper<Scalars['String']['output']>;
  totalReviews: EntireFieldWrapper<Scalars['Int']['output']>;
  totalWorkouts: EntireFieldWrapper<Scalars['Int']['output']>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  userReview?: EntireFieldWrapper<Maybe<GQLReview>>;
  weekCount: EntireFieldWrapper<Scalars['Int']['output']>;
  weeks: EntireFieldWrapper<Array<GQLTrainingWeek>>;
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

export type GQLUpdateBodyProgressLogInput = {
  image1Url?: InputMaybe<Scalars['String']['input']>;
  image2Url?: InputMaybe<Scalars['String']['input']>;
  image3Url?: InputMaybe<Scalars['String']['input']>;
  loggedAt?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  shareWithTrainer?: InputMaybe<Scalars['Boolean']['input']>;
};

export type GQLUpdateCheckinScheduleInput = {
  dayOfMonth?: InputMaybe<Scalars['Int']['input']>;
  dayOfWeek?: InputMaybe<Scalars['Int']['input']>;
  frequency?: InputMaybe<GQLCheckinFrequency>;
  isActive?: InputMaybe<Scalars['Boolean']['input']>;
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

export type GQLUpdateIngredientInput = {
  caloriesPer100g?: InputMaybe<Scalars['Float']['input']>;
  carbsPer100g?: InputMaybe<Scalars['Float']['input']>;
  fatPer100g?: InputMaybe<Scalars['Float']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  proteinPer100g?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLUpdateMealIngredientInput = {
  grams: Scalars['Float']['input'];
  id: Scalars['ID']['input'];
};

export type GQLUpdateMealInput = {
  cookingTime?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  instructions?: InputMaybe<Array<Scalars['String']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  preparationTime?: InputMaybe<Scalars['Int']['input']>;
  servings?: InputMaybe<Scalars['Int']['input']>;
};

export type GQLUpdateMeetingInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  duration?: InputMaybe<Scalars['Int']['input']>;
  locationType?: InputMaybe<GQLLocationType>;
  meetingLink?: InputMaybe<Scalars['String']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  scheduledAt?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<GQLMeetingStatus>;
  timezone?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<GQLMeetingType>;
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

export type GQLUpdateNutritionPlanDayInput = {
  name: Scalars['String']['input'];
};

export type GQLUpdateNutritionPlanInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type GQLUpdateNutritionPlanMealIngredientInput = {
  grams: Scalars['Float']['input'];
  mealIngredientId: Scalars['ID']['input'];
  planMealId: Scalars['ID']['input'];
};

export type GQLUpdateProfileInput = {
  activityLevel?: InputMaybe<GQLActivityLevel>;
  allergies?: InputMaybe<Scalars['String']['input']>;
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  birthday?: InputMaybe<Scalars['String']['input']>;
  blurProgressSnapshots?: InputMaybe<Scalars['Boolean']['input']>;
  checkinReminderTime?: InputMaybe<Scalars['Int']['input']>;
  checkinReminders?: InputMaybe<Scalars['Boolean']['input']>;
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
  timezone?: InputMaybe<Scalars['String']['input']>;
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
  capacity?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
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
  trainerId?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
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
  blurProgressSnapshots?: EntireFieldWrapper<Maybe<Scalars['Boolean']['output']>>;
  bodyMeasures: EntireFieldWrapper<Array<GQLUserBodyMeasure>>;
  checkinReminders?: EntireFieldWrapper<Maybe<Scalars['Boolean']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  credentials: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  email?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  firstName?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  fitnessLevel?: EntireFieldWrapper<Maybe<GQLFitnessLevel>>;
  goals: EntireFieldWrapper<Array<GQLGoal>>;
  hasCompletedOnboarding: EntireFieldWrapper<Scalars['Boolean']['output']>;
  height?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  heightUnit: EntireFieldWrapper<GQLHeightUnit>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  lastName?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  locations: EntireFieldWrapper<Array<GQLLocation>>;
  notificationPreferences: EntireFieldWrapper<GQLNotificationPreferences>;
  phone?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  sex?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  specialization: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  successStories: EntireFieldWrapper<Array<Scalars['String']['output']>>;
  theme: EntireFieldWrapper<GQLTheme>;
  timeFormat: EntireFieldWrapper<GQLTimeFormat>;
  timezone?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
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
  stripeLookupKey?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
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
  AddExerciseToDayInput: GQLAddExerciseToDayInput;
  AddExercisesToWorkoutInput: GQLAddExercisesToWorkoutInput;
  AddFreeWorkoutDayInput: GQLAddFreeWorkoutDayInput;
  AddIngredientToMealInput: GQLAddIngredientToMealInput;
  AddMealToDayInput: GQLAddMealToDayInput;
  AddNutritionPlanDayInput: GQLAddNutritionPlanDayInput;
  AddSetExerciseFormInput: GQLAddSetExerciseFormInput;
  AddSetExerciseFormSetInput: GQLAddSetExerciseFormSetInput;
  AddSetToExerciseInput: GQLAddSetToExerciseInput;
  AddSubstituteExerciseInput: GQLAddSubstituteExerciseInput;
  AddTeamLocationInput: GQLAddTeamLocationInput;
  AddTrainingWeekInput: GQLAddTrainingWeekInput;
  AddUserLocationInput: GQLAddUserLocationInput;
  AdminUserFilters: GQLAdminUserFilters;
  AdminUserListItem: ResolverTypeWrapper<GQLAdminUserListItem>;
  AdminUserListResponse: ResolverTypeWrapper<GQLAdminUserListResponse>;
  AdminUserStats: ResolverTypeWrapper<GQLAdminUserStats>;
  AiExerciseSuggestion: ResolverTypeWrapper<GQLAiExerciseSuggestion>;
  AiMeta: ResolverTypeWrapper<GQLAiMeta>;
  AiWorkoutExercise: ResolverTypeWrapper<GQLAiWorkoutExercise>;
  AiWorkoutResult: ResolverTypeWrapper<GQLAiWorkoutResult>;
  AiWorkoutVariant: ResolverTypeWrapper<GQLAiWorkoutVariant>;
  AssignTrainingPlanToClientInput: GQLAssignTrainingPlanToClientInput;
  BaseExercise: ResolverTypeWrapper<GQLBaseExercise>;
  BaseExerciseSubstitute: ResolverTypeWrapper<GQLBaseExerciseSubstitute>;
  BodyCompositionChange: ResolverTypeWrapper<GQLBodyCompositionChange>;
  BodyCompositionSnapshot: ResolverTypeWrapper<GQLBodyCompositionSnapshot>;
  BodyProgressLog: ResolverTypeWrapper<GQLBodyProgressLog>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  Chat: ResolverTypeWrapper<GQLChat>;
  ChatWithMessages: ResolverTypeWrapper<GQLChatWithMessages>;
  CheckinCompletion: ResolverTypeWrapper<GQLCheckinCompletion>;
  CheckinFrequency: GQLCheckinFrequency;
  CheckinSchedule: ResolverTypeWrapper<GQLCheckinSchedule>;
  CheckinStatus: ResolverTypeWrapper<GQLCheckinStatus>;
  ClientSurvey: ResolverTypeWrapper<GQLClientSurvey>;
  ClientSurveyDataInput: GQLClientSurveyDataInput;
  CoachingRequest: ResolverTypeWrapper<GQLCoachingRequest>;
  CoachingRequestStatus: GQLCoachingRequestStatus;
  CompleteCheckinInput: GQLCompleteCheckinInput;
  CopyExercisesFromDayInput: GQLCopyExercisesFromDayInput;
  CopyNutritionPlanInput: GQLCopyNutritionPlanInput;
  CopyNutritionPlanPayload: ResolverTypeWrapper<GQLCopyNutritionPlanPayload>;
  CreateBodyProgressLogInput: GQLCreateBodyProgressLogInput;
  CreateCheckinScheduleInput: GQLCreateCheckinScheduleInput;
  CreateExerciseInput: GQLCreateExerciseInput;
  CreateExerciseNoteInput: GQLCreateExerciseNoteInput;
  CreateExerciseSetInput: GQLCreateExerciseSetInput;
  CreateFavouriteWorkoutExerciseInput: GQLCreateFavouriteWorkoutExerciseInput;
  CreateFavouriteWorkoutInput: GQLCreateFavouriteWorkoutInput;
  CreateFavouriteWorkoutSetInput: GQLCreateFavouriteWorkoutSetInput;
  CreateIngredientInput: GQLCreateIngredientInput;
  CreateMealInput: GQLCreateMealInput;
  CreateMeetingInput: GQLCreateMeetingInput;
  CreateNoteInput: GQLCreateNoteInput;
  CreateNoteReplyInput: GQLCreateNoteReplyInput;
  CreateNotificationInput: GQLCreateNotificationInput;
  CreateNutritionPlanInput: GQLCreateNutritionPlanInput;
  CreateNutritionPlanPayload: ResolverTypeWrapper<GQLCreateNutritionPlanPayload>;
  CreatePushSubscriptionInput: GQLCreatePushSubscriptionInput;
  CreateQuickWorkoutInput: GQLCreateQuickWorkoutInput;
  CreateReviewInput: GQLCreateReviewInput;
  CreateTeamInput: GQLCreateTeamInput;
  CreateTrainerNoteForClientInput: GQLCreateTrainerNoteForClientInput;
  CreateTrainingDayInput: GQLCreateTrainingDayInput;
  CreateTrainingExerciseInput: GQLCreateTrainingExerciseInput;
  CreateTrainingPlanInput: GQLCreateTrainingPlanInput;
  CreateTrainingPlanPayload: ResolverTypeWrapper<GQLCreateTrainingPlanPayload>;
  CreateTrainingWeekInput: GQLCreateTrainingWeekInput;
  DeleteReviewInput: GQLDeleteReviewInput;
  DeliveryStatus: GQLDeliveryStatus;
  Difficulty: GQLDifficulty;
  DuplicateTrainingWeekInput: GQLDuplicateTrainingWeekInput;
  EditMessageInput: GQLEditMessageInput;
  Equipment: GQLEquipment;
  ExerciseLog: ResolverTypeWrapper<GQLExerciseLog>;
  ExerciseOrderInput: GQLExerciseOrderInput;
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
  FreeWorkoutDay: ResolverTypeWrapper<GQLFreeWorkoutDay>;
  GenerateAiWorkoutInput: GQLGenerateAiWorkoutInput;
  GetExercisesResponse: ResolverTypeWrapper<GQLGetExercisesResponse>;
  GetWorkoutDayPayload: ResolverTypeWrapper<GQLGetWorkoutDayPayload>;
  GetWorkoutNavigationPayload: ResolverTypeWrapper<GQLGetWorkoutNavigationPayload>;
  Goal: GQLGoal;
  HeightUnit: GQLHeightUnit;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Image: ResolverTypeWrapper<GQLImage>;
  Ingredient: ResolverTypeWrapper<GQLIngredient>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  InvitationStatus: GQLInvitationStatus;
  InviteTeamMemberInput: GQLInviteTeamMemberInput;
  JSON: ResolverTypeWrapper<Scalars['JSON']['output']>;
  Location: ResolverTypeWrapper<GQLLocation>;
  LocationType: GQLLocationType;
  LogSetInput: GQLLogSetInput;
  MacroDistribution: ResolverTypeWrapper<GQLMacroDistribution>;
  MacroTarget: ResolverTypeWrapper<GQLMacroTarget>;
  MacroTotals: ResolverTypeWrapper<GQLMacroTotals>;
  MarkMessagesAsReadInput: GQLMarkMessagesAsReadInput;
  Meal: ResolverTypeWrapper<GQLMeal>;
  MealIngredient: ResolverTypeWrapper<GQLMealIngredient>;
  MealSortBy: GQLMealSortBy;
  Meeting: ResolverTypeWrapper<GQLMeeting>;
  MeetingStatus: GQLMeetingStatus;
  MeetingType: GQLMeetingType;
  Message: ResolverTypeWrapper<GQLMessage>;
  MessengerInitialData: ResolverTypeWrapper<GQLMessengerInitialData>;
  ModerateReviewInput: GQLModerateReviewInput;
  MoveExerciseInput: GQLMoveExerciseInput;
  MuscleFrequency: ResolverTypeWrapper<GQLMuscleFrequency>;
  MuscleGroup: ResolverTypeWrapper<GQLMuscleGroup>;
  MuscleGroupCategory: ResolverTypeWrapper<GQLMuscleGroupCategory>;
  MuscleGroupDistribution: ResolverTypeWrapper<GQLMuscleGroupDistribution>;
  MuscleGroupFrequency: ResolverTypeWrapper<GQLMuscleGroupFrequency>;
  Mutation: ResolverTypeWrapper<{}>;
  MyPlansPayload: ResolverTypeWrapper<GQLMyPlansPayload>;
  Note: ResolverTypeWrapper<GQLNote>;
  Notification: ResolverTypeWrapper<GQLNotification>;
  NotificationPreferences: ResolverTypeWrapper<GQLNotificationPreferences>;
  NotificationPreferencesInput: GQLNotificationPreferencesInput;
  NotificationType: GQLNotificationType;
  NutritionPlan: ResolverTypeWrapper<GQLNutritionPlan>;
  NutritionPlanDay: ResolverTypeWrapper<GQLNutritionPlanDay>;
  NutritionPlanMeal: ResolverTypeWrapper<GQLNutritionPlanMeal>;
  NutritionPlanMealIngredient: ResolverTypeWrapper<GQLNutritionPlanMealIngredient>;
  OneRmEntry: ResolverTypeWrapper<GQLOneRmEntry>;
  OneRmLog: ResolverTypeWrapper<GQLOneRmLog>;
  OptimizedImage: ResolverTypeWrapper<GQLOptimizedImage>;
  PackageSummaryItem: ResolverTypeWrapper<GQLPackageSummaryItem>;
  PackageTemplate: ResolverTypeWrapper<GQLPackageTemplate>;
  PauseCoachingResult: ResolverTypeWrapper<GQLPauseCoachingResult>;
  PerformanceData: ResolverTypeWrapper<GQLPerformanceData>;
  PersonalRecord: ResolverTypeWrapper<GQLPersonalRecord>;
  PersonalRecordHistory: ResolverTypeWrapper<GQLPersonalRecordHistory>;
  PersonalRecordSummary: ResolverTypeWrapper<GQLPersonalRecordSummary>;
  PlanDurationRange: ResolverTypeWrapper<GQLPlanDurationRange>;
  PlanSummary: ResolverTypeWrapper<GQLPlanSummary>;
  PlanSummaryDuration: ResolverTypeWrapper<GQLPlanSummaryDuration>;
  PreviousExerciseLog: ResolverTypeWrapper<GQLPreviousExerciseLog>;
  PublicTrainer: ResolverTypeWrapper<GQLPublicTrainer>;
  PushSubscription: ResolverTypeWrapper<GQLPushSubscription>;
  Query: ResolverTypeWrapper<{}>;
  QuickWorkoutExerciseInput: GQLQuickWorkoutExerciseInput;
  QuickWorkoutSetInput: GQLQuickWorkoutSetInput;
  RemoveAllExercisesFromDayInput: GQLRemoveAllExercisesFromDayInput;
  RemoveSubstituteExerciseInput: GQLRemoveSubstituteExerciseInput;
  RemoveTeamLocationInput: GQLRemoveTeamLocationInput;
  RemoveTeamMemberInput: GQLRemoveTeamMemberInput;
  ReorderDayMealsInput: GQLReorderDayMealsInput;
  ReorderMealIngredientsInput: GQLReorderMealIngredientsInput;
  RepFocus: GQLRepFocus;
  RespondToTeamInvitationInput: GQLRespondToTeamInvitationInput;
  ResumeCoachingResult: ResolverTypeWrapper<GQLResumeCoachingResult>;
  Review: ResolverTypeWrapper<GQLReview>;
  SearchUserResult: ResolverTypeWrapper<GQLSearchUserResult>;
  SendMessageInput: GQLSendMessageInput;
  ServiceDelivery: ResolverTypeWrapper<GQLServiceDelivery>;
  ServiceTask: ResolverTypeWrapper<GQLServiceTask>;
  ServiceType: GQLServiceType;
  SetCompletionResult: ResolverTypeWrapper<GQLSetCompletionResult>;
  SetMacroTargetsInput: GQLSetMacroTargetsInput;
  StartFreeWorkoutDayInput: GQLStartFreeWorkoutDayInput;
  StartFreeWorkoutResult: ResolverTypeWrapper<GQLStartFreeWorkoutResult>;
  StartWorkoutFromFavouriteInput: GQLStartWorkoutFromFavouriteInput;
  StrengthProgression: ResolverTypeWrapper<GQLStrengthProgression>;
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
  Team: ResolverTypeWrapper<GQLTeam>;
  TeamInvitation: ResolverTypeWrapper<GQLTeamInvitation>;
  TeamLocationInput: GQLTeamLocationInput;
  TeamMember: ResolverTypeWrapper<GQLTeamMember>;
  TeamRole: GQLTeamRole;
  Theme: GQLTheme;
  TimeFormat: GQLTimeFormat;
  TrainerOffer: ResolverTypeWrapper<GQLTrainerOffer>;
  TrainerOfferStatus: GQLTrainerOfferStatus;
  TrainingDay: ResolverTypeWrapper<GQLTrainingDay>;
  TrainingExercise: ResolverTypeWrapper<GQLTrainingExercise>;
  TrainingPlan: ResolverTypeWrapper<GQLTrainingPlan>;
  TrainingView: GQLTrainingView;
  TrainingWeek: ResolverTypeWrapper<GQLTrainingWeek>;
  UpdateBodyMeasurementInput: GQLUpdateBodyMeasurementInput;
  UpdateBodyProgressLogInput: GQLUpdateBodyProgressLogInput;
  UpdateCheckinScheduleInput: GQLUpdateCheckinScheduleInput;
  UpdateExerciseFormInput: GQLUpdateExerciseFormInput;
  UpdateExerciseInput: GQLUpdateExerciseInput;
  UpdateExerciseSetFormInput: GQLUpdateExerciseSetFormInput;
  UpdateExerciseSetInput: GQLUpdateExerciseSetInput;
  UpdateFavouriteWorkoutExerciseInput: GQLUpdateFavouriteWorkoutExerciseInput;
  UpdateFavouriteWorkoutInput: GQLUpdateFavouriteWorkoutInput;
  UpdateFavouriteWorkoutSetInput: GQLUpdateFavouriteWorkoutSetInput;
  UpdateIngredientInput: GQLUpdateIngredientInput;
  UpdateMealIngredientInput: GQLUpdateMealIngredientInput;
  UpdateMealInput: GQLUpdateMealInput;
  UpdateMeetingInput: GQLUpdateMeetingInput;
  UpdateNoteInput: GQLUpdateNoteInput;
  UpdateNotificationInput: GQLUpdateNotificationInput;
  UpdateNutritionPlanDayInput: GQLUpdateNutritionPlanDayInput;
  UpdateNutritionPlanInput: GQLUpdateNutritionPlanInput;
  UpdateNutritionPlanMealIngredientInput: GQLUpdateNutritionPlanMealIngredientInput;
  UpdateProfileInput: GQLUpdateProfileInput;
  UpdatePushSubscriptionInput: GQLUpdatePushSubscriptionInput;
  UpdateReviewInput: GQLUpdateReviewInput;
  UpdateServiceTaskInput: GQLUpdateServiceTaskInput;
  UpdateSubstituteExerciseInput: GQLUpdateSubstituteExerciseInput;
  UpdateTeamInput: GQLUpdateTeamInput;
  UpdateTrainerCapacityInput: GQLUpdateTrainerCapacityInput;
  UpdateTrainingDayDataInput: GQLUpdateTrainingDayDataInput;
  UpdateTrainingDayInput: GQLUpdateTrainingDayInput;
  UpdateTrainingExerciseInput: GQLUpdateTrainingExerciseInput;
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
  AddExerciseToDayInput: GQLAddExerciseToDayInput;
  AddExercisesToWorkoutInput: GQLAddExercisesToWorkoutInput;
  AddFreeWorkoutDayInput: GQLAddFreeWorkoutDayInput;
  AddIngredientToMealInput: GQLAddIngredientToMealInput;
  AddMealToDayInput: GQLAddMealToDayInput;
  AddNutritionPlanDayInput: GQLAddNutritionPlanDayInput;
  AddSetExerciseFormInput: GQLAddSetExerciseFormInput;
  AddSetExerciseFormSetInput: GQLAddSetExerciseFormSetInput;
  AddSetToExerciseInput: GQLAddSetToExerciseInput;
  AddSubstituteExerciseInput: GQLAddSubstituteExerciseInput;
  AddTeamLocationInput: GQLAddTeamLocationInput;
  AddTrainingWeekInput: GQLAddTrainingWeekInput;
  AddUserLocationInput: GQLAddUserLocationInput;
  AdminUserFilters: GQLAdminUserFilters;
  AdminUserListItem: GQLAdminUserListItem;
  AdminUserListResponse: GQLAdminUserListResponse;
  AdminUserStats: GQLAdminUserStats;
  AiExerciseSuggestion: GQLAiExerciseSuggestion;
  AiMeta: GQLAiMeta;
  AiWorkoutExercise: GQLAiWorkoutExercise;
  AiWorkoutResult: GQLAiWorkoutResult;
  AiWorkoutVariant: GQLAiWorkoutVariant;
  AssignTrainingPlanToClientInput: GQLAssignTrainingPlanToClientInput;
  BaseExercise: GQLBaseExercise;
  BaseExerciseSubstitute: GQLBaseExerciseSubstitute;
  BodyCompositionChange: GQLBodyCompositionChange;
  BodyCompositionSnapshot: GQLBodyCompositionSnapshot;
  BodyProgressLog: GQLBodyProgressLog;
  Boolean: Scalars['Boolean']['output'];
  Chat: GQLChat;
  ChatWithMessages: GQLChatWithMessages;
  CheckinCompletion: GQLCheckinCompletion;
  CheckinSchedule: GQLCheckinSchedule;
  CheckinStatus: GQLCheckinStatus;
  ClientSurvey: GQLClientSurvey;
  ClientSurveyDataInput: GQLClientSurveyDataInput;
  CoachingRequest: GQLCoachingRequest;
  CompleteCheckinInput: GQLCompleteCheckinInput;
  CopyExercisesFromDayInput: GQLCopyExercisesFromDayInput;
  CopyNutritionPlanInput: GQLCopyNutritionPlanInput;
  CopyNutritionPlanPayload: GQLCopyNutritionPlanPayload;
  CreateBodyProgressLogInput: GQLCreateBodyProgressLogInput;
  CreateCheckinScheduleInput: GQLCreateCheckinScheduleInput;
  CreateExerciseInput: GQLCreateExerciseInput;
  CreateExerciseNoteInput: GQLCreateExerciseNoteInput;
  CreateExerciseSetInput: GQLCreateExerciseSetInput;
  CreateFavouriteWorkoutExerciseInput: GQLCreateFavouriteWorkoutExerciseInput;
  CreateFavouriteWorkoutInput: GQLCreateFavouriteWorkoutInput;
  CreateFavouriteWorkoutSetInput: GQLCreateFavouriteWorkoutSetInput;
  CreateIngredientInput: GQLCreateIngredientInput;
  CreateMealInput: GQLCreateMealInput;
  CreateMeetingInput: GQLCreateMeetingInput;
  CreateNoteInput: GQLCreateNoteInput;
  CreateNoteReplyInput: GQLCreateNoteReplyInput;
  CreateNotificationInput: GQLCreateNotificationInput;
  CreateNutritionPlanInput: GQLCreateNutritionPlanInput;
  CreateNutritionPlanPayload: GQLCreateNutritionPlanPayload;
  CreatePushSubscriptionInput: GQLCreatePushSubscriptionInput;
  CreateQuickWorkoutInput: GQLCreateQuickWorkoutInput;
  CreateReviewInput: GQLCreateReviewInput;
  CreateTeamInput: GQLCreateTeamInput;
  CreateTrainerNoteForClientInput: GQLCreateTrainerNoteForClientInput;
  CreateTrainingDayInput: GQLCreateTrainingDayInput;
  CreateTrainingExerciseInput: GQLCreateTrainingExerciseInput;
  CreateTrainingPlanInput: GQLCreateTrainingPlanInput;
  CreateTrainingPlanPayload: GQLCreateTrainingPlanPayload;
  CreateTrainingWeekInput: GQLCreateTrainingWeekInput;
  DeleteReviewInput: GQLDeleteReviewInput;
  DuplicateTrainingWeekInput: GQLDuplicateTrainingWeekInput;
  EditMessageInput: GQLEditMessageInput;
  ExerciseLog: GQLExerciseLog;
  ExerciseOrderInput: GQLExerciseOrderInput;
  ExerciseProgress: GQLExerciseProgress;
  ExerciseSet: GQLExerciseSet;
  ExerciseSetLog: GQLExerciseSetLog;
  ExerciseWhereInput: GQLExerciseWhereInput;
  FavouriteWorkout: GQLFavouriteWorkout;
  FavouriteWorkoutExercise: GQLFavouriteWorkoutExercise;
  FavouriteWorkoutSet: GQLFavouriteWorkoutSet;
  Float: Scalars['Float']['output'];
  FreeWorkoutDay: GQLFreeWorkoutDay;
  GenerateAiWorkoutInput: GQLGenerateAiWorkoutInput;
  GetExercisesResponse: GQLGetExercisesResponse;
  GetWorkoutDayPayload: GQLGetWorkoutDayPayload;
  GetWorkoutNavigationPayload: GQLGetWorkoutNavigationPayload;
  ID: Scalars['ID']['output'];
  Image: GQLImage;
  Ingredient: GQLIngredient;
  Int: Scalars['Int']['output'];
  InviteTeamMemberInput: GQLInviteTeamMemberInput;
  JSON: Scalars['JSON']['output'];
  Location: GQLLocation;
  LogSetInput: GQLLogSetInput;
  MacroDistribution: GQLMacroDistribution;
  MacroTarget: GQLMacroTarget;
  MacroTotals: GQLMacroTotals;
  MarkMessagesAsReadInput: GQLMarkMessagesAsReadInput;
  Meal: GQLMeal;
  MealIngredient: GQLMealIngredient;
  Meeting: GQLMeeting;
  Message: GQLMessage;
  MessengerInitialData: GQLMessengerInitialData;
  ModerateReviewInput: GQLModerateReviewInput;
  MoveExerciseInput: GQLMoveExerciseInput;
  MuscleFrequency: GQLMuscleFrequency;
  MuscleGroup: GQLMuscleGroup;
  MuscleGroupCategory: GQLMuscleGroupCategory;
  MuscleGroupDistribution: GQLMuscleGroupDistribution;
  MuscleGroupFrequency: GQLMuscleGroupFrequency;
  Mutation: {};
  MyPlansPayload: GQLMyPlansPayload;
  Note: GQLNote;
  Notification: GQLNotification;
  NotificationPreferences: GQLNotificationPreferences;
  NotificationPreferencesInput: GQLNotificationPreferencesInput;
  NutritionPlan: GQLNutritionPlan;
  NutritionPlanDay: GQLNutritionPlanDay;
  NutritionPlanMeal: GQLNutritionPlanMeal;
  NutritionPlanMealIngredient: GQLNutritionPlanMealIngredient;
  OneRmEntry: GQLOneRmEntry;
  OneRmLog: GQLOneRmLog;
  OptimizedImage: GQLOptimizedImage;
  PackageSummaryItem: GQLPackageSummaryItem;
  PackageTemplate: GQLPackageTemplate;
  PauseCoachingResult: GQLPauseCoachingResult;
  PerformanceData: GQLPerformanceData;
  PersonalRecord: GQLPersonalRecord;
  PersonalRecordHistory: GQLPersonalRecordHistory;
  PersonalRecordSummary: GQLPersonalRecordSummary;
  PlanDurationRange: GQLPlanDurationRange;
  PlanSummary: GQLPlanSummary;
  PlanSummaryDuration: GQLPlanSummaryDuration;
  PreviousExerciseLog: GQLPreviousExerciseLog;
  PublicTrainer: GQLPublicTrainer;
  PushSubscription: GQLPushSubscription;
  Query: {};
  QuickWorkoutExerciseInput: GQLQuickWorkoutExerciseInput;
  QuickWorkoutSetInput: GQLQuickWorkoutSetInput;
  RemoveAllExercisesFromDayInput: GQLRemoveAllExercisesFromDayInput;
  RemoveSubstituteExerciseInput: GQLRemoveSubstituteExerciseInput;
  RemoveTeamLocationInput: GQLRemoveTeamLocationInput;
  RemoveTeamMemberInput: GQLRemoveTeamMemberInput;
  ReorderDayMealsInput: GQLReorderDayMealsInput;
  ReorderMealIngredientsInput: GQLReorderMealIngredientsInput;
  RespondToTeamInvitationInput: GQLRespondToTeamInvitationInput;
  ResumeCoachingResult: GQLResumeCoachingResult;
  Review: GQLReview;
  SearchUserResult: GQLSearchUserResult;
  SendMessageInput: GQLSendMessageInput;
  ServiceDelivery: GQLServiceDelivery;
  ServiceTask: GQLServiceTask;
  SetCompletionResult: GQLSetCompletionResult;
  SetMacroTargetsInput: GQLSetMacroTargetsInput;
  StartFreeWorkoutDayInput: GQLStartFreeWorkoutDayInput;
  StartFreeWorkoutResult: GQLStartFreeWorkoutResult;
  StartWorkoutFromFavouriteInput: GQLStartWorkoutFromFavouriteInput;
  StrengthProgression: GQLStrengthProgression;
  String: Scalars['String']['output'];
  SubscriptionStats: GQLSubscriptionStats;
  Substitute: GQLSubstitute;
  SuggestedSets: GQLSuggestedSets;
  SuggestedSetsInput: GQLSuggestedSetsInput;
  Team: GQLTeam;
  TeamInvitation: GQLTeamInvitation;
  TeamLocationInput: GQLTeamLocationInput;
  TeamMember: GQLTeamMember;
  TrainerOffer: GQLTrainerOffer;
  TrainingDay: GQLTrainingDay;
  TrainingExercise: GQLTrainingExercise;
  TrainingPlan: GQLTrainingPlan;
  TrainingWeek: GQLTrainingWeek;
  UpdateBodyMeasurementInput: GQLUpdateBodyMeasurementInput;
  UpdateBodyProgressLogInput: GQLUpdateBodyProgressLogInput;
  UpdateCheckinScheduleInput: GQLUpdateCheckinScheduleInput;
  UpdateExerciseFormInput: GQLUpdateExerciseFormInput;
  UpdateExerciseInput: GQLUpdateExerciseInput;
  UpdateExerciseSetFormInput: GQLUpdateExerciseSetFormInput;
  UpdateExerciseSetInput: GQLUpdateExerciseSetInput;
  UpdateFavouriteWorkoutExerciseInput: GQLUpdateFavouriteWorkoutExerciseInput;
  UpdateFavouriteWorkoutInput: GQLUpdateFavouriteWorkoutInput;
  UpdateFavouriteWorkoutSetInput: GQLUpdateFavouriteWorkoutSetInput;
  UpdateIngredientInput: GQLUpdateIngredientInput;
  UpdateMealIngredientInput: GQLUpdateMealIngredientInput;
  UpdateMealInput: GQLUpdateMealInput;
  UpdateMeetingInput: GQLUpdateMeetingInput;
  UpdateNoteInput: GQLUpdateNoteInput;
  UpdateNotificationInput: GQLUpdateNotificationInput;
  UpdateNutritionPlanDayInput: GQLUpdateNutritionPlanDayInput;
  UpdateNutritionPlanInput: GQLUpdateNutritionPlanInput;
  UpdateNutritionPlanMealIngredientInput: GQLUpdateNutritionPlanMealIngredientInput;
  UpdateProfileInput: GQLUpdateProfileInput;
  UpdatePushSubscriptionInput: GQLUpdatePushSubscriptionInput;
  UpdateReviewInput: GQLUpdateReviewInput;
  UpdateServiceTaskInput: GQLUpdateServiceTaskInput;
  UpdateSubstituteExerciseInput: GQLUpdateSubstituteExerciseInput;
  UpdateTeamInput: GQLUpdateTeamInput;
  UpdateTrainerCapacityInput: GQLUpdateTrainerCapacityInput;
  UpdateTrainingDayDataInput: GQLUpdateTrainingDayDataInput;
  UpdateTrainingDayInput: GQLUpdateTrainingDayInput;
  UpdateTrainingExerciseInput: GQLUpdateTrainingExerciseInput;
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
  variants?: Resolver<Array<GQLResolversTypes['AiWorkoutVariant']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLAiWorkoutVariantResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['AiWorkoutVariant'] = GQLResolversParentTypes['AiWorkoutVariant']> = {
  exercises?: Resolver<Array<GQLResolversTypes['AiWorkoutExercise']>, ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  reasoning?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  summary?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  totalDuration?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
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

export type GQLBodyCompositionChangeResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['BodyCompositionChange'] = GQLResolversParentTypes['BodyCompositionChange']> = {
  endSnapshot?: Resolver<Maybe<GQLResolversTypes['BodyCompositionSnapshot']>, ParentType, ContextType>;
  endWeight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  startSnapshot?: Resolver<Maybe<GQLResolversTypes['BodyCompositionSnapshot']>, ParentType, ContextType>;
  startWeight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  unit?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  weightChange?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLBodyCompositionSnapshotResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['BodyCompositionSnapshot'] = GQLResolversParentTypes['BodyCompositionSnapshot']> = {
  image1Url?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  image2Url?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  image3Url?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  loggedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  weight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLBodyProgressLogResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['BodyProgressLog'] = GQLResolversParentTypes['BodyProgressLog']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  image1?: Resolver<Maybe<GQLResolversTypes['OptimizedImage']>, ParentType, ContextType>;
  image2?: Resolver<Maybe<GQLResolversTypes['OptimizedImage']>, ParentType, ContextType>;
  image3?: Resolver<Maybe<GQLResolversTypes['OptimizedImage']>, ParentType, ContextType>;
  loggedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  notes?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  shareWithTrainer?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLChatResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Chat'] = GQLResolversParentTypes['Chat']> = {
  client?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  clientId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  lastMessage?: Resolver<Maybe<GQLResolversTypes['Message']>, ParentType, ContextType>;
  messages?: Resolver<Array<GQLResolversTypes['Message']>, ParentType, ContextType, Partial<GQLChatMessagesArgs>>;
  trainer?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  trainerId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  unreadCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLChatWithMessagesResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['ChatWithMessages'] = GQLResolversParentTypes['ChatWithMessages']> = {
  client?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  clientId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  hasMoreMessages?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  lastMessage?: Resolver<Maybe<GQLResolversTypes['Message']>, ParentType, ContextType>;
  messages?: Resolver<Array<GQLResolversTypes['Message']>, ParentType, ContextType>;
  trainer?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  trainerId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  unreadCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLCheckinCompletionResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['CheckinCompletion'] = GQLResolversParentTypes['CheckinCompletion']> = {
  completedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  measurement?: Resolver<Maybe<GQLResolversTypes['UserBodyMeasure']>, ParentType, ContextType>;
  progressLog?: Resolver<Maybe<GQLResolversTypes['BodyProgressLog']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLCheckinScheduleResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['CheckinSchedule'] = GQLResolversParentTypes['CheckinSchedule']> = {
  completions?: Resolver<Array<GQLResolversTypes['CheckinCompletion']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  dayOfMonth?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  dayOfWeek?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  frequency?: Resolver<GQLResolversTypes['CheckinFrequency'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isActive?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  nextCheckinDate?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLCheckinStatusResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['CheckinStatus'] = GQLResolversParentTypes['CheckinStatus']> = {
  daysSinceLastCheckin?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  hasSchedule?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isCheckinDue?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  nextCheckinDate?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  schedule?: Resolver<Maybe<GQLResolversTypes['CheckinSchedule']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLClientSurveyResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['ClientSurvey'] = GQLResolversParentTypes['ClientSurvey']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  data?: Resolver<GQLResolversTypes['JSON'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  user?: Resolver<GQLResolversTypes['User'], ParentType, ContextType>;
  userId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  version?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLCoachingRequestResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['CoachingRequest'] = GQLResolversParentTypes['CoachingRequest']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  interestedServices?: Resolver<Maybe<Array<GQLResolversTypes['String']>>, ParentType, ContextType>;
  message?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  recipient?: Resolver<GQLResolversTypes['User'], ParentType, ContextType>;
  sender?: Resolver<GQLResolversTypes['User'], ParentType, ContextType>;
  status?: Resolver<GQLResolversTypes['CoachingRequestStatus'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLCopyNutritionPlanPayloadResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['CopyNutritionPlanPayload'] = GQLResolversParentTypes['CopyNutritionPlanPayload']> = {
  nutritionPlan?: Resolver<GQLResolversTypes['NutritionPlan'], ParentType, ContextType>;
  success?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLCreateNutritionPlanPayloadResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['CreateNutritionPlanPayload'] = GQLResolversParentTypes['CreateNutritionPlanPayload']> = {
  nutritionPlan?: Resolver<GQLResolversTypes['NutritionPlan'], ParentType, ContextType>;
  success?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLCreateTrainingPlanPayloadResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['CreateTrainingPlanPayload'] = GQLResolversParentTypes['CreateTrainingPlanPayload']> = {
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  success?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
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

export type GQLFreeWorkoutDayResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['FreeWorkoutDay'] = GQLResolversParentTypes['FreeWorkoutDay']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  heroImageUrl?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isVisible?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  plan?: Resolver<Maybe<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType>;
  planId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  trainingDay?: Resolver<Maybe<GQLResolversTypes['TrainingDay']>, ParentType, ContextType>;
  trainingDayId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLGetExercisesResponseResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['GetExercisesResponse'] = GQLResolversParentTypes['GetExercisesResponse']> = {
  publicExercises?: Resolver<Array<GQLResolversTypes['BaseExercise']>, ParentType, ContextType>;
  trainerExercises?: Resolver<Array<GQLResolversTypes['BaseExercise']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLGetWorkoutDayPayloadResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['GetWorkoutDayPayload'] = GQLResolversParentTypes['GetWorkoutDayPayload']> = {
  day?: Resolver<GQLResolversTypes['TrainingDay'], ParentType, ContextType>;
  previousDayLogs?: Resolver<Array<GQLResolversTypes['PreviousExerciseLog']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLGetWorkoutNavigationPayloadResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['GetWorkoutNavigationPayload'] = GQLResolversParentTypes['GetWorkoutNavigationPayload']> = {
  plan?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLImageResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Image'] = GQLResolversParentTypes['Image']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  entityId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  entityType?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  large?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  medium?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  order?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  url?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLIngredientResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Ingredient'] = GQLResolversParentTypes['Ingredient']> = {
  caloriesPer100g?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  carbsPer100g?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  fatPer100g?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  proteinPer100g?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export interface GQLJsonScalarConfig extends GraphQLScalarTypeConfig<GQLResolversTypes['JSON'], any> {
  name: 'JSON';
}

export type GQLLocationResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Location'] = GQLResolversParentTypes['Location']> = {
  city?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  country?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  countryCode?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMacroDistributionResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MacroDistribution'] = GQLResolversParentTypes['MacroDistribution']> = {
  carbsPercentage?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  fatPercentage?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  proteinPercentage?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMacroTargetResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MacroTarget'] = GQLResolversParentTypes['MacroTarget']> = {
  calories?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  carbs?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  clientId?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  fat?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  notes?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  protein?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  trainerId?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMacroTotalsResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MacroTotals'] = GQLResolversParentTypes['MacroTotals']> = {
  calories?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  carbs?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  fat?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  protein?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMealResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Meal'] = GQLResolversParentTypes['Meal']> = {
  archived?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  cookingTime?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  ingredients?: Resolver<Array<GQLResolversTypes['MealIngredient']>, ParentType, ContextType>;
  instructions?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  preparationTime?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  servings?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  team?: Resolver<Maybe<GQLResolversTypes['Team']>, ParentType, ContextType>;
  totalMacros?: Resolver<GQLResolversTypes['MacroTotals'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  usageCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMealIngredientResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MealIngredient'] = GQLResolversParentTypes['MealIngredient']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  grams?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  ingredient?: Resolver<GQLResolversTypes['Ingredient'], ParentType, ContextType>;
  macros?: Resolver<GQLResolversTypes['MacroTotals'], ParentType, ContextType>;
  order?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMeetingResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Meeting'] = GQLResolversParentTypes['Meeting']> = {
  address?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  coach?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  coachId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  duration?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  locationType?: Resolver<GQLResolversTypes['LocationType'], ParentType, ContextType>;
  meetingLink?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  notes?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  scheduledAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  serviceDelivery?: Resolver<Maybe<GQLResolversTypes['ServiceDelivery']>, ParentType, ContextType>;
  serviceDeliveryId?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  serviceTask?: Resolver<Maybe<GQLResolversTypes['ServiceTask']>, ParentType, ContextType>;
  serviceTaskId?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  status?: Resolver<GQLResolversTypes['MeetingStatus'], ParentType, ContextType>;
  timezone?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  trainee?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  traineeId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  type?: Resolver<GQLResolversTypes['MeetingType'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMessageResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Message'] = GQLResolversParentTypes['Message']> = {
  chatId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  content?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  isDeleted?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isEdited?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  readAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  sender?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  senderId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMessengerInitialDataResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MessengerInitialData'] = GQLResolversParentTypes['MessengerInitialData']> = {
  chats?: Resolver<Array<GQLResolversTypes['ChatWithMessages']>, ParentType, ContextType>;
  totalUnreadCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMuscleFrequencyResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MuscleFrequency'] = GQLResolversParentTypes['MuscleFrequency']> = {
  groupName?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  groupSlug?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  lastTrained?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  muscleAlias?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  muscleId?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  muscleName?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  sessionsCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  totalSets?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
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

export type GQLMuscleGroupDistributionResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MuscleGroupDistribution'] = GQLResolversParentTypes['MuscleGroupDistribution']> = {
  arms?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  back?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  chest?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  core?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  legs?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  shoulders?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMuscleGroupFrequencyResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MuscleGroupFrequency'] = GQLResolversParentTypes['MuscleGroupFrequency']> = {
  groupName?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  groupSlug?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  lastTrained?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  sessionsCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  totalSets?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMutationResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Mutation'] = GQLResolversParentTypes['Mutation']> = {
  acceptCoachingRequest?: Resolver<Maybe<GQLResolversTypes['CoachingRequest']>, ParentType, ContextType, RequireFields<GQLMutationAcceptCoachingRequestArgs, 'id'>>;
  activatePlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationActivatePlanArgs, 'planId' | 'resume' | 'startDate'>>;
  activateUser?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationActivateUserArgs, 'userId'>>;
  addAiExerciseToWorkout?: Resolver<GQLResolversTypes['TrainingExercise'], ParentType, ContextType, RequireFields<GQLMutationAddAiExerciseToWorkoutArgs, 'input'>>;
  addBodyMeasurement?: Resolver<GQLResolversTypes['UserBodyMeasure'], ParentType, ContextType, RequireFields<GQLMutationAddBodyMeasurementArgs, 'input'>>;
  addExerciseToDay?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationAddExerciseToDayArgs, 'input'>>;
  addExercisesToQuickWorkout?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType, RequireFields<GQLMutationAddExercisesToQuickWorkoutArgs, 'exercises'>>;
  addExercisesToWorkout?: Resolver<Array<GQLResolversTypes['TrainingExercise']>, ParentType, ContextType, RequireFields<GQLMutationAddExercisesToWorkoutArgs, 'input'>>;
  addFreeWorkoutDay?: Resolver<GQLResolversTypes['FreeWorkoutDay'], ParentType, ContextType, RequireFields<GQLMutationAddFreeWorkoutDayArgs, 'input'>>;
  addIngredientToMeal?: Resolver<GQLResolversTypes['MealIngredient'], ParentType, ContextType, RequireFields<GQLMutationAddIngredientToMealArgs, 'input'>>;
  addMealToNutritionPlanDay?: Resolver<GQLResolversTypes['NutritionPlanMeal'], ParentType, ContextType, RequireFields<GQLMutationAddMealToNutritionPlanDayArgs, 'input'>>;
  addNutritionPlanDay?: Resolver<GQLResolversTypes['NutritionPlanDay'], ParentType, ContextType, RequireFields<GQLMutationAddNutritionPlanDayArgs, 'input'>>;
  addSet?: Resolver<GQLResolversTypes['ExerciseSet'], ParentType, ContextType, RequireFields<GQLMutationAddSetArgs, 'exerciseId'>>;
  addSetExerciseForm?: Resolver<GQLResolversTypes['ExerciseSet'], ParentType, ContextType, RequireFields<GQLMutationAddSetExerciseFormArgs, 'input'>>;
  addSetToExercise?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationAddSetToExerciseArgs, 'input'>>;
  addSingleExerciseToDay?: Resolver<GQLResolversTypes['TrainingExercise'], ParentType, ContextType, RequireFields<GQLMutationAddSingleExerciseToDayArgs, 'dayId' | 'exerciseBaseId'>>;
  addSubstituteExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationAddSubstituteExerciseArgs, 'input'>>;
  addTeamLocation?: Resolver<GQLResolversTypes['Team'], ParentType, ContextType, RequireFields<GQLMutationAddTeamLocationArgs, 'input'>>;
  addTrainingWeek?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationAddTrainingWeekArgs, 'input'>>;
  addUserLocation?: Resolver<GQLResolversTypes['UserProfile'], ParentType, ContextType, RequireFields<GQLMutationAddUserLocationArgs, 'input'>>;
  archiveMeal?: Resolver<GQLResolversTypes['Meal'], ParentType, ContextType, RequireFields<GQLMutationArchiveMealArgs, 'id'>>;
  assignTemplateToSelf?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationAssignTemplateToSelfArgs, 'planId'>>;
  assignTrainingPlanToClient?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationAssignTrainingPlanToClientArgs, 'input'>>;
  cancelCoaching?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  cancelCoachingRequest?: Resolver<Maybe<GQLResolversTypes['CoachingRequest']>, ParentType, ContextType, RequireFields<GQLMutationCancelCoachingRequestArgs, 'id'>>;
  cancelMeeting?: Resolver<GQLResolversTypes['Meeting'], ParentType, ContextType, RequireFields<GQLMutationCancelMeetingArgs, 'meetingId'>>;
  clearUserSessions?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationClearUserSessionsArgs, 'userId'>>;
  clearWorkoutDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationClearWorkoutDayArgs, 'dayId'>>;
  closePlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationClosePlanArgs, 'planId'>>;
  completeCheckin?: Resolver<GQLResolversTypes['CheckinCompletion'], ParentType, ContextType, RequireFields<GQLMutationCompleteCheckinArgs, 'input'>>;
  confirmMeeting?: Resolver<GQLResolversTypes['Meeting'], ParentType, ContextType, RequireFields<GQLMutationConfirmMeetingArgs, 'meetingId'>>;
  copyExercisesFromDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationCopyExercisesFromDayArgs, 'input'>>;
  copyNutritionPlan?: Resolver<GQLResolversTypes['CopyNutritionPlanPayload'], ParentType, ContextType, RequireFields<GQLMutationCopyNutritionPlanArgs, 'input'>>;
  createBodyProgressLog?: Resolver<GQLResolversTypes['BodyProgressLog'], ParentType, ContextType, RequireFields<GQLMutationCreateBodyProgressLogArgs, 'input'>>;
  createCheckinSchedule?: Resolver<GQLResolversTypes['CheckinSchedule'], ParentType, ContextType, RequireFields<GQLMutationCreateCheckinScheduleArgs, 'input'>>;
  createCoachingRequest?: Resolver<GQLResolversTypes['CoachingRequest'], ParentType, ContextType, RequireFields<GQLMutationCreateCoachingRequestArgs, 'recipientEmail'>>;
  createDraftTemplate?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType>;
  createExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationCreateExerciseArgs, 'input'>>;
  createExerciseNote?: Resolver<GQLResolversTypes['Note'], ParentType, ContextType, RequireFields<GQLMutationCreateExerciseNoteArgs, 'input'>>;
  createFavouriteWorkout?: Resolver<GQLResolversTypes['FavouriteWorkout'], ParentType, ContextType, RequireFields<GQLMutationCreateFavouriteWorkoutArgs, 'input'>>;
  createIngredient?: Resolver<GQLResolversTypes['Ingredient'], ParentType, ContextType, RequireFields<GQLMutationCreateIngredientArgs, 'input'>>;
  createMeal?: Resolver<GQLResolversTypes['Meal'], ParentType, ContextType, RequireFields<GQLMutationCreateMealArgs, 'input'>>;
  createMeeting?: Resolver<GQLResolversTypes['Meeting'], ParentType, ContextType, RequireFields<GQLMutationCreateMeetingArgs, 'input'>>;
  createNote?: Resolver<GQLResolversTypes['Note'], ParentType, ContextType, RequireFields<GQLMutationCreateNoteArgs, 'input'>>;
  createNoteReply?: Resolver<GQLResolversTypes['Note'], ParentType, ContextType, RequireFields<GQLMutationCreateNoteReplyArgs, 'input'>>;
  createNotification?: Resolver<GQLResolversTypes['Notification'], ParentType, ContextType, RequireFields<GQLMutationCreateNotificationArgs, 'input'>>;
  createNutritionPlan?: Resolver<GQLResolversTypes['CreateNutritionPlanPayload'], ParentType, ContextType, RequireFields<GQLMutationCreateNutritionPlanArgs, 'input'>>;
  createPushSubscription?: Resolver<GQLResolversTypes['PushSubscription'], ParentType, ContextType, RequireFields<GQLMutationCreatePushSubscriptionArgs, 'input'>>;
  createQuickWorkout?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType, RequireFields<GQLMutationCreateQuickWorkoutArgs, 'input'>>;
  createReview?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationCreateReviewArgs, 'input'>>;
  createTeam?: Resolver<GQLResolversTypes['Team'], ParentType, ContextType, RequireFields<GQLMutationCreateTeamArgs, 'input'>>;
  createTrainerNoteForClient?: Resolver<GQLResolversTypes['Note'], ParentType, ContextType, RequireFields<GQLMutationCreateTrainerNoteForClientArgs, 'input'>>;
  createTrainingPlan?: Resolver<GQLResolversTypes['CreateTrainingPlanPayload'], ParentType, ContextType, RequireFields<GQLMutationCreateTrainingPlanArgs, 'input'>>;
  deactivateUser?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeactivateUserArgs, 'userId'>>;
  deleteBodyMeasurement?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteBodyMeasurementArgs, 'id'>>;
  deleteBodyProgressLog?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteBodyProgressLogArgs, 'id'>>;
  deleteCheckinSchedule?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  deleteExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteExerciseArgs, 'id'>>;
  deleteFavouriteWorkout?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteFavouriteWorkoutArgs, 'id'>>;
  deleteMacroTargets?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteMacroTargetsArgs, 'clientId'>>;
  deleteMeal?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteMealArgs, 'id'>>;
  deleteMessage?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteMessageArgs, 'id'>>;
  deleteNote?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteNoteArgs, 'id'>>;
  deleteNotification?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteNotificationArgs, 'id'>>;
  deleteNutritionPlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteNutritionPlanArgs, 'id'>>;
  deletePlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeletePlanArgs, 'planId'>>;
  deletePushSubscription?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeletePushSubscriptionArgs, 'endpoint'>>;
  deleteReview?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteReviewArgs, 'input'>>;
  deleteTrainingPlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteTrainingPlanArgs, 'id'>>;
  deleteUserAccount?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  duplicateMeal?: Resolver<GQLResolversTypes['Meal'], ParentType, ContextType, RequireFields<GQLMutationDuplicateMealArgs, 'id'>>;
  duplicateTrainingPlan?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationDuplicateTrainingPlanArgs, 'id'>>;
  duplicateTrainingWeek?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationDuplicateTrainingWeekArgs, 'input'>>;
  editMessage?: Resolver<GQLResolversTypes['Message'], ParentType, ContextType, RequireFields<GQLMutationEditMessageArgs, 'input'>>;
  extendPlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationExtendPlanArgs, 'planId' | 'weeks'>>;
  generateAiWorkout?: Resolver<GQLResolversTypes['AiWorkoutResult'], ParentType, ContextType, RequireFields<GQLMutationGenerateAiWorkoutArgs, 'input'>>;
  getAiExerciseSuggestions?: Resolver<Array<GQLResolversTypes['AiExerciseSuggestion']>, ParentType, ContextType, RequireFields<GQLMutationGetAiExerciseSuggestionsArgs, 'dayId'>>;
  giveLifetimePremium?: Resolver<GQLResolversTypes['UserSubscription'], ParentType, ContextType, RequireFields<GQLMutationGiveLifetimePremiumArgs, 'userId'>>;
  inviteTeamMember?: Resolver<GQLResolversTypes['TeamInvitation'], ParentType, ContextType, RequireFields<GQLMutationInviteTeamMemberArgs, 'input'>>;
  logWorkoutProgress?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationLogWorkoutProgressArgs, 'dayId' | 'tick'>>;
  logWorkoutSessionEvent?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationLogWorkoutSessionEventArgs, 'dayId' | 'event'>>;
  markAllNotificationsRead?: Resolver<Array<GQLResolversTypes['Notification']>, ParentType, ContextType, RequireFields<GQLMutationMarkAllNotificationsReadArgs, 'userId'>>;
  markExerciseAsCompleted?: Resolver<Maybe<GQLResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<GQLMutationMarkExerciseAsCompletedArgs, 'completed' | 'exerciseId'>>;
  markMessagesAsRead?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationMarkMessagesAsReadArgs, 'input'>>;
  markNotificationRead?: Resolver<GQLResolversTypes['Notification'], ParentType, ContextType, RequireFields<GQLMutationMarkNotificationReadArgs, 'id'>>;
  markSetAsCompleted?: Resolver<GQLResolversTypes['SetCompletionResult'], ParentType, ContextType, RequireFields<GQLMutationMarkSetAsCompletedArgs, 'completed' | 'setId'>>;
  markWorkoutAsCompleted?: Resolver<Maybe<GQLResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<GQLMutationMarkWorkoutAsCompletedArgs, 'dayId'>>;
  moderateReview?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationModerateReviewArgs, 'input'>>;
  moveExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationMoveExerciseArgs, 'input'>>;
  pauseClientCoachingSubscription?: Resolver<GQLResolversTypes['PauseCoachingResult'], ParentType, ContextType, RequireFields<GQLMutationPauseClientCoachingSubscriptionArgs, 'clientId'>>;
  pausePlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationPausePlanArgs, 'planId'>>;
  rejectCoachingRequest?: Resolver<Maybe<GQLResolversTypes['CoachingRequest']>, ParentType, ContextType, RequireFields<GQLMutationRejectCoachingRequestArgs, 'id'>>;
  rejectTrainerOffer?: Resolver<GQLResolversTypes['TrainerOffer'], ParentType, ContextType, RequireFields<GQLMutationRejectTrainerOfferArgs, 'offerId'>>;
  removeAllExercisesFromDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveAllExercisesFromDayArgs, 'input'>>;
  removeClient?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveClientArgs, 'clientId'>>;
  removeExerciseFromDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveExerciseFromDayArgs, 'exerciseId'>>;
  removeExerciseFromWorkout?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveExerciseFromWorkoutArgs, 'exerciseId'>>;
  removeFavouriteExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveFavouriteExerciseArgs, 'exerciseId'>>;
  removeFreeWorkoutDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveFreeWorkoutDayArgs, 'id'>>;
  removeIngredientFromMeal?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveIngredientFromMealArgs, 'id'>>;
  removeMealFromNutritionPlanDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveMealFromNutritionPlanDayArgs, 'planMealId'>>;
  removeNutritionPlanDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveNutritionPlanDayArgs, 'dayId'>>;
  removeSet?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveSetArgs, 'setId'>>;
  removeSetExerciseForm?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveSetExerciseFormArgs, 'setId'>>;
  removeSetFromExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveSetFromExerciseArgs, 'setId'>>;
  removeSubstituteExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveSubstituteExerciseArgs, 'input'>>;
  removeTeamLocation?: Resolver<GQLResolversTypes['Team'], ParentType, ContextType, RequireFields<GQLMutationRemoveTeamLocationArgs, 'input'>>;
  removeTeamMember?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveTeamMemberArgs, 'input'>>;
  removeTrainingPlanFromClient?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveTrainingPlanFromClientArgs, 'clientId' | 'planId'>>;
  removeTrainingWeek?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveTrainingWeekArgs, 'weekId'>>;
  removeUserLocation?: Resolver<GQLResolversTypes['UserProfile'], ParentType, ContextType, RequireFields<GQLMutationRemoveUserLocationArgs, 'locationId'>>;
  removeUserSubscription?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveUserSubscriptionArgs, 'userId'>>;
  removeWeek?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveWeekArgs, 'planId' | 'weekId'>>;
  reorderMealIngredients?: Resolver<Array<GQLResolversTypes['MealIngredient']>, ParentType, ContextType, RequireFields<GQLMutationReorderMealIngredientsArgs, 'input'>>;
  reorderNutritionPlanDayMeals?: Resolver<Array<GQLResolversTypes['NutritionPlanMeal']>, ParentType, ContextType, RequireFields<GQLMutationReorderNutritionPlanDayMealsArgs, 'input'>>;
  resetUserLogs?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  respondToTeamInvitation?: Resolver<GQLResolversTypes['TeamInvitation'], ParentType, ContextType, RequireFields<GQLMutationRespondToTeamInvitationArgs, 'input'>>;
  resumeClientCoachingSubscription?: Resolver<GQLResolversTypes['ResumeCoachingResult'], ParentType, ContextType, RequireFields<GQLMutationResumeClientCoachingSubscriptionArgs, 'clientId'>>;
  sendMessage?: Resolver<GQLResolversTypes['Message'], ParentType, ContextType, RequireFields<GQLMutationSendMessageArgs, 'input'>>;
  setMacroTargets?: Resolver<GQLResolversTypes['MacroTarget'], ParentType, ContextType, RequireFields<GQLMutationSetMacroTargetsArgs, 'input'>>;
  shareNutritionPlanWithClient?: Resolver<GQLResolversTypes['NutritionPlan'], ParentType, ContextType, RequireFields<GQLMutationShareNutritionPlanWithClientArgs, 'id'>>;
  skipCheckin?: Resolver<GQLResolversTypes['CheckinCompletion'], ParentType, ContextType>;
  startFreeWorkoutDay?: Resolver<GQLResolversTypes['StartFreeWorkoutResult'], ParentType, ContextType, RequireFields<GQLMutationStartFreeWorkoutDayArgs, 'input'>>;
  startWorkoutFromFavourite?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationStartWorkoutFromFavouriteArgs, 'input'>>;
  swapExercise?: Resolver<GQLResolversTypes['Substitute'], ParentType, ContextType, RequireFields<GQLMutationSwapExerciseArgs, 'exerciseId' | 'substituteId'>>;
  unarchiveMeal?: Resolver<GQLResolversTypes['Meal'], ParentType, ContextType, RequireFields<GQLMutationUnarchiveMealArgs, 'id'>>;
  unshareNutritionPlanFromClient?: Resolver<GQLResolversTypes['NutritionPlan'], ParentType, ContextType, RequireFields<GQLMutationUnshareNutritionPlanFromClientArgs, 'id'>>;
  updateBodyMeasurement?: Resolver<GQLResolversTypes['UserBodyMeasure'], ParentType, ContextType, RequireFields<GQLMutationUpdateBodyMeasurementArgs, 'input'>>;
  updateBodyProgressLog?: Resolver<GQLResolversTypes['BodyProgressLog'], ParentType, ContextType, RequireFields<GQLMutationUpdateBodyProgressLogArgs, 'id' | 'input'>>;
  updateBodyProgressLogSharingStatus?: Resolver<GQLResolversTypes['BodyProgressLog'], ParentType, ContextType, RequireFields<GQLMutationUpdateBodyProgressLogSharingStatusArgs, 'id' | 'shareWithTrainer'>>;
  updateCheckinSchedule?: Resolver<GQLResolversTypes['CheckinSchedule'], ParentType, ContextType, RequireFields<GQLMutationUpdateCheckinScheduleArgs, 'input'>>;
  updateExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateExerciseArgs, 'id' | 'input'>>;
  updateExerciseForm?: Resolver<GQLResolversTypes['TrainingExercise'], ParentType, ContextType, RequireFields<GQLMutationUpdateExerciseFormArgs, 'input'>>;
  updateExerciseSet?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateExerciseSetArgs, 'input'>>;
  updateFavouriteExerciseSets?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateFavouriteExerciseSetsArgs, 'exerciseId' | 'setCount'>>;
  updateFavouriteExercisesOrder?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateFavouriteExercisesOrderArgs, 'exerciseOrders' | 'favouriteId'>>;
  updateFavouriteWorkout?: Resolver<GQLResolversTypes['FavouriteWorkout'], ParentType, ContextType, RequireFields<GQLMutationUpdateFavouriteWorkoutArgs, 'input'>>;
  updateFreeWorkoutDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateFreeWorkoutDayArgs, 'id'>>;
  updateIngredient?: Resolver<GQLResolversTypes['Ingredient'], ParentType, ContextType, RequireFields<GQLMutationUpdateIngredientArgs, 'id' | 'input'>>;
  updateMeal?: Resolver<GQLResolversTypes['Meal'], ParentType, ContextType, RequireFields<GQLMutationUpdateMealArgs, 'id' | 'input'>>;
  updateMealIngredient?: Resolver<GQLResolversTypes['MealIngredient'], ParentType, ContextType, RequireFields<GQLMutationUpdateMealIngredientArgs, 'input'>>;
  updateMeeting?: Resolver<GQLResolversTypes['Meeting'], ParentType, ContextType, RequireFields<GQLMutationUpdateMeetingArgs, 'input' | 'meetingId'>>;
  updateNote?: Resolver<GQLResolversTypes['Note'], ParentType, ContextType, RequireFields<GQLMutationUpdateNoteArgs, 'input'>>;
  updateNotification?: Resolver<GQLResolversTypes['Notification'], ParentType, ContextType, RequireFields<GQLMutationUpdateNotificationArgs, 'input'>>;
  updateNutritionPlan?: Resolver<GQLResolversTypes['NutritionPlan'], ParentType, ContextType, RequireFields<GQLMutationUpdateNutritionPlanArgs, 'id' | 'input'>>;
  updateNutritionPlanDay?: Resolver<GQLResolversTypes['NutritionPlanDay'], ParentType, ContextType, RequireFields<GQLMutationUpdateNutritionPlanDayArgs, 'dayId' | 'input'>>;
  updateNutritionPlanMealIngredient?: Resolver<GQLResolversTypes['NutritionPlanMealIngredient'], ParentType, ContextType, RequireFields<GQLMutationUpdateNutritionPlanMealIngredientArgs, 'input'>>;
  updateProfile?: Resolver<Maybe<GQLResolversTypes['UserProfile']>, ParentType, ContextType, RequireFields<GQLMutationUpdateProfileArgs, 'input'>>;
  updatePushSubscription?: Resolver<GQLResolversTypes['PushSubscription'], ParentType, ContextType, RequireFields<GQLMutationUpdatePushSubscriptionArgs, 'input'>>;
  updateReview?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateReviewArgs, 'input'>>;
  updateServiceDelivery?: Resolver<GQLResolversTypes['ServiceDelivery'], ParentType, ContextType, RequireFields<GQLMutationUpdateServiceDeliveryArgs, 'deliveryId' | 'status'>>;
  updateServiceTask?: Resolver<GQLResolversTypes['ServiceTask'], ParentType, ContextType, RequireFields<GQLMutationUpdateServiceTaskArgs, 'input' | 'taskId'>>;
  updateSetLog?: Resolver<Maybe<GQLResolversTypes['ExerciseSetLog']>, ParentType, ContextType, RequireFields<GQLMutationUpdateSetLogArgs, 'input'>>;
  updateSubstituteExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateSubstituteExerciseArgs, 'input'>>;
  updateTeam?: Resolver<GQLResolversTypes['Team'], ParentType, ContextType, RequireFields<GQLMutationUpdateTeamArgs, 'input'>>;
  updateTrainerCapacity?: Resolver<GQLResolversTypes['User'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainerCapacityArgs, 'input'>>;
  updateTrainingDayData?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingDayDataArgs, 'input'>>;
  updateTrainingExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingExerciseArgs, 'input'>>;
  updateTrainingPlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingPlanArgs, 'input'>>;
  updateTrainingPlanDetails?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingPlanDetailsArgs, 'input'>>;
  updateTrainingPlanHeroImage?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingPlanHeroImageArgs, 'heroImageUrl' | 'planId'>>;
  updateTrainingWeekDetails?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingWeekDetailsArgs, 'input'>>;
  updateUserFeatured?: Resolver<GQLResolversTypes['AdminUserListItem'], ParentType, ContextType, RequireFields<GQLMutationUpdateUserFeaturedArgs, 'input'>>;
  updateUserRole?: Resolver<GQLResolversTypes['AdminUserListItem'], ParentType, ContextType, RequireFields<GQLMutationUpdateUserRoleArgs, 'input'>>;
  upsertClientSurvey?: Resolver<GQLResolversTypes['ClientSurvey'], ParentType, ContextType, RequireFields<GQLMutationUpsertClientSurveyArgs, 'data'>>;
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
  checkinReminders?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  emailNotifications?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  progressUpdates?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  pushNotifications?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  systemNotifications?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  workoutReminders?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLNutritionPlanResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['NutritionPlan'] = GQLResolversParentTypes['NutritionPlan']> = {
  averageDailyMacros?: Resolver<GQLResolversTypes['MacroTotals'], ParentType, ContextType>;
  canUnshare?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  client?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  completenessScore?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  dayCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  days?: Resolver<Array<GQLResolversTypes['NutritionPlanDay']>, ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  hasConsecutiveDays?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  hoursUntilUnshareExpiry?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isSharedWithClient?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  macroDistribution?: Resolver<GQLResolversTypes['MacroDistribution'], ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  planDurationRange?: Resolver<Maybe<GQLResolversTypes['PlanDurationRange']>, ParentType, ContextType>;
  sharedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  totalMealCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  trainer?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLNutritionPlanDayResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['NutritionPlanDay'] = GQLResolversParentTypes['NutritionPlanDay']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  dailyMacros?: Resolver<GQLResolversTypes['MacroTotals'], ParentType, ContextType>;
  dayNumber?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  mealCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  meals?: Resolver<Array<GQLResolversTypes['NutritionPlanMeal']>, ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLNutritionPlanMealResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['NutritionPlanMeal'] = GQLResolversParentTypes['NutritionPlanMeal']> = {
  adjustedMacros?: Resolver<GQLResolversTypes['MacroTotals'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  ingredientOverrides?: Resolver<Array<GQLResolversTypes['NutritionPlanMealIngredient']>, ParentType, ContextType>;
  meal?: Resolver<GQLResolversTypes['Meal'], ParentType, ContextType>;
  orderIndex?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLNutritionPlanMealIngredientResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['NutritionPlanMealIngredient'] = GQLResolversParentTypes['NutritionPlanMealIngredient']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  grams?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  mealIngredient?: Resolver<GQLResolversTypes['MealIngredient'], ParentType, ContextType>;
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

export type GQLOptimizedImageResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['OptimizedImage'] = GQLResolversParentTypes['OptimizedImage']> = {
  large?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  medium?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  thumbnail?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPackageSummaryItemResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PackageSummaryItem'] = GQLResolversParentTypes['PackageSummaryItem']> = {
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  packageId?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  quantity?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
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
  stripeLookupKey?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  stripeProductId?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  trainer?: Resolver<Maybe<GQLResolversTypes['User']>, ParentType, ContextType>;
  trainerId?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPauseCoachingResultResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PauseCoachingResult'] = GQLResolversParentTypes['PauseCoachingResult']> = {
  message?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  pausedUntil?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  subscription?: Resolver<Maybe<GQLResolversTypes['UserSubscription']>, ParentType, ContextType>;
  success?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPerformanceDataResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PerformanceData'] = GQLResolversParentTypes['PerformanceData']> = {
  date?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  estimated1RM?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  reps?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  weight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPersonalRecordResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PersonalRecord'] = GQLResolversParentTypes['PersonalRecord']> = {
  estimated1RM?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  exerciseName?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  improvement?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  reps?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  weight?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPersonalRecordHistoryResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PersonalRecordHistory'] = GQLResolversParentTypes['PersonalRecordHistory']> = {
  achievedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  dayId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  estimated1RM?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  exerciseId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  exerciseName?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  reps?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  weight?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPersonalRecordSummaryResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PersonalRecordSummary'] = GQLResolversParentTypes['PersonalRecordSummary']> = {
  achievedDate?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  baseExerciseId?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  bestEstimated1RM?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  exerciseName?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  reps?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  weekNumber?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  weight?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPlanDurationRangeResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PlanDurationRange'] = GQLResolversParentTypes['PlanDurationRange']> = {
  maxDay?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  minDay?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPlanSummaryResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PlanSummary'] = GQLResolversParentTypes['PlanSummary']> = {
  adherence?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  bodyComposition?: Resolver<Maybe<GQLResolversTypes['BodyCompositionChange']>, ParentType, ContextType>;
  duration?: Resolver<GQLResolversTypes['PlanSummaryDuration'], ParentType, ContextType>;
  personalRecords?: Resolver<Array<GQLResolversTypes['PersonalRecordSummary']>, ParentType, ContextType>;
  strengthProgress?: Resolver<Array<GQLResolversTypes['StrengthProgression']>, ParentType, ContextType>;
  totalPRsAchieved?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  totalVolumeLifted?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  totalWorkouts?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  workoutsCompleted?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPlanSummaryDurationResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PlanSummaryDuration'] = GQLResolversParentTypes['PlanSummaryDuration']> = {
  endDate?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  startDate?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  weeks?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPreviousExerciseLogResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PreviousExerciseLog'] = GQLResolversParentTypes['PreviousExerciseLog']> = {
  baseId?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  exerciseName?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  sets?: Resolver<Array<GQLResolversTypes['ExerciseSet']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLPublicTrainerResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['PublicTrainer'] = GQLResolversParentTypes['PublicTrainer']> = {
  capacity?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  clientCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  credentials?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isAtCapacity?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  name?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  profile?: Resolver<Maybe<GQLResolversTypes['UserProfile']>, ParentType, ContextType>;
  role?: Resolver<GQLResolversTypes['UserRole'], ParentType, ContextType>;
  specialization?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  spotsLeft?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
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
  bodyMeasures?: Resolver<Array<GQLResolversTypes['UserBodyMeasure']>, ParentType, ContextType>;
  checkPremiumAccess?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  checkinSchedule?: Resolver<Maybe<GQLResolversTypes['CheckinSchedule']>, ParentType, ContextType>;
  checkinStatus?: Resolver<GQLResolversTypes['CheckinStatus'], ParentType, ContextType>;
  clientBodyMeasures?: Resolver<Array<GQLResolversTypes['UserBodyMeasure']>, ParentType, ContextType, RequireFields<GQLQueryClientBodyMeasuresArgs, 'clientId'>>;
  clientBodyProgressLogs?: Resolver<Array<GQLResolversTypes['BodyProgressLog']>, ParentType, ContextType, RequireFields<GQLQueryClientBodyProgressLogsArgs, 'clientId'>>;
  clientHasActiveCoachingSubscription?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLQueryClientHasActiveCoachingSubscriptionArgs, 'clientId'>>;
  clientNutritionPlans?: Resolver<Array<GQLResolversTypes['NutritionPlan']>, ParentType, ContextType>;
  clientSharedNotes?: Resolver<Array<GQLResolversTypes['Note']>, ParentType, ContextType, RequireFields<GQLQueryClientSharedNotesArgs, 'clientId'>>;
  coachingRequest?: Resolver<Maybe<GQLResolversTypes['CoachingRequest']>, ParentType, ContextType, RequireFields<GQLQueryCoachingRequestArgs, 'id'>>;
  coachingRequests?: Resolver<Array<GQLResolversTypes['CoachingRequest']>, ParentType, ContextType>;
  exercise?: Resolver<Maybe<GQLResolversTypes['BaseExercise']>, ParentType, ContextType, RequireFields<GQLQueryExerciseArgs, 'id'>>;
  exerciseNotes?: Resolver<Array<GQLResolversTypes['Note']>, ParentType, ContextType, RequireFields<GQLQueryExerciseNotesArgs, 'exerciseName'>>;
  exercisesProgressByUser?: Resolver<Array<GQLResolversTypes['ExerciseProgress']>, ParentType, ContextType, Partial<GQLQueryExercisesProgressByUserArgs>>;
  getActivePackageTemplates?: Resolver<Array<GQLResolversTypes['PackageTemplate']>, ParentType, ContextType, Partial<GQLQueryGetActivePackageTemplatesArgs>>;
  getActivePlanId?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  getAdminFreeWorkoutDays?: Resolver<Array<GQLResolversTypes['FreeWorkoutDay']>, ParentType, ContextType>;
  getAllUsersWithSubscriptions?: Resolver<GQLResolversTypes['UsersWithSubscriptionsResult'], ParentType, ContextType, Partial<GQLQueryGetAllUsersWithSubscriptionsArgs>>;
  getChatMessages?: Resolver<Array<GQLResolversTypes['Message']>, ParentType, ContextType, RequireFields<GQLQueryGetChatMessagesArgs, 'chatId'>>;
  getClientActivePlan?: Resolver<Maybe<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType, RequireFields<GQLQueryGetClientActivePlanArgs, 'clientId'>>;
  getClientMacroTargets?: Resolver<Maybe<GQLResolversTypes['MacroTarget']>, ParentType, ContextType, RequireFields<GQLQueryGetClientMacroTargetsArgs, 'clientId'>>;
  getClientNutritionPlans?: Resolver<Array<GQLResolversTypes['NutritionPlan']>, ParentType, ContextType, RequireFields<GQLQueryGetClientNutritionPlansArgs, 'clientId'>>;
  getClientSurveyForTrainee?: Resolver<Maybe<GQLResolversTypes['ClientSurvey']>, ParentType, ContextType, RequireFields<GQLQueryGetClientSurveyForTraineeArgs, 'traineeId'>>;
  getClientTrainerOffers?: Resolver<Array<GQLResolversTypes['TrainerOffer']>, ParentType, ContextType, RequireFields<GQLQueryGetClientTrainerOffersArgs, 'clientEmail' | 'trainerId'>>;
  getClientTrainingPlans?: Resolver<Array<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType, RequireFields<GQLQueryGetClientTrainingPlansArgs, 'clientId'>>;
  getExercises?: Resolver<GQLResolversTypes['GetExercisesResponse'], ParentType, ContextType>;
  getFavouriteWorkout?: Resolver<Maybe<GQLResolversTypes['FavouriteWorkout']>, ParentType, ContextType, RequireFields<GQLQueryGetFavouriteWorkoutArgs, 'id'>>;
  getFavouriteWorkouts?: Resolver<Array<GQLResolversTypes['FavouriteWorkout']>, ParentType, ContextType>;
  getFeaturedTrainers?: Resolver<Array<GQLResolversTypes['PublicTrainer']>, ParentType, ContextType, Partial<GQLQueryGetFeaturedTrainersArgs>>;
  getFreeWorkoutDays?: Resolver<Array<GQLResolversTypes['FreeWorkoutDay']>, ParentType, ContextType>;
  getMessengerInitialData?: Resolver<GQLResolversTypes['MessengerInitialData'], ParentType, ContextType, Partial<GQLQueryGetMessengerInitialDataArgs>>;
  getMyChats?: Resolver<Array<GQLResolversTypes['Chat']>, ParentType, ContextType>;
  getMyClientSurvey?: Resolver<Maybe<GQLResolversTypes['ClientSurvey']>, ParentType, ContextType>;
  getMyMacroTargets?: Resolver<Maybe<GQLResolversTypes['MacroTarget']>, ParentType, ContextType>;
  getMyPlansOverview?: Resolver<GQLResolversTypes['MyPlansPayload'], ParentType, ContextType>;
  getMyPlansOverviewFull?: Resolver<GQLResolversTypes['MyPlansPayload'], ParentType, ContextType>;
  getMyPlansOverviewLite?: Resolver<GQLResolversTypes['MyPlansPayload'], ParentType, ContextType>;
  getMyServiceDeliveries?: Resolver<Array<GQLResolversTypes['ServiceDelivery']>, ParentType, ContextType, Partial<GQLQueryGetMyServiceDeliveriesArgs>>;
  getMySubscriptionStatus?: Resolver<GQLResolversTypes['UserSubscriptionStatus'], ParentType, ContextType>;
  getMySubscriptions?: Resolver<Array<GQLResolversTypes['UserSubscription']>, ParentType, ContextType>;
  getMyTrainer?: Resolver<Maybe<GQLResolversTypes['PublicTrainer']>, ParentType, ContextType>;
  getOrCreateChat?: Resolver<GQLResolversTypes['Chat'], ParentType, ContextType, RequireFields<GQLQueryGetOrCreateChatArgs, 'partnerId'>>;
  getPackageTemplate?: Resolver<Maybe<GQLResolversTypes['PackageTemplate']>, ParentType, ContextType, RequireFields<GQLQueryGetPackageTemplateArgs, 'id'>>;
  getPlanPreview?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType, RequireFields<GQLQueryGetPlanPreviewArgs, 'id'>>;
  getPlanSummary?: Resolver<GQLResolversTypes['PlanSummary'], ParentType, ContextType, RequireFields<GQLQueryGetPlanSummaryArgs, 'planId'>>;
  getPublicTrainingPlans?: Resolver<Array<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType, Partial<GQLQueryGetPublicTrainingPlansArgs>>;
  getQuickWorkoutDay?: Resolver<Maybe<GQLResolversTypes['GetWorkoutDayPayload']>, ParentType, ContextType, Partial<GQLQueryGetQuickWorkoutDayArgs>>;
  getQuickWorkoutNavigation?: Resolver<Maybe<GQLResolversTypes['GetWorkoutNavigationPayload']>, ParentType, ContextType>;
  getQuickWorkoutPlan?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType>;
  getServiceDeliveryMeetings?: Resolver<Array<GQLResolversTypes['Meeting']>, ParentType, ContextType, RequireFields<GQLQueryGetServiceDeliveryMeetingsArgs, 'serviceDeliveryId'>>;
  getServiceDeliveryTasks?: Resolver<Array<GQLResolversTypes['ServiceTask']>, ParentType, ContextType, RequireFields<GQLQueryGetServiceDeliveryTasksArgs, 'serviceDeliveryId'>>;
  getSubscriptionStats?: Resolver<GQLResolversTypes['SubscriptionStats'], ParentType, ContextType>;
  getTemplates?: Resolver<Array<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType, Partial<GQLQueryGetTemplatesArgs>>;
  getTotalUnreadCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  getTraineeMeetings?: Resolver<Array<GQLResolversTypes['Meeting']>, ParentType, ContextType, RequireFields<GQLQueryGetTraineeMeetingsArgs, 'traineeId'>>;
  getTrainerDeliveries?: Resolver<Array<GQLResolversTypes['ServiceDelivery']>, ParentType, ContextType, RequireFields<GQLQueryGetTrainerDeliveriesArgs, 'trainerId'>>;
  getTrainerTasks?: Resolver<Array<GQLResolversTypes['ServiceTask']>, ParentType, ContextType, RequireFields<GQLQueryGetTrainerTasksArgs, 'trainerId'>>;
  getTrainingExercise?: Resolver<Maybe<GQLResolversTypes['TrainingExercise']>, ParentType, ContextType, RequireFields<GQLQueryGetTrainingExerciseArgs, 'id'>>;
  getTrainingPlanById?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType, RequireFields<GQLQueryGetTrainingPlanByIdArgs, 'id'>>;
  getUserPRHistory?: Resolver<Array<GQLResolversTypes['PersonalRecordHistory']>, ParentType, ContextType, RequireFields<GQLQueryGetUserPrHistoryArgs, 'userId'>>;
  getWorkoutDay?: Resolver<Maybe<GQLResolversTypes['GetWorkoutDayPayload']>, ParentType, ContextType, Partial<GQLQueryGetWorkoutDayArgs>>;
  getWorkoutInfo?: Resolver<GQLResolversTypes['TrainingDay'], ParentType, ContextType, RequireFields<GQLQueryGetWorkoutInfoArgs, 'dayId'>>;
  getWorkoutNavigation?: Resolver<Maybe<GQLResolversTypes['GetWorkoutNavigationPayload']>, ParentType, ContextType, Partial<GQLQueryGetWorkoutNavigationArgs>>;
  ingredient?: Resolver<Maybe<GQLResolversTypes['Ingredient']>, ParentType, ContextType, RequireFields<GQLQueryIngredientArgs, 'id'>>;
  locations?: Resolver<Array<GQLResolversTypes['Location']>, ParentType, ContextType>;
  meal?: Resolver<Maybe<GQLResolversTypes['Meal']>, ParentType, ContextType, RequireFields<GQLQueryMealArgs, 'id'>>;
  muscleFrequency?: Resolver<Array<GQLResolversTypes['MuscleFrequency']>, ParentType, ContextType, RequireFields<GQLQueryMuscleFrequencyArgs, 'days' | 'userId'>>;
  muscleGroupCategories?: Resolver<Array<GQLResolversTypes['MuscleGroupCategory']>, ParentType, ContextType>;
  muscleGroupCategory?: Resolver<GQLResolversTypes['MuscleGroupCategory'], ParentType, ContextType, RequireFields<GQLQueryMuscleGroupCategoryArgs, 'id'>>;
  muscleGroupDistribution?: Resolver<GQLResolversTypes['MuscleGroupDistribution'], ParentType, ContextType, RequireFields<GQLQueryMuscleGroupDistributionArgs, 'days' | 'userId'>>;
  muscleGroupFrequency?: Resolver<Array<GQLResolversTypes['MuscleGroupFrequency']>, ParentType, ContextType, RequireFields<GQLQueryMuscleGroupFrequencyArgs, 'days' | 'userId'>>;
  myClients?: Resolver<Array<GQLResolversTypes['UserPublic']>, ParentType, ContextType, Partial<GQLQueryMyClientsArgs>>;
  myTeams?: Resolver<Array<GQLResolversTypes['Team']>, ParentType, ContextType>;
  myTrainer?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  myUpcomingMeetings?: Resolver<Array<GQLResolversTypes['Meeting']>, ParentType, ContextType>;
  note?: Resolver<Maybe<GQLResolversTypes['Note']>, ParentType, ContextType, RequireFields<GQLQueryNoteArgs, 'id'>>;
  noteReplies?: Resolver<Array<GQLResolversTypes['Note']>, ParentType, ContextType, RequireFields<GQLQueryNoteRepliesArgs, 'noteId'>>;
  notes?: Resolver<Array<GQLResolversTypes['Note']>, ParentType, ContextType, Partial<GQLQueryNotesArgs>>;
  notification?: Resolver<Maybe<GQLResolversTypes['Notification']>, ParentType, ContextType, RequireFields<GQLQueryNotificationArgs, 'id'>>;
  notifications?: Resolver<Array<GQLResolversTypes['Notification']>, ParentType, ContextType, RequireFields<GQLQueryNotificationsArgs, 'userId'>>;
  nutritionPlan?: Resolver<Maybe<GQLResolversTypes['NutritionPlan']>, ParentType, ContextType, RequireFields<GQLQueryNutritionPlanArgs, 'id'>>;
  nutritionPlans?: Resolver<Array<GQLResolversTypes['NutritionPlan']>, ParentType, ContextType>;
  popularIngredients?: Resolver<Array<GQLResolversTypes['Ingredient']>, ParentType, ContextType, Partial<GQLQueryPopularIngredientsArgs>>;
  profile?: Resolver<Maybe<GQLResolversTypes['UserProfile']>, ParentType, ContextType>;
  publicExercises?: Resolver<Array<GQLResolversTypes['BaseExercise']>, ParentType, ContextType, Partial<GQLQueryPublicExercisesArgs>>;
  pushSubscription?: Resolver<Maybe<GQLResolversTypes['PushSubscription']>, ParentType, ContextType, RequireFields<GQLQueryPushSubscriptionArgs, 'endpoint'>>;
  pushSubscriptions?: Resolver<Array<GQLResolversTypes['PushSubscription']>, ParentType, ContextType>;
  recentIngredients?: Resolver<Array<GQLResolversTypes['Ingredient']>, ParentType, ContextType, Partial<GQLQueryRecentIngredientsArgs>>;
  searchIngredients?: Resolver<Array<GQLResolversTypes['Ingredient']>, ParentType, ContextType, RequireFields<GQLQuerySearchIngredientsArgs, 'query'>>;
  searchUsers?: Resolver<Array<GQLResolversTypes['SearchUserResult']>, ParentType, ContextType, RequireFields<GQLQuerySearchUsersArgs, 'email'>>;
  sentTeamInvitations?: Resolver<Array<GQLResolversTypes['TeamInvitation']>, ParentType, ContextType>;
  team?: Resolver<Maybe<GQLResolversTypes['Team']>, ParentType, ContextType, RequireFields<GQLQueryTeamArgs, 'id'>>;
  teamInvitations?: Resolver<Array<GQLResolversTypes['TeamInvitation']>, ParentType, ContextType>;
  teamMeals?: Resolver<Array<GQLResolversTypes['Meal']>, ParentType, ContextType, Partial<GQLQueryTeamMealsArgs>>;
  trainerNutritionPlans?: Resolver<Array<GQLResolversTypes['NutritionPlan']>, ParentType, ContextType, Partial<GQLQueryTrainerNutritionPlansArgs>>;
  trainerSharedNotes?: Resolver<Array<GQLResolversTypes['Note']>, ParentType, ContextType, Partial<GQLQueryTrainerSharedNotesArgs>>;
  user?: Resolver<Maybe<GQLResolversTypes['User']>, ParentType, ContextType>;
  userBasic?: Resolver<Maybe<GQLResolversTypes['User']>, ParentType, ContextType>;
  userBodyProgressLogs?: Resolver<Array<GQLResolversTypes['BodyProgressLog']>, ParentType, ContextType, RequireFields<GQLQueryUserBodyProgressLogsArgs, 'userProfileId'>>;
  userExercises?: Resolver<Array<GQLResolversTypes['BaseExercise']>, ParentType, ContextType, Partial<GQLQueryUserExercisesArgs>>;
  userPublic?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType, RequireFields<GQLQueryUserPublicArgs, 'id'>>;
  workoutExerciseNotes?: Resolver<Array<GQLResolversTypes['WorkoutExerciseNotes']>, ParentType, ContextType, RequireFields<GQLQueryWorkoutExerciseNotesArgs, 'exerciseNames'>>;
};

export type GQLResumeCoachingResultResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['ResumeCoachingResult'] = GQLResolversParentTypes['ResumeCoachingResult']> = {
  message?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  subscription?: Resolver<Maybe<GQLResolversTypes['UserSubscription']>, ParentType, ContextType>;
  success?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
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

export type GQLSearchUserResultResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['SearchUserResult'] = GQLResolversParentTypes['SearchUserResult']> = {
  email?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  hasTrainer?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  image?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  role?: Resolver<GQLResolversTypes['UserRole'], ParentType, ContextType>;
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
  tasks?: Resolver<Array<GQLResolversTypes['ServiceTask']>, ParentType, ContextType>;
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

export type GQLSetCompletionResultResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['SetCompletionResult'] = GQLResolversParentTypes['SetCompletionResult']> = {
  improvement?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  isPersonalRecord?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  success?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLStartFreeWorkoutResultResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['StartFreeWorkoutResult'] = GQLResolversParentTypes['StartFreeWorkoutResult']> = {
  dayId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  planId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  weekId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLStrengthProgressionResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['StrengthProgression'] = GQLResolversParentTypes['StrengthProgression']> = {
  baseExerciseId?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  exerciseName?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  firstPerformance?: Resolver<GQLResolversTypes['PerformanceData'], ParentType, ContextType>;
  improvementPercentage?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  lastPerformance?: Resolver<GQLResolversTypes['PerformanceData'], ParentType, ContextType>;
  totalSessions?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
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
  maxReps?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  minReps?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  reps?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  rpe?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLTeamResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Team'] = GQLResolversParentTypes['Team']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  hasStripeConnect?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isAdmin?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  locations?: Resolver<Array<GQLResolversTypes['Location']>, ParentType, ContextType>;
  memberCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  members?: Resolver<Array<GQLResolversTypes['TeamMember']>, ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  platformFeePercent?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  stripeConnectedAccountId?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLTeamInvitationResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['TeamInvitation'] = GQLResolversParentTypes['TeamInvitation']> = {
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  invitedBy?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  invitedEmail?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<GQLResolversTypes['InvitationStatus'], ParentType, ContextType>;
  team?: Resolver<GQLResolversTypes['Team'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLTeamMemberResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['TeamMember'] = GQLResolversParentTypes['TeamMember']> = {
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  joinedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  role?: Resolver<GQLResolversTypes['TeamRole'], ParentType, ContextType>;
  user?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLTrainerOfferResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['TrainerOffer'] = GQLResolversParentTypes['TrainerOffer']> = {
  clientEmail?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  expiresAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  packageSummary?: Resolver<Array<GQLResolversTypes['PackageSummaryItem']>, ParentType, ContextType>;
  personalMessage?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  serviceDeliveries?: Resolver<Array<GQLResolversTypes['ServiceDelivery']>, ParentType, ContextType>;
  status?: Resolver<GQLResolversTypes['TrainerOfferStatus'], ParentType, ContextType>;
  stripeCheckoutSessionId?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  stripePaymentIntentId?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  token?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  trainer?: Resolver<GQLResolversTypes['User'], ParentType, ContextType>;
  trainerId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLTrainingDayResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['TrainingDay'] = GQLResolversParentTypes['TrainingDay']> = {
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  dayOfWeek?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  duration?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  exercises?: Resolver<Array<GQLResolversTypes['TrainingExercise']>, ParentType, ContextType>;
  exercisesCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isFreeDemo?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isRestDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  personalRecords?: Resolver<Maybe<Array<GQLResolversTypes['PersonalRecord']>>, ParentType, ContextType>;
  scheduledAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  sourcePlanId?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  startedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  timesStarted?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
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
  heroImageUrl?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isDemo?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isDraft?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
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
  timesStarted?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  title?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  totalReviews?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  totalWorkouts?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  userReview?: Resolver<Maybe<GQLResolversTypes['Review']>, ParentType, ContextType>;
  weekCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  weeks?: Resolver<Array<GQLResolversTypes['TrainingWeek']>, ParentType, ContextType>;
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
  capacity?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
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
  trainerId?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
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
  blurProgressSnapshots?: Resolver<Maybe<GQLResolversTypes['Boolean']>, ParentType, ContextType>;
  bodyMeasures?: Resolver<Array<GQLResolversTypes['UserBodyMeasure']>, ParentType, ContextType>;
  checkinReminders?: Resolver<Maybe<GQLResolversTypes['Boolean']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  credentials?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  fitnessLevel?: Resolver<Maybe<GQLResolversTypes['FitnessLevel']>, ParentType, ContextType>;
  goals?: Resolver<Array<GQLResolversTypes['Goal']>, ParentType, ContextType>;
  hasCompletedOnboarding?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  height?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  heightUnit?: Resolver<GQLResolversTypes['HeightUnit'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  locations?: Resolver<Array<GQLResolversTypes['Location']>, ParentType, ContextType>;
  notificationPreferences?: Resolver<GQLResolversTypes['NotificationPreferences'], ParentType, ContextType>;
  phone?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  sex?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  specialization?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  successStories?: Resolver<Array<GQLResolversTypes['String']>, ParentType, ContextType>;
  theme?: Resolver<GQLResolversTypes['Theme'], ParentType, ContextType>;
  timeFormat?: Resolver<GQLResolversTypes['TimeFormat'], ParentType, ContextType>;
  timezone?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
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
  stripeLookupKey?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
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
  AiWorkoutVariant?: GQLAiWorkoutVariantResolvers<ContextType>;
  BaseExercise?: GQLBaseExerciseResolvers<ContextType>;
  BaseExerciseSubstitute?: GQLBaseExerciseSubstituteResolvers<ContextType>;
  BodyCompositionChange?: GQLBodyCompositionChangeResolvers<ContextType>;
  BodyCompositionSnapshot?: GQLBodyCompositionSnapshotResolvers<ContextType>;
  BodyProgressLog?: GQLBodyProgressLogResolvers<ContextType>;
  Chat?: GQLChatResolvers<ContextType>;
  ChatWithMessages?: GQLChatWithMessagesResolvers<ContextType>;
  CheckinCompletion?: GQLCheckinCompletionResolvers<ContextType>;
  CheckinSchedule?: GQLCheckinScheduleResolvers<ContextType>;
  CheckinStatus?: GQLCheckinStatusResolvers<ContextType>;
  ClientSurvey?: GQLClientSurveyResolvers<ContextType>;
  CoachingRequest?: GQLCoachingRequestResolvers<ContextType>;
  CopyNutritionPlanPayload?: GQLCopyNutritionPlanPayloadResolvers<ContextType>;
  CreateNutritionPlanPayload?: GQLCreateNutritionPlanPayloadResolvers<ContextType>;
  CreateTrainingPlanPayload?: GQLCreateTrainingPlanPayloadResolvers<ContextType>;
  ExerciseLog?: GQLExerciseLogResolvers<ContextType>;
  ExerciseProgress?: GQLExerciseProgressResolvers<ContextType>;
  ExerciseSet?: GQLExerciseSetResolvers<ContextType>;
  ExerciseSetLog?: GQLExerciseSetLogResolvers<ContextType>;
  FavouriteWorkout?: GQLFavouriteWorkoutResolvers<ContextType>;
  FavouriteWorkoutExercise?: GQLFavouriteWorkoutExerciseResolvers<ContextType>;
  FavouriteWorkoutSet?: GQLFavouriteWorkoutSetResolvers<ContextType>;
  FreeWorkoutDay?: GQLFreeWorkoutDayResolvers<ContextType>;
  GetExercisesResponse?: GQLGetExercisesResponseResolvers<ContextType>;
  GetWorkoutDayPayload?: GQLGetWorkoutDayPayloadResolvers<ContextType>;
  GetWorkoutNavigationPayload?: GQLGetWorkoutNavigationPayloadResolvers<ContextType>;
  Image?: GQLImageResolvers<ContextType>;
  Ingredient?: GQLIngredientResolvers<ContextType>;
  JSON?: GraphQLScalarType;
  Location?: GQLLocationResolvers<ContextType>;
  MacroDistribution?: GQLMacroDistributionResolvers<ContextType>;
  MacroTarget?: GQLMacroTargetResolvers<ContextType>;
  MacroTotals?: GQLMacroTotalsResolvers<ContextType>;
  Meal?: GQLMealResolvers<ContextType>;
  MealIngredient?: GQLMealIngredientResolvers<ContextType>;
  Meeting?: GQLMeetingResolvers<ContextType>;
  Message?: GQLMessageResolvers<ContextType>;
  MessengerInitialData?: GQLMessengerInitialDataResolvers<ContextType>;
  MuscleFrequency?: GQLMuscleFrequencyResolvers<ContextType>;
  MuscleGroup?: GQLMuscleGroupResolvers<ContextType>;
  MuscleGroupCategory?: GQLMuscleGroupCategoryResolvers<ContextType>;
  MuscleGroupDistribution?: GQLMuscleGroupDistributionResolvers<ContextType>;
  MuscleGroupFrequency?: GQLMuscleGroupFrequencyResolvers<ContextType>;
  Mutation?: GQLMutationResolvers<ContextType>;
  MyPlansPayload?: GQLMyPlansPayloadResolvers<ContextType>;
  Note?: GQLNoteResolvers<ContextType>;
  Notification?: GQLNotificationResolvers<ContextType>;
  NotificationPreferences?: GQLNotificationPreferencesResolvers<ContextType>;
  NutritionPlan?: GQLNutritionPlanResolvers<ContextType>;
  NutritionPlanDay?: GQLNutritionPlanDayResolvers<ContextType>;
  NutritionPlanMeal?: GQLNutritionPlanMealResolvers<ContextType>;
  NutritionPlanMealIngredient?: GQLNutritionPlanMealIngredientResolvers<ContextType>;
  OneRmEntry?: GQLOneRmEntryResolvers<ContextType>;
  OneRmLog?: GQLOneRmLogResolvers<ContextType>;
  OptimizedImage?: GQLOptimizedImageResolvers<ContextType>;
  PackageSummaryItem?: GQLPackageSummaryItemResolvers<ContextType>;
  PackageTemplate?: GQLPackageTemplateResolvers<ContextType>;
  PauseCoachingResult?: GQLPauseCoachingResultResolvers<ContextType>;
  PerformanceData?: GQLPerformanceDataResolvers<ContextType>;
  PersonalRecord?: GQLPersonalRecordResolvers<ContextType>;
  PersonalRecordHistory?: GQLPersonalRecordHistoryResolvers<ContextType>;
  PersonalRecordSummary?: GQLPersonalRecordSummaryResolvers<ContextType>;
  PlanDurationRange?: GQLPlanDurationRangeResolvers<ContextType>;
  PlanSummary?: GQLPlanSummaryResolvers<ContextType>;
  PlanSummaryDuration?: GQLPlanSummaryDurationResolvers<ContextType>;
  PreviousExerciseLog?: GQLPreviousExerciseLogResolvers<ContextType>;
  PublicTrainer?: GQLPublicTrainerResolvers<ContextType>;
  PushSubscription?: GQLPushSubscriptionResolvers<ContextType>;
  Query?: GQLQueryResolvers<ContextType>;
  ResumeCoachingResult?: GQLResumeCoachingResultResolvers<ContextType>;
  Review?: GQLReviewResolvers<ContextType>;
  SearchUserResult?: GQLSearchUserResultResolvers<ContextType>;
  ServiceDelivery?: GQLServiceDeliveryResolvers<ContextType>;
  ServiceTask?: GQLServiceTaskResolvers<ContextType>;
  SetCompletionResult?: GQLSetCompletionResultResolvers<ContextType>;
  StartFreeWorkoutResult?: GQLStartFreeWorkoutResultResolvers<ContextType>;
  StrengthProgression?: GQLStrengthProgressionResolvers<ContextType>;
  SubscriptionStats?: GQLSubscriptionStatsResolvers<ContextType>;
  Substitute?: GQLSubstituteResolvers<ContextType>;
  SuggestedSets?: GQLSuggestedSetsResolvers<ContextType>;
  Team?: GQLTeamResolvers<ContextType>;
  TeamInvitation?: GQLTeamInvitationResolvers<ContextType>;
  TeamMember?: GQLTeamMemberResolvers<ContextType>;
  TrainerOffer?: GQLTrainerOfferResolvers<ContextType>;
  TrainingDay?: GQLTrainingDayResolvers<ContextType>;
  TrainingExercise?: GQLTrainingExerciseResolvers<ContextType>;
  TrainingPlan?: GQLTrainingPlanResolvers<ContextType>;
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

