import { ReactNode } from 'react'

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
  return (
    <main
      className={cn(
        'min-h-screen grid grid-rows-[auto_1fr] w-full bg-background',
        className,
      )}
    >
      <Navbar user={user} withSidebar={withSidebar} />
      <div className={cn('pr-1 pb-1', !withSidebar && 'px-0 pb-0')}>
        <div
          className={cn(
            'w-full h-full p-2 md:p-4 lg:p-8 dark:bg-zinc-900 bg-zinc-50',
            withSidebar && 'rounded-sm',
          )}
        >
          {children}
        </div>
      </div>
    </main>
  )
}
