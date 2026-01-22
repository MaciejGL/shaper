'use client'

import { Camera, Eye, EyeOff, Images, Pen, Plus } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { useUserPreferences } from '@/context/user-preferences-context'
import { formatConditionalDate } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

import { CreateProgressLogDialog } from '../body-progress/create-progress-log-dialog'

import { CompareSnapshotsDrawer } from './compare-snapshots-drawer'
import { SnapshotTimelineDrawer } from './snapshot-timeline-drawer'
import { useSnapshots } from './use-snapshots'

export function SnapshotsSection() {
  const { hasPremium } = useUser()
  const { preferences, updatePreferences } = useUserPreferences()
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

  const { latestSnapshot, previousSnapshot, progressLogs, isLoading } =
    useSnapshots()

  const handleEditSnapshot = (snapshotId: string) => {
    const log = progressLogs?.find((l) => l.id === snapshotId)
    if (log) {
      setEditLog({
        id: log.id,
        loggedAt: log.loggedAt,
        notes: log.notes,
        image1Url: log.image1?.url,
        image2Url: log.image2?.url,
        image3Url: log.image3?.url,
        shareWithTrainer: log.shareWithTrainer,
      })
      setIsCreateDialogOpen(true)
    }
  }

  const handleToggleBlur = () => {
    updatePreferences({
      blurProgressSnapshots: !preferences.blurProgressSnapshots,
    })
  }

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

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center gap-2 whitespace-nowrap">
            <Camera className="h-5 w-5 text-purple-500" />
            Progress Snapshots
          </CardTitle>
          <div className="flex items-center gap-1">
            {(latestSnapshot || previousSnapshot) && (
              <>
                <Button
                  variant="tertiary"
                  size="icon-sm"
                  iconOnly={
                    preferences.blurProgressSnapshots ? <Eye /> : <EyeOff />
                  }
                  onClick={handleToggleBlur}
                  title={
                    preferences.blurProgressSnapshots
                      ? 'Show images'
                      : 'Blur images'
                  }
                />
                <Button
                  variant="tertiary"
                  size="icon-sm"
                  iconOnly={<Pen />}
                  onClick={() => setIsDrawerOpen(true)}
                  title="View history"
                />
              </>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-center">Latest</div>
                  <div className="aspect-3/4 bg-muted/20 rounded-lg flex items-center justify-center">
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
                  <div className="aspect-3/4 bg-muted/20 rounded-lg flex items-center justify-center">
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
                <p className="text-xs mt-1">
                  Add your first progress photos to start tracking
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {/* Latest Snapshot */}
                <div className="space-y-2">
                  <div className="text-sm font-medium text-center">Latest</div>
                  <div
                    className="aspect-3/4 bg-muted/20 rounded-md flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() =>
                      latestSnapshot && handleSnapshotClick(latestSnapshot)
                    }
                  >
                    {latestSnapshot?.image1Url ? (
                      <Image
                        src={latestSnapshot.image1Url}
                        alt="Latest progress snapshot"
                        className={cn(
                          'w-full h-full object-cover transition-all select-none',
                          preferences.blurProgressSnapshots ? 'blur-xl' : '',
                        )}
                        width={300}
                        height={600}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        draggable={false}
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
                    {latestSnapshot && (
                      <Button
                        variant="secondary"
                        size="icon-xs"
                        iconOnly={<Pen />}
                        className="absolute top-1 left-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditSnapshot(latestSnapshot.id)
                        }}
                        title="Edit"
                      />
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
                    className="aspect-3/4 bg-card-on-card rounded-md flex items-center justify-center relative overflow-hidden cursor-pointer hover:bg-muted/30 transition-colors"
                    onClick={() =>
                      previousSnapshot && handleSnapshotClick(previousSnapshot)
                    }
                  >
                    {previousSnapshot?.image1Url ? (
                      <Image
                        src={previousSnapshot.image1Url}
                        alt="Previous progress snapshot"
                        className={cn(
                          'w-full h-full object-cover transition-all select-none',
                          preferences.blurProgressSnapshots ? 'blur-xl' : '',
                        )}
                        width={300}
                        height={600}
                        onContextMenu={(e) => e.preventDefault()}
                        onDragStart={(e) => e.preventDefault()}
                        draggable={false}
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
                    {previousSnapshot && (
                      <Button
                        variant="secondary"
                        size="icon-xs"
                        iconOnly={<Pen />}
                        className="absolute top-1 left-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEditSnapshot(previousSnapshot.id)
                        }}
                        title="Edit"
                      />
                    )}
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    {previousSnapshot
                      ? formatConditionalDate(new Date(previousSnapshot.date))
                      : ''}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => {
                setPreselectedSnapshot(null)
                setIsCompareDrawerOpen(true)
              }}
              iconStart={<Images />}
              className="w-full"
            >
              Compare
            </Button>
            <PremiumButtonWrapper
              hasPremium={hasPremium}
              tooltipText="Capture your transformation journey and compare photos side-by-side — seeing is believing."
            >
              <Button
                variant="default"
                size="sm"
                iconStart={<Plus />}
                onClick={() => setIsCreateDialogOpen(true)}
                disabled={!hasPremium}
                className="w-full"
              >
                Add Snapshot
              </Button>
            </PremiumButtonWrapper>
          </div>
        </CardFooter>
      </Card>

      <SnapshotTimelineDrawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
      />

      <CompareSnapshotsDrawer
        isOpen={isCompareDrawerOpen}
        onOpenChange={handleCloseCompareDrawer}
        preselectedSnapshot={preselectedSnapshot}
      />

      <CreateProgressLogDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        editLog={editLog}
      />
    </>
  )
}
