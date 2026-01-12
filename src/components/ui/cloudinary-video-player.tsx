'use client'

import { useEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

function toSafeDomId(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 40)
}

interface CloudinaryVideoPlayerProps {
  /** The public ID of the video in Cloudinary */
  publicId: string
  /** Your Cloudinary cloud name */
  cloudName?: string
  /** Container className */
  className?: string
  /** Video element className (e.g. object-contain for showcase) */
  videoClassName?: string
  /** Autoplay the video */
  autoplay?: boolean
  /** Autoplay mode: 'always' | 'on-scroll' | 'never' */
  autoplayMode?: 'always' | 'on-scroll' | 'never'
  /** Mute the video */
  muted?: boolean
  /** Loop the video */
  loop?: boolean
  /** Show player controls */
  controls?: boolean
  /** Source types to use */
  sourceTypes?: string[]
  /** Extra options passed to player.source(publicId, options) */
  sourceOptions?: Record<string, unknown>
  /** Hide big play/replay overlay UI (useful when controls are disabled) */
  hideOverlayUi?: boolean
}

export function CloudinaryVideoPlayer({
  publicId,
  cloudName = 'drfdhibmu',
  className,
  videoClassName,
  autoplay = true,
  autoplayMode = 'on-scroll',
  muted = true,
  loop = true,
  controls = false,
  sourceTypes = ['webm/vp9', 'mp4'],
  sourceOptions,
  hideOverlayUi = true,
}: CloudinaryVideoPlayerProps) {
  const videoId = `cld-player-${toSafeDomId(publicId)}`
  const playerRef = useRef<unknown>(null)
  const playerVideoIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Load CSS once
    if (!document.getElementById('cloudinary-video-player-css')) {
      const link = document.createElement('link')
      link.id = 'cloudinary-video-player-css'
      link.rel = 'stylesheet'
      link.href =
        'https://unpkg.com/cloudinary-video-player@3.6.4/dist/cld-video-player.min.css'
      document.head.appendChild(link)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function initPlayer() {
      try {
        // Dynamic import to avoid SSR issues
        const { videoPlayer } = await import('cloudinary-video-player')

        if (!isMounted) return

        const videoElement = document.getElementById(videoId)
        if (!videoElement) return

        // If props changed and we now point to a different element/id, re-init.
        if (playerRef.current && playerVideoIdRef.current !== videoId) {
          try {
            ;(playerRef.current as { dispose: () => void }).dispose()
          } catch {
            // ignore
          }
          playerRef.current = null
          playerVideoIdRef.current = null
        }

        // Fast Refresh can recreate the <video> element without unmounting this component.
        // If that happens, the old player instance becomes detached and we must re-init.
        const hasVideoJsTechClass = videoElement.classList.contains('vjs-tech')
        if (playerRef.current && !hasVideoJsTechClass) {
          try {
            ;(playerRef.current as { dispose: () => void }).dispose()
          } catch {
            // ignore
          }
          playerRef.current = null
        }
        if (playerRef.current) return

        // Initialize the Cloudinary Video Player
        playerRef.current = videoPlayer(videoId, {
          cloud_name: cloudName,
          autoplay,
          autoplayMode,
          muted,
          loop,
          controls,
          sourceTypes,
          // Hide VideoJS overlay play button/replay UI when we want a “pure video” presentation.
          bigPlayButton: !hideOverlayUi,
        })
        playerVideoIdRef.current = videoId

        // Set the video source
        ;(
          playerRef.current as {
            source: (id: string, opts?: Record<string, unknown>) => void
          }
        ).source(publicId, sourceOptions)

        // If looping is disabled, prevent “replay” UI from appearing at the end.
        if (!loop && hideOverlayUi) {
          ;(
            playerRef.current as {
              on: (event: string, cb: () => void) => void
              removeClass?: (name: string) => void
              pause?: () => void
            }
          ).on('ended', () => {
            ;(
              playerRef.current as {
                removeClass?: (name: string) => void
                pause?: () => void
              }
            ).removeClass?.('vjs-ended')
            ;(
              playerRef.current as {
                pause?: () => void
              }
            ).pause?.()
          })
        }
      } catch (error) {
        console.error('Cloudinary player init error:', error)
      }
    }

    initPlayer()

    // Cleanup on unmount
    return () => {
      isMounted = false
      if (playerRef.current) {
        try {
          ;(playerRef.current as { dispose: () => void }).dispose()
        } catch {
          // Player might already be disposed
        }
        playerRef.current = null
        playerVideoIdRef.current = null
      }
    }
  }, [
    videoId,
    publicId,
    cloudName,
    autoplay,
    autoplayMode,
    muted,
    loop,
    controls,
    sourceTypes,
    sourceOptions,
    hideOverlayUi,
  ])

  return (
    <div
      className={cn(
        'relative w-full h-full',
        hideOverlayUi && 'cld-hide-overlay-ui',
        className,
      )}
    >
      <video
        id={videoId}
        className={cn('cld-video-player cld-fluid', videoClassName)}
        playsInline
      />
      {hideOverlayUi ? (
        <style jsx>{`
          .cld-hide-overlay-ui :global(.vjs-big-play-button),
          .cld-hide-overlay-ui :global(.vjs-big-play-button:focus),
          .cld-hide-overlay-ui :global(.vjs-big-play-button:hover) {
            display: none !important;
          }
        `}</style>
      ) : null}
    </div>
  )
}
