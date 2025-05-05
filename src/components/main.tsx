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
        'min-h-screen flex flex-col w-full bg-background',
        className,
      )}
    >
      {user && <Navbar user={user} withSidebar={withSidebar} />}

      <div
        className={cn(
          'w-full h-full p-2 md:p-4 lg:p-8 dark:bg-zinc-900 bg-zinc-50',
        )}
      >
        {children}
      </div>
    </main>
  )
}
