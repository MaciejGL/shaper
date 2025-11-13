import { Badge } from '@/components/ui/badge'
import { GQLEquipment } from '@/generated/graphql-client'
import { translateEquipment } from '@/utils/translate-equipment'

interface EquipmentSectionProps {
  equipment: string[]
}

const ExcludedEquipment = ['Other', 'Bodyweight']

export function EquipmentSection({ equipment }: EquipmentSectionProps) {
  if (!equipment || equipment.length === 0) return null

  const translatedEquipment = equipment
    .map((item: string) => translateEquipment(item as GQLEquipment))
    .filter((item: string) => !ExcludedEquipment.includes(item))

  if (translatedEquipment.length === 0) return null

  return (
    <div>
      <h3 className="font-semibold mb-2 text-sm">Equipment Needed</h3>
      <div className="flex flex-wrap gap-2">
        {translatedEquipment.map((item: string, index: number) => (
          <Badge key={index} size="lg" variant="secondary">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  )
}
