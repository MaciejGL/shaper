import { GQLEquipment } from '@/generated/graphql-client'

export const EQUIPMENT_OPTIONS: { value: GQLEquipment; label: string }[] = [
  { value: GQLEquipment.Band, label: 'Band' },
  { value: GQLEquipment.Barbell, label: 'Barbell' },
  { value: GQLEquipment.Bodyweight, label: 'Bodyweight' },
  { value: GQLEquipment.Cable, label: 'Cable' },
  { value: GQLEquipment.Dumbbell, label: 'Dumbbell' },
  { value: GQLEquipment.Kettlebell, label: 'Kettlebell' },
  { value: GQLEquipment.Machine, label: 'Machine' },
  { value: GQLEquipment.MedicineBall, label: 'Medicine Ball' },
  { value: GQLEquipment.SmithMachine, label: 'Smith Machine' },
  { value: GQLEquipment.TrapBar, label: 'Trap Bar' },
  { value: GQLEquipment.Wheel, label: 'Wheel' },
  { value: GQLEquipment.Other, label: 'Other' },
]
