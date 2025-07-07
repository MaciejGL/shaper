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

export type GQLAddFoodToMealInput = {
  caloriesPer100g?: InputMaybe<Scalars['Float']['input']>;
  carbsPer100g?: InputMaybe<Scalars['Float']['input']>;
  fatPer100g?: InputMaybe<Scalars['Float']['input']>;
  fiberPer100g?: InputMaybe<Scalars['Float']['input']>;
  mealId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
  openFoodFactsId?: InputMaybe<Scalars['String']['input']>;
  order: Scalars['Int']['input'];
  productData?: InputMaybe<Scalars['String']['input']>;
  proteinPer100g?: InputMaybe<Scalars['Float']['input']>;
  quantity: Scalars['Float']['input'];
  unit: Scalars['String']['input'];
};

export type GQLAddMealToDayInput = {
  dateTime: Scalars['String']['input'];
  dayId: Scalars['ID']['input'];
  instructions?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
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

export type GQLAddTrainingWeekInput = {
  trainingPlanId: Scalars['ID']['input'];
  weekNumber: Scalars['Int']['input'];
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
  additionalInstructions?: Maybe<Scalars['String']['output']>;
  canBeSubstitutedBy: Array<GQLBaseExerciseSubstitute>;
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<GQLUserPublic>;
  description?: Maybe<Scalars['String']['output']>;
  equipment?: Maybe<GQLEquipment>;
  id: Scalars['ID']['output'];
  isPublic: Scalars['Boolean']['output'];
  muscleGroupCategories: Array<GQLMuscleGroupCategory>;
  muscleGroups: Array<GQLMuscleGroup>;
  name: Scalars['String']['output'];
  substitutes: Array<GQLBaseExerciseSubstitute>;
  type?: Maybe<GQLExerciseType>;
  updatedAt: Scalars['String']['output'];
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
  order: Scalars['Int']['input'];
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

export enum GQLFitnessLevel {
  Advanced = 'ADVANCED',
  Beginner = 'BEGINNER',
  Expert = 'EXPERT',
  Intermediate = 'INTERMEDIATE'
}

export type GQLGetExercisesResponse = {
  __typename?: 'GetExercisesResponse';
  publicExercises: Array<GQLBaseExercise>;
  trainerExercises: Array<GQLBaseExercise>;
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
  completedAt?: Maybe<Scalars['String']['output']>;
  dateTime: Scalars['String']['output'];
  day?: Maybe<GQLMealDay>;
  foods: Array<GQLMealFood>;
  id: Scalars['ID']['output'];
  instructions?: Maybe<Scalars['String']['output']>;
  loggedCalories: Scalars['Float']['output'];
  loggedCarbs: Scalars['Float']['output'];
  loggedFat: Scalars['Float']['output'];
  loggedProtein: Scalars['Float']['output'];
  logs: Array<GQLMealLog>;
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
  caloriesPer100g?: Maybe<Scalars['Float']['output']>;
  carbsPer100g?: Maybe<Scalars['Float']['output']>;
  fatPer100g?: Maybe<Scalars['Float']['output']>;
  fiberPer100g?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  meal?: Maybe<GQLMeal>;
  name: Scalars['String']['output'];
  openFoodFactsId?: Maybe<Scalars['String']['output']>;
  order: Scalars['Int']['output'];
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

export type GQLMealLog = {
  __typename?: 'MealLog';
  completedAt?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  items: Array<GQLMealLogItem>;
  loggedAt: Scalars['String']['output'];
  meal?: Maybe<GQLMeal>;
  totalCalories: Scalars['Float']['output'];
  totalCarbs: Scalars['Float']['output'];
  totalFat: Scalars['Float']['output'];
  totalProtein: Scalars['Float']['output'];
  user: GQLUserPublic;
};

export type GQLMealLogItem = {
  __typename?: 'MealLogItem';
  barcode?: Maybe<Scalars['String']['output']>;
  calories?: Maybe<Scalars['Float']['output']>;
  carbs?: Maybe<Scalars['Float']['output']>;
  createdAt: Scalars['String']['output'];
  fat?: Maybe<Scalars['Float']['output']>;
  fiber?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  log?: Maybe<GQLMealLog>;
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  openFoodFactsId?: Maybe<Scalars['String']['output']>;
  plannedFood?: Maybe<GQLMealFood>;
  productData?: Maybe<Scalars['String']['output']>;
  protein?: Maybe<Scalars['Float']['output']>;
  quantity: Scalars['Float']['output'];
  unit: Scalars['String']['output'];
};

export type GQLMealPlan = {
  __typename?: 'MealPlan';
  active: Scalars['Boolean']['output'];
  assignedCount: Scalars['Int']['output'];
  assignedTo?: Maybe<GQLUserPublic>;
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
  activateMealPlan: Scalars['Boolean']['output'];
  activatePlan: Scalars['Boolean']['output'];
  addAiExerciseToWorkout: GQLTrainingExercise;
  addBodyMeasurement: GQLUserBodyMeasure;
  addExerciseToDay: Scalars['ID']['output'];
  addExercisesToQuickWorkout: GQLTrainingPlan;
  addExercisesToWorkout: Array<GQLTrainingExercise>;
  addFoodToMeal: Scalars['ID']['output'];
  addMealToDay: Scalars['ID']['output'];
  addSet: GQLExerciseSet;
  addSetExerciseForm: GQLExerciseSet;
  addSetToExercise: Scalars['ID']['output'];
  addSubstituteExercise: Scalars['Boolean']['output'];
  addTrainingWeek: Scalars['ID']['output'];
  assignMealPlanToClient: Scalars['Boolean']['output'];
  assignTrainingPlanToClient: Scalars['Boolean']['output'];
  cancelCoachingRequest?: Maybe<GQLCoachingRequest>;
  closePlan: Scalars['Boolean']['output'];
  completeMealPlan: Scalars['Boolean']['output'];
  createCoachingRequest: GQLCoachingRequest;
  createDraftMealTemplate: GQLMealPlan;
  createDraftTemplate: GQLTrainingPlan;
  createExercise: Scalars['Boolean']['output'];
  createMealPlan: GQLCreateMealPlanPayload;
  createNote: GQLNote;
  createNotification: GQLNotification;
  createReview: Scalars['Boolean']['output'];
  createTrainingPlan: GQLCreateTrainingPlanPayload;
  deleteBodyMeasurement: Scalars['Boolean']['output'];
  deleteExercise: Scalars['Boolean']['output'];
  deleteMealFoodLog: Scalars['Boolean']['output'];
  deleteMealPlan: Scalars['Boolean']['output'];
  deleteNote: Scalars['Boolean']['output'];
  deleteNotification: Scalars['Boolean']['output'];
  deletePlan: Scalars['Boolean']['output'];
  deleteReview: Scalars['Boolean']['output'];
  deleteTrainingPlan: Scalars['Boolean']['output'];
  duplicateMealPlan: Scalars['ID']['output'];
  duplicateTrainingPlan: Scalars['ID']['output'];
  duplicateTrainingWeek: Scalars['ID']['output'];
  extendPlan: Scalars['Boolean']['output'];
  getAiExerciseSuggestions: Array<GQLAiExerciseSuggestion>;
  logMealFood: GQLMealLogItem;
  logWorkoutProgress: Scalars['ID']['output'];
  logWorkoutSessionEvent: Scalars['ID']['output'];
  markAllNotificationsRead: Array<GQLNotification>;
  markExerciseAsCompleted?: Maybe<Scalars['Boolean']['output']>;
  markNotificationRead: GQLNotification;
  markSetAsCompleted?: Maybe<Scalars['Boolean']['output']>;
  markWorkoutAsCompleted?: Maybe<Scalars['Boolean']['output']>;
  moderateReview: Scalars['Boolean']['output'];
  moveExercise: Scalars['Boolean']['output'];
  pauseMealPlan: Scalars['Boolean']['output'];
  pausePlan: Scalars['Boolean']['output'];
  rejectCoachingRequest?: Maybe<GQLCoachingRequest>;
  removeExerciseFromDay: Scalars['Boolean']['output'];
  removeExerciseFromWorkout: Scalars['Boolean']['output'];
  removeFoodFromMeal: Scalars['Boolean']['output'];
  removeMealFromDay: Scalars['Boolean']['output'];
  removeMealPlanFromClient: Scalars['Boolean']['output'];
  removeSet: Scalars['Boolean']['output'];
  removeSetExerciseForm: Scalars['Boolean']['output'];
  removeSetFromExercise: Scalars['Boolean']['output'];
  removeSubstituteExercise: Scalars['Boolean']['output'];
  removeTrainingPlanFromClient: Scalars['Boolean']['output'];
  removeTrainingWeek: Scalars['Boolean']['output'];
  removeWeek: Scalars['Boolean']['output'];
  swapExercise: GQLSubstitute;
  updateBodyMeasurement: GQLUserBodyMeasure;
  updateExercise: Scalars['Boolean']['output'];
  updateExerciseForm: GQLTrainingExercise;
  updateExerciseSet: Scalars['Boolean']['output'];
  updateMeal: Scalars['Boolean']['output'];
  updateMealDayData: Scalars['Boolean']['output'];
  updateMealFood: Scalars['Boolean']['output'];
  updateMealFoodLog: Scalars['Boolean']['output'];
  updateMealPlan: Scalars['Boolean']['output'];
  updateMealPlanDetails: Scalars['Boolean']['output'];
  updateMealWeekDetails: Scalars['Boolean']['output'];
  updateNote: GQLNote;
  updateNotification: GQLNotification;
  updateProfile?: Maybe<GQLUserProfile>;
  updateReview: Scalars['Boolean']['output'];
  updateSetLog?: Maybe<GQLExerciseSetLog>;
  updateSubstituteExercise: Scalars['Boolean']['output'];
  updateTrainingDayData: Scalars['Boolean']['output'];
  updateTrainingExercise: Scalars['Boolean']['output'];
  updateTrainingPlan: Scalars['Boolean']['output'];
  updateTrainingPlanDetails: Scalars['Boolean']['output'];
  updateTrainingWeekDetails: Scalars['Boolean']['output'];
};


export type GQLMutationAcceptCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationActivateMealPlanArgs = {
  planId: Scalars['ID']['input'];
  startDate: Scalars['String']['input'];
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


export type GQLMutationAddFoodToMealArgs = {
  input: GQLAddFoodToMealInput;
};


export type GQLMutationAddMealToDayArgs = {
  input: GQLAddMealToDayInput;
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


export type GQLMutationCompleteMealPlanArgs = {
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


export type GQLMutationDeleteMealPlanArgs = {
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


export type GQLMutationPauseMealPlanArgs = {
  planId: Scalars['ID']['input'];
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


export type GQLMutationRemoveFoodFromMealArgs = {
  foodId: Scalars['ID']['input'];
};


export type GQLMutationRemoveMealFromDayArgs = {
  mealId: Scalars['ID']['input'];
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


export type GQLMutationUpdateMealArgs = {
  input: GQLUpdateMealInput;
};


export type GQLMutationUpdateMealDayDataArgs = {
  input: GQLUpdateMealDayDataInput;
};


export type GQLMutationUpdateMealFoodArgs = {
  input: GQLUpdateMealFoodInput;
};


export type GQLMutationUpdateMealFoodLogArgs = {
  input: GQLUpdateMealFoodLogInput;
};


export type GQLMutationUpdateMealPlanArgs = {
  input: GQLUpdateMealPlanInput;
};


export type GQLMutationUpdateMealPlanDetailsArgs = {
  input: GQLUpdateMealPlanDetailsInput;
};


export type GQLMutationUpdateMealWeekDetailsArgs = {
  input: GQLUpdateMealWeekDetailsInput;
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


export type GQLMutationUpdateTrainingPlanDetailsArgs = {
  input: GQLUpdateTrainingPlanDetailsInput;
};


export type GQLMutationUpdateTrainingWeekDetailsArgs = {
  input: GQLUpdateTrainingWeekDetailsInput;
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
  id: Scalars['ID']['output'];
  relatedTo?: Maybe<Scalars['ID']['output']>;
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

export enum GQLNotificationType {
  CoachingRequest = 'COACHING_REQUEST',
  CoachingRequestAccepted = 'COACHING_REQUEST_ACCEPTED',
  CoachingRequestRejected = 'COACHING_REQUEST_REJECTED',
  Message = 'MESSAGE',
  NewMealPlanAssigned = 'NEW_MEAL_PLAN_ASSIGNED',
  NewTrainingPlanAssigned = 'NEW_TRAINING_PLAN_ASSIGNED',
  Reminder = 'REMINDER',
  System = 'SYSTEM'
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

export type GQLQuery = {
  __typename?: 'Query';
  bodyMeasures: Array<GQLUserBodyMeasure>;
  clientBodyMeasures: Array<GQLUserBodyMeasure>;
  coachingRequest?: Maybe<GQLCoachingRequest>;
  coachingRequests: Array<GQLCoachingRequest>;
  exercise?: Maybe<GQLBaseExercise>;
  exercisesProgressByUser: Array<GQLExerciseProgress>;
  getClientActiveMealPlan?: Maybe<GQLMealPlan>;
  getClientActivePlan?: Maybe<GQLTrainingPlan>;
  getClientMealPlans: Array<GQLMealPlan>;
  getClientTrainingPlans: Array<GQLTrainingPlan>;
  getExercises: GQLGetExercisesResponse;
  getMealPlanById: GQLMealPlan;
  getMealPlanTemplates: Array<GQLMealPlan>;
  getMyMealPlansOverview: GQLMyMealPlansPayload;
  getMyPlansOverview: GQLMyPlansPayload;
  getQuickWorkoutPlan: GQLTrainingPlan;
  getTemplates: Array<GQLTrainingPlan>;
  getTrainingExercise?: Maybe<GQLTrainingExercise>;
  getTrainingPlanById: GQLTrainingPlan;
  getWorkout?: Maybe<GQLGetWorkoutPayload>;
  getWorkoutInfo: GQLTrainingDay;
  muscleGroupCategories: Array<GQLMuscleGroupCategory>;
  muscleGroupCategory: GQLMuscleGroupCategory;
  myClients: Array<GQLUserPublic>;
  myTrainer?: Maybe<GQLUserPublic>;
  note?: Maybe<GQLNote>;
  notes: Array<GQLNote>;
  notification?: Maybe<GQLNotification>;
  notifications: Array<GQLNotification>;
  profile?: Maybe<GQLUserProfile>;
  publicExercises: Array<GQLBaseExercise>;
  user?: Maybe<GQLUser>;
  userExercises: Array<GQLBaseExercise>;
  userPublic?: Maybe<GQLUserPublic>;
  userWithAllData?: Maybe<GQLUser>;
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


export type GQLQueryUserExercisesArgs = {
  where?: InputMaybe<GQLExerciseWhereInput>;
};


export type GQLQueryUserPublicArgs = {
  id: Scalars['ID']['input'];
};

export type GQLRemoveSubstituteExerciseInput = {
  originalId: Scalars['ID']['input'];
  substituteId: Scalars['ID']['input'];
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
  id: Scalars['ID']['output'];
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
  completedAt?: Maybe<Scalars['String']['output']>;
  completedWorkoutsDays: Scalars['Int']['output'];
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<GQLUserPublic>;
  currentWeekNumber?: Maybe<Scalars['Int']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  difficulty?: Maybe<GQLDifficulty>;
  endDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDemo: Scalars['Boolean']['output'];
  isDraft: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  isTemplate: Scalars['Boolean']['output'];
  lastSessionActivity?: Maybe<Scalars['String']['output']>;
  nextSession?: Maybe<Scalars['String']['output']>;
  progress?: Maybe<Scalars['Float']['output']>;
  rating?: Maybe<Scalars['Float']['output']>;
  reviews: Array<GQLReview>;
  startDate?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  totalReviews: Scalars['Int']['output'];
  totalWorkouts: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
  userReview?: Maybe<GQLReview>;
  weekCount: Scalars['Int']['output'];
  weeks: Array<GQLTrainingWeek>;
};

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

export type GQLUpdateMealDayDataInput = {
  dayId: Scalars['ID']['input'];
  targetCalories?: InputMaybe<Scalars['Float']['input']>;
  targetCarbs?: InputMaybe<Scalars['Float']['input']>;
  targetFat?: InputMaybe<Scalars['Float']['input']>;
  targetProtein?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLUpdateMealDayInput = {
  dayOfWeek: Scalars['Int']['input'];
  id: Scalars['ID']['input'];
  meals?: InputMaybe<Array<GQLUpdateMealInput>>;
  targetCalories?: InputMaybe<Scalars['Float']['input']>;
  targetCarbs?: InputMaybe<Scalars['Float']['input']>;
  targetFat?: InputMaybe<Scalars['Float']['input']>;
  targetProtein?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLUpdateMealFoodInput = {
  caloriesPer100g?: InputMaybe<Scalars['Float']['input']>;
  carbsPer100g?: InputMaybe<Scalars['Float']['input']>;
  fatPer100g?: InputMaybe<Scalars['Float']['input']>;
  fiberPer100g?: InputMaybe<Scalars['Float']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  openFoodFactsId?: InputMaybe<Scalars['String']['input']>;
  order?: InputMaybe<Scalars['Int']['input']>;
  productData?: InputMaybe<Scalars['String']['input']>;
  proteinPer100g?: InputMaybe<Scalars['Float']['input']>;
  quantity?: InputMaybe<Scalars['Float']['input']>;
  unit?: InputMaybe<Scalars['String']['input']>;
};

export type GQLUpdateMealFoodLogInput = {
  id: Scalars['ID']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  quantity?: InputMaybe<Scalars['Float']['input']>;
};

export type GQLUpdateMealInput = {
  dateTime?: InputMaybe<Scalars['String']['input']>;
  foods?: InputMaybe<Array<GQLUpdateMealFoodInput>>;
  id: Scalars['ID']['input'];
  instructions?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
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

export type GQLUpdateMealPlanInput = {
  dailyCalories?: InputMaybe<Scalars['Float']['input']>;
  dailyCarbs?: InputMaybe<Scalars['Float']['input']>;
  dailyFat?: InputMaybe<Scalars['Float']['input']>;
  dailyProtein?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  weeks?: InputMaybe<Array<GQLUpdateMealWeekInput>>;
};

export type GQLUpdateMealWeekDetailsInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  weekNumber?: InputMaybe<Scalars['Int']['input']>;
};

export type GQLUpdateMealWeekInput = {
  days?: InputMaybe<Array<GQLUpdateMealDayInput>>;
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  weekNumber: Scalars['Int']['input'];
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
  email?: Maybe<Scalars['String']['output']>;
  firstName?: Maybe<Scalars['String']['output']>;
  fitnessLevel?: Maybe<GQLFitnessLevel>;
  goals: Array<GQLGoal>;
  height?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  sex?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
  weight?: Maybe<Scalars['Float']['output']>;
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

export type GQLFitspaceDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceDashboardQuery = { __typename?: 'Query', myTrainer?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, sex?: string | undefined | null, averageRating?: number | undefined | null, yearsOfExperience?: number | undefined | null } | undefined | null, getWorkout?: { __typename?: 'GetWorkoutPayload', plan: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, startDate?: string | undefined | null, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, startedAt?: string | undefined | null, completedAt?: string | undefined | null, duration?: number | undefined | null, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, sets: Array<{ __typename?: 'ExerciseSet', id: string }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null }> }> }> }> } } | undefined | null };

export type GQLFitspaceMyPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceMyPlansQuery = { __typename?: 'Query', getMyPlansOverview: { __typename?: 'MyPlansPayload', activePlan?: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, difficulty?: GQLDifficulty | undefined | null, totalWorkouts: number, rating?: number | undefined | null, totalReviews: number, weekCount: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, startDate?: string | undefined | null, endDate?: string | undefined | null, updatedAt: string, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, scheduledAt?: string | undefined | null, completedAt?: string | undefined | null, isExtra: boolean, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, restSeconds?: number | undefined | null, videoUrl?: string | undefined | null, instructions?: string | undefined | null, name: string, warmupSets?: number | undefined | null, completedAt?: string | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null }>, sets: Array<{ __typename?: 'ExerciseSet', id: string }> }> }> }> } | undefined | null, quickWorkoutPlan?: { __typename?: 'TrainingPlan', id: string, totalWorkouts: number, weekCount: number, completedWorkoutsDays: number, adherence: number, updatedAt: string, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, scheduledAt?: string | undefined | null, completedAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, videoUrl?: string | undefined | null, instructions?: string | undefined | null, name: string, completedAt?: string | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null }>, sets: Array<{ __typename?: 'ExerciseSet', id: string }> }> }> }> } | undefined | null, availablePlans: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, difficulty?: GQLDifficulty | undefined | null, totalWorkouts: number, rating?: number | undefined | null, totalReviews: number, weekCount: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, startDate?: string | undefined | null, endDate?: string | undefined | null, updatedAt: string, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, sex?: string | undefined | null } | undefined | null }>, completedPlans: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, difficulty?: GQLDifficulty | undefined | null, totalWorkouts: number, rating?: number | undefined | null, totalReviews: number, weekCount: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, startDate?: string | undefined | null, endDate?: string | undefined | null, completedAt?: string | undefined | null, updatedAt: string, userReview?: { __typename?: 'Review', id: string, rating: number, comment?: string | undefined | null, createdAt: string, updatedAt: string } | undefined | null, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, sex?: string | undefined | null } | undefined | null }> } };

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

export type GQLProfileFragmentFragment = { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null, avatarUrl?: string | undefined | null, height?: number | undefined | null, weight?: number | undefined | null, fitnessLevel?: GQLFitnessLevel | undefined | null, allergies?: string | undefined | null, activityLevel?: GQLActivityLevel | undefined | null, goals: Array<GQLGoal>, bio?: string | undefined | null, createdAt: string, updatedAt: string, email?: string | undefined | null };

export type GQLProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLProfileQuery = { __typename?: 'Query', profile?: { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null, avatarUrl?: string | undefined | null, height?: number | undefined | null, weight?: number | undefined | null, fitnessLevel?: GQLFitnessLevel | undefined | null, allergies?: string | undefined | null, activityLevel?: GQLActivityLevel | undefined | null, goals: Array<GQLGoal>, bio?: string | undefined | null, createdAt: string, updatedAt: string, email?: string | undefined | null } | undefined | null };

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

export type GQLGetTrainingPlanPreviewByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLGetTrainingPlanPreviewByIdQuery = { __typename?: 'Query', getTrainingPlanById: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isDemo: boolean, rating?: number | undefined | null, totalReviews: number, difficulty?: GQLDifficulty | undefined | null, weekCount: number, totalWorkouts: number, assignedCount: number, startDate?: string | undefined | null, active: boolean, assignedTo?: { __typename?: 'UserPublic', id: string } | undefined | null, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, restSeconds?: number | undefined | null, tempo?: string | undefined | null, warmupSets?: number | undefined | null, instructions?: string | undefined | null, order: number, videoUrl?: string | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, groupSlug: string, alias?: string | undefined | null }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> }> }> } };

export type GQLFitspaceGetCurrentWorkoutIdQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceGetCurrentWorkoutIdQuery = { __typename?: 'Query', getMyPlansOverview: { __typename?: 'MyPlansPayload', activePlan?: { __typename?: 'TrainingPlan', id: string } | undefined | null } };

export type GQLFitspaceGetWorkoutQueryVariables = Exact<{
  trainingId: Scalars['ID']['input'];
}>;


export type GQLFitspaceGetWorkoutQuery = { __typename?: 'Query', getWorkout?: { __typename?: 'GetWorkoutPayload', plan: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, startDate?: string | undefined | null, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, startedAt?: string | undefined | null, completedAt?: string | undefined | null, scheduledAt?: string | undefined | null, duration?: number | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, restSeconds?: number | undefined | null, tempo?: string | undefined | null, warmupSets?: number | undefined | null, instructions?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, order: number, videoUrl?: string | undefined | null, completedAt?: string | undefined | null, isExtra: boolean, substitutedBy?: { __typename?: 'Substitute', id: string, name: string, instructions?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, videoUrl?: string | undefined | null, completedAt?: string | undefined | null, baseId?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, isExtra: boolean, completedAt?: string | undefined | null, log?: { __typename?: 'ExerciseSetLog', id: string, weight?: number | undefined | null, rpe?: number | undefined | null, reps?: number | undefined | null, createdAt: string } | undefined | null }> } | undefined | null, substitutes: Array<{ __typename?: 'BaseExerciseSubstitute', id: string, substitute: { __typename?: 'BaseExercise', id: string, name: string } }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, isExtra: boolean, completedAt?: string | undefined | null, log?: { __typename?: 'ExerciseSetLog', id: string, weight?: number | undefined | null, rpe?: number | undefined | null, reps?: number | undefined | null, createdAt: string } | undefined | null }> }> }> }> } } | undefined | null };

export type GQLFitspaceGetExercisesQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceGetExercisesQuery = { __typename?: 'Query', getExercises: { __typename?: 'GetExercisesResponse', publicExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }> }>, trainerExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }> }> }, muscleGroupCategories: Array<{ __typename?: 'MuscleGroupCategory', id: string, name: string, slug: string, muscles: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }> }> };

export type GQLFitspaceGetWorkoutInfoQueryVariables = Exact<{
  dayId: Scalars['ID']['input'];
}>;


export type GQLFitspaceGetWorkoutInfoQuery = { __typename?: 'Query', getWorkoutInfo: { __typename?: 'TrainingDay', id: string, duration?: number | undefined | null } };

export type GQLFitspaceGetAiExerciseSuggestionsMutationVariables = Exact<{
  dayId: Scalars['ID']['input'];
}>;


export type GQLFitspaceGetAiExerciseSuggestionsMutation = { __typename?: 'Mutation', getAiExerciseSuggestions: Array<{ __typename?: 'AiExerciseSuggestion', exercise: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, alias?: string | undefined | null, groupSlug: string }> }, sets: Array<{ __typename?: 'SuggestedSets', reps?: number | undefined | null, rpe?: number | undefined | null } | undefined | null>, aiMeta: { __typename?: 'AiMeta', explanation: string } }> };

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


export type GQLQuickWorkoutExercisesQuery = { __typename?: 'Query', publicExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, type?: GQLExerciseType | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }> }> };

export type GQLFitspaceGetUserQuickWorkoutPlanQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceGetUserQuickWorkoutPlanQuery = { __typename?: 'Query', getQuickWorkoutPlan: { __typename?: 'TrainingPlan', id: string, title: string, weeks: Array<{ __typename?: 'TrainingWeek', id: string, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, baseId?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> }> }> } };

export type GQLCreateQuickWorkoutPlanMutationVariables = Exact<{
  input: GQLCreateTrainingPlanInput;
}>;


export type GQLCreateQuickWorkoutPlanMutation = { __typename?: 'Mutation', createTrainingPlan: { __typename?: 'CreateTrainingPlanPayload', id: string, success: boolean } };

export type GQLAssignQuickWorkoutPlanMutationVariables = Exact<{
  input: GQLAssignTrainingPlanToClientInput;
}>;


export type GQLAssignQuickWorkoutPlanMutation = { __typename?: 'Mutation', assignTrainingPlanToClient: boolean };

export type GQLAddExercisesToQuickWorkoutMutationVariables = Exact<{
  exerciseIds: Array<Scalars['ID']['input']> | Scalars['ID']['input'];
}>;


export type GQLAddExercisesToQuickWorkoutMutation = { __typename?: 'Mutation', addExercisesToQuickWorkout: { __typename?: 'TrainingPlan', id: string } };

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


export type GQLGetClientByIdQuery = { __typename?: 'Query', userPublic?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string, phone?: string | undefined | null, image?: string | undefined | null, sex?: string | undefined | null, birthday?: string | undefined | null, goals: Array<GQLGoal>, currentWeight?: number | undefined | null, height?: number | undefined | null, allergies?: string | undefined | null } | undefined | null, getClientTrainingPlans: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, weekCount: number, startDate?: string | undefined | null, endDate?: string | undefined | null, active: boolean, progress?: number | undefined | null, nextSession?: string | undefined | null }>, getClientActivePlan?: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, weekCount: number, startDate?: string | undefined | null, endDate?: string | undefined | null, active: boolean, progress?: number | undefined | null, nextSession?: string | undefined | null, difficulty?: GQLDifficulty | undefined | null, totalWorkouts: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, weeks: Array<{ __typename?: 'TrainingWeek', id: string, name: string, completedAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, completedAt?: string | undefined | null, duration?: number | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, completedAt?: string | undefined | null, log?: { __typename?: 'ExerciseSetLog', id: string, reps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null } | undefined | null }> }> }> }> } | undefined | null };

export type GQLClientBodyMeasuresQueryVariables = Exact<{
  clientId: Scalars['ID']['input'];
}>;


export type GQLClientBodyMeasuresQuery = { __typename?: 'Query', clientBodyMeasures: Array<{ __typename?: 'UserBodyMeasure', id: string, measuredAt: string, weight?: number | undefined | null, chest?: number | undefined | null, waist?: number | undefined | null, hips?: number | undefined | null, neck?: number | undefined | null, bicepsLeft?: number | undefined | null, bicepsRight?: number | undefined | null, thighLeft?: number | undefined | null, thighRight?: number | undefined | null, calfLeft?: number | undefined | null, calfRight?: number | undefined | null, bodyFat?: number | undefined | null, notes?: string | undefined | null }> };

export type GQLExercisesProgressByUserQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type GQLExercisesProgressByUserQuery = { __typename?: 'Query', exercisesProgressByUser: Array<{ __typename?: 'ExerciseProgress', averageRpe?: number | undefined | null, totalSets?: number | undefined | null, lastPerformed?: string | undefined | null, baseExercise?: { __typename?: 'BaseExercise', id: string, name: string, muscleGroups: Array<{ __typename?: 'MuscleGroup', alias?: string | undefined | null, name: string, groupSlug: string, category: { __typename?: 'MuscleGroupCategory', name: string } }> } | undefined | null, estimated1RMProgress: Array<{ __typename?: 'OneRmEntry', date: string, average1RM: number, detailedLogs: Array<{ __typename?: 'OneRmLog', estimated1RM: number, weight?: number | undefined | null, reps?: number | undefined | null }> }>, totalVolumeProgress: Array<{ __typename?: 'VolumeEntry', week: string, totalVolume: number, totalSets: number }> }> };

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


export type GQLTrainerExercisesQuery = { __typename?: 'Query', userExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }> }>, publicExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }> }> };

export type GQLPublicExercisesQueryVariables = Exact<{
  where?: InputMaybe<GQLExerciseWhereInput>;
}>;


export type GQLPublicExercisesQuery = { __typename?: 'Query', publicExercises: Array<{ __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, videoUrl?: string | undefined | null, equipment?: GQLEquipment | undefined | null, isPublic: boolean, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null, groupSlug: string }> }> };

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


export type GQLGetExerciseWithSubstitutesQuery = { __typename?: 'Query', exercise?: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, equipment?: GQLEquipment | undefined | null, substitutes: Array<{ __typename?: 'BaseExerciseSubstitute', id: string, originalId: string, substituteId: string, reason?: string | undefined | null, createdAt: string, substitute: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, equipment?: GQLEquipment | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, groupSlug: string }> } }>, canBeSubstitutedBy: Array<{ __typename?: 'BaseExerciseSubstitute', id: string, originalId: string, substituteId: string, reason?: string | undefined | null, createdAt: string, original: { __typename?: 'BaseExercise', id: string, name: string, description?: string | undefined | null, equipment?: GQLEquipment | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, groupSlug: string }> } }> } | undefined | null };

export type GQLMealPlanTemplateFragment = { __typename?: 'MealPlan', id: string, title: string, description?: string | undefined | null, isDraft: boolean, dailyCalories?: number | undefined | null, dailyProtein?: number | undefined | null, dailyCarbs?: number | undefined | null, dailyFat?: number | undefined | null, createdAt: string, updatedAt: string, assignedCount: number, weeks: Array<{ __typename?: 'MealWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, days: Array<{ __typename?: 'MealDay', id: string, dayOfWeek: number, targetCalories?: number | undefined | null, targetProtein?: number | undefined | null, targetCarbs?: number | undefined | null, targetFat?: number | undefined | null, meals: Array<{ __typename?: 'Meal', id: string, name: string, dateTime: string, instructions?: string | undefined | null, foods: Array<{ __typename?: 'MealFood', id: string, name: string, quantity: number, unit: string, caloriesPer100g?: number | undefined | null, proteinPer100g?: number | undefined | null, carbsPer100g?: number | undefined | null, fatPer100g?: number | undefined | null, fiberPer100g?: number | undefined | null }> }> }> }> };

export type GQLGetMealPlanTemplatesQueryVariables = Exact<{
  draft?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GQLGetMealPlanTemplatesQuery = { __typename?: 'Query', getMealPlanTemplates: Array<{ __typename?: 'MealPlan', id: string, title: string, description?: string | undefined | null, isDraft: boolean, dailyCalories?: number | undefined | null, dailyProtein?: number | undefined | null, dailyCarbs?: number | undefined | null, dailyFat?: number | undefined | null, weekCount: number, assignedCount: number, createdAt: string, updatedAt: string }> };

export type GQLGetMealPlanByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLGetMealPlanByIdQuery = { __typename?: 'Query', getMealPlanById: { __typename?: 'MealPlan', id: string, title: string, description?: string | undefined | null, isDraft: boolean, dailyCalories?: number | undefined | null, dailyProtein?: number | undefined | null, dailyCarbs?: number | undefined | null, dailyFat?: number | undefined | null, createdAt: string, updatedAt: string, assignedCount: number, weeks: Array<{ __typename?: 'MealWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, days: Array<{ __typename?: 'MealDay', id: string, dayOfWeek: number, targetCalories?: number | undefined | null, targetProtein?: number | undefined | null, targetCarbs?: number | undefined | null, targetFat?: number | undefined | null, meals: Array<{ __typename?: 'Meal', id: string, name: string, dateTime: string, instructions?: string | undefined | null, foods: Array<{ __typename?: 'MealFood', id: string, name: string, quantity: number, unit: string, caloriesPer100g?: number | undefined | null, proteinPer100g?: number | undefined | null, carbsPer100g?: number | undefined | null, fatPer100g?: number | undefined | null, fiberPer100g?: number | undefined | null }> }> }> }> } };

export type GQLCreateMealPlanMutationVariables = Exact<{
  input: GQLCreateMealPlanInput;
}>;


export type GQLCreateMealPlanMutation = { __typename?: 'Mutation', createMealPlan: { __typename?: 'CreateMealPlanPayload', id: string, success: boolean } };

export type GQLCreateDraftMealTemplateMutationVariables = Exact<{ [key: string]: never; }>;


export type GQLCreateDraftMealTemplateMutation = { __typename?: 'Mutation', createDraftMealTemplate: { __typename?: 'MealPlan', id: string, title: string, description?: string | undefined | null, isDraft: boolean, dailyCalories?: number | undefined | null, dailyProtein?: number | undefined | null, dailyCarbs?: number | undefined | null, dailyFat?: number | undefined | null, createdAt: string, updatedAt: string } };

export type GQLUpdateMealPlanMutationVariables = Exact<{
  input: GQLUpdateMealPlanInput;
}>;


export type GQLUpdateMealPlanMutation = { __typename?: 'Mutation', updateMealPlan: boolean };

export type GQLDeleteMealPlanMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLDeleteMealPlanMutation = { __typename?: 'Mutation', deleteMealPlan: boolean };

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

export type GQLUpdateMealPlanDetailsMutationVariables = Exact<{
  input: GQLUpdateMealPlanDetailsInput;
}>;


export type GQLUpdateMealPlanDetailsMutation = { __typename?: 'Mutation', updateMealPlanDetails: boolean };

export type GQLUpdateMealWeekDetailsMutationVariables = Exact<{
  input: GQLUpdateMealWeekDetailsInput;
}>;


export type GQLUpdateMealWeekDetailsMutation = { __typename?: 'Mutation', updateMealWeekDetails: boolean };

export type GQLUpdateMealDayDataMutationVariables = Exact<{
  input: GQLUpdateMealDayDataInput;
}>;


export type GQLUpdateMealDayDataMutation = { __typename?: 'Mutation', updateMealDayData: boolean };

export type GQLAddMealToDayMutationVariables = Exact<{
  input: GQLAddMealToDayInput;
}>;


export type GQLAddMealToDayMutation = { __typename?: 'Mutation', addMealToDay: string };

export type GQLUpdateMealMutationVariables = Exact<{
  input: GQLUpdateMealInput;
}>;


export type GQLUpdateMealMutation = { __typename?: 'Mutation', updateMeal: boolean };

export type GQLRemoveMealFromDayMutationVariables = Exact<{
  mealId: Scalars['ID']['input'];
}>;


export type GQLRemoveMealFromDayMutation = { __typename?: 'Mutation', removeMealFromDay: boolean };

export type GQLAddFoodToMealMutationVariables = Exact<{
  input: GQLAddFoodToMealInput;
}>;


export type GQLAddFoodToMealMutation = { __typename?: 'Mutation', addFoodToMeal: string };

export type GQLUpdateMealFoodMutationVariables = Exact<{
  input: GQLUpdateMealFoodInput;
}>;


export type GQLUpdateMealFoodMutation = { __typename?: 'Mutation', updateMealFood: boolean };

export type GQLRemoveFoodFromMealMutationVariables = Exact<{
  foodId: Scalars['ID']['input'];
}>;


export type GQLRemoveFoodFromMealMutation = { __typename?: 'Mutation', removeFoodFromMeal: boolean };

export type GQLLogMealFoodMutationVariables = Exact<{
  input: GQLLogMealFoodInput;
}>;


export type GQLLogMealFoodMutation = { __typename?: 'Mutation', logMealFood: { __typename?: 'MealLogItem', id: string, name: string, quantity: number, unit: string, calories?: number | undefined | null, protein?: number | undefined | null, carbs?: number | undefined | null, fat?: number | undefined | null, fiber?: number | undefined | null, notes?: string | undefined | null, createdAt: string } };

export type GQLUpdateMealFoodLogMutationVariables = Exact<{
  input: GQLUpdateMealFoodLogInput;
}>;


export type GQLUpdateMealFoodLogMutation = { __typename?: 'Mutation', updateMealFoodLog: boolean };

export type GQLDeleteMealFoodLogMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLDeleteMealFoodLogMutation = { __typename?: 'Mutation', deleteMealFoodLog: boolean };

export type GQLTrainingTemplateFragment = { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, difficulty?: GQLDifficulty | undefined | null, createdAt: string, updatedAt: string, assignedCount: number, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, restSeconds?: number | undefined | null, tempo?: string | undefined | null, warmupSets?: number | undefined | null, instructions?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, order: number, videoUrl?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> }> }> };

export type GQLGetTemplatesQueryVariables = Exact<{
  draft?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GQLGetTemplatesQuery = { __typename?: 'Query', getTemplates: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isDraft: boolean, weekCount: number, assignedCount: number }> };

export type GQLGetTemplateTrainingPlanByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLGetTemplateTrainingPlanByIdQuery = { __typename?: 'Query', getTrainingPlanById: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, difficulty?: GQLDifficulty | undefined | null, createdAt: string, updatedAt: string, assignedCount: number, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, restSeconds?: number | undefined | null, tempo?: string | undefined | null, warmupSets?: number | undefined | null, instructions?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, order: number, videoUrl?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> }> }> } };

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

export type GQLCreateDraftTemplateMutationVariables = Exact<{ [key: string]: never; }>;


export type GQLCreateDraftTemplateMutation = { __typename?: 'Mutation', createDraftTemplate: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null }> }> } };

export type GQLGetExerciseFormDataQueryVariables = Exact<{
  exerciseId: Scalars['ID']['input'];
}>;


export type GQLGetExerciseFormDataQuery = { __typename?: 'Query', exercise?: { __typename?: 'TrainingExercise', id: string, name: string, instructions?: string | undefined | null, additionalInstructions?: string | undefined | null, type?: GQLExerciseType | undefined | null, restSeconds?: number | undefined | null, warmupSets?: number | undefined | null, tempo?: string | undefined | null, videoUrl?: string | undefined | null, substitutes: Array<{ __typename?: 'BaseExerciseSubstitute', id: string, substitute: { __typename?: 'BaseExercise', name: string } }>, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> } | undefined | null };

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


export type GQLGetNotesQuery = { __typename?: 'Query', notes: Array<{ __typename?: 'Note', id: string, text: string, createdAt: string, updatedAt: string }> };

export type GQLGetNoteQueryVariables = Exact<{
  id: Scalars['ID']['input'];
  relatedTo?: InputMaybe<Scalars['ID']['input']>;
}>;


export type GQLGetNoteQuery = { __typename?: 'Query', note?: { __typename?: 'Note', id: string, text: string, createdAt: string, updatedAt: string } | undefined | null };

export type GQLCreateNoteMutationVariables = Exact<{
  input: GQLCreateNoteInput;
}>;


export type GQLCreateNoteMutation = { __typename?: 'Mutation', createNote: { __typename?: 'Note', id: string, text: string } };

export type GQLUpdateNoteMutationVariables = Exact<{
  input: GQLUpdateNoteInput;
}>;


export type GQLUpdateNoteMutation = { __typename?: 'Mutation', updateNote: { __typename?: 'Note', id: string, text: string } };

export type GQLDeleteNoteMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLDeleteNoteMutation = { __typename?: 'Mutation', deleteNote: boolean };

export type GQLUserWithAllDataQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLUserWithAllDataQuery = { __typename?: 'Query', userWithAllData?: { __typename?: 'User', id: string, email: string, name?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string, profile?: { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null } | undefined | null, trainer?: { __typename?: 'UserPublic', id: string } | undefined | null, clients: Array<{ __typename?: 'UserPublic', id: string }> } | undefined | null };

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
  createdAt
  updatedAt
  email
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
        additionalInstructions
        type
        order
        videoUrl
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
    `;
export const FitspaceDashboardDocument = `
    query FitspaceDashboard {
  myTrainer {
    id
    firstName
    lastName
    image
    sex
    averageRating
    yearsOfExperience
  }
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

export const useFitspaceDashboardQuery = <
      TData = GQLFitspaceDashboardQuery,
      TError = unknown
    >(
      variables?: GQLFitspaceDashboardQueryVariables,
      options?: Omit<UseQueryOptions<GQLFitspaceDashboardQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLFitspaceDashboardQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLFitspaceDashboardQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['FitspaceDashboard'] : ['FitspaceDashboard', variables],
    queryFn: fetchData<GQLFitspaceDashboardQuery, GQLFitspaceDashboardQueryVariables>(FitspaceDashboardDocument, variables),
    ...options
  }
    )};

useFitspaceDashboardQuery.getKey = (variables?: GQLFitspaceDashboardQueryVariables) => variables === undefined ? ['FitspaceDashboard'] : ['FitspaceDashboard', variables];

export const useInfiniteFitspaceDashboardQuery = <
      TData = InfiniteData<GQLFitspaceDashboardQuery>,
      TError = unknown
    >(
      variables: GQLFitspaceDashboardQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLFitspaceDashboardQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLFitspaceDashboardQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLFitspaceDashboardQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['FitspaceDashboard.infinite'] : ['FitspaceDashboard.infinite', variables],
      queryFn: (metaData) => fetchData<GQLFitspaceDashboardQuery, GQLFitspaceDashboardQueryVariables>(FitspaceDashboardDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteFitspaceDashboardQuery.getKey = (variables?: GQLFitspaceDashboardQueryVariables) => variables === undefined ? ['FitspaceDashboard.infinite'] : ['FitspaceDashboard.infinite', variables];


useFitspaceDashboardQuery.fetcher = (variables?: GQLFitspaceDashboardQueryVariables, options?: RequestInit['headers']) => fetchData<GQLFitspaceDashboardQuery, GQLFitspaceDashboardQueryVariables>(FitspaceDashboardDocument, variables, options);

export const FitspaceMyPlansDocument = `
    query FitspaceMyPlans {
  getMyPlansOverview {
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
      muscleGroups {
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
      muscleGroups {
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
    muscleGroups {
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
      days {
        id
        dayOfWeek
        isRestDay
        exercises {
          id
          name
          baseId
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
    mutation AddExercisesToQuickWorkout($exerciseIds: [ID!]!) {
  addExercisesToQuickWorkout(exerciseIds: $exerciseIds) {
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
    muscleGroups {
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
    muscleGroups {
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
    query GetMealPlanTemplates($draft: Boolean) {
  getMealPlanTemplates(draft: $draft) {
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

export const UpdateMealPlanDocument = `
    mutation UpdateMealPlan($input: UpdateMealPlanInput!) {
  updateMealPlan(input: $input)
}
    `;

export const useUpdateMealPlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateMealPlanMutation, TError, GQLUpdateMealPlanMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateMealPlanMutation, TError, GQLUpdateMealPlanMutationVariables, TContext>(
      {
    mutationKey: ['UpdateMealPlan'],
    mutationFn: (variables?: GQLUpdateMealPlanMutationVariables) => fetchData<GQLUpdateMealPlanMutation, GQLUpdateMealPlanMutationVariables>(UpdateMealPlanDocument, variables)(),
    ...options
  }
    )};

useUpdateMealPlanMutation.getKey = () => ['UpdateMealPlan'];


useUpdateMealPlanMutation.fetcher = (variables: GQLUpdateMealPlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateMealPlanMutation, GQLUpdateMealPlanMutationVariables>(UpdateMealPlanDocument, variables, options);

export const DeleteMealPlanDocument = `
    mutation DeleteMealPlan($id: ID!) {
  deleteMealPlan(id: $id)
}
    `;

export const useDeleteMealPlanMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDeleteMealPlanMutation, TError, GQLDeleteMealPlanMutationVariables, TContext>) => {
    
    return useMutation<GQLDeleteMealPlanMutation, TError, GQLDeleteMealPlanMutationVariables, TContext>(
      {
    mutationKey: ['DeleteMealPlan'],
    mutationFn: (variables?: GQLDeleteMealPlanMutationVariables) => fetchData<GQLDeleteMealPlanMutation, GQLDeleteMealPlanMutationVariables>(DeleteMealPlanDocument, variables)(),
    ...options
  }
    )};

useDeleteMealPlanMutation.getKey = () => ['DeleteMealPlan'];


useDeleteMealPlanMutation.fetcher = (variables: GQLDeleteMealPlanMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDeleteMealPlanMutation, GQLDeleteMealPlanMutationVariables>(DeleteMealPlanDocument, variables, options);

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

export const UpdateMealWeekDetailsDocument = `
    mutation UpdateMealWeekDetails($input: UpdateMealWeekDetailsInput!) {
  updateMealWeekDetails(input: $input)
}
    `;

export const useUpdateMealWeekDetailsMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateMealWeekDetailsMutation, TError, GQLUpdateMealWeekDetailsMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateMealWeekDetailsMutation, TError, GQLUpdateMealWeekDetailsMutationVariables, TContext>(
      {
    mutationKey: ['UpdateMealWeekDetails'],
    mutationFn: (variables?: GQLUpdateMealWeekDetailsMutationVariables) => fetchData<GQLUpdateMealWeekDetailsMutation, GQLUpdateMealWeekDetailsMutationVariables>(UpdateMealWeekDetailsDocument, variables)(),
    ...options
  }
    )};

useUpdateMealWeekDetailsMutation.getKey = () => ['UpdateMealWeekDetails'];


useUpdateMealWeekDetailsMutation.fetcher = (variables: GQLUpdateMealWeekDetailsMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateMealWeekDetailsMutation, GQLUpdateMealWeekDetailsMutationVariables>(UpdateMealWeekDetailsDocument, variables, options);

export const UpdateMealDayDataDocument = `
    mutation UpdateMealDayData($input: UpdateMealDayDataInput!) {
  updateMealDayData(input: $input)
}
    `;

export const useUpdateMealDayDataMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateMealDayDataMutation, TError, GQLUpdateMealDayDataMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateMealDayDataMutation, TError, GQLUpdateMealDayDataMutationVariables, TContext>(
      {
    mutationKey: ['UpdateMealDayData'],
    mutationFn: (variables?: GQLUpdateMealDayDataMutationVariables) => fetchData<GQLUpdateMealDayDataMutation, GQLUpdateMealDayDataMutationVariables>(UpdateMealDayDataDocument, variables)(),
    ...options
  }
    )};

useUpdateMealDayDataMutation.getKey = () => ['UpdateMealDayData'];


useUpdateMealDayDataMutation.fetcher = (variables: GQLUpdateMealDayDataMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateMealDayDataMutation, GQLUpdateMealDayDataMutationVariables>(UpdateMealDayDataDocument, variables, options);

export const AddMealToDayDocument = `
    mutation AddMealToDay($input: AddMealToDayInput!) {
  addMealToDay(input: $input)
}
    `;

export const useAddMealToDayMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAddMealToDayMutation, TError, GQLAddMealToDayMutationVariables, TContext>) => {
    
    return useMutation<GQLAddMealToDayMutation, TError, GQLAddMealToDayMutationVariables, TContext>(
      {
    mutationKey: ['AddMealToDay'],
    mutationFn: (variables?: GQLAddMealToDayMutationVariables) => fetchData<GQLAddMealToDayMutation, GQLAddMealToDayMutationVariables>(AddMealToDayDocument, variables)(),
    ...options
  }
    )};

useAddMealToDayMutation.getKey = () => ['AddMealToDay'];


useAddMealToDayMutation.fetcher = (variables: GQLAddMealToDayMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAddMealToDayMutation, GQLAddMealToDayMutationVariables>(AddMealToDayDocument, variables, options);

export const UpdateMealDocument = `
    mutation UpdateMeal($input: UpdateMealInput!) {
  updateMeal(input: $input)
}
    `;

export const useUpdateMealMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateMealMutation, TError, GQLUpdateMealMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateMealMutation, TError, GQLUpdateMealMutationVariables, TContext>(
      {
    mutationKey: ['UpdateMeal'],
    mutationFn: (variables?: GQLUpdateMealMutationVariables) => fetchData<GQLUpdateMealMutation, GQLUpdateMealMutationVariables>(UpdateMealDocument, variables)(),
    ...options
  }
    )};

useUpdateMealMutation.getKey = () => ['UpdateMeal'];


useUpdateMealMutation.fetcher = (variables: GQLUpdateMealMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateMealMutation, GQLUpdateMealMutationVariables>(UpdateMealDocument, variables, options);

export const RemoveMealFromDayDocument = `
    mutation RemoveMealFromDay($mealId: ID!) {
  removeMealFromDay(mealId: $mealId)
}
    `;

export const useRemoveMealFromDayMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveMealFromDayMutation, TError, GQLRemoveMealFromDayMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveMealFromDayMutation, TError, GQLRemoveMealFromDayMutationVariables, TContext>(
      {
    mutationKey: ['RemoveMealFromDay'],
    mutationFn: (variables?: GQLRemoveMealFromDayMutationVariables) => fetchData<GQLRemoveMealFromDayMutation, GQLRemoveMealFromDayMutationVariables>(RemoveMealFromDayDocument, variables)(),
    ...options
  }
    )};

useRemoveMealFromDayMutation.getKey = () => ['RemoveMealFromDay'];


useRemoveMealFromDayMutation.fetcher = (variables: GQLRemoveMealFromDayMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveMealFromDayMutation, GQLRemoveMealFromDayMutationVariables>(RemoveMealFromDayDocument, variables, options);

export const AddFoodToMealDocument = `
    mutation AddFoodToMeal($input: AddFoodToMealInput!) {
  addFoodToMeal(input: $input)
}
    `;

export const useAddFoodToMealMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLAddFoodToMealMutation, TError, GQLAddFoodToMealMutationVariables, TContext>) => {
    
    return useMutation<GQLAddFoodToMealMutation, TError, GQLAddFoodToMealMutationVariables, TContext>(
      {
    mutationKey: ['AddFoodToMeal'],
    mutationFn: (variables?: GQLAddFoodToMealMutationVariables) => fetchData<GQLAddFoodToMealMutation, GQLAddFoodToMealMutationVariables>(AddFoodToMealDocument, variables)(),
    ...options
  }
    )};

useAddFoodToMealMutation.getKey = () => ['AddFoodToMeal'];


useAddFoodToMealMutation.fetcher = (variables: GQLAddFoodToMealMutationVariables, options?: RequestInit['headers']) => fetchData<GQLAddFoodToMealMutation, GQLAddFoodToMealMutationVariables>(AddFoodToMealDocument, variables, options);

export const UpdateMealFoodDocument = `
    mutation UpdateMealFood($input: UpdateMealFoodInput!) {
  updateMealFood(input: $input)
}
    `;

export const useUpdateMealFoodMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateMealFoodMutation, TError, GQLUpdateMealFoodMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateMealFoodMutation, TError, GQLUpdateMealFoodMutationVariables, TContext>(
      {
    mutationKey: ['UpdateMealFood'],
    mutationFn: (variables?: GQLUpdateMealFoodMutationVariables) => fetchData<GQLUpdateMealFoodMutation, GQLUpdateMealFoodMutationVariables>(UpdateMealFoodDocument, variables)(),
    ...options
  }
    )};

useUpdateMealFoodMutation.getKey = () => ['UpdateMealFood'];


useUpdateMealFoodMutation.fetcher = (variables: GQLUpdateMealFoodMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateMealFoodMutation, GQLUpdateMealFoodMutationVariables>(UpdateMealFoodDocument, variables, options);

export const RemoveFoodFromMealDocument = `
    mutation RemoveFoodFromMeal($foodId: ID!) {
  removeFoodFromMeal(foodId: $foodId)
}
    `;

export const useRemoveFoodFromMealMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLRemoveFoodFromMealMutation, TError, GQLRemoveFoodFromMealMutationVariables, TContext>) => {
    
    return useMutation<GQLRemoveFoodFromMealMutation, TError, GQLRemoveFoodFromMealMutationVariables, TContext>(
      {
    mutationKey: ['RemoveFoodFromMeal'],
    mutationFn: (variables?: GQLRemoveFoodFromMealMutationVariables) => fetchData<GQLRemoveFoodFromMealMutation, GQLRemoveFoodFromMealMutationVariables>(RemoveFoodFromMealDocument, variables)(),
    ...options
  }
    )};

useRemoveFoodFromMealMutation.getKey = () => ['RemoveFoodFromMeal'];


useRemoveFoodFromMealMutation.fetcher = (variables: GQLRemoveFoodFromMealMutationVariables, options?: RequestInit['headers']) => fetchData<GQLRemoveFoodFromMealMutation, GQLRemoveFoodFromMealMutationVariables>(RemoveFoodFromMealDocument, variables, options);

export const LogMealFoodDocument = `
    mutation LogMealFood($input: LogMealFoodInput!) {
  logMealFood(input: $input) {
    id
    name
    quantity
    unit
    calories
    protein
    carbs
    fat
    fiber
    notes
    createdAt
  }
}
    `;

export const useLogMealFoodMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLLogMealFoodMutation, TError, GQLLogMealFoodMutationVariables, TContext>) => {
    
    return useMutation<GQLLogMealFoodMutation, TError, GQLLogMealFoodMutationVariables, TContext>(
      {
    mutationKey: ['LogMealFood'],
    mutationFn: (variables?: GQLLogMealFoodMutationVariables) => fetchData<GQLLogMealFoodMutation, GQLLogMealFoodMutationVariables>(LogMealFoodDocument, variables)(),
    ...options
  }
    )};

useLogMealFoodMutation.getKey = () => ['LogMealFood'];


useLogMealFoodMutation.fetcher = (variables: GQLLogMealFoodMutationVariables, options?: RequestInit['headers']) => fetchData<GQLLogMealFoodMutation, GQLLogMealFoodMutationVariables>(LogMealFoodDocument, variables, options);

export const UpdateMealFoodLogDocument = `
    mutation UpdateMealFoodLog($input: UpdateMealFoodLogInput!) {
  updateMealFoodLog(input: $input)
}
    `;

export const useUpdateMealFoodLogMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLUpdateMealFoodLogMutation, TError, GQLUpdateMealFoodLogMutationVariables, TContext>) => {
    
    return useMutation<GQLUpdateMealFoodLogMutation, TError, GQLUpdateMealFoodLogMutationVariables, TContext>(
      {
    mutationKey: ['UpdateMealFoodLog'],
    mutationFn: (variables?: GQLUpdateMealFoodLogMutationVariables) => fetchData<GQLUpdateMealFoodLogMutation, GQLUpdateMealFoodLogMutationVariables>(UpdateMealFoodLogDocument, variables)(),
    ...options
  }
    )};

useUpdateMealFoodLogMutation.getKey = () => ['UpdateMealFoodLog'];


useUpdateMealFoodLogMutation.fetcher = (variables: GQLUpdateMealFoodLogMutationVariables, options?: RequestInit['headers']) => fetchData<GQLUpdateMealFoodLogMutation, GQLUpdateMealFoodLogMutationVariables>(UpdateMealFoodLogDocument, variables, options);

export const DeleteMealFoodLogDocument = `
    mutation DeleteMealFoodLog($id: ID!) {
  deleteMealFoodLog(id: $id)
}
    `;

export const useDeleteMealFoodLogMutation = <
      TError = unknown,
      TContext = unknown
    >(options?: UseMutationOptions<GQLDeleteMealFoodLogMutation, TError, GQLDeleteMealFoodLogMutationVariables, TContext>) => {
    
    return useMutation<GQLDeleteMealFoodLogMutation, TError, GQLDeleteMealFoodLogMutationVariables, TContext>(
      {
    mutationKey: ['DeleteMealFoodLog'],
    mutationFn: (variables?: GQLDeleteMealFoodLogMutationVariables) => fetchData<GQLDeleteMealFoodLogMutation, GQLDeleteMealFoodLogMutationVariables>(DeleteMealFoodLogDocument, variables)(),
    ...options
  }
    )};

useDeleteMealFoodLogMutation.getKey = () => ['DeleteMealFoodLog'];


useDeleteMealFoodLogMutation.fetcher = (variables: GQLDeleteMealFoodLogMutationVariables, options?: RequestInit['headers']) => fetchData<GQLDeleteMealFoodLogMutation, GQLDeleteMealFoodLogMutationVariables>(DeleteMealFoodLogDocument, variables, options);

export const GetTemplatesDocument = `
    query GetTemplates($draft: Boolean) {
  getTemplates(draft: $draft) {
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

export const CreateNoteDocument = `
    mutation CreateNote($input: CreateNoteInput!) {
  createNote(input: $input) {
    id
    text
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

export const UpdateNoteDocument = `
    mutation UpdateNote($input: UpdateNoteInput!) {
  updateNote(input: $input) {
    id
    text
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
