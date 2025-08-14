import { GQLEquipment } from '@/generated/graphql-client'

export const EQUIPMENT_OPTIONS: { value: GQLEquipment; label: string }[] = [
  { value: GQLEquipment.Barbell, label: 'Barbell' },
  { value: GQLEquipment.EzBar, label: 'EZ Bar' },
  { value: GQLEquipment.Dumbbell, label: 'Dumbbell' },
  { value: GQLEquipment.Machine, label: 'Machine' },
  { value: GQLEquipment.Cable, label: 'Cable' },
  { value: GQLEquipment.SmithMachine, label: 'Smith Machine' },
  { value: GQLEquipment.Bodyweight, label: 'Bodyweight' },
  { value: GQLEquipment.Kettlebell, label: 'Kettlebell' },
  { value: GQLEquipment.Band, label: 'Band' },
  { value: GQLEquipment.MedicineBall, label: 'Medicine Ball' },
  { value: GQLEquipment.ExerciseBall, label: 'Exercise Ball' },
  { value: GQLEquipment.PullUpBar, label: 'Pull Up Bar' },
  { value: GQLEquipment.Bench, label: 'Bench' },
  { value: GQLEquipment.Other, label: 'Other' },
]
