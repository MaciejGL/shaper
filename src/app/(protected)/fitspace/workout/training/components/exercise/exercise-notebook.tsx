'use client'

import { NotebookPenIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Drawer, DrawerTrigger } from '@/components/ui/drawer'

import { ExerciseNotes, useExerciseNotesCount } from '../exercise-notes'

import { ExerciseNotebookProps } from './types'

export function ExerciseNotebook({ exercise }: ExerciseNotebookProps) {
  const notesCount = useExerciseNotesCount(exercise)

  const [isOpen, setIsOpen] = useState(false)
  const [resetKey, setResetKey] = useState(0)

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    // When drawer closes, increment resetKey to reset internal state
    if (!open) {
      setResetKey((prev) => prev + 1)
    }
  }

  return (
    <Drawer open={isOpen} onOpenChange={handleOpenChange}>
      <DrawerTrigger asChild suppressHydrationWarning>
        <div className="flex items-center gap-1 relative">
          <Button
            variant="secondary"
            size="icon-lg"
            iconOnly={<NotebookPenIcon />}
          />
          {notesCount > 0 && (
            <div className="text-[10px] absolute -top-1.5 -right-1.5 bg-sky-500/60 rounded-full size-4 shrink-0 flex items-center justify-center">
              {notesCount}
            </div>
          )}
        </div>
      </DrawerTrigger>

      <ExerciseNotes exercise={exercise} resetKey={resetKey} />
    </Drawer>
  )
}
