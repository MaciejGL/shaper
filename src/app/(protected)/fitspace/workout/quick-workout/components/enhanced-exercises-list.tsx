'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { SearchIcon, XIcon } from 'lucide-react'
import { useMemo } from 'react'

import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import { GQLEquipment } from '@/generated/graphql-client'

import { Exercise, ExerciseCard } from './exercise-card'

interface EnhancedExercisesListProps {
  filteredExercises: Exercise[]
  selectedExercises: string[]
  onExerciseSelect: (exerciseId: string) => void
  searchTerm: string
  onSearchChange: (term: string) => void

  // Filter controls
  selectedMuscleGroups: string[]
  onMuscleGroupChange: (muscleGroups: string[]) => void
  selectedEquipment: GQLEquipment[]
  onEquipmentChange: (equipment: GQLEquipment[]) => void
}

export function EnhancedExercisesList({
  filteredExercises,
  selectedExercises,
  onExerciseSelect,
  searchTerm,
  onSearchChange,
  selectedMuscleGroups,
  onMuscleGroupChange,
  selectedEquipment,
  onEquipmentChange,
}: EnhancedExercisesListProps) {
  const groupedAlphabetically = useMemo(() => {
    return filteredExercises.reduce(
      (acc, exercise) => {
        // Calculate the grouping key - use '#' for exercises starting with numbers
        let firstLetter = exercise.name.charAt(0).toUpperCase()
        if (exercise.name.trim().match(/^\d/)) {
          firstLetter = '#'
        }

        if (!acc[firstLetter]) {
          acc[firstLetter] = []
        }
        acc[firstLetter].push(exercise)
        return acc
      },
      {} as Record<string, Exercise[]>,
    )
  }, [filteredExercises])

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <Input
        id="search-exercises"
        variant="secondary"
        iconStart={<SearchIcon />}
        placeholder="Search exercises"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      {/* Selected Filters as Badges */}
      {(selectedMuscleGroups.length > 0 || selectedEquipment.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-wrap gap-2"
        >
          {selectedMuscleGroups.map((muscleGroup) => (
            <motion.div
              key={muscleGroup}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge
                variant="muscle"
                size="lg"
                onClick={() =>
                  onMuscleGroupChange(
                    selectedMuscleGroups.filter((mg) => mg !== muscleGroup),
                  )
                }
              >
                <span>
                  {muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1)}
                </span>
                <XIcon className="w-3 h-3" />
              </Badge>
            </motion.div>
          ))}
          {selectedEquipment.map((equipment) => (
            <motion.div
              key={equipment}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <Badge
                variant="equipment"
                size="lg"
                onClick={() =>
                  onEquipmentChange(
                    selectedEquipment.filter((eq) => eq !== equipment),
                  )
                }
              >
                <span>
                  {EQUIPMENT_OPTIONS.find((eq) => eq.value === equipment)
                    ?.label || equipment}
                </span>
                <XIcon className="w-3 h-3" />
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Exercises Grid */}
      <motion.div layout className="space-y-4">
        <AnimatePresence mode="popLayout">
          {Object.entries(groupedAlphabetically)
            .sort(([a], [b]) => {
              // Put '#' (numbers) at the end
              if (a === '#' && b !== '#') return 1
              if (b === '#' && a !== '#') return -1
              // Normal alphabetical sorting for everything else
              return a.localeCompare(b)
            })
            .map(([letter, exercises], index) => {
              const isNumber = /^\d/.test(letter)
              return (
                <div key={letter + index}>
                  {!isNumber && (
                    <h3 className="text-2xl font-semibold bg-background/80 backdrop-blur-xs px-2 sticky -top-6 z-10">
                      {letter}
                    </h3>
                  )}
                  <div className="h-2" />
                  {exercises.map((exercise, index) => (
                    <ExerciseCard
                      key={exercise.id}
                      exercise={exercise}
                      selectedExercises={selectedExercises}
                      onExerciseSelect={onExerciseSelect}
                      isFirst={index === 0}
                      isLast={index === exercises.length - 1}
                    />
                  ))}
                </div>
              )
            })}
        </AnimatePresence>
      </motion.div>

      {/* No Results Message */}
      {filteredExercises.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            No exercises found matching your filters.
          </p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-2">
            Try adjusting your search terms or clearing some filters.
          </p>
        </motion.div>
      )}
    </div>
  )
}
