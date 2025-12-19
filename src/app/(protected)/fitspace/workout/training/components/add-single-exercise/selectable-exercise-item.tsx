import { CheckIcon } from 'lucide-react'

import { ExerciseMediaPreview } from '@/components/exercise-media-preview'
import { cn } from '@/lib/utils'

interface SelectableExerciseItemProps {
  id: string
  name: string
  muscleDisplay?: string
  images?: ({ medium?: string | null } | null)[] | null
  videoUrl?: string | null
  isSelected: boolean
  onToggle: (id: string) => void
  disabled?: boolean
}

export function SelectableExerciseItem({
  id,
  name,
  muscleDisplay,
  images,
  videoUrl,
  isSelected,
  onToggle,
  disabled,
}: SelectableExerciseItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-1 pr-3 rounded-lg cursor-pointer transition-all',
        'border border-border shadow-sm',
        isSelected ? 'bg-primary/3' : 'hover:bg-muted/50',
        disabled && 'opacity-50 pointer-events-none',
      )}
      onClick={() => onToggle(id)}
    >
      {(images || videoUrl) && (
        <div onClick={(e) => e.stopPropagation()}>
          <ExerciseMediaPreview
            images={images}
            videoUrl={videoUrl}
            className="size-20 shrink-0 rounded-md"
            hidePagination={true}
            hideVideoOverlay={true}
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{name}</h4>
        {muscleDisplay && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {muscleDisplay}
          </p>
        )}
      </div>
      <div
        className={cn(
          'shrink-0 size-6 rounded-full flex-center transition-all',
          isSelected
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground/30',
        )}
      >
        <CheckIcon className="size-4" />
      </div>
    </div>
  )
}
