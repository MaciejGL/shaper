import { useEffect, useRef, useState } from 'react'

interface UseScrollVisibilityOptions {
  /** Threshold in pixels to trigger hide/show */
  threshold?: number
  /** Whether the element should be visible initially */
  initialVisible?: boolean
  /** Custom scroll container element, defaults to window scrolling */
  scrollContainer?: HTMLElement | null
  /** Distance from top in pixels to force visibility, defaults to 200px */
  topProximityThreshold?: number
}

/**
 * Custom hook for hiding/showing elements based on scroll direction and threshold
 *
 * Hides elements when scrolling down 100px, shows them when scrolling up 100px
 * Forces visibility when within 200px of the top of the page
 * Uses window scrolling by default, or custom container if provided
 * Useful for headers, floating action buttons, navigation bars, etc.
 *
 * @param options Configuration options for scroll behavior
 * @returns Object with isVisible state and manual control function
 *
 * @example
 * Basic usage - uses window scrolling:
 * const { isVisible } = useScrollVisibility()
 *
 * @example
 * Custom threshold and initial state:
 * const { isVisible } = useScrollVisibility({
 *   threshold: 50, // Hide after 50px scroll
 *   initialVisible: false, // Start hidden
 *   topProximityThreshold: 150, // Force visible within 150px of top
 * })
 *
 * @example
 * Custom scroll container:
 * const { isVisible } = useScrollVisibility({
 *   scrollContainer: containerRef.current,
 *   threshold: 80,
 *   topProximityThreshold: 100,
 * })
 */
export function useScrollVisibility(options: UseScrollVisibilityOptions = {}) {
  const {
    threshold = 100,
    initialVisible = true,
    scrollContainer = null,
    topProximityThreshold = 200,
  } = options

  const [isVisible, setIsVisible] = useState(initialVisible)
  const lastScrollY = useRef(0)
  const scrollDirection = useRef<'up' | 'down'>('up')
  const scrollAccumulator = useRef(0)

  useEffect(() => {
    // Determine the target scroll container
    // If no custom container is provided, use window for document-level scrolling
    const useWindowScroll = !scrollContainer
    const targetElement = scrollContainer

    const handleScroll = () => {
      // Get current scroll position based on scroll type
      const currentScrollY = useWindowScroll
        ? window.scrollY || document.documentElement.scrollTop
        : targetElement!.scrollTop

      // Force visibility when near the top of the page
      if (currentScrollY <= topProximityThreshold) {
        setIsVisible((prev) => {
          if (!prev) {
            return true
          }
          return prev
        })
        lastScrollY.current = currentScrollY
        return
      }

      // Determine scroll direction
      const direction = currentScrollY > lastScrollY.current ? 'down' : 'up'

      // Reset accumulator if direction changed
      if (direction !== scrollDirection.current) {
        scrollAccumulator.current = 0
        scrollDirection.current = direction
      }

      // Accumulate scroll distance in current direction
      const scrollDelta = Math.abs(currentScrollY - lastScrollY.current)
      scrollAccumulator.current += scrollDelta

      // Check if threshold is reached
      if (scrollAccumulator.current >= threshold) {
        setIsVisible((prev) => {
          if (direction === 'down' && prev) {
            return false
          } else if (direction === 'up' && !prev) {
            return true
          }
          return prev
        })
        scrollAccumulator.current = 0 // Reset after triggering
      }

      lastScrollY.current = currentScrollY
    }

    // Add scroll listener based on scroll type
    if (useWindowScroll) {
      window.addEventListener('scroll', handleScroll, { passive: true })
    } else if (targetElement) {
      targetElement.addEventListener('scroll', handleScroll, { passive: true })
    } else {
      console.warn('useScrollVisibility: No valid scroll container provided.')
      return
    }

    // Cleanup
    return () => {
      if (useWindowScroll) {
        window.removeEventListener('scroll', handleScroll)
      } else if (targetElement) {
        targetElement.removeEventListener('scroll', handleScroll)
      }
    }
  }, [threshold, scrollContainer, topProximityThreshold])

  return {
    isVisible,
    setIsVisible, // Allow manual control if needed
  }
}
