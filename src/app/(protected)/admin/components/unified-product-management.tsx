'use client'

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  RotateCw,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { ProductMetadataDiagnostics } from './product-metadata-diagnostics'

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
    lookup_key: string | null
  }[]
}

interface DatabaseProduct {
  id: string
  name: string
  description: string | null
  duration: string
  isActive: boolean
  stripeProductId: string | null
  stripeLookupKey: string | null
  trainerId: string | null
  trainer: {
    id: string
    name: string | null
    email: string
  } | null
  services: {
    serviceType: string
    quantity: number
  }[]
  activeSubscriptions: number
  createdAt: string
  updatedAt: string
}

interface UnifiedProduct {
  // Stripe data
  stripeId?: string
  stripeName?: string
  stripeDescription?: string | null
  stripeActive?: boolean
  stripeMetadata?: Record<string, string>
  stripeCreated?: number
  stripeUpdated?: number
  stripePrices?: StripeProduct['prices']

  // Database data
  dbId?: string
  dbName?: string
  dbDescription?: string | null
  dbActive?: boolean
  dbDuration?: string
  dbStripeLookupKey?: string | null
  dbTrainer?: DatabaseProduct['trainer']
  dbServices?: DatabaseProduct['services']
  dbActiveSubscriptions?: number
  dbCreatedAt?: string
  dbUpdatedAt?: string

  // Status
  syncStatus: 'synced' | 'stripe_only' | 'db_only' | 'out_of_sync'
  productType: 'premium' | 'trainer_service' | 'trainer_coaching' | 'unknown'
}

export function UnifiedProductManagement() {
  const [products, setProducts] = useState<UnifiedProduct[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch both Stripe products and database products in parallel
      const [stripeResponse, dbResponse] = await Promise.all([
        fetch('/api/admin/stripe/products'),
        fetch('/api/admin/package-templates'),
      ])

      if (!stripeResponse.ok || !dbResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const stripeData = await stripeResponse.json()
      const dbData = await dbResponse.json()

      const stripeProducts: StripeProduct[] = stripeData.products || []
      const dbProducts: DatabaseProduct[] = dbData.packageTemplates || []

      // Create unified view
      const unifiedProducts: UnifiedProduct[] = []

      // First, add all Stripe products
      stripeProducts.forEach((stripeProduct) => {
        const matchingDbProduct = dbProducts.find(
          (db) => db.stripeProductId === stripeProduct.id,
        )

        const productType = getProductType(stripeProduct.metadata)

        let syncStatus: UnifiedProduct['syncStatus'] = 'stripe_only'
        if (matchingDbProduct) {
          // Check if data is in sync - account for transformations during sync
          syncStatus = checkSyncStatus(stripeProduct, matchingDbProduct)
        }

        unifiedProducts.push({
          stripeId: stripeProduct.id,
          stripeName: stripeProduct.name,
          stripeDescription: stripeProduct.description,
          stripeActive: stripeProduct.active,
          stripeMetadata: stripeProduct.metadata,
          stripeCreated: stripeProduct.created,
          stripeUpdated: stripeProduct.updated,
          stripePrices: stripeProduct.prices,

          dbId: matchingDbProduct?.id,
          dbName: matchingDbProduct?.name,
          dbDescription: matchingDbProduct?.description,
          dbActive: matchingDbProduct?.isActive,
          dbDuration: matchingDbProduct?.duration,
          dbStripeLookupKey: matchingDbProduct?.stripeLookupKey,
          dbTrainer: matchingDbProduct?.trainer,
          dbServices: matchingDbProduct?.services,
          dbActiveSubscriptions: matchingDbProduct?.activeSubscriptions,
          dbCreatedAt: matchingDbProduct?.createdAt,
          dbUpdatedAt: matchingDbProduct?.updatedAt,

          syncStatus,
          productType,
        })
      })

      // Add database-only products (orphaned)
      dbProducts.forEach((dbProduct) => {
        const alreadyAdded = unifiedProducts.some(
          (up) => up.dbId === dbProduct.id,
        )

        if (!alreadyAdded) {
          unifiedProducts.push({
            dbId: dbProduct.id,
            dbName: dbProduct.name,
            dbDescription: dbProduct.description,
            dbActive: dbProduct.isActive,
            dbDuration: dbProduct.duration,
            dbStripeLookupKey: dbProduct.stripeLookupKey,
            dbTrainer: dbProduct.trainer,
            dbServices: dbProduct.services,
            dbActiveSubscriptions: dbProduct.activeSubscriptions,
            dbCreatedAt: dbProduct.createdAt,
            dbUpdatedAt: dbProduct.updatedAt,

            syncStatus: 'db_only',
            productType: 'unknown',
          })
        }
      })

      setProducts(unifiedProducts)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [])

  const syncProduct = async (stripeId: string) => {
    try {
      setSyncing(stripeId)

      const response = await fetch('/api/admin/stripe/sync-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: stripeId }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to sync product')
      }

      const result = await response.json()
      console.info('Sync result:', result)

      // Show success message
      const productTypeLabel =
        result.productType === 'trainer_service'
          ? '🎯 Trainer Service'
          : result.productType === 'trainer_coaching'
            ? '💼 Trainer Coaching'
            : '⭐ Premium'
      alert(
        `${result.isTestProduct ? '🧪 Test ' : ''}${productTypeLabel} Product ${result.action} successfully!\n\nName: ${result.packageTemplate.name}`,
      )

      // Refresh data
      await fetchData()
    } catch (err) {
      alert(
        `Sync failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      )
    } finally {
      setSyncing(null)
    }
  }

  const getProductType = (
    metadata: Record<string, string>,
  ): UnifiedProduct['productType'] => {
    if (metadata?.category === 'trainer_service') return 'trainer_service'
    if (metadata?.category === 'trainer_coaching') return 'trainer_coaching'
    if (metadata?.category === 'platform_premium') return 'premium'
    return 'unknown'
  }

  const checkSyncStatus = (
    stripeProduct: StripeProduct,
    dbProduct: DatabaseProduct,
  ): UnifiedProduct['syncStatus'] => {
    // Check if this is a test product
    const isTestProduct = stripeProduct.metadata?.env === 'test'

    // Expected name after sync transformation
    const expectedDbName = isTestProduct
      ? `[TEST] ${stripeProduct.name}`
      : stripeProduct.name

    // Expected description after sync transformation
    const expectedDbDescription = isTestProduct
      ? stripeProduct.description
        ? `[TEST ENVIRONMENT] ${stripeProduct.description}`
        : '[TEST ENVIRONMENT] Test product for development'
      : stripeProduct.description || null

    // Get the primary price lookup key (first active price)
    const expectedLookupKey =
      stripeProduct.prices.length > 0
        ? stripeProduct.prices[0].lookup_key
        : null

    // Check all important fields for sync status
    const nameMatches = dbProduct.name === expectedDbName
    const descriptionMatches = dbProduct.description === expectedDbDescription
    const activeMatches = dbProduct.isActive === stripeProduct.active
    const lookupKeyMatches = dbProduct.stripeLookupKey === expectedLookupKey
    const stripeIdMatches = dbProduct.stripeProductId === stripeProduct.id

    // Must have all key fields matching to be considered synced
    const isInSync =
      nameMatches &&
      descriptionMatches &&
      activeMatches &&
      lookupKeyMatches &&
      stripeIdMatches

    // Debug logging for out-of-sync products
    if (!isInSync) {
      console.info(`Product ${stripeProduct.name} sync status:`, {
        nameMatches: nameMatches,
        expectedName: expectedDbName,
        actualName: dbProduct.name,
        descriptionMatches: descriptionMatches,
        expectedDescription: expectedDbDescription,
        actualDescription: dbProduct.description,
        activeMatches: activeMatches,
        lookupKeyMatches: lookupKeyMatches,
        expectedLookupKey: expectedLookupKey,
        actualLookupKey: dbProduct.stripeLookupKey,
        stripeIdMatches: stripeIdMatches,
      })
    }

    return isInSync ? 'synced' : 'out_of_sync'
  }

  const formatCurrency = (amount: number | null, currency: string) => {
    if (!amount) return 'N/A'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100)
  }

  const getSyncStatusIcon = (status: UnifiedProduct['syncStatus']) => {
    switch (status) {
      case 'synced':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'out_of_sync':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'stripe_only':
        return <Clock className="h-4 w-4 text-blue-600" />
      case 'db_only':
        return <AlertTriangle className="h-4 w-4 text-red-600" />
    }
  }

  const getSyncStatusText = (status: UnifiedProduct['syncStatus']) => {
    switch (status) {
      case 'synced':
        return 'Synced'
      case 'out_of_sync':
        return 'Out of Sync'
      case 'stripe_only':
        return 'Stripe Only'
      case 'db_only':
        return 'DB Only'
    }
  }

  const getProductTypeLabel = (type: UnifiedProduct['productType']) => {
    switch (type) {
      case 'trainer_service':
        return {
          text: 'Trainer Service',
          variant: 'secondary' as const,
          className: 'text-green-600',
        }
      case 'trainer_coaching':
        return {
          text: 'Trainer Coaching',
          variant: 'secondary' as const,
          className: 'text-purple-600',
        }
      case 'premium':
        return {
          text: 'Premium',
          variant: 'secondary' as const,
          className: 'text-yellow-600',
        }
      default:
        return {
          text: 'Unknown',
          variant: 'secondary' as const,
          className: 'text-gray-600',
        }
    }
  }

  const filteredProducts = products.filter((product) => {
    const name = product.stripeName || product.dbName || ''
    const matchesName = name.toLowerCase().includes(filter.toLowerCase())
    const matchesStatus =
      statusFilter === 'all' || product.syncStatus === statusFilter
    return matchesName && matchesStatus
  })

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={fetchData}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Product Management</h2>
          <p className="text-gray-600">
            Unified view of active Stripe products and database package
            templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ProductMetadataDiagnostics />
          <Button
            onClick={fetchData}
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Total Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Synced</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {products.filter((p) => p.syncStatus === 'synced').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Needs Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {products.filter((p) => p.syncStatus === 'stripe_only').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Out of Sync</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {products.filter((p) => p.syncStatus === 'out_of_sync').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Label htmlFor="filter">Search products</Label>
          <Input
            id="filter"
            placeholder="Search by name..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
        <div className="w-48">
          <Label htmlFor="status">Sync Status</Label>
          <select
            id="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-10 px-3 py-2 text-sm border border-input bg-background rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <option value="all">All Statuses</option>
            <option value="synced">Synced</option>
            <option value="stripe_only">Stripe Only</option>
            <option value="out_of_sync">Out of Sync</option>
            <option value="db_only">DB Only</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Products ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">
                No products found matching your filters.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Sync Status</TableHead>
                  <TableHead>Pricing</TableHead>
                  <TableHead>Database Info</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => {
                  const productTypeInfo = getProductTypeLabel(
                    product.productType,
                  )
                  const name = product.stripeName || product.dbName || 'Unknown'
                  const description =
                    product.stripeDescription || product.dbDescription

                  return (
                    <TableRow key={product.stripeId || product.dbId}>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium">{name}</div>
                            {product.stripeMetadata?.env === 'test' && (
                              <Badge variant="equipment">TEST</Badge>
                            )}
                            {product.stripeActive && (
                              <Badge variant="secondary">
                                ACTIVE IN STRIPE
                              </Badge>
                            )}
                          </div>
                          {description && (
                            <div className="text-sm text-gray-500 mt-1 whitespace-pre-wrap">
                              {description}
                            </div>
                          )}
                          {product.stripeId && (
                            <div className="text-xs text-gray-400 mt-1">
                              Stripe ID: {product.stripeId}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={productTypeInfo.variant}
                          className={`text-xs ${productTypeInfo.className}`}
                        >
                          {productTypeInfo.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSyncStatusIcon(product.syncStatus)}
                          <span className="text-sm">
                            {getSyncStatusText(product.syncStatus)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.stripePrices &&
                        product.stripePrices.length > 0 ? (
                          <div className="space-y-1">
                            {product.stripePrices.map((price) => (
                              <div key={price.id} className="text-sm">
                                {formatCurrency(
                                  price.unit_amount,
                                  price.currency,
                                )}
                                {price.recurring && (
                                  <span className="text-gray-500">
                                    /{price.recurring.interval}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No pricing
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {product.dbId ? (
                          <div className="space-y-1">
                            <div className="text-sm">
                              <span className="font-medium">Active:</span>{' '}
                              {product.dbActive ? 'Yes' : 'No'}
                            </div>
                            {product.dbActiveSubscriptions !== undefined && (
                              <div className="text-sm">
                                <span className="font-medium">
                                  Subscriptions:
                                </span>{' '}
                                {product.dbActiveSubscriptions}
                              </div>
                            )}
                            {product.dbTrainer && (
                              <div className="text-sm">
                                <span className="font-medium">Trainer:</span>{' '}
                                {product.dbTrainer.name ||
                                  product.dbTrainer.email}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">
                            Not in database
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {product.stripeId && (
                            <Button
                              onClick={() => syncProduct(product.stripeId!)}
                              disabled={syncing === product.stripeId}
                              size="sm"
                              variant={
                                product.syncStatus === 'synced'
                                  ? 'outline'
                                  : 'default'
                              }
                              className="flex items-center gap-1"
                            >
                              <RotateCw className="h-3 w-3" />
                              {syncing === product.stripeId
                                ? 'Syncing...'
                                : product.syncStatus === 'synced'
                                  ? 'Re-sync'
                                  : 'Sync to DB'}
                            </Button>
                          )}
                          {product.stripeId && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() =>
                                window.open(
                                  `https://dashboard.stripe.com/products/${product.stripeId}`,
                                  '_blank',
                                )
                              }
                              className="flex items-center gap-1"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
