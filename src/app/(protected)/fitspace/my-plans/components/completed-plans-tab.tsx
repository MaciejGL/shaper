import { formatDate } from 'date-fns'
import { CheckCircle, MoreHorizontal, StarIcon } from 'lucide-react'
import { useState } from 'react'

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
          <Card key={plan.id}>
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
                  // <div
                  //   key={key}
                  //   className="text-center p-3 bg-muted/50 rounded-lg"
                  // >
                  //   <div className="text-lg font-bold text-primary">
                  //     {value}
                  //   </div>
                  //   <div className="text-xs text-muted-foreground capitalize">
                  //     {key.replace(/([A-Z])/g, ' $1').trim()}
                  //   </div>
                  // </div>
                ))}
              </div>
              {/* Completion Stats */}
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
        <DropdownMenuItem onClick={() => handlePlanAction('delete', plan)}>
          Delete Plan
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function YourPlanRating({ plan }: { plan: CompletedPlan }) {
  const [isRatingDialogOpen, setIsRatingDialogOpen] = useState(false)
  const userRating = null

  const handlePlanRating = (rating: number, review?: string) => {
    // TODO: Implement plan rating
    console.info(rating, review)
  }

  return (
    <div>
      {userRating ? (
        <div className="text-left">
          <div className="text-sm text-muted-foreground mb-1">Your Rating</div>
          <RatingStars rating={userRating} size="sm" />
        </div>
      ) : (
        <>
          <Button
            variant="ghost"
            size="sm"
            iconEnd={<StarIcon />}
            onClick={() => setIsRatingDialogOpen(true)}
            className="max-md:hidden"
            disabled
          >
            Rate Plan
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            iconOnly={<StarIcon />}
            onClick={() => setIsRatingDialogOpen(true)}
            className="md:hidden"
            disabled
          >
            Rate Plan
          </Button>
        </>
      )}
      <PlanRatingModal
        isOpen={isRatingDialogOpen}
        onClose={() => setIsRatingDialogOpen(false)}
        plan={plan}
        existingRating={userRating ?? undefined}
        onSubmit={handlePlanRating}
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
