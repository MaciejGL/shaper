import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  Shield,
  XCircle,
} from 'lucide-react'

import { Badge, BadgeProps } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useSubscriptionStatus } from '@/hooks/use-subscription'

interface SubscriptionStatusCardProps {
  userId: string
  onManageSubscription?: () => void
  onUpgrade?: () => void
}

export function SubscriptionStatusCard({
  userId,
  onManageSubscription,
  onUpgrade,
}: SubscriptionStatusCardProps) {
  const { data: status, isLoading, error } = useSubscriptionStatus(userId)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <XCircle className="h-5 w-5" />
            Error Loading Subscription
          </CardTitle>
          <CardDescription>
            Unable to load subscription status. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (!status) return null

  const getStatusInfo = () => {
    switch (status.status) {
      case 'NO_SUBSCRIPTION':
        return {
          icon: <Shield className="h-5 w-5" />,
          title: 'No Active Subscription',
          description: 'Upgrade to Premium to unlock all features',
          badgeVariant: 'secondary' as BadgeProps['variant'],
          badgeText: 'Free Plan',
          showUpgrade: true,
        }
      case 'TRIAL':
        return {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          title: 'Free Trial Active',
          description: `${status.daysRemaining} days remaining in your trial`,
          badgeVariant: 'default' as BadgeProps['variant'],
          badgeText: 'Trial',
          showUpgrade: false,
        }
      case 'GRACE_PERIOD':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-orange-500" />,
          title: 'Payment Issue',
          description: `${status.daysRemaining} days remaining to update payment`,
          badgeVariant: 'destructive' as BadgeProps['variant'],
          badgeText: 'Grace Period',
          showUpgrade: false,
        }
      case 'ACTIVE':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          title: 'Premium Active',
          description: status.subscription
            ? `Your ${status.subscription.package.name} subscription`
            : 'Premium subscription active',
          badgeVariant: 'default' as BadgeProps['variant'],
          badgeText: 'Premium',
          showUpgrade: false,
        }
      case 'EXPIRED':
        return {
          icon: <XCircle className="h-5 w-5 text-red-500" />,
          title: 'Subscription Expired',
          description: 'Your subscription has expired. Reactivate to continue',
          badgeVariant: 'destructive' as BadgeProps['variant'],
          badgeText: 'Expired',
          showUpgrade: true,
        }
      default:
        return {
          icon: <Shield className="h-5 w-5" />,
          title: 'Unknown Status',
          description: 'Unable to determine subscription status',
          badgeVariant: 'secondary' as BadgeProps['variant'],
          badgeText: 'Unknown',
          showUpgrade: false,
        }
    }
  }

  const statusInfo = getStatusInfo()

  return (
    <Card
      className={`${status.hasPremiumAccess ? 'border-green-200 bg-green-50/50' : ''}`}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusInfo.icon}
            <CardTitle className="text-lg">{statusInfo.title}</CardTitle>
          </div>
          <Badge variant={statusInfo.badgeVariant}>
            {statusInfo.badgeText}
          </Badge>
        </div>
        <CardDescription>{statusInfo.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Premium Access Status */}
        <div className="flex items-center gap-2 text-sm">
          {status.hasPremiumAccess ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-green-700 font-medium">
                Premium features unlocked
              </span>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600">Premium features locked</span>
            </>
          )}
        </div>

        {/* Trial Information */}
        {status.trial?.isActive && (
          <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 font-medium text-sm">
              <Clock className="h-4 w-4" />
              Trial Period
            </div>
            <p className="text-blue-600 text-sm mt-1">
              {status.trial.daysRemaining} days remaining
            </p>
            <p className="text-blue-500 text-xs mt-1">
              Ends {new Date(status.trial.endDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Grace Period Warning */}
        {status.gracePeriod?.isActive && (
          <div className="p-3 bg-orange-50 rounded-md border border-orange-200">
            <div className="flex items-center gap-2 text-orange-700 font-medium text-sm">
              <AlertTriangle className="h-4 w-4" />
              Payment Required
            </div>
            <p className="text-orange-600 text-sm mt-1">
              {status.gracePeriod.daysRemaining} days remaining to update
              payment method
            </p>
            <p className="text-orange-500 text-xs mt-1">
              {status.gracePeriod.failedRetries} failed attempt(s)
            </p>
          </div>
        )}

        {/* Subscription Details */}
        {status.subscription && (
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {status.subscription.package.duration.toLowerCase()}{' '}
                subscription
              </span>
            </div>
            {status.expiresAt && (
              <p className="text-xs text-gray-500 ml-6">
                {status.status === 'ACTIVE' ? 'Renews' : 'Expires'} on{' '}
                {new Date(status.expiresAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {statusInfo.showUpgrade && onUpgrade && (
            <Button onClick={onUpgrade} className="flex-1">
              {status.status === 'EXPIRED'
                ? 'Reactivate'
                : 'Upgrade to Premium'}
            </Button>
          )}

          {status.hasPremiumAccess && onManageSubscription && (
            <Button
              variant="outline"
              onClick={onManageSubscription}
              className="flex-1"
            >
              Manage Subscription
            </Button>
          )}
        </div>

        {/* Days Remaining Indicator */}
        {status.daysRemaining > 0 && status.status !== 'NO_SUBSCRIPTION' && (
          <div className="text-center text-xs text-gray-500 pt-2 border-t">
            {status.daysRemaining} day{status.daysRemaining !== 1 ? 's' : ''}{' '}
            remaining
          </div>
        )}
      </CardContent>
    </Card>
  )
}
