'use client'

import { Eye, Image as ImageIcon, X } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

import { Exercise, ExerciseUpdate } from './types'

interface MediaManagementDialogProps {
  exercise: Exercise
  isOpen: boolean
  onClose: () => void
  onUpdateExercise: (updates: Partial<ExerciseUpdate>) => void
}

export function MediaManagementDialog({
  exercise,
  isOpen,
  onClose,
  onUpdateExercise,
}: MediaManagementDialogProps) {
  const [videoUrl, setVideoUrl] = useState(exercise.videoUrl || '')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleSave = () => {
    onUpdateExercise({
      videoUrl: videoUrl || null,
    })
    onClose()
  }

  const handleVideoPreview = () => {
    if (videoUrl) {
      setPreviewUrl(videoUrl)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dialogTitle="Manage Media" className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Media - {exercise.name}</DialogTitle>
          <DialogDescription>
            Manage videos and images for this exercise
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Video Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Video</h3>
            <div className="flex items-center space-x-2">
              <Input
                id={`video-url-${exercise.id}`}
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="Enter video URL (YouTube, Vimeo, etc.)"
                className="flex-1"
              />
              {videoUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVideoPreview}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              )}
            </div>

            {previewUrl && (
              <div className="relative bg-black rounded-lg overflow-hidden">
                <iframe
                  src={
                    previewUrl.includes('youtube.com')
                      ? previewUrl.replace('watch?v=', 'embed/')
                      : previewUrl
                  }
                  className="w-full h-64"
                  frameBorder="0"
                  allowFullScreen
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setPreviewUrl(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Images Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Images</h3>
            {exercise.images && exercise.images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {exercise.images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.url}
                      alt={`Exercise ${exercise.name} - Image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-lg flex items-center justify-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => window.open(image.url, '_blank')}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                <p>No images uploaded</p>
                <p className="text-xs">
                  Images are managed through the exercise creation dialog
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
