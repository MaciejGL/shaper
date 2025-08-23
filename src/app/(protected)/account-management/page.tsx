'use client'

import { CreditCard, UserRoundCogIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { AccountSection } from '../fitspace/settings/components/account-section'
import { SubscriptionSection } from '../fitspace/settings/components/subscription-section'

export default function AccountManagementPage() {
  return (
    <div className="mx-auto bg-gradient-to-br from-background via-background to-muted/30">
      <div>
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center flex-col mb-4">
            <div className="size-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex-center shrink-0">
              <UserRoundCogIcon className="w-6 h-6 text-black" />
            </div>
            <div className="flex flex-col items-center text-center">
              <h1 className="text-3xl font-bold">Account Management</h1>
              <p className="text-muted-foreground">
                Manage your subscription, billing, and account settings
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Subscription Management Section */}
          <Card variant="secondary">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="size-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shrink-0 self-start">
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
              <SubscriptionSection />
            </CardContent>
          </Card>

          <AccountSection />
        </div>
      </div>
    </div>
  )
}
