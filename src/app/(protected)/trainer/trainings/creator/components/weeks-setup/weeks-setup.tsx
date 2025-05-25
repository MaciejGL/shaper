'use client'

import { motion } from 'framer-motion'
import { PlusCircle } from 'lucide-react'

import { AnimatedGrid, useIsFirstRender } from '@/components/animated-grid'
import { Button } from '@/components/ui/button'

import type { TrainingPlanFormData } from '../types'

import { useWeeksSetup } from './use-weeks-setup'
import { WeekCard } from './week-card'
import { WeekDialog } from './week-dialog'

type WeeksSetupProps = {
  weeks: TrainingPlanFormData['weeks']
  updateWeeks: (weeks: TrainingPlanFormData['weeks']) => void
}

export function WeeksSetup({ weeks, updateWeeks }: WeeksSetupProps) {
  const {
    cloneWeek,
    removeWeek,
    openEditWeekDialog,
    addWeek,
    editDialogOpen,
    setEditDialogOpen,
    weekForm,
    setWeekForm,
    saveWeekEdit,
  } = useWeeksSetup({ weeks, updateWeeks })
  const isFirstRender = useIsFirstRender()

  return (
    <div className="@container/section space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Training Weeks</h2>
      </div>

      <WeekDialog
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        weekForm={weekForm}
        setWeekForm={setWeekForm}
        saveWeekEdit={saveWeekEdit}
      />

      <AnimatedGrid layoutId="weeks">
        {weeks.map((week, index) => (
          <WeekCard
            key={week.weekNumber}
            week={week}
            weeks={weeks}
            cloneWeek={cloneWeek}
            openEditWeekDialog={openEditWeekDialog}
            removeWeek={removeWeek}
            index={index}
            isFirstRender={isFirstRender}
          />
        ))}
        <motion.div layout className="size-full">
          <Button
            variant="ghost"
            onClick={addWeek}
            iconStart={<PlusCircle />}
            className="size-full shadow-sm"
          >
            Add Week
          </Button>
        </motion.div>
      </AnimatedGrid>
    </div>
  )
}
