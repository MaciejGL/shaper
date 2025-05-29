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
    case GQLEquipment.Other:
      return 'Other'
  }
}
