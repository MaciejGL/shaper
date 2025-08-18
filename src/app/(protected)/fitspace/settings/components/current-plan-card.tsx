'use client'

import { Crown } from 'lucide-react'

import { Badge } from '@/components/ui/badge'

interface CurrentPlanCardProps {
  hasPremium: boolean
}

export function CurrentPlanCard({ hasPremium }: CurrentPlanCardProps) {
  return (
    <div className="flex items-center justify-between shadow-xs p-6 bg-zinc-300 dark:bg-gray-600/50 rounded-lg">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Current Plan
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {hasPremium
            ? 'Premium Plan - All features unlocked'
            : 'Free Plan - Basic features included'}
        </p>
      </div>
      <Badge
        variant={hasPremium ? 'premium' : 'secondary'}
        className="px-4 py-2 text-sm font-medium"
      >
        {hasPremium ? (
          <>
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </>
        ) : (
          'Free'
        )}
      </Badge>
    </div>
  )
}
