'use client'

import { Calendar, Dumbbell, Home, SearchIcon, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import { cn } from '@/lib/utils'

export function MobileNav({ currentWorkoutId }: { currentWorkoutId?: string }) {
  const pathname = usePathname()
  const navItems = useMemo(
    () => [
      {
        href: '/fitspace/dashboard',
        icon: Home,
        label: 'Home',
        prefetch: true,
      },
      {
        href: '/fitspace/my-plans',
        icon: Calendar,
        label: 'Plans',
        prefetch: true,
      },
      {
        href: `/fitspace/workout/${currentWorkoutId || 'quick-workout'}`,
        icon: Dumbbell,
        label: 'Workout',
        prefetch: true,
      },
      {
        href: '/fitspace/progress',
        icon: TrendingUp,
        label: 'Progress',
        disabled: true,
        prefetch: true,
      },
      {
        href: '/fitspace/marketplace?tab=trainers',
        icon: SearchIcon,
        label: 'Explore',
        disabled: true,
        prefetch: true,
      },
    ],
    [currentWorkoutId],
  )

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar shadow-neuro-light dark:shadow-neuro-dark">
      <div className="flex items-center justify-around py-2 px-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-2 rounded-xl transition-colors min-w-[60px]',
                isActive
                  ? 'text-primary bg-zinc-200 dark:bg-zinc-800'
                  : 'text-muted-foreground hover:text-foreground ',
              )}
              prefetch={item.prefetch}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
