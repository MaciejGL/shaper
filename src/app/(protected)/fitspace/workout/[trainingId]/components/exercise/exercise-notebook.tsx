import { NotebookPenIcon } from 'lucide-react'
import React from 'react'

import { Button } from '@/components/ui/button'
import { Drawer, DrawerTrigger } from '@/components/ui/drawer'

import { ExerciseNotes, useExerciseNotesCount } from '../exercise-notes'

import { ExerciseNotebookProps } from './types'

export function ExerciseNotebook({ exercise }: ExerciseNotebookProps) {
  const notesCount = useExerciseNotesCount(exercise)

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="flex items-center gap-1 relative">
          <Button variant="tertiary" iconOnly={<NotebookPenIcon />} />
          {notesCount > 0 && (
            <div className="text-xs absolute -top-1 -right-1 bg-amber-500/60 rounded-full size-4 shrink-0 flex items-center justify-center">
              {notesCount}
            </div>
          )}
        </div>
      </DrawerTrigger>

      <ExerciseNotes exercise={exercise} />
    </Drawer>
  )
}
