'use client'

import { AlertTriangle, Clock, Crown } from 'lucide-react'

import { Badge, BadgeProps } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface SubscriptionState {
  type: 'none' | 'trial' | 'active' | 'grace_period' | 'cancelled' | 'expired'
  subscription?: {
    id: string
    status: string
    isActive: boolean
    daysUntilExpiry: number
    endDate?: string
    package?: {
      id: string
      name: string
      duration: string
    }
  }
  daysRemaining?: number
  isReactivationEligible?: boolean
}

interface CurrentPlanCardProps {
  hasPremium: boolean
  subscriptionState?: SubscriptionState
}

export function CurrentPlanCard({
  hasPremium,
  subscriptionState,
}: CurrentPlanCardProps) {
  // Get status text and details based on subscription state
  const getStatusDetails = (): {
    title: string
    description: string
    badge: string
    variant: BadgeProps['variant']
    icon: React.ElementType | null
  } => {
    if (!subscriptionState) {
      return {
        title: hasPremium ? 'Premium Plan' : 'Free Plan',
        description: hasPremium
          ? 'All features unlocked'
          : 'Basic features included',
        badge: hasPremium ? 'Premium' : 'Free',
        variant: hasPremium ? 'premium' : 'secondary',
        icon: hasPremium ? Crown : null,
      }
    }

    switch (subscriptionState.type) {
      case 'trial':
        return {
          title: 'Premium',
          description: `Trial active - ${subscriptionState.daysRemaining} days remaining`,
          badge: 'Premium',
          variant: 'premium',
          icon: Clock,
        }
      case 'active':
        return {
          title: 'Premium Plan',
          description: 'All features unlocked',
          badge: 'Active',
          variant: 'premium',
          icon: Crown,
        }
      case 'grace_period':
        return {
          title: 'Premium Plan',
          description: `Grace period - ${subscriptionState.daysRemaining} days to update payment`,
          badge: 'Grace Period',
          variant: 'destructive',
          icon: AlertTriangle,
        }
      case 'cancelled':
        return {
          title: 'Cancelled Subscription',
          description: 'Subscription cancelled - reactivate anytime',
          badge: 'Cancelled',
          variant: 'secondary',
          icon: null,
        }
      case 'expired':
        return {
          title: 'Expired Subscription',
          description: 'Subscription expired - upgrade to continue',
          badge: 'Expired',
          variant: 'secondary',
          icon: null,
        }
      default:
        return {
          title: 'Free Plan',
          description: 'Basic features included',
          badge: 'Free',
          variant: 'secondary',
          icon: null,
        }
    }
  }

  const statusDetails = getStatusDetails()
  const StatusIcon = statusDetails.icon

  return (
    <Card className="shadow-xs bg-card-on-card">
      <CardContent className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {statusDetails.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {statusDetails.description}
          </p>
        </div>
        <Badge
          variant={statusDetails.variant}
          className="px-4 py-2 text-sm font-medium"
        >
          {StatusIcon && <StatusIcon className="w-3 h-3 mr-1" />}
          {statusDetails.badge}
        </Badge>
      </CardContent>
    </Card>
  )
}
