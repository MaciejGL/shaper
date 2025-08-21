'use client'

import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface StripeProduct {
  id: string
  name: string
  description: string | null
  active: boolean
  metadata: Record<string, string>
  created: number
  updated: number
  prices: {
    id: string
    currency: string
    unit_amount: number | null
    recurring: {
      interval: string
      interval_count: number
    } | null
    type: string
    active: boolean
  }[]
}

interface StripeProductsViewProps {
  refreshTrigger: number
}

export function StripeProductsView({
  refreshTrigger,
}: StripeProductsViewProps) {
  const [products, setProducts] = useState<StripeProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/stripe/products')
      if (!response.ok) {
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const syncProduct = async (productId: string) => {
    try {
      setSyncing(productId)

      const response = await fetch('/api/admin/stripe/sync-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync product')
      }

      const result = await response.json()
      console.info('Sync result:', result)

      // Show detailed success message
      const envLabel = result.isTestProduct ? ' (TEST)' : ''
      alert(
        `${result.isTestProduct ? '🧪 Test ' : ''}Product ${result.action} successfully${envLabel}!\n\nName: ${result.packageTemplate.name}\nEnvironment: ${result.metadata.env}\nPrices: ${result.prices}`,
      )
    } catch (err) {
      alert(
        `Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      )
    } finally {
      setSyncing(null)
    }
  }

  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return 'N/A'

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString()
  }

  useEffect(() => {
    fetchProducts()
  }, [refreshTrigger])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={fetchProducts}>Retry</Button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No products found in Stripe</p>
        <Button onClick={fetchProducts}>Refresh</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prices</TableHead>
            <TableHead>Metadata</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <div>
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{product.name}</div>
                    {product.metadata?.env === 'test' && (
                      <Badge
                        variant="outline"
                        className="text-blue-600 text-xs"
                      >
                        🧪 TEST
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {product.description}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{product.id}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={product.active ? 'success' : 'secondary'}>
                  {product.active ? 'Active' : 'Inactive'}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {product.prices.map((price) => (
                    <div key={price.id} className="text-sm">
                      {formatCurrency(price.unit_amount, price.currency)}
                      {price.recurring && (
                        <span className="text-gray-500">
                          /{price.recurring.interval}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {Object.entries(product.metadata).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="font-medium">{key}:</span>{' '}
                      {key === 'env' && value === 'test' ? (
                        <span className="text-blue-600 font-medium">
                          🧪 {value}
                        </span>
                      ) : (
                        <span>{value}</span>
                      )}
                    </div>
                  ))}
                  {Object.keys(product.metadata).length === 0 && (
                    <span className="text-gray-400">No metadata</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">{formatDate(product.created)}</div>
              </TableCell>
              <TableCell>
                <Button
                  onClick={() => syncProduct(product.id)}
                  disabled={syncing === product.id}
                  size="sm"
                  variant="outline"
                >
                  {syncing === product.id ? 'Syncing...' : 'Sync to DB'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
