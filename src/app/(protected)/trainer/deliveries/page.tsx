'use client'

import {
  CheckCircle,
  Clock,
  Filter,
  Package,
  RefreshCw,
  User,
} from 'lucide-react'
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
import { DashboardHeader } from '@/components/ui/dashboard-header'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@/context/user-context'

interface ServiceDelivery {
  id: string
  serviceType: string
  packageName: string
  quantity: number
  status: string
  deliveredAt?: string | null
  deliveryNotes?: string
  stripePaymentIntentId: string
  createdAt: string
  updatedAt: string
  client: {
    id: string
    name?: string
    email: string
    displayName: string
  }
  metadata?: Record<string, unknown>
}

interface DeliverySummary {
  pending: number
  inProgress: number
  completed: number
  total: number
}

export default function DeliveriesPage() {
  const { user } = useUser()
  const [deliveries, setDeliveries] = useState<ServiceDelivery[]>([])
  const [summary, setSummary] = useState<DeliverySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchDeliveries = useCallback(async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({
        trainerId: user.id,
        status: statusFilter,
      })

      const response = await fetch(`/api/trainer/deliveries?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch deliveries')
      }

      const data = await response.json()
      setDeliveries(data.deliveries || [])
      setSummary(data.summary || null)
    } catch (err) {
      console.error('Error fetching deliveries:', err)
      setError(err instanceof Error ? err.message : 'Failed to load deliveries')
    } finally {
      setLoading(false)
    }
  }, [user?.id, statusFilter])

  const updateDeliveryStatus = async (
    deliveryId: string,
    newStatus: string,
    notes?: string,
  ) => {
    try {
      setUpdatingId(deliveryId)

      const response = await fetch(`/api/trainer/deliveries/${deliveryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
          ...(notes !== undefined && { deliveryNotes: notes }),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update delivery status')
      }

      // Refresh the list
      await fetchDeliveries()
    } catch (err) {
      console.error('Error updating delivery:', err)
      setError(err instanceof Error ? err.message : 'Failed to update delivery')
    } finally {
      setUpdatingId(null)
    }
  }

  useEffect(() => {
    fetchDeliveries()
  }, [fetchDeliveries])

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'IN_PROGRESS':
        return <RefreshCw className="h-4 w-4 text-blue-600" />
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Package className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'primary' as const
      case 'IN_PROGRESS':
        return 'secondary' as const
      case 'PENDING':
        return 'outline' as const
      default:
        return 'outline' as const
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    )
  }

  return (
    <div className="container mx-auto space-y-6">
      <DashboardHeader
        title="Service Deliveries"
        description="Track and manage service deliveries to your clients"
        icon={Package}
      />

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Pending</p>
                  <p className="text-2xl font-bold">{summary.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <RefreshCw className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">In Progress</p>
                  <p className="text-2xl font-bold">{summary.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Completed</p>
                  <p className="text-2xl font-bold">{summary.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-gray-600" />
                <div>
                  <p className="text-sm font-medium">Total</p>
                  <p className="text-2xl font-bold">{summary.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button
          onClick={fetchDeliveries}
          variant="outline"
          size="sm"
          iconStart={<RefreshCw />}
          disabled={loading}
        >
          Refresh
        </Button>
      </div>

      {/* Deliveries List */}
      <Card>
        <CardHeader>
          <CardTitle>Service Deliveries</CardTitle>
          <CardDescription>
            Manage and track the delivery of services to your clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader />
              <span className="ml-3 text-gray-600">Loading deliveries...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error}</p>
              <Button onClick={fetchDeliveries} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {!loading && !error && deliveries.length === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h4 className="text-lg font-semibold mb-2">
                No Deliveries Found
              </h4>
              <p className="text-gray-600">
                {statusFilter === 'all'
                  ? 'No service deliveries found.'
                  : `No ${statusFilter.toLowerCase()} deliveries found.`}
              </p>
            </div>
          )}

          {!loading && !error && deliveries.length > 0 && (
            <div className="space-y-4">
              {deliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  onUpdateStatus={updateDeliveryStatus}
                  isUpdating={updatingId === delivery.id}
                  getServiceTypeDisplay={getServiceTypeDisplay}
                  getStatusIcon={getStatusIcon}
                  getStatusBadgeVariant={getStatusBadgeVariant}
                  formatDate={formatDate}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Individual delivery card component
interface DeliveryCardProps {
  delivery: ServiceDelivery
  onUpdateStatus: (id: string, status: string, notes?: string) => Promise<void>
  isUpdating: boolean
  getServiceTypeDisplay: (type: string) => string
  getStatusIcon: (status: string) => JSX.Element
  getStatusBadgeVariant: (status: string) => 'primary' | 'secondary' | 'outline'
  formatDate: (date: string) => string
}

function DeliveryCard({
  delivery,
  onUpdateStatus,
  isUpdating,
  getServiceTypeDisplay,
  getStatusIcon,
  getStatusBadgeVariant,
  formatDate,
}: DeliveryCardProps) {
  const [notes, setNotes] = useState(delivery.deliveryNotes || '')
  const [expanded, setExpanded] = useState(false)

  const handleStatusUpdate = async (newStatus: string) => {
    await onUpdateStatus(delivery.id, newStatus, notes)
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            {getStatusIcon(delivery.status)}
            <div>
              <h4 className="font-semibold">
                {getServiceTypeDisplay(delivery.serviceType)}
              </h4>
              <p className="text-sm text-muted-foreground">
                {delivery.packageName}
                {delivery.quantity > 1 && ` (${delivery.quantity}x)`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant={getStatusBadgeVariant(delivery.status)}>
              {delivery.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>

        <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center space-x-1">
            <User className="h-3 w-3" />
            <span>{delivery.client.displayName}</span>
          </div>
          <span>•</span>
          <span>Created {formatDate(delivery.createdAt)}</span>
          {delivery.deliveredAt && (
            <>
              <span>•</span>
              <span>Completed {formatDate(delivery.deliveredAt)}</span>
            </>
          )}
        </div>

        {expanded && (
          <div className="space-y-3 pt-3 border-t">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Delivery Notes
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about the service delivery..."
                rows={3}
                disabled={isUpdating}
              />
            </div>

            <div className="flex items-center space-x-2">
              {delivery.status === 'PENDING' && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate('IN_PROGRESS')}
                  disabled={isUpdating}
                >
                  Start Delivery
                </Button>
              )}
              {delivery.status === 'IN_PROGRESS' && (
                <Button
                  size="sm"
                  onClick={() => handleStatusUpdate('COMPLETED')}
                  disabled={isUpdating}
                >
                  Mark Complete
                </Button>
              )}
              {delivery.status === 'COMPLETED' &&
                notes !== delivery.deliveryNotes && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusUpdate(delivery.status, notes)}
                    disabled={isUpdating}
                  >
                    Update Notes
                  </Button>
                )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setExpanded(false)}
              >
                Collapse
              </Button>
            </div>
          </div>
        )}

        {!expanded && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setExpanded(true)}
            className="mt-2"
          >
            Manage Delivery
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
