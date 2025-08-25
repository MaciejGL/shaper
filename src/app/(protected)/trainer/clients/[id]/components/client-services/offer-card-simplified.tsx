'use client'

import {
  CheckCircle,
  Clock,
  ExternalLink,
  Package,
  XCircle,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Simplified interfaces for new offer structure
interface SimplifiedClientOffer {
  id: string
  token: string
  status: string
  personalMessage?: string
  clientEmail: string
  createdAt: string
  updatedAt: string
  expiresAt: string
  completedAt?: string
  // Package info from simplified packageSummary JSON
  packageSummary?:
    | {
        packageId: string
        quantity: number
        name: string
      }[]
    | null
  // Payment data comes from Stripe if completed
  stripePaymentIntentId?: string | null
  actualPaymentData?: {
    amount: number
    currency: string
    description?: string
  } | null
  paymentDataSource: 'stripe_payment' | 'pending'
}

interface SimplifiedOfferCardProps {
  offer: SimplifiedClientOffer
  formatRelativeDate: (date: string) => string
}

export function SimplifiedOfferCard({
  offer,
  formatRelativeDate,
}: SimplifiedOfferCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
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
      case 'paid':
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
    }).format(amount / 100) // Convert from cents
  }

  const isPaid = offer.status === 'PAID' || offer.actualPaymentData
  const showPaymentData = isPaid && offer.actualPaymentData

  return (
    <Card className="relative">
      <CardContent className="p-6 space-y-4">
        {/* Offer Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(offer.status)}
            <div>
              <h4 className="font-semibold">
                Offer #{offer.token.slice(-8).toUpperCase()}
              </h4>
              <p className="text-sm text-muted-foreground">
                Created {formatRelativeDate(offer.createdAt)}
                {offer.completedAt &&
                  ` • Completed ${formatRelativeDate(offer.completedAt)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusBadgeVariant(offer.status)}>
              {offer.status}
            </Badge>
            {offer.paymentDataSource === 'stripe_payment' && (
              <Badge variant="primary" className="text-xs">
                Verified Payment
              </Badge>
            )}
          </div>
        </div>

        {/* Personal Message */}
        {offer.personalMessage && (
          <div className="bg-muted rounded-lg p-3">
            <p className="text-sm text-muted-foreground">
              "{offer.personalMessage}"
            </p>
          </div>
        )}

        {/* Package Summary */}
        {offer.packageSummary && offer.packageSummary.length > 0 && (
          <div className="space-y-3">
            <h5 className="font-medium text-sm">Package Contents:</h5>
            {offer.packageSummary.map((pkg, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-muted rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{pkg.name}</p>
                    {pkg.quantity > 1 && (
                      <p className="text-sm text-muted-foreground">
                        Quantity: {pkg.quantity}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Information */}
        {showPaymentData && (
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-muted-foreground">
                  Payment Received
                </span>
              </div>
              <Badge variant="primary" className="text-xs">
                Stripe Verified
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold">
                  {formatCurrency(
                    offer.actualPaymentData?.amount || 0,
                    offer.actualPaymentData?.currency || 'USD',
                  )}
                </span>
                {offer.actualPaymentData?.description && (
                  <span className="text-muted-foreground ml-2">
                    • {offer.actualPaymentData?.description}
                  </span>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                ✓ This shows the actual amount charged by Stripe
              </p>
            </div>
          </div>
        )}

        {/* Pending Payment */}
        {!isPaid && offer.status === 'PENDING' && (
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-muted-foreground">
                Awaiting Payment
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              Offer expires {formatRelativeDate(offer.expiresAt)}
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Open offer link in new tab
                window.open(`/offer/${offer.token}`, '_blank')
              }}
              iconStart={<ExternalLink />}
            >
              View Offer Page
            </Button>
          </div>
        )}

        {/* Expired/Cancelled */}
        {(offer.status === 'EXPIRED' || offer.status === 'CANCELLED') && (
          <div className="bg-muted rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">
                Offer {offer.status.toLowerCase()}
              </span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              {offer.status === 'EXPIRED'
                ? 'This offer has expired and can no longer be used.'
                : 'This offer was cancelled.'}
            </p>
          </div>
        )}

        {/* Stripe Payment Intent Link (for debugging) */}
        {offer.stripePaymentIntentId &&
          process.env.NODE_ENV === 'development' && (
            <div className="text-xs text-gray-500 border-t pt-2">
              Stripe Payment: {offer.stripePaymentIntentId}
            </div>
          )}
      </CardContent>
    </Card>
  )
}
