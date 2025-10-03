'use client'

import { ArrowLeftRight, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { ComponentType } from 'react'

import { Tabs, TabsList, TabsTrigger } from '../ui/tabs'

interface EnhancedBodyViewProps {
  selectedMuscleGroups: string[]
  onMuscleGroupClick: (muscleGroupId: string) => void
  muscleGroups: { id: string; alias?: string | null; groupSlug: string }[]
  className?: string
}

// Loading skeleton that matches the actual component layout
export function BodyViewSkeleton() {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Tabs skeleton */}
      <div className="flex justify-center">
        <Tabs className="flex space-x-1">
          <TabsList>
            <TabsTrigger value="front">Front</TabsTrigger>
            <TabsTrigger value="swap" disabled>
              <ArrowLeftRight className="size-3" />
            </TabsTrigger>
            <TabsTrigger value="back">Back</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Body diagram skeleton */}
      <div className="flex justify-center">
        <div className="h-96 w-64 rounded-lg flex-center">
          <Loader2 className="animate-spin" />
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
