import { GQLExercisesProgressByUserQuery } from '@/generated/graphql-client'

export type ChartType = 'oneRM' | 'sets' | 'volume'
export type TimePeriod = '12weeks' | '1year' | 'all'

export type ExerciseProgress =
  GQLExercisesProgressByUserQuery['exercisesProgressByUser'][number]

// Helper functions for chart formatting
export function formatYAxisTick(value: number, chartType: ChartType): string {
  switch (chartType) {
    case 'oneRM':
      return `${value.toFixed(0)}kg`
    case 'sets':
      return Math.round(value).toString()
    case 'volume':
      return `${value.toFixed(0)}kg`
    default:
      return value.toString()
  }
}

export function formatTooltipValue(
  value: number,
  chartType: ChartType,
): string {
  switch (chartType) {
    case 'oneRM':
      return `${value.toFixed(1)} kg`
    case 'sets':
      return `${Math.round(value)} sets`
    case 'volume':
      return `${value.toFixed(0)} kg`
    default:
      return value.toString()
  }
}

export function getChartLabel(chartType: ChartType): string {
  switch (chartType) {
    case 'oneRM':
      return '1RM'
    case 'sets':
      return 'Sets'
    case 'volume':
      return 'Volume'
    default:
      return ''
  }
}

export function getTimePeriodLabel(timePeriod: TimePeriod): string {
  switch (timePeriod) {
    case '12weeks':
      return 'Last 12 Weeks'
    case '1year':
      return 'Last Year'
    case 'all':
      return 'All Time'
    default:
      return ''
  }
}
