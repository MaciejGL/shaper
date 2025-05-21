import { TrainingWeek } from '../types'

export type WeekFormData = Pick<
  TrainingWeek,
  'id' | 'weekNumber' | 'name' | 'description'
>
