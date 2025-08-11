import { useEffect, useRef, useState } from 'react'

interface UseScrollVisibilityOptions {
  /** Threshold in pixels to trigger hide/show */
  threshold?: number
  /** Whether the element should be visible initially */
  initialVisible?: boolean
  /** Custom scroll container element, defaults to element with id "main-content" */
  scrollContainer?: HTMLElement | null
  /** Distance from top in pixels to force visibility, defaults to 200px */
  topProximityThreshold?: number
}

/**
 * Custom hook for hiding/showing elements based on scroll direction and threshold
 *
 * Hides elements when scrolling down 100px, shows them when scrolling up 100px
 * Forces visibility when within 200px of the top of the page
 * Uses scroll container with id "main-content" by default
 * Useful for headers, floating action buttons, navigation bars, etc.
 *
 * @param options Configuration options for scroll behavior
 * @returns Object with isVisible state and manual control function
 *
 * @example
 * Basic usage - uses #main-content container:
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
    const targetElement =
      scrollContainer || document.getElementById('main-content')

    // Exit early if no container is found
    if (!targetElement) {
      console.warn(
        'useScrollVisibility: No scroll container found. Please ensure element with id="main-content" exists or provide a custom scrollContainer.',
      )
      return
    }

    const handleScroll = () => {
      const currentScrollY = targetElement.scrollTop

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

    // Add scroll listener to the container
    targetElement.addEventListener('scroll', handleScroll, { passive: true })

    // Cleanup
    return () => {
      targetElement.removeEventListener('scroll', handleScroll)
    }
  }, [threshold, scrollContainer, topProximityThreshold])

  return {
    isVisible,
    setIsVisible, // Allow manual control if needed
  }
}
