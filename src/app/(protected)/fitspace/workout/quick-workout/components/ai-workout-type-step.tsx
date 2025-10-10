'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'

import type {
  AiWorkoutInputData,
  WorkoutSubType,
  WorkoutType,
} from '../hooks/use-ai-workout-generation'
import { WORKOUT_TYPE_OPTIONS } from '../types/workout-types'

import { WorkoutTypeHeatmap } from './workout-type-heatmap'

interface AiWorkoutTypeStepProps {
  data: AiWorkoutInputData
  onDataChange: (data: AiWorkoutInputData) => void
}

export function AiWorkoutTypeStep({
  data,
  onDataChange,
}: AiWorkoutTypeStepProps) {
  const [expandedType, setExpandedType] = useState<WorkoutType | null>(
    data.workoutType,
  )

  const handleWorkoutTypeSelect = (type: WorkoutType) => {
    const option = WORKOUT_TYPE_OPTIONS.find((opt) => opt.id === type)

    if (!option) return

    // If no sub-types, select immediately
    if (!option.hasSubTypes) {
      onDataChange({
        ...data,
        workoutType: type,
        workoutSubType: null,
      })
      setExpandedType(null)
      return
    }

    // If has sub-types, expand to show options
    if (expandedType === type) {
      setExpandedType(null)
    } else {
      setExpandedType(type)
      // Clear sub-type selection when changing main type
      onDataChange({
        ...data,
        workoutType: type,
        workoutSubType: null,
      })
    }
  }

  const handleSubTypeSelect = (subType: WorkoutSubType) => {
    onDataChange({
      ...data,
      workoutSubType: subType,
    })
  }

  const isTypeSelected = (type: WorkoutType) => {
    return data.workoutType === type
  }

  const isSubTypeSelected = (subType: WorkoutSubType) => {
    return data.workoutSubType === subType
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-sm text-muted-foreground">
          Select your workout type to generate a personalized routine
        </p>
      </div>

      <div className="space-y-3">
        {WORKOUT_TYPE_OPTIONS.map((option) => (
          <div key={option.id} className="space-y-2">
            {/* Main Workout Type */}
            <button
              onClick={() => handleWorkoutTypeSelect(option.id)}
              className={cn(
                'w-full text-left rounded-lg border-2 p-4 transition-all',
                'hover:border-primary/50',
                isTypeSelected(option.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card',
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'size-5 rounded-full border-2 flex items-center justify-center',
                        isTypeSelected(option.id)
                          ? 'border-primary bg-primary'
                          : 'border-border',
                      )}
                    >
                      {isTypeSelected(option.id) && (
                        <div className="size-2 rounded-full bg-primary-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">{option.label}</h3>
                      <p className="text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
                {option.hasSubTypes && (
                  <div className="ml-2">
                    {expandedType === option.id ? (
                      <ChevronUp className="size-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="size-5 text-muted-foreground" />
                    )}
                  </div>
                )}
              </div>
            </button>

            {/* Sub-types with Heatmaps */}
            <AnimatePresence>
              {option.hasSubTypes &&
                expandedType === option.id &&
                option.subTypes && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 sm:ml-8 space-y-2 pt-2">
                      <RadioGroup
                        value={data.workoutSubType || ''}
                        onValueChange={(value) =>
                          handleSubTypeSelect(value as WorkoutSubType)
                        }
                      >
                        {option.subTypes.map((subType) => (
                          <label
                            key={subType.id}
                            htmlFor={subType.id}
                            className={cn(
                              'block rounded-lg border-2 p-3 sm:p-4 transition-all cursor-pointer',
                              'hover:border-primary/50',
                              isSubTypeSelected(subType.id)
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-card',
                            )}
                          >
                            <div className="flex items-start gap-3">
                              <RadioGroupItem
                                value={subType.id}
                                id={subType.id}
                                className="mt-1"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium">
                                  {subType.label}
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {subType.muscleGroups.join(', ')}
                                </div>

                                {/* Show heatmap when selected */}
                                <AnimatePresence>
                                  {isSubTypeSelected(subType.id) && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.2 }}
                                      className="overflow-hidden"
                                    >
                                      <WorkoutTypeHeatmap
                                        muscleGroups={subType.muscleGroups}
                                      />
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            </div>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Help text */}
      <div className="text-center text-sm text-muted-foreground bg-muted p-4 rounded-lg mt-6">
        {!data.workoutType ? (
          'Select a workout type to continue'
        ) : data.workoutType === 'fullbody' ? (
          'Full body workout selected. Continue to set equipment and parameters.'
        ) : !data.workoutSubType ? (
          'Select a specific workout focus to continue'
        ) : (
          <>
            <strong>{data.workoutSubType.toUpperCase()}</strong> workout
            selected. Continue to set equipment and parameters.
          </>
        )}
      </div>
    </div>
  )
}
