'use client'

import { Play } from 'lucide-react'
import { useState } from 'react'

import { getYouTubeEmbedUrl } from '@/lib/get-youtube-embed-url'

import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'

interface VideoOverlayButtonProps {
  videoUrl: string
}

export function VideoOverlayButton({ videoUrl }: VideoOverlayButtonProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false)

  const handleVideoClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsVideoOpen(true)
  }

  return (
    <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
      <DialogTrigger asChild>
        <button
          onClick={handleVideoClick}
          className="absolute bottom-1 right-1 flex-center size-6 rounded-sm bg-black/20 backdrop-blur-sm z-10 hover:bg-black/30 transition-colors"
          aria-label="Play video"
        >
          <Play className="size-3 fill-white stroke-white" />
        </button>
      </DialogTrigger>
      <DialogContent
        dialogTitle="Exercise Video"
        className="max-w-screen max-h-screen aspect-video p-0 border-none rounded-md"
      >
        <iframe
          src={getYouTubeEmbedUrl(videoUrl, {
            autoplay: true,
            mute: false,
            minimal: false,
          })}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="w-full h-full rounded-md"
        />
      </DialogContent>
    </Dialog>
  )
}
