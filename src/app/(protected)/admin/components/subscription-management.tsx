'use client'

import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Plus,
  RefreshCw,
  Search,
  Settings,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  type GQLAdminExtendSubscriptionInput,
  type GQLAdminUpdateSubscriptionStatusInput,
  GQLSubscriptionStatus,
  useAdminExtendSubscriptionMutation,
  useAdminUpdateSubscriptionStatusMutation,
} from '@/generated/graphql-client'
import { useSubscriptionStatus } from '@/hooks/use-subscription'

interface AdminAction {
  type: 'extend' | 'cancel' | 'activate' | 'update_status'
  subscriptionId: string
  userId: string
  packageName: string
}

export function SubscriptionManagement() {
  const [selectedUserId, setSelectedUserId] = useState('')
  const [showUserSubscriptions, setShowUserSubscriptions] = useState(false)
  const [adminAction, setAdminAction] = useState<AdminAction | null>(null)
  const [isPerformingAction, setIsPerformingAction] = useState(false)
  const [actionResult, setActionResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // Form states for admin actions
  const [extendMonths, setExtendMonths] = useState(1)
  const [newStatus, setNewStatus] = useState<GQLSubscriptionStatus>(
    GQLSubscriptionStatus.Active,
  )
  const [actionReason, setActionReason] = useState('')

  // Use our existing hooks for user data
  const { data: userSubscriptionStatus, isLoading: loadingUserStatus } =
    useSubscriptionStatus(selectedUserId || undefined)

  const searchUser = () => {
    if (selectedUserId.trim()) {
      setShowUserSubscriptions(true)
    }
  }

  // Generated mutation hooks
  const extendSubscriptionMutation = useAdminExtendSubscriptionMutation({
    onSuccess: () => {
      setActionResult({
        success: true,
        message: 'Successfully extended subscription',
      })
      // Reset form
      setAdminAction(null)
      setExtendMonths(1)
      setActionReason('')
    },
    onError: (err) => {
      console.error('Error extending subscription:', err)
      setActionResult({
        success: false,
        message:
          err instanceof Error ? err.message : 'Failed to extend subscription',
      })
    },
    onSettled: () => {
      setIsPerformingAction(false)
    },
  })

  const updateStatusMutation = useAdminUpdateSubscriptionStatusMutation({
    onSuccess: () => {
      setActionResult({
        success: true,
        message: 'Successfully updated subscription status',
      })
      // Reset form
      setAdminAction(null)
      setNewStatus(GQLSubscriptionStatus.Active)
      setActionReason('')
    },
    onError: (err) => {
      console.error('Error updating subscription status:', err)
      setActionResult({
        success: false,
        message:
          err instanceof Error
            ? err.message
            : 'Failed to update subscription status',
      })
    },
    onSettled: () => {
      setIsPerformingAction(false)
    },
  })

  const performAdminAction = async () => {
    if (!adminAction) return

    setIsPerformingAction(true)
    setActionResult(null)

    try {
      switch (adminAction.type) {
        case 'extend': {
          const input: GQLAdminExtendSubscriptionInput = {
            subscriptionId: adminAction.subscriptionId,
            additionalMonths: extendMonths,
          }
          extendSubscriptionMutation.mutate({ input })
          break
        }

        case 'update_status': {
          const input: GQLAdminUpdateSubscriptionStatusInput = {
            subscriptionId: adminAction.subscriptionId,
            status: newStatus,
          }
          updateStatusMutation.mutate({ input })
          break
        }

        default:
          throw new Error('Unsupported admin action')
      }
    } catch (err) {
      console.error('Error performing admin action:', err)
      setActionResult({
        success: false,
        message:
          err instanceof Error ? err.message : 'Failed to perform action',
      })
      setIsPerformingAction(false)
    }
  }

  const openStripeCustomerPortal = async () => {
    try {
      const response = await fetch('/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: selectedUserId,
          returnUrl: window.location.href,
        }),
      })

      const result = await response.json()
      if (result.url) {
        window.open(result.url, '_blank')
      }
    } catch (err) {
      console.error('Error opening Stripe portal:', err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('no-NO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Active
          </Badge>
        )
      case 'PENDING':
        return (
          <Badge variant="outline">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'CANCELLED':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        )
      case 'EXPIRED':
        return (
          <Badge variant="secondary">
            <Calendar className="h-3 w-3 mr-1" />
            Expired
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* User Search */}
      <Card>
        <CardHeader>
          <CardTitle>User Subscription Management</CardTitle>
          <CardDescription>
            Search for a user to manage their subscriptions and billing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="userId">User ID</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="userId"
                  placeholder="Enter user ID..."
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchUser()}
                />
                <Button onClick={searchUser} disabled={!selectedUserId.trim()}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
          </div>

          {actionResult && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{actionResult.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* User Subscription Details */}
      {showUserSubscriptions && selectedUserId && (
        <div className="space-y-6">
          {/* Subscription Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Subscription Status for User: {selectedUserId}</span>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={openStripeCustomerPortal}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Stripe Portal
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowUserSubscriptions(false)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingUserStatus ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  Loading subscription status...
                </div>
              ) : userSubscriptionStatus ? (
                <div className="space-y-4">
                  {/* Premium Status */}
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">Premium Access</div>
                      <div className="text-sm text-muted-foreground">
                        Current subscription status
                      </div>
                    </div>
                    <div className="text-right">
                      {userSubscriptionStatus.hasPremiumAccess ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Premium Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <XCircle className="h-3 w-3 mr-1" />
                          No Premium
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Active Subscription */}
                  {userSubscriptionStatus.subscription && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Current Subscription</h4>
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {userSubscriptionStatus.subscription.package.name}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {
                                userSubscriptionStatus.subscription.package
                                  .duration
                              }{' '}
                              • From Stripe
                            </div>
                            <div className="text-sm text-muted-foreground mt-1">
                              {formatDate(
                                userSubscriptionStatus.subscription.startDate,
                              )}{' '}
                              -{' '}
                              {formatDate(
                                userSubscriptionStatus.subscription.endDate,
                              )}
                            </div>
                          </div>
                          <div className="text-right space-y-2">
                            {getStatusBadge(
                              userSubscriptionStatus.subscription.status,
                            )}
                            <div className="text-sm text-muted-foreground">
                              {userSubscriptionStatus.daysRemaining} days
                              remaining
                            </div>
                          </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="flex gap-2 mt-4 pt-4 border-t">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setAdminAction({
                                    type: 'extend',
                                    subscriptionId:
                                      userSubscriptionStatus.subscription!.id,
                                    userId: selectedUserId,
                                    packageName:
                                      userSubscriptionStatus.subscription!
                                        .package.name,
                                  })
                                }
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Extend
                              </Button>
                            </DialogTrigger>
                            <DialogContent dialogTitle="Extend Subscription">
                              <DialogHeader>
                                <DialogTitle>Extend Subscription</DialogTitle>
                                <DialogDescription>
                                  Add additional months to this subscription
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="months">
                                    Additional Months
                                  </Label>
                                  <Select
                                    value={extendMonths.toString()}
                                    onValueChange={(value) =>
                                      setExtendMonths(parseInt(value))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[1, 2, 3, 6, 12].map((months) => (
                                        <SelectItem
                                          key={months}
                                          value={months.toString()}
                                        >
                                          {months} month{months > 1 ? 's' : ''}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="reason">
                                    Reason (optional)
                                  </Label>
                                  <Textarea
                                    id="reason"
                                    placeholder="Why are you extending this subscription?"
                                    value={actionReason}
                                    onChange={(e) =>
                                      setActionReason(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={performAdminAction}
                                  disabled={isPerformingAction}
                                >
                                  {isPerformingAction ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Extending...
                                    </>
                                  ) : (
                                    'Extend Subscription'
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>

                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  setAdminAction({
                                    type: 'update_status',
                                    subscriptionId:
                                      userSubscriptionStatus.subscription!.id,
                                    userId: selectedUserId,
                                    packageName:
                                      userSubscriptionStatus.subscription!
                                        .package.name,
                                  })
                                }
                              >
                                <Settings className="h-4 w-4 mr-2" />
                                Update Status
                              </Button>
                            </DialogTrigger>
                            <DialogContent dialogTitle="Update Subscription Status">
                              <DialogHeader>
                                <DialogTitle>
                                  Update Subscription Status
                                </DialogTitle>
                                <DialogDescription>
                                  Change the status of this subscription
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="status">New Status</Label>
                                  <Select
                                    value={newStatus}
                                    onValueChange={(value) =>
                                      setNewStatus(
                                        value as GQLSubscriptionStatus,
                                      )
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem
                                        value={GQLSubscriptionStatus.Active}
                                      >
                                        Active
                                      </SelectItem>
                                      <SelectItem
                                        value={GQLSubscriptionStatus.Cancelled}
                                      >
                                        Cancelled
                                      </SelectItem>
                                      <SelectItem
                                        value={GQLSubscriptionStatus.Expired}
                                      >
                                        Expired
                                      </SelectItem>
                                      <SelectItem
                                        value={GQLSubscriptionStatus.Pending}
                                      >
                                        Pending
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="reason">
                                    Reason (optional)
                                  </Label>
                                  <Textarea
                                    id="reason"
                                    placeholder="Why are you changing this status?"
                                    value={actionReason}
                                    onChange={(e) =>
                                      setActionReason(e.target.value)
                                    }
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button
                                  onClick={performAdminAction}
                                  disabled={isPerformingAction}
                                >
                                  {isPerformingAction ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Updating...
                                    </>
                                  ) : (
                                    'Update Status'
                                  )}
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Trial and Grace Period Info */}
                  {userSubscriptionStatus.trial?.isActive && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 font-medium">
                        <Clock className="h-4 w-4" />
                        Trial Period Active
                      </div>
                      <p className="text-blue-600 text-sm mt-1">
                        {userSubscriptionStatus.trial.daysRemaining} days
                        remaining
                      </p>
                    </div>
                  )}

                  {userSubscriptionStatus.gracePeriod?.isActive && (
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-700 font-medium">
                        <AlertTriangle className="h-4 w-4" />
                        Grace Period Active
                      </div>
                      <p className="text-orange-600 text-sm mt-1">
                        {userSubscriptionStatus.gracePeriod.daysRemaining} days
                        remaining to update payment
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No subscription data found for this user
                </div>
              )}
            </CardContent>
          </Card>

          {/* Billing History */}
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Billing history is now managed through Stripe Customer Portal.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
