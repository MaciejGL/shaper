import { MeasurementFieldEnum } from '../measurement-constants'

export interface MeasurementPosition {
  bodyX: number
  bodyY: number
  inputX: number
  inputY: number
  side: 'left' | 'right'
  label: string
  field: MeasurementFieldEnum
}

export interface MeasurementInputValue {
  field: MeasurementFieldEnum
  value: string
  lastValue?: number
}
