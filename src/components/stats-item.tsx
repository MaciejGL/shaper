import { cn } from '@/lib/utils'

import { AnimateNumber } from './animate-number'

export function StatsItem({
  value,
  icon,
  label,
  iconPosition = 'left',
}: {
  value: number | string | React.ReactNode
  icon?: React.ReactNode
  label: string
  iconPosition?: 'left' | 'top'
}) {
  return (
    <div className="text-center p-3 bg-white dark:bg-background rounded-lg shadow-md">
      {icon ? (
        <div
          className={cn('flex items-center gap-2', {
            'flex-col': iconPosition === 'top',
          })}
        >
          <div>{icon}</div>
          <div
            className={cn('flex flex-col items-start', {
              'items-center': iconPosition === 'top',
            })}
          >
            {typeof value === 'number' ? (
              <div className="text-lg text-left font-bold text-primary">
                <AnimateNumber value={value} />
              </div>
            ) : typeof value === 'string' ? (
              <div className="text-lg text-left font-bold text-primary">
                {value}
              </div>
            ) : (
              <div className="text-lg text-left font-bold text-primary">
                {value}
              </div>
            )}
            <div className="text-xs text-left text-muted-foreground">
              {label}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="text-lg font-bold text-primary">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </>
      )}
    </div>
  )
}
