'use client'

import { format, formatDistanceToNow } from 'date-fns'
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
} from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { GQLDeliveryStatus } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { ClientDelivery } from './use-service-deliveries'

interface ServiceDeliveryCardProps {
  delivery: ClientDelivery
  onStatusChange: (deliveryId: string, status: GQLDeliveryStatus) => void
  isUpdating: boolean
}

export function ServiceDeliveryCard({
  delivery,
  onStatusChange,
  isUpdating,
}: ServiceDeliveryCardProps) {
  const [notesDialogOpen, setNotesDialogOpen] = useState(false)
  const [notes, setNotes] = useState(delivery.deliveryNotes || '')

  const isCompleted = delivery.status === GQLDeliveryStatus.Completed
  const dueDate = new Date(delivery.dueDate)
  const dueDateFormatted = format(dueDate, 'MMM d, yyyy')
  const dueTimeAgo = formatDistanceToNow(dueDate, { addSuffix: true })

  const handleCompleteWithNotes = () => {
    onStatusChange(delivery.id, GQLDeliveryStatus.Completed)
    setNotesDialogOpen(false)
  }

  return (
    <>
      <Card
        className={cn(
          'transition-all',
          isCompleted && 'opacity-60',
          delivery.isOverdue &&
            !isCompleted &&
            'border-destructive/50 bg-destructive/5',
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle
                className={cn(
                  'text-base',
                  isCompleted && 'line-through text-muted-foreground',
                )}
              >
                {delivery.deliverableLabel}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {delivery.packageName}
              </p>
            </div>

            <DueDateBadge
              isOverdue={delivery.isOverdue}
              daysUntilDue={delivery.daysUntilDue}
              dueDateFormatted={dueDateFormatted}
              dueTimeAgo={dueTimeAgo}
              isCompleted={isCompleted}
            />
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between gap-4">
            <div className="text-xs text-muted-foreground">
              Purchased {format(new Date(delivery.createdAt), 'MMM d, yyyy')}
            </div>

            <div className="flex items-center gap-2">
              {!isCompleted &&
                delivery.status === GQLDeliveryStatus.InProgress && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setNotesDialogOpen(true)}
                    iconStart={<MessageSquare className="size-3" />}
                    className="h-8"
                  >
                    Complete
                  </Button>
                )}

              <Select
                value={delivery.status}
                onValueChange={(value) =>
                  onStatusChange(delivery.id, value as GQLDeliveryStatus)
                }
                disabled={isUpdating}
              >
                <SelectTrigger className="w-32 h-8" variant="ghost">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={GQLDeliveryStatus.Pending}>
                    Pending
                  </SelectItem>
                  <SelectItem value={GQLDeliveryStatus.InProgress}>
                    In Progress
                  </SelectItem>
                  <SelectItem value={GQLDeliveryStatus.Completed}>
                    Completed
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {delivery.deliveryNotes && (
            <div className="mt-3 p-3 bg-muted rounded-md">
              <p className="text-sm text-muted-foreground">
                {delivery.deliveryNotes}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
        <DialogContent dialogTitle="Complete Delivery">
          <DialogHeader>
            <DialogTitle>Complete Delivery</DialogTitle>
            <DialogDescription>
              Add optional notes about what was delivered to the client.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Textarea
              id={`delivery-notes-${delivery.id}`}
              placeholder="e.g., Delivered 4-week training plan with progressive overload..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setNotesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCompleteWithNotes}>Mark Complete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function DueDateBadge({
  isOverdue,
  daysUntilDue,
  dueDateFormatted,
  dueTimeAgo,
  isCompleted,
}: {
  isOverdue: boolean
  daysUntilDue: number
  dueDateFormatted: string
  dueTimeAgo: string
  isCompleted: boolean
}) {
  if (isCompleted) {
    return (
      <Badge variant="success" className="shrink-0">
        <CheckCircle2 className="size-3 mr-1" />
        Delivered
      </Badge>
    )
  }

  if (isOverdue) {
    return (
      <Badge variant="destructive" className="shrink-0">
        <AlertCircle className="size-3 mr-1" />
        Overdue
      </Badge>
    )
  }

  if (daysUntilDue === 0) {
    return (
      <Badge variant="warning" className="shrink-0">
        <Clock className="size-3 mr-1" />
        Due today
      </Badge>
    )
  }

  if (daysUntilDue <= 2) {
    return (
      <Badge variant="warning" className="shrink-0">
        <Calendar className="size-3 mr-1" />
        {dueTimeAgo}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="shrink-0">
      <Calendar className="size-3 mr-1" />
      Due {dueDateFormatted}
    </Badge>
  )
}
