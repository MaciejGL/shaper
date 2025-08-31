'use client'

import { Building2, Save, Search, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface User {
  id: string
  email: string
  name: string | null
  role: string
  stripeConnectedAccountId: string | null
}

interface Team {
  id: string
  name: string
  stripeConnectedAccountId: string | null
  memberCount: number
}

interface StripeAccountsData {
  users?: User[]
  teams?: Team[]
}

export function StripeIdsTab() {
  const [data, setData] = useState<StripeAccountsData>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('users')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const searchParam = searchQuery
        ? `?search=${encodeURIComponent(searchQuery)}`
        : ''
      const response = await fetch(`/api/admin/stripe/accounts${searchParam}`)

      if (!response.ok) {
        throw new Error('Failed to fetch data')
      }

      const result = await response.json()
      setData(result)
    } catch (error) {
      console.error('Failed to fetch Stripe accounts:', error)
    } finally {
      setLoading(false)
    }
  }, [searchQuery])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleEdit = (id: string, currentValue: string | null) => {
    setEditingId(id)
    setEditingValue(currentValue || '')
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingValue('')
  }

  const handleSaveUser = async (userId: string) => {
    try {
      setSaving(userId)
      const response = await fetch('/api/admin/stripe/user-account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          stripeConnectedAccountId: editingValue || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update user')
      }

      // Update local data
      setData((prev) => ({
        ...prev,
        users: prev.users?.map((user) =>
          user.id === userId
            ? { ...user, stripeConnectedAccountId: editingValue || null }
            : user,
        ),
      }))

      setEditingId(null)
      setEditingValue('')
    } catch (error) {
      console.error('Failed to update user:', error)
      alert('Failed to update user Stripe account')
    } finally {
      setSaving(null)
    }
  }

  const handleSaveTeam = async (teamId: string) => {
    try {
      setSaving(teamId)
      const response = await fetch('/api/admin/stripe/team-account', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teamId,
          stripeConnectedAccountId: editingValue || null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update team')
      }

      // Update local data
      setData((prev) => ({
        ...prev,
        teams: prev.teams?.map((team) =>
          team.id === teamId
            ? { ...team, stripeConnectedAccountId: editingValue || null }
            : team,
        ),
      }))

      setEditingId(null)
      setEditingValue('')
    } catch (error) {
      console.error('Failed to update team:', error)
      alert('Failed to update team Stripe account')
    } finally {
      setSaving(null)
    }
  }

  const filteredUsers = data.users || []
  const filteredTeams = data.teams || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Stripe Connect Account IDs
          </h2>
          <p className="text-muted-foreground">
            Manage Stripe Connect account IDs for users and teams
          </p>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>
            Search for users and teams to manage their Stripe account IDs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-accounts"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Users ({filteredUsers.length})
          </TabsTrigger>
          <TabsTrigger value="teams">
            <Building2 className="h-4 w-4 mr-2" />
            Teams ({filteredTeams.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>User Stripe Accounts</CardTitle>
              <CardDescription>
                Manage Stripe Connect account IDs for trainers and admins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Stripe Account ID</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="space-y-2">
                            <div className="h-4 bg-muted rounded animate-pulse" />
                            <div className="h-3 bg-muted/60 rounded animate-pulse w-2/3" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="h-6 bg-muted rounded animate-pulse w-16" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse w-32" />
                        </TableCell>
                        <TableCell>
                          <div className="h-8 bg-muted rounded animate-pulse w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No users found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredUsers.map((user) => (
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
                          {editingId === user.id ? (
                            <div className="space-y-2">
                              <Input
                                id={`user-stripe-${user.id}`}
                                value={editingValue}
                                onChange={(e) =>
                                  setEditingValue(e.target.value)
                                }
                                placeholder="acct_..."
                                className="font-mono text-sm"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveUser(user.id)}
                                  disabled={saving === user.id}
                                >
                                  <Save className="h-3 w-3 mr-1" />
                                  {saving === user.id ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancel}
                                  disabled={saving === user.id}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="font-mono text-sm">
                              {user.stripeConnectedAccountId || (
                                <span className="text-muted-foreground italic">
                                  Not set
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId !== user.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleEdit(
                                  user.id,
                                  user.stripeConnectedAccountId,
                                )
                              }
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Stripe Accounts</CardTitle>
              <CardDescription>
                Manage Stripe Connect account IDs for teams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Team</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Stripe Account ID</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse w-16" />
                        </TableCell>
                        <TableCell>
                          <div className="h-4 bg-muted rounded animate-pulse w-32" />
                        </TableCell>
                        <TableCell>
                          <div className="h-8 bg-muted rounded animate-pulse w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredTeams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8">
                        No teams found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTeams.map((team) => (
                      <TableRow key={team.id}>
                        <TableCell>
                          <div className="font-medium">{team.name}</div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {team.memberCount} members
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {editingId === team.id ? (
                            <div className="space-y-2">
                              <Input
                                id={`team-stripe-${team.id}`}
                                value={editingValue}
                                onChange={(e) =>
                                  setEditingValue(e.target.value)
                                }
                                placeholder="acct_..."
                                className="font-mono text-sm"
                              />
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleSaveTeam(team.id)}
                                  disabled={saving === team.id}
                                >
                                  <Save className="h-3 w-3 mr-1" />
                                  {saving === team.id ? 'Saving...' : 'Save'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={handleCancel}
                                  disabled={saving === team.id}
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="font-mono text-sm">
                              {team.stripeConnectedAccountId || (
                                <span className="text-muted-foreground italic">
                                  Not set
                                </span>
                              )}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {editingId !== team.id && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                handleEdit(
                                  team.id,
                                  team.stripeConnectedAccountId,
                                )
                              }
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
