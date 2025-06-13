'use server'

import { cookies, headers } from 'next/headers'

import { type GqlFetchOptions, gqlFetch } from './graphql'

/**
 *
 * Use this function from server components to get data from the GraphQL server.
 *
 * @param query - GraphQL query
 * @param variables - GraphQL query variables
 * @param options - Fetch options - cache, next
 * @returns GraphQL response
 *
 * @example
 * ```tsx
 * const { data, error } = await gqlServerFetch<GQLCmsArticleCategoriesQuery>(
 *  CmsArticleCategoriesDocument,
 *  {
 *    type: GQLCmsArticleType.News
 *  },
 *  { cache: "no-store" }
 * );
 * ```
 */
export const gqlServerFetch = async <TData, TVariables = object>(
  query: string,
  variables?: TVariables,
  options?: GqlFetchOptions,
) => {
  try {
    const vercelJwt = (await headers()).get('x-vercel-jwt')
    const cookie = (await cookies()).toString()

    // eslint-disable-next-line no-console
    console.log({ vercelJwt, cookie })
    const response = await gqlFetch<TData, TVariables>(
      query,
      variables,
      {
        ...options,
        headers: {
          cookie,
          ...(vercelJwt ? { Authorization: `Bearer ${vercelJwt}` } : {}),
          ...options?.headers,
          'Content-Type': 'application/json',
        },
      },
      true,
    )

    return {
      data: response,
      error: null,
    }
  } catch (error) {
    console.error(error)
    return {
      data: null,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}
