import { GQLExercisesProgressByUserQuery } from '@/generated/graphql-client'
import { formatSets, formatWeight } from '@/lib/utils'

export type ChartType = 'oneRM' | 'sets' | 'volume'
export type TimePeriod = '1month' | '3months' | '6months' | '1year' | 'all'

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
