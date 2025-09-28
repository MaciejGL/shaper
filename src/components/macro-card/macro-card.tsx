import { cn } from '@/lib/utils'

interface MacroCardProps {
  label: string
  value: number | string
  unit?: string
  color?: string
  isLoading?: boolean
  className?: string
}

export function MacroCard({
  label,
  value,
  unit = '',
  color = 'text-primary',
  isLoading = false,
  className,
}: MacroCardProps) {
  return (
    <div
      className={cn(
        'text-center p-4 bg-card rounded-lg flex-center flex-col',
        className,
      )}
    >
      <div
        className={cn('text-base font-medium w-max', color, {
          'masked-placeholder-text': isLoading,
        })}
      >
        {value}
        {unit}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
