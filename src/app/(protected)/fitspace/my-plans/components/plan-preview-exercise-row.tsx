import { VideoPreview } from '@/components/video-preview'

interface PlanPreviewExerciseRowProps {
  exercise: {
    id: string
    name: string
    videoUrl?: string | null
    images?: Array<{
      id: string
      thumbnail?: string | null
      medium?: string | null
      url: string
      order: number
    }> | null
  }
  index: number
}

export function PlanPreviewExerciseRow({
  exercise,
  index,
}: PlanPreviewExerciseRowProps) {
  // Get first image, prioritizing url field
  const firstImage = exercise.images?.[0]
  const imageUrl = firstImage?.url || firstImage?.medium || firstImage?.thumbnail

  return (
    <div className="flex items-center gap-3 py-2">
      <span className="text-xs text-muted-foreground w-4">{index + 1}</span>

      <div className="relative size-12 flex-shrink-0 rounded-md overflow-hidden bg-muted">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={exercise.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {exercise.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <VideoPreview
                  url={exercise.videoUrl}
                  variant="ghost"
                  size="icon-sm"
                />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xs text-muted-foreground">No image</span>
          </div>
        )}
      </div>

      <span className="text-sm">{exercise.name}</span>
    </div>
  )
}

