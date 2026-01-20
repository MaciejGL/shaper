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

      <div className={cn('w-full grid bg-sidebar')}>
        <div
          className={cn(
            'w-full h-full bg-background safe-area-bottom',
            {
              'p-2 md:p-4 lg:p-8': isTrainer,
            },
            !isTrainer && 'grow',
          )}
        >
          {children}
        </div>
      </div>
    </main>
  )
}
