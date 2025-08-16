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
  { value: GQLEquipment.Other, label: 'Other' },
]

export const equipmentImages: Record<GQLEquipment, string> = {
  [GQLEquipment.Band]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755345967/ChatGPT_Image_Aug_16_2025_02_04_51_PM_y8gtwc.png',
  [GQLEquipment.Bench]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755346041/ChatGPT_Image_Aug_16_2025_02_07_14_PM_ensdgc.png',
  [GQLEquipment.Bodyweight]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755347124/ChatGPT_Image_Aug_16_2025_02_24_30_PM_ep6pbd.png',
  [GQLEquipment.Cable]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755346378/ChatGPT_Image_Aug_16_2025_02_12_45_PM_zkqnpx.png',
  [GQLEquipment.Dumbbell]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755346456/ChatGPT_Image_Aug_16_2025_02_14_09_PM_ayez2m.png',
  [GQLEquipment.EzBar]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755346544/ChatGPT_Image_Aug_16_2025_02_15_36_PM_tueauo.png',
  [GQLEquipment.Kettlebell]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755346668/ChatGPT_Image_Aug_16_2025_02_17_37_PM_z6c5pi.png',
  [GQLEquipment.Machine]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755346933/ChatGPT_Image_Aug_16_2025_02_22_05_PM_ss49ck.png',
  [GQLEquipment.SmithMachine]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755347038/ChatGPT_Image_Aug_16_2025_02_23_46_PM_khjghe.png',
  [GQLEquipment.Barbell]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755348298/ChatGPT_Image_Aug_16_2025_02_44_43_PM_j0otnt.png',
  [GQLEquipment.Other]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755347493/ChatGPT_Image_Aug_16_2025_02_31_16_PM_p3zdue.png',
  [GQLEquipment.Mat]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755347493/ChatGPT_Image_Aug_16_2025_02_31_16_PM_p3zdue.png',
  [GQLEquipment.MedicineBall]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755347493/ChatGPT_Image_Aug_16_2025_02_31_16_PM_p3zdue.png',
  [GQLEquipment.ExerciseBall]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755347493/ChatGPT_Image_Aug_16_2025_02_31_16_PM_p3zdue.png',
  [GQLEquipment.TrapBar]:
    'https://res.cloudinary.com/drfdhibmu/image/upload/v1755347826/ChatGPT_Image_Aug_16_2025_02_36_51_PM_p5dmxh.png',
}
