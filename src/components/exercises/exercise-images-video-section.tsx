'use client'

import { useState } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MultiImageUpload } from '@/components/ui/multi-image-upload'

import { Exercise, ExerciseUpdateHandler } from './types'

interface ExerciseImagesVideoSectionProps {
  exercise: Exercise
  onUpdate: ExerciseUpdateHandler
}

export function ExerciseImagesVideoSection({
  exercise,
  onUpdate,
}: ExerciseImagesVideoSectionProps) {
  const [videoUrl, setVideoUrl] = useState(exercise.videoUrl || '')

  // Handle video URL update
  const handleVideoUrlChange = (newUrl: string) => {
    setVideoUrl(newUrl)
    onUpdate(exercise.id, 'videoUrl', newUrl || null)
  }

  // Convert exercise images to URL array for MultiImageUpload
  const currentImageUrls = exercise.images?.map((img) => img.url) || []

  // Handle images change from MultiImageUpload
  const handleImagesChange = (imageUrls: string[]) => {
    const newImages = imageUrls.map((url, index) => ({
      id: `temp-${Date.now()}-${index}`, // Temporary ID
      url,
      order: index,
    }))

    onUpdate(exercise.id, 'images', newImages)
  }

  // Get embedded video URL
  const getEmbeddedVideoUrl = (url: string) => {
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('youtube.com/watch?v=', 'youtube.com/embed/')
    }
    if (url.includes('youtu.be/')) {
      return url.replace('youtu.be/', 'youtube.com/embed/')
    }
    if (url.includes('vimeo.com/')) {
      const videoId = url.split('/').pop()
      return `https://player.vimeo.com/video/${videoId}`
    }
    return url
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-xs">Exercise Images</Label>
        <MultiImageUpload
          imageType="exercise"
          currentImageUrls={currentImageUrls}
          onImagesChange={handleImagesChange}
          maxImages={2}
        />
      </div>

      <Input
        id={`video-url-${exercise.id}`}
        type="url"
        label="Video URL"
        variant="secondary"
        value={videoUrl}
        onChange={(e) => handleVideoUrlChange(e.target.value)}
        placeholder="https://youtube.com/watch?v=..."
        className="text-xs h-8"
      />
      <div className="aspect-video w-full rounded-md border-2 border-dashed border-muted-foreground/30 overflow-hidden">
        {videoUrl ? (
          <iframe
            src={getEmbeddedVideoUrl(videoUrl)}
            className="w-full h-full rounded-md"
            frameBorder="0"
            allowFullScreen
            title={`${exercise.name} - Exercise Video`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-center">
            <span className="text-xs text-muted-foreground">
              Enter video URL above to display video
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
