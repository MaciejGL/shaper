import { cn } from '@/lib/utils'

export const ExtendHeader = ({
  headerChildren,
  children,
  classNameHeaderWrapper,
  classNameHeaderContent,
  classNameContent,
}: {
  headerChildren: React.ReactNode
  children: React.ReactNode
  classNameHeaderWrapper?: string
  classNameHeaderContent?: string
  classNameContent?: string
}) => {
  return (
    <div className={cn('flex flex-col min-h-[calc(100%)]')}>
      {headerChildren && (
        <div
          className={cn(
            'h-max mx-auto w-full shadow-xl rounded-b-[18px] relative',
            classNameHeaderWrapper,
          )}
        >
          <div
            className={cn(
              'rounded-b-[18px] bg-sidebar px-4 overflow-hidden',
              classNameHeaderContent,
            )}
          >
            {headerChildren}
          </div>
        </div>
      )}
      <div
        className={cn(
          'bg-linear-to-b from-background to-background-subtle p-4 flex-1 pb-[100px]',
          classNameContent,
        )}
      >
        <div className="max-w-md mx-auto">{children}</div>
      </div>
    </div>
  )
}
