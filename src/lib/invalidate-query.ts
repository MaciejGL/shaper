import { useQueryClient } from '@tanstack/react-query'

import { Exact } from '@/generated/graphql-client'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type QueryKey = (string | Exact<any>)[]

type InvalidateQueryParams =
  | { queryKey: QueryKey; queryKeys?: never }
  | { queryKey?: never; queryKeys: QueryKey[] }

export function useInvalidateQuery() {
  const queryClient = useQueryClient()

  const invalidateQuery = ({ queryKey, queryKeys }: InvalidateQueryParams) => {
    if (queryKeys) {
      queryKeys.forEach((key) => {
        queryClient.invalidateQueries({
          queryKey: [key],
        })
      })
    } else if (queryKey) {
      queryClient.invalidateQueries({
        queryKey,
      })
    }
  }

  return invalidateQuery
}
