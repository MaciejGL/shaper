import { GQLEquipment } from '@/generated/graphql-client'

export function translateEquipment(equipment: GQLEquipment) {
  switch (equipment) {
    case GQLEquipment.Barbell:
      return 'Barbell'
    case GQLEquipment.EzBar:
      return 'EZ Bar'
    case GQLEquipment.Dumbbell:
      return 'Dumbbell'
    case GQLEquipment.Machine:
      return 'Machine'
    case GQLEquipment.Cable:
      return 'Cable'
    case GQLEquipment.Bodyweight:
      return 'Bodyweight'
    case GQLEquipment.Band:
      return 'Band'
    case GQLEquipment.Kettlebell:
      return 'Kettlebell'
    case GQLEquipment.SmithMachine:
      return 'Smith Machine'
    case GQLEquipment.TrapBar:
      return 'Trap Bar'
    case GQLEquipment.Bench:
      return 'Bench'
    case GQLEquipment.Other:
      return 'Other'
    default:
      return 'Other'
  }
}
