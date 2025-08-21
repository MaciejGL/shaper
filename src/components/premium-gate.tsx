'use client'

import { Crown, Lock, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useGetMySubscriptionStatusQuery } from '@/generated/graphql-client'

import { ButtonLink } from './ui/button-link'

interface PremiumGateProps {
  children: React.ReactNode
  feature: string
  description?: string
  showPartialContent?: boolean
}

export function PremiumGate({
  children,
  feature,
  description,
  showPartialContent = false,
}: PremiumGateProps) {
  const { data: subscriptionData, isLoading } =
    useGetMySubscriptionStatusQuery()

  const subscriptionStatus = subscriptionData?.getMySubscriptionStatus

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-32 mb-2"></div>
          <div className="h-3 bg-muted rounded w-24"></div>
        </div>
      </div>
    )
  }

  // If user has premium access, show the content
  if (
    subscriptionStatus?.hasPremium ||
    subscriptionStatus?.canAccessMealPlans
  ) {
    return <div className="w-full h-full">{children}</div>
  }

  // Show premium gate
  return (
    <div className="container mx-auto max-w-md p-4">
      {/* Show partial content if allowed */}
      {showPartialContent && (
        <div className="mb-6 opacity-50 pointer-events-none relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10" />
          <div className="w-full h-full">{children}</div>
        </div>
      )}

      <Card className="border-2 border-dashed border-primary/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            Premium Feature
          </CardTitle>
          <Badge variant="outline" className="w-fit mx-auto">
            <Sparkles className="w-3 h-3 mr-1" />
            {feature}
          </Badge>
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {description ||
              `Access to ${feature.toLowerCase()} requires a Premium subscription.`}
          </p>

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Premium includes:</h4>
            <div className="grid grid-cols-1 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                <span>Unlimited training plans</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                <span>Full meal plan access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                <span>Premium exercise library</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                <span>Advanced analytics</span>
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <ButtonLink
              href="/fitspace/settings"
              className="w-full"
              iconStart={<Crown />}
            >
              Upgrade to Premium
            </ButtonLink>

            <p className="text-xs text-muted-foreground">
              159 NOK/month • Cancel anytime
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
