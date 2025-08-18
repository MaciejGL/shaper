'use client'

import { Bell, CreditCard, Shield, Sliders } from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { AccountSection } from './account-section'
import { NotificationSection } from './notification-section'
import { PreferencesSection } from './preferences-section'
import { SubscriptionSection } from './subscription-section'

interface SettingsContentProps {}

export function SettingsContent({}: SettingsContentProps) {
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
      <Card
        id="subscription-section"
        className="border-0 shadow-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 backdrop-blur-sm"
      >
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
      <AccountSection />

      {/* Legal & Privacy Section */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Legal & Privacy</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Important information about your rights and data
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/privacy"
              className="flex items-center p-4 rounded-lg border hover:border-primary transition-colors group"
            >
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                <span className="text-blue-600 dark:text-blue-400 text-sm font-bold">
                  🔒
                </span>
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  Privacy Policy
                </div>
                <div className="text-sm text-muted-foreground">
                  How we protect your data
                </div>
              </div>
            </Link>

            <Link
              href="/terms"
              className="flex items-center p-4 rounded-lg border hover:border-primary transition-colors group"
            >
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                <span className="text-purple-600 dark:text-purple-400 text-sm font-bold">
                  📋
                </span>
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  Terms of Service
                </div>
                <div className="text-sm text-muted-foreground">
                  Rules and guidelines
                </div>
              </div>
            </Link>

            <Link
              href="/support"
              className="flex items-center p-4 rounded-lg border hover:border-primary transition-colors group"
            >
              <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                <span className="text-green-600 dark:text-green-400 text-sm font-bold">
                  💬
                </span>
              </div>
              <div>
                <div className="font-semibold text-foreground">Support</div>
                <div className="text-sm text-muted-foreground">
                  Get help and FAQ
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
