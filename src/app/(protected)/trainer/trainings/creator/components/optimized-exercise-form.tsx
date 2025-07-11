'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { debounce } from 'lodash'
import { Plus, Trash2, XIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useAddSetExerciseFormMutation,
  useGetExerciseFormDataQuery,
  useRemoveSetExerciseFormMutation,
  useUpdateExerciseFormMutation,
} from '@/generated/graphql-client'
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'
import { handleTempoKeyDown } from '@/lib/format-tempo'

interface OptimizedExerciseFormProps {
  exerciseId: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

// Local set type for state management
interface LocalSet {
  id: string
  order: number
  minReps: string
  maxReps: string
  weight: string
  rpe: string
}

export function OptimizedExerciseForm({
  exerciseId,
  isOpen,
  onClose,
}: OptimizedExerciseFormProps) {
  const { data, error } = useGetExerciseFormDataQuery(
    { exerciseId },
    {
      enabled: isOpen && !!exerciseId,
      staleTime: 30 * 1000,
    },
  )

  // ## Mutations
  const debouncedInvalidateQueries = useDebouncedInvalidation({
    queryKeys: ['GetTemplateTrainingPlanById', 'GetTemplates'],
    delay: 1000,
  })
  const { mutateAsync: addSetMutation } = useAddSetExerciseFormMutation()
  const { mutateAsync: removeSetMutation } = useRemoveSetExerciseFormMutation()
  const { mutateAsync: updateExercise } = useUpdateExerciseFormMutation()

  // ## Local State
  const [localData, setLocalData] = useState({
    name: '',
    instructions: '',
    additionalInstructions: '',
    restSeconds: '',
    warmupSets: '',
    tempo: '',
  })

  const [localSets, setLocalSets] = useState<LocalSet[]>([])

  useEffect(() => {
    if (data?.exercise && !localSets.length) {
      setLocalSets(
        data.exercise.sets.map((set) => ({
          id: set.id,
          order: set.order,
          minReps: set.minReps?.toString() || '',
          maxReps: set.maxReps?.toString() || '',
          weight: set.weight?.toString() || '',
          rpe: set.rpe?.toString() || '',
        })),
      )

      setLocalData({
        name: data.exercise.name || '',
        instructions: data.exercise.instructions || '',
        additionalInstructions: data.exercise.additionalInstructions || '',
        restSeconds: data.exercise.restSeconds?.toString() || '',
        warmupSets: data.exercise.warmupSets?.toString() || '',
        tempo: data.exercise.tempo || '',
      })
    }
  }, [data?.exercise, localSets.length])

  const debouncedUpdate = useMemo(
    () =>
      debounce(
        async (updates: Record<string, string | number | null>) => {
          if (!exerciseId) return

          try {
            await updateExercise({
              input: {
                exerciseId,
                ...updates,
              },
            })
          } catch (error) {
            console.error('Failed to update exercise:', error)
            // Optionally revert local state on error
            if (data?.exercise) {
              setLocalData({
                name: data.exercise.name || '',
                instructions: data.exercise.instructions || '',
                additionalInstructions:
                  data.exercise.additionalInstructions || '',
                restSeconds: data.exercise.restSeconds?.toString() || '',
                warmupSets: data.exercise.warmupSets?.toString() || '',
                tempo: data.exercise.tempo || '',
              })
            }
          }
        },
        700, // 700ms debounce - no more lag!
      ),
    [exerciseId, updateExercise, data],
  )

  const debouncedSetUpdate = useMemo(
    () =>
      debounce(
        async (sets: LocalSet[]) => {
          if (!exerciseId) return

          try {
            // Convert local sets to server format
            const serverSets = sets.map((set) => ({
              id: set.id,
              order: set.order,
              minReps: set.minReps === '' ? null : Number(set.minReps),
              maxReps: set.maxReps === '' ? null : Number(set.maxReps),
              weight: set.weight === '' ? null : Number(set.weight),
              rpe: set.rpe === '' ? null : Number(set.rpe),
            }))

            await updateExercise(
              {
                input: {
                  exerciseId,
                  sets: serverSets,
                },
              },
              {
                onSuccess: () => {},
                onError: (error) => {
                  console.error('Failed to update sets:', error)
                },
              },
            )
          } catch (error) {
            console.error('Failed to update sets:', error)
            // Revert to server data on error
            if (data?.exercise?.sets) {
              setLocalSets(
                data.exercise.sets.map((set) => ({
                  id: set.id,
                  order: set.order,
                  minReps: set.minReps?.toString() || '',
                  maxReps: set.maxReps?.toString() || '',
                  weight: set.weight?.toString() || '',
                  rpe: set.rpe?.toString() || '',
                })),
              )
            }
          }
        },
        700, // 700ms debounce
      ),
    [exerciseId, updateExercise, data],
  )

  const handleInputChange = useCallback(
    (field: string, value: string | number | null) => {
      // Special handling for tempo formatting
      if (field === 'tempo') {
        // Internal tempo formatting logic (simplified from format-tempo.ts)
        const formatTempo = (val: string): string => {
          const digits = val.replace(/\D/g, '')
          if (digits.length <= 1) return digits
          if (digits.length <= 2)
            return `${digits.slice(0, 1)}-${digits.slice(1)}`
          return `${digits.slice(0, 1)}-${digits.slice(1, 2)}-${digits.slice(2, 3)}`
        }

        const formatted =
          typeof value === 'string'
            ? formatTempo(value)
            : value?.toString() || ''
        setLocalData((prev) => ({
          ...prev,
          [field]: formatted,
        }))
        debouncedUpdate({ [field]: formatted || null })
        return
      }

      // Immediate local state update (no lag)
      setLocalData((prev) => ({
        ...prev,
        [field]: value?.toString() || '',
      }))

      // Debounced server sync
      const serverValue =
        field === 'restSeconds' || field === 'warmupSets'
          ? value === ''
            ? null
            : Number(value)
          : value || null

      debouncedUpdate({ [field]: serverValue })
    },
    [debouncedUpdate],
  )

  const handleSetChange = useCallback(
    (
      setId: string,
      field: keyof Omit<LocalSet, 'id' | 'order'>,
      value: string,
    ) => {
      // Immediate local state update
      setLocalSets((prev) =>
        prev.map((set) =>
          set.id === setId ? { ...set, [field]: value } : set,
        ),
      )

      // Debounced server sync
      setLocalSets((currentSets) => {
        debouncedSetUpdate(currentSets)
        return currentSets
      })
    },
    [debouncedSetUpdate],
  )

  const handleAddSet = useCallback(async () => {
    if (!exerciseId) return

    const newSet: LocalSet = {
      id: crypto.randomUUID(),
      order: localSets.length + 1,
      minReps: '',
      maxReps: '',
      weight: '',
      rpe: '',
    }

    // Optimistic update - show immediately
    setLocalSets((currentSets) => [...currentSets, newSet])

    try {
      const lastSet = localSets[localSets.length - 1]
      await addSetMutation(
        {
          input: {
            exerciseId,
            set: {
              minReps:
                lastSet?.minReps === '' ? null : Number(lastSet?.minReps),
              maxReps:
                lastSet?.maxReps === '' ? null : Number(lastSet?.maxReps),
              weight: lastSet?.weight === '' ? null : Number(lastSet?.weight),
              rpe: lastSet?.rpe === '' ? null : Number(lastSet?.rpe),
            },
          },
        },
        {
          onSuccess: (data) => {
            setLocalSets((currentSets) =>
              currentSets.map((set) =>
                set.id === newSet.id
                  ? { ...set, id: data.addSetExerciseForm.id }
                  : set,
              ),
            )
            debouncedInvalidateQueries()
          },
          onError: (error) => {
            console.error('Failed to add set:', error)
            setLocalSets((currentSets) =>
              currentSets.filter((set) => set.id !== newSet.id),
            )
          },
        },
      )
    } catch (error) {
      console.error('Failed to add set:', error)
      setLocalSets((currentSets) =>
        currentSets.filter((set) => set.id !== newSet.id),
      )
    }
  }, [exerciseId, addSetMutation, localSets, debouncedInvalidateQueries])

  // ## Simple Remove Set Handler
  const handleRemoveSet = useCallback(
    async (setId: string) => {
      const setToRemove = localSets.find((set) => set.id === setId)
      if (!setToRemove) return

      // Optimistic update - remove immediately
      setLocalSets((currentSets) =>
        currentSets.filter((set) => set.id !== setId),
      )

      removeSetMutation(
        { setId },
        {
          onSuccess: () => {
            debouncedInvalidateQueries()
          },
          onError: (error) => {
            console.error('Failed to remove set:', error)
            setLocalSets((currentSets) => [...currentSets, setToRemove])
          },
        },
      )
    },
    [removeSetMutation, localSets, debouncedInvalidateQueries],
  )

  const exercise = data?.exercise

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        dialogTitle={exercise?.name || 'Exercise'}
        className="sm:max-w-3xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle>{exercise?.name || 'Exercise'}</DialogTitle>
        </DialogHeader>

        {error ? (
          <div className="p-6">
            <CardHeader>
              <CardTitle>Error</CardTitle>
              <CardDescription>Failed to load exercise data</CardDescription>
            </CardHeader>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label htmlFor="name">Exercise Name</Label>
                <Input
                  id="name"
                  variant="ghost"
                  value={localData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Exercise name"
                />
              </div>
              <div className="space-y-2 col-span-2 flex gap-4">
                <div className="space-y-2">
                  <Label htmlFor="restSeconds">Rest (seconds)</Label>
                  <Input
                    id="restSeconds"
                    type="number"
                    min="0"
                    step="15"
                    variant="ghost"
                    value={localData.restSeconds}
                    onChange={(e) =>
                      handleInputChange('restSeconds', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="warmupSets">Warmup Sets</Label>
                  <Input
                    id="warmupSets"
                    type="number"
                    min="0"
                    step="1"
                    variant="ghost"
                    value={localData.warmupSets}
                    onChange={(e) =>
                      handleInputChange('warmupSets', e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tempo">Tempo</Label>
                  <Input
                    id="tempo"
                    variant="ghost"
                    value={localData.tempo}
                    onChange={(e) => handleInputChange('tempo', e.target.value)}
                    onKeyDown={handleTempoKeyDown}
                    placeholder="3-2-3"
                  />
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions</Label>
                <Textarea
                  id="instructions"
                  variant="ghost"
                  value={localData.instructions}
                  onChange={(e) =>
                    handleInputChange('instructions', e.target.value)
                  }
                  placeholder="Exercise instructions..."
                  rows={4}
                  className="resize-none min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="additionalInstructions">
                  Additional Instructions
                </Label>
                <Textarea
                  id="additionalInstructions"
                  variant="ghost"
                  value={localData.additionalInstructions}
                  onChange={(e) =>
                    handleInputChange('additionalInstructions', e.target.value)
                  }
                  placeholder="Additional instructions..."
                  rows={4}
                  className="resize-none min-h-20"
                />
              </div>
            </div>

            {/* Sets */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Sets</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSet}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Set
                </Button>
              </div>
              <AnimatePresence>
                <div className="mt-2 space-y-2">
                  {localSets.map((set) => (
                    <motion.div
                      key={set.order}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <Card className="p-3 border-none">
                        <div className="flex items-center gap-4">
                          <span className="font-medium w-8">#{set.order}</span>
                          <div className="flex gap-2 flex-1">
                            <div>
                              <Label className="text-xs">Reps</Label>
                              <Input
                                id={`minReps-${set.id}`}
                                type="number"
                                min="0"
                                value={set.minReps}
                                onChange={(e) =>
                                  handleSetChange(
                                    set.id,
                                    'minReps',
                                    e.target.value,
                                  )
                                }
                                className="w-20"
                                placeholder="Min"
                              />
                            </div>
                            <div className="flex items-center justify-center">
                              <span className="text-xs opacity-50 mt-3">-</span>
                            </div>

                            <div>
                              <Label className="text-xs opacity-0">
                                Max Reps
                              </Label>
                              <Input
                                id={`maxReps-${set.id}`}
                                type="number"
                                min="0"
                                value={set.maxReps}
                                onChange={(e) =>
                                  handleSetChange(
                                    set.id,
                                    'maxReps',
                                    e.target.value,
                                  )
                                }
                                className="w-20"
                                placeholder="Max"
                              />
                            </div>
                            <div className="flex items-center justify-center">
                              <span className="text-xs opacity-50 mt-3">x</span>
                            </div>
                            <div>
                              <Label className="text-xs">Weight</Label>
                              <Input
                                id={`weight-${set.id}`}
                                type="number"
                                min="0"
                                step="0.5"
                                value={set.weight}
                                onChange={(e) =>
                                  handleSetChange(
                                    set.id,
                                    'weight',
                                    e.target.value,
                                  )
                                }
                                className="w-24"
                                placeholder="Weight"
                              />
                            </div>
                            <div className="flex items-center justify-center">
                              <span className="text-xs opacity-50 mt-3">/</span>
                            </div>
                            <div>
                              <Label className="text-xs">RPE</Label>
                              <Input
                                id={`rpe-${set.id}`}
                                type="number"
                                min="1"
                                max="10"
                                value={set.rpe}
                                onChange={(e) =>
                                  handleSetChange(set.id, 'rpe', e.target.value)
                                }
                                className="w-24"
                                placeholder="RPE"
                              />
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-md"
                            onClick={() => handleRemoveSet(set.id)}
                            iconOnly={<XIcon />}
                          />
                        </div>
                      </Card>
                    </motion.div>
                  ))}

                  {localSets.length === 0 && (
                    <div className="text-center py-4 text-muted-foreground">
                      No sets yet. Click "Add Set" to get started.
                    </div>
                  )}
                </div>
              </AnimatePresence>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-row justify-between">
          <div>
            <Button
              variant="destructive"
              onClick={onClose}
              className="w-auto"
              disabled={!exerciseId}
              iconStart={<Trash2 />}
            >
              Remove
            </Button>
          </div>
          <div>
            <Button variant="outline" onClick={onClose} className="w-auto">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
