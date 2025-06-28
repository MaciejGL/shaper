'use client'

import { motion } from 'framer-motion'
import { PlusCircle } from 'lucide-react'

import { AnimatedGrid, useIsFirstRender } from '@/components/animated-grid'
import { Button } from '@/components/ui/button'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'

import { useWeeksSetup } from './use-weeks-setup'
import { WeekCard } from './week-card'
import { WeekDialog } from './week-dialog'

export function WeeksSetup() {
  const { formData, cloneWeek, removeWeek, addWeek } = useTrainingPlan()
  const weeks = formData.weeks
  const {
    openEditWeekDialog,
    editDialogOpen,
    setEditDialogOpen,
    weekForm,
    setWeekForm,
    saveWeekEdit,
  } = useWeeksSetup()
  const isFirstRender = useIsFirstRender()

  return (
    <div className="@container/section">
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
            className="size-full shadow-neuro-light dark:shadow-neuro-dark bg-card-on-card dark:hover:bg-card-on-card/70"
          >
            Add Week
          </Button>
        </motion.div>
      </AnimatedGrid>
      <WeekDialog
        editDialogOpen={editDialogOpen}
        setEditDialogOpen={setEditDialogOpen}
        weekForm={weekForm}
        setWeekForm={setWeekForm}
        saveWeekEdit={saveWeekEdit}
      />
    </div>
  )
}
