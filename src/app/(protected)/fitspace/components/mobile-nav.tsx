'use client'

import {
  Dumbbell,
  LayoutList,
  SearchIcon,
  TrendingUp,
  UserCheck,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { useMobileApp } from '@/components/mobile-app-bridge'
import { tryOpenAppDeepLink } from '@/lib/deep-links'
import { cn } from '@/lib/utils'

export function MobileNav() {
  const pathname = usePathname()
  const { isNativeApp } = useMobileApp()
  const [clickedItem, setClickedItem] = useState<string | null>(null)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  )

  useEffect(() => {
    setClickedItem(null)
    setPendingNavigation(null)
  }, [pathname])

  const navItems = useMemo(
    () => [
      {
        id: 'workout',
        href: '/fitspace/workout',
        icon: Dumbbell,
        label: 'Workout',
        prefetch: true,
      },
      {
        id: 'plans',
        href: '/fitspace/my-plans',
        icon: LayoutList,
        label: 'Plans',
        prefetch: true,
      },
      // {
      //   id: 'meals',
      //   href: '/fitspace/meal-plan',
      //   icon: SaladIcon,
      //   label: 'Meals',
      //   prefetch: true,
      // },
      {
        id: 'progress',
        href: '/fitspace/progress',
        icon: TrendingUp,
        label: 'Progress',
        prefetch: true,
      },
      {
        id: 'trainer',
        href: '/fitspace/my-trainer',
        icon: UserCheck,
        label: 'Trainer',
        prefetch: true,
      },
      {
        id: 'discover',
        href: '/fitspace/explore',
        icon: SearchIcon,
        label: 'Discover',
        prefetch: true,
      },
    ],
    [],
  )

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar safe-area-bottom safe-area-x">
        <div className="grid grid-cols-5 items-center py-2 px-2 max-w-md mx-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.includes(item.href) && !pendingNavigation
            const isClicked =
              (clickedItem === item.label || pendingNavigation === item.href) &&
              !isActive
            const isHighlighted = isActive || isClicked

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => {
                  setClickedItem(item.label)
                  setPendingNavigation(item.href)
                  // Best-effort: try to open native app in parallel.
                  // Don't prevent default so Next.js preserves SPA navigation.
                  if (!isNativeApp) tryOpenAppDeepLink(item.href)
                }}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg transition-colors',
                  isHighlighted
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
                prefetch={item.prefetch}
                scroll
              >
                <Icon className="size-4 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
      <div className="h-[4.5rem] mt-4" />
    </>
  )
}
