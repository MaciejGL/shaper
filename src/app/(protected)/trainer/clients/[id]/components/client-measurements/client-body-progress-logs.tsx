'use client'

import { format } from 'date-fns'
import { Camera } from 'lucide-react'

import { Loader } from '@/components/loader'
import { ProgressImageGallery } from '@/components/private-images/image-gallery'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useClientBodyProgressLogsQuery } from '@/generated/graphql-client'

interface ClientBodyProgressLogsProps {
  clientId: string
  clientName: string
}

export function ClientBodyProgressLogs({
  clientId,
  clientName,
}: ClientBodyProgressLogsProps) {
  const { data, isLoading } = useClientBodyProgressLogsQuery({
    clientId,
  })

  const progressLogs = data?.clientBodyProgressLogs || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Photos</CardTitle>
          <CardDescription>Body transformation snapshots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (progressLogs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Progress Photos</CardTitle>
          <CardDescription>Body transformation snapshots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Photos Yet</h3>
            <p className="text-muted-foreground text-sm">
              {clientName} hasn't shared any progress photos with you yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progress Photos</CardTitle>
        <CardDescription>
          {progressLogs.length}{' '}
          {progressLogs.length === 1 ? 'snapshot' : 'snapshots'} shared
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {progressLogs.map((log) => (
            <div key={log.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-medium">
                  {format(new Date(log.loggedAt), 'MMM d, yyyy')}
                </div>
              </div>

              <ProgressImageGallery
                images={[
                  log.image1 || null,
                  log.image2 || null,
                  log.image3 || null,
                ]}
                imageLabels={['Front', 'Side', 'Back']}
              />

              {log.notes && (
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {log.notes}
                  </p>
                </div>
              )}

              {progressLogs.indexOf(log) < progressLogs.length - 1 && (
                <div className="border-t pt-6" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
