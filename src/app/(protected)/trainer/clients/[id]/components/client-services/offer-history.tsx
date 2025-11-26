'use client'

import { CheckCircle, Clock, Copy, ExternalLink, XCircle } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Loader } from '@/components/loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface OfferHistoryProps {
  clientId: string
  trainerId: string
}

interface TrainerOffer {
  id: string
  token: string
  packageName: string
  packageDescription?: string
  amount: number
  currency: string
  type: 'one-time' | 'subscription'
  recurring?: {
    interval: string
    interval_count: number
  } | null
  status: string
  createdAt: string
  updatedAt: string
  expiresAt: string
  completedAt: string | null
  personalMessage: string | null
  clientEmail: string
  services: { serviceType: string; quantity: number }[]
  stripeLookupKey: string | null
}

export function OfferHistory({ clientId, trainerId }: OfferHistoryProps) {
  const [filter, setFilter] = useState<
    'all' | 'pending' | 'completed' | 'expired'
  >('all')
  const [search, setSearch] = useState('')
  const [offers, setOffers] = useState<TrainerOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clientEmail, setClientEmail] = useState<string>('')

  const fetchClientInfo = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/trainer/client-stats?clientId=${clientId}&trainerId=${trainerId}`,
      )
      if (response.ok) {
        const data = await response.json()
        setClientEmail(data.client.email)
      }
    } catch (err) {
      console.error('Error fetching client info:', err)
    }
  }, [clientId, trainerId])

  const fetchOffers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `/api/trainer/offers?clientEmail=${encodeURIComponent(clientEmail)}&trainerId=${trainerId}&status=${filter === 'all' ? '' : filter}`,
      )

      if (!response.ok) {
        throw new Error('Failed to fetch offers')
      }

      const data = await response.json()
      setOffers(data.offers || [])
    } catch (err) {
      console.error('Error fetching offers:', err)
      setError(err instanceof Error ? err.message : 'Failed to load offers')
    } finally {
      setLoading(false)
    }
  }, [clientEmail, trainerId, filter])

  useEffect(() => {
    // First, we need to get the client's email
    fetchClientInfo()
  }, [fetchClientInfo])

  useEffect(() => {
    if (clientEmail) {
      fetchOffers()
    }
  }, [clientEmail, fetchOffers])

  const filteredOffers = offers.filter((offer) => {
    const matchesSearch = offer.packageName
      .toLowerCase()
      .includes(search.toLowerCase())
    return matchesSearch
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (
    status: string,
  ): 'primary' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'completed':
        return 'primary'
      case 'pending':
        return 'secondary'
      case 'expired':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      NOK: 'kr',
      GBP: '£',
    }
    const symbol = symbols[currency] || currency
    const value = (amount / 100).toFixed(2)
    return currency === 'NOK' ? `${value} ${symbol}` : `${symbol}${value}`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Offer History</h3>
            <p className="text-sm text-muted-foreground">
              Track all offers sent to this client
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader />
          <span className="ml-3 text-muted-foreground">
            Loading offer history...
          </span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Offer History</h3>
            <p className="text-sm text-muted-foreground">
              Track all offers sent to this client
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <h4 className="text-lg font-semibold mb-2">
                Failed to Load Offers
              </h4>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchOffers} variant="outline">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const copyOfferLink = (token: string) => {
    const offerUrl = `${window.location.origin}/offer/${token}`
    navigator.clipboard.writeText(offerUrl)
    // TODO: Show toast notification
    alert('Offer link copied to clipboard!')
  }

  const openOfferLink = (token: string) => {
    const offerUrl = `${window.location.origin}/offer/${token}`
    window.open(offerUrl, '_blank')
  }

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`
    } else {
      return `${minutes}m remaining`
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Offer History</h3>
          <p className="text-sm text-muted-foreground">
            Track all offers sent to this client
          </p>
        </div>
      </div>

      {/* Filters */}

      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            label="Search Packages"
            id="search"
            placeholder="Search by package name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="space-y-2.5">
          <Label htmlFor="status">Status</Label>
          <Select
            value={filter}
            onValueChange={(value) =>
              setFilter(value as 'all' | 'pending' | 'completed' | 'expired')
            }
          >
            <SelectTrigger variant="ghost">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Offers</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Offers List */}
      <div className="space-y-4">
        {filteredOffers.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center flex-center flex-col gap-4 py-8">
                <h4 className="text-lg font-semibold mb-2">No offers found</h4>
                <p className="text-muted-foreground mb-4">
                  {filter === 'all'
                    ? "You haven't sent any offers to this client yet."
                    : `No ${filter} offers found.`}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredOffers.map((offer) => (
            <Card key={offer.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(offer.status)}
                      {offer.packageName}
                    </CardTitle>
                    <CardDescription>
                      {formatCurrency(offer.amount, offer.currency)}
                      {offer.type === 'subscription' &&
                        offer.recurring &&
                        `/${
                          offer.recurring.interval_count > 1
                            ? `${offer.recurring.interval_count} ${offer.recurring.interval}s`
                            : offer.recurring.interval
                        }`}{' '}
                      • Created {formatDate(offer.createdAt)}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(offer.status)}>
                      {offer.status}
                    </Badge>
                    {offer.status === 'pending' && (
                      <Badge variant="secondary">
                        {getTimeRemaining(offer.expiresAt)}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Personal Message */}
                  {offer.personalMessage && (
                    <div className="bg-card-on-card border-l-4 border-primary p-3 rounded">
                      <p className="text-sm mt-1">{offer.personalMessage}</p>
                    </div>
                  )}

                  {/* Offer Details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <span className="ml-2">
                        {formatDate(offer.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expires:</span>
                      <span className="ml-2">
                        {formatDate(offer.expiresAt)}
                      </span>
                    </div>
                    {offer.completedAt && (
                      <div>
                        <span className="text-muted-foreground">
                          Completed:
                        </span>
                        <span className="ml-2">
                          {formatDate(offer.completedAt)}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <span className="ml-2 capitalize">{offer.type}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end space-x-2 pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyOfferLink(offer.token)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Link
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openOfferLink(offer.token)}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Offer
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
