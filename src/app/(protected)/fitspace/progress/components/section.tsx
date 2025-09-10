import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  title: string
  className?: string
  action?: React.ReactNode
  size?: 'default' | 'sm'
}

export function Section({
  children,
  title,
  className,
  action,
  size = 'default',
}: SectionProps) {
  return (
    <div className={cn('', className)}>
      <div className="flex items-start justify-between gap-4 mb-3">
        <h3
          className={cn('font-semibold text-lg ', size === 'sm' && 'text-base')}
        >
          {title}
        </h3>
        {action}
      </div>
      {children}
    </div>
  )
}
