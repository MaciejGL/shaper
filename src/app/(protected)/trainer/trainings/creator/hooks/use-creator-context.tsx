'use client'

import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react'

type ViewMode = 'compact' | 'full'

const STORAGE_KEY = 'hypertro-creator-view-mode'

interface CreatorContextValue {
  viewMode: ViewMode
  setViewMode: (view: ViewMode) => void
}

const CreatorContext = createContext<CreatorContextValue | undefined>(undefined)

interface CreatorProviderProps {
  children: ReactNode
}

export function CreatorProvider({ children }: CreatorProviderProps) {
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    // Read from localStorage on initial load
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved === 'compact' || saved === 'full') {
        return saved
      }
    }
    return 'full'
  })

  // Save to localStorage whenever viewMode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, viewMode)
    }
  }, [viewMode])

  const value: CreatorContextValue = {
    viewMode,
    setViewMode,
  }

  return (
    <CreatorContext.Provider value={value}>{children}</CreatorContext.Provider>
  )
}

export function useCreatorContext(): CreatorContextValue {
  const context = useContext(CreatorContext)

  if (context === undefined) {
    throw new Error('useCreatorContext must be used within a CreatorProvider')
  }

  return context
}

export type { ViewMode }
