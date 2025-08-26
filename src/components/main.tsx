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

export const Main = async ({
  children,
  className,
  user,
  withSidebar = false,
}: MainProps) => {
  const isTrainer = user?.user?.role === GQLUserRole.Trainer

  return (
    <main
      className={cn(
        'h-dvh grid grid-cols-1 grid-rows-[auto_1fr] w-full bg-sidebar',
        className,
      )}
    >
      <div
        className={
          !isTrainer ? 'z-10 bg-sidebar fixed top-0 left-0 right-0' : 'relative'
        }
      >
        {user && <Navbar user={user} withSidebar={withSidebar} />}
      </div>
      <div
        className={cn('w-full h-[calc(100%+0.5rem)] overflow-hidden', {
          'md:p-2 -mt-2': isTrainer,
        })}
      >
        <div
          id="main-content"
          className={cn(
            'w-full h-full p-2 md:p-4 lg:p-8 bg-background overflow-y-auto safe-area-bottom',
            {
              'md:rounded-md': isTrainer,
              'pt-[calc(var(--safe-area-inset-top))] min-h-screen': !isTrainer,
            },
          )}
        >
          {children}
        </div>
      </div>
    </main>
  )
}
