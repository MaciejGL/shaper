'use client'

import { CreditCard, ExternalLink, RotateCcw } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { AccountSection } from '../fitspace/settings/components/account-section'
import { SubscriptionSection } from '../fitspace/settings/components/subscription-section'

export default function AccountManagementPage() {
  return (
    <div className="container mx-auto min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <div className="overflow-y-auto min-h-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
              <ExternalLink className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Account Management</h1>
              <p className="text-muted-foreground">
                Manage your subscription, billing, and account settings
              </p>
            </div>
          </div>

          {/* Notice about external access */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs">ℹ</span>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  External Account Management
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  You are now viewing the external account management page. This
                  page contains sensitive account actions that are handled
                  outside of the mobile app for security and compliance reasons.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Subscription Management Section */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
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

          {/* Account Actions Section */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="pb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <RotateCcw className="w-5 h-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Account Data Management
                  </CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Reset your data or delete your account permanently
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <AccountSection />
            </CardContent>
          </Card>

          {/* Return to App Notice */}
          <div className="bg-muted/50 border rounded-lg p-6 text-center">
            <div className="max-w-md mx-auto">
              <h3 className="font-semibold mb-2">Return to the App</h3>
              <p className="text-sm text-muted-foreground mb-4">
                When you're finished managing your account, you can close this
                browser tab and return to the mobile app.
              </p>
              <button
                onClick={() => window.close()}
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Close Browser Tab
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
