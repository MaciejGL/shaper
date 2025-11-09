'use client'

import {
  Dumbbell,
  LayoutList,
  SaladIcon,
  SearchIcon,
  TrendingUp,
  UserCheck,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'

import { useMobileApp } from '@/components/mobile-app-bridge'
import { useFitspaceGetWorkoutNavigationQuery } from '@/generated/graphql-client'
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible'
import { cn } from '@/lib/utils'

import { getDefaultSelection } from '../workout/[trainingId]/components/navigation-utils'

interface MobileNavProps {
  /**
   * Use deep links (hypro://) instead of Next.js Link
   * Useful when page is opened from external sources (e.g., Stripe)
   */
  useDeepLinks?: boolean
}

export function MobileNav({ useDeepLinks = false }: MobileNavProps = {}) {
  const pathname = usePathname()
  const { isNativeApp } = useMobileApp()
  const isKeyboardVisible = useKeyboardVisible()
  const [clickedItem, setClickedItem] = useState<string | null>(null)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  )
  const [isHydrated, setIsHydrated] = useState(false)

  // Subscribe to navigation cache updates (will trigger re-render when cache changes)
  const { data: workoutNavigationQuery } = useFitspaceGetWorkoutNavigationQuery(
    { trainingId: '' },
    {
      queryKey: ['navigation'],
      refetchOnMount: false, // Use cache on mount
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      // enabled: true by default, so it WILL refetch when invalidated
    },
  )

  // Only use query data after hydration to prevent hydration mismatch
  const plan = isHydrated
    ? workoutNavigationQuery?.getWorkoutNavigation?.plan
    : undefined
  const trainingId = plan?.id
  const { weekId, dayId } = getDefaultSelection(plan)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    setClickedItem(null)
    setPendingNavigation(null)
  }, [pathname])

  const navItems = useMemo(() => {
    // Use stable workout URL during hydration to prevent hydration mismatch
    const workoutHref = trainingId
      ? `/fitspace/workout/${trainingId}?weekId=${weekId || ''}&dayId=${dayId || ''}`
      : '/fitspace/workout' // Fallback to plans page when no training data available

    return [
      {
        id: 'workout',
        href: workoutHref,
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
        id: 'nutrition',
        href: '/fitspace/nutrition',
        icon: SaladIcon,
        label: 'Nutrition',
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
    ]
  }, [trainingId, weekId, dayId])

  // Hide navigation when keyboard is visible
  if (isKeyboardVisible) {
    return null
  }

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/50 backdrop-blur-md dark:bg-sidebar/50 safe-area-bottom safe-area-x border-t border-border/50">
        <div className="grid grid-cols-6 items-center py-2 px-2 max-w-md mx-auto gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname.includes(item.href) && !pendingNavigation
            const isClicked =
              (clickedItem === item.label || pendingNavigation === item.href) &&
              !isActive
            const isHighlighted = isActive || isClicked

            // Use deep link if requested (account-management is always in Safari)
            // Don't check isNativeApp because account-management opens in external browser
            const shouldUseDeepLink = useDeepLinks
            const navigationHref = shouldUseDeepLink
              ? `hypro://${item.href.replace(/^\//, '')}`
              : item.href

            const handleClick = () => {
              setClickedItem(item.label)
              setPendingNavigation(item.href)
              // Scroll the main content container to top
              document.getElementById('main-content')?.scrollTo(0, 0)

              // If using deep links, trigger navigation via href change
              if (shouldUseDeepLink) {
                window.location.href = navigationHref
              }
            }

            // Use <a> for deep links, <Link> for normal navigation
            const NavComponent = shouldUseDeepLink ? 'a' : Link
            const navProps = shouldUseDeepLink
              ? { href: navigationHref }
              : { href: item.href, prefetch: item.prefetch, scroll: true }

            return (
              <NavComponent
                key={item.id}
                {...navProps}
                onClick={handleClick}
                className={cn(
                  'flex flex-col items-center justify-center p-2 rounded-lg transition-colors hover:text-sidebar-primary',
                  isHighlighted
                    ? cn(' text-sidebar-foreground font-semibold')
                    : cn(' text-foreground/50'),
                )}
              >
                <Icon className="size-5 mb-1" />
                <span className="text-[10px]">{item.label}</span>
              </NavComponent>
            )
          })}
        </div>
      </nav>
      <div className="h-[4.5rem] mt-4" />
    </>
  )
}
