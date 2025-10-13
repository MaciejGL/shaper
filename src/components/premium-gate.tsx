'use client'

import { Crown, Lock, Sparkles } from 'lucide-react'

import { useUser } from '@/context/user-context'
import { useOpenUrl } from '@/hooks/use-open-url'
import { cn } from '@/lib/utils'

import { Badge } from './ui/badge'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

interface PremiumGateProps {
  children: React.ReactNode
  feature: string
  description?: string
  showPartialContent?: boolean
  compact?: boolean
  className?: string
}

export function PremiumGate({
  children,
  feature,
  description,
  showPartialContent = false,
  compact = false,
  className,
}: PremiumGateProps) {
  const { hasPremium, isLoading } = useUser()
  const { openUrl, isLoading: isOpeningUrl } = useOpenUrl({
    errorMessage: 'Failed to open subscription plans',
  })

  // If user has premium access, show the content
  if (hasPremium || isLoading) {
    return children
  }

  const handleViewPlans = () => {
    openUrl('/account-management')
  }

  // Show premium gate
  return (
    <div className={cn('container mx-auto max-w-md p-4', className)}>
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
        <CardHeader className="text-center">
          {!compact && (
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
          )}
          <CardTitle className="flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-amber-600" />
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
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <span>Unlimited training plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <span>Full meal plan access</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <span>Premium exercise library</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <span>Advanced analytics</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 space-y-3">
            <Button
              onClick={handleViewPlans}
              className="w-full"
              size={compact ? 'sm' : 'lg'}
              iconStart={<Crown />}
              variant="gradient"
              loading={isOpeningUrl}
              disabled={isOpeningUrl}
            >
              View Plans
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
