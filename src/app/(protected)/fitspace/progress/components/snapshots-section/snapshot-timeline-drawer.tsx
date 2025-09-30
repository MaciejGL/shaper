'use client'

import { Camera } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

import { BodyProgressTimeline } from '../body-progress/body-progress-timeline'
import { CreateProgressLogDialog } from '../body-progress/create-progress-log-dialog'

interface SnapshotTimelineDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

export function SnapshotTimelineDrawer({
  isOpen,
  onOpenChange,
}: SnapshotTimelineDrawerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editLog, setEditLog] = useState<{
    id: string
    loggedAt: string
    notes?: string | null
    image1Url?: string | null
    image2Url?: string | null
    image3Url?: string | null
    shareWithTrainer: boolean
  } | null>(null)

  const handleEditLog = (log: {
    id: string
    loggedAt: string
    notes?: string | null
    image1Url?: string | null
    image2Url?: string | null
    image3Url?: string | null
    shareWithTrainer: boolean
  }) => {
    setEditLog(log)
    setIsCreateDialogOpen(true)
  }

  const handleCloseDialog = (open: boolean) => {
    setIsCreateDialogOpen(open)
    if (!open) {
      setEditLog(null)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]" dialogTitle="Snapshot Timeline">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-purple-500" />
            Snapshot Timeline
          </DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-4 overflow-y-auto">
          <BodyProgressTimeline onEditLog={handleEditLog} />
          <CreateProgressLogDialog
            open={isCreateDialogOpen}
            onOpenChange={handleCloseDialog}
            editLog={editLog}
          />
        </div>

        <DrawerFooter>
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            variant="default"
            size="sm"
            iconStart={<Camera />}
          >
            Add Snapshot
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
