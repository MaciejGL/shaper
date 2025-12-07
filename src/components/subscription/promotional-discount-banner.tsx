'use client'

import { Percent } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { PromotionalDiscount } from '@/hooks/use-current-subscription'
import { formatPrice } from '@/types/subscription'

interface PromotionalDiscountBannerProps {
  discount: PromotionalDiscount
  className?: string
}

export function PromotionalDiscountBanner({
  discount,
  className,
}: PromotionalDiscountBannerProps) {
  const fullPrice = formatPrice(discount.fullPriceAmount, discount.currency)

  return (
    <div
      className={`rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2 ${className ?? ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Percent className="size-4 text-primary" />
          <span className="text-sm font-medium text-primary">
            Promotional Discount Active
          </span>
        </div>
        <Badge variant="secondary" className="bg-primary/10 text-primary">
          {discount.percentOff}% off
        </Badge>
      </div>
      <div className="space-y-1 text-sm">
        <p className="text-muted-foreground">
          You&apos;re saving {discount.percentOff}% on your coaching!
        </p>
        <p className="text-muted-foreground">
          {discount.monthsRemaining}{' '}
          {discount.monthsRemaining === 1 ? 'month' : 'months'} remaining at
          discounted rate
        </p>
        <p className="text-xs text-muted-foreground/80">
          Then: {fullPrice}/month
        </p>
      </div>
    </div>
  )
}

