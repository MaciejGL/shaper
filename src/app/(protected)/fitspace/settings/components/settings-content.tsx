'use client'

import { Bell, CreditCard, Shield, Sliders } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserWithSession } from '@/types/UserWithSession'

import { AccountSection } from './account-section'
import { NotificationSection } from './notification-section'
import { PreferencesSection } from './preferences-section'
import { SubscriptionSection } from './subscription-section'

interface SettingsContentProps {
  user: UserWithSession
}

export function SettingsContent({ user }: SettingsContentProps) {
  return (
    <div className="space-y-8 pb-24">
      {/* Preferences Section */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">General Preferences</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Customize your app experience
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <PreferencesSection />
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Notifications</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage how you receive updates
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <NotificationSection />
        </CardContent>
      </Card>

      {/* Subscription Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Subscription & Premium</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Upgrade to unlock advanced features
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <SubscriptionSection />
        </CardContent>
      </Card>

      {/* Account Management */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl text-red-600 dark:text-red-400">
                Account Management
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your account data and privacy
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <AccountSection user={user} />
        </CardContent>
      </Card>
    </div>
  )
}
