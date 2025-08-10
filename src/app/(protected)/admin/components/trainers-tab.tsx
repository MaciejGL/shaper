'use client'

import {
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Shield,
  Star,
  User,
  UserCheck,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  GQLGetTrainersListQuery,
  GQLUserRole,
  useGetAdminUserStatsQuery,
  useGetTrainersListQuery,
  useUpdateUserFeaturedMutation,
} from '@/generated/graphql-client'

export function TrainersTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<
    'all' | 'featured' | 'active' | 'inactive'
  >('all')

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // GraphQL queries
  const { data: statsData } = useGetAdminUserStatsQuery()
  const {
    data: trainersData,
    isLoading,
    refetch,
  } = useGetTrainersListQuery({
    filters: {
      role: GQLUserRole.Trainer,
      search: debouncedSearchTerm || undefined,
    },
    limit: 50,
    offset: 0,
  })

  const updateFeaturedMutation = useUpdateUserFeaturedMutation()

  const toggleFeaturedStatus = async (
    trainerId: string,
    currentStatus: boolean,
  ) => {
    try {
      await updateFeaturedMutation.mutateAsync({
        input: {
          userId: trainerId,
          featured: !currentStatus,
        },
      })

      // Refetch the data to get updated results
      refetch()
    } catch (error) {
      console.error('Error updating featured status:', error)
    }
  }

  // Process trainer data
  const trainers = trainersData?.adminUserList?.users || []
  const stats = statsData?.adminUserStats

  // Calculate derived stats
  const featuredTrainers = trainers.filter((trainer) => trainer.featured).length
  const activeTrainers = trainers.filter((trainer) => trainer.isActive).length

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'featured' && trainer.featured) ||
      (filterStatus === 'active' && trainer.isActive) ||
      (filterStatus === 'inactive' && !trainer.isActive)

    return matchesFilter
  })

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Total Trainers</p>
                  <p className="text-2xl font-bold">{stats.totalTrainers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <div>
                  <p className="text-sm font-medium">Featured</p>
                  <p className="text-2xl font-bold">{featuredTrainers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-2xl font-bold">{activeTrainers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-orange-500" />
                <div>
                  <p className="text-sm font-medium">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Trainer Management */}
      <Card>
        <CardHeader>
          <CardTitle>Trainer Management</CardTitle>
          <CardDescription>
            Manage which trainers are featured in the marketplace
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Input
                id="search-trainers"
                placeholder="Search trainers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterStatus}
              onValueChange={(value: typeof filterStatus) =>
                setFilterStatus(value)
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Trainers</SelectItem>
                <SelectItem value="featured">Featured Only</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="inactive">Inactive Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Trainer List */}
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-muted rounded-full" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-1/3" />
                        <div className="h-3 bg-muted rounded w-1/2" />
                      </div>
                      <div className="w-20 h-8 bg-muted rounded" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTrainers.length === 0 ? (
                <Alert>
                  <AlertDescription>
                    No trainers found matching your search criteria.
                  </AlertDescription>
                </Alert>
              ) : (
                filteredTrainers.map((trainer) => (
                  <TrainerListItem
                    key={trainer.id}
                    trainer={trainer}
                    onToggleFeatured={() =>
                      toggleFeaturedStatus(trainer.id, trainer.featured)
                    }
                    isUpdating={updateFeaturedMutation.isPending}
                  />
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

interface TrainerListItemProps {
  trainer: GQLGetTrainersListQuery['adminUserList']['users'][number]
  onToggleFeatured: () => void
  isUpdating: boolean
}

function TrainerListItem({
  trainer,
  onToggleFeatured,
  isUpdating,
}: TrainerListItemProps) {
  const trainerName =
    trainer.name ||
    `${trainer.profile?.firstName || ''} ${trainer.profile?.lastName || ''}`.trim() ||
    'Unnamed Trainer'
  return (
    <Card
      className={
        trainer.featured
          ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800'
          : ''
      }
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-primary" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium">{trainerName}</h3>
              {trainer.featured && (
                <Badge className="bg-yellow-500 text-yellow-50">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              <Badge variant={trainer.isActive ? 'secondary' : 'destructive'}>
                {trainer.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>

            <p className="text-sm text-muted-foreground">{trainer.email}</p>

            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
              <span>{trainer.clientCount} clients</span>
              <span>{trainer.sessionCount} sessions</span>
              <span>
                Joined {new Date(trainer.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant={trainer.featured ? 'destructive' : 'default'}
              size="sm"
              onClick={onToggleFeatured}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : trainer.featured ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Remove from Featured
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Make Featured
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Bio Preview */}
        {trainer.profile?.bio && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-muted-foreground line-clamp-2">
              {trainer.profile.bio}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
