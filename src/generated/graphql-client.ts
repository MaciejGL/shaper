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

export type GQLCreateNotificationInput = {
  createdBy?: InputMaybe<Scalars['ID']['input']>;
  link?: InputMaybe<Scalars['String']['input']>;
  message: Scalars['String']['input'];
  relatedItemId?: InputMaybe<Scalars['String']['input']>;
  type: GQLNotificationType;
  userId: Scalars['ID']['input'];
};

export enum GQLFitnessLevel {
  Advanced = 'ADVANCED',
  Beginner = 'BEGINNER',
  Expert = 'EXPERT',
  Intermediate = 'INTERMEDIATE'
}

export enum GQLGoal {
  BuildMuscle = 'BUILD_MUSCLE',
  LoseFat = 'LOSE_FAT',
  Maintain = 'MAINTAIN'
}

export type GQLMutation = {
  __typename?: 'Mutation';
  acceptCoachingRequest?: Maybe<GQLCoachingRequest>;
  cancelCoachingRequest?: Maybe<GQLCoachingRequest>;
  createCoachingRequest: GQLCoachingRequest;
  createNotification: GQLNotification;
  deleteNotification: Scalars['Boolean']['output'];
  markAllNotificationsRead: Array<GQLNotification>;
  markNotificationRead: GQLNotification;
  rejectCoachingRequest?: Maybe<GQLCoachingRequest>;
  updateNotification: GQLNotification;
  updateProfile?: Maybe<GQLUserProfile>;
};


export type GQLMutationAcceptCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationCancelCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationCreateCoachingRequestArgs = {
  message?: InputMaybe<Scalars['String']['input']>;
  recipientEmail: Scalars['String']['input'];
};


export type GQLMutationCreateNotificationArgs = {
  input: GQLCreateNotificationInput;
};


export type GQLMutationDeleteNotificationArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationMarkAllNotificationsReadArgs = {
  userId: Scalars['ID']['input'];
};


export type GQLMutationMarkNotificationReadArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationRejectCoachingRequestArgs = {
  id: Scalars['ID']['input'];
};


export type GQLMutationUpdateNotificationArgs = {
  input: GQLUpdateNotificationInput;
};


export type GQLMutationUpdateProfileArgs = {
  input: GQLUpdateProfileInput;
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
  Reminder = 'REMINDER',
  System = 'SYSTEM'
}

export type GQLQuery = {
  __typename?: 'Query';
  coachingRequest?: Maybe<GQLCoachingRequest>;
  coachingRequests: Array<GQLCoachingRequest>;
  notification?: Maybe<GQLNotification>;
  notifications: Array<GQLNotification>;
  profile?: Maybe<GQLUserProfile>;
  user?: Maybe<GQLUser>;
  userPublic?: Maybe<GQLUserPublic>;
};


export type GQLQueryCoachingRequestArgs = {
  id: Scalars['ID']['input'];
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


export type GQLQueryUserPublicArgs = {
  id: Scalars['ID']['input'];
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
  goal?: InputMaybe<GQLGoal>;
  height?: InputMaybe<Scalars['Float']['input']>;
  lastName?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  sex?: InputMaybe<Scalars['String']['input']>;
  weight?: InputMaybe<Scalars['Float']['input']>;
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
  goal?: Maybe<GQLGoal>;
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
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  lastName?: Maybe<Scalars['String']['output']>;
  role: GQLUserRole;
  updatedAt: Scalars['String']['output'];
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

export type GQLProfileFragmentFragment = { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null, avatarUrl?: string | undefined | null, height?: number | undefined | null, weight?: number | undefined | null, fitnessLevel?: GQLFitnessLevel | undefined | null, allergies?: string | undefined | null, activityLevel?: GQLActivityLevel | undefined | null, goal?: GQLGoal | undefined | null, bio?: string | undefined | null, createdAt: string, updatedAt: string, email?: string | undefined | null };

export type GQLProfileQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLProfileQuery = { __typename?: 'Query', profile?: { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null, avatarUrl?: string | undefined | null, height?: number | undefined | null, weight?: number | undefined | null, fitnessLevel?: GQLFitnessLevel | undefined | null, allergies?: string | undefined | null, activityLevel?: GQLActivityLevel | undefined | null, goal?: GQLGoal | undefined | null, bio?: string | undefined | null, createdAt: string, updatedAt: string, email?: string | undefined | null } | undefined | null };

export type GQLUpdateProfileMutationVariables = Exact<{
  input: GQLUpdateProfileInput;
}>;


export type GQLUpdateProfileMutation = { __typename?: 'Mutation', updateProfile?: { __typename?: 'UserProfile', id: string } | undefined | null };

export type GQLGetClientsQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLGetClientsQuery = { __typename?: 'Query', user?: { __typename?: 'User', clients: Array<{ __typename?: 'UserPublic', id: string, email: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole, updatedAt: string, createdAt: string }> } | undefined | null };

export type GQLCreateCoachingRequestMutationVariables = Exact<{
  recipientEmail: Scalars['String']['input'];
  message?: InputMaybe<Scalars['String']['input']>;
}>;


export type GQLCreateCoachingRequestMutation = { __typename?: 'Mutation', createCoachingRequest: { __typename?: 'CoachingRequest', id: string } };

export type GQLUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, email: string, name?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string, profile?: { __typename?: 'UserProfile', id: string, firstName?: string | undefined | null, lastName?: string | undefined | null, phone?: string | undefined | null, birthday?: string | undefined | null, sex?: string | undefined | null, avatarUrl?: string | undefined | null, activityLevel?: GQLActivityLevel | undefined | null, goal?: GQLGoal | undefined | null, bio?: string | undefined | null, createdAt: string, updatedAt: string, bodyMeasures: Array<{ __typename?: 'UserBodyMeasure', id: string, weight?: number | undefined | null, height?: number | undefined | null, chest?: number | undefined | null, waist?: number | undefined | null, hips?: number | undefined | null, neck?: number | undefined | null, biceps?: number | undefined | null, thigh?: number | undefined | null, calf?: number | undefined | null, bodyFat?: number | undefined | null, notes?: string | undefined | null }> } | undefined | null, trainer?: { __typename?: 'UserPublic', id: string, email: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string } | undefined | null, clients: Array<{ __typename?: 'UserPublic', id: string, email: string, firstName?: string | undefined | null, lastName?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole, createdAt: string, updatedAt: string }>, sessions: Array<{ __typename?: 'UserSession', id: string, createdAt: string, expiresAt: string }> } | undefined | null };

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
  goal
  bio
  createdAt
  updatedAt
  email
}
    `;
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

export const GetClientsDocument = `
    query GetClients {
  user {
    clients {
      id
      email
      firstName
      lastName
      image
      role
      updatedAt
      createdAt
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
      goal
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
