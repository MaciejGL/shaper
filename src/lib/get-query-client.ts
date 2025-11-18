import {
  QueryClient,
  defaultShouldDehydrateQuery,
  isServer,
} from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  getUserFriendlyErrorMessage,
  shouldShowErrorToUser,
} from './error-utils'

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Infinity,
        refetchOnWindowFocus: false,
      },
      dehydrate: {
        // include pending queries in dehydration
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      mutations: {
        onError: (error) => {
          // Always log the error for debugging
          console.error('Mutation error:', error)

          // Only show toast for non-network errors to avoid alarming users during offline scenarios
          if (shouldShowErrorToUser(error)) {
            const friendlyMessage = getUserFriendlyErrorMessage(error)
            toast.error(friendlyMessage)
          } else {
            // Log network errors silently for debugging but don't show toasts
            console.warn('Network error (suppressed toast):', error)
          }
        },
      },
    },
  })
}

let browserQueryClient: QueryClient | undefined = undefined

export function getQueryClient() {
  if (isServer) {
    // Server: always make a new query client
    return makeQueryClient()
  } else {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}
