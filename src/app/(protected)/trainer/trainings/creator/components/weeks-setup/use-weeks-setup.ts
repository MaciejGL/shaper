import { useState } from 'react'

import { TrainingPlanFormData, TrainingWeek } from '../types'

import { WeekFormData } from './types'

const createNewWeek = (weekNumber: number): TrainingWeek => ({
  id: '',
  weekNumber,
  name: `Week ${weekNumber}`,
  description: '',
  days: Array.from({ length: 7 }, (_, i) => ({
    id: '',
    dayOfWeek: i,
    isRestDay: [0, 6].includes(i),
    exercises: [],
  })),
})

const renumberWeeks = (weeks: TrainingWeek[]): TrainingWeek[] =>
  weeks.map((week, index) => ({
    ...week,
    weekNumber: index + 1,
    name:
      !week.name || week.name === `Week ${week.weekNumber}`
        ? `Week ${index + 1}`
        : week.name,
    days: week.days.map((day) => ({ ...day, dayOfWeek: index + 1 })),
  }))

export const useWeeksSetup = ({
  weeks,
  updateWeeks,
}: {
  weeks: TrainingPlanFormData['weeks']
  updateWeeks: (weeks: TrainingPlanFormData['weeks']) => void
}) => {
  const [editingWeekIndex, setEditingWeekIndex] = useState<number | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [weekForm, setWeekForm] = useState<WeekFormData>({
    id: '',
    weekNumber: 0,
    name: '',
    description: undefined,
  })

  const addWeek = () => {
    const newWeek = createNewWeek(weeks.length + 1)
    updateWeeks([...weeks, newWeek])
  }

  const removeWeek = (weekIndex: number) => {
    if (weeks.length <= 1) return
    const newWeeks = renumberWeeks(
      weeks.filter((_, index) => index !== weekIndex),
    )
    updateWeeks(newWeeks)
  }

  const cloneWeek = (index: number) => {
    const sourceWeek = weeks[index]
    if (!sourceWeek) return

    const newWeek = {
      ...JSON.parse(JSON.stringify(sourceWeek)),
      weekNumber: weeks.length + 1,
      name: `Week ${weeks.length + 1} (Copy of ${sourceWeek.name})`,
      days: sourceWeek.days.map((day, i) => ({ ...day, dayOfWeek: i })),
    }

    const newWeeks = [...weeks]
    newWeeks.splice(newWeek.weekNumber, 0, newWeek)
    updateWeeks(newWeeks)
  }

  const openEditWeekDialog = (weekIndex: number) => {
    const week = weeks[weekIndex]
    setEditingWeekIndex(weekIndex)
    setWeekForm({
      id: week.id,
      weekNumber: week.weekNumber,
      name: week.name,
      description: week.description,
    })
    setEditDialogOpen(true)
  }

  const saveWeekEdit = () => {
    if (editingWeekIndex === null) return

    const newWeeks = weeks.map((week, index) =>
      index === editingWeekIndex
        ? { ...week, name: weekForm.name, description: weekForm.description }
        : week,
    )

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
