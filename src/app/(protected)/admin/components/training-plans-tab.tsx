'use client'

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  Search,
} from 'lucide-react'
import { useEffect, useState } from 'react'

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
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'

interface TrainingPlanCreator {
  id: string
  name?: string | null
  profile?: {
    firstName?: string | null
    lastName?: string | null
  } | null
}

interface AdminTrainingPlanItem {
  id: string
  title: string
  description?: string | null
  isPublic: boolean
  premium: boolean
  isDraft: boolean
  createdAt: string
  updatedAt: string
  createdBy: TrainingPlanCreator
}

interface TrainingPlansResponse {
  plans: AdminTrainingPlanItem[]
  total: number
  hasMore: boolean
}

export function TrainingPlansTab() {
  const [plans, setPlans] = useState<AdminTrainingPlanItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')

  // Pagination
  const [offset, setOffset] = useState(0)
  const limit = 20

  const fetchPlans = async () => {
    try {
      setLoading(true)
      setError(null)
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
      })

      if (search) params.append('search', search)

      const response = await fetch(`/api/admin/training-plans?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch training plans')
      }

      const data: TrainingPlansResponse = await response.json()
      setPlans(data.plans)
      setTotal(data.total)
      setHasMore(data.hasMore)
    } catch (error) {
      console.error('Error fetching training plans:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to fetch training plans',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPlans()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, search])

  const handleNextPage = () => {
    if (hasMore) {
      setOffset(offset + limit)
    }
  }

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit))
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setOffset(0)
  }

  const handleToggle = async (
    planId: string,
    field: 'isPublic' | 'premium',
    currentValue: boolean,
  ) => {
    // Optimistic update
    setPlans((prevPlans) =>
      prevPlans.map((plan) =>
        plan.id === planId ? { ...plan, [field]: !currentValue } : plan,
      ),
    )

    try {
      const response = await fetch(`/api/admin/training-plans/${planId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !currentValue }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update ${field}`)
      }

      // Success - the optimistic update is correct
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
      // Revert optimistic update
      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.id === planId ? { ...plan, [field]: currentValue } : plan,
        ),
      )
      setError(
        error instanceof Error
          ? error.message
          : `Failed to update ${field}`,
      )
    }
  }

  const getCreatorName = (creator: TrainingPlanCreator) => {
    if (creator.profile?.firstName || creator.profile?.lastName) {
      return `${creator.profile.firstName || ''} ${creator.profile.lastName || ''}`.trim()
    }
    return creator.name || 'Unknown'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading && plans.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading training plans...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Total Plans
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{total}</div>
            <p className="text-xs text-muted-foreground">All training plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {plans.filter((p) => p.isPublic).length}
            </div>
            <p className="text-xs text-muted-foreground">Public plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {plans.filter((p) => p.premium).length}
            </div>
            <p className="text-xs text-muted-foreground">Premium plans</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">
              {plans.filter((p) => p.isDraft).length}
            </div>
            <p className="text-xs text-muted-foreground">Draft plans</p>
          </CardContent>
        </Card>
      </div>

      {/* Training Plans Management */}
      <Card>
        <CardHeader>
          <CardTitle>Training Plans Management</CardTitle>
          <CardDescription>
            Manage training plan visibility and premium status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="plan-search"
                  placeholder="Search plans by name..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setOffset(0)
                  }}
                  className="pl-8"
                />
              </div>

              <Button variant="outline" onClick={handleResetFilters}>
                <Filter className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>

            {/* Table */}
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full border-collapse">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Plan Name
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Creator
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Status
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Type
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Published
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Premium
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Created
                    </th>
                    <th className="border-b px-4 py-3 text-left text-sm font-medium">
                      Updated
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-muted/30">
                      <td className="border-b px-4 py-3">
                        <div>
                          <div className="font-medium">{plan.title}</div>
                          {plan.description && (
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {plan.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="border-b px-4 py-3 text-sm">
                        {getCreatorName(plan.createdBy)}
                      </td>
                      <td className="border-b px-4 py-3">
                        <Badge
                          variant={plan.isDraft ? 'outline' : 'default'}
                        >
                          {plan.isDraft ? 'Draft' : 'Published'}
                        </Badge>
                      </td>
                      <td className="border-b px-4 py-3">
                        <Badge
                          variant={plan.premium ? 'premium' : 'secondary'}
                        >
                          {plan.premium ? 'Premium' : 'Free'}
                        </Badge>
                      </td>
                      <td className="border-b px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={plan.isPublic}
                            onCheckedChange={() =>
                              handleToggle(plan.id, 'isPublic', plan.isPublic)
                            }
                          />
                          <span className="text-xs text-muted-foreground">
                            {plan.isPublic ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </td>
                      <td className="border-b px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={plan.premium}
                            onCheckedChange={() =>
                              handleToggle(plan.id, 'premium', plan.premium)
                            }
                          />
                          <span className="text-xs text-muted-foreground">
                            {plan.premium ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </td>
                      <td className="border-b px-4 py-3 text-sm">
                        {formatDate(plan.createdAt)}
                      </td>
                      <td className="border-b px-4 py-3 text-sm">
                        {formatDate(plan.updatedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {offset + 1} to {Math.min(offset + limit, total)} of{' '}
                {total} plans
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={offset === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={!hasMore}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {loading && plans.length > 0 && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm">Updating...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

