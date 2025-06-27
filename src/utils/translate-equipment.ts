import { GQLEquipment } from '@/generated/graphql-client'

export function translateEquipment(equipment: GQLEquipment) {
  switch (equipment) {
    case GQLEquipment.Barbell:
      return 'Barbell'
    case GQLEquipment.Dumbbell:
      return 'Dumbbell'
    case GQLEquipment.Machine:
      return 'Machine'
    case GQLEquipment.Bodyweight:
      return 'Bodyweight'
    case GQLEquipment.Cable:
      return 'Cable'
    case GQLEquipment.MedicineBall:
      return 'Medicine Ball'
    case GQLEquipment.Wheel:
      return 'Wheel'
    case GQLEquipment.Band:
      return 'Band'
    case GQLEquipment.Kettlebell:
      return 'Kettlebell'
    case GQLEquipment.TrapBar:
      return 'Trap Bar'
    case GQLEquipment.SmithMachine:
      return 'Smith Machine'
    case GQLEquipment.Other:
      return 'Other'
  }
}
