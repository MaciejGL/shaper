import { ReactNode } from 'react'

import { GQLUserRole } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import type { UserWithSession } from '@/types/UserWithSession'

import { Navbar } from './navbar/navbar'

interface MainProps {
  children: ReactNode
  className?: string
  user?: UserWithSession | null
  withSidebar?: boolean
}

export const Main = ({
  children,
  className,
  user,
  withSidebar = false,
}: MainProps) => {
  const isTrainer = user?.user?.role === GQLUserRole.Trainer

  return (
    <main
      className={cn(
        'h-dvh grid grid-cols-1 grid-rows-[auto_1fr] w-full ',
        className,
      )}
    >
      <Navbar user={user} withSidebar={withSidebar} />

      <div
        className={cn('w-full grid bg-sidebar', {
          'md:p-2 md:-mt-2 overflow-hidden': isTrainer,
        })}
      >
        <div
          id="main-content"
          className={cn(
            'w-full h-full p-2 md:px-4 lg:px-8 bg-background safe-area-bottom',
            {
              'md:rounded-md overflow-y-auto md:p-4 lg:p-8': isTrainer,
              'pt-[calc(var(--safe-area-inset-top))] grow rounded-t-3xl':
                !isTrainer,
            },
          )}
        >
          {children}
        </div>
      </div>
    </main>
  )
}
