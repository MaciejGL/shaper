import Image from 'next/image'

import { VideoPreview } from '@/components/video-preview'
import { GQLFitspaceMyPlansQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

type PlanExercise = NonNullable<
  NonNullable<
    NonNullable<
      NonNullable<
        GQLFitspaceMyPlansQuery['getMyPlansOverviewFull']['activePlan']
      >['weeks']
    >[number]['days'][number]['exercises']
  >[number]
>

interface PlanPreviewExerciseRowProps {
  exercise?: PlanExercise
  isTemplate?: boolean
  isRestDay?: boolean
}

export function PlanPreviewExerciseRow({
  exercise,
  isRestDay = false,
  isTemplate = false,
}: PlanPreviewExerciseRowProps) {
  // Get first image, prioritizing url field
  const firstImage = exercise?.images?.[0]
  const imageUrl =
    firstImage?.url || firstImage?.medium || firstImage?.thumbnail
  console.log(imageUrl, exercise)

  // Determine border color based on plan status and completion
  const getBorderColor = () => {
    if (isRestDay) {
      return 'bg-muted-foreground/40'
    }
    if (isTemplate) {
      return 'bg-muted-foreground/40' // Gray for templates
    }
    const isCompleted = !!exercise?.completedAt
    return isCompleted ? 'bg-green-500' : 'bg-amber-500'
  }

  const borderColor = getBorderColor()

  return (
    <div
      className={cn(
        'flex items-center gap-3 pl-3 relative',
        isRestDay && 'py-3',
      )}
    >
      {/* Colored border line on the left */}
      <div
        className={cn(
          'absolute left-0 top-0 bottom-0 w-[3px] rounded-full',
          borderColor,
        )}
      />

      {!isRestDay && (
        <div className="relative size-32 flex-shrink-0 rounded-md overflow-hidden bg-muted">
          {imageUrl ? (
            <>
              <Image
                width={100}
                height={100}
                src={imageUrl}
                alt={exercise?.name || 'Exercise image'}
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
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-center px-1">
              <span className="text-[10px] text-muted-foreground leading-tight">
                No image
              </span>
            </div>
          )}
        </div>
      )}
      <div className="flex flex-col gap-2">
        <span className="text-base flex-1">
          {isRestDay ? 'Rest Day' : exercise?.name || 'Exercise name'}
        </span>
        {exercise?.videoUrl && (
          <VideoPreview
            url={exercise?.videoUrl}
            variant="tertiary"
            size="icon-md"
          />
        )}
      </div>
    </div>
  )
}
