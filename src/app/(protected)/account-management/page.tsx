'use client'

import { useQueryClient } from '@tanstack/react-query'
import { CreditCard, LogOut, UserRoundCogIcon } from 'lucide-react'
import { signOut } from 'next-auth/react'

import { MobileAppBanner } from '@/components/mobile-app-banner'
import { useMobileApp } from '@/components/mobile-app-bridge'
import { PostPaymentSuccessModal } from '@/components/post-payment-success-modal'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import { usePaymentRules } from '@/hooks/use-payment-rules'
import { usePostPaymentSuccess } from '@/hooks/use-post-payment-success'

import { AccountSection } from '../fitspace/settings/components/account-section'

import { ReturnToApp } from './components/return-to-app'
import { SubscriptionManagementSection } from './components/subscription-management-section'

export default function AccountManagementPage() {
  const { user } = useUser()
  const rules = usePaymentRules()
  const { isPostPayment, state, refetch } = usePostPaymentSuccess(user?.id)
  const { isNativeApp, setAuthToken } = useMobileApp()
  const queryClient = useQueryClient()

  // In companion mode, don't show "Subscription & Billing" header
  const isCompanionMode = !rules.canShowUpgradeUI && !rules.canLinkToPayment
  const isTrulyNative =
    typeof window !== 'undefined' &&
    (window.isNativeApp === true || !!window.nativeApp)

  const handleLogout = async () => {
    if (isNativeApp) {
      setAuthToken('')
    }
    queryClient.clear()
    await signOut({ callbackUrl: '/login', redirect: true })
  }

  return (
    <>
      {/* Success Modal */}
      <PostPaymentSuccessModal
        open={isPostPayment}
        state={state}
        onRefresh={() => refetch()}
      />

      {/* Page Content */}
      <div className="mx-auto">
        <div>
          {/* Header */}
          <div className="mb-8">
            {isNativeApp ? (
              <ReturnToApp variant="back" redirectUrl="/fitspace/workout" />
            ) : null}
            <div className="flex items-center flex-col mb-4 gap-4">
              <div className="size-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex-center shrink-0">
                <UserRoundCogIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col items-center text-center">
                <h1 className="text-3xl font-bold">Account Management</h1>
                <p className="text-muted-foreground">
                  {isCompanionMode
                    ? 'Manage your account settings'
                    : 'Manage your subscription, billing, and account settings'}
                </p>
              </div>
            </div>
            {!isTrulyNative ? (
              <div className="mx-auto my-10 w-full max-w-lg">
                <Alert variant="info">
                  <AlertTitle>You're viewing Hypro Web</AlertTitle>
                  <AlertDescription>
                    <p>
                      This page is for account management only. To train and log
                      workouts, use the Hypro mobile app.
                    </p>
                  </AlertDescription>
                </Alert>

                <p className="text-sm font-medium text-muted-foreground mt-4 text-center">
                  Download the Hypro App
                </p>
                <MobileAppBanner
                  alwaysShow
                  openAppPlacement="belowDownload"
                  openAppHelperText="Already installed? Open the app."
                  className="mt-4"
                  source="account_management"
                />
              </div>
            ) : null}
          </div>

          <div className="space-y-8 container-hypertro mx-auto">
            {isCompanionMode ? (
              // Companion mode: Show SubscriptionManagementSection directly without wrapper
              <SubscriptionManagementSection />
            ) : (
              // Full mode: Show with "Subscription & Billing" header
              <Card variant="secondary">
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-3">
                    <div className="size-10 bg-linear-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shrink-0 self-start">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        Subscription & Billing
                      </CardTitle>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        Manage your premium subscription and billing settings
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <SubscriptionManagementSection />
                </CardContent>
              </Card>
            )}

            <AccountSection />

            <div className="pb-12">
              <Button
                variant="secondary"
                size="lg"
                onClick={handleLogout}
                iconStart={<LogOut />}
                className="w-full"
              >
                Log out
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
