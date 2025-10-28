'use client'

import { Bell } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

import { usePromotionalNotifications } from '@/hooks/use-promotional-notifications'

import { usePromotionalToastConfigs } from './configs'
import { PromotionalToast } from './promotional-toast'

export function PromotionalToastManager() {
  const { currentNotification, dismissAndShowNext } =
    usePromotionalNotifications()
  const configs = usePromotionalToastConfigs()
  const toastIdRef = useRef<string | number | undefined>(undefined)

  useEffect(() => {
    // Dismiss any existing toast if there's no notification to show
    if (!currentNotification) {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
        toastIdRef.current = undefined
      }
      return
    }

    // Get config for this notification type
    const config = configs[currentNotification.type]
    if (!config) {
      console.warn(
        `No config found for notification type: ${currentNotification.type}`,
      )
      return
    }

    // Extract notification data
    const data = config.extractData(currentNotification)

    // Dismiss previous toast before showing new one
    if (toastIdRef.current) {
      toast.dismiss(toastIdRef.current)
    }

    // Show the promotional toast
    const toastId = toast.custom(
      () => (
        <PromotionalToast
          config={config}
          data={data}
          onDismiss={() => {
            dismissAndShowNext(currentNotification.id)
            toast.dismiss(toastId)
          }}
        />
      ),
      {
        duration: Infinity,
        position: 'top-center',
        className: 'max-w-lg w-full',
      },
    )

    toastIdRef.current = toastId

    // Cleanup function
    return () => {
      if (toastIdRef.current) {
        toast.dismiss(toastIdRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNotification])

  return null
}
