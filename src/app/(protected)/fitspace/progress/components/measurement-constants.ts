export const measurementCategories = [
  {
    id: 'core',
    title: 'Core Measurements',
    fields: [
      { key: 'weight' as const, label: 'Weight', unit: 'dynamic' },
      { key: 'bodyFat' as const, label: 'Body Fat', unit: '%' },
    ],
  },
  {
    id: 'circumferences',
    title: 'Body Circumferences',
    fields: [
      { key: 'chest' as const, label: 'Chest', unit: 'dynamic' },
      { key: 'waist' as const, label: 'Waist', unit: 'dynamic' },
      { key: 'hips' as const, label: 'Hips', unit: 'dynamic' },
      { key: 'neck' as const, label: 'Neck', unit: 'dynamic' },
    ],
  },
  {
    id: 'limbs',
    title: 'Arms & Legs',
    fields: [
      { key: 'bicepsLeft' as const, label: 'Left Bicep', unit: 'dynamic' },
      { key: 'bicepsRight' as const, label: 'Right Bicep', unit: 'dynamic' },
      { key: 'thighLeft' as const, label: 'Left Thigh', unit: 'dynamic' },
      { key: 'thighRight' as const, label: 'Right Thigh', unit: 'dynamic' },
      { key: 'calfLeft' as const, label: 'Left Calf', unit: 'dynamic' },
      { key: 'calfRight' as const, label: 'Right Calf', unit: 'dynamic' },
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
