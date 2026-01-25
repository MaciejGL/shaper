'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerGoBackButton,
} from '@/components/ui/drawer'

import { TrainingPlanPreviewContent } from './training-plan-preview-content'
import { DrawerView, PublicPlan } from './types'
import { WorkoutDayPreviewContent } from './workout-day-preview-content'

interface UnifiedPreviewDrawerProps {
  initialView: DrawerView | null
  isOpen: boolean
  onClose: () => void
  onAnimationComplete?: () => void
  onStartWorkout: (dayId: string) => void
  isStarting: boolean
  onAssignTemplate: (planId: string) => void
  isAssigning: boolean
  availablePlans: PublicPlan[]
  hidePreviewPlan?: boolean
}

export function UnifiedPreviewDrawer({
  initialView,
  isOpen,
  onClose,
  onAnimationComplete,
  onStartWorkout,
  isStarting,
  onAssignTemplate,
  isAssigning,
  availablePlans,
  hidePreviewPlan = false,
}: UnifiedPreviewDrawerProps) {
  const [viewStack, setViewStack] = useState<DrawerView[]>([])
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')
  const [hasNavigated, setHasNavigated] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

  const currentView =
    viewStack.length > 0 ? viewStack[viewStack.length - 1] : initialView

  const handleNavigateToPlan = (planId: string) => {
    const fullPlan = availablePlans.find((p) => p.id === planId)

    if (!fullPlan) return

    setHasNavigated(true)
    setDirection('forward')
    setViewStack((prev) => [
      ...prev,
      {
        type: 'plan',
        data: fullPlan,
      },
    ])
  }

  const handleBack = () => {
    setDirection('back')
    setViewStack((prev) => prev.slice(0, -1))
  }

  const handleDrawerClose = () => {
    setIsClosing(true)
    onClose()
  }

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    // Only handle animation events from the DrawerContent itself, not from children (like Dialog)
    if (e.target !== e.currentTarget) return

    if (isClosing) {
      setViewStack([])
      setDirection('forward')
      setHasNavigated(false)
      setIsClosing(false)
      onAnimationComplete?.()
    }
  }

  const slideVariants = {
    enter: (direction: 'forward' | 'back') => ({
      x: direction === 'forward' ? '100%' : '-100%',
      scale: direction === 'forward' ? 1 : 0.95,
      //   opacity: direction === 'forward' ? 1 : 0,
      transition: {
        duration: 0.3,
      },
    }),
    center: {
      x: 0,
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.3,
      },
    },
    exit: (direction: 'forward' | 'back') => ({
      x: direction === 'forward' ? '-100%' : '100%',
      scale: direction === 'forward' ? 0.95 : 1,
      //   opacity: direction === 'forward' ? 0 : 1,
      transition: {
        duration: 0.3,
      },
    }),
  }

  const getTitle = () => {
    if (currentView?.type === 'plan') {
      return currentView.data.title
    }
    if (currentView?.type === 'workout') {
      return 'Workout Preview'
    }
    return 'Preview'
  }

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        // Only handle when closing (open === false)
        if (!open) {
          handleDrawerClose()
        }
      }}
      direction="right"
    >
      <DrawerContent
        className="data-[vaul-drawer-direction=right]:max-w-screen data-[vaul-drawer-direction=right]:w-screen overflow-hidden data-[vaul-drawer-direction=right]:border-l-0"
        dialogTitle={getTitle()}
        onAnimationEnd={handleAnimationEnd}
      >
        {viewStack.length > 0 && (
          <div className="dark absolute top-4 left-4 z-50">
            <Button
              size="icon-lg"
              variant="default"
              onClick={handleBack}
              iconOnly={<ArrowLeft />}
            >
              Workout
            </Button>
          </div>
        )}
        <DrawerGoBackButton />

        <div className="relative overflow-hidden h-full">
          {!isClosing ? (
            <AnimatePresence
              initial={false}
              mode="popLayout"
              custom={direction}
            >
              {currentView?.type === 'workout' && (
                <motion.div
                  key="workout"
                  custom={direction}
                  initial={hasNavigated ? 'enter' : false}
                  animate="center"
                  exit="exit"
                  variants={slideVariants}
                  transition={{
                    type: 'spring',
                    duration: 0.4,
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className="absolute inset-0 bg-background"
                >
                  <WorkoutDayPreviewContent
                    day={currentView.data}
                    onStartWorkout={onStartWorkout}
                    isStarting={isStarting}
                    onNavigateToPlan={handleNavigateToPlan}
                    onClose={handleDrawerClose}
                    hidePreviewPlan={hidePreviewPlan}
                  />
                </motion.div>
              )}

              {currentView?.type === 'plan' && (
                <motion.div
                  key="plan"
                  custom={direction}
                  initial={hasNavigated ? 'enter' : false}
                  animate="center"
                  exit="exit"
                  variants={slideVariants}
                  transition={{
                    type: 'spring',
                    duration: 0.4,
                    stiffness: 300,
                    damping: 30,
                    mass: 0.8,
                  }}
                  className="absolute inset-0 bg-background"
                >
                  <TrainingPlanPreviewContent
                    plan={currentView.data}
                    onAssignTemplate={onAssignTemplate}
                    onStartNow={() => {}}
                    isAssigning={isAssigning}
                    isStartingNow={false}
                    weeksData={currentView.data}
                    hideCloseButton={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="absolute inset-0 bg-background">
              {currentView?.type === 'workout' && (
                <WorkoutDayPreviewContent
                  day={currentView.data}
                  onStartWorkout={onStartWorkout}
                  isStarting={isStarting}
                  onNavigateToPlan={handleNavigateToPlan}
                  onClose={handleDrawerClose}
                />
              )}
              {currentView?.type === 'plan' && (
                <TrainingPlanPreviewContent
                  plan={currentView.data}
                  onAssignTemplate={onAssignTemplate}
                  onStartNow={() => {}}
                  isAssigning={isAssigning}
                  isStartingNow={false}
                  weeksData={currentView.data}
                />
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
