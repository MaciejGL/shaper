import React from 'react'

import { cn } from '@/lib/utils'

// Memoized insertion indicator to prevent unnecessary rerenders
export const InsertionIndicator = React.memo(
  ({ isActive }: { isActive: boolean }) => {
    return (
      <div
        className={cn(
          'transition-all duration-300 ease-out overflow-hidden',
          isActive ? 'h-[120px] mb-2' : 'h-0',
        )}
      >
        <div className="relative h-[120px]">
          <div
            className={cn(
              'absolute inset-0 bg-primary/20 border-2 border-dashed border-primary/50 rounded-lg transition-all duration-300',
              isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
            )}
          >
            {isActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-primary font-medium text-sm">
                  Drop exercise here
                </span>
              </div>
            )}
          </div>
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
          isActive ? 'min-h-[120px] mb-2' : 'h-0',
        )}
      >
        <div className="relative h-full">
          <div
            className={cn(
              'absolute inset-0 bg-zinc-800 border-zinc-800 rounded-lg transition-all duration-300 h-full',
              isActive ? 'opacity-100 scale-100' : '',
            )}
          ></div>
        </div>
      </div>
    )
  },
)
InsertionIndicatorBlank.displayName = 'InsertionIndicatorBlank'
