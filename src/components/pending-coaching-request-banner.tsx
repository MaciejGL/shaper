'use client'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface PendingCoachingRequestBannerProps {
  trainerName: string
}

export function PendingCoachingRequestBanner({
  trainerName,
}: PendingCoachingRequestBannerProps) {
  return (
    <Alert variant="info">
      <AlertTitle>Request Pending</AlertTitle>
      <AlertDescription>
        {trainerName} has been informed about your interest and will reach out
        to you soon.
      </AlertDescription>
    </Alert>
  )
}
