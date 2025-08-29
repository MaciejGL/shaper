/**
 * Scroll to element utilities
 */

export interface ScrollToOptions {
  /** Scroll behavior - default: 'smooth' */
  behavior?: ScrollBehavior
  /** Block alignment - default: 'start' */
  block?: ScrollLogicalPosition
  /** Inline alignment - default: 'nearest' */
  inline?: ScrollLogicalPosition
  /** Delay in ms before scrolling - default: 100 */
  delay?: number
  /** Offset from target in pixels - default: 0 */
  offset?: number
}

/**
 * Scroll to an element by ID
 */
export function scrollToElement(
  elementId: string,
  options: ScrollToOptions = {},
): Promise<boolean> {
  const {
    behavior = 'smooth',
    block = 'start',
    inline = 'nearest',
    delay = 100,
    offset = 0,
  } = options

  return new Promise((resolve) => {
    setTimeout(() => {
      const element = document.getElementById(elementId)
      if (element) {
        if (offset !== 0) {
          // Handle offset scrolling
          const elementPosition = element.getBoundingClientRect().top
          const offsetPosition = elementPosition + window.pageYOffset - offset

          window.scrollTo({
            top: offsetPosition,
            behavior,
          })
        } else {
          // Standard scrollIntoView
          element.scrollIntoView({
            behavior,
            block,
            inline,
          })
        }
        resolve(true)
      } else {
        console.warn(`Element with id "${elementId}" not found`)
        resolve(false)
      }
    }, delay)
  })
}

/**
 * Hook for handling scroll-to functionality with query parameters
 */
export function useScrollToFromParams(
  paramName: string = 'scrollTo',
  scrollTargets: Record<string, string>,
  options: ScrollToOptions = {},
) {
  if (typeof window === 'undefined') return

  const searchParams = new URLSearchParams(window.location.search)
  const scrollTarget = searchParams.get(paramName)

  if (scrollTarget && scrollTargets[scrollTarget]) {
    const elementId = scrollTargets[scrollTarget]
    scrollToElement(elementId, options)
  }
}

/**
 * React hook version for use in components
 */
export function useScrollTo() {
  return {
    scrollToElement,
    useScrollToFromParams,
  }
}

/**
 * Common scroll targets for the app
 */
export const SCROLL_TARGETS = {
  'trainer-notes': 'trainer-notes-section',
  'service-deliveries': 'service-deliveries-section',
  'workout-plans': 'workout-plans-section',
  'meal-plans': 'meal-plans-section',
} as const

/**
 * Scroll to common sections with predefined targets
 */
export function scrollToSection(
  section: keyof typeof SCROLL_TARGETS,
  options: ScrollToOptions = {},
) {
  const elementId = SCROLL_TARGETS[section]
  return scrollToElement(elementId, options)
}

/**
 * Create a URL with scroll target parameter
 */
export function createScrollUrl(
  basePath: string,
  scrollTarget: keyof typeof SCROLL_TARGETS,
  params: Record<string, string> = {},
): string {
  const searchParams = new URLSearchParams(params)
  searchParams.set('scrollTo', scrollTarget)
  return `${basePath}?${searchParams.toString()}`
}
