import { RefObject, useEffect } from 'react'

interface UseScrollToItemOptions {
  /** Reference to the scrollable container */
  containerRef: RefObject<HTMLElement | null>
  /** Index of the item to scroll to */
  currentIndex: number | undefined
  /** Total number of items */
  itemCount: number
  /** Width of each item including gap/margin */
  itemWidth?: number
  /** CSS selector for individual items (for scrollIntoView) */
  itemSelector?: string
  /** Additional dependencies to trigger re-scroll */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies?: any[]
  /** Delay before scrolling (ms) */
  scrollDelay?: number
  /** Whether to enable the scroll behavior */
  enabled?: boolean
}

/**
 * Custom hook to handle scrolling to a specific item in a horizontal scrollable container
 *
 * @param options Configuration options for the scroll behavior
 *
 * @example
 * ```tsx
 * const containerRef = useRef<HTMLDivElement>(null)
 *
 * useScrollToItem({
 *   containerRef,
 *   currentIndex: activeIndex,
 *   itemCount: items.length,
 *   itemWidth: 88, // 80px + 8px gap
 *   itemSelector: '.item-card',
 *   dependencies: [planId, weekId]
 * })
 * ```
 */
export function useScrollToItem({
  containerRef,
  currentIndex,
  itemCount,
  itemWidth = 88,
  itemSelector = '.scroll-item',
  dependencies = [],
  scrollDelay = 100,
  enabled = true,
}: UseScrollToItemOptions) {
  useEffect(() => {
    if (
      !enabled ||
      !containerRef.current ||
      currentIndex === undefined ||
      currentIndex === -1
    ) {
      return
    }

    const timer = setTimeout(() => {
      const container = containerRef.current
      if (!container) return

      // Always use manual calculation to avoid page scroll
      const items = container.querySelectorAll(itemSelector)
      const currentItem = items[currentIndex] as HTMLElement

      if (currentItem && container.contains(currentItem)) {
        // Get actual item position relative to container
        const containerScrollLeft = container.scrollLeft
        // const containerClientLeft = container.clientLeft
        const itemOffsetLeft = currentItem.offsetLeft
        const itemWidth = currentItem.offsetWidth
        const containerWidth = container.clientWidth

        // Calculate if item is visible
        const itemStart = itemOffsetLeft - containerScrollLeft
        const itemEnd = itemStart + itemWidth
        const isItemVisible = itemStart >= 0 && itemEnd <= containerWidth

        if (!isItemVisible) {
          // Calculate scroll position to center the item
          const scrollPosition =
            itemOffsetLeft - containerWidth / 2 + itemWidth / 2

          // Ensure scroll position is within bounds
          const maxScroll = Math.max(0, container.scrollWidth - containerWidth)
          const finalScrollPosition = Math.max(
            0,
            Math.min(scrollPosition, maxScroll),
          )

          // Only scroll the container, never the page
          container.scrollTo({
            left: finalScrollPosition,
            behavior: 'smooth',
          })
        }
      } else {
        // Fallback to calculation-based approach
        const containerWidth = container.clientWidth
        const totalWidth = itemCount * itemWidth

        // Calculate scroll position to center the current item
        const scrollPosition =
          currentIndex * itemWidth - containerWidth / 2 + itemWidth / 2

        // Ensure scroll position is within bounds
        const maxScroll = Math.max(0, totalWidth - containerWidth)
        const finalScrollPosition = Math.max(
          0,
          Math.min(scrollPosition, maxScroll),
        )

        container.scrollTo({
          left: finalScrollPosition,
          behavior: 'smooth',
        })
      }
    }, scrollDelay)

    return () => clearTimeout(timer)
  }, [
    containerRef,
    currentIndex,
    itemCount,
    itemWidth,
    itemSelector,
    scrollDelay,
    enabled,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...dependencies,
  ])
}
