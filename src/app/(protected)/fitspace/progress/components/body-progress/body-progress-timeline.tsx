'use client'

import { format } from 'date-fns'
import { Calendar, MoreHorizontal, Share2 } from 'lucide-react'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import { PrivateImageGallery } from '@/components/private-images/image-gallery'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'

import { useBodyProgressLogs } from './use-body-progress-logs'

interface BodyProgressTimelineProps {
  onEditLog?: (log: {
    id: string
    loggedAt: string
    notes?: string | null
    image1Url?: string | null
    image2Url?: string | null
    image3Url?: string | null
    shareWithTrainer: boolean
  }) => void
}

export function BodyProgressTimeline({ onEditLog }: BodyProgressTimelineProps) {
  const { progressLogs, isLoading, deleteProgressLog, updateSharingStatus } =
    useBodyProgressLogs()
  const { openModal } = useConfirmationModalContext()

  const handleDelete = (logId: string) => {
    openModal({
      title: 'Delete Progress Log',
      description:
        'Are you sure you want to delete this progress log? This action cannot be undone.',
      confirmText: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        await deleteProgressLog(logId)
      },
    })
  }

  const handleEdit = (log: (typeof progressLogs)[0]) => {
    if (onEditLog) {
      onEditLog({
        id: log.id,
        loggedAt: log.loggedAt,
        notes: log.notes,
        image1Url: log.image1?.url || null,
        image2Url: log.image2?.url || null,
        image3Url: log.image3?.url || null,
        shareWithTrainer: log.shareWithTrainer,
      })
    }
  }

  const handleToggleSharing = async (logId: string, currentStatus: boolean) => {
    await updateSharingStatus(logId, !currentStatus)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[
          {
            id: '1',
            loggedAt: '2025-01-01',
            shareWithTrainer: true,
            image1Url: 'https://via.placeholder.com/150',
            image2Url: 'https://via.placeholder.com/150',
            image3Url: 'https://via.placeholder.com/150',
          },
          {
            id: '2',
            loggedAt: '2025-01-02',
            shareWithTrainer: false,
            image1Url: 'https://via.placeholder.com/150',
            image2Url: 'https://via.placeholder.com/150',
            image3Url: 'https://via.placeholder.com/150',
          },
          {
            id: '3',
            loggedAt: '2025-01-03',
            shareWithTrainer: true,
            image1Url: 'https://via.placeholder.com/150',
            image2Url: 'https://via.placeholder.com/150',
            image3Url: 'https://via.placeholder.com/150',
          },
        ].map((log) => (
          <div className="space-y-2" key={log.id}>
            <div className="flex gap-2 items-center">
              <div className="text-sm self-end masked-placeholder-text">
                {format(new Date(log.loggedAt), 'd. MMM yyyy')}
              </div>
              <div className="flex items-end gap-2 ml-auto">
                {log.shareWithTrainer && (
                  <Badge variant="secondary" size="sm" isLoading>
                    <Share2 /> Shared
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="xs"
                      iconOnly={<MoreHorizontal />}
                      disabled
                    />
                  </DropdownMenuTrigger>
                </DropdownMenu>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="aspect-[3/4] bg-muted rounded-sm overflow-hidden">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="aspect-[3/4] bg-muted rounded-sm overflow-hidden">
                <Skeleton className="w-full h-full" />
              </div>
              <div className="aspect-[3/4] bg-muted rounded-sm overflow-hidden">
                <Skeleton className="w-full h-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (progressLogs.length === 0) {
    return (
      <Card borderless>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="size-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Progress Logs Yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Start tracking your body transformation by adding your first
            progress log with photos.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {progressLogs.map((log) => (
        <div className="space-y-2" key={log.id}>
          <div className="flex gap-2 items-center">
            <div className="text-sm self-end">
              {format(new Date(log.loggedAt), 'd. MMM yyyy')}
            </div>
            <div className="flex items-end gap-2 ml-auto">
              {log.shareWithTrainer && (
                <Badge variant="secondary" size="sm">
                  <Share2 /> Shared
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="xs"
                    iconOnly={<MoreHorizontal />}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleEdit(log)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleToggleSharing(log.id, log.shareWithTrainer)
                    }
                  >
                    {log.shareWithTrainer
                      ? 'Unshare with trainer'
                      : 'Share with trainer'}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleDelete(log.id)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <PrivateImageGallery
            images={[
              log.image1 || null,
              log.image2 || null,
              log.image3 || null,
            ]}
          />
        </div>
      ))}
    </div>
  )
}
