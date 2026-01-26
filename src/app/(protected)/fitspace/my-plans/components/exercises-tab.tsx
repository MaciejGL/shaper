'use client'

import { Dumbbell, Plus, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'

import { HeaderTab } from '@/components/header-tab'
import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DISPLAY_GROUP_TO_HIGH_LEVEL,
  HIGH_LEVEL_GROUPS,
  HIGH_LEVEL_TO_DISPLAY_GROUPS,
  type HighLevelGroup,
} from '@/config/muscles'
import { SUBSCRIPTION_LIMITS } from '@/config/subscription-limits'
import { useUser } from '@/context/user-context'
import {
  type GQLEquipment,
  type GQLFitspaceGetExercisesQuery,
  useFitspaceGetExercisesQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { translateEquipment } from '@/utils/translate-equipment'

import { CustomExerciseDialog } from '../../workout/training/components/custom-exercise-dialog/custom-exercise-dialog'
import { useCustomExerciseMutations } from '../../workout/training/components/custom-exercise-dialog/use-custom-exercise-mutations'

import { DeleteExerciseDialog } from './my-exercises/delete-exercise-dialog'
import { MyExercisesFilters } from './my-exercises/my-exercises-filters'
import { MyExercisesSection } from './my-exercises/my-exercises-section'

type CustomExercise = NonNullable<
  NonNullable<GQLFitspaceGetExercisesQuery['getExercises']>['userExercises']
>[number]

const EMPTY_EXERCISES: CustomExercise[] = []

export function ExercisesTab() {
  const { hasPremium, user } = useUser()
  const { data, isLoading } = useFitspaceGetExercisesQuery()

  const categories = data?.muscleGroupCategories
  const exercises = data?.getExercises?.userExercises ?? EMPTY_EXERCISES

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingExercise, setEditingExercise] = useState<CustomExercise | null>(
    null,
  )
  const [deleteExercise, setDeleteExercise] = useState<CustomExercise | null>(
    null,
  )

  const [selectedMuscleGroup, setSelectedMuscleGroup] =
    useState<HighLevelGroup | null>(null)
  const [selectedEquipment, setSelectedEquipment] =
    useState<GQLEquipment | null>(null)

  const sorted = useMemo(
    () => [...exercises].sort((a, b) => a.name.localeCompare(b.name)),
    [exercises],
  )

  const availableMuscleGroups = useMemo(() => {
    const present = new Set<HighLevelGroup>()

    sorted.forEach((exercise) => {
      exercise.muscleGroups?.forEach((mg) => {
        const highLevel = DISPLAY_GROUP_TO_HIGH_LEVEL[mg.displayGroup]
        if (highLevel) present.add(highLevel)
      })
    })

    return HIGH_LEVEL_GROUPS.filter((group) => present.has(group))
  }, [sorted])

  const availableEquipment = useMemo(() => {
    const present = new Set<GQLEquipment>()
    sorted.forEach((exercise) => {
      if (exercise.equipment) present.add(exercise.equipment)
    })
    return Array.from(present).sort((a, b) =>
      translateEquipment(a).localeCompare(translateEquipment(b)),
    )
  }, [sorted])

  const filtered = useMemo(() => {
    let result = sorted

    if (selectedMuscleGroup) {
      const displayGroups = HIGH_LEVEL_TO_DISPLAY_GROUPS[selectedMuscleGroup]
      result = result.filter((exercise) =>
        exercise.muscleGroups?.some((mg) =>
          displayGroups.includes(mg.displayGroup),
        ),
      )
    }

    if (selectedEquipment) {
      result = result.filter(
        (exercise) => exercise.equipment === selectedEquipment,
      )
    }

    return result
  }, [sorted, selectedMuscleGroup, selectedEquipment])

  const { remove, isDeleting } = useCustomExerciseMutations({
    categories,
    userId: user?.id,
  })

  const canCreateExercise =
    hasPremium || sorted.length < SUBSCRIPTION_LIMITS.FREE.CUSTOM_EXERCISES
  const shouldShowCreateButton = sorted.length > 0 || isLoading || true // showEmptyState=false for tab
  const shouldShowFilters =
    availableMuscleGroups.length > 1 || availableEquipment.length > 1

  return (
    <div className="space-y-4">
      <HeaderTab
        title="My exercises"
        description="Create exercises you can reuse in workouts and templates."
      />

      <div className="flex items-center justify-between gap-3">
        {shouldShowCreateButton ? (
          <div
            className={cn(
              'flex items-center gap-2 w-full',
              shouldShowFilters ? 'justify-between' : 'justify-end',
            )}
          >
            {!hasPremium ? (
              <p className="text-xs text-muted-foreground tabular-nums flex-1">
                {sorted.length}/{SUBSCRIPTION_LIMITS.FREE.CUSTOM_EXERCISES}{' '}
                exercises
              </p>
            ) : null}
            {shouldShowFilters ? (
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon-md"
                    iconOnly={<SlidersHorizontal />}
                  />
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[320px] p-4">
                  <MyExercisesFilters
                    variant="popover"
                    muscleGroups={availableMuscleGroups}
                    selectedMuscleGroup={selectedMuscleGroup}
                    onMuscleGroupChange={setSelectedMuscleGroup}
                    equipment={availableEquipment}
                    selectedEquipment={selectedEquipment}
                    onEquipmentChange={setSelectedEquipment}
                  />
                </PopoverContent>
              </Popover>
            ) : null}

            <PremiumButtonWrapper
              hasPremium={canCreateExercise}
              tooltipText={`Free plan includes up to ${SUBSCRIPTION_LIMITS.FREE.CUSTOM_EXERCISES} custom exercises. Upgrade to create more.`}
            >
              <Button
                size="md"
                iconStart={<Plus />}
                onClick={() => {
                  setEditingExercise(null)
                  setDialogOpen(true)
                }}
                disabled={!canCreateExercise}
                className="ml-auto"
              >
                Add Exercise
              </Button>
            </PremiumButtonWrapper>
          </div>
        ) : null}
      </div>

      {sorted.length === 0 && !isLoading ? (
        <EmptyExercisesState
          canCreateExercise={canCreateExercise}
          handleCreateExercise={() => {
            setEditingExercise(null)
            setDialogOpen(true)
          }}
        />
      ) : null}

      <MyExercisesSection
        exercises={filtered}
        isLoading={isLoading}
        isDeleting={isDeleting}
        showEmptyState={false}
        onEditExercise={(exercise) => {
          setEditingExercise(exercise)
          setDialogOpen(true)
        }}
        onDeleteExercise={(exercise) => setDeleteExercise(exercise)}
      />

      <CustomExerciseDialog
        open={dialogOpen}
        onOpenChange={(nextOpen) => {
          setDialogOpen(nextOpen)
          if (!nextOpen) setEditingExercise(null)
        }}
        categories={categories}
        exercise={editingExercise ?? undefined}
      />

      <DeleteExerciseDialog
        exercise={deleteExercise}
        isDeleting={isDeleting}
        onCancel={() => setDeleteExercise(null)}
        onConfirm={async () => {
          if (!deleteExercise) return
          await remove({ id: deleteExercise.id })
          setDeleteExercise(null)
        }}
      />
    </div>
  )
}

function EmptyExercisesState({
  canCreateExercise,
  handleCreateExercise,
}: {
  canCreateExercise: boolean
  handleCreateExercise: () => void
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center text-center py-6">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <Dumbbell className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Create your first exercise
        </h3>
        <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
          Create exercises you can reuse in workouts and templates.
        </p>
        <div className="flex gap-2">
          <PremiumButtonWrapper
            hasPremium={canCreateExercise}
            tooltipText={`Free plan includes up to ${SUBSCRIPTION_LIMITS.FREE.CUSTOM_EXERCISES} custom exercises. Upgrade to create more.`}
          >
            <Button
              onClick={handleCreateExercise}
              iconStart={<Plus />}
              disabled={!canCreateExercise}
            >
              Add Exercise
            </Button>
          </PremiumButtonWrapper>
        </div>
      </CardContent>
    </Card>
  )
}
