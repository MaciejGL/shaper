'use client'

import { Crown, Lock, Mail, Sparkles } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

import { useUser } from '@/context/user-context'
import { useOpenUrl } from '@/hooks/use-open-url'
import { usePaymentRules } from '@/hooks/use-payment-rules'
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
  const pathname = usePathname()
  const { hasPremium, isLoading, user } = useUser()
  const rules = usePaymentRules()
  const { openUrl, isLoading: isOpeningUrl } = useOpenUrl({
    errorMessage: 'Failed to open subscription plans',
  })
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const isAdmin = user?.email === 'm.glowacki01@gmail.com'

  // If user has premium access or is admin, show the content
  if (hasPremium || isLoading || isAdmin) {
    return children
  }

  const handleViewPlans = () => {
    openUrl(
      `/account-management/offers?redirectUrl=${encodeURIComponent(pathname)}`,
    )
  }

  const handleSendAccessEmail = async () => {
    setIsSendingEmail(true)
    try {
      const response = await fetch('/api/account/send-access-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'premium' }),
      })
      if (response.ok) {
        setEmailSent(true)
      }
    } catch (error) {
      console.error('Failed to send access email:', error)
    } finally {
      setIsSendingEmail(false)
    }
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
                  <span>Premium training plans</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <span>Premium exercise library</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <span>Exercise videos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
                  <span>Advanced analytics</span>
                </div>
              </div>
            </div>
          )}

          <div className="pt-4 space-y-3">
            {rules.canShowUpgradeUI ? (
            <Button
              onClick={handleViewPlans}
              className="w-full"
              size={compact ? 'sm' : 'lg'}
              iconStart={<Crown />}
              variant="gradient"
              loading={isOpeningUrl}
              disabled={isOpeningUrl}
            >
              Upgrade
            </Button>
            ) : (
              <>
                <p className="text-muted-foreground text-sm">
                  {rules.premiumGateText}
                </p>
                {emailSent ? (
                  <p className="text-sm text-green-600">
                    Access link sent to your email
                  </p>
                ) : (
                  <Button
                    onClick={handleSendAccessEmail}
                    className="w-full"
                    size={compact ? 'sm' : 'lg'}
                    iconStart={<Mail />}
                    variant="secondary"
                    loading={isSendingEmail}
                    disabled={isSendingEmail}
                  >
                    Get access via email
                  </Button>
                )}
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
