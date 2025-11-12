import { ProgressCircle } from '@/components/ui/progress-circle'
import { cn } from '@/lib/utils'

interface WeekProgressCircleProps {
  progress: number
  size?: number
  className?: string
  strokeWidth?: number
  showValue?: boolean
}

export function WeekProgressCircle({
  progress,
  size = 20,
  className,
  strokeWidth = 2,
  showValue = false,
}: WeekProgressCircleProps) {
  return (
    <ProgressCircle
      progress={progress}
      size={size}
      className={cn('mx-auto mb-1', className)}
      strokeWidth={strokeWidth}
      showValue={showValue}
    />
  )
}
