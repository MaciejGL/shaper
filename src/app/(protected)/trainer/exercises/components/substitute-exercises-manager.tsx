'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { GQLTrainerExercisesQuery } from '@/generated/graphql-client'

interface SubstituteExercisesManagerProps {
  availableExercises: {
    userExercises: GQLTrainerExercisesQuery['userExercises']
    publicExercises: GQLTrainerExercisesQuery['publicExercises']
  }
  selectedSubstituteIds: string[]
  selectedMuscleGroupIds: string[]
  onSubstitutesChange: (substituteIds: string[]) => void
  isLoading: boolean
  exerciseId?: string
}

export function SubstituteExercisesManager({
  availableExercises,
  selectedSubstituteIds,
  onSubstitutesChange,
  selectedMuscleGroupIds,
  isLoading,
  exerciseId,
}: SubstituteExercisesManagerProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [selectedSubstituteId, setSelectedSubstituteId] = useState('')

  const relevantExercises = useMemo(() => {
    const allExercises = [
      ...availableExercises.userExercises,
      ...availableExercises.publicExercises,
    ]

    return allExercises
      .map((ex) => ({
        ...ex,
        muscleOverlap: ex.muscleGroups.filter((mg) =>
          selectedMuscleGroupIds.includes(mg.id),
        ).length,
      }))
      .filter((ex) => ex.muscleOverlap > 0)
      .sort((a, b) => b.muscleOverlap - a.muscleOverlap)
  }, [availableExercises, selectedMuscleGroupIds])

  const selectedSubstituteExercises = selectedSubstituteIds
    .map((id) => {
      const allExercises = [
        ...availableExercises.userExercises,
        ...availableExercises.publicExercises,
      ]
      return allExercises.find((ex) => ex.id === id)
    })
    .filter(
      (exercise): exercise is NonNullable<typeof exercise> =>
        exercise !== undefined,
    )

  const handleAddSubstitute = () => {
    if (!selectedSubstituteId) {
      return
    }

    const newSubstituteIds = [...selectedSubstituteIds, selectedSubstituteId]
    onSubstitutesChange(newSubstituteIds)
    setIsAddDialogOpen(false)
    setSelectedSubstituteId('')
  }

  const handleRemoveSubstitute = (substituteId: string) => {
    const newSubstituteIds = selectedSubstituteIds.filter(
      (id) => id !== substituteId,
    )
    onSubstitutesChange(newSubstituteIds)
  }

  return (
    <div className={cn("space-y-2 border border-border rounded-lg", selectedSubstituteExercises.length > 0 ? "p-3" : "p-2")}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Substitute Exercises</Label>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSelectedSubstituteId('')}
              iconStart={<Plus />}
            >
              Add Substitute
            </Button>
          </DialogTrigger>
          <DialogContent dialogTitle="Add Substitute Exercise">
            <DialogHeader>
              <DialogTitle>Add Substitute Exercise</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="substitute-select">Select Exercise</Label>
                <Select
                  value={selectedSubstituteId}
                  onValueChange={setSelectedSubstituteId}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder="Choose a substitute exercise"
                      className="truncate"
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {relevantExercises
                      .filter((ex) => ex.id !== exerciseId)
                      .map((ex, index) => (
                        <SelectItem
                          key={`select-${ex.id}-${index}`}
                          value={ex.id}
                          disabled={selectedSubstituteIds.includes(ex.id)}
                        >
                          <div className="flex items-center gap-2">
                            <span>{ex.name}</span>
                            {ex.equipment &&
                              selectedSubstituteId !== ex.id && (
                                <Badge variant="outline" className="text-xs">
                                  {ex.equipment}
                                </Badge>
                              )}
                            {selectedSubstituteId !== ex.id && (
                              <Badge variant="secondary" className="text-xs">
                                {ex.muscleOverlap} shared muscle
                                {ex.muscleOverlap !== 1 ? 's' : ''}
                              </Badge>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    {relevantExercises.length === 0 && (
                      <div className="p-2 text-sm text-muted-foreground">
                        No exercises found targeting the same muscle groups
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleAddSubstitute}
                  disabled={!selectedSubstituteId}
                >
                  Add Substitute
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : selectedSubstituteExercises.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">
          Add alternatives that target the same muscle groups
        </p>
      ) : (
        <div className="space-y-2">
          {selectedSubstituteExercises.map((exercise, index) => (
            <div
              key={`${exercise.id}-${index}`}
              className="flex items-center justify-between p-2 bg-card/50 rounded-md"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium text-sm truncate">
                    {exercise.name}
                  </h4>
                  {exercise.equipment && (
                    <Badge variant="outline" className="text-xs shrink-0">
                      {exercise.equipment}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  {exercise.muscleGroups.slice(0, 3).map((mg, index) => (
                    <Badge
                      key={`${mg.id}-${index}`}
                      variant="secondary"
                      className="text-xs"
                    >
                      {mg.name}
                    </Badge>
                  ))}
                  {exercise.muscleGroups.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{exercise.muscleGroups.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                size="icon-sm"
                variant="ghost"
                onClick={() => handleRemoveSubstitute(exercise.id)}
                iconOnly={<Trash2 />}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
