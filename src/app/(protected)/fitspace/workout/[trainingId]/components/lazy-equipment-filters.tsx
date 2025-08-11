'use client'

import dynamic from 'next/dynamic'
import { ComponentType, Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { GQLEquipment } from '@/generated/graphql-client'

type EquipmentFiltersProps = {
  selectedEquipment: GQLEquipment[]
  onEquipmentToggle: (equipment: GQLEquipment) => void
  equipment: GQLEquipment[]
  variant?: 'compact' | 'cards' | 'grid'
}

// Loading skeleton for equipment filters that matches each variant
function EquipmentFiltersSkeleton({
  variant = 'compact',
}: {
  variant?: 'compact' | 'cards' | 'grid'
}) {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="border rounded-lg p-2">
            <div className="space-y-2 text-center">
              <Skeleton className="h-24 w-24 mx-auto rounded" />
              <Skeleton className="h-4 w-16 mx-auto" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-16 w-full rounded-md" />
          </div>
        ))}
      </div>
    )
  }

  // Default compact variant skeleton
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-8 w-20 rounded-md" />
      ))}
    </div>
  )
}

// Dynamically import the equipment filters component
const EquipmentFiltersComponent = dynamic(
  () =>
    import('./equipment-filters').then((mod) => ({
      default: mod.EquipmentFilters,
    })) as Promise<{ default: ComponentType<EquipmentFiltersProps> }>,
  {
    ssr: false, // Client-side only since it's interactive
  },
)

// Wrapper component that handles loading state with proper variant
function LazyEquipmentFilters(props: EquipmentFiltersProps) {
  return (
    <Suspense fallback={<EquipmentFiltersSkeleton variant={props.variant} />}>
      <EquipmentFiltersComponent {...props} />
    </Suspense>
  )
}

export default LazyEquipmentFilters
export type { EquipmentFiltersProps }
