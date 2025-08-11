'use client'

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

import { Skeleton } from '@/components/ui/skeleton'

interface EnhancedBodyViewProps {
  selectedMuscleGroups: string[]
  onMuscleGroupClick: (muscleGroupId: string) => void
  muscleGroups: { id: string; alias?: string | null; groupSlug: string }[]
  className?: string
}

// Loading skeleton that matches the actual component layout
function BodyViewSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Tabs skeleton */}
      <div className="flex space-x-1 bg-muted p-1 rounded-md">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 flex-1" />
      </div>

      {/* Body diagram skeleton */}
      <div className="flex justify-center">
        <Skeleton className="h-96 w-64 rounded-lg" />
      </div>

      {/* Optional muscle labels skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 mx-auto" />
        <div className="flex justify-center space-x-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-18" />
        </div>
      </div>
    </div>
  )
}

// Dynamically import the heavy EnhancedBodyView component
const EnhancedBodyView = dynamic(
  () =>
    import('./enhanced-body-view').then((mod) => ({
      default: mod.EnhancedBodyView,
    })) as Promise<{ default: ComponentType<EnhancedBodyViewProps> }>,
  {
    loading: () => <BodyViewSkeleton />,
    ssr: false, // Don't server-side render - it's interactive and heavy
  },
)

// Re-export with same interface
export { EnhancedBodyView as LazyEnhancedBodyView }
export type { EnhancedBodyViewProps }
