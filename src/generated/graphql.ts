import { useQuery, useInfiniteQuery, UseQueryOptions, UseInfiniteQueryOptions, InfiniteData } from '@tanstack/react-query';
import { fetchData } from '../lib/graphql';
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

export type GQLMutation = {
  __typename?: 'Mutation';
  _dummy?: Maybe<Scalars['Boolean']['output']>;
};

export type GQLQuery = {
  __typename?: 'Query';
  user?: Maybe<GQLUser>;
};

export type GQLUser = {
  __typename?: 'User';
  clients: Array<GQLUser>;
  createdAt: Scalars['String']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  profile?: Maybe<GQLUserProfile>;
  role: GQLUserRole;
  sessions: Array<GQLUserSession>;
  trainer?: Maybe<GQLUser>;
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
  activityLevel?: Maybe<Scalars['String']['output']>;
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  birthday?: Maybe<Scalars['String']['output']>;
  bodyMeasures: Array<GQLUserBodyMeasure>;
  createdAt: Scalars['String']['output'];
  firstName?: Maybe<Scalars['String']['output']>;
  goal?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastName?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  sex?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['String']['output'];
  user: GQLUser;
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

export type GQLUserQueryVariables = Exact<{ [key: string]: never; }>;


export type GQLUserQuery = { __typename?: 'Query', user?: { __typename?: 'User', id: string, email: string, name?: string | undefined | null, image?: string | undefined | null, role: GQLUserRole } | undefined | null };



export const UserDocument = `
    query user {
  user {
    id
    email
    name
    image
    role
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
