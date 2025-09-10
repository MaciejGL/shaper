'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { BodyProgressTimeline } from './body-progress-timeline'
import { CreateProgressLogDialog } from './create-progress-log-dialog'

interface BodyProgressContentProps {}

export function BodyProgressContent({}: BodyProgressContentProps) {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Body Snapshot Timeline</h2>
        <Button
          onClick={() => setIsCreateDialogOpen(true)}
          variant="default"
          size="sm"
          iconOnly={<Plus />}
        >
          Add Progress Log
        </Button>
      </div>

      {/* Timeline */}
      <BodyProgressTimeline onEditLog={handleEditLog} />

      {/* Create/Edit Dialog */}
      <CreateProgressLogDialog
        open={isCreateDialogOpen}
        onOpenChange={handleCloseDialog}
        editLog={editLog}
      />
    </div>
  )
}
