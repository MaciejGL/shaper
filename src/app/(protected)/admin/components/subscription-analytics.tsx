'use client'

import {
  BarChart3,
  DollarSign,
  Download,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
} from 'recharts'

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
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AnalyticsData {
  overview: {
    totalSubscriptions: number
    activeSubscriptions: number
    monthlyRecurringRevenue: number
    averageRevenuePerUser: number
    churnRate: number
    growthRate: number
  }
  revenueByMonth: {
    month: string
    revenue: number
    subscriptions: number
  }[]
  packagePerformance: {
    packageId: string
    packageName: string
    subscriptions: number
    revenue: number
    conversionRate: number
    churnRate: number
  }[]
  trainerPerformance: {
    trainerId: string
    trainerName: string
    subscriptions: number
    revenue: number
    clientRetention: number
  }[]
}

export function SubscriptionAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('6m') // 1m, 3m, 6m, 1y, all

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Simulate analytics data - in real implementation, this would be multiple GraphQL queries
      // or a specialized analytics endpoint
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetSubscriptionStats {
              getSubscriptionStats {
                totalActiveSubscriptions
                totalRevenue
                monthlyRevenue
                premiumUsers
                trainerSubscriptions
                packageStats {
                  package {
                    id
                    name
                    priceNOK
                    duration
                  }
                  activeSubscriptions
                  totalRevenue
                  conversionRate
                }
              }
            }
          `,
        }),
      })

      const result = await response.json()

      if (result.errors) {
        throw new Error(result.errors[0]?.message || 'GraphQL Error')
      }

      const stats = result.data.getSubscriptionStats

      // Transform the data into analytics format
      const analyticsData: AnalyticsData = {
        overview: {
          totalSubscriptions: stats.totalActiveSubscriptions + 50, // Mock total including inactive
          activeSubscriptions: stats.totalActiveSubscriptions,
          monthlyRecurringRevenue: stats.monthlyRevenue,
          averageRevenuePerUser:
            stats.totalActiveSubscriptions > 0
              ? stats.monthlyRevenue / stats.totalActiveSubscriptions
              : 0,
          churnRate: 3.2, // Mock churn rate
          growthRate: 12.5, // Mock growth rate
        },
        revenueByMonth: generateMockRevenueData(),
        packagePerformance: stats.packageStats.map(
          (pkg: {
            package: { id: string; name: string }
            activeSubscriptions: number
            totalRevenue: number
            conversionRate: number
          }) => ({
            packageId: pkg.package.id,
            packageName: pkg.package.name,
            subscriptions: pkg.activeSubscriptions,
            revenue: pkg.totalRevenue,
            conversionRate: pkg.conversionRate,
            churnRate: Math.random() * 5, // Mock churn rate per package
          }),
        ),
        trainerPerformance: generateMockTrainerData(),
      }

      setData(analyticsData)
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: 'NOK',
    }).format(amount / 100)
  }

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('no-NO', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100)
  }

  const exportData = () => {
    if (!data) return

    const csvContent = [
      'Package,Subscriptions,Revenue,Conversion Rate,Churn Rate',
      ...data.packagePerformance.map(
        (pkg) =>
          `${pkg.packageName},${pkg.subscriptions},${pkg.revenue},${pkg.conversionRate},${pkg.churnRate}`,
      ),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscription-analytics-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="text-red-600 mb-2">
              Error loading analytics: {error}
            </div>
            <Button variant="outline" onClick={fetchAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Subscription Analytics</h3>
          <p className="text-sm text-muted-foreground">
            Detailed insights into subscription performance and trends
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1m">Last Month</SelectItem>
              <SelectItem value="3m">Last 3 Months</SelectItem>
              <SelectItem value="6m">Last 6 Months</SelectItem>
              <SelectItem value="1y">Last Year</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportData} disabled={!data}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={fetchAnalytics}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? '...'
                : formatCurrency(data?.overview.monthlyRecurringRevenue ?? 0)}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-600" />+
              {data?.overview.growthRate ?? 0}% from last month
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? '...'
                : formatCurrency(data?.overview.averageRevenuePerUser ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Average revenue per user
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading
                ? '...'
                : formatPercentage(data?.overview.churnRate ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">Monthly churn rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '...' : (data?.overview.activeSubscriptions ?? 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Currently active subscriptions
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Monthly recurring revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : data?.revenueByMonth && data.revenueByMonth.length > 0 ? (
            <ChartContainer
              config={{
                revenue: {
                  label: 'Revenue',
                  color: 'hsl(var(--chart-1))',
                },
                subscriptions: {
                  label: 'Subscriptions',
                  color: 'hsl(var(--chart-2))',
                },
              }}
              className="h-64"
            >
              <LineChart
                data={data.revenueByMonth.map((item) => ({
                  ...item,
                  revenue: item.revenue / 100, // Convert from øre to NOK
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="revenue"
                  orientation="left"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${Math.round(value)} NOK`}
                />
                <YAxis
                  yAxisId="subscriptions"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    name === 'revenue'
                      ? formatCurrency(Number(value) * 100)
                      : value,
                    name === 'revenue' ? 'Revenue' : 'Subscriptions',
                  ]}
                />
                <Line
                  yAxisId="revenue"
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--color-revenue)"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="subscriptions"
                  type="monotone"
                  dataKey="subscriptions"
                  stroke="var(--color-subscriptions)"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={{ r: 3 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ChartContainer>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                <p>No revenue data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package Performance Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Package Revenue Comparison</CardTitle>
          <CardDescription>
            Revenue and subscription count by package
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : data?.packagePerformance && data.packagePerformance.length > 0 ? (
            <ChartContainer
              config={{
                revenue: {
                  label: 'Revenue',
                  color: 'hsl(var(--chart-1))',
                },
                subscriptions: {
                  label: 'Subscriptions',
                  color: 'hsl(var(--chart-2))',
                },
              }}
              className="h-64"
            >
              <BarChart
                data={data.packagePerformance.map((pkg) => ({
                  name: pkg.packageName,
                  revenue: pkg.revenue / 100, // Convert from øre to NOK
                  subscriptions: pkg.subscriptions,
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  yAxisId="revenue"
                  orientation="left"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => `${Math.round(value)} NOK`}
                />
                <YAxis
                  yAxisId="subscriptions"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <ChartTooltip
                  content={<ChartTooltipContent />}
                  formatter={(value, name) => [
                    name === 'revenue'
                      ? formatCurrency(Number(value) * 100)
                      : value,
                    name === 'revenue' ? 'Revenue' : 'Subscriptions',
                  ]}
                />
                <Bar
                  yAxisId="revenue"
                  dataKey="revenue"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  yAxisId="subscriptions"
                  dataKey="subscriptions"
                  fill="var(--color-subscriptions)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-64 flex items-center justify-center border border-dashed rounded-lg">
              <div className="text-center text-muted-foreground">
                <BarChart3 className="h-8 w-8 mx-auto mb-2" />
                <p>No package data available</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Package Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Package Performance</CardTitle>
          <CardDescription>
            Performance metrics by subscription package
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-4">
              {data?.packagePerformance.map((pkg) => (
                <div key={pkg.packageId} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{pkg.packageName}</h4>
                      <p className="text-sm text-muted-foreground">
                        {pkg.subscriptions} active subscriptions
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        {formatCurrency(pkg.revenue)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total revenue
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Conversion Rate</span>
                        <Badge variant="outline">
                          {formatPercentage(pkg.conversionRate)}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Churn Rate</span>
                        <Badge
                          variant={
                            pkg.churnRate > 5 ? 'destructive' : 'outline'
                          }
                        >
                          {formatPercentage(pkg.churnRate)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Trainer Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Top Trainers</CardTitle>
          <CardDescription>
            Revenue and client metrics by trainer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          ) : (
            <div className="space-y-3">
              {data?.trainerPerformance.slice(0, 5).map((trainer, index) => (
                <div
                  key={trainer.trainerId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <div>
                      <div className="font-medium">{trainer.trainerName}</div>
                      <div className="text-sm text-muted-foreground">
                        {trainer.subscriptions} clients
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(trainer.revenue)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatPercentage(trainer.clientRetention)} retention
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Mock data generators (replace with real API calls)
function generateMockRevenueData() {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  return months.map((month) => ({
    month,
    revenue: Math.floor(Math.random() * 50000) + 30000, // 300-800 NOK in øre
    subscriptions: Math.floor(Math.random() * 20) + 10,
  }))
}

function generateMockTrainerData() {
  const trainers = [
    'Erik Nilsen',
    'Anna Larsen',
    'Magnus Berg',
    'Sofia Hansen',
    'Ole Andersen',
  ]
  return trainers.map((name, index) => ({
    trainerId: `trainer-${index + 1}`,
    trainerName: name,
    subscriptions: Math.floor(Math.random() * 15) + 5,
    revenue: Math.floor(Math.random() * 30000) + 20000,
    clientRetention: Math.random() * 20 + 80, // 80-100%
  }))
}
