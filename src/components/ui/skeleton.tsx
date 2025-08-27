import { cn } from '@/lib/utils'

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'bg-accent animate-pulse rounded-md dark:bg-primary/15',
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
