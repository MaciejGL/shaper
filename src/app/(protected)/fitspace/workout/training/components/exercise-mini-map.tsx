'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { BarChart, Check, ChevronLeft, List, ListCheck } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

import { WorkoutSummaryDrawer } from './workout-summary-drawer'

interface Exercise {
  id: string
  name: string
  order: number
  completedAt: string | null
}

interface ExerciseMiniMapProps {
  exercises: Exercise[]
}

export function ExerciseMiniMap({ exercises }: ExerciseMiniMapProps) {
  const [currentExerciseId, setCurrentExerciseId] = useState<string | null>(
    null,
  )
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showSummary, setShowSummary] = useState(false)
  const observersRef = useRef<IntersectionObserver[]>([])

  // Track which exercise is currently in view
  useEffect(() => {
    const observerOptions: IntersectionObserverInit = {
      threshold: 0.5,
      rootMargin: '-20% 0px -20% 0px',
    }

    const callback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCurrentExerciseId(entry.target.id)
        }
      })
    }

    // Create observers for each exercise
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
  }, [exercises])

  // Detect keyboard open/close
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height
        const windowHeight = window.innerHeight
        const isKeyboard = viewportHeight < windowHeight * 0.75
        setIsKeyboardOpen(isKeyboard)
      }
    }

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      return () => {
        window.visualViewport?.removeEventListener('resize', handleResize)
      }
    }
  }, [])

  const scrollToExercise = (exerciseId: string) => {
    const element = document.getElementById(exerciseId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setIsExpanded(false)
    }
  }

  const currentExerciseIndex = exercises.findIndex(
    (e) => e.id === currentExerciseId,
  )
  const currentExercise = exercises[currentExerciseIndex]
  const isCurrentCompleted = !!currentExercise?.completedAt

  const progressLabel =
    currentExerciseIndex !== -1
      ? `${currentExerciseIndex + 1} / ${exercises.length}`
      : `${exercises.length}`

  const allExercisesCompleted = exercises.every(
    (exercise) => exercise.completedAt,
  )

  return (
    <>
      {/* Expanded List Overlay */}
      <AnimatePresence>
        {isExpanded && (
          <>
            {/* Gradient Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[4] bg-gradient-to-t from-black/75 via-black/40 to-transparent pointer-events-none"
            />
            {/* Clickable area to close */}
            <div
              className="fixed inset-0 z-[5]"
              onClick={() => setIsExpanded(false)}
            />

            {/* Floating List (Upward from bottom left) */}
            <div className="fixed left-4 bottom-[calc(8rem+env(safe-area-inset-bottom))] z-[6] w-72 max-h-dvh overflow-y-auto no-scrollbar flex flex-col-reverse gap-2 pb-2">
              {[...exercises].reverse().map((exercise, i) => {
                const isCompleted = !!exercise.completedAt
                const isCurrent = exercise.id === currentExerciseId

                return (
                  <motion.button
                    key={exercise.id}
                    custom={i}
                    initial={{ opacity: 0, y: 0, scale: 0.95 }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        delay: i * 0.03,
                        duration: 0.15,
                        ease: 'linear',
                      },
                    }}
                    exit={{
                      opacity: 0,
                      y: 20,
                      scale: 0.95,
                      transition: {
                        delay: (exercises.length - 1 - i) * 0.02,
                        duration: 0.15,
                        ease: 'easeIn',
                      },
                    }}
                    onClick={() => scrollToExercise(exercise.id)}
                    className={cn(
                      'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all shadow-sm backdrop-blur-md border',
                      isCurrent
                        ? 'bg-primary/50 border-secondary/90 dark:bg-primary/10 dark:border-primary/50'
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
                          data-completed={isCompleted}
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
                          isCurrent
                            ? 'text-secondary dark:text-foreground font-semibold'
                            : 'text-foreground/80',
                        )}
                      >
                        {exercise.name}
                      </p>
                    </div>
                  </motion.button>
                )
              })}
              {/* <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between px-2 py-2"
              >
                <h3 className="text-lg font-semibold">Exercises</h3>
              </motion.div> */}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <AnimatePresence>
        <motion.div
          layout
          initial={{ opacity: 0, x: '-100%' }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: '-100%' }}
          className={cn(
            'fixed left-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-[6] transition-all duration-300 flex items-center gap-2',
            isKeyboardOpen && 'opacity-0 pointer-events-none translate-y-10',
          )}
        >
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 pl-3 pr-4 py-2.5 rounded-r-2xl shadow-sm backdrop-blur-md transition-all duration-300 bg-card/70 hover:bg-card/90 text-foreground border-y border-r"
          >
            {isExpanded ? (
              <>
                <div className="flex items-center justify-center size-6 rounded-full bg-muted text-muted-foreground">
                  <ChevronLeft className="size-3.5" />
                </div>
                <span className="font-semibold text-sm">Close</span>
              </>
            ) : (
              <>
                <div
                  className={cn(
                    'flex items-center justify-center size-6 rounded-full transition-colors',
                    isCurrentCompleted
                      ? 'bg-emerald-500/10 text-emerald-500'
                      : 'bg-primary/10 text-primary',
                  )}
                >
                  {allExercisesCompleted ? (
                    <ListCheck className="size-3.5" />
                  ) : isCurrentCompleted ? (
                    <Check className="size-3.5" />
                  ) : (
                    <List className="size-3.5" />
                  )}
                </div>
                <span className="font-semibold text-sm">{progressLabel}</span>
              </>
            )}
          </button>

          {allExercisesCompleted && (
            <motion.button
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onClick={() => setShowSummary(true)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl shadow-xs backdrop-blur-md transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <BarChart className="size-4" />
              <span className="font-semibold text-sm">View Summary</span>
            </motion.button>
          )}
          <WorkoutSummaryDrawer
            open={showSummary}
            onOpenChange={setShowSummary}
          />
        </motion.div>
      </AnimatePresence>
    </>
  )
}
