'use client'

import { useEffect, useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { EQUIPMENT_OPTIONS } from '@/config/equipment'
import {
  DISPLAY_GROUP_TO_HIGH_LEVEL,
  HIGH_LEVEL_GROUPS,
  type HighLevelGroup,
} from '@/config/muscles'
import { useUser } from '@/context/user-context'

import type {
  CustomExerciseDialogExercise,
  CustomExerciseFormState,
  MuscleGroupCategories,
} from './types'
import { useCustomExerciseMutations } from './use-custom-exercise-mutations'

interface CustomExerciseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  categories: MuscleGroupCategories | undefined
  initialName?: string
  exercise?: Pick<CustomExerciseDialogExercise, 'id' | 'name' | 'equipment'> & {
    muscleGroups?: { displayGroup: string }[] | null
  }
}

export function CustomExerciseDialog({
  open,
  onOpenChange,
  categories,
  initialName,
  exercise,
}: CustomExerciseDialogProps) {
  const { user } = useUser()
  const { create, update, isCreating, isUpdating } = useCustomExerciseMutations(
    {
      categories,
      userId: user?.id,
    },
  )

  const initialGroup = useMemo<HighLevelGroup | null>(() => {
    const displayGroup = exercise?.muscleGroups?.[0]?.displayGroup
    if (!displayGroup) return null
    return DISPLAY_GROUP_TO_HIGH_LEVEL[displayGroup] ?? null
  }, [exercise])

  const [form, setForm] = useState<CustomExerciseFormState>({
    name: exercise?.name ?? initialName ?? '',
    highLevelGroup: initialGroup,
    equipment: exercise?.equipment ?? null,
  })

  useEffect(() => {
    if (!open) return
    setForm({
      name: exercise?.name ?? initialName ?? '',
      highLevelGroup: initialGroup,
      equipment: exercise?.equipment ?? null,
    })
  }, [
    open,
    exercise?.id,
    exercise?.name,
    exercise?.equipment,
    initialName,
    initialGroup,
  ])

  const isBusy = isCreating || isUpdating
  const hasCategories = (categories?.length ?? 0) > 0
  const canSubmit =
    hasCategories && Boolean(form.name.trim()) && form.highLevelGroup && !isBusy

  const handleSubmit = async () => {
    if (!form.highLevelGroup) return
    const name = form.name.trim()
    if (!name) return

    if (exercise?.id) {
      await update({
        id: exercise.id,
        name,
        highLevelGroup: form.highLevelGroup,
        equipment: form.equipment,
      })
    } else {
      await create({
        name,
        highLevelGroup: form.highLevelGroup,
        equipment: form.equipment,
      })
    }

    onOpenChange(false)
  }

  const title = exercise?.id ? 'Edit exercise' : 'Add exercise'

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent
        dialogTitle={title}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col h-full">
          <DrawerHeader className="border-b flex-none">
            <DrawerTitle>{title}</DrawerTitle>
            <DrawerDescription>
              Create your own exercise so you can reuse it in workouts and
              templates.
            </DrawerDescription>
          </DrawerHeader>

          <div className="min-h-0 px-4 pt-4 pb-8 flex-1 overflow-y-auto">
            <div className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="custom-exercise-name">Name</Label>
                <Input
                  id="custom-exercise-name"
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g., Seated cable row"
                  variant="secondary"
                />
              </div>

              <div className="space-y-2">
                <Label>Muscle group</Label>
                <div className="flex flex-wrap gap-2">
                  {HIGH_LEVEL_GROUPS.map((group) => {
                    const selected = form.highLevelGroup === group
                    return (
                      <Badge
                        key={group}
                        asChild
                        variant={selected ? 'primary' : 'secondary'}
                        size="md-lg"
                      >
                        <button
                          type="button"
                          disabled={!hasCategories}
                          aria-pressed={selected}
                          className="disabled:opacity-60 disabled:pointer-events-none"
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              highLevelGroup: selected ? null : group,
                            }))
                          }
                        >
                          {group}
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Equipment (optional)</Label>
                <div className="flex flex-wrap gap-2">
                  {EQUIPMENT_OPTIONS.map(({ value, label }) => {
                    const selected = form.equipment === value
                    return (
                      <Badge
                        key={value}
                        asChild
                        variant={selected ? 'equipment' : 'secondary'}
                        size="md-lg"
                      >
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() =>
                            setForm((p) => ({
                              ...p,
                              equipment: selected ? null : value,
                            }))
                          }
                        >
                          {label}
                        </button>
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter className="border-t flex-none">
            <div className="flex flex-row gap-2 justify-end">
              <Button variant="secondary" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                loading={isBusy}
              >
                {exercise?.id ? 'Save' : 'Add'}
              </Button>
            </div>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
