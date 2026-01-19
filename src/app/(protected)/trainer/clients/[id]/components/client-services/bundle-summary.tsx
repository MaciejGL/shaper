import { Percent, Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { TRAINER_CUSTOM_DISCOUNT_LIMITS } from '@/lib/stripe/discount-config'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'

import { BundleSummaryProps, SelectedPackageItem } from './types'
import {
  calculateBundleTotal,
  calculateDiscountAmount,
  findInPersonDiscountPercentage,
  formatPrice,
  getCurrencySymbol,
} from './utils'

const DISCOUNT_MONTH_OPTIONS = [
  { value: '1', label: '1 month' },
  { value: '2', label: '2 months' },
  { value: '3', label: '3 months' },
  { value: '6', label: '6 months' },
  { value: '12', label: '12 months' },
]

/**
 * Bundle summary component that shows selected packages, pricing breakdown, and send functionality
 */
export function BundleSummary({
  selectedPackages,
  personalMessage,
  setPersonalMessage,
  clientName,
  handleSendOffer,
  isLoading,
  onUpdateDiscount,
}: BundleSummaryProps) {
  // Find coaching packages that can have custom discounts
  const coachingPackages = selectedPackages.filter(
    (item) => item.package.stripeLookupKey === STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
  )
  const total = calculateBundleTotal(selectedPackages)
  const currencySymbol = getCurrencySymbol(total.currency)
  const bundleDiscount = findInPersonDiscountPercentage(
    selectedPackages.map((item) => item.package),
  )
  const discountAmount = calculateDiscountAmount(selectedPackages)
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Bundle Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Package Count */}
          <Card className="flex p-4">
            <div>
              <p className="font-medium">
                Packages selected:{' '}
                <span className="text-lg font-semibold">
                  {selectedPackages.length}
                </span>
              </p>
            </div>
            <div className="space-y-2">
              {total.oneTimeTotal > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    One-time payments:
                  </span>
                  <span className="text-lg font-semibold text-blue-600">
                    {total.currency === 'NOK'
                      ? `${total.oneTimeTotal.toFixed(2)} ${currencySymbol}`
                      : `${currencySymbol}${total.oneTimeTotal.toFixed(2)}`}
                  </span>
                </div>
              )}
              {total.monthlyTotal > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Monthly subscriptions:
                  </span>
                  <span className="text-lg font-semibold text-blue-600">
                    {total.currency === 'NOK'
                      ? `${total.monthlyTotal.toFixed(2)} ${currencySymbol}/month`
                      : `${currencySymbol}${total.monthlyTotal.toFixed(2)}/month`}
                  </span>
                </div>
              )}
              {/* Total discount amount saved in currency */}
              {discountAmount > 0 && (
                <div className="text-sm text-muted-foreground flex items-center justify-between mt-2 border-t pt-2">
                  <span>Discount applied:</span>
                  <span className="text-lg font-semibold text-muted-foreground">
                    {total.currency === 'NOK'
                      ? `-${discountAmount.toFixed(2)} ${currencySymbol}`
                      : `-${currencySymbol}${discountAmount.toFixed(2)}`}
                  </span>
                </div>
              )}
              <div className="text-sm text-muted-foreground flex items-center justify-between mt-2 border-t pt-2">
                <span>Total cost:</span>
                <span className="text-lg font-semibold text-green-600">
                  {total.currency === 'NOK'
                    ? `${(total.oneTimeTotal + total.monthlyTotal).toFixed(2)} ${currencySymbol}`
                    : `${currencySymbol}${(total.oneTimeTotal + total.monthlyTotal).toFixed(2)}`}
                </span>
              </div>
            </div>
          </Card>
          {/* Pricing Breakdown */}
          <Card className="p-4">
            {/* Selected Package Details */}
            <p className="text-sm font-medium text-muted-foreground">
              Bundle includes:
            </p>
            <ul className="space-y-1 list-disc list-inside">
              {selectedPackages.map((item) => (
                <li
                  key={item.packageId}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {item.package.name}
                    {item.quantity > 1 && ` × ${item.quantity}`}
                  </span>
                  <span className="text-muted-foreground">
                    {formatPrice(item.package, item.quantity, bundleDiscount)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        {/* Custom Discount Configuration for Coaching Packages */}
        {coachingPackages.length > 0 && onUpdateDiscount && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Percent className="size-4" />
                Promotional Discount
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Offer a limited-time discount to encourage {clientName} to start
                their coaching journey.
              </p>
              {coachingPackages.map((item) => (
                <CoachingDiscountConfig
                  key={item.packageId}
                  item={item}
                  onUpdateDiscount={onUpdateDiscount}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Personal Message */}
        <div className="space-y-2">
          <Textarea
            id="message"
            label="Personal Message (Optional)"
            variant="ghost"
            placeholder={`Hi ${clientName}! I've put together this custom training bundle specifically for your fitness goals. This package includes everything you need to succeed...`}
            value={personalMessage}
            onChange={(e) => setPersonalMessage(e.target.value)}
            rows={3}
          />
          <p className="text-xs text-muted-foreground">
            Add a personal touch to explain why you chose these specific
            packages for {clientName}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            onClick={handleSendOffer}
            disabled={isLoading}
            className="gap-2"
            loading={isLoading}
            iconStart={<Send />}
          >
            Send Bundle to {clientName}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface CoachingDiscountConfigProps {
  item: SelectedPackageItem
  onUpdateDiscount: (
    packageId: string,
    discountPercent?: number,
    discountMonths?: number,
  ) => void
}

function CoachingDiscountConfig({
  item,
  onUpdateDiscount,
}: CoachingDiscountConfigProps) {
  const hasDiscount = !!item.discountPercent && !!item.discountMonths

  const handleToggleDiscount = (enabled: boolean) => {
    if (enabled) {
      onUpdateDiscount(item.packageId, 25, 3) // Default: 25% for 3 months
    } else {
      onUpdateDiscount(item.packageId, undefined, undefined)
    }
  }

  const handlePercentChange = (value: string) => {
    const percent = parseInt(value, 10)
    if (isNaN(percent) || value === '') {
      return // Don't update on invalid input
    }
    // Clamp to valid range
    const clampedPercent = Math.max(
      TRAINER_CUSTOM_DISCOUNT_LIMITS.minPercent,
      Math.min(TRAINER_CUSTOM_DISCOUNT_LIMITS.maxPercent, percent),
    )
    onUpdateDiscount(item.packageId, clampedPercent, item.discountMonths || 3)
  }

  const handleMonthsChange = (value: string) => {
    const months = parseInt(value, 10)
    onUpdateDiscount(item.packageId, item.discountPercent || 25, months)
  }

  // Calculate discounted price preview
  const originalPrice = item.package.pricing?.amount || 0
  const discountedPrice = hasDiscount
    ? Math.round(originalPrice * (1 - (item.discountPercent || 0) / 100))
    : originalPrice
  const currency = item.package.pricing?.currency || 'NOK'
  const currencySymbol = getCurrencySymbol(currency)

  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={`discount-toggle-${item.packageId}`} className="text-sm">
          Apply discount to {item.package.name}
        </Label>
        <Switch
          id={`discount-toggle-${item.packageId}`}
          checked={hasDiscount}
          onCheckedChange={handleToggleDiscount}
        />
      </div>

      {hasDiscount && (
        <div className="space-y-3 pt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor={`discount-percent-${item.packageId}`} className="text-xs">
                Discount percentage
              </Label>
              <div className="relative">
                <Input
                  id={`discount-percent-${item.packageId}`}
                  type="number"
                  min={TRAINER_CUSTOM_DISCOUNT_LIMITS.minPercent}
                  max={TRAINER_CUSTOM_DISCOUNT_LIMITS.maxPercent}
                  value={item.discountPercent || 25}
                  onChange={(e) => handlePercentChange(e.target.value)}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  %
                </span>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`discount-months-${item.packageId}`} className="text-xs">
                Duration
              </Label>
              <Select
                value={String(item.discountMonths || 3)}
                onValueChange={handleMonthsChange}
              >
                <SelectTrigger id={`discount-months-${item.packageId}`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DISCOUNT_MONTH_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Price Preview */}
          <div className="rounded-md bg-muted/50 p-2 text-sm">
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">
                {currency === 'NOK'
                  ? `${(discountedPrice / 100).toFixed(0)} ${currencySymbol}`
                  : `${currencySymbol}${(discountedPrice / 100).toFixed(0)}`}
                /month
              </span>{' '}
              for {item.discountMonths} months ({item.discountPercent}% off)
            </p>
            <p className="text-xs text-muted-foreground">
              Then{' '}
              {currency === 'NOK'
                ? `${(originalPrice / 100).toFixed(0)} ${currencySymbol}`
                : `${currencySymbol}${(originalPrice / 100).toFixed(0)}`}
              /month after promotional period
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
