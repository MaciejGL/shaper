import { cn } from '@/lib/utils'

export const ExtendHeader = ({
  headerChildren,
  children,
}: {
  headerChildren: React.ReactNode
  children: React.ReactNode
}) => {
  return (
    <div
      className={cn(
        'bg-sidebar',
        '-mx-2 md:-mx-4 lg:-mx-8',
        'px-0 md:px-0 lg:px-0 pb-0 md:pb-0 lg:pb-0 ',
      )}
    >
      {headerChildren && <div className="dark">{headerChildren}</div>}
      <div
        className={cn(
          'pb-4 bg-background rounded-t-3xl mt-0 px-2 md:px-4 lg:px-8  overflow-hidden',
        )}
      >
        <div className="max-w-sm mx-auto">{children}</div>
      </div>
    </div>
  )
}
