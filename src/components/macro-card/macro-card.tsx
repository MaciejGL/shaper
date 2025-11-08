import { cn } from '@/lib/utils'

interface MacroCardProps {
  label: string
  value: number | string
  unit?: string
  isLoading?: boolean
  className?: string
}

export function MacroCard({
  label,
  value,
  unit = '',
  isLoading = false,
  className = '',
}: MacroCardProps) {
  return (
    <div
      className={cn(
        'text-center p-2 flex-center flex-col not-first:border-l border-primary/10',
        className,
      )}
    >
      <div
        className={cn(
          'text-base font-semibold w-max text-foreground',
          {
            'masked-placeholder-text': isLoading,
          },
          className,
        )}
      >
        {value}
        {unit}
      </div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  )
}
