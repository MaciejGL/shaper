'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'

import { AnimateChangeInHeight } from '@/components/animations/animated-height-change'
import { RadioButtons } from '@/components/radio-buttons'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { RadioGroup } from '@/components/ui/radio-group'

import type {
  AiWorkoutInputData,
  WorkoutSubType,
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
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [currentIndex, setCurrentIndex] = useState(0)

  const currentTypeIndex = useMemo(() => {
    if (!data.workoutType) return 0
    return WORKOUT_TYPE_OPTIONS.findIndex((opt) => opt.id === data.workoutType)
  }, [data.workoutType])

  const currentOption = WORKOUT_TYPE_OPTIONS[currentTypeIndex]

  // Sync carousel with data changes
  useEffect(() => {
    if (carouselApi && currentTypeIndex !== currentIndex) {
      carouselApi.scrollTo(currentTypeIndex, false)
      setCurrentIndex(currentTypeIndex)
    }
  }, [carouselApi, currentTypeIndex, currentIndex])

  // Track carousel position and update data
  useEffect(() => {
    if (!carouselApi) return

    const onSelect = () => {
      const selectedIndex = carouselApi.selectedScrollSnap()
      setCurrentIndex(selectedIndex)

      const newOption = WORKOUT_TYPE_OPTIONS[selectedIndex]
      const newType = newOption.id

      // Auto-select first sub-type if available
      const firstSubType =
        newOption.hasSubTypes && newOption.subTypes
          ? newOption.subTypes[0].id
          : null

      // Only update if actually changed
      if (
        data.workoutType !== newType ||
        data.workoutSubType !== firstSubType
      ) {
        onDataChange({
          ...data,
          workoutType: newType,
          workoutSubType: firstSubType,
        })
      }
    }

    carouselApi.on('select', onSelect)
    return () => {
      carouselApi.off('select', onSelect)
    }
  }, [carouselApi, data, onDataChange])

  const handlePrevious = () => {
    carouselApi?.scrollPrev()
  }

  const handleNext = () => {
    carouselApi?.scrollNext()
  }

  const handleSubTypeSelect = (subType: WorkoutSubType) => {
    onDataChange({
      ...data,
      workoutSubType: subType,
    })
  }

  // Get muscle groups for selected sub-type or full body
  const selectedMuscleGroups = useMemo(() => {
    if (!currentOption.hasSubTypes) {
      // Full body - show all major muscle groups
      return [
        'Chest',
        'Lats',
        'Upper Back',
        'Traps',
        'Shoulders',
        'Biceps',
        'Triceps',
        'Forearms',
        'Abs',
        'Obliques',
        'LowerBack',
        'Quads',
        'Hamstrings',
        'Glutes',
        'Calves',
        'Inner Thighs',
      ]
    }

    if (data.workoutSubType && currentOption.subTypes) {
      const subType = currentOption.subTypes.find(
        (st) => st.id === data.workoutSubType,
      )
      return subType?.muscleGroups || []
    }

    return []
  }, [currentOption, data.workoutSubType])

  // Optional: Get color based on workout type
  const heatmapColor = useMemo(() => {
    // You can customize colors for different workout types with any Tailwind class
    const colorMap: Record<string, string> = {
      fullbody: 'fill-orange-500 dark:fill-amber-700',
      'push-pull-legs': 'fill-orange-500 dark:fill-amber-700',
      'upper-lower': 'fill-orange-500 dark:fill-amber-700',
      split: 'fill-orange-500 dark:fill-amber-700',
    }
    return data.workoutType
      ? colorMap[data.workoutType] || 'fill-orange-500 dark:fill-amber-700'
      : 'fill-orange-500 dark:fill-amber-700'
  }, [data.workoutType])

  return (
    <div>
      {/* Workout Type Carousel */}
      <div className="flex flex-col">
        <div className="flex justify-between bg-card-on-card rounded-lg">
          <div>
            <Button
              variant="tertiary"
              size="icon-lg"
              onClick={handlePrevious}
              className="shrink-0 h-full"
              iconOnly={<ChevronLeft />}
            />
          </div>

          <div className="flex-1 overflow-hidden">
            <Carousel
              setApi={setCarouselApi}
              opts={{
                loop: true,
                align: 'center',
              }}
            >
              <CarouselContent>
                {WORKOUT_TYPE_OPTIONS.map((option) => (
                  <CarouselItem
                    key={option.id}
                    className="flex items-center justify-center"
                  >
                    <div className="text-center py-3 px-2 space-y-1">
                      <h3 className="font-semibold text-lg">{option.label}</h3>
                      <p className="text-sm">{option.description}</p>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>

          <div>
            <Button
              variant="tertiary"
              size="icon-lg"
              onClick={handleNext}
              iconOnly={<ChevronRight />}
              className="shrink-0 h-full"
            />
          </div>
        </div>
        <AnimateChangeInHeight className="mt-2">
          {currentOption.hasSubTypes && currentOption.subTypes && (
            <RadioGroup
              value={data.workoutSubType || ''}
              onValueChange={(value) =>
                handleSubTypeSelect(value as WorkoutSubType)
              }
            >
              <RadioButtons
                value={data.workoutSubType || ''}
                onValueChange={(value) =>
                  handleSubTypeSelect(value as WorkoutSubType)
                }
                options={currentOption.subTypes.map((subType) => ({
                  value: subType.id,
                  label: subType.label,
                }))}
                columns={2}
              />
            </RadioGroup>
          )}
        </AnimateChangeInHeight>
      </div>

      {/* Dynamic Heatmap - Always Visible */}
      <div className="py-4 mt-2">
        <WorkoutTypeHeatmap
          key={`${data.workoutType}-${data.workoutSubType}`}
          muscleGroups={selectedMuscleGroups}
          colorClassName={heatmapColor}
        />
      </div>
    </div>
  )
}
