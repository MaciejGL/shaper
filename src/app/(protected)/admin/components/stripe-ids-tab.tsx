'use client'

import {
  AlertCircle,
  Building2,
  CheckCircle,
  Save,
  Search,
  TestTube,
  Users,
  XCircle,
} from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

interface TestResult {
  accountId: string
  isValid: boolean
  status: string
  details?: {
    type?: string
    country?: string
    charges_enabled?: boolean
    payouts_enabled?: boolean
    capabilities?: Record<string, unknown>
    business_type?: string | null
  }
  error?: string
  testTransfer?: {
    success: boolean
    amount: number
    currency: string
    error?: string
  }
}

export function StripeIdsTab() {
  const [data, setData] = useState<StripeAccountsData>({})
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('users')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [saving, setSaving] = useState<string | null>(null)

  // Test-related state
  const [testing, setTesting] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({})
  const [showTestDialog, setShowTestDialog] = useState(false)
  const [selectedTestResult, setSelectedTestResult] =
    useState<TestResult | null>(null)

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

  const handleTestAccount = async (accountId: string, entityId: string) => {
    if (!accountId) {
      alert('No account ID to test')
      return
    }

    try {
      setTesting(entityId)
      const response = await fetch('/api/admin/stripe/test-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      })

      if (!response.ok) {
        throw new Error('Failed to test account')
      }

      const { testResult } = await response.json()

      // Store test result
      setTestResults((prev) => ({
        ...prev,
        [entityId]: testResult,
      }))

      // Show detailed results in dialog
      setSelectedTestResult(testResult)
      setShowTestDialog(true)
    } catch (error) {
      console.error('Failed to test account:', error)
      alert('Failed to test Stripe account')
    } finally {
      setTesting(null)
    }
  }

  const getStatusIcon = (testResult?: TestResult) => {
    if (!testResult) return null

    switch (testResult.status) {
      case 'connected_and_working':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'incomplete_onboarding':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'not_found':
      case 'account_invalid':
      case 'permission_denied':
      case 'transfer_restricted':
      case 'transfer_error':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (testResult?: TestResult) => {
    if (!testResult) return null

    const badgeVariants: Record<
      string,
      'primary' | 'secondary' | 'destructive' | 'outline'
    > = {
      connected_and_working: 'primary',
      incomplete_onboarding: 'secondary',
      not_found: 'destructive',
      account_invalid: 'destructive',
      permission_denied: 'destructive',
      transfer_restricted: 'destructive',
      transfer_error: 'destructive',
      error: 'destructive',
    }

    return (
      <Badge
        variant={badgeVariants[testResult.status] || 'outline'}
        className="text-xs"
      >
        {testResult.isValid ? 'Valid' : 'Invalid'}
      </Badge>
    )
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
                    <TableHead>Status</TableHead>
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
                          <div className="h-6 bg-muted rounded animate-pulse w-20" />
                        </TableCell>
                        <TableCell>
                          <div className="h-8 bg-muted rounded animate-pulse w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
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
                          <div className="flex items-center gap-2">
                            {getStatusIcon(testResults[user.id])}
                            {getStatusBadge(testResults[user.id])}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {editingId !== user.id && (
                              <>
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
                                {user.stripeConnectedAccountId && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleTestAccount(
                                        user.stripeConnectedAccountId!,
                                        user.id,
                                      )
                                    }
                                    disabled={testing === user.id}
                                  >
                                    <TestTube className="h-3 w-3 mr-1" />
                                    {testing === user.id
                                      ? 'Testing...'
                                      : 'Test'}
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
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
                    <TableHead>Status</TableHead>
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
                          <div className="h-6 bg-muted rounded animate-pulse w-20" />
                        </TableCell>
                        <TableCell>
                          <div className="h-8 bg-muted rounded animate-pulse w-16" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : filteredTeams.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
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
                          <div className="flex items-center gap-2">
                            {getStatusIcon(testResults[team.id])}
                            {getStatusBadge(testResults[team.id])}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {editingId !== team.id && (
                              <>
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
                                {team.stripeConnectedAccountId && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      handleTestAccount(
                                        team.stripeConnectedAccountId!,
                                        team.id,
                                      )
                                    }
                                    disabled={testing === team.id}
                                  >
                                    <TestTube className="h-3 w-3 mr-1" />
                                    {testing === team.id
                                      ? 'Testing...'
                                      : 'Test'}
                                  </Button>
                                )}
                              </>
                            )}
                          </div>
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

      {/* Test Results Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent dialogTitle="Stripe Connect Account Test Results">
          <DialogHeader>
            <DialogTitle>Stripe Connect Account Test Results</DialogTitle>
            <DialogDescription>
              Detailed test results for account: {selectedTestResult?.accountId}
            </DialogDescription>
          </DialogHeader>

          {selectedTestResult && (
            <div className="space-y-4">
              {/* Status Summary */}
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                {getStatusIcon(selectedTestResult)}
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    Account Status
                    {getStatusBadge(selectedTestResult)}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {selectedTestResult.isValid ? (
                      <span className="text-green-600">
                        ✅ Account is properly connected and can receive
                        payments
                      </span>
                    ) : (
                      <span className="text-red-600">
                        ❌ {selectedTestResult.error}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Details */}
              {selectedTestResult.details && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Account Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Type:</span>{' '}
                      {selectedTestResult.details.type}
                    </div>
                    <div>
                      <span className="font-medium">Country:</span>{' '}
                      {selectedTestResult.details.country?.toUpperCase()}
                    </div>
                    <div>
                      <span className="font-medium">Charges Enabled:</span>{' '}
                      {selectedTestResult.details.charges_enabled ? '✅' : '❌'}
                    </div>
                    <div>
                      <span className="font-medium">Payouts Enabled:</span>{' '}
                      {selectedTestResult.details.payouts_enabled ? '✅' : '❌'}
                    </div>
                    {selectedTestResult.details.business_type && (
                      <div>
                        <span className="font-medium">Business Type:</span>{' '}
                        {selectedTestResult.details.business_type}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Transfer Test Results */}
              {selectedTestResult.testTransfer && (
                <div className="space-y-3">
                  <h4 className="font-semibold">Transfer Test</h4>
                  <div className="p-3 rounded-lg bg-muted/30">
                    {selectedTestResult.testTransfer.success ? (
                      <div className="text-green-600">
                        ✅ Test transfer successful ($1.00 USD test - reversed
                        immediately)
                      </div>
                    ) : (
                      <div className="text-red-600">
                        ❌ Transfer failed:{' '}
                        {selectedTestResult.testTransfer.error}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="space-y-3">
                <h4 className="font-semibold">Recommendations</h4>
                <div className="text-sm space-y-2">
                  {selectedTestResult.status === 'connected_and_working' && (
                    <div className="text-green-600">
                      🎉 This account is ready to receive payments! No action
                      needed.
                    </div>
                  )}
                  {selectedTestResult.status === 'incomplete_onboarding' && (
                    <div className="text-yellow-600">
                      ⚠️ The trainer needs to complete Stripe onboarding. Send
                      them the onboarding link.
                    </div>
                  )}
                  {selectedTestResult.status === 'not_found' && (
                    <div className="text-red-600">
                      ❌ This account doesn't exist. The trainer needs to create
                      a Connect account through your platform.
                    </div>
                  )}
                  {selectedTestResult.status === 'account_invalid' && (
                    <div className="text-red-600">
                      ❌ This account exists but isn't connected to your
                      platform. The trainer needs to create a Connect account
                      through your onboarding flow.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
