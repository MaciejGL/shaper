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

export type GQLAssignTrainingPlanToClientInput = {
  clientId: Scalars['ID']['input'];
  planId: Scalars['ID']['input'];
  startDate?: InputMaybe<Scalars['String']['input']>;
};

export type GQLBaseExercise = {
  __typename?: 'BaseExercise';
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<GQLUserPublic>;
  description?: Maybe<Scalars['String']['output']>;
  equipment?: Maybe<GQLEquipment>;
  id: Scalars['ID']['output'];
  isPublic: Scalars['Boolean']['output'];
  muscleGroupCategories: Array<GQLMuscleGroupCategory>;
  muscleGroups: Array<GQLMuscleGroup>;
  name: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
  videoUrl?: Maybe<Scalars['String']['output']>;
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

export type GQLCreateTrainingDayInput = {
  dayOfWeek: Scalars['Int']['input'];
  exercises?: InputMaybe<Array<GQLCreateTrainingExerciseInput>>;
  isRestDay: Scalars['Boolean']['input'];
  workoutType?: InputMaybe<Scalars['String']['input']>;
};

export type GQLCreateTrainingExerciseInput = {
  baseId?: InputMaybe<Scalars['ID']['input']>;
  instructions?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  order: Scalars['Int']['input'];
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  sets?: InputMaybe<Array<GQLCreateExerciseSetInput>>;
  tempo?: InputMaybe<Scalars['String']['input']>;
  videoUrl?: InputMaybe<Scalars['String']['input']>;
  warmupSets?: InputMaybe<Scalars['Int']['input']>;
};

export type GQLCreateTrainingPlanInput = {
  description?: InputMaybe<Scalars['String']['input']>;
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

export enum GQLDifficulty {
  Advanced = 'ADVANCED',
  Beginner = 'BEGINNER',
  Expert = 'EXPERT',
  Intermediate = 'INTERMEDIATE'
}

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

export type GQLExerciseSet = {
  __typename?: 'ExerciseSet';
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  exerciseId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
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

export type GQLGetWorkoutPayload = {
  __typename?: 'GetWorkoutPayload';
  navigation: GQLWorkoutNavigation;
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

export type GQLLogSetInput = {
  loggedReps?: InputMaybe<Scalars['Int']['input']>;
  loggedWeight?: InputMaybe<Scalars['Float']['input']>;
  setId: Scalars['ID']['input'];
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
  assignTrainingPlanToClient: Scalars['Boolean']['output'];
  cancelCoachingRequest?: Maybe<GQLCoachingRequest>;
  closePlan: Scalars['Boolean']['output'];
  createCoachingRequest: GQLCoachingRequest;
  createExercise: Scalars['Boolean']['output'];
  createNote: GQLNote;
  createNotification: GQLNotification;
  createTrainingPlan: GQLCreateTrainingPlanPayload;
  deleteExercise: Scalars['Boolean']['output'];
  deleteNote: Scalars['Boolean']['output'];
  deleteNotification: Scalars['Boolean']['output'];
  deletePlan: Scalars['Boolean']['output'];
  deleteTrainingPlan: Scalars['Boolean']['output'];
  duplicateTrainingPlan: Scalars['ID']['output'];
  logWorkoutProgress: Scalars['ID']['output'];
  logWorkoutSessionEvent: Scalars['ID']['output'];
  markAllNotificationsRead: Array<GQLNotification>;
  markExerciseAsCompleted?: Maybe<Scalars['Boolean']['output']>;
  markNotificationRead: GQLNotification;
  markSetAsCompleted?: Maybe<Scalars['Boolean']['output']>;
  markWorkoutAsCompleted?: Maybe<Scalars['Boolean']['output']>;
  pausePlan: Scalars['Boolean']['output'];
  rejectCoachingRequest?: Maybe<GQLCoachingRequest>;
  removeTrainingPlanFromClient: Scalars['Boolean']['output'];
  updateExercise: Scalars['Boolean']['output'];
  updateNote: GQLNote;
  updateNotification: GQLNotification;
  updateProfile?: Maybe<GQLUserProfile>;
  updateSetLog?: Maybe<GQLExerciseSetLog>;
  updateTrainingPlan: Scalars['Boolean']['output'];
};


export type GQLMutationAcceptCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationActivatePlanArgs = {
  planId: Scalars['ID']['input'];
  resume: Scalars['Boolean']['input'];
  startDate: Scalars['String']['input'];
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


export type GQLMutationCreateNoteArgs = {
  input: GQLCreateNoteInput;
};


export type GQLMutationCreateNotificationArgs = {
  input: GQLCreateNotificationInput;
};


export type GQLMutationCreateTrainingPlanArgs = {
  input: GQLCreateTrainingPlanInput;
};


export type GQLMutationDeleteExerciseArgs = {
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


export type GQLMutationDeleteTrainingPlanArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationDuplicateTrainingPlanArgs = {
  id: Scalars['ID']['input'];
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


export type GQLMutationPausePlanArgs = {
  planId: Scalars['ID']['input'];
};


export type GQLMutationRejectCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationRemoveTrainingPlanFromClientArgs = {
  clientId: Scalars['ID']['input'];
  planId: Scalars['ID']['input'];
};


export type GQLMutationUpdateExerciseArgs = {
  id: Scalars['ID']['input'];
  input: GQLUpdateExerciseInput;
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


export type GQLMutationUpdateSetLogArgs = {
  input: GQLLogSetInput;
};


export type GQLMutationUpdateTrainingPlanArgs = {
  input: GQLUpdateTrainingPlanInput;
};

export type GQLMyPlansPayload = {
  __typename?: 'MyPlansPayload';
  activePlan?: Maybe<GQLTrainingPlan>;
  availablePlans: Array<GQLTrainingPlan>;
  completedPlans: Array<GQLTrainingPlan>;
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
  NewTrainingPlanAssigned = 'NEW_TRAINING_PLAN_ASSIGNED',
  Reminder = 'REMINDER',
  System = 'SYSTEM'
}

export type GQLQuery = {
  __typename?: 'Query';
  coachingRequest?: Maybe<GQLCoachingRequest>;
  coachingRequests: Array<GQLCoachingRequest>;
  exercise?: Maybe<GQLBaseExercise>;
  getClientActivePlan?: Maybe<GQLTrainingPlan>;
  getClientTrainingPlans: Array<GQLTrainingPlan>;
  getMyPlansOverview: GQLMyPlansPayload;
  getTemplates: Array<GQLTrainingPlan>;
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
};


export type GQLQueryCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryExerciseArgs = {
  id: Scalars['ID']['input'];
};


export type GQLQueryGetClientActivePlanArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLQueryGetClientTrainingPlansArgs = {
  clientId: Scalars['ID']['input'];
};


export type GQLQueryGetTemplatesArgs = {
  draft?: InputMaybe<Scalars['Boolean']['input']>;
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

export type GQLReview = {
  __typename?: 'Review';
  comment: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  createdBy?: Maybe<GQLUserPublic>;
  id: Scalars['ID']['output'];
  rating: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
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
  startedAt?: Maybe<Scalars['String']['output']>;
  trainingWeekId: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
  workoutType?: Maybe<GQLWorkoutType>;
};

export type GQLTrainingExercise = {
  __typename?: 'TrainingExercise';
  baseId?: Maybe<Scalars['ID']['output']>;
  completedAt?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['String']['output'];
  dayId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  instructions?: Maybe<Scalars['String']['output']>;
  logs: Array<GQLExerciseLog>;
  muscleGroups: Array<GQLMuscleGroup>;
  name: Scalars['String']['output'];
  order: Scalars['Int']['output'];
  restSeconds?: Maybe<Scalars['Int']['output']>;
  sets: Array<GQLExerciseSet>;
  tempo?: Maybe<Scalars['String']['output']>;
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
  difficulty: GQLDifficulty;
  endDate?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  isDraft: Scalars['Boolean']['output'];
  isPublic: Scalars['Boolean']['output'];
  isTemplate: Scalars['Boolean']['output'];
  nextSession?: Maybe<Scalars['String']['output']>;
  progress?: Maybe<Scalars['Float']['output']>;
  rating?: Maybe<Scalars['Float']['output']>;
  reviews: Array<GQLReview>;
  startDate?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  totalReviews: Scalars['Int']['output'];
  totalWorkouts: Scalars['Int']['output'];
  updatedAt: Scalars['String']['output'];
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
  name: Scalars['String']['output'];
  trainingPlanId: Scalars['ID']['output'];
  updatedAt: Scalars['String']['output'];
  weekNumber: Scalars['Int']['output'];
};

export type GQLUpdateExerciseInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  equipment?: InputMaybe<GQLEquipment>;
  muscleGroups: Array<Scalars['ID']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  videoUrl?: InputMaybe<Scalars['String']['input']>;
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

export type GQLUpdateTrainingDayInput = {
  dayOfWeek: Scalars['Int']['input'];
  exercises?: InputMaybe<Array<GQLUpdateTrainingExerciseInput>>;
  id: Scalars['ID']['input'];
  isRestDay?: InputMaybe<Scalars['Boolean']['input']>;
  workoutType?: InputMaybe<Scalars['String']['input']>;
};

export type GQLUpdateTrainingExerciseInput = {
  baseId?: InputMaybe<Scalars['ID']['input']>;
  id: Scalars['ID']['input'];
  instructions?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  order: Scalars['Int']['input'];
  restSeconds?: InputMaybe<Scalars['Int']['input']>;
  sets?: InputMaybe<Array<GQLUpdateExerciseSetInput>>;
  tempo?: InputMaybe<Scalars['String']['input']>;
  videoUrl?: InputMaybe<Scalars['String']['input']>;
  warmupSets?: InputMaybe<Scalars['Int']['input']>;
};

export type GQLUpdateTrainingPlanInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  isDraft?: InputMaybe<Scalars['Boolean']['input']>;
  isPublic?: InputMaybe<Scalars['Boolean']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  weeks?: InputMaybe<Array<GQLUpdateTrainingWeekInput>>;
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
  biceps?: Maybe<Scalars['Float']['output']>;
  bodyFat?: Maybe<Scalars['Float']['output']>;
  calf?: Maybe<Scalars['Float']['output']>;
  chest?: Maybe<Scalars['Float']['output']>;
  height?: Maybe<Scalars['Float']['output']>;
  hips?: Maybe<Scalars['Float']['output']>;
  id: Scalars['ID']['output'];
  measuredAt: Scalars['String']['output'];
  neck?: Maybe<Scalars['Float']['output']>;
  notes?: Maybe<Scalars['String']['output']>;
  thigh?: Maybe<Scalars['Float']['output']>;
  userProfile: GQLUserProfile;
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

export type GQLWorkoutNavigation = {
  __typename?: 'WorkoutNavigation';
  currentDayIndex: Scalars['Int']['output'];
  currentWeekIndex: Scalars['Int']['output'];
  firstUncompletedDayIndex: Scalars['Int']['output'];
  firstUncompletedWeekIndex: Scalars['Int']['output'];
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


export type GQLFitspaceDashboardQuery = { __typename?: 'Query', myTrainer?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, sex?: string | undefined | null, averageRating?: number | undefined | null, yearsOfExperience?: number | undefined | null } | undefined | null, getWorkout?: { __typename?: 'GetWorkoutPayload', navigation: { __typename?: 'WorkoutNavigation', currentWeekIndex: number, currentDayIndex: number, firstUncompletedWeekIndex: number, firstUncompletedDayIndex: number }, plan: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, startDate?: string | undefined | null, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, completedAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, startedAt?: string | undefined | null, completedAt?: string | undefined | null, duration?: number | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, sets: Array<{ __typename?: 'ExerciseSet', id: string }>, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null }> }> }> }> } } | undefined | null };

export type GQLFitspaceMyPlansQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceMyPlansQuery = { __typename?: 'Query', getMyPlansOverview: { __typename?: 'MyPlansPayload', activePlan?: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, difficulty: GQLDifficulty, totalWorkouts: number, rating?: number | undefined | null, totalReviews: number, weekCount: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, startDate?: string | undefined | null, endDate?: string | undefined | null, updatedAt: string, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, completedAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, restSeconds?: number | undefined | null, videoUrl?: string | undefined | null, instructions?: string | undefined | null, name: string, warmupSets?: number | undefined | null, completedAt?: string | undefined | null, muscleGroups: Array<{ __typename?: 'MuscleGroup', id: string, name: string, alias?: string | undefined | null }>, sets: Array<{ __typename?: 'ExerciseSet', id: string }> }> }> }> } | undefined | null, availablePlans: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, difficulty: GQLDifficulty, totalWorkouts: number, rating?: number | undefined | null, totalReviews: number, weekCount: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, startDate?: string | undefined | null, endDate?: string | undefined | null, updatedAt: string, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, sex?: string | undefined | null } | undefined | null }>, completedPlans: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, difficulty: GQLDifficulty, totalWorkouts: number, rating?: number | undefined | null, totalReviews: number, weekCount: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, startDate?: string | undefined | null, endDate?: string | undefined | null, completedAt?: string | undefined | null, updatedAt: string, createdBy?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, sex?: string | undefined | null } | undefined | null }> }, getWorkout?: { __typename?: 'GetWorkoutPayload', navigation: { __typename?: 'WorkoutNavigation', currentWeekIndex: number, currentDayIndex: number, firstUncompletedWeekIndex: number, firstUncompletedDayIndex: number } } | undefined | null };

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

export type GQLProfileFragmentFragment = { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null, avatarUrl?: string | undefined | null, height?: number | undefined | null, weight?: number | undefined | null, fitnessLevel?: GQLFitnessLevel | undefined | null, allergies?: string | undefined | null, activityLevel?: GQLActivityLevel | undefined | null, goals: Array<GQLGoal>, bio?: string | undefined | null, createdAt: string, updatedAt: string, email?: string | undefined | null };

export type GQLProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLProfileQuery = { __typename?: 'Query', profile?: { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null, avatarUrl?: string | undefined | null, height?: number | undefined | null, weight?: number | undefined | null, fitnessLevel?: GQLFitnessLevel | undefined | null, allergies?: string | undefined | null, activityLevel?: GQLActivityLevel | undefined | null, goals: Array<GQLGoal>, bio?: string | undefined | null, createdAt: string, updatedAt: string, email?: string | undefined | null } | undefined | null };

export type GQLUpdateProfileMutationVariables = Exact<{
  input: GQLUpdateProfileInput;
}>;


export type GQLUpdateProfileMutation = { __typename?: 'Mutation', updateProfile?: { __typename?: 'UserProfile', id: string } | undefined | null };

export type GQLFitspaceGetCurrentWorkoutIdQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLFitspaceGetCurrentWorkoutIdQuery = { __typename?: 'Query', getMyPlansOverview: { __typename?: 'MyPlansPayload', activePlan?: { __typename?: 'TrainingPlan', id: string } | undefined | null } };

export type GQLFitspaceGetWorkoutQueryVariables = Exact<{
  trainingId: Scalars['ID']['input'];
}>;


export type GQLFitspaceGetWorkoutQuery = { __typename?: 'Query', getWorkout?: { __typename?: 'GetWorkoutPayload', navigation: { __typename?: 'WorkoutNavigation', currentWeekIndex: number, currentDayIndex: number, firstUncompletedWeekIndex: number, firstUncompletedDayIndex: number }, plan: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, startDate?: string | undefined | null, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, completedAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, startedAt?: string | undefined | null, completedAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, restSeconds?: number | undefined | null, tempo?: string | undefined | null, warmupSets?: number | undefined | null, instructions?: string | undefined | null, order: number, videoUrl?: string | undefined | null, completedAt?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, completedAt?: string | undefined | null, log?: { __typename?: 'ExerciseSetLog', id: string, weight?: number | undefined | null, rpe?: number | undefined | null, reps?: number | undefined | null, createdAt: string } | undefined | null }> }> }> }> } } | undefined | null };

export type GQLFitspaceGetWorkoutInfoQueryVariables = Exact<{
  dayId: Scalars['ID']['input'];
}>;


export type GQLFitspaceGetWorkoutInfoQuery = { __typename?: 'Query', getWorkoutInfo: { __typename?: 'TrainingDay', id: string, duration?: number | undefined | null } };

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

export type GQLGetClientsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetClientsQuery = { __typename?: 'Query', myClients: Array<{ __typename?: 'UserPublic', id: string, email: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole, updatedAt: string, createdAt: string, activePlan?: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, weekCount: number, startDate?: string | undefined | null } | undefined | null }> };

export type GQLCreateCoachingRequestMutationVariables = Exact<{
  recipientEmail: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
}>;


export type GQLCreateCoachingRequestMutation = { __typename?: 'Mutation', createCoachingRequest: { __typename?: 'CoachingRequest', id: string } };

export type GQLGetClientByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLGetClientByIdQuery = { __typename?: 'Query', userPublic?: { __typename?: 'UserPublic', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, email: string, phone?: string | undefined | null, image?: string | undefined | null, sex?: string | undefined | null, birthday?: string | undefined | null, goals: Array<GQLGoal>, currentWeight?: number | undefined | null, height?: number | undefined | null, allergies?: string | undefined | null } | undefined | null, getClientTrainingPlans: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, weekCount: number, startDate?: string | undefined | null, endDate?: string | undefined | null, active: boolean, progress?: number | undefined | null, nextSession?: string | undefined | null }>, getClientActivePlan?: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, weekCount: number, startDate?: string | undefined | null, endDate?: string | undefined | null, active: boolean, progress?: number | undefined | null, nextSession?: string | undefined | null, difficulty: GQLDifficulty, totalWorkouts: number, currentWeekNumber?: number | undefined | null, completedWorkoutsDays: number, adherence: number, weeks: Array<{ __typename?: 'TrainingWeek', id: string, name: string, completedAt?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, completedAt?: string | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null, completedAt?: string | undefined | null, log?: { __typename?: 'ExerciseSetLog', id: string, reps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null } | undefined | null }> }> }> }> } | undefined | null };

export type GQLUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, email: string, name?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string, profile?: { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null, avatarUrl?: string | undefined | null, activityLevel?: GQLActivityLevel | undefined | null, goals: Array<GQLGoal>, bio?: string | undefined | null, createdAt: string, updatedAt: string, bodyMeasures: Array<{ __typename?: 'UserBodyMeasure', id: string, weight?: number | undefined | null, height?: number | undefined | null, chest?: number | undefined | null, waist?: number | undefined | null, hips?: number | undefined | null, neck?: number | undefined | null, biceps?: number | undefined | null, thigh?: number | undefined | null, calf?: number | undefined | null, bodyFat?: number | undefined | null, notes?: string | undefined | null }> } | undefined | null, trainer?: { __typename?: 'UserPublic', id: string, email: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string } | undefined | null, clients: Array<{ __typename?: 'UserPublic', id: string, email: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string }>, sessions: Array<{ __typename?: 'UserSession', id: string, createdAt: string, expiresAt: string }> } | undefined | null };

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

export type GQLTrainingTemplateFragment = { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, restSeconds?: number | undefined | null, tempo?: string | undefined | null, warmupSets?: number | undefined | null, instructions?: string | undefined | null, order: number, videoUrl?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> }> }> };

export type GQLGetTemplatesQueryVariables = Exact<{
  draft?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GQLGetTemplatesQuery = { __typename?: 'Query', getTemplates: Array<{ __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isDraft: boolean, weekCount: number, assignedCount: number }> };

export type GQLGetTemplateTrainingPlanByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GQLGetTemplateTrainingPlanByIdQuery = { __typename?: 'Query', getTrainingPlanById: { __typename?: 'TrainingPlan', id: string, title: string, description?: string | undefined | null, isPublic: boolean, isTemplate: boolean, isDraft: boolean, weeks: Array<{ __typename?: 'TrainingWeek', id: string, weekNumber: number, name: string, description?: string | undefined | null, days: Array<{ __typename?: 'TrainingDay', id: string, dayOfWeek: number, isRestDay: boolean, workoutType?: GQLWorkoutType | undefined | null, exercises: Array<{ __typename?: 'TrainingExercise', id: string, name: string, restSeconds?: number | undefined | null, tempo?: string | undefined | null, warmupSets?: number | undefined | null, instructions?: string | undefined | null, order: number, videoUrl?: string | undefined | null, sets: Array<{ __typename?: 'ExerciseSet', id: string, order: number, reps?: number | undefined | null, minReps?: number | undefined | null, maxReps?: number | undefined | null, weight?: number | undefined | null, rpe?: number | undefined | null }> }> }> }> } };

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
export const TrainingTemplateFragmentDoc = `
    fragment TrainingTemplate on TrainingPlan {
  id
  title
  description
  isPublic
  isTemplate
  isDraft
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
    navigation {
      currentWeekIndex
      currentDayIndex
      firstUncompletedWeekIndex
      firstUncompletedDayIndex
    }
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
        days {
          id
          dayOfWeek
          isRestDay
          workoutType
          startedAt
          completedAt
          duration
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
        days {
          id
          dayOfWeek
          isRestDay
          workoutType
          completedAt
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
  getWorkout {
    navigation {
      currentWeekIndex
      currentDayIndex
      firstUncompletedWeekIndex
      firstUncompletedDayIndex
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
    navigation {
      currentWeekIndex
      currentDayIndex
      firstUncompletedWeekIndex
      firstUncompletedDayIndex
    }
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
        days {
          id
          dayOfWeek
          isRestDay
          workoutType
          startedAt
          completedAt
          exercises {
            id
            name
            restSeconds
            tempo
            warmupSets
            instructions
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

export const UserDocument = `
    query user {
  user {
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
        weight
        height
        chest
        waist
        hips
        neck
        biceps
        thigh
        calf
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

export const useUserQuery = <
      TData = GQLUserQuery,
      TError = unknown
    >(
      variables?: GQLUserQueryVariables,
      options?: Omit<UseQueryOptions<GQLUserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<GQLUserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<GQLUserQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['user'] : ['user', variables],
    queryFn: fetchData<GQLUserQuery, GQLUserQueryVariables>(UserDocument, variables),
    ...options
  }
    )};

useUserQuery.getKey = (variables?: GQLUserQueryVariables) => variables === undefined ? ['user'] : ['user', variables];

export const useInfiniteUserQuery = <
      TData = InfiniteData<GQLUserQuery>,
      TError = unknown
    >(
      variables: GQLUserQueryVariables,
      options: Omit<UseInfiniteQueryOptions<GQLUserQuery, TError, TData>, 'queryKey'> & { queryKey?: UseInfiniteQueryOptions<GQLUserQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useInfiniteQuery<GQLUserQuery, TError, TData>(
      (() => {
    const { queryKey: optionsQueryKey, ...restOptions } = options;
    return {
      queryKey: optionsQueryKey ?? variables === undefined ? ['user.infinite'] : ['user.infinite', variables],
      queryFn: (metaData) => fetchData<GQLUserQuery, GQLUserQueryVariables>(UserDocument, {...variables, ...(metaData.pageParam ?? {})})(),
      ...restOptions
    }
  })()
    )};

useInfiniteUserQuery.getKey = (variables?: GQLUserQueryVariables) => variables === undefined ? ['user.infinite'] : ['user.infinite', variables];


useUserQuery.fetcher = (variables?: GQLUserQueryVariables, options?: RequestInit['headers']) => fetchData<GQLUserQuery, GQLUserQueryVariables>(UserDocument, variables, options);

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
