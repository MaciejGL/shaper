'use client'

import { Crown, Mail } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { cloneElement, isValidElement, useState } from 'react'

import { useOpenUrl } from '@/hooks/use-open-url'
import { usePaymentRules } from '@/hooks/use-payment-rules'
import { cn } from '@/lib/utils'

import { BiggyIcon } from './biggy-icon'
import { Button } from './ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip'

interface PremiumButtonWrapperProps {
  children: React.ReactElement
  hasPremium: boolean
  tooltipText?: string
  showIndicator?: boolean
}

/**
 * Wraps a button with premium indicator (crown badge + tooltip)
 * when user doesn't have premium access
 *
 * @example
 * ```tsx
 * <PremiumButtonWrapper
 *   hasPremium={hasPremium}
 *   tooltipText="Premium feature - Upgrade to add snapshots"
 * >
 *   <Button disabled={!hasPremium}>Add Snapshot</Button>
 * </PremiumButtonWrapper>
 * ```
 */
export function PremiumButtonWrapper({
  children,
  hasPremium,
  tooltipText = 'Premium feature required',
  showIndicator = true,
}: PremiumButtonWrapperProps) {
  const pathname = usePathname()
  const rules = usePaymentRules()
  const { openUrl, isLoading } = useOpenUrl({
    errorMessage: 'Failed to open subscription plans',
  })
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  // If user has premium, render button without wrapper
  if (hasPremium) {
    return children
  }

  // Don't show indicator, just render the disabled button
  if (!showIndicator) {
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

  // Clone the button element and add relative class + crown badge
  const buttonWithBadge = isValidElement<{
    className?: string
    children?: React.ReactNode
  }>(children)
    ? cloneElement(children, {
        ...children.props,
        className: cn(children.props.className, 'relative'),
        children: (
          <>
            {children.props.children}
            <div className="absolute -top-1 -right-1 bg-black rounded-full p-1.5">
              <Crown className="text-amber-400 !size-3" />
            </div>
          </>
        ),
      })
    : children

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {/* Wrap in span to make tooltip work with disabled buttons */}
        {buttonWithBadge}
      </TooltipTrigger>
      <TooltipContent className="flex flex-col items-center gap-2 p-4">
        <BiggyIcon icon={Crown} variant="amber" size="xs" />
        <p className="font-medium text-amber-400 text-base">Premium feature</p>
        <p className="text-xs">
          {rules.canShowUpgradeUI ? tooltipText : rules.premiumGateText}
        </p>

        {rules.canShowUpgradeUI ? (
          <Button
            variant="gradient"
            size="sm"
            className="w-full mt-4"
            onClick={handleViewPlans}
            loading={isLoading}
            disabled={isLoading}
          >
            Upgrade
          </Button>
        ) : emailSent ? (
          <p className="text-xs text-green-600 mt-2">Link sent to your email</p>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            className="w-full mt-4"
            onClick={handleSendAccessEmail}
            loading={isSendingEmail}
            disabled={isSendingEmail}
            iconStart={<Mail />}
          >
            Get access via email
          </Button>
        )}
      </TooltipContent>
    </Tooltip>
  )
}
