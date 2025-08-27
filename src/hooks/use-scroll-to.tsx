import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

import {
  SCROLL_TARGETS,
  type ScrollToOptions,
  scrollToElement,
} from '@/lib/utils/scroll-to'

/**
 * Hook for handling scroll-to functionality with query parameters
 */
export function useScrollToFromParams(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies: any[] = [],
  options: ScrollToOptions = {},
  paramName: string = 'scrollTo',
) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const scrollTarget = searchParams.get(paramName)

    if (scrollTarget && scrollTarget in SCROLL_TARGETS) {
      const elementId =
        SCROLL_TARGETS[scrollTarget as keyof typeof SCROLL_TARGETS]
      scrollToElement(elementId, options)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, paramName, options, ...dependencies])
}

/**
 * Hook that provides scroll utilities
 */
export function useScrollTo() {
  return {
    scrollToElement,
    scrollToSection: (
      section: keyof typeof SCROLL_TARGETS,
      options: ScrollToOptions = {},
    ) => {
      const elementId = SCROLL_TARGETS[section]
      return scrollToElement(elementId, options)
    },
  }
}
