import { Send } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'

import { BundleSummaryProps } from './types'
import {
  calculateBundleTotal,
  calculateDiscountAmount,
  findInPersonDiscountPercentage,
  formatPrice,
  getCurrencySymbol,
} from './utils'

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
}: BundleSummaryProps) {
  const total = calculateBundleTotal(selectedPackages)
  const currencySymbol = getCurrencySymbol(total.currency)
  const bundleDiscount = findInPersonDiscountPercentage(
    selectedPackages.map((item) => item.package),
  )
  const discountAmount = calculateDiscountAmount(selectedPackages)
  console.log({ selectedPackages, bundleDiscount, discountAmount })
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
