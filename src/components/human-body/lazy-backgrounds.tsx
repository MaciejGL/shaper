'use client'

import dynamic from 'next/dynamic'

import { Skeleton } from '@/components/ui/skeleton'

// Lightweight skeleton for body backgrounds
function BodyBackgroundSkeleton() {
  return (
    <div className="relative w-full h-96">
      <Skeleton className="absolute inset-0 rounded-lg opacity-20" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-muted-foreground text-sm animate-pulse">
          Loading body diagram...
        </div>
      </div>
    </div>
  )
}

// Lazy load the massive 69KB front background
const FrontBackground = dynamic(
  () =>
    import('./body-front/background').then((mod) => ({
      default: mod.FrontBodyBackground,
    })),
  {
    loading: () => <BodyBackgroundSkeleton />,
    ssr: false, // Don't server-render these massive SVGs
  },
)

// Lazy load the massive 73KB back background
const BackBackground = dynamic(
  () =>
    import('./body-back/background').then((mod) => ({
      default: mod.BackBodyBackground,
    })),
  {
    loading: () => <BodyBackgroundSkeleton />,
    ssr: false, // Don't server-render these massive SVGs
  },
)

export {
  FrontBackground as LazyFrontBackground,
  BackBackground as LazyBackBackground,
}
