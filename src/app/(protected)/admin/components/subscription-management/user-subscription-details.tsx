'use client'

import { BillingStatus } from '@prisma/client'
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  useBillingHistory,
  useSubscriptionStatus,
} from '@/hooks/use-subscription'

import { AdminActions } from './admin-actions'
import { BillingHistoryPreview } from './billing-history-preview'

interface UserSubscriptionDetailsProps {
  userId: string
  onClear: () => void
  onActionComplete: (result: { success: boolean; message: string }) => void
}

export function UserSubscriptionDetails({
  userId,
  onClear,
  onActionComplete,
}: UserSubscriptionDetailsProps) {
  const { data: userSubscriptionStatus, isLoading: loadingUserStatus } =
    useSubscriptionStatus(userId)
  const { data: billingHistory, isLoading: loadingBilling } =
    useBillingHistory(userId)

  // Transform billing history to match component expectations
  const transformedBillingHistory = billingHistory
    ? {
        records: billingHistory.records.map((record) => ({
          ...record,
          type: 'SUBSCRIPTION' as const,
          createdAt: record.paidAt || record.periodStart,
        })),
        summary: {
          totalSpent: billingHistory.summary.totalPaid,
          successfulPayments: billingHistory.records.filter(
            (r) => r.status === BillingStatus.SUCCEEDED,
          ).length,
          failedPayments: billingHistory.records.filter(
            (r) => r.status === BillingStatus.FAILED,
          ).length,
        },
      }
    : undefined

  const openStripeCustomerPortal = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          returnUrl: window.location.href,
        }),
      })

      const result = await response.json()
      if (result.url) {
        window.open(result.url, '_blank')
      }
    } catch (err) {
      console.error('Error opening Stripe portal:', err)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Subscription Status for User: {userId}</span>
            <div className="flex gap-2">
              <Button variant="outline" onClick={openStripeCustomerPortal}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Stripe Portal
              </Button>
              <Button variant="outline" onClick={onClear}>
                <XCircle className="h-4 w-4 mr-2" />
                Clear
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingUserStatus ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2" />
              Loading subscription status...
            </div>
          ) : userSubscriptionStatus ? (
            <div className="space-y-4">
              {/* Premium Status */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Premium Access</div>
                  <div className="text-sm text-muted-foreground">
                    Current subscription status
                  </div>
                </div>
                <div className="text-right">
                  {userSubscriptionStatus.hasPremiumAccess ? (
                    <div className="bg-green-100 text-green-800 border-green-200 px-2 py-1 rounded text-sm">
                      <CheckCircle className="h-3 w-3 mr-1 inline" />
                      Premium Active
                    </div>
                  ) : (
                    <div className="bg-gray-100 text-gray-800 border-gray-200 px-2 py-1 rounded text-sm">
                      <XCircle className="h-3 w-3 mr-1 inline" />
                      No Premium
                    </div>
                  )}
                </div>
              </div>

              {/* Active Subscription */}
              {userSubscriptionStatus.subscription && (
                <div className="space-y-3">
                  <h4 className="font-medium">Current Subscription</h4>
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          {userSubscriptionStatus.subscription.package.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {userSubscriptionStatus.subscription.package.duration}{' '}
                          •{' '}
                          {formatCurrency(
                            userSubscriptionStatus.subscription.package
                              .priceNOK,
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {formatDate(
                            userSubscriptionStatus.subscription.startDate,
                          )}{' '}
                          -{' '}
                          {formatDate(
                            userSubscriptionStatus.subscription.endDate,
                          )}
                        </div>
                      </div>
                      <div className="text-right space-y-2">
                        <div className="text-sm px-2 py-1 rounded bg-green-100 text-green-800">
                          {userSubscriptionStatus.subscription.status}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {userSubscriptionStatus.daysRemaining} days remaining
                        </div>
                      </div>
                    </div>

                    <AdminActions
                      subscription={userSubscriptionStatus.subscription}
                      onActionComplete={onActionComplete}
                    />
                  </div>
                </div>
              )}

              {/* Trial and Grace Period Info */}
              {userSubscriptionStatus.trial?.isActive && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-2 text-blue-700 font-medium">
                    <Clock className="h-4 w-4" />
                    Trial Period Active
                  </div>
                  <p className="text-blue-600 text-sm mt-1">
                    {userSubscriptionStatus.trial.daysRemaining} days remaining
                  </p>
                </div>
              )}

              {userSubscriptionStatus.gracePeriod?.isActive && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-700 font-medium">
                    <AlertTriangle className="h-4 w-4" />
                    Grace Period Active
                  </div>
                  <p className="text-orange-600 text-sm mt-1">
                    {userSubscriptionStatus.gracePeriod.daysRemaining} days
                    remaining to update payment
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No subscription data found for this user
            </div>
          )}
        </CardContent>
      </Card>

      {/* Billing History */}
      <BillingHistoryPreview
        billingHistory={transformedBillingHistory}
        isLoading={loadingBilling}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
      />
    </div>
  )
}
