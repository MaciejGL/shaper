'use client'

import {
  Dumbbell,
  LayoutList,
  SaladIcon,
  SearchIcon,
  TrendingUp,
  UserCheck,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useMemo } from 'react'

import { useMobileApp } from '@/components/mobile-app-bridge'
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible'
import { navigateToPath as navigateToDeepLink } from '@/lib/deep-links'
import { cn } from '@/lib/utils'

export function DeepLinkMobileNav() {
  const pathname = usePathname()
  const { isNativeApp, navigateToPath } = useMobileApp()
  const isKeyboardVisible = useKeyboardVisible()

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
      {
        id: 'meals',
        href: '/fitspace/meal-plan',
        icon: SaladIcon,
        label: 'Meals',
        prefetch: true,
      },
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

  const handleNavigation = (href: string) => {
    if (isNativeApp) {
      // Use native navigation
      navigateToPath(href)
    } else {
      // ✅ Use bulletproof deep link utility
      navigateToDeepLink(href)
    }
  }

  // Hide navigation when keyboard is visible
  if (isKeyboardVisible) {
    return null
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sidebar safe-area-bottom safe-area-x">
        <div className="grid grid-cols-6 items-center py-2 px-2 max-w-md mx-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.includes(item.href)

            return (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.href)}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg transition-colors',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                <Icon className="size-4 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>
      <div className="h-[4.5rem] mt-4" />
    </>
  )
}
