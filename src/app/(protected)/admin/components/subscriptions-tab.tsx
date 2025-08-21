'use client'

import {
  AlertCircle,
  CreditCard,
  DollarSign,
  FileText,
  Loader2,
  RefreshCw,
  Settings,
  TrendingUp,
  Users,
} from 'lucide-react'
import { parseAsStringEnum } from 'nuqs'
import { useQueryState } from 'nuqs'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetSubscriptionStatsQuery } from '@/generated/graphql-client'

export function SubscriptionsTab() {
  // Use nuqs for subscription sub-tab persistence
  const [activeSubTab, setActiveSubTab] = useQueryState(
    'subTab',
    parseAsStringEnum<'overview' | 'management' | 'analytics'>([
      'overview',
      'management',
      'analytics',
    ])
      .withDefault('overview')
      .withOptions({ clearOnDefault: true }),
  )

  const {
    data: statsData,
    isLoading,
    error,
    refetch,
  } = useGetSubscriptionStatsQuery()

  const stats = statsData?.getSubscriptionStats

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
    }).format(amount / 100) // Convert from øre to NOK
  }

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100)
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>
            Error loading subscription data:{' '}
            {error instanceof Error ? error.message : 'Unknown error'}
          </span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                (stats?.totalActiveSubscriptions ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Premium users: {stats?.premiumUsers ?? 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Monthly Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                formatCurrency(stats?.monthlyRevenue ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              This month's recurring revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                formatCurrency(stats?.totalRevenue ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              All-time subscription revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Trainer Subscriptions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                (stats?.trainerSubscriptions ?? 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Subscriptions with trainers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Package Performance */}
      {stats?.packageStats && stats.packageStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Package Performance</CardTitle>
            <CardDescription>
              Revenue and conversion rates by subscription package
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.packageStats.map((packageStat) => (
                <div
                  key={packageStat.package.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">
                      {packageStat.package.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {packageStat.package.duration} •{' '}
                      {formatCurrency(packageStat.package.priceNOK)}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm font-medium">
                      {packageStat.activeSubscriptions} subscriptions
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatCurrency(packageStat.totalRevenue)} revenue
                    </div>
                    <Badge variant="outline">
                      {formatPercentage(packageStat.conversionRate)} conversion
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Admin Tabs */}
      <Tabs
        value={activeSubTab}
        onValueChange={(value) =>
          setActiveSubTab(value as 'overview' | 'management' | 'analytics')
        }
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="management" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Management
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {/* Content will be implemented separately */}
          <div className="text-center py-8 text-muted-foreground">
            Overview tab will display subscription list and filtering.
          </div>
        </TabsContent>

        <TabsContent value="management" className="mt-6">
          {/* Content will be implemented separately */}
          <div className="text-center py-8 text-muted-foreground">
            Management tab will display user search and subscription actions.
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          {/* Content will be implemented separately */}
          <div className="text-center py-8 text-muted-foreground">
            Analytics tab will display charts and statistics.
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
