import { CreditCard, History, RefreshCw, Settings } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  useCreateCheckoutSession,
  useCustomerPortal,
} from '@/hooks/use-subscription'

import { BillingHistory } from './billing-history'
import { PlanManagement } from './plan-management'
import { SubscriptionStatusCard } from './subscription-status-card'

interface SubscriptionDashboardProps {
  userId: string
  availablePackages?: Array<{
    id: string
    name: string
    description?: string
    duration: string
    priceNOK: number
  }>
}

export function SubscriptionDashboard({
  userId,
  availablePackages = [],
}: SubscriptionDashboardProps) {
  const [selectedPackageId, setSelectedPackageId] = useState<string>('')

  const checkoutMutation = useCreateCheckoutSession()
  const portalMutation = useCustomerPortal()

  const handleUpgrade = () => {
    // If no packages available, redirect to pricing page or show package selection
    if (availablePackages.length === 0) {
      console.log('Redirect to pricing page')
      return
    }

    // If only one package, use it directly
    if (availablePackages.length === 1) {
      handleCreateCheckout(availablePackages[0].id)
      return
    }

    // Show package selection (you could implement a modal here)
    const defaultPackage =
      availablePackages.find((p) => p.duration === 'MONTHLY') ||
      availablePackages[0]
    handleCreateCheckout(defaultPackage.id)
  }

  const handleCreateCheckout = async (packageId: string) => {
    try {
      const result = await checkoutMutation.mutateAsync({
        userId,
        packageId,
        returnUrl: window.location.href,
        cancelUrl: window.location.href,
      })

      // Redirect to Stripe checkout
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      }
    } catch (error) {
      console.error('Failed to create checkout session:', error)
    }
  }

  const handleManageSubscription = async () => {
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

  return (
    <div className="space-y-6">
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
          <Card>
            <CardHeader>
              <CardTitle>Subscription Overview</CardTitle>
              <CardDescription>
                Quick overview of your subscription and features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-800 mb-2">
                    Premium Features
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Unlimited training plans</li>
                    <li>• Custom meal plans</li>
                    <li>• 1-on-1 coaching sessions</li>
                    <li>• Advanced analytics</li>
                    <li>• Priority support</li>
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

              {availablePackages.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Available Plans</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {availablePackages.map((pkg) => (
                      <div key={pkg.id} className="p-3 border rounded-lg">
                        <div className="font-medium">{pkg.name}</div>
                        <div className="text-sm text-gray-600">
                          {pkg.description}
                        </div>
                        <div className="text-sm font-medium text-blue-600 mt-1">
                          {pkg.priceNOK / 100} NOK /{' '}
                          {pkg.duration.toLowerCase()}
                        </div>
                        <Button
                          size="sm"
                          className="w-full mt-2"
                          onClick={() => handleCreateCheckout(pkg.id)}
                          disabled={checkoutMutation.isPending}
                        >
                          {checkoutMutation.isPending
                            ? 'Processing...'
                            : 'Subscribe'}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
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
              onClick={() => {
                // TODO: Link to support or help documentation
                console.log('Open support')
              }}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Get Help
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
