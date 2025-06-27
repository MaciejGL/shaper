'use client'

import { Calendar, Copy, Dumbbell, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useExtendPlanMutation,
  useFitspaceMyPlansQuery,
  useRemoveWeekMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

import { ActivePlan } from '../types'

interface ManagePlanModalProps {
  plan: NonNullable<ActivePlan>
  open: boolean
  setOpen: (open: boolean) => void
}

interface WeeksListProps {
  weeks: NonNullable<ActivePlan>['weeks']
  selectedWeeks: string[]
  emptyMessage: string
  mode: ModalMode
  onWeekToggle: (weekId: string) => void
  onSelectAll: (weeks: NonNullable<ActivePlan>['weeks']) => void
}

type ModalMode = 'copy' | 'remove'

export function ManagePlanModal({ plan, open, setOpen }: ManagePlanModalProps) {
  const invalidateQuery = useInvalidateQuery()
  const [mode, setMode] = useState<ModalMode>('copy')
  const [selectedWeeks, setSelectedWeeks] = useState<string[]>([])

  const { mutateAsync: extendPlan, isPending: isExtending } =
    useExtendPlanMutation({
      onSuccess: () => {
        toast.success('Weeks copied successfully!')
        invalidateQuery({
          queryKey: useFitspaceMyPlansQuery.getKey(),
        })
      },
    })

  const { mutateAsync: removeWeek, isPending: isRemoving } =
    useRemoveWeekMutation({
      onSuccess: () => {
        toast.success('Week removed successfully!')
        invalidateQuery({
          queryKey: useFitspaceMyPlansQuery.getKey(),
        })
      },
    })

  // Get available weeks based on mode
  const copyableWeeks = plan.weeks
  const removableWeeks = plan.weeks.filter((week) => week.isExtra)
  const extraWeeks = plan.weeks.filter((week) => week.isExtra)

  const handleWeekToggle = (weekId: string) => {
    setSelectedWeeks((prev) =>
      prev.includes(weekId)
        ? prev.filter((id) => id !== weekId)
        : [...prev, weekId],
    )
  }

  const handleSelectAll = (weeks: typeof plan.weeks) => {
    if (selectedWeeks.length === weeks.length) {
      setSelectedWeeks([])
    } else {
      setSelectedWeeks(weeks.map((week) => week.id))
    }
  }

  const handleTabChange = (newMode: string) => {
    setMode(newMode as ModalMode)
    setSelectedWeeks([]) // Reset selection when changing tabs
  }

  const handleAction = async () => {
    if (selectedWeeks.length === 0) return

    if (mode === 'copy') {
      await extendPlan({
        planId: plan.id,
        weeks: selectedWeeks,
      })
    } else if (mode === 'remove') {
      // Remove weeks one by one
      for (const weekId of selectedWeeks) {
        await removeWeek({
          planId: plan.id,
          weekId,
        })
      }
    }

    setOpen(false)
    setSelectedWeeks([])
  }

  const getActionButtonText = () => {
    switch (mode) {
      case 'copy':
        return 'Copy Selected Weeks'
      case 'remove':
        return 'Remove Selected Weeks'
      default:
        return 'Apply Changes'
    }
  }

  const getActionIcon = () => {
    switch (mode) {
      case 'copy':
        return <Copy />
      case 'remove':
        return <Trash2 className="text-red-500" />
      default:
        return <Copy />
    }
  }

  const isLoading = isExtending || isRemoving

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        fullScreen
        className="pt-2 px-0 pb-0"
        dialogTitle="Manage Workout Plan"
      >
        <div className="flex flex-col p-4 grow">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Dumbbell className="h-5 w-5" />
              Manage Workout Plan
            </DialogTitle>
            <DialogDescription>
              Copy weeks or remove extra weeks from "{plan.title}".
            </DialogDescription>
          </DialogHeader>

          {/* Tabs for Copy/Remove */}
          <Tabs
            value={mode}
            onValueChange={handleTabChange}
            className="flex-1 flex flex-col mt-6"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="copy" className="flex items-center gap-2">
                <Copy className="h-4 w-4" />
                Copy Weeks
              </TabsTrigger>
              <TabsTrigger
                value="remove"
                className="flex items-center gap-2"
                disabled={extraWeeks.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                Remove Weeks
                {extraWeeks.length === 0 && (
                  <span className="ml-1 text-xs opacity-60">(0)</span>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="copy" className="flex-1 flex flex-col mt-6">
              <WeeksList
                weeks={copyableWeeks}
                selectedWeeks={selectedWeeks}
                emptyMessage="No weeks available to copy"
                mode={mode}
                onWeekToggle={handleWeekToggle}
                onSelectAll={handleSelectAll}
              />
            </TabsContent>

            <TabsContent value="remove" className="flex-1 flex flex-col mt-6">
              <WeeksList
                weeks={removableWeeks}
                selectedWeeks={selectedWeeks}
                emptyMessage="No extra weeks available to remove"
                mode={mode}
                onWeekToggle={handleWeekToggle}
                onSelectAll={handleSelectAll}
              />
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="mt-4 sticky bottom-0 bg-background p-4 flex-col">
          <p className="text-sm text-muted-foreground">
            {selectedWeeks.length} week{selectedWeeks.length !== 1 ? 's' : ''}{' '}
            selected
          </p>
          <div className="flex items-center justify-between w-full gap-2">
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="grow"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={selectedWeeks.length === 0}
              iconStart={getActionIcon()}
              className="grow"
              loading={isLoading}
            >
              {getActionButtonText()}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function WeeksList({
  weeks,
  selectedWeeks,
  emptyMessage,
  mode,
  onWeekToggle,
  onSelectAll,
}: WeeksListProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {mode === 'copy'
            ? 'Select weeks to copy'
            : 'Select extra weeks to remove'}
        </h3>
        {weeks.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onSelectAll(weeks)}
          >
            {selectedWeeks.length === weeks.length
              ? 'Deselect All'
              : 'Select All'}
          </Button>
        )}
      </div>

      <div className="flex flex-col gap-3 grow overflow-y-auto -mx-2 px-2 py-1">
        {weeks.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            {emptyMessage}
          </div>
        ) : (
          weeks.map((week) => (
            <div
              key={week.id}
              className={cn(
                'cursor-pointer transition-colors shadow-neuro-light dark:shadow-neuro-dark rounded-lg',
                selectedWeeks.includes(week.id) && 'bg-primary/5',
              )}
              onClick={() => onWeekToggle(week.id)}
            >
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedWeeks.includes(week.id)}
                    onChange={() => onWeekToggle(week.id)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">Week {week.weekNumber}</h4>
                      {week.isExtra && (
                        <span className="px-2 py-1 text-xs rounded bg-secondary text-secondary-foreground">
                          Extra
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {week.days.filter((day) => !day.isRestDay).length} days
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  )
}
