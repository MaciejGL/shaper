import { QueryKey, QueryObserver, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

/**
 * Subscribe to an existing query's cache data without creating a new query.
 * Automatically updates when the query refetches or its data changes.
 *
 * @example
 * ```ts
 * const queryKey = useNotificationsQuery.getKey({ userId: '123' })
 * const data = useQuerySubscription<{ notifications: GQLNotification[] }>(queryKey)
 * ```
 */
export function useQuerySubscription<TData = unknown>(
  queryKey: QueryKey,
): TData | undefined {
  const queryClient = useQueryClient()
  const [data, setData] = useState<TData | undefined>()

  useEffect(() => {
    const observer = new QueryObserver<TData>(queryClient, {
      queryKey,
      // Only notify on data changes, not loading/error states
      notifyOnChangeProps: ['data'],
    })

    // Subscribe to query updates
    const unsubscribe = observer.subscribe((result) => {
      setData(result.data)
    })

    // Set initial data from cache
    setData(observer.getCurrentResult().data)

    return unsubscribe
  }, [queryClient, queryKey])

  return data
}
