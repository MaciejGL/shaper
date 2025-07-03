'use client'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { GQLMuscleGroupCategoriesQuery } from '@/generated/graphql-client'

interface MuscleGroupSelectorProps {
  categories?: GQLMuscleGroupCategoriesQuery['muscleGroupCategories']
  selectedMuscleGroups: {
    id: string
  }[]
  onMuscleGroupsChange: (
    muscleGroups: {
      id: string
    }[],
  ) => void
}

export function MuscleGroupSelector({
  categories,
  selectedMuscleGroups,
  onMuscleGroupsChange,
}: MuscleGroupSelectorProps) {
  const handleMuscleToggle = (
    muscle: GQLMuscleGroupCategoriesQuery['muscleGroupCategories'][number]['muscles'][number],
  ) => {
    const muscleWithPrimary = { ...muscle, isPrimary: true }

    const isSelected = selectedMuscleGroups.some((mg) => mg.id === muscle.id)

    if (isSelected) {
      onMuscleGroupsChange(
        selectedMuscleGroups.filter((mg) => mg.id !== muscle.id),
      )
    } else {
      onMuscleGroupsChange([...selectedMuscleGroups, muscleWithPrimary])
    }
  }

  const isMuscleSelected = (muscleId: string) => {
    return selectedMuscleGroups.some((mg) => mg.id === muscleId)
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Select Muscle Groups</Label>
      <div className="space-y-2 bg-card rounded-lg p-4">
        {categories?.map((category) => (
          <div key={category.id} className="space-y-1">
            <p className="font-medium text-sm">{category.name}</p>

            <div className="flex flex-wrap gap-2">
              {category.muscles?.map((muscle) => (
                <Badge
                  key={muscle.id}
                  variant={isMuscleSelected(muscle.id) ? 'primary' : 'outline'}
                  className="cursor-pointer"
                  size="lg"
                  onClick={() => handleMuscleToggle(muscle)}
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
}
