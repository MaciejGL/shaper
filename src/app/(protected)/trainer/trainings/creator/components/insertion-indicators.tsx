import React from 'react'

import { cn } from '@/lib/utils'

// Memoized insertion indicator to prevent unnecessary rerenders
export const InsertionIndicator = React.memo(
  ({ isActive }: { isActive: boolean }) => {
    return (
      <div
        className={cn(
          'transition-all duration-300 ease-out overflow-hidden',
          isActive ? 'h-[120px] my-2' : 'h-0',
        )}
      >
        <div className="relative h-[120px]">
          <div
            className={cn(
              'absolute inset-0 bg-primary/10 rounded-lg transition-all duration-300',
              isActive ? 'opacity-100 mx-2' : 'opacity-0 mx-2',
            )}
          ></div>
        </div>
      </div>
    )
  },
)
InsertionIndicator.displayName = 'InsertionIndicator'

export const InsertionIndicatorBlank = React.memo(
  ({ isActive }: { isActive: boolean }) => {
    return (
      <div
        className={cn(
          'transition-all duration-300 ease-out overflow-hidden',
          isActive ? 'h-[120px] my-2' : 'h-0',
        )}
      >
        <div className="relative h-[120px]">
          <div
            className={cn(
              'absolute inset-0 bg-primary/10 rounded-lg transition-all duration-300',
              isActive ? 'opacity-100 mx-2' : 'opacity-0 mx-2',
            )}
          ></div>
        </div>
      </div>
    )
  },
)
InsertionIndicatorBlank.displayName = 'InsertionIndicatorBlank'
