'use client'

import {
  AlertCircle,
  Clock,
  Loader2,
  RefreshCw,
  Shield,
  UserCheck,
  UserPlus,
  UserX,
  Users,
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

import { UserManagementTable } from './user-management-table'

interface UserStats {
  totalUsers: number
  totalClients: number
  totalTrainers: number
  totalAdmins: number
  activeUsers: number
  inactiveUsers: number
  usersWithoutProfiles: number
  recentSignups: number
}

export function UsersTab() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/admin/users?action=stats')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch user statistics')
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching user stats:', error)
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to fetch user statistics',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading user data...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* User Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats?.activeUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active in last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Inactive Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats?.inactiveUsers || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              No activity in 30+ days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Recent Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats?.recentSignups || 0}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Role Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Role Distribution
          </CardTitle>
          <CardDescription>
            User counts by role and health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="text-center p-4 rounded-lg bg-card-on-card">
              <Badge variant="primary" className="mb-2">
                Clients
              </Badge>
              <p className="text-2xl font-bold">{stats?.totalClients || 0}</p>
              <p className="text-xs text-muted-foreground">Active clients</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-card-on-card">
              <Badge variant="secondary" className="mb-2">
                Trainers
              </Badge>
              <p className="text-2xl font-bold">{stats?.totalTrainers || 0}</p>
              <p className="text-xs text-muted-foreground">Trainers</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-card-on-card">
              <Badge variant="destructive" className="mb-2">
                Admins
              </Badge>
              <p className="text-2xl font-bold">{stats?.totalAdmins || 0}</p>
              <p className="text-xs text-muted-foreground">Administrators</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-card-on-card">
              <Badge variant="outline" className="mb-2">
                <AlertCircle className="h-3 w-3 mr-1" />
                No Profile
              </Badge>
              <p className="text-2xl font-bold text-orange-600">
                {stats?.usersWithoutProfiles || 0}
              </p>
              <p className="text-xs text-muted-foreground">Missing profiles</p>
            </div>

            <div className="text-center p-4 rounded-lg bg-card-on-card">
              <div className="flex items-center justify-center mb-2">
                <Button onClick={fetchStats} size="sm" variant="ghost">
                  <RefreshCw className="h-4 w-4 mr-1" />
                  Refresh
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Update data</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Alerts */}
      {stats &&
        (stats.usersWithoutProfiles > 0 ||
          stats.inactiveUsers > stats.activeUsers) && (
          <Alert variant="default">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>Health Check:</strong>
              {stats.usersWithoutProfiles > 0 && (
                <span className="ml-2">
                  {stats.usersWithoutProfiles} users without profiles.
                </span>
              )}
              {stats.inactiveUsers > stats.activeUsers && (
                <span className="ml-2">
                  More inactive ({stats.inactiveUsers}) than active (
                  {stats.activeUsers}) users.
                </span>
              )}
            </AlertDescription>
          </Alert>
        )}

      {/* User Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            Manage user accounts, roles, and sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UserManagementTable onUserUpdate={fetchStats} />
        </CardContent>
      </Card>
    </div>
  )
}
