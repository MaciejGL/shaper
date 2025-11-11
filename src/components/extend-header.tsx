import { cn } from '@/lib/utils'

export const ExtendHeader = ({
  headerChildren,
  children,
  classNameHeader,
  classNameContent,
}: {
  headerChildren: React.ReactNode
  children: React.ReactNode
  classNameHeader?: string
  classNameContent?: string
}) => {
  return (
    <div className={cn('bg-sidebar')}>
      {headerChildren && (
        <div className={cn('dark px-4 max-w-md mx-auto', classNameHeader)}>
          {headerChildren}
        </div>
      )}
      <div
        className={cn(
          'bg-background rounded-t-3xl p-4 overflow-hidden',
          classNameContent,
        )}
      >
        <div className="max-w-md mx-auto">{children}</div>
      </div>
    </div>
  )
}
