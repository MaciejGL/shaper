import { GQLEquipment } from '@/generated/graphql-client'

export const EQUIPMENT_OPTIONS: { value: GQLEquipment; label: string }[] = [
  { value: GQLEquipment.Barbell, label: 'Barbell' },
  { value: GQLEquipment.Dumbbell, label: 'Dumbbell' },
  { value: GQLEquipment.Machine, label: 'Machine' },
  { value: GQLEquipment.Cable, label: 'Cable' },
  { value: GQLEquipment.TrapBar, label: 'Trap Bar' },
  { value: GQLEquipment.Bodyweight, label: 'Bodyweight' },
  { value: GQLEquipment.Band, label: 'Band' },
  { value: GQLEquipment.MedicineBall, label: 'Medicine Ball' },
  { value: GQLEquipment.Wheel, label: 'Wheel' },
  { value: GQLEquipment.Other, label: 'Other' },
]
