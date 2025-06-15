import { formatDate } from 'date-fns'
import {
  CheckCircle,
  LayoutDashboard,
  MoreHorizontal,
  StarIcon,
  Trash,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { Loader } from '@/components/loader'
import { RatingStars } from '@/components/rating-stars'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardTitle } from '@/components/ui/card'
import { CardContent } from '@/components/ui/card'
import { CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  useCreateReviewMutation,
  useDeleteReviewMutation,
  useFitspaceMyPlansQuery,
  useUpdateReviewMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

import { CompletedPlan, PlanAction } from '../types'

import { CompletionStats } from './completion-stats'
import { PlanAuthor } from './plan-author'
import { PlanRatingModal } from './plan-rating-modal'
import { ProgressOverviewItem } from './progress-overview-item'

export function CompletedPlansTab({
  completedPlans,
  handlePlanAction,
  loading,
}: {
  completedPlans: CompletedPlan[]
  handlePlanAction: (action: PlanAction, plan: CompletedPlan) => void
  loading: boolean
}) {
  if (loading)
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <Loader />
      </div>
    )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {completedPlans.length > 0 ? (
        completedPlans.map((plan) => (
          <Card key={plan.id} variant="gradient">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex justify-between">
                    <CardTitle className="text-lg">{plan.title}</CardTitle>
                    <PlanActionsDropdownMenu
                      plan={plan}
                      handlePlanAction={handlePlanAction}
                    />
                  </div>
                  <div className="flex justify-between">
                    <PlanAuthor createdBy={plan.createdBy} />
                    <YourPlanRating plan={plan} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.completedAt && (
                <Badge variant="secondary">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed{' '}
                  {formatDate(new Date(plan.completedAt), 'MMM d, yyyy')}
                </Badge>
              )}
              <div className="grid grid-cols-3 gap-4">
                {Object.entries({
                  weightChange: '-2.5kg',
                  strengthGain: '+15%',
                  adherence: '94%',
                }).map(([key, value]) => (
                  <ProgressOverviewItem
                    key={key}
                    value={value}
                    label={key.replace(/([A-Z])/g, ' $1').trim()}
                  />
                ))}
              </div>
              <CompletionStats
                adherence={plan.adherence}
                completedWorkoutsDays={plan.completedWorkoutsDays}
                totalWorkouts={plan.totalWorkouts}
              />
            </CardContent>
          </Card>
        ))
      ) : (
        <NoCompletedPlans />
      )}
    </div>
  )
}

function PlanActionsDropdownMenu({
  plan,
  handlePlanAction,
}: {
  plan: CompletedPlan
  handlePlanAction: (action: PlanAction, plan: CompletedPlan) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" iconOnly={<MoreHorizontal />} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <Link href={`/fitspace/training-preview/${plan.id}`}>
          <DropdownMenuItem>
            <LayoutDashboard className="size-4 mr-2" />
            Plan Overview
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem onClick={() => handlePlanAction('delete', plan)}>
          <Trash className="size-4 mr-2" />
          Delete Plan
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function YourPlanRating({ plan }: { plan: CompletedPlan }) {
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)
  const userRating = plan.userReview?.rating
  const userReview = plan.userReview?.comment
  const invalidateQuery = useInvalidateQuery()
  const { mutateAsync: createReview, isPending: isCreatingReview } =
    useCreateReviewMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceMyPlansQuery.getKey(),
        })
        toast.success('Review has been added')
        setIsRatingDialogOpen(false)
      },
    })
  const { mutateAsync: updateReview, isPending: isUpdatingReview } =
    useUpdateReviewMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceMyPlansQuery.getKey(),
        })
        toast.success('Review has been updated')
        setIsRatingDialogOpen(false)
      },
    })
  const { mutateAsync: deleteReview, isPending: isDeletingReview } =
    useDeleteReviewMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceMyPlansQuery.getKey(),
        })
        toast.success('Review has been removed')
        setIsRatingDialogOpen(false)
      },
    })

  const handlePlanRating = (rating: number, review?: string) => {
    if (userRating && plan.userReview?.id) {
      updateReview({
        input: {
          reviewId: plan.userReview.id,
          rating,
          comment: review,
        },
      })
    } else {
      createReview({
        input: {
          trainingPlanId: plan.id,
          rating,
          comment: review,
        },
      })
    }
  }

  const handleDeleteReview = () => {
    if (plan.userReview?.id) {
      deleteReview({
        input: { reviewId: plan.userReview.id },
      })
    }
  }

  return (
    <div>
      {userRating ? (
        <button
          className="text-left group/rating cursor-pointer"
          onClick={() => setIsRatingDialogOpen(true)}
        >
          <div className="text-sm text-muted-foreground mb-1 group-hover/rating:underline underline-offset-4">
            Your Rating
          </div>
          <RatingStars rating={userRating} size="sm" />
        </button>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            iconEnd={<StarIcon />}
            onClick={() => setIsRatingDialogOpen(true)}
            className="max-md:hidden"
          >
            Rate Plan
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            iconOnly={<StarIcon />}
            onClick={() => setIsRatingDialogOpen(true)}
            className="md:hidden"
          >
            Rate Plan
          </Button>
        </>
      )}
      <PlanRatingModal
        isOpen={isRatingDialogOpen}
        onClose={() => setIsRatingDialogOpen(false)}
        plan={plan}
        existingRating={{
          rating: userRating ?? 0,
          comment: userReview ?? '',
          createdAt: plan.userReview?.createdAt,
        }}
        onSubmit={handlePlanRating}
        onDelete={handleDeleteReview}
        isLoading={isCreatingReview || isUpdatingReview}
        isDeletingRating={isDeletingReview}
      />
    </div>
  )
}

function NoCompletedPlans() {
  return (
    <Card className="h-full col-span-2">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No Completed Plans</h3>
        <p className="text-muted-foreground">
          Complete your first training plan to see your achievements here!
        </p>
      </CardContent>
    </Card>
  )
}
