'use client'

import {
  CreditCard,
  ExternalLink,
  HelpCircle,
  RefreshCw,
  Settings,
} from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useCreateCheckoutSession,
  useCustomerPortal,
  useSubscriptionStatus,
} from '@/hooks/use-subscription'

import { BillingHistory } from './billing-history'
import { PlanManagement } from './plan-management'
import { SubscriptionStatusCard } from './subscription-status-card'

interface SubscriptionDashboardProps {
  userId: string
  availablePackages?: {
    id: string
    name: string
    description?: string
    duration: string
    priceNOK: number
    stripePriceIdNOK?: string
    stripePriceIdEUR?: string
    stripePriceIdUSD?: string
    stripeProductId?: string
    isActive?: boolean
    services?: {
      id: string
      serviceType: string
      quantity: number
    }[]
  }[]
}

export function SubscriptionDashboard({
  userId,
  availablePackages = [],
}: SubscriptionDashboardProps) {
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [showSupportModal, setShowSupportModal] = useState(false)
  const [error, setError] = useState<string>('')

  const checkoutMutation = useCreateCheckoutSession()
  const portalMutation = useCustomerPortal()
  const { data: subscriptionStatus } = useSubscriptionStatus(userId)

  const handleUpgrade = () => {
    setError('')

    // If no packages available, show helpful message
    if (availablePackages.length === 0) {
      setError(
        'No subscription packages are currently available. Please contact support.',
      )
      return
    }

    // If only one package, use it directly
    if (availablePackages.length === 1) {
      handleCreateCheckout(availablePackages[0].id)
      return
    }

    // Show package selection modal for multiple packages
    setShowPackageModal(true)
  }

  const handleCreateCheckout = async (packageId: string) => {
    setError('')
    setShowPackageModal(false)

    try {
      const result = await checkoutMutation.mutateAsync({
        userId,
        packageId,
        returnUrl: `${window.location.origin}/fitspace/settings?success=true`,
        cancelUrl: `${window.location.origin}/fitspace/settings?cancelled=true`,
      })

      // Redirect to Stripe checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      } else {
        setError('Failed to create checkout session. Please try again.')
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to create checkout session. Please try again.',
      )
    }
  }

  const handleManageSubscription = async () => {
    setError('')

    try {
      const result = await portalMutation.mutateAsync({
        userId,
        returnUrl: window.location.href,
      })

      // Redirect to Stripe customer portal
      if (result.url) {
        window.location.href = result.url
      } else {
        setError('Failed to open customer portal. Please try again.')
      }
    } catch (error) {
      console.error('Failed to open customer portal:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to open customer portal. Please try again.',
      )
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
    }).format(amount / 100)
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Status Card */}
      <SubscriptionStatusCard
        userId={userId}
        onManageSubscription={handleManageSubscription}
        onUpgrade={handleUpgrade}
      />

      {/* Detailed Management Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Manage
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Current Subscription Status */}
          {subscriptionStatus && (
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>
                  Your current subscription details and status
                </CardDescription>
              </CardHeader>
              <CardContent>
                {subscriptionStatus.hasPremiumAccess ? (
                  <div className="space-y-3">
                    {subscriptionStatus.subscription && (
                      <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-green-800">
                              {subscriptionStatus.subscription.package.name}
                            </h4>
                            <p className="text-sm text-green-700">
                              {subscriptionStatus.subscription.package.duration}{' '}
                              subscription
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium text-green-800">
                              Active
                            </div>
                            <div className="text-sm text-green-600">
                              {subscriptionStatus.daysRemaining} days remaining
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {subscriptionStatus.trial?.isActive && (
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="text-sm text-blue-800">
                          🎉 Trial active:{' '}
                          {subscriptionStatus.trial.daysRemaining} days
                          remaining
                        </div>
                      </div>
                    )}

                    {subscriptionStatus.gracePeriod?.isActive && (
                      <div className="p-3 bg-orange-50 rounded border border-orange-200">
                        <div className="text-sm text-orange-800">
                          ⚠️ Grace period:{' '}
                          {subscriptionStatus.gracePeriod.daysRemaining} days to
                          update payment
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-medium text-gray-800 mb-2">
                      No Active Subscription
                    </h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Subscribe to unlock all premium features
                    </p>
                    <Button
                      onClick={handleUpgrade}
                      disabled={checkoutMutation.isPending}
                    >
                      {checkoutMutation.isPending
                        ? 'Processing...'
                        : 'Subscribe Now'}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Premium Features</CardTitle>
              <CardDescription>
                What you get with your subscription
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Training & Coaching
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Unlimited training plans</li>
                    <li>• Custom meal plans</li>
                    <li>• 1-on-1 coaching sessions</li>
                    <li>• Progress tracking</li>
                    <li>• Expert guidance</li>
                  </ul>
                </div>

                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-800 mb-2">
                    Your Benefits
                  </h4>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• 14-day free trial</li>
                    <li>• Cancel anytime</li>
                    <li>• 3-day grace period</li>
                    <li>• Easy reactivation</li>
                    <li>• Secure payments</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {availablePackages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Available Plans</CardTitle>
                <CardDescription>
                  Choose a subscription plan that works for you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availablePackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="font-medium text-lg">{pkg.name}</div>
                      <div className="text-sm text-gray-600 mt-1">
                        {pkg.description || 'Premium subscription access'}
                      </div>
                      <div className="text-xl font-bold text-blue-600 mt-3">
                        {formatCurrency(pkg.priceNOK)}
                      </div>
                      <div className="text-sm text-gray-500">
                        per {pkg.duration.toLowerCase().replace('ly', '')}
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => handleCreateCheckout(pkg.id)}
                        disabled={checkoutMutation.isPending}
                      >
                        {checkoutMutation.isPending
                          ? 'Processing...'
                          : 'Subscribe Now'}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="billing">
          <BillingHistory userId={userId} />
        </TabsContent>

        <TabsContent value="manage">
          <PlanManagement userId={userId} />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common subscription management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button
              variant="outline"
              onClick={handleManageSubscription}
              disabled={portalMutation.isPending}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              {portalMutation.isPending
                ? 'Loading...'
                : 'Update Payment Method'}
            </Button>

            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Status
            </Button>

            <Button
              variant="outline"
              onClick={() => setShowSupportModal(true)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Get Help
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Package Selection Modal */}
      <Dialog open={showPackageModal} onOpenChange={setShowPackageModal}>
        <DialogContent className="sm:max-w-md" dialogTitle="Choose Your Plan">
          <DialogHeader>
            <DialogTitle>Choose Your Plan</DialogTitle>
            <DialogDescription>
              Select a subscription plan to get started with premium features
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {availablePackages.map((pkg) => (
              <div
                key={pkg.id}
                className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleCreateCheckout(pkg.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{pkg.name}</div>
                    <div className="text-sm text-gray-600">
                      {pkg.description || 'Premium subscription access'}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-blue-600">
                      {formatCurrency(pkg.priceNOK)}
                    </div>
                    <div className="text-sm text-gray-500">
                      per {pkg.duration.toLowerCase().replace('ly', '')}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPackageModal(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Support Modal */}
      <Dialog open={showSupportModal} onOpenChange={setShowSupportModal}>
        <DialogContent className="sm:max-w-md" dialogTitle="Help & Support">
          <DialogHeader>
            <DialogTitle>Help & Support</DialogTitle>
            <DialogDescription>
              Get help with your subscription and account
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="justify-start"
                onClick={() => {
                  window.open('mailto:support@hypertro.app', '_blank')
                  setShowSupportModal(false)
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Email Support
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => {
                  // TODO: Link to actual FAQ/documentation
                  window.open('/help/faq', '_blank')
                  setShowSupportModal(false)
                }}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQ & Documentation
              </Button>

              <Button
                variant="outline"
                className="justify-start"
                onClick={() => {
                  handleManageSubscription()
                  setShowSupportModal(false)
                }}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600">
                <strong>Need immediate help?</strong>
                <br />
                Email us at{' '}
                <a
                  href="mailto:support@hypertro.app"
                  className="text-blue-600 hover:underline"
                >
                  support@hypertro.app
                </a>
                <br />
                We typically respond within 24 hours.
              </p>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setShowSupportModal(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
