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
    <div className={cn('bg-sidebar flex flex-col min-h-[calc(100%)]')}>
      {headerChildren && (
        <div className={cn('px-4 max-w-md h-max', classNameHeader)}>
          {headerChildren}
        </div>
      )}
      <div
        className={cn(
          'bg-linear-to-b from-background to-background-subtle rounded-t-[18px] p-4 overflow-hidden flex-1 pb-[100px]',
          classNameContent,
        )}
      >
        <div className="max-w-md mx-auto">{children}</div>
      </div>
    </div>
  )
}
