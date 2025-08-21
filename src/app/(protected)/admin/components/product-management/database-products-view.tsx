'use client'

import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface PackageTemplate {
  id: string
  name: string
  description: string | null
  priceNOK: number
  duration: string
  isActive: boolean
  stripeProductId: string | null
  stripePriceIdNOK: string | null
  stripePriceIdEUR: string | null
  stripePriceIdUSD: string | null
  trainerId: string | null
  trainer: {
    id: string
    name: string | null
    email: string
  } | null
  services: {
    id: string
    serviceType: string
    quantity: number
  }[]
  activeSubscriptions: number
  createdAt: string
  updatedAt: string
}

interface DatabaseProductsViewProps {
  refreshTrigger: number
}

export function DatabaseProductsView({
  refreshTrigger,
}: DatabaseProductsViewProps) {
  const [packageTemplates, setPackageTemplates] = useState<PackageTemplate[]>(
    [],
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    count: 0,
    activeCount: 0,
    stripeLinkedCount: 0,
  })

  const fetchPackageTemplates = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/package-templates')
      if (!response.ok) {
        throw new Error('Failed to fetch package templates')
      }

      const data = await response.json()
      setPackageTemplates(data.packageTemplates || [])
      setStats({
        count: data.count || 0,
        activeCount: data.activeCount || 0,
        stripeLinkedCount: data.stripeLinkedCount || 0,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
    }).format(amount / 100)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  useEffect(() => {
    fetchPackageTemplates()
  }, [refreshTrigger])

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <Button onClick={fetchPackageTemplates}>Retry</Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-800">{stats.count}</div>
          <div className="text-sm text-blue-600">Total Templates</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-800">
            {stats.activeCount}
          </div>
          <div className="text-sm text-green-600">Active Templates</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-800">
            {stats.stripeLinkedCount}
          </div>
          <div className="text-sm text-purple-600">Stripe Linked</div>
        </div>
      </div>

      {packageTemplates.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">No package templates found</p>
          <Button onClick={fetchPackageTemplates}>Refresh</Button>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Package</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stripe Integration</TableHead>
              <TableHead>Subscriptions</TableHead>
              <TableHead>Trainer</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {packageTemplates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{template.name}</div>
                      {template.name.startsWith('[TEST]') && (
                        <Badge
                          variant="outline"
                          className="text-blue-600 text-xs"
                        >
                          🧪 TEST
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {template.description}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {template.id}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    <Badge
                      variant={template.isActive ? 'success' : 'secondary'}
                    >
                      {template.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    <div className="text-xs text-gray-500">
                      {template.duration}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">
                    {formatCurrency(template.priceNOK)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {template.stripeProductId ? (
                      <>
                        <Badge variant="outline" className="text-green-600">
                          Linked
                        </Badge>
                        <div className="text-xs text-gray-500 space-y-1">
                          {template.stripePriceIdNOK && <div>NOK: ✓</div>}
                          {template.stripePriceIdEUR && <div>EUR: ✓</div>}
                          {template.stripePriceIdUSD && <div>USD: ✓</div>}
                        </div>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-gray-500">
                        Not Linked
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-center">
                    <div className="font-medium">
                      {template.activeSubscriptions}
                    </div>
                    <div className="text-xs text-gray-500">active</div>
                  </div>
                </TableCell>
                <TableCell>
                  {template.trainer ? (
                    <div>
                      <div className="text-sm font-medium">
                        {template.trainer.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {template.trainer.email}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-400">General</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {formatDate(template.createdAt)}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
