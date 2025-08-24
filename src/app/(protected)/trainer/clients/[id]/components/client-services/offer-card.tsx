'use client'

import {
  CheckCircle,
  Clock,
  Package,
  Tag,
  TrendingDown,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

// Enhanced interfaces for new offer structure
interface OfferPricing {
  originalAmount: number
  discountedAmount: number
  hasDiscount: boolean
  discountPercentage: number
  originalAmountCents: number
  discountedAmountCents: number
  discountAmountCents: number
}

interface OfferItem {
  id: string
  packageId: string
  quantity: number
  package: {
    id: string
    name: string
    description?: string
    services: {
      serviceType: string
      quantity: number
    }[]
    stripePriceId?: string
  }
  pricing: OfferPricing
}

interface OfferPricingSummary {
  totalOriginalAmount: number
  totalDiscountedAmount: number
  discountPercentage: number
  discountAmount: number
  currency: string
  totalOriginalAmountCents: number
  totalDiscountedAmountCents: number
  hasAnyDiscount: boolean
  savings: number
}

interface ClientOffer {
  id: string
  token: string
  status: string
  personalMessage?: string
  clientEmail: string
  createdAt: string
  updatedAt: string
  expiresAt: string
  completedAt?: string
  items: OfferItem[]
  pricing: OfferPricingSummary
  paymentDataSource?: 'stripe_payment' | 'theoretical' | 'no_items'
}

// Enhanced OfferCard component to display complete offers with discount information
interface OfferCardProps {
  offer: ClientOffer
  formatRelativeDate: (date: string) => string
}

export function OfferCard({ offer, formatRelativeDate }: OfferCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'expired':
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'primary' as const
      case 'pending':
        return 'secondary' as const
      case 'expired':
      case 'cancelled':
        return 'destructive' as const
      default:
        return 'outline' as const
    }
  }

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount)
  }

  const getServiceTypeDisplay = (serviceType: string) => {
    const mapping: Record<string, string> = {
      WORKOUT_PLAN: 'Workout Plan',
      MEAL_PLAN: 'Meal Plan',
      COACHING_COMPLETE: 'Complete Coaching',
      IN_PERSON_MEETING: 'In-Person Session',
      PREMIUM_ACCESS: 'Premium Access',
    }
    return mapping[serviceType] || serviceType
  }

  console.log(offer)

  return (
    <div className="border rounded-lg p-4 space-y-4">
      {/* Offer Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon(offer.status)}
          <div>
            <h4 className="font-semibold">
              Offer #{offer.token.slice(-8).toUpperCase()}
            </h4>
            <p className="text-sm text-muted-foreground">
              {formatRelativeDate(offer.createdAt)}
              {offer.completedAt &&
                ` • Completed ${formatRelativeDate(offer.completedAt)}`}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={getStatusBadgeVariant(offer.status)}>
            {offer.status}
          </Badge>
        </div>
      </div>

      {/* Personal Message */}
      {offer.personalMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">"{offer.personalMessage}"</p>
        </div>
      )}

      {/* Bundle Pricing Summary with Discount Info */}
      {offer.pricing.hasAnyDiscount && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <TrendingDown className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">
                Bundle Discount Applied ({offer.pricing.discountPercentage}%
                off)
              </span>
            </div>
            {offer.paymentDataSource === 'stripe_payment' && (
              <Badge variant="primary" className="text-xs">
                Actual Payment
              </Badge>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Original Price</p>
              <p className="font-semibold line-through text-gray-500">
                {formatCurrency(
                  offer.pricing.totalOriginalAmount,
                  offer.pricing.currency,
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Final Price</p>
              <p className="font-semibold text-green-700">
                {formatCurrency(
                  offer.pricing.totalDiscountedAmount,
                  offer.pricing.currency,
                )}
              </p>
            </div>
            <div>
              <p className="text-gray-600">You Saved</p>
              <p className="font-semibold text-green-700">
                {formatCurrency(offer.pricing.savings, offer.pricing.currency)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Package Items */}
      <div className="space-y-3">
        <h5 className="font-medium text-sm">Included Services:</h5>
        {offer.items.map((item) => (
          <Card key={item.id}>
            <CardContent>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <h6 className="font-medium">{item.package.name}</h6>
                  {item.quantity > 1 && (
                    <Badge variant="info" className="ml-auto">
                      x{item.quantity}
                    </Badge>
                  )}
                </div>

                <div className="flex flex-wrap gap-1">
                  {item.package.services.map((service, idx) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {getServiceTypeDisplay(service.serviceType)}
                      {service.quantity > 1 && ` (${service.quantity})`}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="text-right ml-4">
                {item.pricing.hasDiscount ? (
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Tag className="h-3 w-3 text-green-600" />
                      <span className="text-xs text-green-600 font-medium">
                        {item.pricing.discountPercentage}% OFF
                      </span>
                    </div>
                    <p className="text-sm line-through text-gray-500">
                      {formatCurrency(
                        item.pricing.originalAmount / 100,
                        offer.pricing.currency,
                      )}
                    </p>
                    <p className="font-semibold text-green-700">
                      {formatCurrency(
                        item.pricing.discountedAmount / 100,
                        offer.pricing.currency,
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="font-semibold">
                    {formatCurrency(
                      item.pricing.originalAmount / 100,
                      offer.pricing.currency,
                    )}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Total Price */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-semibold">Total Price:</span>
            {offer.paymentDataSource === 'stripe_payment' && (
              <Badge variant="primary" className="text-xs">
                Verified Payment
              </Badge>
            )}
            {offer.paymentDataSource === 'theoretical' && (
              <Badge variant="secondary" className="text-xs">
                Estimated
              </Badge>
            )}
          </div>
          <div className="text-right">
            {offer.pricing.hasAnyDiscount ? (
              <div className="space-y-1">
                <p className="text-sm line-through text-gray-500">
                  {formatCurrency(
                    offer.pricing.totalOriginalAmount,
                    offer.pricing.currency,
                  )}
                </p>
                <p className="text-lg font-bold text-green-700">
                  {formatCurrency(
                    offer.pricing.totalDiscountedAmount,
                    offer.pricing.currency,
                  )}
                </p>
              </div>
            ) : (
              <p className="text-lg font-bold">
                {formatCurrency(
                  offer.pricing.totalOriginalAmount,
                  offer.pricing.currency,
                )}
              </p>
            )}
          </div>
        </div>
        {offer.paymentDataSource === 'stripe_payment' && (
          <p className="text-xs text-green-600 mt-1">
            ✓ This shows the actual amount charged by Stripe
          </p>
        )}
      </div>
    </div>
  )
}
