'use client'

import {
  Bell,
  FileTextIcon,
  LockIcon,
  MessageCircleIcon,
  Shield,
  Sliders,
} from 'lucide-react'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { TrainerNotificationSection } from './trainer-notification-section'
import { TrainerPreferencesSection } from './trainer-preferences-section'

export function TrainerSettingsContent() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Preferences Section */}
      <Card className="border-0 shadow-xl col-span-2">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-3">
            <div className="size-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shrink-0 self-start">
              <Sliders className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">General Preferences</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Customize your trainer app experience
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <TrainerPreferencesSection />
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card className="border-0 shadow-xl col-span-2 lg:col-span-1">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-3">
            <div className="size-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shrink-0 self-start">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Notifications</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage how you receive client updates
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <TrainerNotificationSection />
        </CardContent>
      </Card>

      {/* Business & Profile Section */}
      <Card className="border-0 shadow-xl col-span-2 lg:col-span-1">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-3">
            <div className="size-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shrink-0 self-start">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">Business & Profile</CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage your trainer profile and business settings
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 gap-4">
            <Link
              href="/trainer/profile"
              className="flex items-center p-4 rounded-lg border hover:border-primary/50 transition-colors group"
            >
              <div className="size-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-700 transition-colors">
                <Shield className="size-4" />
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  Trainer Profile
                </div>
                <div className="text-sm text-muted-foreground">
                  Update your credentials and bio
                </div>
              </div>
            </Link>

            <Link
              href="/trainer/public-profile"
              className="flex items-center p-4 rounded-lg border hover:border-primary/50 transition-colors group"
            >
              <div className="size-8 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-700 transition-colors">
                <FileTextIcon className="size-4" />
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  Public Profile
                </div>
                <div className="text-sm text-muted-foreground">
                  How clients see your profile
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Legal & Privacy Section */}
      <Card className="border-0 shadow-xl col-span-2">
        <CardHeader className="pb-6">
          <div className="flex items-center space-x-3">
            <div className="size-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shrink-0 self-start">
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
              className="flex items-center p-4 rounded-lg border hover:border-primary/50 transition-colors group"
            >
              <div className="size-8 bg-blue-100 dark:bg-blue-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-700 transition-colors">
                <LockIcon className="size-4" />
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
              className="flex items-center p-4 rounded-lg border hover:border-primary/50 transition-colors group"
            >
              <div className="size-8 bg-purple-100 dark:bg-purple-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-700 transition-colors">
                <FileTextIcon className="size-4" />
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
              className="flex items-center p-4 rounded-lg border hover:border-primary/50 transition-colors group"
            >
              <div className="size-8 bg-green-100 dark:bg-green-800 rounded-lg flex items-center justify-center mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-700 transition-colors">
                <MessageCircleIcon className="size-4" />
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
