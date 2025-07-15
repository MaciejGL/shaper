'use client'

import { motion } from 'framer-motion'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { GQLEquipment } from '@/generated/graphql-client'
import { translateEquipment } from '@/utils/translate-equipment'

import type { RepFocus, RpeRange } from '../ai-workout-input'

interface WorkoutSummaryProps {
  exerciseCount: number
  maxSetsPerExercise: number
  rpeRange: RpeRange
  repFocus: RepFocus
  selectedMuscleGroups: string[]
  selectedEquipment: GQLEquipment[]
  className?: string
}

export function WorkoutSummary({
  exerciseCount,
  maxSetsPerExercise,
  rpeRange,
  repFocus,
  selectedMuscleGroups,
  selectedEquipment,
  className,
}: WorkoutSummaryProps) {
  const getRepRangeText = (focus: RepFocus) => {
    switch (focus) {
      case 'strength':
        return '3-6 reps'
      case 'hypertrophy':
        return '6-12 reps'
      case 'endurance':
        return '12-20 reps'
      default:
        return ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className={className}
    >
      <Card className="text-muted-foreground">
        <CardContent>
          <div className="text-md space-y-1 w-full">
            <p>
              <span className="font-semibold text-primary">
                {exerciseCount}
              </span>{' '}
              exercises
            </p>
            <p>
              Up to{' '}
              <span className="font-semibold text-primary">
                {maxSetsPerExercise}
              </span>{' '}
              sets per exercise
            </p>

            <div className="flex flex-col gap-2 w-full">
              <p>Targeting muscle groups: </p>
              {selectedMuscleGroups.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedMuscleGroups.map((muscleGroup) => (
                    <Badge key={muscleGroup} variant="muscle">
                      {muscleGroup}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p>No muscle groups selected</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <p>Preferred equipment: </p>
              {selectedEquipment.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedEquipment.map((equipment) => (
                    <Badge key={equipment} variant="equipment">
                      {translateEquipment(equipment)}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p>No equipment selected</p>
              )}
            </div>

            <p>
              Intensity:{' '}
              <span className="font-semibold text-primary">RPE {rpeRange}</span>
            </p>

            <p>
              Training focus:{' '}
              <span className="font-semibold text-primary capitalize">
                {repFocus}
              </span>{' '}
              ({getRepRangeText(repFocus)})
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
