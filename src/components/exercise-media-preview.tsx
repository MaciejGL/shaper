'use client'

import { Dumbbell, Play } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { getYouTubeEmbedUrl } from '@/lib/get-youtube-embed-url'
import { cn } from '@/lib/utils'

import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'

interface ExerciseMediaPreviewProps {
  images?: Array<{ medium?: string | null } | null> | null
  videoUrl?: string | null
  alt?: string
  className?: string
}

export function ExerciseMediaPreview({
  images,
  videoUrl,
  alt = 'Exercise preview',
  className,
}: ExerciseMediaPreviewProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false)
  const firstImage = images?.[0]?.medium

  const mediaPreview = (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-muted',
        className || 'size-32',
      )}
    >
      {firstImage ? (
        <Image
          src={firstImage}
          alt={alt}
          fill
          className="object-cover"
          sizes="128px"
        />
      ) : (
        <ImagePlaceholder />
      )}
      {videoUrl && (
        <div className="absolute inset-0 flex items-end justify-end p-1 bg-black/20">
          <div className="flex-center size-6 rounded-sm bg-black/20 backdrop-blur-sm">
            <Play className="size-3 fill-white stroke-white" />
          </div>
        </div>
      )}
    </div>
  )

  if (videoUrl) {
    return (
      <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
        <DialogTrigger asChild>
          <button aria-label="Play video" className="cursor-pointer">
            {mediaPreview}
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

  return mediaPreview
}

function ImagePlaceholder() {
  return (
    <div className="absolute inset-0 flex-center flex-col bg-muted">
      <Dumbbell className="size-5 text-muted-foreground" />
    </div>
  )
}
