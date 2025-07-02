import { TrendingDown, TrendingUp } from 'lucide-react'

import { cn, formatNumber } from '@/lib/utils'

interface StatCardProps {
  label: string
  value?: number
  unit: string
  trend?: number | null
  size?: 'default' | 'sm'
  isOnCard?: boolean
}

export function StatCard({
  label,
  value,
  unit,
  trend,
  size = 'default',
  isOnCard = false,
}: StatCardProps) {
  const formatTrend = (trend: number) => {
    const isPositive = trend > 0
    const isNegative = trend < 0
    const TrendIcon = isPositive ? TrendingUp : TrendingDown

    return (
      <div
        className={`flex items-center gap-1 text-xs ${
          isPositive
            ? 'text-amber-500'
            : isNegative
              ? 'text-emerald-500'
              : 'text-muted-foreground'
        }`}
      >
        <TrendIcon className="h-3 w-3" />
        <span>
          {isPositive ? '+' : ''}
          {formatNumber(trend, 1)} {unit}
        </span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg bg-card dark:bg-card',
        size === 'sm' ? 'p-2' : 'p-3',
        isOnCard && 'bg-card-on-card dark:bg-card-on-card',
      )}
    >
      <span
        className={cn(
          'text-muted-foreground',
          size === 'sm' ? 'text-xs' : 'text-sm',
        )}
      >
        {label}
      </span>
      <div className="mt-2">
        <div
          className={cn(
            'font-bold',
            size === 'sm' ? 'text-lg' : 'text-2xl',
            value === undefined && 'text-muted-foreground',
          )}
        >
          {value ? `${formatNumber(value, 1)} ${unit}` : '—'}
        </div>
        {trend !== null && trend !== undefined && formatTrend(trend)}
      </div>
    </div>
  )
}
