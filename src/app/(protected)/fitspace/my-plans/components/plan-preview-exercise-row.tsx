import { VideoPreview } from '@/components/video-preview'

interface PlanPreviewExerciseRowProps {
  exercise: {
    id: string
    name: string
    videoUrl?: string | null
    completedAt?: string | null
    images?: Array<{
      id: string
      thumbnail?: string | null
      medium?: string | null
      url: string
      order: number
    }> | null
  }
  index: number
  isFirst?: boolean
  isLast?: boolean
  isTemplate?: boolean
}

export function PlanPreviewExerciseRow({
  exercise,
  index,
  isFirst = false,
  isLast = false,
  isTemplate = false,
}: PlanPreviewExerciseRowProps) {
  // Get first image, prioritizing url field
  const firstImage = exercise.images?.[0]
  const imageUrl =
    firstImage?.url || firstImage?.medium || firstImage?.thumbnail

  // Determine border color based on plan status and completion
  const getBorderColor = () => {
    if (isTemplate) {
      return 'bg-muted-foreground/40' // Gray for templates
    }
    const isCompleted = !!exercise.completedAt
    return isCompleted ? 'bg-green-500' : 'bg-amber-500'
  }

  const borderColor = getBorderColor()

  return (
    <div className={`flex items-center gap-3 py-3 pl-4 relative`}>
      {/* Colored border line on the left */}
      <div
        className={`absolute left-0 top-0 bottom-0 w-[3px] ${borderColor} ${
          isFirst ? 'rounded-t-full' : ''
        } ${isLast ? 'rounded-b-full' : ''}`}
      />

      <span className="text-xs text-muted-foreground w-5 text-right">
        {index + 1}
      </span>

      <div className="relative size-14 flex-shrink-0 rounded-md overflow-hidden bg-muted border border-border">
        {imageUrl ? (
          <>
            <img
              src={imageUrl}
              alt={exercise.name}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                target.nextElementSibling?.classList.remove('hidden')
              }}
            />
            <div className="hidden w-full h-full items-center justify-center text-xs text-muted-foreground">
              No image
            </div>
            {exercise.videoUrl && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <VideoPreview
                  url={exercise.videoUrl}
                  variant="ghost"
                  size="icon-sm"
                />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-center px-1">
            <span className="text-[10px] text-muted-foreground leading-tight">
              No image
            </span>
          </div>
        )}
      </div>

      <span className="text-sm flex-1">{exercise.name}</span>
    </div>
  )
}
