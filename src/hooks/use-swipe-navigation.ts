import { useCallback } from 'react'

interface UseSwipeNavigationProps<T> {
  items: T[]
  currentItem: T | null
  onItemChange: (item: T | null, direction: 'prev' | 'next') => void
  getId?: (item: T) => string | number
  canNavigateToNext?: (currentIndex: number) => boolean
  canNavigateToPrev?: (currentIndex: number) => boolean
  onNavigateToEnd?: () => void
  onNavigateToStart?: () => void
}

export function useSwipeNavigation<T>({
  items,
  currentItem,
  onItemChange,
  getId = (item: T) => (item as { id: string }).id,
  canNavigateToNext,
  canNavigateToPrev,
  onNavigateToEnd,
  onNavigateToStart,
}: UseSwipeNavigationProps<T>) {
  const currentIndex = currentItem
    ? items.findIndex((item) => getId(item) === getId(currentItem))
    : -1

  const handleSwipeLeft = useCallback(() => {
    // Swipe left = go to next item
    if (canNavigateToNext && !canNavigateToNext(currentIndex)) {
      onNavigateToEnd?.()
      return
    }

    if (currentIndex < items.length - 1) {
      const nextItem = items[currentIndex + 1]
      onItemChange(nextItem, 'next')
    } else {
      onNavigateToEnd?.()
    }
  }, [currentIndex, items, onItemChange, canNavigateToNext, onNavigateToEnd])

  const handleSwipeRight = useCallback(() => {
    // Swipe right = go to previous item
    if (canNavigateToPrev && !canNavigateToPrev(currentIndex)) {
      onNavigateToStart?.()
      return
    }

    if (currentIndex > 0) {
      const prevItem = items[currentIndex - 1]
      onItemChange(prevItem, 'prev')
    } else {
      onNavigateToStart?.()
    }
  }, [currentIndex, items, onItemChange, canNavigateToPrev, onNavigateToStart])

  const hasNext = currentIndex < items.length - 1
  const hasPrev = currentIndex > 0

  return {
    handleSwipeLeft,
    handleSwipeRight,
    currentIndex,
    hasNext,
    hasPrev,
  }
}

// Convenience hook for date-based navigation (days, weeks, etc.)
export function useDateSwipeNavigation({
  dates,
  currentDate,
  onDateChange,
}: {
  dates: string[]
  currentDate: string | null
  onDateChange: (date: string | null, direction: 'prev' | 'next') => void
}) {
  return useSwipeNavigation({
    items: dates,
    currentItem: currentDate,
    onItemChange: onDateChange,
    getId: (date: string) => date,
  })
}
