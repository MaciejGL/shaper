'use client'

import { Crown, Lock, Sparkles } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/user-context'

import { ButtonLink } from './ui/button-link'

interface PremiumGateProps {
  children: React.ReactNode
  feature: string
  description?: string
  showPartialContent?: boolean
  compact?: boolean
}

export function PremiumGate({
  children,
  feature,
  description,
  showPartialContent = false,
  compact = false,
}: PremiumGateProps) {
  const { hasPremium, isLoading } = useUser()

  // If user has premium access, show the content
  if (hasPremium || isLoading) {
    return children
  }

  // Show premium gate
  return (
    <div className="container mx-auto max-w-md p-4">
      {/* Show partial content if allowed */}
      {showPartialContent && (
        <div className="mb-6 opacity-50 pointer-events-none relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10 rounded-xl" />
          <div className="w-full max-h-[300px] rounded-xl overflow-hidden">
            {children}
          </div>
        </div>
      )}

      <Card className="border-2 border-dashed border-primary/20">
        <CardHeader className="text-center pb-4">
          {!compact && (
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
          )}
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-purple-600" />
            Premium Feature
          </CardTitle>
          {!compact && (
            <Badge variant="outline" className="w-fit mx-auto">
              <Sparkles className="w-3 h-3 mr-1" />
              {feature}
            </Badge>
          )}
        </CardHeader>

        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            {description ||
              `Access to ${feature.toLowerCase()} requires a Premium.`}
          </p>

          {!compact && (
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
          )}

          {!compact && (
            <div className="pt-4 space-y-3">
              <ButtonLink
                href="/fitspace/settings"
                className="w-full"
                iconStart={<Crown />}
              >
                Upgrade to Premium
              </ButtonLink>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
