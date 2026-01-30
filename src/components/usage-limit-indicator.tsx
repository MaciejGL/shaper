'use client'

import { usePathname } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { useOpenUrl } from '@/hooks/use-open-url'
import { usePaymentRules } from '@/hooks/use-payment-rules'
import { cn } from '@/lib/utils'

import { Progress } from './ui/progress'

interface UsageLimitIndicatorProps {
  current: number
  limit: number
  label: string
  className?: string
}

export function UsageLimitIndicator({
  current,
  limit,
  label,
  className,
}: UsageLimitIndicatorProps) {
  const pathname = usePathname()
  const rules = usePaymentRules()
  const { openUrl, isLoading } = useOpenUrl({
    errorMessage: 'Failed to open subscription plans',
    openInApp: rules.canLinkToPayment,
  })

  const percentage = Math.min((current / limit) * 100, 100)
  const isAtLimit = current >= limit
  const isNearLimit = percentage >= 66

  const handleViewPlans = () => {
    openUrl(
      `/account-management/offers?redirectUrl=${encodeURIComponent(pathname)}`,
    )
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg bg-card-on-card dark:bg-muted',

        className,
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-medium text-muted-foreground">
            {label}
          </span>
          <span
            className={cn(
              'text-xs font-semibold tabular-nums',
              isAtLimit
                ? 'text-amber-600 dark:text-amber-400'
                : isNearLimit
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-foreground',
            )}
          >
            {current}/{limit}
          </span>
        </div>
        <Progress value={percentage} classNameIndicator="bg-amber-500" />
      </div>

      {isAtLimit && rules.canShowUpgradeUI && (
        <Button
          variant="secondary"
          size="xs"
          onClick={handleViewPlans}
          loading={isLoading}
          disabled={isLoading}
        >
          Upgrade
        </Button>
      )}
    </div>
  )
}
