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

      // Try scrollIntoView first (more reliable)
      const items = container.querySelectorAll(itemSelector)
      const currentItem = items[currentIndex] as HTMLElement

      if (currentItem && container.contains(currentItem)) {
        // Use more conservative scroll that won't affect page scroll
        const itemRect = currentItem.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()

        // Only scroll if item is outside the visible area of its container
        const isItemVisible =
          itemRect.left >= containerRect.left &&
          itemRect.right <= containerRect.right

        if (!isItemVisible) {
          currentItem.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          })
        }
      } else {
        // Fallback to manual calculation
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
