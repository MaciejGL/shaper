'use client'

import type { RealtimeChannel } from '@supabase/supabase-js'
import { useCallback, useEffect, useRef } from 'react'

import { getSupabaseRealtimeClient } from './supabase-realtime-client'

type ChannelStatus = 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED'

export type RealtimeBroadcastEnvelope<TPayload> = {
  event: string
  payload: TPayload
  type: 'broadcast'
  meta?: { id: string }
}

export type BroadcastHandler<TEvents extends Record<string, unknown>> = {
  [K in keyof TEvents & string]: {
    event: K
    handler: (payload: RealtimeBroadcastEnvelope<TEvents[K]>) => void
  }
}[keyof TEvents & string]

interface UseRealtimeChannelParams<TEvents extends Record<string, unknown>> {
  enabled: boolean
  topic?: string
  broadcastHandlers: BroadcastHandler<TEvents>[]
  isPrivate?: boolean
}

interface UseRealtimeChannelReturn<TEvents extends Record<string, unknown>> {
  sendBroadcast: <K extends keyof TEvents & string>(
    event: K,
    payload: TEvents[K],
  ) => Promise<'ok' | 'timed out' | 'error'>
}

const TOKEN_REFRESH_BUFFER_SECONDS = 20

export function useRealtimeChannel<TEvents extends Record<string, unknown>>({
  enabled,
  topic,
  broadcastHandlers,
  isPrivate = true,
}: UseRealtimeChannelParams<TEvents>): UseRealtimeChannelReturn<TEvents> {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const tokenRefreshTimerRef = useRef<number | null>(null)
  const resubscribeInFlightRef = useRef(false)
  const resubscribeRef = useRef<null | (() => Promise<void>)>(null)

  useEffect(() => {
    if (!enabled || !topic) return

    const supabase = getSupabaseRealtimeClient()
    if (!supabase) {
      console.warn(
        '[Realtime] Disabled: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY',
      )
      return
    }

    let isCancelled = false

    const run = async () => {
      try {
        const refreshToken = async () => {
          const res = await fetch('/api/realtime/token', { method: 'GET' })
          if (!res.ok) {
            throw new Error(`Failed to get realtime token (${res.status})`)
          }

          const json = (await res.json()) as {
            token: string
            expiresIn: number
          }
          supabase.realtime.setAuth(json.token)

          if (tokenRefreshTimerRef.current) {
            window.clearTimeout(tokenRefreshTimerRef.current)
          }

          tokenRefreshTimerRef.current = window.setTimeout(
            () => {
              void refreshToken().catch((error) => {
                console.error('[Realtime] Token refresh failed', error)
              })
            },
            Math.max(
              (json.expiresIn - TOKEN_REFRESH_BUFFER_SECONDS) * 1000,
              10_000,
            ),
          )
        }

        const subscribeChannel = async () => {
          if (resubscribeInFlightRef.current) return
          resubscribeInFlightRef.current = true
          try {
            await refreshToken()
            if (isCancelled) return

            if (channelRef.current) {
              supabase.removeChannel(channelRef.current)
              channelRef.current = null
            }

            const channel = supabase.channel(topic, {
              config: { private: isPrivate, broadcast: { self: false } },
            })
            channelRef.current = channel

            broadcastHandlers.forEach(({ event, handler }) => {
              channel.on('broadcast', { event }, (payload) => {
                handler(payload as Parameters<typeof handler>[0])
              })
            })

            channel.subscribe((status: ChannelStatus, err: unknown) => {
              if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                console.error('[Realtime] Subscribe failed', {
                  topic,
                  status,
                  err,
                })

                const msg =
                  typeof err === 'object' && err && 'message' in err
                    ? String((err as { message?: unknown }).message)
                    : ''
                if (
                  msg.includes('InvalidJWTToken') ||
                  msg.toLowerCase().includes('expired')
                ) {
                  // If we were backgrounded, the JWT may have expired. We resubscribe on focus/visible.
                  if (tokenRefreshTimerRef.current) {
                    window.clearTimeout(tokenRefreshTimerRef.current)
                    tokenRefreshTimerRef.current = null
                  }
                }
              }
            })
          } finally {
            resubscribeInFlightRef.current = false
          }
        }

        resubscribeRef.current = subscribeChannel

        await subscribeChannel()
        if (isCancelled) return

        const handleResume = () => {
          if (document.visibilityState !== 'visible') return
          void resubscribeRef.current?.()
        }

        window.addEventListener('focus', handleResume)
        document.addEventListener('visibilitychange', handleResume)
        window.addEventListener('pageshow', handleResume)

        return () => {
          window.removeEventListener('focus', handleResume)
          document.removeEventListener('visibilitychange', handleResume)
          window.removeEventListener('pageshow', handleResume)
        }
      } catch (error) {
        console.error('[Realtime] Subscription failed', { topic, error })
      }
    }

    let removeResumeListeners: void | (() => void)
    void run().then((remove) => {
      removeResumeListeners = remove
    })

    return () => {
      isCancelled = true
      removeResumeListeners?.()
      if (tokenRefreshTimerRef.current) {
        window.clearTimeout(tokenRefreshTimerRef.current)
        tokenRefreshTimerRef.current = null
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
        channelRef.current = null
      }
      resubscribeRef.current = null
    }
  }, [broadcastHandlers, enabled, isPrivate, topic])

  const sendBroadcast = useCallback<
    UseRealtimeChannelReturn<TEvents>['sendBroadcast']
  >(async (event, payload) => {
    const attempt = async () => {
      const channel = channelRef.current
      if (!channel) return 'error' as const

      return (await channel.send({
        type: 'broadcast',
        event,
        payload,
      })) as 'ok' | 'timed out' | 'error'
    }

    try {
      const result = await attempt()
      if (result === 'ok') return result
    } catch {
      // fall through to refresh+retry
    }

    // Token likely expired while backgrounded. Refresh/resubscribe and retry once.
    await resubscribeRef.current?.()
    try {
      return await attempt()
    } catch {
      return 'error'
    }
  }, [])

  return { sendBroadcast }
}
