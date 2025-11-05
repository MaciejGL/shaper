import { useEffect, useState } from 'react'

/**
 * Hook to detect if user is on a mobile device (based on user agent)
 *
 * This is different from useIsMobile which only checks screen size.
 * Use this when you need to know if the user is on an actual mobile device
 * (iOS/Android) vs desktop, regardless of screen size.
 *
 * @returns boolean - true if on mobile device (iOS/Android), false otherwise
 *
 * @example
 * ```tsx
 * const isMobileDevice = useIsMobileDevice()
 *
 * // Use deep links only on mobile devices
 * <MobileNav useDeepLinks={isMobileDevice} />
 * ```
 */
export function useIsMobileDevice(): boolean {
  const [isMobileDevice, setIsMobileDevice] = useState(false)

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase()

    // Check if user agent matches mobile devices
    const isMobile =
      /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)

    setIsMobileDevice(isMobile)
  }, [])

  return isMobileDevice
}
