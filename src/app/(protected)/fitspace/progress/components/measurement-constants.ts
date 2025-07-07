export const measurementCategories = [
  {
    id: 'core',
    title: 'Core Measurements',
    fields: [
      { key: 'weight' as const, label: 'Weight', unit: 'kg' },
      { key: 'bodyFat' as const, label: 'Body Fat', unit: '%' },
    ],
  },
  {
    id: 'circumferences',
    title: 'Body Circumferences',
    fields: [
      { key: 'chest' as const, label: 'Chest', unit: 'cm' },
      { key: 'waist' as const, label: 'Waist', unit: 'cm' },
      { key: 'hips' as const, label: 'Hips', unit: 'cm' },
      { key: 'neck' as const, label: 'Neck', unit: 'cm' },
    ],
  },
  {
    id: 'limbs',
    title: 'Arms & Legs',
    fields: [
      { key: 'bicepsLeft' as const, label: 'Left Bicep', unit: 'cm' },
      { key: 'bicepsRight' as const, label: 'Right Bicep', unit: 'cm' },
      { key: 'thighLeft' as const, label: 'Left Thigh', unit: 'cm' },
      { key: 'thighRight' as const, label: 'Right Thigh', unit: 'cm' },
      { key: 'calfLeft' as const, label: 'Left Calf', unit: 'cm' },
      { key: 'calfRight' as const, label: 'Right Calf', unit: 'cm' },
    ],
  },
] as const

export type MeasurementCategory = (typeof measurementCategories)[number]
export type MeasurementField = MeasurementCategory['fields'][number]['key']
export enum MeasurementFieldEnum {
  Weight = 'weight',
  BodyFat = 'bodyFat',
  Chest = 'chest',
  Neck = 'neck',
  Waist = 'waist',
  Hips = 'hips',
  BicepsLeft = 'bicepsLeft',
  BicepsRight = 'bicepsRight',
  ThighLeft = 'thighLeft',
  ThighRight = 'thighRight',
  CalfLeft = 'calfLeft',
  CalfRight = 'calfRight',
  Notes = 'notes',
}
