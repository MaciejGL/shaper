'use client'

import { ArrowLeft, XIcon } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent } from '@/components/ui/drawer'
import type { WorkoutStatusAnalysis } from '@/hooks/use-favourite-workouts'
import { useModalHistory } from '@/hooks/use-modal-history'
import { cn } from '@/lib/utils'

import { CreateEmptyFavouriteDialog } from '../favourites/create-empty-favourite-dialog'

import { DayEditorView } from './day-editor-view'
import { PlanView } from './plan-view'
import type { CustomPlan, FavouriteWorkout } from './types'
import { getCustomPlanFolderId, getCustomPlanTitle } from './types'

type DrawerView = 'plan' | 'day'

interface CustomPlansDrawerProps {
  open: boolean
  onClose: () => void

  plan: CustomPlan | null
  favourites: FavouriteWorkout[]
  isLoading: boolean

  onRefetch: () => void

  workoutStatus: WorkoutStatusAnalysis
  canCreateDay: boolean
  isStartingWorkout: boolean
  onStartWorkout: (favouriteId: string) => void

  onRequestDeleteDay: (favouriteId: string) => void
}

export function CustomPlansDrawer({
  open,
  onClose,
  plan,
  favourites,
  isLoading,
  onRefetch,
  workoutStatus,
  canCreateDay,
  isStartingWorkout,
  onStartWorkout,
  onRequestDeleteDay,
}: CustomPlansDrawerProps) {
  const [view, setView] = useState<DrawerView>('plan')
  const [activeDayId, setActiveDayId] = useState<string | null>(null)
  const [showCreateDay, setShowCreateDay] = useState(false)

  const days = useMemo(() => {
    if (!plan) return []
    const folderId = getCustomPlanFolderId(plan)
    return favourites
      .filter((fav) => (folderId ? fav.folderId === folderId : !fav.folderId))
      .slice()
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }, [favourites, plan])

  const activeDay = useMemo(() => {
    if (!activeDayId) return null
    return days.find((d) => d.id === activeDayId) ?? null
  }, [activeDayId, days])

  const isDayViewOpen = open && view === 'day'
  useModalHistory(isDayViewOpen, () => {
    setView('plan')
    setActiveDayId(null)
  })

  useEffect(() => {
    if (!open) {
      setView('plan')
      setActiveDayId(null)
      setShowCreateDay(false)
    }
  }, [open])

  useEffect(() => {
    if (view === 'day' && activeDayId && !activeDay) {
      setView('plan')
      setActiveDayId(null)
    }
  }, [activeDay, activeDayId, view])

  if (!plan) return null

  const title = getCustomPlanTitle(plan)
  const folderId = getCustomPlanFolderId(plan)

  return (
    <>
      <Drawer
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) onClose()
        }}
        direction="right"
        disablePreventScroll
        dismissible={view === 'plan'}
      >
        <DrawerContent
          dialogTitle={title}
          className="data-[vaul-drawer-direction=right]:max-w-screen data-[vaul-drawer-direction=right]:w-screen overflow-hidden data-[vaul-drawer-direction=right]:border-l-0"
          grabber={false}
        >
          <div className="flex flex-col h-dvh">
            <DrawerClose asChild>
              <Button
                variant="secondary"
                size="icon-lg"
                iconOnly={<XIcon className="dark text-white" />}
                className="dark absolute top-4 right-4 rounded-full z-10 bg-black/30 dark:bg-black/30 border-none backdrop-blur-md transition-opacity"
              />
            </DrawerClose>

            <div className="px-4 pt-6 pb-3 shrink-0 space-y-1">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'overflow-hidden transition-all duration-300 ease-out',
                    view === 'day' ? 'w-10 opacity-100' : 'w-0 opacity-0',
                  )}
                >
                  <Button
                    variant="tertiary"
                    size="icon-md"
                    iconOnly={<ArrowLeft />}
                    aria-label="Back to plan"
                    onClick={() => {
                      setView('plan')
                      setActiveDayId(null)
                    }}
                  />
                </div>

                <p className="text-2xl font-semibold">{title}</p>
              </div>
              <p className="text-sm text-muted-foreground">
                Create training days and add exercises.
              </p>
            </div>

            <div className="flex-1 min-h-0 px-4">
              <div className="relative overflow-hidden h-full">
                <div
                  className={cn(
                    'transition-transform duration-300 ease-out will-change-transform h-full overflow-y-auto overscroll-behavior-y-contain hide-scrollbar pt-6 pb-[calc(var(--safe-area-inset-bottom)+24px)]',
                    view === 'day' ? '-translate-x-full' : 'translate-x-0',
                    view === 'day'
                      ? 'pointer-events-none'
                      : 'pointer-events-auto',
                  )}
                >
                  <PlanView
                    days={days}
                    isLoading={isLoading}
                    canCreateDay={canCreateDay}
                    onSelectDay={(id) => {
                      setActiveDayId(id)
                      setView('day')
                    }}
                    onCreateDay={() => {
                      if (!canCreateDay) return
                      setShowCreateDay(true)
                    }}
                  />
                </div>

                <div
                  className={cn(
                    'absolute inset-0 transition-transform duration-300 ease-out will-change-transform h-full overflow-y-auto overscroll-behavior-y-contain hide-scrollbar pt-6 pb-[calc(var(--safe-area-inset-bottom)+24px)]',
                    view === 'day' ? 'translate-x-0' : 'translate-x-full',
                    view === 'day'
                      ? 'pointer-events-auto'
                      : 'pointer-events-none',
                  )}
                >
                  <DayEditorView
                    day={activeDay}
                    isLoading={isLoading}
                    workoutStatus={workoutStatus}
                    onBack={() => {
                      setView('plan')
                      setActiveDayId(null)
                    }}
                    onStartWorkout={onStartWorkout}
                    isStartingWorkout={isStartingWorkout}
                    onRequestDeleteDay={(id) => onRequestDeleteDay(id)}
                    onCreateAnotherDay={() => setShowCreateDay(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      <CreateEmptyFavouriteDialog
        open={showCreateDay}
        onClose={() => setShowCreateDay(false)}
        onSuccess={(favouriteId) => {
          onRefetch()
          setActiveDayId(favouriteId)
          setView('day')
        }}
        currentFolderId={folderId}
      />
    </>
  )
}
