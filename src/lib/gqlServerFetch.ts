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

async function getInternalApiUrl(path: string): Promise<string> {
  const hdrs = await headers()
  const host =
    hdrs.get('host') ?? process.env.NEXT_PUBLIC_VERCEL_URL ?? 'localhost:4000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  return `${protocol}://${host}${path}`
}

export const gqlServerFetch = async <TData, TVariables = object>(
  query: string,
  variables?: TVariables,
  options?: GqlFetchOptions,
) => {
  const endpoint = await getInternalApiUrl('/api/graphql')
  console.log('endpoint', endpoint, query.slice(0, 100))
  try {
    const cookieStore = await cookies()
    const cookie = cookieStore.toString()
    const response = await gqlFetch<TData, TVariables>(
      query,
      variables,
      {
        ...options,
        headers: {
          cookie,
          ...options?.headers,
          'Content-Type': 'application/json',
        },
      },
      endpoint,
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
