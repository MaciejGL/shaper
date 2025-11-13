'use client'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { GQLMuscleGroupCategoriesQuery } from '@/generated/graphql-client'

interface MuscleGroupSelectorProps {
  categories?: GQLMuscleGroupCategoriesQuery['muscleGroupCategories']
  selectedPrimaryMuscleGroups: {
    id: string
  }[]
  selectedSecondaryMuscleGroups: {
    id: string
  }[]
  onPrimaryMuscleGroupsChange: (
    muscleGroups: {
      id: string
    }[],
  ) => void
  onSecondaryMuscleGroupsChange: (
    muscleGroups: {
      id: string
    }[],
  ) => void
}

export function MuscleGroupSelector({
  categories,
  selectedPrimaryMuscleGroups,
  selectedSecondaryMuscleGroups,
  onPrimaryMuscleGroupsChange,
  onSecondaryMuscleGroupsChange,
}: MuscleGroupSelectorProps) {
  const handlePrimaryMuscleToggle = (
    muscle: GQLMuscleGroupCategoriesQuery['muscleGroupCategories'][number]['muscles'][number],
  ) => {
    const isSelected = selectedPrimaryMuscleGroups.some(
      (mg) => mg.id === muscle.id,
    )

    if (isSelected) {
      onPrimaryMuscleGroupsChange(
        selectedPrimaryMuscleGroups.filter((mg) => mg.id !== muscle.id),
      )
    } else {
      onPrimaryMuscleGroupsChange([
        ...selectedPrimaryMuscleGroups,
        { id: muscle.id },
      ])
    }
  }

  const handleSecondaryMuscleToggle = (
    muscle: GQLMuscleGroupCategoriesQuery['muscleGroupCategories'][number]['muscles'][number],
  ) => {
    const isSelected = selectedSecondaryMuscleGroups.some(
      (mg) => mg.id === muscle.id,
    )

    if (isSelected) {
      onSecondaryMuscleGroupsChange(
        selectedSecondaryMuscleGroups.filter((mg) => mg.id !== muscle.id),
      )
    } else {
      onSecondaryMuscleGroupsChange([
        ...selectedSecondaryMuscleGroups,
        { id: muscle.id },
      ])
    }
  }

  const isPrimaryMuscleSelected = (muscleId: string) => {
    return selectedPrimaryMuscleGroups.some((mg) => mg.id === muscleId)
  }

  const isSecondaryMuscleSelected = (muscleId: string) => {
    return selectedSecondaryMuscleGroups.some((mg) => mg.id === muscleId)
  }

  const renderMuscleSection = (
    title: string,
    description: string,
    handleToggle: (
      muscle: GQLMuscleGroupCategoriesQuery['muscleGroupCategories'][number]['muscles'][number],
    ) => void,
    isSelected: (muscleId: string) => boolean,
    required = false,
  ) => (
    <div className="space-y-2 w-full">
      <div>
        <Label className="text-sm font-medium">
          {title} {required && <span className="text-red-500">*</span>}
        </Label>
        <p className="text-xs text-muted-foreground mt-1">{description}</p>
      </div>
      <div className="space-y-2 bg-card rounded-lg p-4">
        {categories?.map((category) => (
          <div
            key={category.id}
            className="space-y-1 grid grid-cols-[2fr_5fr] gap-4 not-last:border-b border-border pb-2 items-center"
          >
            <p className="font-medium text-xs">{category.name}</p>
            <div className="flex flex-wrap gap-2">
              {category.muscles?.map((muscle) => (
                <Badge
                  key={muscle.id}
                  variant={isSelected(muscle.id) ? 'primary' : 'outline'}
                  className="cursor-pointer"
                  size="sm"
                  onClick={() => handleToggle(muscle)}
                >
                  {muscle.alias || muscle.name}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="flex gap-4 w-full">
      {renderMuscleSection(
        'Primary Muscle Groups',
        'Main muscles targeted by this exercise',
        handlePrimaryMuscleToggle,
        isPrimaryMuscleSelected,
        true,
      )}

      {renderMuscleSection(
        'Secondary Muscle Groups',
        'Muscles that assist or are worked secondarily (optional)',
        handleSecondaryMuscleToggle,
        isSecondaryMuscleSelected,
        false,
      )}
    </div>
  )
}
