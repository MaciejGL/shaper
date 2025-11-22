'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

interface YouTubePlayerProps {
  videoUrl: string
  autoplay?: boolean
  mute?: boolean
  loop?: boolean
  minimal?: boolean
  className?: string
}

interface YTPlayer {
  seekTo: (seconds: number) => void
  playVideo: () => void
  pauseVideo: () => void
  destroy: () => void
}

interface YTPlayerState {
  ENDED: number
  PLAYING: number
  PAUSED: number
  BUFFERING: number
  CUED: number
}

interface YTPlayerEvent {
  data: number
  target: YTPlayer
}

interface YTConstructor {
  Player: new (
    elementId: string,
    config: {
      videoId: string
      playerVars: Record<string, number>
      events: {
        onStateChange?: (event: YTPlayerEvent) => void
        onReady?: (event: YTPlayerEvent) => void
      }
    },
  ) => YTPlayer
  PlayerState: YTPlayerState
}

declare global {
  interface Window {
    YT: YTConstructor
    onYouTubeIframeAPIReady: () => void
  }
}

let isAPILoaded = false
let isAPILoading = false
const apiLoadCallbacks: (() => void)[] = []

function loadYouTubeAPI(): Promise<void> {
  return new Promise((resolve) => {
    if (isAPILoaded) {
      resolve()
      return
    }

    apiLoadCallbacks.push(resolve)

    if (isAPILoading) {
      return
    }

    isAPILoading = true

    const tag = document.createElement('script')
    tag.src = 'https://www.youtube.com/iframe_api'
    const firstScriptTag = document.getElementsByTagName('script')[0]
    firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)

    window.onYouTubeIframeAPIReady = () => {
      isAPILoaded = true
      isAPILoading = false
      apiLoadCallbacks.forEach((callback) => callback())
      apiLoadCallbacks.length = 0
    }
  })
}

function extractVideoId(url: string): string | null {
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/,
  )
  return match ? match[1] : null
}

export function YouTubePlayer({
  videoUrl,
  autoplay = false,
  mute = false,
  loop = false,
  minimal = true,
  className,
}: YouTubePlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const playerRef = useRef<YTPlayer | null>(null)
  const videoId = extractVideoId(videoUrl)

  useEffect(() => {
    if (!videoId) return

    let mounted = true

    const initPlayer = async () => {
      await loadYouTubeAPI()

      if (!mounted || !containerRef.current) return

      const playerId = `youtube-player-${Math.random().toString(36).substr(2, 9)}`
      containerRef.current.id = playerId

      const playerVars: Record<string, number> = {
        autoplay: autoplay ? 1 : 0,
        mute: mute ? 1 : 0,
        ...(minimal && {
          controls: 0,
          rel: 0,
          modestbranding: 1,
          iv_load_policy: 3,
          cc_load_policy: 0,
          showinfo: 0,
          disablekb: 1,
          playsinline: 1,
        }),
      }

      playerRef.current = new window.YT.Player(playerId, {
        videoId,
        playerVars,
        events: {
          onStateChange: (event: YTPlayerEvent) => {
            if (loop && event.data === window.YT.PlayerState.ENDED) {
              playerRef.current?.seekTo(0)
              playerRef.current?.playVideo()
            }
          },
        },
      })
    }

    initPlayer()

    return () => {
      mounted = false
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (_error) {
          // Player might already be destroyed
        }
        playerRef.current = null
      }
    }
  }, [videoId, autoplay, mute, loop, minimal])

  if (!videoId) {
    return null
  }

  return <div ref={containerRef} className={cn('w-full h-full', className)} />
}
