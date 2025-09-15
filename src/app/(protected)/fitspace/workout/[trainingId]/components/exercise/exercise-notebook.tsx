'use client'

import { NotebookPenIcon } from 'lucide-react'
import React, { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Drawer, DrawerTrigger } from '@/components/ui/drawer'

import { ExerciseNotes, useExerciseNotesCount } from '../exercise-notes'

import { ExerciseNotebookProps } from './types'

export function ExerciseNotebook({ exercise }: ExerciseNotebookProps) {
  const notesCount = useExerciseNotesCount(exercise)
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} disablePreventScroll fixed>
      <DrawerTrigger asChild>
        <div className="flex items-center gap-1 relative">
          <Button
            variant="tertiary"
            size="icon-sm"
            iconOnly={<NotebookPenIcon />}
          />
          {notesCount > 0 && (
            <div className="text-[10px] absolute -top-1.5 -right-1.5 bg-sky-500/60 rounded-full size-4 shrink-0 flex items-center justify-center">
              {notesCount}
            </div>
          )}
        </div>
      </DrawerTrigger>

      {isOpen && <ExerciseNotes exercise={exercise} />}
    </Drawer>
  )
}
