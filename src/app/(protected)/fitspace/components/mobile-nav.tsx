'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FiMoreHorizontal } from 'react-icons/fi'

import { useFitspaceGetWorkoutNavigationQuery } from '@/generated/graphql-client'
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible'
import { cn } from '@/lib/utils'

import { getDefaultSelection } from '../workout/training/components/navigation-utils'

import { type NavItem, getNavItems } from './mobile-nav-data'

interface MobileNavProps {
  /**
   * Use deep links (hypro://) instead of Next.js Link
   * Useful when page is opened from external sources (e.g., Stripe)
   */
  useDeepLinks?: boolean
  /** Server-side computed nutrition access to avoid flicker */
  hasNutritionAccess?: boolean
}

export function MobileNav({
  useDeepLinks = false,
  hasNutritionAccess = false,
}: MobileNavProps) {
  const pathname = usePathname()
  const isKeyboardVisible = useKeyboardVisible()
  const [clickedItem, setClickedItem] = useState<string | null>(null)
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(
    null,
  )
  const [isHydrated, setIsHydrated] = useState(false)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const moreButtonRef = useRef<HTMLButtonElement>(null)

  const { data: workoutNavigationQuery } = useFitspaceGetWorkoutNavigationQuery(
    { trainingId: '' },
    {
      queryKey: ['navigation'],
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000,
    },
  )

  const plan = isHydrated
    ? workoutNavigationQuery?.getWorkoutNavigation?.plan
    : undefined
  const trainingId = plan?.id
  const { weekId, dayId } = getDefaultSelection(plan)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Close more menu on route change or keyboard visibility
  useEffect(() => {
    setClickedItem(null)
    setPendingNavigation(null)
    setIsMoreOpen(false)
  }, [pathname])

  useEffect(() => {
    if (isKeyboardVisible) {
      setIsMoreOpen(false)
    }
  }, [isKeyboardVisible])

  const { primaryItems, moreItems } = useMemo(
    () =>
      getNavItems({
        trainingId,
        weekId,
        dayId,
        hasNutritionAccess,
      }),
    [trainingId, weekId, dayId, hasNutritionAccess],
  )

  const handleMoreToggle = useCallback(() => {
    setIsMoreOpen((prev) => !prev)
  }, [])

  const handleMoreItemClick = useCallback(() => {
    setIsMoreOpen(false)
  }, [])

  // Close bubble menu when clicking outside
  useEffect(() => {
    if (!isMoreOpen) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (moreButtonRef.current?.contains(target)) return
      setIsMoreOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMoreOpen])

  if (isKeyboardVisible) {
    return null
  }

  const colCount = primaryItems.length + 1 // +1 for More button

  return (
    <>
      {/* Backdrop overlay with blur */}
      <AnimatePresence>
        {isMoreOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-linear-to-t from-black/60 via-black/40 to-transparent backdrop-blur-sm pointer-events-none"
            />
            {/* Clickable area to close */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-41"
              onClick={() => setIsMoreOpen(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Bubble stack with staggered animations */}
      <AnimatePresence>
        {isMoreOpen && (
          <div className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-50 flex flex-col-reverse items-end gap-2">
            {moreItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  scale: 1,
                  transition: {
                    delay: index * 0.05,
                    duration: 0.2,
                    ease: 'easeOut',
                  },
                }}
                exit={{
                  opacity: 0,
                  y: 10,
                  scale: 0.9,
                  transition: {
                    delay: (moreItems.length - 1 - index) * 0.03,
                    duration: 0.15,
                  },
                }}
              >
                <NavBubble
                  item={item}
                  useDeepLinks={useDeepLinks}
                  pathname={pathname}
                  pendingNavigation={pendingNavigation}
                  clickedItem={clickedItem}
                  setClickedItem={setClickedItem}
                  setPendingNavigation={setPendingNavigation}
                  onItemClick={handleMoreItemClick}
                />
              </motion.div>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Modern floating navbar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 ">
        <nav className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg border border-white/20 dark:border-white/10 mx-auto max-w-md">
          <div
            className="grid items-stretch px-2 safe-area-bottom-content"
            style={{
              gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
            }}
          >
            {primaryItems.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                useDeepLinks={useDeepLinks}
                pathname={pathname}
                pendingNavigation={pendingNavigation}
                clickedItem={clickedItem}
                setClickedItem={setClickedItem}
                setPendingNavigation={setPendingNavigation}
              />
            ))}

            {/* More button - uses separate indicator (no shared layoutId) */}
            <button
              ref={moreButtonRef}
              type="button"
              onClick={handleMoreToggle}
              data-onboarding-id="nav-more"
              className={cn(
                'relative flex flex-col items-center justify-center min-h-12 rounded-[20px] transition-all active:scale-95',
                isMoreOpen ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <AnimatePresence>
                {isMoreOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.15 }}
                    className="absolute inset-1 bg-primary/8 rounded-[20px]"
                  />
                )}
              </AnimatePresence>
              <FiMoreHorizontal className="size-6 mb-0.5 relative z-10" />
              <span className="text-[10px] font-medium relative z-10">
                More
              </span>
            </button>
          </div>
        </nav>
      </div>
    </>
  )
}

interface NavLinkProps {
  item: NavItem
  useDeepLinks: boolean
  pathname: string
  pendingNavigation: string | null
  clickedItem: string | null
  setClickedItem: (v: string | null) => void
  setPendingNavigation: (v: string | null) => void
}

function NavLink({
  item,
  useDeepLinks,
  pathname,
  pendingNavigation,
  clickedItem,
  setClickedItem,
  setPendingNavigation,
}: NavLinkProps) {
  const Icon = item.icon
  const itemPath = item.href.split('?')[0]
  const isActive = pathname.startsWith(itemPath) && !pendingNavigation
  const isClicked =
    (clickedItem === item.label || pendingNavigation === item.href) && !isActive
  const isHighlighted = isActive || isClicked

  const shouldUseDeepLink = useDeepLinks
  const navigationHref = shouldUseDeepLink
    ? `hypro://${item.href.replace(/^\//, '')}`
    : item.href

  const handleClick = () => {
    setClickedItem(item.label)
    setPendingNavigation(item.href)
    window.scrollTo(0, 0)
    if (shouldUseDeepLink) {
      window.location.href = navigationHref
    }
  }

  const NavComponent = shouldUseDeepLink ? 'a' : Link
  const navProps = shouldUseDeepLink
    ? { href: navigationHref }
    : { href: item.href, prefetch: item.prefetch, scroll: true }

  return (
    <NavComponent
      {...navProps}
      onClick={handleClick}
      data-onboarding-id={item.onboardingId}
      className={cn(
        'relative flex flex-col items-center justify-center min-h-12 py-3 rounded-2xl transition-all active:scale-95',
        isHighlighted ? 'text-primary' : 'text-muted-foreground',
      )}
    >
      {isHighlighted && (
        <motion.div
          layoutId="nav-active-pill"
          className="absolute inset-1 bg-primary/8 rounded-[20px]"
          transition={{ type: 'spring', bounce: 0.15, duration: 0.5 }}
        />
      )}
      <Icon className="size-5 mb-0.5 relative z-10" />
      <span className="text-[10px] font-medium relative z-10">
        {item.label}
      </span>
    </NavComponent>
  )
}

interface NavBubbleProps extends NavLinkProps {
  onItemClick: () => void
}

function NavBubble({
  item,
  useDeepLinks,
  pathname,
  pendingNavigation,
  clickedItem,
  setClickedItem,
  setPendingNavigation,
  onItemClick,
}: NavBubbleProps) {
  const Icon = item.icon
  const itemPath = item.href.split('?')[0]
  const isActive = pathname.startsWith(itemPath) && !pendingNavigation
  const isClicked =
    (clickedItem === item.label || pendingNavigation === item.href) && !isActive
  const isHighlighted = isActive || isClicked

  const shouldUseDeepLink = useDeepLinks
  const navigationHref = shouldUseDeepLink
    ? `hypro://${item.href.replace(/^\//, '')}`
    : item.href

  const handleClick = () => {
    setClickedItem(item.label)
    setPendingNavigation(item.href)
    window.scrollTo(0, 0)
    if (shouldUseDeepLink) {
      window.location.href = navigationHref
    }
    onItemClick()
  }

  const NavComponent = shouldUseDeepLink ? 'a' : Link
  const navProps = shouldUseDeepLink
    ? { href: navigationHref }
    : { href: item.href, prefetch: item.prefetch, scroll: true }

  return (
    <NavComponent
      {...navProps}
      onClick={handleClick}
      data-onboarding-id={item.onboardingId}
      className={cn(
        'flex items-center gap-3 px-5 py-3 min-h-12 rounded-full',
        'bg-white/95 dark:bg-zinc-900/90 backdrop-blur-xl',
        'shadow-lg border border-white/20 dark:border-border',
        'active:scale-95 transition-transform',
        isHighlighted ? 'text-primary font-semibold' : 'text-foreground/90',
      )}
    >
      <Icon className="size-5" />
      <span className="text-sm font-medium whitespace-nowrap">
        {item.label}
      </span>
    </NavComponent>
  )
}
