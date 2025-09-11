import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon, Grip, XIcon } from 'lucide-react'
import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  GQLBaseExercise,
  GQLImage,
  GQLMuscleGroup,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { translateEquipment } from '@/utils/translate-equipment'

export type Exercise = Pick<GQLBaseExercise, 'id' | 'name' | 'equipment'> & {
  muscleGroups: Pick<GQLMuscleGroup, 'alias' | 'groupSlug' | 'id'>[]
  secondaryMuscleGroups?: Pick<GQLMuscleGroup, 'alias' | 'groupSlug' | 'id'>[]
  completedAt?: string | null
  images: Pick<GQLImage, 'id' | 'thumbnail' | 'order'>[]
}

type ExerciseCardProps = {
  exercise: Exercise
  selectedExercises?: string[]
  onExerciseSelect?: (exerciseId: string) => void
  onExerciseRemove?: (exerciseId: string) => void
  loading?: boolean
  isDraggable?: boolean
  isFirst?: boolean
  isLast?: boolean
}

export function ExerciseCard({
  exercise,
  selectedExercises,
  onExerciseSelect,
  onExerciseRemove,
  isDraggable,
  loading,
  isFirst,
  isLast,
}: ExerciseCardProps) {
  const firstImage = exercise.images.at(1) || exercise.images.at(0)

  return (
    <div className="flex gap-2 items-center">
      {isDraggable && (
        <div className="flex-shrink-0 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing">
          <Grip className="h-4 w-4" />
        </div>
      )}
      <Card
        className={cn(
          'group/exercise-card p-0 border-b border-t-0 overflow-hidden flex-1 rounded-none pr-2',
          isFirst && 'rounded-t-md border-t',
          isLast && 'rounded-b-md',
          isDraggable && 'rounded-md border',
          selectedExercises?.includes(exercise.id)
            ? 'bg-primary/5'
            : ' bg-card',
          !onExerciseRemove && 'cursor-pointer hover:border-primary/20',
        )}
        onClick={
          !onExerciseRemove
            ? () => {
                if (selectedExercises?.includes(exercise.id)) {
                  onExerciseSelect?.(exercise.id)
                } else {
                  onExerciseSelect?.(exercise.id)
                }
              }
            : undefined
        }
      >
        <CardContent className="p-0 flex items-center gap-3">
          {exercise.images.length > 0 && (
            <div className="size-20 overflow-hidden relative bg-white">
              {firstImage?.thumbnail ? (
                <Image
                  src={firstImage.thumbnail}
                  alt={exercise.name}
                  width={100}
                  height={100}
                />
              ) : (
                <Image
                  src={'/empty-rack.png'}
                  alt={exercise.name}
                  width={100}
                  height={100}
                />
              )}
            </div>
          )}

          <div
            className={cn('flex-1 py-2', exercise.images.length === 0 && 'p-3')}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="font-medium text-md leading-tight text-left">
                {exercise.name}
              </div>
              <div className="flex items-center gap-1">
                <AnimatePresence mode="popLayout">
                  {selectedExercises?.includes(exercise.id) && (
                    <motion.div
                      key={exercise.id}
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.1 }}
                      className="absolute top-1/2 right-2 -translate-y-1/2 z-[10000] flex items-center justify-center size-6 bg-primary text-primary-foreground rounded-full shadow-lg"
                    >
                      <CheckIcon className="w-4 h-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
                {onExerciseRemove && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onExerciseRemove(exercise.id)}
                    iconOnly={<XIcon />}
                    className="opacity-70 group-hover/exercise-card:opacity-100 transition-opacity"
                    loading={loading}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-0.5 mt-1">
              {exercise.equipment && (
                <Badge variant="equipment" size="2xs">
                  {translateEquipment(exercise.equipment)}
                </Badge>
              )}

              {/* Primary muscle groups */}
              {exercise.muscleGroups.slice(0, 3).map((group) => (
                <Badge key={group.id} variant="muscle" size="2xs">
                  {group.alias}
                </Badge>
              ))}
              {exercise.muscleGroups.length > 3 && (
                <Badge variant="muscle" size="2xs">
                  +{exercise.muscleGroups.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
