'use client'

import { equipmentIcons } from '@/components/equipment-icons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { GQLEquipment } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { translateEquipment } from '@/utils/translate-equipment'

type EquipmentFiltersProps = {
  selectedEquipment: GQLEquipment[]
  onEquipmentToggle: (equipment: GQLEquipment) => void
  equipment: GQLEquipment[]
  variant?: 'compact' | 'cards' | 'grid'
}

const getEquipmentIcon = (equipment: GQLEquipment) => {
  switch (equipment) {
    case GQLEquipment.Band:
      return (
        <div className="size-full [&_svg]:size-full">{equipmentIcons.band}</div>
      )
    case GQLEquipment.Barbell:
      return (
        <div className="size-full [&_svg]:size-full">
          {equipmentIcons.barbell}
        </div>
      )
    case GQLEquipment.Bodyweight:
      return (
        <div className="size-full [&_svg]:size-full">
          {equipmentIcons.bodyweight}
        </div>
      )
    case GQLEquipment.Cable:
      return (
        <div className="size-full [&_svg]:size-full">
          {equipmentIcons.cable}
        </div>
      )
    case GQLEquipment.Dumbbell:
      return (
        <div className="size-full [&_svg]:size-full">
          {equipmentIcons.dumbbell}
        </div>
      )
    case GQLEquipment.Kettlebell:
      return (
        <div className="size-full [&_svg]:size-full">
          {equipmentIcons.kettlebell}
        </div>
      )
    case GQLEquipment.Machine:
      return (
        <div className="size-full [&_svg]:size-full">
          {equipmentIcons.machine}
        </div>
      )
    case GQLEquipment.SmithMachine:
      return (
        <div className="size-full [&_svg]:size-full">
          {equipmentIcons.smithmachine}
        </div>
      )
    case GQLEquipment.Other:
      return (
        <div className="size-full [&_svg]:size-full">
          {equipmentIcons.other}
        </div>
      )
    default:
      return null
  }
}

export function EquipmentFilters({
  selectedEquipment,
  onEquipmentToggle,
  equipment,
  variant = 'compact',
}: EquipmentFiltersProps) {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {equipment.map((equipmentItem) => (
          <Card
            key={equipmentItem}
            className={cn(
              'cursor-pointer transition-all bg-neutral-400 dark:bg-neutral-500',
              selectedEquipment.includes(equipmentItem)
                ? 'ring-2 ring-primary bg-primary/5'
                : 'hover:bg-muted/50',
            )}
            onClick={() => onEquipmentToggle(equipmentItem)}
          >
            <CardContent className="px-2 text-center space-y-2">
              <div
                className={cn(
                  'mx-auto text-black',
                  'size-full max-w-24 max-h-24',
                )}
              >
                {getEquipmentIcon(equipmentItem)}
              </div>
              <div className="text-sm font-medium">
                {translateEquipment(equipmentItem)}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {equipment.map((equipmentItem) => (
          <Button
            key={equipmentItem}
            onClick={() => onEquipmentToggle(equipmentItem)}
            variant={
              selectedEquipment.includes(equipmentItem) ? 'default' : 'outline'
            }
            className="h-16 flex flex-col gap-1 p-2"
          >
            <div
              className={cn(
                selectedEquipment.includes(equipmentItem)
                  ? 'text-primary-foreground'
                  : 'text-foreground',
              )}
            >
              {getEquipmentIcon(equipmentItem)}
            </div>
            <span className="text-xs leading-tight">
              {translateEquipment(equipmentItem)?.split(' ')[0]}
            </span>
          </Button>
        ))}
      </div>
    )
  }

  // Default compact variant
  return (
    <div className="flex flex-wrap gap-2">
      {equipment.map((equipmentItem) => (
        <Button
          key={equipmentItem}
          onClick={() => onEquipmentToggle(equipmentItem)}
          variant={
            selectedEquipment.includes(equipmentItem) ? 'default' : 'outline'
          }
          size="sm"
          className="gap-2"
        >
          <div
            className={
              selectedEquipment.includes(equipmentItem)
                ? 'text-primary-foreground'
                : 'text-foreground'
            }
          >
            {getEquipmentIcon(equipmentItem)}
          </div>
          {translateEquipment(equipmentItem)}
        </Button>
      ))}
    </div>
  )
}
