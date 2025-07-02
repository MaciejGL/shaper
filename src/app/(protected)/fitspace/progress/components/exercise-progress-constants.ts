import { GQLExercisesProgressByUserQuery } from '@/generated/graphql-client'
import { formatSets, formatWeight } from '@/lib/utils'

export type ChartType = 'oneRM' | 'sets' | 'volume'
export type TimePeriod = '12weeks' | '1year' | 'all'

export type ExerciseProgress =
  GQLExercisesProgressByUserQuery['exercisesProgressByUser'][number]

// Helper functions for chart formatting
export function formatYAxisTick(value: number, chartType: ChartType): string {
  switch (chartType) {
    case 'oneRM':
      return formatWeight(value, 0)
    case 'sets':
      return formatSets(value)
    case 'volume':
      return formatWeight(value, 0)
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
      return formatWeight(value, 1)
    case 'sets':
      return `${formatSets(value)} sets`
    case 'volume':
      return formatWeight(value, 0)
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
