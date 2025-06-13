import { getBaseUrl } from '@/lib/get-base-url'

export interface GqlFetchOptions {
  headers?: HeadersInit
  cache?: RequestCache
  next?: RequestInit['next']
}

export const fetchData =
  <TData, TVariables>(
    query: string,
    variables?: TVariables,
    options?: RequestInit['headers'],
  ): (() => Promise<TData>) =>
  async () =>
    gqlFetch<TData, TVariables>(
      query,
      variables,
      options ? { headers: options } : undefined,
    )

export const gqlFetch = async <TData, TVariables = object>(
  query: string,
  variables?: TVariables,
  options?: GqlFetchOptions,
  customEndpoint?: string,
): Promise<TData> => {
  const body = JSON.stringify({
    query,
    variables,
  })
  // eslint-disable-next-line no-console
  console.log({ options })
  const headers = {
    ...options?.headers,
    'Content-Type': 'application/json',
  }

  const queryMatch = query.match(/(query|mutation)\s+(\w+)/i)
  const operationType = queryMatch ? queryMatch[1] : 'unknown'
  const queryName = queryMatch ? queryMatch[2] : 'unknown'
  const endpoint = customEndpoint
    ? `${customEndpoint}?${operationType}=${queryName}`
    : `${getBaseUrl()}/api/graphql?${operationType}=${queryName}`

  // eslint-disable-next-line no-console
  console.log({ endpoint })

  try {
    const res = await fetch(endpoint, {
      signal: AbortSignal?.timeout?.(60000),
      method: 'POST',
      headers,
      credentials: 'include',
      cache: options?.cache ?? 'no-store',
      next: options?.next,
      body,
    })

    if (!res.ok) {
      throw new Error(
        `Failed to fetch data. API returned ${res.status} ${await res.text()}`,
      )
    }

    try {
      const json = await res.json()

      if (json.errors) {
        const { message } = json.errors[0] || {}
        console.error('for', body)
        throw new Error((message as string) || 'Error…')
      }

      return json.data as TData
    } catch (error) {
      // console.error('Failed to parse JSON', error, await res.text())
      throw new Error(error instanceof Error ? error.message : String(error))
    }
  } catch (error) {
    console.error('Failed to fetch data', error)
    throw error
  }
}
