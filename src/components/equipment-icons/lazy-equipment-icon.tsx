'use client'

import dynamic from 'next/dynamic'
import { ComponentType, Suspense } from 'react'

import { Skeleton } from '@/components/ui/skeleton'
import { GQLEquipment } from '@/generated/graphql-client'

interface EquipmentIconProps {
  className?: string
}

// Icon loading skeleton
function IconSkeleton({ className }: { className?: string }) {
  return <Skeleton className={className || 'size-6 rounded'} />
}

// Create fallback component for equipment types without specific icons
const OtherIcon = dynamic(() => import('./individual/other-icon'), {
  loading: () => <IconSkeleton />,
  ssr: false,
})

// Lazy load individual equipment icons only when needed
const iconComponents: Record<
  GQLEquipment,
  ComponentType<EquipmentIconProps>
> = {
  [GQLEquipment.Band]: dynamic(() => import('./individual/band-icon'), {
    loading: () => <IconSkeleton />,
    ssr: false,
  }),
  [GQLEquipment.Barbell]: dynamic(() => import('./individual/barbell-icon'), {
    loading: () => <IconSkeleton />,
    ssr: false,
  }),
  [GQLEquipment.Bodyweight]: dynamic(
    () => import('./individual/bodyweight-icon'),
    {
      loading: () => <IconSkeleton />,
      ssr: false,
    },
  ),
  // Equipment types without specific icons - using 'other' as fallback
  [GQLEquipment.Cable]: dynamic(() => import('./individual/cable-icon'), {
    loading: () => <IconSkeleton />,
    ssr: false,
  }),
  [GQLEquipment.Dumbbell]: dynamic(() => import('./individual/dumbbell-icon'), {
    loading: () => <IconSkeleton />,
    ssr: false,
  }),

  [GQLEquipment.Kettlebell]: dynamic(
    () => import('./individual/kettlebell-icon'),
    {
      loading: () => <IconSkeleton />,
      ssr: false,
    },
  ),
  [GQLEquipment.Machine]: dynamic(() => import('./individual/machine-icon'), {
    loading: () => <IconSkeleton />,
    ssr: false,
  }),
  // Equipment types without specific icons - using 'other' as fallback
  [GQLEquipment.MedicineBall]: OtherIcon,
  [GQLEquipment.Other]: dynamic(() => import('./individual/other-icon'), {
    loading: () => <IconSkeleton />,
    ssr: false,
  }),
  [GQLEquipment.SmithMachine]: dynamic(
    () => import('./individual/smithmachine-icon'),
    {
      loading: () => <IconSkeleton />,
      ssr: false,
    },
  ),
  // Equipment types without specific icons - using 'other' as fallback
  [GQLEquipment.Mat]: OtherIcon,
  [GQLEquipment.PullUpBar]: OtherIcon,
  [GQLEquipment.ExerciseBall]: OtherIcon,
  [GQLEquipment.EzBar]: OtherIcon,
  [GQLEquipment.FoamRoller]: OtherIcon,
  [GQLEquipment.InclineBench]: OtherIcon,
  // Equipment types without specific icons - using 'other' as fallback
  [GQLEquipment.Bench]: OtherIcon,
}

interface LazyEquipmentIconProps {
  equipment: GQLEquipment
  className?: string
}

export function LazyEquipmentIcon({
  equipment,
  className,
}: LazyEquipmentIconProps) {
  const IconComponent = iconComponents[equipment]

  if (!IconComponent) {
    return <IconSkeleton className={className} />
  }

  return (
    <Suspense fallback={<IconSkeleton className={className} />}>
      <IconComponent className={className} />
    </Suspense>
  )
}
