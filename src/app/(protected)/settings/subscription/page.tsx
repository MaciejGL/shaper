import { Suspense } from 'react'

import { SubscriptionDashboard } from '@/components/subscription'
import { Skeleton } from '@/components/ui/skeleton'

// This would typically come from your auth context or session
async function getUserId() {
  // TODO: Replace with your actual user authentication logic
  // Example: const session = await getServerSession()
  // return session?.user?.id
  return 'user-123' // Placeholder
}

// Example package data - this would typically come from your database
const availablePackages = [
  {
    id: 'premium-monthly',
    name: 'Premium Monthly',
    description: 'Full access to all features',
    duration: 'MONTHLY',
    priceNOK: 14900, // 149.00 NOK in cents
  },
  {
    id: 'premium-yearly',
    name: 'Premium Yearly',
    description: 'Full access to all features, save 17%',
    duration: 'YEARLY',
    priceNOK: 149000, // 1490.00 NOK in cents
  },
]

function SubscriptionPageLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px] mt-2" />
      </div>
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}

export default async function SubscriptionPage() {
  const userId = await getUserId()

  if (!userId) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
          <p className="text-gray-600">
            Please log in to manage your subscription.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Subscription</h1>
        <p className="text-gray-600 mt-2">
          Manage your subscription, billing, and premium features
        </p>
      </div>

      <Suspense fallback={<SubscriptionPageLoading />}>
        <SubscriptionDashboard
          userId={userId}
          availablePackages={availablePackages}
        />
      </Suspense>
    </div>
  )
}
