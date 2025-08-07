'use client'

import { useEffect, useState } from 'react'

/**
 * Custom hook to detect if the user is on a mobile device
 * Considers device as mobile if:
 * - User agent indicates mobile device, OR
 * - Touch device with small screen
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const isMobileDevice =
        /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
          userAgent,
        )
      const isTouchDevice =
        'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 768

      // Consider it mobile if it's a mobile device OR (touch device AND small screen)
      setIsMobile(isMobileDevice || (isTouchDevice && isSmallScreen))
    }

    checkDevice()
    window.addEventListener('resize', checkDevice)
    return () => window.removeEventListener('resize', checkDevice)
  }, [])

  return isMobile
}
