import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  title: string
  className?: string
  action?: React.ReactNode
}

export function Section({ children, title, className, action }: SectionProps) {
  return (
    <div className={cn('', className)}>
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-semibold text-lg mb-3">{title}</h3>
        {action}
      </div>
      {children}
    </div>
  )
}
