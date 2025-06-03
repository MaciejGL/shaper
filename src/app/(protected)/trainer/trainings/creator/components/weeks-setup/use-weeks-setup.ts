import { useState } from 'react'

import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'

import { WeekFormData } from './types'

export const useWeeksSetup = () => {
  const { formData, updateWeek } = useTrainingPlan()
  const weeks = formData.weeks
  const [editingWeekIndex, setEditingWeekIndex] = useState<number | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [weekForm, setWeekForm] = useState<WeekFormData>({
    id: '',
    weekNumber: 0,
    name: '',
    description: undefined,
  })

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
    updateWeek(editingWeekIndex, {
      name: weekForm.name,
      description: weekForm.description,
    })
    setEditDialogOpen(false)
    setEditingWeekIndex(null)
  }

  return {
    setWeekForm,
    weekForm,
    editDialogOpen,
    setEditDialogOpen,
    saveWeekEdit,
    openEditWeekDialog,
  }
}
