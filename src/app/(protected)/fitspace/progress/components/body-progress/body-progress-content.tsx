'use client'

import { Plus } from 'lucide-react'
import { useState } from 'react'

import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { Button } from '@/components/ui/button'
import { useUser } from '@/context/user-context'

import { Section } from '../section'

import { BodyProgressTimeline } from './body-progress-timeline'
import { CreateProgressLogDialog } from './create-progress-log-dialog'

export function BodyProgressContent() {
  const { hasPremium } = useUser()
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
    <Section
      title="Body Snapshot Timeline"
      action={
        <PremiumButtonWrapper
          hasPremium={hasPremium}
          tooltipText="Document your journey with photos, compare changes on a timeline, and see your transformation unfold."
        >
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            variant="default"
            size="sm"
            iconOnly={<Plus />}
            disabled={!hasPremium}
          >
            Add Progress Log
          </Button>
        </PremiumButtonWrapper>
      }
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center"></div>

        {/* Timeline */}
        <BodyProgressTimeline onEditLog={handleEditLog} />

        {/* Create/Edit Dialog */}
        <CreateProgressLogDialog
          open={isCreateDialogOpen}
          onOpenChange={handleCloseDialog}
          editLog={editLog}
        />
      </div>
    </Section>
  )
}
