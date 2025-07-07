import { Button } from '@/components/ui/button'
import { GQLEquipment } from '@/generated/graphql-client'
import { translateEquipment } from '@/utils/translate-equipment'

type EquipmentFiltersProps = {
  selectedEquipment: GQLEquipment[]
  onEquipmentToggle: (equipment: GQLEquipment) => void
  equipment: GQLEquipment[]
}

export function EquipmentFilters({
  selectedEquipment,
  onEquipmentToggle,
  equipment,
}: EquipmentFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {equipment.map((equipment) => (
        <Button
          key={equipment}
          onClick={() => onEquipmentToggle(equipment)}
          variant={
            selectedEquipment.includes(equipment) ? 'default' : 'outline'
          }
          size="xs"
        >
          {translateEquipment(equipment)}
        </Button>
      ))}
    </div>
  )
}
