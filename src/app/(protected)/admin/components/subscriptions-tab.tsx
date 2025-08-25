'use client'

import { CreditCard, Crown, Search, Users } from 'lucide-react'
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
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  useGetAllUsersWithSubscriptionsQuery,
  useGetSubscriptionStatsQuery,
  useGiveLifetimePremiumMutation,
  useRemoveUserSubscriptionMutation,
} from '@/generated/graphql-client'

export function SubscriptionsTab() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const limit = 20

  // Fetch subscription stats
  const { data: statsData } = useGetSubscriptionStatsQuery()

  // Fetch users with subscriptions
  const {
    data: usersData,
    isLoading: usersLoading,
    refetch,
  } = useGetAllUsersWithSubscriptionsQuery({
    limit,
    offset: currentPage * limit,
    searchQuery: searchQuery || undefined,
  })

  // Mutations
  const giveLifetimeMutation = useGiveLifetimePremiumMutation()
  const removeSubscriptionMutation = useRemoveUserSubscriptionMutation()

  const handleGiveLifetime = async (userId: string) => {
    try {
      await giveLifetimeMutation.mutateAsync({ userId })
      refetch()
    } catch (error) {
      console.error('Failed to give lifetime subscription:', error)
    }
  }

  const handleRemoveSubscription = async (userId: string) => {
    try {
      await removeSubscriptionMutation.mutateAsync({ userId })
      refetch()
    } catch (error) {
      console.error('Failed to remove subscription:', error)
    }
  }

  const stats = statsData?.getSubscriptionStats

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Subscription Management
          </h2>
          <p className="text-muted-foreground">
            Manage user subscriptions and view subscription statistics
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Subscriptions
              </CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.usersWithActiveSubscriptions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
              <CreditCard className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {stats.usersWithExpiredSubscriptions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                No Subscription
              </CardTitle>
              <Users className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">
                {stats.usersWithoutSubscriptions}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lifetime</CardTitle>
              <Crown className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {stats.totalLifetimeSubscriptions}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Users & Subscriptions</CardTitle>
              <CardDescription>
                Manage user subscriptions and grant lifetime access
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-users"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-[250px]"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Subscription Status</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                      </TableCell>
                      <TableCell>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-20" />
                      </TableCell>
                      <TableCell>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                      </TableCell>
                      <TableCell>
                        <div className="h-8 bg-gray-200 rounded animate-pulse w-24" />
                      </TableCell>
                    </TableRow>
                  ))
                : usersData?.getAllUsersWithSubscriptions?.users?.map(
                    (user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">
                              {user.name || 'No name'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {user.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              user.role === 'TRAINER' ? 'primary' : 'secondary'
                            }
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.hasActiveSubscription ? (
                            <Badge
                              variant="success"
                              className="bg-green-100 text-green-800"
                            >
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">No Subscription</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {user.subscription?.endDate ? (
                            <div className="text-sm">
                              {new Date(
                                user.subscription.endDate,
                              ).toLocaleDateString()}
                              {new Date(user.subscription.endDate) >
                                new Date('2099-01-01') && (
                                <Crown className="inline h-4 w-4 ml-1 text-yellow-600" />
                              )}
                            </div>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {!user.hasActiveSubscription ? (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => handleGiveLifetime(user.id)}
                                disabled={giveLifetimeMutation.isPending}
                                className="bg-yellow-600 hover:bg-yellow-700"
                              >
                                <Crown className="h-4 w-4 mr-1" />
                                Give Lifetime
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  handleRemoveSubscription(user.id)
                                }
                                disabled={removeSubscriptionMutation.isPending}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {usersData?.getAllUsersWithSubscriptions && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {currentPage * limit + 1} to{' '}
                {Math.min(
                  (currentPage + 1) * limit,
                  usersData.getAllUsersWithSubscriptions.totalCount,
                )}{' '}
                of {usersData.getAllUsersWithSubscriptions.totalCount} users
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                  disabled={currentPage === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={
                    (currentPage + 1) * limit >=
                    usersData.getAllUsersWithSubscriptions.totalCount
                  }
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
