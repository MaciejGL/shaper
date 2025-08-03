'use client'

import { Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export function SubscriptionSection() {
  return (
    <div className="space-y-8">
      {/* Current Plan */}
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-600/50 rounded-lg">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Current Plan
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Free Plan - Basic features included
          </p>
        </div>
        <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
          Free
        </Badge>
      </div>

      {/* Upgrade Options */}
      <div className="space-y-6">
        <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Upgrade to Premium
        </h4>
        <div className="relative overflow-hidden bg-gradient-to-br from-purple-500 to-blue-600 p-8 rounded-lg text-white">
          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <h5 className="text-2xl font-bold">Premium Features</h5>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                <span className="text-sm">
                  Advanced training plans with detailed progression
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                <span className="text-sm">
                  Access to additional 400+ exercises library
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                <span className="text-sm">
                  Meal plan logging system with nutrition tracking
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                <span className="text-sm">
                  Unlimited plans assigned to your account
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                <span className="text-sm">
                  Advanced analytics on exercise progress
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-white rounded-full flex-shrink-0"></div>
                <span className="text-sm">
                  More detailed body measurements and tracking
                </span>
              </div>
            </div>
            <Button
              disabled
              variant="outline"
              className="w-full h-12 text-white border-white/30 hover:bg-white/10"
            >
              Premium Coming Soon
            </Button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        </div>
      </div>

      {/* Billing Information */}
      <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Billing Information
        </h4>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          No billing information on file. You're currently using the free tier
          with all basic features included.
        </p>
      </div>
    </div>
  )
}
