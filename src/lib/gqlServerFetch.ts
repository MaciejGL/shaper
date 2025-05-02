import { cookies } from 'next/headers';

import { type GqlFetchOptions, gqlFetch } from './graphql';

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
	options?: GqlFetchOptions
) => {
	try {
		const response = await gqlFetch<TData, TVariables>(query, variables, {
			...options,
			headers: {
				cookie: (await cookies()).toString(),
				...options?.headers,
				'Content-Type': 'application/json',
				credentials: 'include',
			},
		});

		return {
			data: response,
			error: null,
		};
	} catch (error) {
		console.error(error);
		return {
			data: null,
			error: error instanceof Error ? error.message : String(error),
		};
	}
};
