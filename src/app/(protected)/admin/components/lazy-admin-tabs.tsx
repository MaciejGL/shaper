'use client'

import dynamic from 'next/dynamic'

import { Skeleton } from '@/components/ui/skeleton'

// Loading skeleton for admin tabs
function AdminTabSkeleton() {
  return (
    <div className="space-y-6">
      {/* Tab headers skeleton */}
      <div className="flex space-x-1 bg-muted p-1 rounded-md">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1" />
        ))}
      </div>

      {/* Tab content skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Lazy load admin tabs - these are heavy and only needed by admin users
const LazyUsersTab = dynamic(
  () => import('./users-tab').then((mod) => ({ default: mod.UsersTab })),
  {
    loading: () => <AdminTabSkeleton />,
    ssr: false,
  },
)

const LazyTrainersTab = dynamic(
  () => import('./trainers-tab').then((mod) => ({ default: mod.TrainersTab })),
  {
    loading: () => <AdminTabSkeleton />,
    ssr: false,
  },
)

const LazyExercisesTab = dynamic(
  () =>
    import('./exercises-tab').then((mod) => ({ default: mod.ExercisesTab })),
  {
    loading: () => <AdminTabSkeleton />,
    ssr: false,
  },
)

const LazyFoodsTab = dynamic(
  () => import('./foods-tab').then((mod) => ({ default: mod.FoodsTab })),
  {
    loading: () => <AdminTabSkeleton />,
    ssr: false,
  },
)

const LazyPushNotificationsTab = dynamic(
  () =>
    import('./push-notifications-tab').then((mod) => ({
      default: mod.PushNotificationsTab,
    })),
  {
    loading: () => <AdminTabSkeleton />,
    ssr: false,
  },
)

const LazyAwsTab = dynamic(
  () => import('./aws-tab').then((mod) => ({ default: mod.AwsTab })),
  {
    loading: () => <AdminTabSkeleton />,
    ssr: false,
  },
)

const LazySubscriptionsTab = dynamic(
  () =>
    import('./subscriptions-tab').then((mod) => ({
      default: mod.SubscriptionsTab,
    })),
  {
    loading: () => <AdminTabSkeleton />,
    ssr: false,
  },
)

export {
  LazyUsersTab,
  LazyTrainersTab,
  LazyExercisesTab,
  LazyFoodsTab,
  LazyPushNotificationsTab,
  LazyAwsTab,
  LazySubscriptionsTab,
}
