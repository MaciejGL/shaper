'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Pencil, XIcon } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { Button } from '@/components/ui/button'
import { Drawer, DrawerClose, DrawerContent } from '@/components/ui/drawer'
import type {
  GQLCreateFavouriteWorkoutInput,
  GQLCreateFavouriteWorkoutMutation,
  GQLGetFavouriteWorkoutFoldersQuery,
  GQLGetFavouriteWorkoutsQuery,
  GQLUpdateFavouriteWorkoutFolderInput,
} from '@/generated/graphql-client'
import {
  useCreateFavouriteWorkoutMutation,
  useUpdateFavouriteWorkoutFolderMutation,
} from '@/generated/graphql-client'
import type { WorkoutStatusAnalysis } from '@/hooks/use-favourite-workouts'
import { useDeleteFavouriteWorkoutFolder } from '@/hooks/use-favourite-workouts'
import { useModalHistory } from '@/hooks/use-modal-history'
import {
  generateTempId,
  isTemporaryId,
  useOptimisticMutation,
} from '@/lib/optimistic-mutations'
import { queryInvalidation } from '@/lib/query-invalidation'
import { cn } from '@/lib/utils'

import { DeleteFolderDialog } from '../favourites/delete-folder-dialog'

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
  const queryClient = useQueryClient()
  const [view, setView] = useState<DrawerView>('plan')
  const [activeDayId, setActiveDayId] = useState<string | null>(null)
  const [pendingCreatedDay, setPendingCreatedDay] = useState<{
    tempId: string
    realId: string
  } | null>(null)
  const [isDeletePlanOpen, setIsDeletePlanOpen] = useState(false)
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [draftTitle, setDraftTitle] = useState('')
  const editableTitleRef = useRef<HTMLSpanElement | null>(null)
  const skipNextBlurRef = useRef(false)

  const { mutateAsync: updateFolder } =
    useUpdateFavouriteWorkoutFolderMutation()
  const folderQueryKey = useMemo(() => ['GetFavouriteWorkoutFolders'], [])
  const { optimisticMutate: updateFolderNameOptimistic } =
    useOptimisticMutation<
      GQLGetFavouriteWorkoutFoldersQuery,
      unknown,
      { input: GQLUpdateFavouriteWorkoutFolderInput }
    >({
      queryKey: folderQueryKey,
      mutationFn: ({ input }) => updateFolder({ input }),
      updateFn: (oldData, { input }) => {
        if (!oldData?.getFavouriteWorkoutFolders) return oldData
        return {
          ...oldData,
          getFavouriteWorkoutFolders: oldData.getFavouriteWorkoutFolders.map(
            (folder) =>
              folder.id === input.id
                ? { ...folder, name: input.name ?? folder.name }
                : folder,
          ),
        }
      },
    })

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
      setPendingCreatedDay(null)
    }
  }, [open])

  useEffect(() => {
    if (
      view === 'day' &&
      activeDayId &&
      !activeDay &&
      !isTemporaryId(activeDayId)
    ) {
      setView('plan')
      setActiveDayId(null)
    }
  }, [activeDay, activeDayId, view])

  useEffect(() => {
    if (!pendingCreatedDay) return
    if (activeDayId !== pendingCreatedDay.tempId) return

    const created = days.find((d) => d.id === pendingCreatedDay.realId)
    if (!created) return

    setActiveDayId(pendingCreatedDay.realId)
    setPendingCreatedDay(null)
  }, [activeDayId, days, pendingCreatedDay])

  const { mutateAsync: createFavouriteWorkout, isPending: isCreatingDay } =
    useCreateFavouriteWorkoutMutation()
  const favouritesQueryKey = useMemo(() => ['GetFavouriteWorkouts'], [])

  const { optimisticMutate: createDayOptimistic } = useOptimisticMutation<
    GQLGetFavouriteWorkoutsQuery,
    GQLCreateFavouriteWorkoutMutation,
    { input: GQLCreateFavouriteWorkoutInput }
  >({
    queryKey: favouritesQueryKey,
    mutationFn: ({ input }) => createFavouriteWorkout({ input }),
    updateFn: (oldData, { input }, tempId) => {
      if (!oldData?.getFavouriteWorkouts) return oldData

      const now = new Date().toISOString()
      const nextTempId = tempId ?? generateTempId('temp')
      const folder =
        input.folderId && plan?.kind === 'folder'
          ? { id: plan.folder.id, name: plan.folder.name }
          : null

      const optimisticFavourite: FavouriteWorkout = {
        __typename: 'FavouriteWorkout',
        id: nextTempId,
        title: input.title,
        description: input.description ?? null,
        createdById: 'temp',
        createdAt: now,
        updatedAt: now,
        folderId: input.folderId ?? null,
        folder,
        exercises: [],
      }

      return {
        ...oldData,
        getFavouriteWorkouts: [optimisticFavourite, ...oldData.getFavouriteWorkouts],
      }
    },
    onSuccess: (data, _variables, tempId) => {
      if (!tempId) return

      const realId = data.createFavouriteWorkout.id
      queryClient.setQueryData<GQLGetFavouriteWorkoutsQuery>(
        favouritesQueryKey,
        (oldData) => {
          if (!oldData?.getFavouriteWorkouts) return oldData

          return {
            ...oldData,
            getFavouriteWorkouts: oldData.getFavouriteWorkouts.map((fav) =>
              fav.id === tempId ? { ...fav, id: realId } : fav,
            ),
          }
        },
      )

      setView('day')
      setPendingCreatedDay({ tempId, realId })

      void queryInvalidation.favourites(queryClient)
      onRefetch()
    },
    onError: () => {
      setView('plan')
      setActiveDayId(null)
    },
  })

  const handleCreateDay = async () => {
    if (!canCreateDay || isLoading || isCreatingDay) return

    const nextTitle = `Day ${days.length + 1}`
    const tempId = generateTempId('temp')

    setActiveDayId(tempId)
    setView('day')
    setPendingCreatedDay(null)

    try {
      await createDayOptimistic(
        {
          input: {
            title: nextTitle,
            folderId,
            exercises: [],
          },
        },
        tempId,
      )
    } catch {
      // errors handled globally + rollback in optimistic mutation
    }
  }

  const title = plan ? getCustomPlanTitle(plan) : ''
  const folderId = plan ? getCustomPlanFolderId(plan) : null
  const canEditTitle = plan?.kind === 'folder'
  const canDeletePlan = plan?.kind === 'folder'

  const { mutateAsync: deleteFolder, isPending: isDeletingFolder } =
    useDeleteFavouriteWorkoutFolder()

  useEffect(() => {
    if (!canEditTitle) return
    if (!isEditingTitle) setDraftTitle(title)
  }, [canEditTitle, isEditingTitle, title])

  const startEditTitle = () => {
    if (!canEditTitle) return
    setIsEditingTitle(true)
    setDraftTitle(title)
  }

  const cancelEditTitle = () => {
    skipNextBlurRef.current = true
    setIsEditingTitle(false)
    setDraftTitle(title)
  }

  const saveEditTitle = async () => {
    if (!canEditTitle) return
    const nextName = draftTitle.trim()
    if (!nextName) {
      cancelEditTitle()
      return
    }

    const folder = plan.folder
    if (!folder) return

    skipNextBlurRef.current = true
    await updateFolderNameOptimistic({
      input: { id: folder.id, name: nextName },
    })
    setIsEditingTitle(false)
  }

  useEffect(() => {
    if (!isEditingTitle) return
    if (!editableTitleRef.current) return

    editableTitleRef.current.textContent = draftTitle
    requestAnimationFrame(() => {
      const el = editableTitleRef.current
      if (!el) return
      el.focus()
      const range = document.createRange()
      range.selectNodeContents(el)
      range.collapse(false)
      const sel = window.getSelection()
      sel?.removeAllRanges()
      sel?.addRange(range)
    })
  }, [draftTitle, isEditingTitle])

  if (!plan) return null

  const handleConfirmDeletePlan = async () => {
    if (!canDeletePlan) return

    try {
      await deleteFolder({ id: plan.folder.id })
      setIsDeletePlanOpen(false)
      onRefetch()
      onClose()
    } catch (error) {
      console.error('Failed to delete plan folder:', error)
    }
  }

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
                onClick={onClose}
                iconOnly={<XIcon className="dark text-white" />}
                className="dark absolute top-4 right-4 rounded-full z-10 bg-black/30 dark:bg-black/30 border-none backdrop-blur-md transition-opacity"
              />
            </DrawerClose>

            <div className="px-4 pt-6 pb-3 shrink-0 space-y-1">
              <div className="flex items-center">
                <AnimatePresence mode="wait">
                  {view === 'day' && (
                    <motion.div
                      key="back-button"
                      initial={{ opacity: 0, x: -8, width: 0 }}
                      animate={{ opacity: 1, x: 0, width: 52 }}
                      exit={{ opacity: 0, x: -8, width: 0 }}
                      transition={{ ease: 'linear' }}
                      className="overflow-hidden"
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
                    </motion.div>
                  )}
                </AnimatePresence>

                {isEditingTitle ? (
                  <span
                    ref={editableTitleRef}
                    contentEditable
                    suppressContentEditableWarning
                    role="textbox"
                    aria-label="Plan title"
                    className="block text-2xl font-semibold leading-11 outline-none bg-transparent"
                    onInput={(e) => {
                      const next = (e.currentTarget.textContent ?? '')
                        .replace(/\n/g, ' ')
                        .slice(0, 80)
                      if ((e.currentTarget.textContent ?? '') !== next) {
                        e.currentTarget.textContent = next
                      }
                      setDraftTitle(next)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        void saveEditTitle()
                      }
                      if (e.key === 'Escape') {
                        e.preventDefault()
                        cancelEditTitle()
                      }
                    }}
                    onBlur={() => {
                      if (skipNextBlurRef.current) {
                        skipNextBlurRef.current = false
                        return
                      }
                      void saveEditTitle()
                    }}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={startEditTitle}
                    disabled={!canEditTitle}
                    className={cn(
                      'text-left',
                      !canEditTitle ? 'cursor-default' : 'cursor-text',
                    )}
                    aria-label={canEditTitle ? 'Edit plan title' : 'Plan title'}
                  >
                    <span className="inline-flex items-center gap-1">
                      <span className="text-2xl font-semibold leading-11">
                        {title}
                      </span>
                      {canEditTitle ? (
                        <Pencil className="size-4 text-muted-foreground" />
                      ) : null}
                    </span>
                  </button>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                Manage your workout sessions.
              </p>
            </div>

            <div className="flex-1 min-h-0">
              <div className="relative overflow-hidden h-full">
                <div
                  className={cn(
                    'transition-transform duration-300 ease-out will-change-transform h-full overflow-y-auto overscroll-behavior-y-contain hide-scrollbar px-4 pt-6 pb-[calc(var(--safe-area-inset-bottom)+24px)]',
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
                    isCreatingDay={isCreatingDay}
                    canDeletePlan={canDeletePlan}
                    isDeletingPlan={isDeletingFolder}
                    onDeletePlan={() => setIsDeletePlanOpen(true)}
                    onSelectDay={(id) => {
                      setActiveDayId(id)
                      setView('day')
                    }}
                    onCreateDay={handleCreateDay}
                  />
                </div>

                <div
                  className={cn(
                    'absolute inset-0 transition-transform duration-300 ease-out will-change-transform h-full overflow-y-auto overscroll-behavior-y-contain hide-scrollbar px-4 pt-6 pb-[calc(var(--safe-area-inset-bottom)+24px)]',
                    view === 'day' ? 'translate-x-0' : 'translate-x-full',
                    view === 'day'
                      ? 'pointer-events-auto'
                      : 'pointer-events-none',
                  )}
                >
                  <DayEditorView
                    day={activeDay}
                    isLoading={
                      isLoading ||
                      (view === 'day' &&
                        !!activeDayId &&
                        (isTemporaryId(activeDayId) ||
                          (pendingCreatedDay?.tempId === activeDayId &&
                            !activeDay)))
                    }
                    workoutStatus={workoutStatus}
                    onBack={() => {
                      setView('plan')
                      setActiveDayId(null)
                    }}
                    onStartWorkout={onStartWorkout}
                    isStartingWorkout={isStartingWorkout}
                    onRequestDeleteDay={(id) => onRequestDeleteDay(id)}
                    onCreateAnotherDay={handleCreateDay}
                  />
                </div>
              </div>
            </div>
          </div>
        </DrawerContent>
      </Drawer>

      {canDeletePlan ? (
        <DeleteFolderDialog
          open={isDeletePlanOpen}
          folderName={plan.folder.name}
          workoutCount={days.length}
          onClose={() => setIsDeletePlanOpen(false)}
          onConfirm={() => void handleConfirmDeletePlan()}
          isDeleting={isDeletingFolder}
        />
      ) : null}
    </>
  )
}
