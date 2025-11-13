'use client'

import { MessageSquare } from 'lucide-react'
import { useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { SectionIcon } from '@/components/ui/section-icon'
import {
  type GQLGetAllTrainerSharedNotesQuery,
  useGetAllTrainerSharedNotesQuery,
  useGetTrainerSharedNotesLimitedQuery,
} from '@/generated/graphql-client'

// Type definitions
type AllTrainerNote =
  GQLGetAllTrainerSharedNotesQuery['trainerSharedNotes'][number]

export function TrainerSharedNotesSection() {
  const [isViewAllOpen, setIsViewAllOpen] = useState(false)

  const { data, isLoading, error } = useGetTrainerSharedNotesLimitedQuery()
  const trainerNotes = data?.trainerSharedNotes || []

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SectionIcon icon={MessageSquare} size="xs" variant="sky" />
            Notes from trainer
            <Button variant="ghost" size="xs" className="ml-auto" disabled>
              View All
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoadingSkeleton count={2} variant="md" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SectionIcon icon={MessageSquare} size="xs" variant="sky" />
            Trainer Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Unable to load trainer notes.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (trainerNotes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SectionIcon icon={MessageSquare} size="xs" variant="sky" />
            Trainer Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No notes from your trainer yet.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SectionIcon icon={MessageSquare} size="xs" variant="sky" />
          Notes from trainer
          <Button
            variant="ghost"
            size="xs"
            className="ml-auto"
            onClick={() => setIsViewAllOpen(true)}
          >
            View All
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {trainerNotes.slice(0, 4).map((note) => (
          <TrainerNoteItem key={note.id} note={note} />
        ))}
      </CardContent>

      {/* View All Drawer */}
      <ViewAllNotesDrawer
        isOpen={isViewAllOpen}
        onOpenChange={setIsViewAllOpen}
      />
    </Card>
  )
}

// Component for the "View All" drawer
interface ViewAllNotesDrawerProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function ViewAllNotesDrawer({ isOpen, onOpenChange }: ViewAllNotesDrawerProps) {
  const { data, isLoading, error } = useGetAllTrainerSharedNotesQuery(
    {},
    { enabled: isOpen }, // Only fetch when drawer is opened
  )

  const allNotes = data?.trainerSharedNotes || []

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]" dialogTitle="All Trainer Notes">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            All Trainer Notes ({allNotes.length})
          </DrawerTitle>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {isLoading ? (
            <div className="space-y-4">
              <LoadingSkeleton count={2} variant="lg" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              Failed to load notes. Please try again.
            </div>
          ) : allNotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No shared notes from your trainer yet.
            </div>
          ) : (
            <div className="space-y-4">
              {allNotes.map((note) => (
                <TrainerNoteItem key={note.id} note={note} />
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

// Component for individual notes in the "View All" drawer
interface AllTrainerNoteItemProps {
  note: AllTrainerNote
}

function TrainerNoteItem({ note }: AllTrainerNoteItemProps) {
  const trainerName =
    note.createdBy?.firstName && note.createdBy?.lastName
      ? `${note.createdBy.firstName} ${note.createdBy.lastName}`
      : 'Your trainer'

  return (
    <div className="rounded-lg bg-card-on-card">
      <div className="space-y-2">
        <p className="text-sm leading-relaxed whitespace-pre-wrap p-4 pb-2">
          {note.text}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-2 px-4 pb-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <p>{trainerName}</p>
          </div>

          <time className="text-xs text-muted-foreground">
            {new Date(note.createdAt).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </div>
      </div>
    </div>
  )
}
