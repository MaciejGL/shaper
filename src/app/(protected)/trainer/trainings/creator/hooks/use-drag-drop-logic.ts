import { Over, useDndContext } from '@dnd-kit/core'
import { useEffect, useMemo, useRef, useState } from 'react'

import { TrainingDay } from '../../../types'
import { throttle } from '../utils/throttle'

export function useDragDropLogic(day: TrainingDay) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [draggedOverIndex, setDraggedOverIndex] = useState<number | null>(null)

  // Use refs for values that don't need to trigger rerenders
  const isMouseOverColumnRef = useRef(false)
  const dragStateRef = useRef({
    isDragging: false,
    draggedExerciseId: null as string | null,
    draggedFromSameDay: false,
  })

  // Store throttled functions in refs so we can cancel them
  const calculateInsertionIndexRef = useRef<
    | (((over: Over, isMouseOver: boolean) => void) & { cancel: () => void })
    | null
  >(null)
  const throttledMouseMoveRef = useRef<
    (((e: MouseEvent) => void) & { cancel: () => void }) | null
  >(null)

  const { active, over } = useDndContext()

  // Memoize drag type calculations to prevent recalculation
  const dragInfo = useMemo(() => {
    if (!active) return null

    const isDraggingNewExercise = active.data.current?.type !== 'day-exercise'
    const isDraggingExistingExercise =
      active.data.current?.type === 'day-exercise'
    const isDraggingAnyItem =
      isDraggingNewExercise || isDraggingExistingExercise

    return {
      isDraggingNewExercise,
      isDraggingExistingExercise,
      isDraggingAnyItem,
    }
  }, [active])

  // Immediately clear insertion indicator when not dragging or when over changes to null
  useEffect(() => {
    if (!dragInfo?.isDraggingAnyItem || !over) {
      setDraggedOverIndex(null)
      // Cancel any pending throttled calls immediately
      if (calculateInsertionIndexRef.current) {
        calculateInsertionIndexRef.current.cancel()
      }
      if (throttledMouseMoveRef.current) {
        throttledMouseMoveRef.current.cancel()
      }
    }
  }, [dragInfo?.isDraggingAnyItem, over])

  // Create throttled insertion index calculation
  const calculateInsertionIndex = useMemo(() => {
    if (calculateInsertionIndexRef.current) {
      calculateInsertionIndexRef.current.cancel()
    }

    const throttledFunc = throttle(
      (over: Over | null, isMouseOver: boolean) => {
        if (
          !dragInfo?.isDraggingAnyItem ||
          !over ||
          day.isRestDay ||
          !isMouseOver
        ) {
          setDraggedOverIndex(null)
          return
        }

        // For existing exercises, check if we're dragging from the same day
        if (dragInfo.isDraggingExistingExercise) {
          const draggedExercise = active?.data.current?.exercise
          const isDraggingFromSameDay = day.exercises.some(
            (ex) => ex.id === draggedExercise?.id,
          )

          // If dragging from the same day, don't show indicators (handled by sortable)
          if (isDraggingFromSameDay) {
            setDraggedOverIndex(null)
            return
          }
        }

        // For empty days, show indicator at first position
        if (day.exercises.length === 0) {
          setDraggedOverIndex(0)
          return
        }

        const overData = over.data.current
        let insertIndex = null

        if (overData?.type === 'day-exercise') {
          // Find the exercise index in this day
          const exerciseIndex = day.exercises.findIndex(
            (ex) => ex.id === overData.exercise.id,
          )
          if (exerciseIndex !== -1) {
            insertIndex = exerciseIndex
          }
        } else if (over.id === day.id) {
          // Dropping directly on the day container
          insertIndex = day.exercises.length
        }

        setDraggedOverIndex(insertIndex)
      },
      16,
    ) // Reduce throttle delay to ~60fps for faster response

    calculateInsertionIndexRef.current = throttledFunc
    return throttledFunc
  }, [dragInfo, day, active])

  // Optimized mouse tracking with throttling
  useEffect(() => {
    // Clean up previous throttled function
    if (throttledMouseMoveRef.current) {
      throttledMouseMoveRef.current.cancel()
      document.removeEventListener('mousemove', throttledMouseMoveRef.current)
    }

    if (!dragInfo?.isDraggingAnyItem) {
      isMouseOverColumnRef.current = false
      return
    }

    const throttledMouseMove = throttle((e: MouseEvent) => {
      // Double-check we're still dragging to prevent race conditions
      if (!dragInfo?.isDraggingAnyItem) {
        setDraggedOverIndex(null)
        return
      }

      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      const isOver =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom

      const wasOver = isMouseOverColumnRef.current
      isMouseOverColumnRef.current = isOver

      // Only recalculate if mouse over state changed or we're currently over
      if (isOver !== wasOver || isOver) {
        calculateInsertionIndex(over, isOver)
      }
    }, 16) // Match the insertion calculation throttle

    throttledMouseMoveRef.current = throttledMouseMove
    document.addEventListener('mousemove', throttledMouseMove)

    return () => {
      if (throttledMouseMoveRef.current) {
        throttledMouseMoveRef.current.cancel()
        document.removeEventListener('mousemove', throttledMouseMoveRef.current)
      }
    }
  }, [dragInfo?.isDraggingAnyItem, calculateInsertionIndex, over])

  // Update drag state reference without causing rerenders
  useEffect(() => {
    dragStateRef.current = {
      isDragging: !!dragInfo?.isDraggingAnyItem,
      draggedExerciseId: active?.data.current?.exercise?.id || null,
      draggedFromSameDay: day.exercises.some(
        (ex) => ex.id === active?.data.current?.exercise?.id,
      ),
    }
  }, [dragInfo?.isDraggingAnyItem, active, day.exercises])

  // Cleanup on unmount or when active drag changes
  useEffect(() => {
    return () => {
      // Clean up all throttled functions on unmount
      if (calculateInsertionIndexRef.current) {
        calculateInsertionIndexRef.current.cancel()
      }
      if (throttledMouseMoveRef.current) {
        throttledMouseMoveRef.current.cancel()
      }
    }
  }, [])

  return {
    containerRef,
    draggedOverIndex,
    isDraggingNewExercise: dragInfo?.isDraggingNewExercise ?? false,
    isDraggingExistingExercise: dragInfo?.isDraggingExistingExercise ?? false,
  }
}
