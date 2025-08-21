'use client'

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Gift,
  RefreshCw,
  Shield,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import {
  useCancelSubscription,
  useCustomerPortal,
  useReactivateSubscription,
  useReactivationEligibility,
  useSubscriptionStatus,
} from '@/hooks/use-subscription'

interface PlanManagementProps {
  userId: string
}

export function PlanManagement({ userId }: PlanManagementProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelType, setCancelType] = useState<'immediate' | 'period_end'>(
    'period_end',
  )
  const [cancelReason, setCancelReason] = useState('')

  const { data: status, isLoading: statusLoading } =
    useSubscriptionStatus(userId)
  const { data: reactivationData, isLoading: reactivationLoading } =
    useReactivationEligibility(userId)

  const cancelMutation = useCancelSubscription()
  const reactivateMutation = useReactivateSubscription()
  const portalMutation = useCustomerPortal()

  const handleCancelSubscription = async () => {
    if (!status?.subscription?.id) return

    try {
      await cancelMutation.mutateAsync({
        userId,
        subscriptionId: status.subscription.id,
        cancelImmediately: cancelType === 'immediate',
        reason: cancelReason.trim() || undefined,
      })
      setShowCancelDialog(false)
      setCancelReason('')
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
    }
  }

  const handleReactivateSubscription = async (packageId: string) => {
    try {
      const result = await reactivateMutation.mutateAsync({
        userId,
        packageId,
        returnUrl: window.location.href,
      })

      // Redirect to Stripe checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      }
    } catch (error) {
      console.error('Failed to reactivate subscription:', error)
    }
  }

  const handleCustomerPortal = async () => {
    try {
      const result = await portalMutation.mutateAsync({
        userId,
        returnUrl: window.location.href,
      })

      // Redirect to Stripe customer portal
      if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error('Failed to open customer portal:', error)
    }
  }

  if (statusLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Active Subscription Management */}
      {status?.hasPremiumAccess && status.subscription && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-500" />
              Manage Your Subscription
            </CardTitle>
            <CardDescription>
              Control your {status.subscription.package.name} subscription
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <div className="font-medium text-green-800">
                  {status.subscription.package.name}
                </div>
                <div className="text-sm text-green-600">
                  {status.subscription.package.duration} • Active
                  {status.trial?.isActive && ' • In Trial'}
                  {status.gracePeriod?.isActive && ' • Grace Period'}
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle className="h-3 w-3 mr-1" />
                Active
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCustomerPortal}
                disabled={portalMutation.isPending}
                className="flex-1"
              >
                {portalMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Manage Payment Methods'
                )}
              </Button>

              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                disabled={cancelMutation.isPending}
                className="flex-1"
              >
                Cancel Subscription
              </Button>
            </div>

            {status.gracePeriod?.isActive && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Your subscription has payment issues. Please update your
                  payment method to avoid service interruption. You have{' '}
                  {status.gracePeriod.daysRemaining} days remaining.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reactivation Options */}
      {!status?.hasPremiumAccess && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Reactivate Subscription
            </CardTitle>
            <CardDescription>
              Restart your previous subscriptions or upgrade to Premium
            </CardDescription>
          </CardHeader>
          <CardContent>
            {reactivationLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[300px] mt-2" />
                    <Skeleton className="h-10 w-[120px] mt-4" />
                  </div>
                ))}
              </div>
            ) : reactivationData?.reactivationOptions &&
              reactivationData.reactivationOptions.length > 0 ? (
              <div className="space-y-4">
                {reactivationData.reactivationOptions.map((option) => (
                  <div key={option.packageId} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{option.package.name}</div>
                        <div className="text-sm text-gray-600">
                          {option.package.duration} subscription
                          {option.package.trainer && (
                            <> • with {option.package.trainer.fullName}</>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          {option.eligibility.trialEligible && (
                            <Badge
                              variant="outline"
                              className="bg-blue-50 text-blue-700 border-blue-200"
                            >
                              <Gift className="h-3 w-3 mr-1" />
                              14-day trial eligible
                            </Badge>
                          )}
                          <span className="text-xs text-gray-500">
                            Last active:{' '}
                            {new Date(
                              option.eligibility.lastSubscription.endDate,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <Button
                        onClick={() =>
                          handleReactivateSubscription(option.packageId)
                        }
                        disabled={reactivateMutation.isPending}
                      >
                        {reactivateMutation.isPending ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Reactivate
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No previous subscriptions to reactivate</p>
                <p className="text-sm">
                  Subscribe to Premium to access all features
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cancellation Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent
          dialogTitle="Cancel Subscription"
          className="sm:max-w-[425px]"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              Cancel Subscription
            </DialogTitle>
            <DialogDescription>
              Choose how you'd like to cancel your subscription. You can
              reactivate it anytime.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <RadioGroup
              value={cancelType}
              onValueChange={(value) =>
                setCancelType(value as 'immediate' | 'period_end')
              }
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="period_end" id="period_end" />
                <Label htmlFor="period_end" className="flex-1 cursor-pointer">
                  <div className="font-medium">Cancel at period end</div>
                  <div className="text-sm text-gray-600">
                    Keep access until{' '}
                    {status?.subscription &&
                      new Date(
                        status.subscription.endDate,
                      ).toLocaleDateString()}
                  </div>
                </Label>
                <Badge variant="outline">Recommended</Badge>
              </div>

              <div className="flex items-center space-x-2 p-3 border rounded-lg">
                <RadioGroupItem value="immediate" id="immediate" />
                <Label htmlFor="immediate" className="flex-1 cursor-pointer">
                  <div className="font-medium">Cancel immediately</div>
                  <div className="text-sm text-gray-600">
                    Lose access right away, no refund
                  </div>
                </Label>
              </div>
            </RadioGroup>

            <div>
              <Label htmlFor="reason">Reason for cancelling (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Help us improve by telling us why you're cancelling..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="mt-1"
              />
            </div>

            {cancelType === 'immediate' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You will lose access immediately and no refund will be issued.
                </AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCancelDialog(false)}
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelSubscription}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Cancelling...
                </>
              ) : (
                'Confirm Cancellation'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
