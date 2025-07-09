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

export type GQLBaseExercise = {
  __typename?: 'BaseExercise';
  additionalInstructions?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  canBeSubstitutedBy: EntireFieldWrapper<Array<GQLBaseExerciseSubstitute>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  createdBy?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  equipment?: EntireFieldWrapper<Maybe<GQLEquipment>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isPublic: EntireFieldWrapper<Scalars['Boolean']['output']>;
  muscleGroupCategories: EntireFieldWrapper<Array<GQLMuscleGroupCategory>>;
  muscleGroups: EntireFieldWrapper<Array<GQLMuscleGroup>>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  substitutes: EntireFieldWrapper<Array<GQLBaseExerciseSubstitute>>;
  type?: EntireFieldWrapper<Maybe<GQLExerciseType>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
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

export type GQLCreateExerciseInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  equipment?: InputMaybe<GQLEquipment>;
  muscleGroups: Array<Scalars['ID']['input']>;
  name: Scalars['String']['input'];
  substituteIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  videoUrl?: InputMaybe<Scalars['String']['input']>;
};

export type GQLCreateExerciseSetInput = {
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
};

export type GQLCreateNotificationInput = {
  createdBy?: InputMaybe<Scalars['ID']['input']>;
  link?: InputMaybe<Scalars['String']['input']>;
  message: Scalars['String']['input'];
  relatedItemId?: InputMaybe<Scalars['String']['input']>;
  type: GQLNotificationType;
  userId: Scalars['ID']['input'];
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
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
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
  Bodyweight = 'BODYWEIGHT',
  Cable = 'CABLE',
  Dumbbell = 'DUMBBELL',
  Kettlebell = 'KETTLEBELL',
  Machine = 'MACHINE',
  MedicineBall = 'MEDICINE_BALL',
  Other = 'OTHER',
  SmithMachine = 'SMITH_MACHINE',
  TrapBar = 'TRAP_BAR',
  Wheel = 'WHEEL'
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

export enum GQLFitnessLevel {
  Advanced = 'ADVANCED',
  Beginner = 'BEGINNER',
  Expert = 'EXPERT',
  Intermediate = 'INTERMEDIATE'
}

export type GQLGetExercisesResponse = {
  __typename?: 'GetExercisesResponse';
  publicExercises: EntireFieldWrapper<Array<GQLBaseExercise>>;
  trainerExercises: EntireFieldWrapper<Array<GQLBaseExercise>>;
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

export type GQLLogMealFoodInput = {
  barcode?: InputMaybe<Scalars['String']['input']>;
  calories?: InputMaybe<Scalars['Float']['input']>;
  carbs?: InputMaybe<Scalars['Float']['input']>;
  fat?: InputMaybe<Scalars['Float']['input']>;
  fiber?: InputMaybe<Scalars['Float']['input']>;
  mealId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  openFoodFactsId?: InputMaybe<Scalars['String']['input']>;
  plannedFoodId?: InputMaybe<Scalars['ID']['input']>;
  productData?: InputMaybe<Scalars['String']['input']>;
  protein?: InputMaybe<Scalars['Float']['input']>;
  quantity: Scalars['Float']['input'];
  unit: Scalars['String']['input'];
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
  loggedCalories: EntireFieldWrapper<Scalars['Float']['output']>;
  loggedCarbs: EntireFieldWrapper<Scalars['Float']['output']>;
  loggedFat: EntireFieldWrapper<Scalars['Float']['output']>;
  loggedProtein: EntireFieldWrapper<Scalars['Float']['output']>;
  logs: EntireFieldWrapper<Array<GQLMealLog>>;
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
  caloriesPer100g?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  carbsPer100g?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  fatPer100g?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  fiberPer100g?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
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

export type GQLMealLog = {
  __typename?: 'MealLog';
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  items: EntireFieldWrapper<Array<GQLMealLogItem>>;
  loggedAt: EntireFieldWrapper<Scalars['String']['output']>;
  meal?: EntireFieldWrapper<Maybe<GQLMeal>>;
  totalCalories: EntireFieldWrapper<Scalars['Float']['output']>;
  totalCarbs: EntireFieldWrapper<Scalars['Float']['output']>;
  totalFat: EntireFieldWrapper<Scalars['Float']['output']>;
  totalProtein: EntireFieldWrapper<Scalars['Float']['output']>;
  user: EntireFieldWrapper<GQLUserPublic>;
};

export type GQLMealLogItem = {
  __typename?: 'MealLogItem';
  barcode?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  calories?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  carbs?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  fat?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  fiber?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  log?: EntireFieldWrapper<Maybe<GQLMealLog>>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  notes?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  openFoodFactsId?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  plannedFood?: EntireFieldWrapper<Maybe<GQLMealFood>>;
  productData?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  protein?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  quantity: EntireFieldWrapper<Scalars['Float']['output']>;
  unit: EntireFieldWrapper<Scalars['String']['output']>;
};

export type GQLMealPlan = {
  __typename?: 'MealPlan';
  active: EntireFieldWrapper<Scalars['Boolean']['output']>;
  assignedCount: EntireFieldWrapper<Scalars['Int']['output']>;
  assignedTo?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  collaboratorCount: EntireFieldWrapper<Scalars['Int']['output']>;
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

export type GQLMoveExercisesToDayInput = {
  sourceDayId: Scalars['ID']['input'];
  targetDayId: Scalars['ID']['input'];
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
  addAiExerciseToWorkout: EntireFieldWrapper<GQLTrainingExercise>;
  addBodyMeasurement: EntireFieldWrapper<GQLUserBodyMeasure>;
  addExerciseToDay: EntireFieldWrapper<Scalars['ID']['output']>;
  addExercisesToQuickWorkout: EntireFieldWrapper<GQLTrainingPlan>;
  addExercisesToWorkout: EntireFieldWrapper<Array<GQLTrainingExercise>>;
  addMealPlanCollaborator: EntireFieldWrapper<GQLMealPlanCollaborator>;
  addSet: EntireFieldWrapper<GQLExerciseSet>;
  addSetExerciseForm: EntireFieldWrapper<GQLExerciseSet>;
  addSetToExercise: EntireFieldWrapper<Scalars['ID']['output']>;
  addSubstituteExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  addTrainingPlanCollaborator: EntireFieldWrapper<GQLTrainingPlanCollaborator>;
  addTrainingWeek: EntireFieldWrapper<Scalars['ID']['output']>;
  assignMealPlanToClient: EntireFieldWrapper<Scalars['Boolean']['output']>;
  assignTrainingPlanToClient: EntireFieldWrapper<Scalars['Boolean']['output']>;
  cancelCoachingRequest?: EntireFieldWrapper<Maybe<GQLCoachingRequest>>;
  closePlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  createCoachingRequest: EntireFieldWrapper<GQLCoachingRequest>;
  createDraftMealTemplate: EntireFieldWrapper<GQLMealPlan>;
  createDraftTemplate: EntireFieldWrapper<GQLTrainingPlan>;
  createExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  createMealPlan: EntireFieldWrapper<GQLCreateMealPlanPayload>;
  createNote: EntireFieldWrapper<GQLNote>;
  createNotification: EntireFieldWrapper<GQLNotification>;
  createReview: EntireFieldWrapper<Scalars['Boolean']['output']>;
  createTrainingPlan: EntireFieldWrapper<GQLCreateTrainingPlanPayload>;
  deleteBodyMeasurement: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteMealFoodLog: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteNote: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteNotification: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deletePlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteReview: EntireFieldWrapper<Scalars['Boolean']['output']>;
  deleteTrainingPlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  duplicateMealPlan: EntireFieldWrapper<Scalars['ID']['output']>;
  duplicateTrainingPlan: EntireFieldWrapper<Scalars['ID']['output']>;
  duplicateTrainingWeek: EntireFieldWrapper<Scalars['ID']['output']>;
  extendPlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  getAiExerciseSuggestions: EntireFieldWrapper<Array<GQLAiExerciseSuggestion>>;
  logMealFood: EntireFieldWrapper<GQLMealLogItem>;
  logWorkoutProgress: EntireFieldWrapper<Scalars['ID']['output']>;
  logWorkoutSessionEvent: EntireFieldWrapper<Scalars['ID']['output']>;
  markAllNotificationsRead: EntireFieldWrapper<Array<GQLNotification>>;
  markExerciseAsCompleted?: EntireFieldWrapper<Maybe<Scalars['Boolean']['output']>>;
  markNotificationRead: EntireFieldWrapper<GQLNotification>;
  markSetAsCompleted?: EntireFieldWrapper<Maybe<Scalars['Boolean']['output']>>;
  markWorkoutAsCompleted?: EntireFieldWrapper<Maybe<Scalars['Boolean']['output']>>;
  moderateReview: EntireFieldWrapper<Scalars['Boolean']['output']>;
  moveExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  moveExercisesToDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  pausePlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  rejectCoachingRequest?: EntireFieldWrapper<Maybe<GQLCoachingRequest>>;
  removeExerciseFromDay: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeExerciseFromWorkout: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeMealPlanCollaborator: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeMealPlanFromClient: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeSet: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeSetExerciseForm: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeSetFromExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeSubstituteExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeTrainingPlanCollaborator: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeTrainingPlanFromClient: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeTrainingWeek: EntireFieldWrapper<Scalars['Boolean']['output']>;
  removeWeek: EntireFieldWrapper<Scalars['Boolean']['output']>;
  respondToCollaborationInvitation: EntireFieldWrapper<GQLCollaborationInvitation>;
  saveMeal: EntireFieldWrapper<Scalars['Boolean']['output']>;
  sendCollaborationInvitation: EntireFieldWrapper<GQLCollaborationInvitation>;
  swapExercise: EntireFieldWrapper<GQLSubstitute>;
  updateBodyMeasurement: EntireFieldWrapper<GQLUserBodyMeasure>;
  updateExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateExerciseForm: EntireFieldWrapper<GQLTrainingExercise>;
  updateExerciseSet: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateMealFoodLog: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateMealPlanCollaboratorPermission: EntireFieldWrapper<GQLMealPlanCollaborator>;
  updateMealPlanDetails: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateNote: EntireFieldWrapper<GQLNote>;
  updateNotification: EntireFieldWrapper<GQLNotification>;
  updateProfile?: EntireFieldWrapper<Maybe<GQLUserProfile>>;
  updateReview: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateSetLog?: EntireFieldWrapper<Maybe<GQLExerciseSetLog>>;
  updateSubstituteExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingDayData: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingExercise: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingPlan: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingPlanCollaboratorPermission: EntireFieldWrapper<GQLTrainingPlanCollaborator>;
  updateTrainingPlanDetails: EntireFieldWrapper<Scalars['Boolean']['output']>;
  updateTrainingWeekDetails: EntireFieldWrapper<Scalars['Boolean']['output']>;
};


export type GQLMutationAcceptCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationActivatePlanArgs = {
  planId: Scalars['ID']['input'];
  resume: Scalars['Boolean']['input'];
  startDate: Scalars['String']['input'];
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
  exerciseIds: Array<Scalars['ID']['input']>;
};


export type GQLMutationAddExercisesToWorkoutArgs = {
  input: GQLAddExercisesToWorkoutInput;
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


export type GQLMutationCancelCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationClosePlanArgs = {
  planId: Scalars['ID']['input'];
};


export type GQLMutationCreateCoachingRequestArgs = {
  message?: InputMaybe<Scalars['String']['input']>;
  recipientEmail: Scalars['String']['input'];
};


export type GQLMutationCreateExerciseArgs = {
  input: GQLCreateExerciseInput;
};


export type GQLMutationCreateMealPlanArgs = {
  input: GQLCreateMealPlanInput;
};


export type GQLMutationCreateNoteArgs = {
  input: GQLCreateNoteInput;
};


export type GQLMutationCreateNotificationArgs = {
  input: GQLCreateNotificationInput;
};


export type GQLMutationCreateReviewArgs = {
  input: GQLCreateReviewInput;
};


export type GQLMutationCreateTrainingPlanArgs = {
  input: GQLCreateTrainingPlanInput;
};


export type GQLMutationDeleteBodyMeasurementArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationDeleteExerciseArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationDeleteMealFoodLogArgs = {
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


export type GQLMutationGetAiExerciseSuggestionsArgs = {
  dayId: Scalars['ID']['input'];
};


export type GQLMutationLogMealFoodArgs = {
  input: GQLLogMealFoodInput;
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


export type GQLMutationMoveExercisesToDayArgs = {
  input: GQLMoveExercisesToDayInput;
};


export type GQLMutationPausePlanArgs = {
  planId: Scalars['ID']['input'];
};


export type GQLMutationRejectCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationRemoveExerciseFromDayArgs = {
  exerciseId: Scalars['ID']['input'];
};


export type GQLMutationRemoveExerciseFromWorkoutArgs = {
  exerciseId: Scalars['ID']['input'];
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


export type GQLMutationSwapExerciseArgs = {
  exerciseId: Scalars['ID']['input'];
  substituteId: Scalars['ID']['input'];
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


export type GQLMutationUpdateMealFoodLogArgs = {
  input: GQLUpdateMealFoodLogInput;
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
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  relatedTo?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
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

export enum GQLNotificationType {
  CoachingRequest = 'COACHING_REQUEST',
  CoachingRequestAccepted = 'COACHING_REQUEST_ACCEPTED',
  CoachingRequestRejected = 'COACHING_REQUEST_REJECTED',
  CollaborationInvitation = 'COLLABORATION_INVITATION',
  CollaborationResponse = 'COLLABORATION_RESPONSE',
  MealPlanCollaboration = 'MEAL_PLAN_COLLABORATION',
  MealPlanCollaborationRemoved = 'MEAL_PLAN_COLLABORATION_REMOVED',
  Message = 'MESSAGE',
  NewMealPlanAssigned = 'NEW_MEAL_PLAN_ASSIGNED',
  NewTrainingPlanAssigned = 'NEW_TRAINING_PLAN_ASSIGNED',
  Reminder = 'REMINDER',
  System = 'SYSTEM',
  TrainingPlanCollaboration = 'TRAINING_PLAN_COLLABORATION',
  TrainingPlanCollaborationRemoved = 'TRAINING_PLAN_COLLABORATION_REMOVED'
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

export type GQLQuery = {
  __typename?: 'Query';
  bodyMeasures: EntireFieldWrapper<Array<GQLUserBodyMeasure>>;
  clientBodyMeasures: EntireFieldWrapper<Array<GQLUserBodyMeasure>>;
  coachingRequest?: EntireFieldWrapper<Maybe<GQLCoachingRequest>>;
  coachingRequests: EntireFieldWrapper<Array<GQLCoachingRequest>>;
  exercise?: EntireFieldWrapper<Maybe<GQLBaseExercise>>;
  exercisesProgressByUser: EntireFieldWrapper<Array<GQLExerciseProgress>>;
  getClientActiveMealPlan?: EntireFieldWrapper<Maybe<GQLMealPlan>>;
  getClientActivePlan?: EntireFieldWrapper<Maybe<GQLTrainingPlan>>;
  getClientMealPlans: EntireFieldWrapper<Array<GQLMealPlan>>;
  getClientTrainingPlans: EntireFieldWrapper<Array<GQLTrainingPlan>>;
  getCollaborationMealPlanTemplates: EntireFieldWrapper<Array<GQLMealPlan>>;
  getCollaborationTemplates: EntireFieldWrapper<Array<GQLTrainingPlan>>;
  getExercises: EntireFieldWrapper<GQLGetExercisesResponse>;
  getMealPlanById: EntireFieldWrapper<GQLMealPlan>;
  getMealPlanTemplates: EntireFieldWrapper<Array<GQLMealPlan>>;
  getMyMealPlansOverview: EntireFieldWrapper<GQLMyMealPlansPayload>;
  getMyPlansOverview: EntireFieldWrapper<GQLMyPlansPayload>;
  getQuickWorkoutPlan: EntireFieldWrapper<GQLTrainingPlan>;
  getTemplates: EntireFieldWrapper<Array<GQLTrainingPlan>>;
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
  myTrainer?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  myTrainingPlanCollaborations: EntireFieldWrapper<Array<GQLTrainingPlanCollaborator>>;
  note?: EntireFieldWrapper<Maybe<GQLNote>>;
  notes: EntireFieldWrapper<Array<GQLNote>>;
  notification?: EntireFieldWrapper<Maybe<GQLNotification>>;
  notifications: EntireFieldWrapper<Array<GQLNotification>>;
  profile?: EntireFieldWrapper<Maybe<GQLUserProfile>>;
  publicExercises: EntireFieldWrapper<Array<GQLBaseExercise>>;
  sentCollaborationInvitations: EntireFieldWrapper<Array<GQLCollaborationInvitation>>;
  trainingPlanCollaborators: EntireFieldWrapper<Array<GQLTrainingPlanCollaborator>>;
  user?: EntireFieldWrapper<Maybe<GQLUser>>;
  userExercises: EntireFieldWrapper<Array<GQLBaseExercise>>;
  userPublic?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  userWithAllData?: EntireFieldWrapper<Maybe<GQLUser>>;
};


export type GQLQueryClientBodyMeasuresArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLQueryCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryExerciseArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryExercisesProgressByUserArgs = {
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type GQLQueryGetClientActiveMealPlanArgs = {
  clientId: Scalars['ID']['input'];
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


export type GQLQueryGetMealPlanByIdArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryGetMealPlanTemplatesArgs = {
  draft?: InputMaybe<Scalars['Boolean']['input']>;
};


export type GQLQueryGetTemplatesArgs = {
  draft?: InputMaybe<Scalars['Boolean']['input']>;
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


export type GQLQueryTrainingPlanCollaboratorsArgs = {
  trainingPlanId: Scalars['ID']['input'];
};


export type GQLQueryUserExercisesArgs = {
  where?: InputMaybe<GQLExerciseWhereInput>;
};


export type GQLQueryUserPublicArgs = {
  id: Scalars['ID']['input'];
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

export type GQLSaveMealInput = {
  dayId: Scalars['ID']['input'];
  foods: Array<GQLMealFoodInput>;
  hour: Scalars['Int']['input'];
};

export type GQLSendCollaborationInvitationInput = {
  message?: InputMaybe<Scalars['String']['input']>;
  recipientEmail: Scalars['String']['input'];
};

export type GQLSubstitute = {
  __typename?: 'Substitute';
  additionalInstructions?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  baseId?: EntireFieldWrapper<Maybe<Scalars['ID']['output']>>;
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  dayId: EntireFieldWrapper<Scalars['ID']['output']>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  instructions?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  isPublic: EntireFieldWrapper<Scalars['Boolean']['output']>;
  muscleGroups: EntireFieldWrapper<Array<GQLMuscleGroup>>;
  name: EntireFieldWrapper<Scalars['String']['output']>;
  sets: EntireFieldWrapper<Array<GQLExerciseSet>>;
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
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  instructions?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
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
  collaboratorCount: EntireFieldWrapper<Scalars['Int']['output']>;
  completedAt?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  completedWorkoutsDays: EntireFieldWrapper<Scalars['Int']['output']>;
  createdAt: EntireFieldWrapper<Scalars['String']['output']>;
  createdBy?: EntireFieldWrapper<Maybe<GQLUserPublic>>;
  currentWeekNumber?: EntireFieldWrapper<Maybe<Scalars['Int']['output']>>;
  description?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  difficulty?: EntireFieldWrapper<Maybe<GQLDifficulty>>;
  endDate?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  isDemo: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isDraft: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isPublic: EntireFieldWrapper<Scalars['Boolean']['output']>;
  isTemplate: EntireFieldWrapper<Scalars['Boolean']['output']>;
  lastSessionActivity?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  nextSession?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  progress?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  rating?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  reviews: EntireFieldWrapper<Array<GQLReview>>;
  startDate?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
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
  muscleGroups: Array<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
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

export type GQLUpdateMealFoodLogInput = {
  id: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['Float']['input']>;
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
  email?: InputMaybe<Scalars['String']['input']>;
  firstName?: InputMaybe<Scalars['String']['input']>;
  fitnessLevel?: InputMaybe<GQLFitnessLevel>;
  goals?: InputMaybe<Array<GQLGoal>>;
  height?: InputMaybe<Scalars['Float']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  sex?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
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
  id: Scalars['ID']['input'];
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type GQLUpdateTrainingPlanInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  difficulty?: InputMaybe<GQLDifficulty>;
  id: Scalars['ID']['input'];
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
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
  email?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  firstName?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  fitnessLevel?: EntireFieldWrapper<Maybe<GQLFitnessLevel>>;
  goals: EntireFieldWrapper<Array<GQLGoal>>;
  height?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
  id: EntireFieldWrapper<Scalars['ID']['output']>;
  lastName?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  phone?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  sex?: EntireFieldWrapper<Maybe<Scalars['String']['output']>>;
  updatedAt: EntireFieldWrapper<Scalars['String']['output']>;
  weight?: EntireFieldWrapper<Maybe<Scalars['Float']['output']>>;
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

export type GQLVolumeEntry = {
  __typename?: 'VolumeEntry';
  totalSets: EntireFieldWrapper<Scalars['Int']['output']>;
  totalVolume: EntireFieldWrapper<Scalars['Float']['output']>;
  week: EntireFieldWrapper<Scalars['String']['output']>;
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
  AddMealPlanCollaboratorInput: GQLAddMealPlanCollaboratorInput;
  AddSetExerciseFormInput: GQLAddSetExerciseFormInput;
  AddSetExerciseFormSetInput: GQLAddSetExerciseFormSetInput;
  AddSetToExerciseInput: GQLAddSetToExerciseInput;
  AddSubstituteExerciseInput: GQLAddSubstituteExerciseInput;
  AddTrainingPlanCollaboratorInput: GQLAddTrainingPlanCollaboratorInput;
  AddTrainingWeekInput: GQLAddTrainingWeekInput;
  AiExerciseSuggestion: ResolverTypeWrapper<GQLAiExerciseSuggestion>;
  AiMeta: ResolverTypeWrapper<GQLAiMeta>;
  AssignMealPlanToClientInput: GQLAssignMealPlanToClientInput;
  AssignTrainingPlanToClientInput: GQLAssignTrainingPlanToClientInput;
  BaseExercise: ResolverTypeWrapper<GQLBaseExercise>;
  BaseExerciseSubstitute: ResolverTypeWrapper<GQLBaseExerciseSubstitute>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  CoachingRequest: ResolverTypeWrapper<GQLCoachingRequest>;
  CoachingRequestStatus: GQLCoachingRequestStatus;
  CollaborationInvitation: ResolverTypeWrapper<GQLCollaborationInvitation>;
  CollaborationInvitationAction: GQLCollaborationInvitationAction;
  CollaborationInvitationStatus: GQLCollaborationInvitationStatus;
  CollaborationPermission: GQLCollaborationPermission;
  CreateExerciseInput: GQLCreateExerciseInput;
  CreateExerciseSetInput: GQLCreateExerciseSetInput;
  CreateMealDayInput: GQLCreateMealDayInput;
  CreateMealFoodInput: GQLCreateMealFoodInput;
  CreateMealInput: GQLCreateMealInput;
  CreateMealPlanInput: GQLCreateMealPlanInput;
  CreateMealPlanPayload: ResolverTypeWrapper<GQLCreateMealPlanPayload>;
  CreateMealWeekInput: GQLCreateMealWeekInput;
  CreateNoteInput: GQLCreateNoteInput;
  CreateNotificationInput: GQLCreateNotificationInput;
  CreateReviewInput: GQLCreateReviewInput;
  CreateTrainingDayInput: GQLCreateTrainingDayInput;
  CreateTrainingExerciseInput: GQLCreateTrainingExerciseInput;
  CreateTrainingPlanInput: GQLCreateTrainingPlanInput;
  CreateTrainingPlanPayload: ResolverTypeWrapper<GQLCreateTrainingPlanPayload>;
  CreateTrainingWeekInput: GQLCreateTrainingWeekInput;
  DeleteReviewInput: GQLDeleteReviewInput;
  Difficulty: GQLDifficulty;
  DuplicateTrainingWeekInput: GQLDuplicateTrainingWeekInput;
  Equipment: GQLEquipment;
  ExerciseLog: ResolverTypeWrapper<GQLExerciseLog>;
  ExerciseProgress: ResolverTypeWrapper<GQLExerciseProgress>;
  ExerciseSet: ResolverTypeWrapper<GQLExerciseSet>;
  ExerciseSetLog: ResolverTypeWrapper<GQLExerciseSetLog>;
  ExerciseType: GQLExerciseType;
  ExerciseWhereInput: GQLExerciseWhereInput;
  FitnessLevel: GQLFitnessLevel;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  GetExercisesResponse: ResolverTypeWrapper<GQLGetExercisesResponse>;
  GetWorkoutPayload: ResolverTypeWrapper<GQLGetWorkoutPayload>;
  Goal: GQLGoal;
  ID: ResolverTypeWrapper<Scalars['ID']['output']>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LogMealFoodInput: GQLLogMealFoodInput;
  LogSetInput: GQLLogSetInput;
  Meal: ResolverTypeWrapper<GQLMeal>;
  MealDay: ResolverTypeWrapper<GQLMealDay>;
  MealFood: ResolverTypeWrapper<GQLMealFood>;
  MealFoodInput: GQLMealFoodInput;
  MealLog: ResolverTypeWrapper<GQLMealLog>;
  MealLogItem: ResolverTypeWrapper<GQLMealLogItem>;
  MealPlan: ResolverTypeWrapper<GQLMealPlan>;
  MealPlanCollaborator: ResolverTypeWrapper<GQLMealPlanCollaborator>;
  MealWeek: ResolverTypeWrapper<GQLMealWeek>;
  ModerateReviewInput: GQLModerateReviewInput;
  MoveExerciseInput: GQLMoveExerciseInput;
  MoveExercisesToDayInput: GQLMoveExercisesToDayInput;
  MuscleGroup: ResolverTypeWrapper<GQLMuscleGroup>;
  MuscleGroupCategory: ResolverTypeWrapper<GQLMuscleGroupCategory>;
  Mutation: ResolverTypeWrapper<{}>;
  MyMealPlansPayload: ResolverTypeWrapper<GQLMyMealPlansPayload>;
  MyPlansPayload: ResolverTypeWrapper<GQLMyPlansPayload>;
  Note: ResolverTypeWrapper<GQLNote>;
  Notification: ResolverTypeWrapper<GQLNotification>;
  NotificationType: GQLNotificationType;
  OneRmEntry: ResolverTypeWrapper<GQLOneRmEntry>;
  OneRmLog: ResolverTypeWrapper<GQLOneRmLog>;
  Query: ResolverTypeWrapper<{}>;
  RemoveMealPlanCollaboratorInput: GQLRemoveMealPlanCollaboratorInput;
  RemoveSubstituteExerciseInput: GQLRemoveSubstituteExerciseInput;
  RemoveTrainingPlanCollaboratorInput: GQLRemoveTrainingPlanCollaboratorInput;
  RespondToCollaborationInvitationInput: GQLRespondToCollaborationInvitationInput;
  Review: ResolverTypeWrapper<GQLReview>;
  SaveMealInput: GQLSaveMealInput;
  SendCollaborationInvitationInput: GQLSendCollaborationInvitationInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  Substitute: ResolverTypeWrapper<GQLSubstitute>;
  SuggestedSets: ResolverTypeWrapper<GQLSuggestedSets>;
  SuggestedSetsInput: GQLSuggestedSetsInput;
  TrainingDay: ResolverTypeWrapper<GQLTrainingDay>;
  TrainingExercise: ResolverTypeWrapper<GQLTrainingExercise>;
  TrainingPlan: ResolverTypeWrapper<GQLTrainingPlan>;
  TrainingPlanCollaborator: ResolverTypeWrapper<GQLTrainingPlanCollaborator>;
  TrainingWeek: ResolverTypeWrapper<GQLTrainingWeek>;
  UpdateBodyMeasurementInput: GQLUpdateBodyMeasurementInput;
  UpdateExerciseFormInput: GQLUpdateExerciseFormInput;
  UpdateExerciseInput: GQLUpdateExerciseInput;
  UpdateExerciseSetFormInput: GQLUpdateExerciseSetFormInput;
  UpdateExerciseSetInput: GQLUpdateExerciseSetInput;
  UpdateMealFoodLogInput: GQLUpdateMealFoodLogInput;
  UpdateMealPlanCollaboratorPermissionInput: GQLUpdateMealPlanCollaboratorPermissionInput;
  UpdateMealPlanDetailsInput: GQLUpdateMealPlanDetailsInput;
  UpdateNoteInput: GQLUpdateNoteInput;
  UpdateNotificationInput: GQLUpdateNotificationInput;
  UpdateProfileInput: GQLUpdateProfileInput;
  UpdateReviewInput: GQLUpdateReviewInput;
  UpdateSubstituteExerciseInput: GQLUpdateSubstituteExerciseInput;
  UpdateTrainingDayDataInput: GQLUpdateTrainingDayDataInput;
  UpdateTrainingDayInput: GQLUpdateTrainingDayInput;
  UpdateTrainingExerciseInput: GQLUpdateTrainingExerciseInput;
  UpdateTrainingPlanCollaboratorPermissionInput: GQLUpdateTrainingPlanCollaboratorPermissionInput;
  UpdateTrainingPlanDetailsInput: GQLUpdateTrainingPlanDetailsInput;
  UpdateTrainingPlanInput: GQLUpdateTrainingPlanInput;
  UpdateTrainingWeekDetailsInput: GQLUpdateTrainingWeekDetailsInput;
  UpdateTrainingWeekInput: GQLUpdateTrainingWeekInput;
  User: ResolverTypeWrapper<GQLUser>;
  UserBodyMeasure: ResolverTypeWrapper<GQLUserBodyMeasure>;
  UserProfile: ResolverTypeWrapper<GQLUserProfile>;
  UserPublic: ResolverTypeWrapper<GQLUserPublic>;
  UserRole: GQLUserRole;
  UserSession: ResolverTypeWrapper<GQLUserSession>;
  VolumeEntry: ResolverTypeWrapper<GQLVolumeEntry>;
  WorkoutSessionEvent: GQLWorkoutSessionEvent;
  WorkoutType: GQLWorkoutType;
};

/** Mapping between all available schema types and the resolvers parents */
export type GQLResolversParentTypes = {
  AddAiExerciseToWorkoutInput: GQLAddAiExerciseToWorkoutInput;
  AddBodyMeasurementInput: GQLAddBodyMeasurementInput;
  AddExerciseToDayInput: GQLAddExerciseToDayInput;
  AddExercisesToWorkoutInput: GQLAddExercisesToWorkoutInput;
  AddMealPlanCollaboratorInput: GQLAddMealPlanCollaboratorInput;
  AddSetExerciseFormInput: GQLAddSetExerciseFormInput;
  AddSetExerciseFormSetInput: GQLAddSetExerciseFormSetInput;
  AddSetToExerciseInput: GQLAddSetToExerciseInput;
  AddSubstituteExerciseInput: GQLAddSubstituteExerciseInput;
  AddTrainingPlanCollaboratorInput: GQLAddTrainingPlanCollaboratorInput;
  AddTrainingWeekInput: GQLAddTrainingWeekInput;
  AiExerciseSuggestion: GQLAiExerciseSuggestion;
  AiMeta: GQLAiMeta;
  AssignMealPlanToClientInput: GQLAssignMealPlanToClientInput;
  AssignTrainingPlanToClientInput: GQLAssignTrainingPlanToClientInput;
  BaseExercise: GQLBaseExercise;
  BaseExerciseSubstitute: GQLBaseExerciseSubstitute;
  Boolean: Scalars['Boolean']['output'];
  CoachingRequest: GQLCoachingRequest;
  CollaborationInvitation: GQLCollaborationInvitation;
  CreateExerciseInput: GQLCreateExerciseInput;
  CreateExerciseSetInput: GQLCreateExerciseSetInput;
  CreateMealDayInput: GQLCreateMealDayInput;
  CreateMealFoodInput: GQLCreateMealFoodInput;
  CreateMealInput: GQLCreateMealInput;
  CreateMealPlanInput: GQLCreateMealPlanInput;
  CreateMealPlanPayload: GQLCreateMealPlanPayload;
  CreateMealWeekInput: GQLCreateMealWeekInput;
  CreateNoteInput: GQLCreateNoteInput;
  CreateNotificationInput: GQLCreateNotificationInput;
  CreateReviewInput: GQLCreateReviewInput;
  CreateTrainingDayInput: GQLCreateTrainingDayInput;
  CreateTrainingExerciseInput: GQLCreateTrainingExerciseInput;
  CreateTrainingPlanInput: GQLCreateTrainingPlanInput;
  CreateTrainingPlanPayload: GQLCreateTrainingPlanPayload;
  CreateTrainingWeekInput: GQLCreateTrainingWeekInput;
  DeleteReviewInput: GQLDeleteReviewInput;
  DuplicateTrainingWeekInput: GQLDuplicateTrainingWeekInput;
  ExerciseLog: GQLExerciseLog;
  ExerciseProgress: GQLExerciseProgress;
  ExerciseSet: GQLExerciseSet;
  ExerciseSetLog: GQLExerciseSetLog;
  ExerciseWhereInput: GQLExerciseWhereInput;
  Float: Scalars['Float']['output'];
  GetExercisesResponse: GQLGetExercisesResponse;
  GetWorkoutPayload: GQLGetWorkoutPayload;
  ID: Scalars['ID']['output'];
  Int: Scalars['Int']['output'];
  LogMealFoodInput: GQLLogMealFoodInput;
  LogSetInput: GQLLogSetInput;
  Meal: GQLMeal;
  MealDay: GQLMealDay;
  MealFood: GQLMealFood;
  MealFoodInput: GQLMealFoodInput;
  MealLog: GQLMealLog;
  MealLogItem: GQLMealLogItem;
  MealPlan: GQLMealPlan;
  MealPlanCollaborator: GQLMealPlanCollaborator;
  MealWeek: GQLMealWeek;
  ModerateReviewInput: GQLModerateReviewInput;
  MoveExerciseInput: GQLMoveExerciseInput;
  MoveExercisesToDayInput: GQLMoveExercisesToDayInput;
  MuscleGroup: GQLMuscleGroup;
  MuscleGroupCategory: GQLMuscleGroupCategory;
  Mutation: {};
  MyMealPlansPayload: GQLMyMealPlansPayload;
  MyPlansPayload: GQLMyPlansPayload;
  Note: GQLNote;
  Notification: GQLNotification;
  OneRmEntry: GQLOneRmEntry;
  OneRmLog: GQLOneRmLog;
  Query: {};
  RemoveMealPlanCollaboratorInput: GQLRemoveMealPlanCollaboratorInput;
  RemoveSubstituteExerciseInput: GQLRemoveSubstituteExerciseInput;
  RemoveTrainingPlanCollaboratorInput: GQLRemoveTrainingPlanCollaboratorInput;
  RespondToCollaborationInvitationInput: GQLRespondToCollaborationInvitationInput;
  Review: GQLReview;
  SaveMealInput: GQLSaveMealInput;
  SendCollaborationInvitationInput: GQLSendCollaborationInvitationInput;
  String: Scalars['String']['output'];
  Substitute: GQLSubstitute;
  SuggestedSets: GQLSuggestedSets;
  SuggestedSetsInput: GQLSuggestedSetsInput;
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
  UpdateMealFoodLogInput: GQLUpdateMealFoodLogInput;
  UpdateMealPlanCollaboratorPermissionInput: GQLUpdateMealPlanCollaboratorPermissionInput;
  UpdateMealPlanDetailsInput: GQLUpdateMealPlanDetailsInput;
  UpdateNoteInput: GQLUpdateNoteInput;
  UpdateNotificationInput: GQLUpdateNotificationInput;
  UpdateProfileInput: GQLUpdateProfileInput;
  UpdateReviewInput: GQLUpdateReviewInput;
  UpdateSubstituteExerciseInput: GQLUpdateSubstituteExerciseInput;
  UpdateTrainingDayDataInput: GQLUpdateTrainingDayDataInput;
  UpdateTrainingDayInput: GQLUpdateTrainingDayInput;
  UpdateTrainingExerciseInput: GQLUpdateTrainingExerciseInput;
  UpdateTrainingPlanCollaboratorPermissionInput: GQLUpdateTrainingPlanCollaboratorPermissionInput;
  UpdateTrainingPlanDetailsInput: GQLUpdateTrainingPlanDetailsInput;
  UpdateTrainingPlanInput: GQLUpdateTrainingPlanInput;
  UpdateTrainingWeekDetailsInput: GQLUpdateTrainingWeekDetailsInput;
  UpdateTrainingWeekInput: GQLUpdateTrainingWeekInput;
  User: GQLUser;
  UserBodyMeasure: GQLUserBodyMeasure;
  UserProfile: GQLUserProfile;
  UserPublic: GQLUserPublic;
  UserSession: GQLUserSession;
  VolumeEntry: GQLVolumeEntry;
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

export type GQLBaseExerciseResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['BaseExercise'] = GQLResolversParentTypes['BaseExercise']> = {
  additionalInstructions?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  canBeSubstitutedBy?: Resolver<Array<GQLResolversTypes['BaseExerciseSubstitute']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  equipment?: Resolver<Maybe<GQLResolversTypes['Equipment']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isPublic?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  muscleGroupCategories?: Resolver<Array<GQLResolversTypes['MuscleGroupCategory']>, ParentType, ContextType>;
  muscleGroups?: Resolver<Array<GQLResolversTypes['MuscleGroup']>, ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  substitutes?: Resolver<Array<GQLResolversTypes['BaseExerciseSubstitute']>, ParentType, ContextType>;
  type?: Resolver<Maybe<GQLResolversTypes['ExerciseType']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
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

export type GQLGetExercisesResponseResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['GetExercisesResponse'] = GQLResolversParentTypes['GetExercisesResponse']> = {
  publicExercises?: Resolver<Array<GQLResolversTypes['BaseExercise']>, ParentType, ContextType>;
  trainerExercises?: Resolver<Array<GQLResolversTypes['BaseExercise']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLGetWorkoutPayloadResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['GetWorkoutPayload'] = GQLResolversParentTypes['GetWorkoutPayload']> = {
  plan?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMealResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Meal'] = GQLResolversParentTypes['Meal']> = {
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  dateTime?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  day?: Resolver<Maybe<GQLResolversTypes['MealDay']>, ParentType, ContextType>;
  foods?: Resolver<Array<GQLResolversTypes['MealFood']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  instructions?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  loggedCalories?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  loggedCarbs?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  loggedFat?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  loggedProtein?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  logs?: Resolver<Array<GQLResolversTypes['MealLog']>, ParentType, ContextType>;
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
  caloriesPer100g?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  carbsPer100g?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  fatPer100g?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  fiberPer100g?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
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

export type GQLMealLogResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MealLog'] = GQLResolversParentTypes['MealLog']> = {
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  items?: Resolver<Array<GQLResolversTypes['MealLogItem']>, ParentType, ContextType>;
  loggedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  meal?: Resolver<Maybe<GQLResolversTypes['Meal']>, ParentType, ContextType>;
  totalCalories?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  totalCarbs?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  totalFat?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  totalProtein?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  user?: Resolver<GQLResolversTypes['UserPublic'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMealLogItemResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MealLogItem'] = GQLResolversParentTypes['MealLogItem']> = {
  barcode?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  calories?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  carbs?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  fat?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  fiber?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  log?: Resolver<Maybe<GQLResolversTypes['MealLog']>, ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  notes?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  openFoodFactsId?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  plannedFood?: Resolver<Maybe<GQLResolversTypes['MealFood']>, ParentType, ContextType>;
  productData?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  protein?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  quantity?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  unit?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLMealPlanResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['MealPlan'] = GQLResolversParentTypes['MealPlan']> = {
  active?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  assignedCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  assignedTo?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  collaboratorCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
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
  addAiExerciseToWorkout?: Resolver<GQLResolversTypes['TrainingExercise'], ParentType, ContextType, RequireFields<GQLMutationAddAiExerciseToWorkoutArgs, 'input'>>;
  addBodyMeasurement?: Resolver<GQLResolversTypes['UserBodyMeasure'], ParentType, ContextType, RequireFields<GQLMutationAddBodyMeasurementArgs, 'input'>>;
  addExerciseToDay?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationAddExerciseToDayArgs, 'input'>>;
  addExercisesToQuickWorkout?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType, RequireFields<GQLMutationAddExercisesToQuickWorkoutArgs, 'exerciseIds'>>;
  addExercisesToWorkout?: Resolver<Array<GQLResolversTypes['TrainingExercise']>, ParentType, ContextType, RequireFields<GQLMutationAddExercisesToWorkoutArgs, 'input'>>;
  addMealPlanCollaborator?: Resolver<GQLResolversTypes['MealPlanCollaborator'], ParentType, ContextType, RequireFields<GQLMutationAddMealPlanCollaboratorArgs, 'input'>>;
  addSet?: Resolver<GQLResolversTypes['ExerciseSet'], ParentType, ContextType, RequireFields<GQLMutationAddSetArgs, 'exerciseId'>>;
  addSetExerciseForm?: Resolver<GQLResolversTypes['ExerciseSet'], ParentType, ContextType, RequireFields<GQLMutationAddSetExerciseFormArgs, 'input'>>;
  addSetToExercise?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationAddSetToExerciseArgs, 'input'>>;
  addSubstituteExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationAddSubstituteExerciseArgs, 'input'>>;
  addTrainingPlanCollaborator?: Resolver<GQLResolversTypes['TrainingPlanCollaborator'], ParentType, ContextType, RequireFields<GQLMutationAddTrainingPlanCollaboratorArgs, 'input'>>;
  addTrainingWeek?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationAddTrainingWeekArgs, 'input'>>;
  assignMealPlanToClient?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationAssignMealPlanToClientArgs, 'input'>>;
  assignTrainingPlanToClient?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationAssignTrainingPlanToClientArgs, 'input'>>;
  cancelCoachingRequest?: Resolver<Maybe<GQLResolversTypes['CoachingRequest']>, ParentType, ContextType, RequireFields<GQLMutationCancelCoachingRequestArgs, 'id'>>;
  closePlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationClosePlanArgs, 'planId'>>;
  createCoachingRequest?: Resolver<GQLResolversTypes['CoachingRequest'], ParentType, ContextType, RequireFields<GQLMutationCreateCoachingRequestArgs, 'recipientEmail'>>;
  createDraftMealTemplate?: Resolver<GQLResolversTypes['MealPlan'], ParentType, ContextType>;
  createDraftTemplate?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType>;
  createExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationCreateExerciseArgs, 'input'>>;
  createMealPlan?: Resolver<GQLResolversTypes['CreateMealPlanPayload'], ParentType, ContextType, RequireFields<GQLMutationCreateMealPlanArgs, 'input'>>;
  createNote?: Resolver<GQLResolversTypes['Note'], ParentType, ContextType, RequireFields<GQLMutationCreateNoteArgs, 'input'>>;
  createNotification?: Resolver<GQLResolversTypes['Notification'], ParentType, ContextType, RequireFields<GQLMutationCreateNotificationArgs, 'input'>>;
  createReview?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationCreateReviewArgs, 'input'>>;
  createTrainingPlan?: Resolver<GQLResolversTypes['CreateTrainingPlanPayload'], ParentType, ContextType, RequireFields<GQLMutationCreateTrainingPlanArgs, 'input'>>;
  deleteBodyMeasurement?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteBodyMeasurementArgs, 'id'>>;
  deleteExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteExerciseArgs, 'id'>>;
  deleteMealFoodLog?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteMealFoodLogArgs, 'id'>>;
  deleteNote?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteNoteArgs, 'id'>>;
  deleteNotification?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteNotificationArgs, 'id'>>;
  deletePlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeletePlanArgs, 'planId'>>;
  deleteReview?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteReviewArgs, 'input'>>;
  deleteTrainingPlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationDeleteTrainingPlanArgs, 'id'>>;
  duplicateMealPlan?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationDuplicateMealPlanArgs, 'id'>>;
  duplicateTrainingPlan?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationDuplicateTrainingPlanArgs, 'id'>>;
  duplicateTrainingWeek?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationDuplicateTrainingWeekArgs, 'input'>>;
  extendPlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationExtendPlanArgs, 'planId' | 'weeks'>>;
  getAiExerciseSuggestions?: Resolver<Array<GQLResolversTypes['AiExerciseSuggestion']>, ParentType, ContextType, RequireFields<GQLMutationGetAiExerciseSuggestionsArgs, 'dayId'>>;
  logMealFood?: Resolver<GQLResolversTypes['MealLogItem'], ParentType, ContextType, RequireFields<GQLMutationLogMealFoodArgs, 'input'>>;
  logWorkoutProgress?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationLogWorkoutProgressArgs, 'dayId' | 'tick'>>;
  logWorkoutSessionEvent?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType, RequireFields<GQLMutationLogWorkoutSessionEventArgs, 'dayId' | 'event'>>;
  markAllNotificationsRead?: Resolver<Array<GQLResolversTypes['Notification']>, ParentType, ContextType, RequireFields<GQLMutationMarkAllNotificationsReadArgs, 'userId'>>;
  markExerciseAsCompleted?: Resolver<Maybe<GQLResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<GQLMutationMarkExerciseAsCompletedArgs, 'completed' | 'exerciseId'>>;
  markNotificationRead?: Resolver<GQLResolversTypes['Notification'], ParentType, ContextType, RequireFields<GQLMutationMarkNotificationReadArgs, 'id'>>;
  markSetAsCompleted?: Resolver<Maybe<GQLResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<GQLMutationMarkSetAsCompletedArgs, 'completed' | 'setId'>>;
  markWorkoutAsCompleted?: Resolver<Maybe<GQLResolversTypes['Boolean']>, ParentType, ContextType, RequireFields<GQLMutationMarkWorkoutAsCompletedArgs, 'dayId'>>;
  moderateReview?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationModerateReviewArgs, 'input'>>;
  moveExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationMoveExerciseArgs, 'input'>>;
  moveExercisesToDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationMoveExercisesToDayArgs, 'input'>>;
  pausePlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationPausePlanArgs, 'planId'>>;
  rejectCoachingRequest?: Resolver<Maybe<GQLResolversTypes['CoachingRequest']>, ParentType, ContextType, RequireFields<GQLMutationRejectCoachingRequestArgs, 'id'>>;
  removeExerciseFromDay?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveExerciseFromDayArgs, 'exerciseId'>>;
  removeExerciseFromWorkout?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveExerciseFromWorkoutArgs, 'exerciseId'>>;
  removeMealPlanCollaborator?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveMealPlanCollaboratorArgs, 'input'>>;
  removeMealPlanFromClient?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveMealPlanFromClientArgs, 'clientId' | 'planId'>>;
  removeSet?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveSetArgs, 'setId'>>;
  removeSetExerciseForm?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveSetExerciseFormArgs, 'setId'>>;
  removeSetFromExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveSetFromExerciseArgs, 'setId'>>;
  removeSubstituteExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveSubstituteExerciseArgs, 'input'>>;
  removeTrainingPlanCollaborator?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveTrainingPlanCollaboratorArgs, 'input'>>;
  removeTrainingPlanFromClient?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveTrainingPlanFromClientArgs, 'clientId' | 'planId'>>;
  removeTrainingWeek?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveTrainingWeekArgs, 'weekId'>>;
  removeWeek?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationRemoveWeekArgs, 'planId' | 'weekId'>>;
  respondToCollaborationInvitation?: Resolver<GQLResolversTypes['CollaborationInvitation'], ParentType, ContextType, RequireFields<GQLMutationRespondToCollaborationInvitationArgs, 'input'>>;
  saveMeal?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationSaveMealArgs, 'input'>>;
  sendCollaborationInvitation?: Resolver<GQLResolversTypes['CollaborationInvitation'], ParentType, ContextType, RequireFields<GQLMutationSendCollaborationInvitationArgs, 'input'>>;
  swapExercise?: Resolver<GQLResolversTypes['Substitute'], ParentType, ContextType, RequireFields<GQLMutationSwapExerciseArgs, 'exerciseId' | 'substituteId'>>;
  updateBodyMeasurement?: Resolver<GQLResolversTypes['UserBodyMeasure'], ParentType, ContextType, RequireFields<GQLMutationUpdateBodyMeasurementArgs, 'input'>>;
  updateExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateExerciseArgs, 'id' | 'input'>>;
  updateExerciseForm?: Resolver<GQLResolversTypes['TrainingExercise'], ParentType, ContextType, RequireFields<GQLMutationUpdateExerciseFormArgs, 'input'>>;
  updateExerciseSet?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateExerciseSetArgs, 'input'>>;
  updateMealFoodLog?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateMealFoodLogArgs, 'input'>>;
  updateMealPlanCollaboratorPermission?: Resolver<GQLResolversTypes['MealPlanCollaborator'], ParentType, ContextType, RequireFields<GQLMutationUpdateMealPlanCollaboratorPermissionArgs, 'input'>>;
  updateMealPlanDetails?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateMealPlanDetailsArgs, 'input'>>;
  updateNote?: Resolver<GQLResolversTypes['Note'], ParentType, ContextType, RequireFields<GQLMutationUpdateNoteArgs, 'input'>>;
  updateNotification?: Resolver<GQLResolversTypes['Notification'], ParentType, ContextType, RequireFields<GQLMutationUpdateNotificationArgs, 'input'>>;
  updateProfile?: Resolver<Maybe<GQLResolversTypes['UserProfile']>, ParentType, ContextType, RequireFields<GQLMutationUpdateProfileArgs, 'input'>>;
  updateReview?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateReviewArgs, 'input'>>;
  updateSetLog?: Resolver<Maybe<GQLResolversTypes['ExerciseSetLog']>, ParentType, ContextType, RequireFields<GQLMutationUpdateSetLogArgs, 'input'>>;
  updateSubstituteExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateSubstituteExerciseArgs, 'input'>>;
  updateTrainingDayData?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingDayDataArgs, 'input'>>;
  updateTrainingExercise?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingExerciseArgs, 'input'>>;
  updateTrainingPlan?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingPlanArgs, 'input'>>;
  updateTrainingPlanCollaboratorPermission?: Resolver<GQLResolversTypes['TrainingPlanCollaborator'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingPlanCollaboratorPermissionArgs, 'input'>>;
  updateTrainingPlanDetails?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingPlanDetailsArgs, 'input'>>;
  updateTrainingWeekDetails?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType, RequireFields<GQLMutationUpdateTrainingWeekDetailsArgs, 'input'>>;
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
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  relatedTo?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
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

export type GQLQueryResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Query'] = GQLResolversParentTypes['Query']> = {
  bodyMeasures?: Resolver<Array<GQLResolversTypes['UserBodyMeasure']>, ParentType, ContextType>;
  clientBodyMeasures?: Resolver<Array<GQLResolversTypes['UserBodyMeasure']>, ParentType, ContextType, RequireFields<GQLQueryClientBodyMeasuresArgs, 'clientId'>>;
  coachingRequest?: Resolver<Maybe<GQLResolversTypes['CoachingRequest']>, ParentType, ContextType, RequireFields<GQLQueryCoachingRequestArgs, 'id'>>;
  coachingRequests?: Resolver<Array<GQLResolversTypes['CoachingRequest']>, ParentType, ContextType>;
  exercise?: Resolver<Maybe<GQLResolversTypes['BaseExercise']>, ParentType, ContextType, RequireFields<GQLQueryExerciseArgs, 'id'>>;
  exercisesProgressByUser?: Resolver<Array<GQLResolversTypes['ExerciseProgress']>, ParentType, ContextType, Partial<GQLQueryExercisesProgressByUserArgs>>;
  getClientActiveMealPlan?: Resolver<Maybe<GQLResolversTypes['MealPlan']>, ParentType, ContextType, RequireFields<GQLQueryGetClientActiveMealPlanArgs, 'clientId'>>;
  getClientActivePlan?: Resolver<Maybe<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType, RequireFields<GQLQueryGetClientActivePlanArgs, 'clientId'>>;
  getClientMealPlans?: Resolver<Array<GQLResolversTypes['MealPlan']>, ParentType, ContextType, RequireFields<GQLQueryGetClientMealPlansArgs, 'clientId'>>;
  getClientTrainingPlans?: Resolver<Array<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType, RequireFields<GQLQueryGetClientTrainingPlansArgs, 'clientId'>>;
  getCollaborationMealPlanTemplates?: Resolver<Array<GQLResolversTypes['MealPlan']>, ParentType, ContextType, Partial<GQLQueryGetCollaborationMealPlanTemplatesArgs>>;
  getCollaborationTemplates?: Resolver<Array<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType, Partial<GQLQueryGetCollaborationTemplatesArgs>>;
  getExercises?: Resolver<GQLResolversTypes['GetExercisesResponse'], ParentType, ContextType>;
  getMealPlanById?: Resolver<GQLResolversTypes['MealPlan'], ParentType, ContextType, RequireFields<GQLQueryGetMealPlanByIdArgs, 'id'>>;
  getMealPlanTemplates?: Resolver<Array<GQLResolversTypes['MealPlan']>, ParentType, ContextType, Partial<GQLQueryGetMealPlanTemplatesArgs>>;
  getMyMealPlansOverview?: Resolver<GQLResolversTypes['MyMealPlansPayload'], ParentType, ContextType>;
  getMyPlansOverview?: Resolver<GQLResolversTypes['MyPlansPayload'], ParentType, ContextType>;
  getQuickWorkoutPlan?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType>;
  getTemplates?: Resolver<Array<GQLResolversTypes['TrainingPlan']>, ParentType, ContextType, Partial<GQLQueryGetTemplatesArgs>>;
  getTrainingExercise?: Resolver<Maybe<GQLResolversTypes['TrainingExercise']>, ParentType, ContextType, RequireFields<GQLQueryGetTrainingExerciseArgs, 'id'>>;
  getTrainingPlanById?: Resolver<GQLResolversTypes['TrainingPlan'], ParentType, ContextType, RequireFields<GQLQueryGetTrainingPlanByIdArgs, 'id'>>;
  getWorkout?: Resolver<Maybe<GQLResolversTypes['GetWorkoutPayload']>, ParentType, ContextType, Partial<GQLQueryGetWorkoutArgs>>;
  getWorkoutInfo?: Resolver<GQLResolversTypes['TrainingDay'], ParentType, ContextType, RequireFields<GQLQueryGetWorkoutInfoArgs, 'dayId'>>;
  mealPlanCollaborators?: Resolver<Array<GQLResolversTypes['MealPlanCollaborator']>, ParentType, ContextType, RequireFields<GQLQueryMealPlanCollaboratorsArgs, 'mealPlanId'>>;
  muscleGroupCategories?: Resolver<Array<GQLResolversTypes['MuscleGroupCategory']>, ParentType, ContextType>;
  muscleGroupCategory?: Resolver<GQLResolversTypes['MuscleGroupCategory'], ParentType, ContextType, RequireFields<GQLQueryMuscleGroupCategoryArgs, 'id'>>;
  myClients?: Resolver<Array<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  myCollaborationInvitations?: Resolver<Array<GQLResolversTypes['CollaborationInvitation']>, ParentType, ContextType>;
  myMealPlanCollaborations?: Resolver<Array<GQLResolversTypes['MealPlanCollaborator']>, ParentType, ContextType>;
  myTrainer?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  myTrainingPlanCollaborations?: Resolver<Array<GQLResolversTypes['TrainingPlanCollaborator']>, ParentType, ContextType>;
  note?: Resolver<Maybe<GQLResolversTypes['Note']>, ParentType, ContextType, RequireFields<GQLQueryNoteArgs, 'id'>>;
  notes?: Resolver<Array<GQLResolversTypes['Note']>, ParentType, ContextType, Partial<GQLQueryNotesArgs>>;
  notification?: Resolver<Maybe<GQLResolversTypes['Notification']>, ParentType, ContextType, RequireFields<GQLQueryNotificationArgs, 'id'>>;
  notifications?: Resolver<Array<GQLResolversTypes['Notification']>, ParentType, ContextType, RequireFields<GQLQueryNotificationsArgs, 'userId'>>;
  profile?: Resolver<Maybe<GQLResolversTypes['UserProfile']>, ParentType, ContextType>;
  publicExercises?: Resolver<Array<GQLResolversTypes['BaseExercise']>, ParentType, ContextType, Partial<GQLQueryPublicExercisesArgs>>;
  sentCollaborationInvitations?: Resolver<Array<GQLResolversTypes['CollaborationInvitation']>, ParentType, ContextType>;
  trainingPlanCollaborators?: Resolver<Array<GQLResolversTypes['TrainingPlanCollaborator']>, ParentType, ContextType, RequireFields<GQLQueryTrainingPlanCollaboratorsArgs, 'trainingPlanId'>>;
  user?: Resolver<Maybe<GQLResolversTypes['User']>, ParentType, ContextType>;
  userExercises?: Resolver<Array<GQLResolversTypes['BaseExercise']>, ParentType, ContextType, Partial<GQLQueryUserExercisesArgs>>;
  userPublic?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType, RequireFields<GQLQueryUserPublicArgs, 'id'>>;
  userWithAllData?: Resolver<Maybe<GQLResolversTypes['User']>, ParentType, ContextType>;
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

export type GQLSubstituteResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['Substitute'] = GQLResolversParentTypes['Substitute']> = {
  additionalInstructions?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  baseId?: Resolver<Maybe<GQLResolversTypes['ID']>, ParentType, ContextType>;
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  dayId?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  instructions?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  isPublic?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  muscleGroups?: Resolver<Array<GQLResolversTypes['MuscleGroup']>, ParentType, ContextType>;
  name?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  sets?: Resolver<Array<GQLResolversTypes['ExerciseSet']>, ParentType, ContextType>;
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
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  instructions?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
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
  collaboratorCount?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  completedAt?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  completedWorkoutsDays?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  createdAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  createdBy?: Resolver<Maybe<GQLResolversTypes['UserPublic']>, ParentType, ContextType>;
  currentWeekNumber?: Resolver<Maybe<GQLResolversTypes['Int']>, ParentType, ContextType>;
  description?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  difficulty?: Resolver<Maybe<GQLResolversTypes['Difficulty']>, ParentType, ContextType>;
  endDate?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  isDemo?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isDraft?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isPublic?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  isTemplate?: Resolver<GQLResolversTypes['Boolean'], ParentType, ContextType>;
  lastSessionActivity?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  nextSession?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  progress?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  rating?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  reviews?: Resolver<Array<GQLResolversTypes['Review']>, ParentType, ContextType>;
  startDate?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
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
  email?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  firstName?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  fitnessLevel?: Resolver<Maybe<GQLResolversTypes['FitnessLevel']>, ParentType, ContextType>;
  goals?: Resolver<Array<GQLResolversTypes['Goal']>, ParentType, ContextType>;
  height?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
  id?: Resolver<GQLResolversTypes['ID'], ParentType, ContextType>;
  lastName?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  phone?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  sex?: Resolver<Maybe<GQLResolversTypes['String']>, ParentType, ContextType>;
  updatedAt?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  weight?: Resolver<Maybe<GQLResolversTypes['Float']>, ParentType, ContextType>;
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

export type GQLVolumeEntryResolvers<ContextType = GQLContext, ParentType extends GQLResolversParentTypes['VolumeEntry'] = GQLResolversParentTypes['VolumeEntry']> = {
  totalSets?: Resolver<GQLResolversTypes['Int'], ParentType, ContextType>;
  totalVolume?: Resolver<GQLResolversTypes['Float'], ParentType, ContextType>;
  week?: Resolver<GQLResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type GQLResolvers<ContextType = GQLContext> = {
  AiExerciseSuggestion?: GQLAiExerciseSuggestionResolvers<ContextType>;
  AiMeta?: GQLAiMetaResolvers<ContextType>;
  BaseExercise?: GQLBaseExerciseResolvers<ContextType>;
  BaseExerciseSubstitute?: GQLBaseExerciseSubstituteResolvers<ContextType>;
  CoachingRequest?: GQLCoachingRequestResolvers<ContextType>;
  CollaborationInvitation?: GQLCollaborationInvitationResolvers<ContextType>;
  CreateMealPlanPayload?: GQLCreateMealPlanPayloadResolvers<ContextType>;
  CreateTrainingPlanPayload?: GQLCreateTrainingPlanPayloadResolvers<ContextType>;
  ExerciseLog?: GQLExerciseLogResolvers<ContextType>;
  ExerciseProgress?: GQLExerciseProgressResolvers<ContextType>;
  ExerciseSet?: GQLExerciseSetResolvers<ContextType>;
  ExerciseSetLog?: GQLExerciseSetLogResolvers<ContextType>;
  GetExercisesResponse?: GQLGetExercisesResponseResolvers<ContextType>;
  GetWorkoutPayload?: GQLGetWorkoutPayloadResolvers<ContextType>;
  Meal?: GQLMealResolvers<ContextType>;
  MealDay?: GQLMealDayResolvers<ContextType>;
  MealFood?: GQLMealFoodResolvers<ContextType>;
  MealLog?: GQLMealLogResolvers<ContextType>;
  MealLogItem?: GQLMealLogItemResolvers<ContextType>;
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
  OneRmEntry?: GQLOneRmEntryResolvers<ContextType>;
  OneRmLog?: GQLOneRmLogResolvers<ContextType>;
  Query?: GQLQueryResolvers<ContextType>;
  Review?: GQLReviewResolvers<ContextType>;
  Substitute?: GQLSubstituteResolvers<ContextType>;
  SuggestedSets?: GQLSuggestedSetsResolvers<ContextType>;
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
  VolumeEntry?: GQLVolumeEntryResolvers<ContextType>;
};

