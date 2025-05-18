'use client'

import { motion } from 'framer-motion'
import { Copy, Edit, PlusCircle, Trash2 } from 'lucide-react'
import { useState } from 'react'

import {
  AnimatedGrid,
  AnimatedGridItem,
  useIsFirstRender,
} from '@/components/animated-grid'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import type { TrainingPlanFormData } from './types'

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
  } = useWeeksSetup({
    weeks,
    updateWeeks,
  })
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

function WeekDialog({
  editDialogOpen,
  setEditDialogOpen,
  weekForm,
  setWeekForm,
  saveWeekEdit,
}: Pick<
  ReturnType<typeof useWeeksSetup>,
  | 'editDialogOpen'
  | 'setEditDialogOpen'
  | 'weekForm'
  | 'setWeekForm'
  | 'saveWeekEdit'
>) {
  return (
    <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
      <DialogContent dialogTitle="Edit Week">
        <DialogHeader>
          <DialogTitle>Edit Week</DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="week-name">Week Name</Label>
            <Input
              id="week-name"
              value={weekForm.name}
              onChange={(e) =>
                setWeekForm({ ...weekForm, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="week-description">Description (optional)</Label>
            <Textarea
              id="week-description"
              value={weekForm.description}
              onChange={(e) =>
                setWeekForm({ ...weekForm, description: e.target.value })
              }
              placeholder="Add notes or description for this week"
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={saveWeekEdit}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

type WeekCardProps = Pick<
  ReturnType<typeof useWeeksSetup>,
  'cloneWeek' | 'openEditWeekDialog' | 'removeWeek'
> & {
  weeks: TrainingPlanFormData['weeks']
  week: TrainingPlanFormData['weeks'][number]
  index: number
  isFirstRender: boolean
}

function WeekCard({
  week,
  weeks,
  cloneWeek,
  openEditWeekDialog,
  removeWeek,
  index,
  isFirstRender,
}: WeekCardProps) {
  return (
    <AnimatedGridItem
      id={week.weekNumber.toString()}
      layoutId={`week-${week.weekNumber}`}
      isFirstRender={isFirstRender}
    >
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg ">{week.name}</CardTitle>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => cloneWeek(index)}
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openEditWeekDialog(index)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeWeek(index)}
              disabled={weeks.length <= 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {week.days.filter((d) => !d.isRestDay).length} training days
          </div>
          {week.description && (
            <div className="mt-2 text-sm">{week.description}</div>
          )}
        </CardContent>
      </Card>
    </AnimatedGridItem>
  )
}

const useWeeksSetup = ({
  weeks,
  updateWeeks,
}: {
  weeks: TrainingPlanFormData['weeks']
  updateWeeks: (weeks: TrainingPlanFormData['weeks']) => void
}) => {
  const [editingWeekIndex, setEditingWeekIndex] = useState<number | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [weekForm, setWeekForm] = useState({ name: '', description: '' })

  const addWeek = () => {
    const newWeekNumber = weeks.length + 1
    const newWeek = {
      weekNumber: newWeekNumber,
      name: `Week ${newWeekNumber}`,
      description: '',
      days: Array.from({ length: 7 }, (_, i) => ({
        dayOfWeek: i,
        isRestDay: [0, 6].includes(i), // Default rest days on Sunday and Saturday
        exercises: [],
      })),
    }

    updateWeeks([...weeks, newWeek])
  }

  const removeWeek = (weekIndex: number) => {
    if (weeks.length <= 1) return // Don't remove the last week

    const newWeeks = weeks.filter((_, index) => index !== weekIndex)
    // Renumber the weeks
    newWeeks.forEach((week, index) => {
      week.weekNumber = index + 1
      if (!week.name || week.name === `Week ${weekIndex + 1}`) {
        week.name = `Week ${index + 1}`
      }
      week.days.forEach((day) => {
        day.dayOfWeek = index + 1
      })
    })

    updateWeeks(newWeeks)
  }

  const cloneWeek = (index: number) => {
    const sourceWeekIndex = weeks.findIndex(
      (w) => w.weekNumber === weeks[index].weekNumber,
    )

    if (sourceWeekIndex === -1) return

    const sourceWeek = weeks[sourceWeekIndex]
    const newWeek = JSON.parse(JSON.stringify(sourceWeek)) // Deep clone
    const newWeekNumber = weeks.length + 1

    // Update IDs and week number
    newWeek.weekNumber = newWeekNumber
    newWeek.name = `Week ${newWeekNumber} (Copy of ${sourceWeek.name})`
    newWeek.days.forEach(
      (
        day: TrainingPlanFormData['weeks'][number]['days'][number],
        i: number,
      ) => {
        day.dayOfWeek = i
      },
    )

    const newWeeks = [...weeks]
    newWeeks.splice(newWeekNumber, 0, newWeek)
    updateWeeks(newWeeks)
  }

  const openEditWeekDialog = (weekIndex: number) => {
    setEditingWeekIndex(weekIndex)
    setWeekForm({
      name: weeks[weekIndex].name,
      description: weeks[weekIndex].description,
    })
    setEditDialogOpen(true)
  }

  const saveWeekEdit = () => {
    if (editingWeekIndex === null) return

    const newWeeks = [...weeks]
    newWeeks[editingWeekIndex] = {
      ...newWeeks[editingWeekIndex],
      name: weekForm.name,
      description: weekForm.description,
    }
    updateWeeks(newWeeks)
    setEditDialogOpen(false)
    setEditingWeekIndex(null)
  }

  return {
    setWeekForm,
    weekForm,
    editDialogOpen,
    setEditDialogOpen,
    saveWeekEdit,
    cloneWeek,
    removeWeek,
    openEditWeekDialog,
    addWeek,
  }
}
