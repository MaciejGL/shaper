'use client'

import { Play } from 'lucide-react'
import { useState } from 'react'

import { cn } from '@/lib/utils'

import { buttonVariants } from './ui/button'
import { Dialog, DialogTrigger } from './ui/dialog'
import { VideoPreviewContent } from './video-preview'

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
      <VideoPreviewContent
        url={videoUrl}
        fullScreen
        classNameCloseButton={cn(
          buttonVariants({ variant: 'tertiary', size: 'icon-lg' }),
          'top-2 right-2 absolute',
        )}
      />
    </Dialog>
  )
}
