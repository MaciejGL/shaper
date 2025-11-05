import { cn } from '@/lib/utils'

import { AnimateNumber } from './animate-number'

export function StatsItem({
  value,
  icon,
  label,
  iconPosition = 'left',
  variant = 'default',
  loading = false,
  classNameLabel = '',
}: {
  value: number | string | React.ReactNode
  icon?: React.ReactNode
  label: string
  iconPosition?: 'left' | 'top' | 'right'
  variant?: 'default' | 'secondary' | 'outline'
  loading?: boolean
  classNameLabel?: string
}) {
  return (
    <div
      className={cn('text-center p-3 bg-card-on-card rounded-lg', {
        'bg-card': variant === 'secondary',
        'bg-transparent border border-border': variant === 'outline',
        'masked-placeholder-text': loading,
      })}
    >
      {icon ? (
        <div
          className={cn('flex items-center gap-3', {
            'flex-col': iconPosition === 'top',
            'flex-row-reverse justify-between': iconPosition === 'right',
          })}
        >
          <div className="[&_svg]:size-5">{icon}</div>
          <div
            className={cn('flex flex-col items-start grow', {
              'items-center': iconPosition === 'top',
              'items-start': iconPosition === 'right',
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
              <div className="text-lg text-left font-bold text-primary w-full">
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
          <div className={cn('text-xs text-muted-foreground', classNameLabel)}>
            {label}
          </div>
        </>
      )}
    </div>
  )
}
