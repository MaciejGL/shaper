'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BarChart, Check, ChevronDown, ChevronsUpDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { AnimateNumber } from '@/components/animate-number'
import { ProgressCircle } from '@/components/ui/progress-circle'
import { cn } from '@/lib/utils'

import { WorkoutSummaryDrawer } from './workout-summary-drawer'

interface Exercise {
  id: string
  name: string
  order: number
  completedAt: string | null
}

interface SharedProps {
  exercises: Exercise[]
  startedAt?: string | null
}

// Expanded list item for the dropdown (kept for the expandable pill menu)
function ExpandedExerciseListItem({
  exercise,
  isCurrent,
  onClick,
}: {
  exercise: Exercise
  isCurrent: boolean
  onClick: () => void
}) {
  const isCompleted = !!exercise.completedAt

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all shadow-sm backdrop-blur-md border',
        isCurrent
          ? 'bg-secondary/50 border-secondary/90 dark:bg-secondary dark:border-primary/50'
          : 'bg-card/90 hover:bg-card/98 border-white/5',
      )}
    >
      <div className="flex-shrink-0">
        {isCompleted ? (
          <div className="size-6 rounded-full bg-green-600 dark:bg-green-500 flex-center shadow-lg shadow-green-500/20">
            <Check className="size-4 text-white" />
          </div>
        ) : (
          <div
            className={cn(
              'size-6 rounded-full flex-center font-bold text-sm shadow-inner',
              isCurrent
                ? 'bg-primary text-primary-foreground shadow-primary/25'
                : 'bg-muted text-muted-foreground',
            )}
          >
            {exercise.order}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            'font-medium text-sm',
            isCurrent ? 'text-foreground font-semibold' : 'text-foreground/80',
          )}
        >
          {exercise.name}
        </p>
      </div>
    </button>
  )
}

// Reusable Smart Pill Component
function SmartPillContent({
  progressPercentage,
  completedCount,
  totalCount,
  currentExerciseOrder,
  allExercisesCompleted,
  isExpanded,
  onToggleExpand,
  onShowSummary,
  isStaticOverview,
  layoutId,
  className,
}: {
  progressPercentage: number
  completedCount: number
  totalCount: number
  currentExerciseOrder: number
  allExercisesCompleted: boolean
  isExpanded: boolean
  onToggleExpand: () => void
  onShowSummary: () => void
  isStaticOverview: boolean
  layoutId?: string
  className?: string
}) {
  return (
    <motion.div
      layoutId={layoutId}
      className={cn(
        'pointer-events-auto flex items-center gap-0 bg-white/95 dark:bg-zinc-900/80 backdrop-blur-xl border border-white dark:border-border shadow-lg rounded-full pl-1 pr-3 py-1 max-w-full overflow-hidden w-full',
        !isStaticOverview && 'rounded-l-none',
        className,
      )}
    >
      <button
        onClick={onToggleExpand}
        className={cn(
          'flex items-center justify-center rounded-full transition-all mr-2 shrink-0 relative',
          'hover:bg-white/5 active:scale-95 size-10',
        )}
      >
        <div className="relative flex-center">
          <ProgressCircle
            progress={progressPercentage}
            size={32}
            strokeWidth={2.5}
            className="text-primary"
            hideCheckmark={true}
          />
          <div className="absolute inset-0 flex-center">
            <span className="text-[9px] font-medium whitespace-nowrap">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>
      </button>

      <div
        className={cn(
          'flex flex-col justify-center min-w-0 p-2 border-l border-border dark:border-border flex-1',
          'cursor-pointer',
        )}
        onClick={onToggleExpand}
      >
        {isStaticOverview && (
          <div className="flex items-center gap-1 justify-between">
            <span className={cn('text-base font-medium leading-none')}>
              Exercises Overview
            </span>
            <ChevronDown
              className={cn(
                'size-6 transition-transform duration-200',
                isExpanded && 'rotate-180',
              )}
            />
          </div>
        )}
        {!isStaticOverview && (
          <div className="flex items-center gap-3 pl-1 justify-between">
            <AnimateNumber
              value={currentExerciseOrder}
              duration={200}
              className="text-sm font-medium truncate leading-tight text-foreground"
            />
            <ChevronsUpDown
              className={cn(
                'size-4 relative overflow-visible',
                '[&_path]:transition-transform [&_path]:duration-200',
                isExpanded &&
                  '[&_path:first-child]:translate-y-[-12px] [&_path:last-child]:translate-y-[12px]',
              )}
            />
          </div>
        )}
      </div>

      {allExercisesCompleted && (
        <div
          className={cn(
            'flex items-center gap-2 p-2 border-l border-border dark:border-border shrink-0',
            !isStaticOverview && 'py-1 h-full',
          )}
        >
          <button
            onClick={onShowSummary}
            className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <BarChart className="size-3.5" />
            <span>Summary</span>
          </button>
        </div>
      )}
    </motion.div>
  )
}

export function WorkoutSmartPill({
  exercises,
  isOverviewVisible,
}: SharedProps & { isOverviewVisible: boolean }) {
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(
    null,
  )
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const observersRef = useRef<IntersectionObserver[]>([])

  // Close expanded menu if overview becomes visible (scrolled to top)
  useEffect(() => {
    if (isOverviewVisible && isExpanded) {
      setIsExpanded(false)
    }
  }, [isOverviewVisible, isExpanded])

  // Only track scrolling when the sticky pill is active (overview NOT visible)
  useEffect(() => {
    if (isOverviewVisible) return

    const observerOptions: IntersectionObserverInit = {
      threshold: 0.5,
      rootMargin: '-10% 0px -40% 0px',
    }

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentExerciseId(entry.target.id)
        }
      })
    }

    exercises.forEach((exercise) => {
      const element = document.getElementById(exercise.id)
      if (element) {
        const observer = new IntersectionObserver(callback, observerOptions)
        observer.observe(element)
        observersRef.current.push(observer)
      }
    })

    return () => {
      observersRef.current.forEach((observer) => observer.disconnect())
      observersRef.current = []
    }
  }, [exercises, isOverviewVisible])

  // Close on scroll logic
  useEffect(() => {
    if (!isExpanded) return

    const handleScroll = () => {
      if (isExpanded) {
        setIsExpanded(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isExpanded])

  const scrollToExercise = (exerciseId: string) => {
    const element = document.getElementById(exerciseId)
    if (element) {
      const yOffset = -120
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
      setIsExpanded(false)
    }
  }

  // Determine current exercise logic
  // If overview is visible, we show the "first" incomplete exercise or just "Overview"
  // If scrolling, we show the tracked exercise
  const currentExercise =
    exercises.find((e) => e.id === currentExerciseId) ?? exercises[0]

  const currentExerciseOrder = isOverviewVisible
    ? 1
    : currentExercise
      ? currentExercise.order
      : 1

  const completedCount = exercises.filter((e) => e.completedAt).length
  const totalCount = exercises.length
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const allExercisesCompleted = exercises.every((e) => e.completedAt)

  return (
    <>
      {/* Gradient Backdrop (Below Pill) */}
      <AnimatePresence>
        {isExpanded && !isOverviewVisible && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[38] bg-gradient-to-t from-black/60 via-black/70 to-transparent pointer-events-none backdrop-blur-xs"
            />
            {/* Clickable area to close */}
            <div
              className="fixed inset-0 z-[39]"
              onClick={() => setIsExpanded(false)}
            />
          </>
        )}
      </AnimatePresence>

      {/* Fixed Sticky Pill (When scrolled down) */}
      <AnimatePresence>
        {!isOverviewVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed bottom-18 left-0 z-[40] flex justify-center pointer-events-none"
          >
            <SmartPillContent
              progressPercentage={progressPercentage}
              completedCount={completedCount}
              totalCount={totalCount}
              currentExerciseOrder={currentExerciseOrder}
              allExercisesCompleted={allExercisesCompleted}
              isExpanded={isExpanded}
              onToggleExpand={() => setIsExpanded(!isExpanded)}
              onShowSummary={() => setShowSummary(true)}
              isStaticOverview={false}
              layoutId="sticky-pill"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dropdown List (Below the pill) */}
      <AnimatePresence>
        {isExpanded && !isOverviewVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-32 left-4 right-4 z-[45] max-h-[80dvh] overflow-y-auto no-scrollbar flex flex-col gap-2 pb-4"
          >
            {exercises.map((exercise, i) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: (exercises.length - 1 - i) * 0.05 },
                }}
              >
                <ExpandedExerciseListItem
                  exercise={exercise}
                  isCurrent={exercise.id === currentExerciseId}
                  onClick={() => scrollToExercise(exercise.id)}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <WorkoutSummaryDrawer open={showSummary} onOpenChange={setShowSummary} />
    </>
  )
}

export function WorkoutOverviewPill({
  exercises,
  onInViewChange,
}: SharedProps & {
  onInViewChange?: (inView: boolean) => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close overview pill when scrolling down significantly (when it's about to become sticky)
  useEffect(() => {
    if (!isExpanded) return

    const handleScroll = () => {
      // Close if scrolled more than 50px while expanded
      if (window.scrollY > 50) {
        setIsExpanded(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isExpanded])

  const completedCount = exercises.filter((e) => e.completedAt).length
  const totalCount = exercises.length
  const progressPercentage =
    totalCount > 0 ? (completedCount / totalCount) * 100 : 0
  const allExercisesCompleted = exercises.every((e) => e.completedAt)

  const scrollToExercise = (exerciseId: string) => {
    const element = document.getElementById(exerciseId)
    if (element) {
      const yOffset = -120
      const y =
        element.getBoundingClientRect().top + window.pageYOffset + yOffset
      window.scrollTo({ top: y, behavior: 'smooth' })
      setIsExpanded(false)
    }
  }

  // Intersection observer to trigger the fixed pill
  useEffect(() => {
    const element = ref.current
    if (!element || !onInViewChange) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        onInViewChange(entry.isIntersecting)
      },
      { threshold: 0 }, // Trigger as soon as it leaves viewport
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [onInViewChange])

  return (
    <>
      <div ref={ref} className="relative h-[56px] z-[35]">
        {!isExpanded && (
          <div className="relative w-full">
            <SmartPillContent
              progressPercentage={progressPercentage}
              completedCount={completedCount}
              totalCount={totalCount}
              currentExerciseOrder={1}
              allExercisesCompleted={allExercisesCompleted}
              isExpanded={false}
              onToggleExpand={() => setIsExpanded(true)}
              onShowSummary={() => setShowSummary(true)}
              isStaticOverview={true}
              layoutId="overview-pill"
              className={cn(
                'rounded-none h-[56px] border-0 bg-white dark:bg-background-subtle shadow-none',
              )}
            />
          </div>
        )}
      </div>

      {/* Expanded Overlay Elements */}
      <AnimatePresence>
        {isExpanded && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[38] bg-gradient-to-b from-black/60 via-black/70 to-transparent pointer-events-none backdrop-blur-xs"
            />
            {/* Clickable area to close */}
            <div
              className="fixed inset-0 z-[39]"
              onClick={() => setIsExpanded(false)}
            />

            {/* The Expanded Pill - Rendered at root level for correct stacking */}
            <div className="fixed top-2 left-0 right-0 px-2 z-[45] pointer-events-none flex justify-center">
              <SmartPillContent
                progressPercentage={progressPercentage}
                completedCount={completedCount}
                totalCount={totalCount}
                currentExerciseOrder={1}
                allExercisesCompleted={allExercisesCompleted}
                isExpanded={true}
                onToggleExpand={() => setIsExpanded(false)}
                onShowSummary={() => setShowSummary(true)}
                isStaticOverview={true}
                layoutId="overview-pill"
                className="w-full"
              />
            </div>

            {/* Dropdown List */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-18 left-4 right-4 z-[45] max-h-[80dvh] overflow-y-auto no-scrollbar flex flex-col gap-2 pb-4"
            >
              {exercises.map((exercise, i) => (
                <motion.div
                  key={exercise.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: { delay: i * 0.05 },
                  }}
                >
                  <ExpandedExerciseListItem
                    exercise={exercise}
                    isCurrent={false}
                    onClick={() => scrollToExercise(exercise.id)}
                  />
                </motion.div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <WorkoutSummaryDrawer open={showSummary} onOpenChange={setShowSummary} />
    </>
  )
}
