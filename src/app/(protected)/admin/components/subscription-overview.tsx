'use client'

import {
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  ExternalLink,
  MoreHorizontal,
  RefreshCw,
  Search,
  Users,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  GQLGetAllSubscriptionsQueryVariables,
  GQLSubscriptionStatus,
  useGetAllSubscriptionsQuery,
} from '@/generated/graphql-client'

export function SubscriptionOverview() {
  const [filters, setFilters] = useState<
    GQLGetAllSubscriptionsQueryVariables['filters']
  >({})
  const [searchTerm, setSearchTerm] = useState('')

  const {
    data: subscriptions,
    isLoading,
    error,
    refetch,
  } = useGetAllSubscriptionsQuery({
    filters: filters,
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string, isActive: boolean) => {
    if (status === 'ACTIVE' && isActive) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Active
        </Badge>
      )
    }
    if (status === 'PENDING') {
      return (
        <Badge variant="outline">
          <Clock className="h-3 w-3 mr-1" />
          Pending
        </Badge>
      )
    }
    if (status === 'CANCELLED') {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Cancelled
        </Badge>
      )
    }
    if (status === 'EXPIRED') {
      return (
        <Badge variant="secondary">
          <Calendar className="h-3 w-3 mr-1" />
          Expired
        </Badge>
      )
    }
    return <Badge variant="outline">{status}</Badge>
  }

  const getDaysUntilExpiryDisplay = (days: number, status: string) => {
    if (status !== 'ACTIVE') return null

    if (days < 0) {
      return (
        <span className="text-red-600 text-sm font-medium">
          Expired {Math.abs(days)} day(s) ago
        </span>
      )
    }
    if (days <= 7) {
      return (
        <span className="text-orange-600 text-sm font-medium">
          Expires in {days} day(s)
        </span>
      )
    }
    return (
      <span className="text-gray-600 text-sm">{days} day(s) remaining</span>
    )
  }

  const openStripeSubscription = (stripeSubscriptionId: string) => {
    window.open(
      `https://dashboard.stripe.com/subscriptions/${stripeSubscriptionId}`,
      '_blank',
    )
  }

  const openUserProfile = (userId: string) => {
    // TODO: Navigate to user profile page
    console.info('Navigate to user:', userId)
  }

  const filteredSubscriptions =
    subscriptions?.getAllSubscriptions?.filter((subscription) => {
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return (
          subscription.userId.toLowerCase().includes(searchLower) ||
          subscription.package.name.toLowerCase().includes(searchLower) ||
          subscription.id.toLowerCase().includes(searchLower)
        )
      }
      return true
    }) ?? []

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Overview</CardTitle>
          <CardDescription>
            Manage and monitor all user subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by user ID, package name, or subscription ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select
              value={filters?.status || 'all'}
              onValueChange={(value) =>
                setFilters((prev) => ({
                  ...prev,
                  status:
                    value === 'all'
                      ? undefined
                      : (value as GQLSubscriptionStatus),
                }))
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value={GQLSubscriptionStatus.Active}>
                  Active
                </SelectItem>
                <SelectItem value={GQLSubscriptionStatus.Pending}>
                  Pending
                </SelectItem>
                <SelectItem value={GQLSubscriptionStatus.Cancelled}>
                  Cancelled
                </SelectItem>
                <SelectItem value={GQLSubscriptionStatus.Expired}>
                  Expired
                </SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => refetch()}
              iconStart={<RefreshCw />}
            >
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Subscriptions ({filteredSubscriptions.length})</span>
            {isLoading && (
              <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-red-600">
              Error: {error instanceof Error ? error.message : 'Unknown error'}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Revenue</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map((subscription) => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <button
                            onClick={() => openUserProfile(subscription.userId)}
                            className="text-blue-600 hover:underline text-sm font-mono"
                          >
                            {subscription.userId.slice(0, 8)}...
                          </button>
                        </div>
                      </TableCell>

                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {subscription.package.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {subscription.package.duration} • From Stripe
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {getStatusBadge(
                          subscription.status,
                          subscription.isActive,
                        )}
                      </TableCell>

                      <TableCell className="text-sm">
                        {formatDate(subscription.startDate)}
                      </TableCell>

                      <TableCell className="text-sm">
                        {formatDate(subscription.endDate)}
                      </TableCell>

                      <TableCell>
                        {getDaysUntilExpiryDisplay(
                          subscription.daysUntilExpiry,
                          subscription.status,
                        )}
                      </TableCell>

                      <TableCell className="font-medium">From Stripe</TableCell>

                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() =>
                                openUserProfile(subscription.userId)
                              }
                            >
                              <Users className="h-4 w-4 mr-2" />
                              View User
                            </DropdownMenuItem>
                            {subscription.stripeSubscriptionId && (
                              <DropdownMenuItem
                                onClick={() =>
                                  openStripeSubscription(
                                    subscription.stripeSubscriptionId!,
                                  )
                                }
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View in Stripe
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <CreditCard className="h-4 w-4 mr-2" />
                              Manage Subscription
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredSubscriptions.length === 0 && !isLoading && (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || Object.keys(filters || {}).length > 0
                    ? 'No subscriptions match your search criteria'
                    : 'No subscriptions found'}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
