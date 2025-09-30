'use client'

import { Camera, Images, Pen } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { formatConditionalDate } from '@/lib/date-utils'

import { CreateProgressLogDialog } from '../body-progress/create-progress-log-dialog'

import { CompareSnapshotsDrawer } from './compare-snapshots-drawer'
import { SnapshotTimelineDrawer } from './snapshot-timeline-drawer'
import { useSnapshots } from './use-snapshots'

export function SnapshotsSection() {
  const { user } = useUser()
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCompareDrawerOpen, setIsCompareDrawerOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [preselectedSnapshot, setPreselectedSnapshot] = useState<{
    id: string
    date: string
    weight?: number
    image1Url?: string | null
    image2Url?: string | null
    image3Url?: string | null
  } | null>(null)
  const [editLog, setEditLog] = useState<{
    id: string
    loggedAt: string
    notes?: string | null
    image1Url?: string | null
    image2Url?: string | null
    image3Url?: string | null
    shareWithTrainer: boolean
  } | null>(null)

  const { latestSnapshot, previousSnapshot, isLoading } = useSnapshots()

  const handleCloseDialog = (open: boolean) => {
    setIsCreateDialogOpen(open)
    if (!open) {
      setEditLog(null)
    }
  }

  const handleSnapshotClick = (snapshot: {
    id: string
    date: string
    weight?: number
    image1Url?: string | null
    image2Url?: string | null
    image3Url?: string | null
  }) => {
    setPreselectedSnapshot(snapshot)
    setIsCompareDrawerOpen(true)
  }

  const handleCloseCompareDrawer = (open: boolean) => {
    setIsCompareDrawerOpen(open)
    if (!open) {
      setPreselectedSnapshot(null)
    }
  }

  if (!user) {
    return null
  }

  return (
    <>
      <Card borderless>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-purple-500" />
            Progress Snapshots
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-center">Latest</div>
                  <div className="aspect-[3/4] bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Loading...</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-sm font-medium text-center">
                    Previous
                  </div>
                  <div className="aspect-[3/4] bg-muted/20 rounded-lg flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Loading...</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : !latestSnapshot && !previousSnapshot ? (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">No progress snapshots yet</p>
                <p className="text-xs">
                  Add your first progress photos to start tracking
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {/* Latest Snapshot */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-center">Latest</div>
                  <div
                    className="aspect-[3/4] bg-muted/20 rounded-md flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() =>
                      latestSnapshot && handleSnapshotClick(latestSnapshot)
                    }
                  >
                    {latestSnapshot?.image1Url ? (
                      <Image
                        src={latestSnapshot.image1Url}
                        alt="Latest progress snapshot"
                        className="w-full h-full object-cover"
                        width={100}
                        height={200}
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No Image</p>
                      </div>
                    )}
                    {latestSnapshot?.weight && (
                      <div className="absolute top-1 right-1 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
                        {latestSnapshot.weight}kg
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    {latestSnapshot
                      ? formatConditionalDate(new Date(latestSnapshot.date))
                      : 'No data'}
                  </div>
                </div>

                {/* Previous Snapshot */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-center">
                    Previous
                  </div>
                  <div
                    className="aspect-[3/4] bg-muted/20 rounded-md flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() =>
                      previousSnapshot && handleSnapshotClick(previousSnapshot)
                    }
                  >
                    {previousSnapshot?.image1Url ? (
                      <Image
                        src={previousSnapshot.image1Url}
                        alt="Previous progress snapshot"
                        className="w-full h-full object-cover"
                        width={100}
                        height={200}
                      />
                    ) : (
                      <div className="text-center text-muted-foreground">
                        <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No Image</p>
                      </div>
                    )}
                    {previousSnapshot?.weight && (
                      <div className="absolute top-1 right-1 bg-blue-500 text-white text-xs px-2 py-1 rounded-md">
                        {previousSnapshot.weight}kg
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    {previousSnapshot
                      ? formatConditionalDate(new Date(previousSnapshot.date))
                      : 'No data'}
                  </div>
                </div>
              </div>
            )}
            <Button
              className="w-full"
              variant="tertiary"
              onClick={() => {
                setPreselectedSnapshot(null)
                setIsCompareDrawerOpen(true)
              }}
              disabled={!latestSnapshot && !previousSnapshot}
              iconStart={<Images />}
            >
              Compare Mode
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsDrawerOpen(true)}
              iconStart={<Pen />}
              className="w-full"
            >
              View/Edit Timeline
            </Button>

            <Button
              variant="default"
              size="sm"
              iconStart={<Camera />}
              className="w-full"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              Add Photos
            </Button>
            <CreateProgressLogDialog
              open={isCreateDialogOpen}
              onOpenChange={handleCloseDialog}
              editLog={editLog}
            />
          </div>
        </CardFooter>
      </Card>

      <SnapshotTimelineDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        userId={user.id}
      />

      <CompareSnapshotsDrawer
        isOpen={isCompareDrawerOpen}
        onOpenChange={handleCloseCompareDrawer}
        preselectedSnapshot={preselectedSnapshot}
      />
    </>
  )
}
