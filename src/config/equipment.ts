import { GQLEquipment } from '@/generated/graphql-client'

export const EQUIPMENT_OPTIONS: { value: GQLEquipment; label: string }[] = [
  { value: GQLEquipment.Barbell, label: 'Barbell' },
  { value: GQLEquipment.Dumbbell, label: 'Dumbbell' },
  { value: GQLEquipment.EzBar, label: 'EZ Bar' },
  { value: GQLEquipment.Bench, label: 'Bench' },
  { value: GQLEquipment.Machine, label: 'Machine' },
  { value: GQLEquipment.Cable, label: 'Cable' },
  { value: GQLEquipment.SmithMachine, label: 'Smith Machine' },
  { value: GQLEquipment.Bodyweight, label: 'Bodyweight' },
  { value: GQLEquipment.Kettlebell, label: 'Kettlebell' },
  { value: GQLEquipment.Band, label: 'Band' },
  { value: GQLEquipment.TrapBar, label: 'Trap Bar' },
  { value: GQLEquipment.Other, label: 'Other' },
]

export const equipmentImages: Record<GQLEquipment, string> = {
  [GQLEquipment.Band]: '/equipment-icons/band.png',
  [GQLEquipment.Bench]: '/equipment-icons/bench.png',
  [GQLEquipment.Bodyweight]: '/equipment-icons/bodyweight.png',
  [GQLEquipment.Cable]: '/equipment-icons/cable.png',
  [GQLEquipment.Dumbbell]: '/equipment-icons/dumbbell.png',
  [GQLEquipment.EzBar]: '/equipment-icons/ezbar.png',
  [GQLEquipment.Kettlebell]: '/equipment-icons/kettlebell.png',
  [GQLEquipment.Machine]: '/equipment-icons/machine.png',
  [GQLEquipment.SmithMachine]: '/equipment-icons/smithmachine.png',
  [GQLEquipment.Barbell]: '/equipment-icons/barbell.png',
  [GQLEquipment.Other]: '/equipment-icons/other.png',
  [GQLEquipment.TrapBar]: '/equipment-icons/trapbar.png',
}
