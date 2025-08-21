'use client'

import { Plus, RefreshCw, Settings } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
  GQLSubscriptionStatus,
  useAdminExtendSubscriptionMutation,
  useAdminUpdateSubscriptionStatusMutation,
} from '@/generated/graphql-client'

interface SubscriptionType {
  id: string
  status: string
  package: {
    name: string
  }
}

interface AdminActionsProps {
  subscription: SubscriptionType
  onActionComplete: (result: { success: boolean; message: string }) => void
}

export function AdminActions({
  subscription,
  onActionComplete,
}: AdminActionsProps) {
  const [extendMonths, setExtendMonths] = useState(1)
  const [newStatus, setNewStatus] = useState<GQLSubscriptionStatus>(
    GQLSubscriptionStatus.Active,
  )
  const [actionReason, setActionReason] = useState('')

  const extendSubscriptionMutation = useAdminExtendSubscriptionMutation({
    onSuccess: () => {
      onActionComplete({
        success: true,
        message: 'Successfully extended subscription',
      })
      setExtendMonths(1)
      setActionReason('')
    },
    onError: (error) => {
      console.error('Error extending subscription:', error)
      onActionComplete({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to extend subscription',
      })
    },
  })

  const updateStatusMutation = useAdminUpdateSubscriptionStatusMutation({
    onSuccess: () => {
      onActionComplete({
        success: true,
        message: 'Successfully updated subscription status',
      })
      setNewStatus(GQLSubscriptionStatus.Active)
      setActionReason('')
    },
    onError: (error) => {
      console.error('Error updating subscription status:', error)
      onActionComplete({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : 'Failed to update subscription status',
      })
    },
  })

  const handleExtendSubscription = () => {
    extendSubscriptionMutation.mutate({
      input: {
        subscriptionId: subscription.id,
        additionalMonths: extendMonths,
      },
    })
  }

  const handleUpdateStatus = () => {
    updateStatusMutation.mutate({
      input: {
        subscriptionId: subscription.id,
        status: newStatus,
      },
    })
  }

  return (
    <div className="flex gap-2 mt-4 pt-4 border-t">
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
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
              <Label htmlFor="months">Additional Months</Label>
              <Select
                value={extendMonths.toString()}
                onValueChange={(value) => setExtendMonths(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 6, 12].map((months) => (
                    <SelectItem key={months} value={months.toString()}>
                      {months} month{months > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Why are you extending this subscription?"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleExtendSubscription}
              disabled={extendSubscriptionMutation.isPending}
            >
              {extendSubscriptionMutation.isPending ? (
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
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Update Status
          </Button>
        </DialogTrigger>
        <DialogContent dialogTitle="Update Subscription Status">
          <DialogHeader>
            <DialogTitle>Update Subscription Status</DialogTitle>
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
                  setNewStatus(value as GQLSubscriptionStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GQLSubscriptionStatus.Active}>
                    Active
                  </SelectItem>
                  <SelectItem value={GQLSubscriptionStatus.Cancelled}>
                    Cancelled
                  </SelectItem>
                  <SelectItem value={GQLSubscriptionStatus.Expired}>
                    Expired
                  </SelectItem>
                  <SelectItem value={GQLSubscriptionStatus.Pending}>
                    Pending
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Why are you changing this status?"
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={handleUpdateStatus}
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
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
  )
}
