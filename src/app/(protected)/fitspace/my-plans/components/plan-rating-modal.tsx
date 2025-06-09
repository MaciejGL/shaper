'use client'

import { formatDate } from 'date-fns'
import { Star } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { CompletedPlan } from '../types'

import { PlanAuthor } from './plan-author'

interface PlanRatingModalProps {
  isOpen: boolean
  onClose: () => void
  plan: CompletedPlan
  existingRating?: {
    rating: number
    review?: string
    date?: string
  }
  onSubmit: (rating: number, review?: string) => void
}

export function PlanRatingModal({
  isOpen,
  onClose,
  plan,
  existingRating,
  onSubmit,
}: PlanRatingModalProps) {
  const [rating, setRating] = useState(existingRating?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [review, setReview] = useState(existingRating?.review || '')

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, review.trim() || undefined)
      onClose()
    }
  }

  const handleClose = () => {
    // Reset to existing values when closing without saving
    setRating(existingRating?.rating || 0)
    setReview(existingRating?.review || '')
    onClose()
  }

  if (!plan || !plan.createdBy || !plan.completedAt) return null

  const isUpdate = !!existingRating

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" dialogTitle="Rate This Plan">
        <DialogHeader>
          <DialogTitle>
            {isUpdate ? 'Update Your Rating' : 'Rate This Plan'}
          </DialogTitle>
          <DialogDescription>
            {isUpdate
              ? 'Update your rating and review for this training plan'
              : 'Share your experience with this training plan to help others'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Plan Summary */}
          <div className="flex flex-col gap-3 p-3 bg-muted/50 rounded-lg">
            <PlanAuthor createdBy={plan.createdBy} />
            <div className="flex-1">
              <div className="font-medium">{plan.title}</div>

              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {plan.weekCount} weeks
                </Badge>
                {plan.completedAt && (
                  <Badge variant="outline" className="text-xs">
                    Completed{' '}
                    {formatDate(new Date(plan.completedAt), 'MMM d, yyyy')}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Star Rating */}
          <div className="space-y-2">
            <Label>Your Rating</Label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                >
                  <Star
                    className={cn(
                      'size-6 transition-colors',
                      hoveredRating >= star || rating >= star
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground hover:text-yellow-400',
                    )}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  {rating} star{rating !== 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Written Review */}
          <div className="space-y-2">
            <Label htmlFor="review">Review (Optional)</Label>
            <Textarea
              id="review"
              placeholder="Share your thoughts about this training plan..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <div className="text-xs text-muted-foreground">
              Help others by sharing what you liked or what could be improved
            </div>
          </div>

          {/* Existing Rating Info */}
          {isUpdate && existingRating?.date && (
            <div className="text-xs text-muted-foreground border-t pt-3">
              Originally rated on {existingRating.date}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={rating === 0}>
            {isUpdate ? 'Update Rating' : 'Submit Rating'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
