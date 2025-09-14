'use client'

import { format } from 'date-fns'
import { Camera, Share2 } from 'lucide-react'

import { Loader } from '@/components/loader'
import { PrivateImageGallery } from '@/components/private-images/image-gallery'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
      <Card borderless>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Body Progress Snapshots
          </CardTitle>
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
      <Card borderless>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Body Progress Snapshots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold mb-2">No Shared Snapshots Yet</h3>
            <p className="text-muted-foreground text-sm">
              {clientName} hasn't shared any body progress snapshots with you
              yet.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card borderless>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Body Progress Snapshots
          <Badge variant="secondary" className="ml-auto">
            {progressLogs.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {progressLogs.map((log) => (
            <div key={log.id} className="space-y-2">
              {/* Header with date and shared badge */}
              <div className="flex gap-2 items-center">
                <div className="text-sm self-end">
                  {format(new Date(log.loggedAt), 'd. MMM yyyy')}
                </div>
                <div className="flex items-end gap-2 ml-auto">
                  <Badge variant="secondary" size="sm">
                    <Share2 className="h-3 w-3 mr-1" />
                    Shared by client
                  </Badge>
                </div>
              </div>

              {/* Image gallery */}
              <PrivateImageGallery
                images={[
                  log.image1 || null,
                  log.image2 || null,
                  log.image3 || null,
                ]}
                imageLabels={['Front', 'Side', 'Back']}
              />

              {/* Notes if present */}
              {log.notes && (
                <div className="mt-3 p-3 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {log.notes}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
