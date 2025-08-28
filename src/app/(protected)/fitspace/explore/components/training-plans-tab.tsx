'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Clock, Crown, Dumbbell, Lock, Star } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { LoadingSkeleton } from '@/app/(protected)/trainer/collaboration/components/loading-skeleton'
import {
  FilterType,
  TrainingPlanFilters,
} from '@/components/training-plan/training-plan-filters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import {
  GQLFocusTag,
  GQLGetMySubscriptionStatusQuery,
  GQLGetPublicTrainingPlansQuery,
  useAssignTemplateToSelfMutation,
  useGetMySubscriptionStatusQuery,
  useGetPublicTrainingPlansQuery,
} from '@/generated/graphql-client'

export function TrainingPlansTab() {
  const [selectedPlan, setSelectedPlan] = useState<
    GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number] | null
  >(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedFocusTags, setSelectedFocusTags] = useState<GQLFocusTag[]>([])
  const queryClient = useQueryClient()
  // Fetch public training plans
  const { data, isLoading } = useGetPublicTrainingPlansQuery({
    limit: 30,
  })

  // Fetch subscription status and assignment mutation
  const { data: subscriptionData } = useGetMySubscriptionStatusQuery()
  const { mutateAsync: assignTemplate, isPending: isAssigning } =
    useAssignTemplateToSelfMutation({})

  const handlePlanClick = (
    plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number],
  ) => {
    setSelectedPlan(plan)
    setIsPreviewOpen(true)
  }

  const handleAssignTemplate = async (planId: string) => {
    try {
      await assignTemplate({
        planId,
      })
      setIsPreviewOpen(false)
      setSelectedPlan(null)
      queryClient.invalidateQueries({
        queryKey: ['FitspaceMyPlans'],
      })
      toast.success('Training plan added to your plans')
    } catch (error) {
      console.error('Failed to add training plan to your plans:', error)
    }
  }

  const toggleFocusTag = (tag: GQLFocusTag) => {
    setSelectedFocusTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const clearAllFilters = () => {
    setActiveFilter('all')
    setSelectedFocusTags([])
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton count={3} variant="lg" />
      </div>
    )
  }

  // Get all public plans from the API (includes both free and premium)
  const allPublicPlans = (data?.getPublicTrainingPlans || []).map((plan) => ({
    ...plan,
    isPremium: plan.isPremium || false,
    focusTags: plan.focusTags || [],
    targetGoals: plan.targetGoals || [],
  }))

  // Separate into free and premium plans
  const freePlans = allPublicPlans.filter((plan) => !plan.isPremium)
  const premiumPlans = allPublicPlans.filter((plan) => plan.isPremium)

  // Combine and filter plans
  const allPlans = [...freePlans, ...premiumPlans]

  const filteredPlans = allPlans.filter((plan) => {
    // Filter by type (free/premium/all)
    if (activeFilter === 'free' && plan.isPremium) return false
    if (activeFilter === 'premium' && !plan.isPremium) return false

    // Filter by focus tags
    if (selectedFocusTags.length > 0) {
      return selectedFocusTags.some((tag) =>
        plan.focusTags?.some((planTag: string) => planTag.includes(tag)),
      )
    }

    return true
  })

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <TrainingPlanFilters
        activeFilter={activeFilter}
        selectedFocusTags={selectedFocusTags}
        onFilterChange={setActiveFilter}
        onToggleFocusTag={toggleFocusTag}
        onClearAllFilters={clearAllFilters}
      />

      {/* Results */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} borderless className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2 mb-3" />
                <div className="h-3 bg-muted rounded w-full" />
              </CardContent>
            </Card>
          ))
        ) : filteredPlans.length === 0 ? (
          <Card borderless>
            <CardContent className="p-6 text-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No plans match your filters
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or browse all plans
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="mt-3"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-sm text-muted-foreground mb-2">
              {filteredPlans.length} plan{filteredPlans.length !== 1 ? 's' : ''}{' '}
              found
            </div>
            {filteredPlans.map((plan) => (
              <TrainingPlanCard
                key={plan.id}
                plan={plan}
                onClick={() => handlePlanClick(plan)}
                isPremium={plan.isPremium}
              />
            ))}
          </>
        )}
      </div>

      {/* Plan Preview Drawer */}
      <TrainingPlanPreview
        plan={selectedPlan}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        subscriptionData={subscriptionData}
        handleAssignTemplate={handleAssignTemplate}
        isAssigning={isAssigning}
      />
    </div>
  )
}

interface TrainingPlanCardProps {
  plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]
  onClick: () => void
  isPremium: boolean
}

function TrainingPlanCard({ plan, onClick }: TrainingPlanCardProps) {
  const difficultyColors = {
    BEGINNER: 'bg-green-500 text-white dark:bg-green-600 dark:text-green-100',
    INTERMEDIATE:
      'bg-yellow-500 text-white dark:bg-yellow-600 dark:text-yellow-100',
    ADVANCED:
      'bg-orange-500 text-white dark:bg-orange-600 dark:text-orange-100',
    EXPERT: 'bg-red-500 text-white dark:bg-red-600 dark:text-red-100',
  }

  return (
    <Card
      borderless
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">
          {plan.title}
          {plan.isPremium && (
            <Badge variant="premium">
              <Crown className="h-2 w-2 mr-1" />
              Premium
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {plan.description}
        </p>

        <div className="space-y-2">
          {/* Focus Tags */}
          <div className="flex items-center gap-2">
            {plan.difficulty && (
              <Badge
                variant="secondary"
                className={
                  difficultyColors[
                    plan.difficulty as keyof typeof difficultyColors
                  ]
                }
              >
                {plan.difficulty}
              </Badge>
            )}
            {plan.focusTags && plan.focusTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {plan.focusTags
                  .slice(0, 2)
                  .map((tag: string, index: number) => (
                    <Badge key={index} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                {plan.focusTags.length > 2 && (
                  <Badge variant="secondary">
                    +{plan.focusTags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-3 w-3" />
                {plan.weekCount} weeks
              </div>
            </div>

            {/* Assignment count for all plans */}
            {plan.assignmentCount > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-muted-foreground">
                  {plan.assignmentCount} user
                  {plan.assignmentCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Show rating only for premium plans */}
            {plan.isPremium && plan.rating && (
              <div className="flex items-center gap-1 text-xs">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{plan.rating}</span>
                <span className="text-muted-foreground">
                  ({plan.totalReviews})
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface TrainingPlanPreviewProps {
  plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number] | null
  isOpen: boolean
  onClose: () => void
  subscriptionData?: GQLGetMySubscriptionStatusQuery
  handleAssignTemplate: (planId: string) => void
  isAssigning: boolean
}

function TrainingPlanPreview({
  plan,
  isOpen,
  onClose,
  subscriptionData,
  handleAssignTemplate,
  isAssigning,
}: TrainingPlanPreviewProps) {
  if (!plan) return null

  const difficultyColors = {
    BEGINNER:
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    INTERMEDIATE:
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    ADVANCED:
      'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    EXPERT: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent dialogTitle={plan.title}>
        <div className="p-4 space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 space-y-2">
                <h2 className="text-xl font-bold">{plan.title}</h2>
                {plan.isPremium ? (
                  <Badge variant="premium">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                ) : (
                  <Badge variant="secondary">Free</Badge>
                )}
              </div>
              {/* {plan.rating ? (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{plan.rating}</span>
                  <span className="text-muted-foreground text-sm">
                    ({plan.totalReviews})
                  </span>
                </div>
              ) : null} */}
            </div>
          </div>

          {/* Focus Tags */}
          {plan.focusTags && plan.focusTags.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-sm">Training Focus</h3>
              <div className="flex flex-wrap gap-2">
                {plan.focusTags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2 text-sm">Description</h3>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {plan.description}
            </p>
          </div>

          {/* Program Details */}
          <div>
            <h3 className="font-semibold mb-3 text-sm">Program Details</h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2 bg-card-on-card p-2 rounded-md">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{plan.weekCount} weeks</span>
                </div>
                <div className="flex items-center justify-between gap-2 bg-card-on-card p-2 rounded-md">
                  <span className="text-muted-foreground">Difficulty:</span>
                  {plan.difficulty && (
                    <Badge
                      variant="secondary"
                      className={
                        difficultyColors[
                          plan.difficulty as keyof typeof difficultyColors
                        ]
                      }
                    >
                      {plan.difficulty}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center justify-between gap-2 bg-card-on-card p-2 rounded-md">
                  <span className="text-muted-foreground">Users enrolled:</span>
                  <span className="font-medium">{plan.assignmentCount}</span>
                </div>
              </div>

              <div className="space-y-2">
                {plan.sessionsPerWeek && (
                  <div className="flex items-center justify-between gap-2 bg-card-on-card p-2 rounded-md">
                    <span className="text-muted-foreground">
                      Sessions/week:
                    </span>
                    <span className="font-medium">{plan.sessionsPerWeek}</span>
                  </div>
                )}
                {plan.avgSessionTime && (
                  <div className="flex items-center justify-between gap-2 bg-card-on-card p-2 rounded-md">
                    <span className="text-muted-foreground">Avg. time:</span>
                    <span className="font-medium">
                      {plan.avgSessionTime} min
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Equipment Needed */}
          {plan.equipment && plan.equipment.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-sm">Equipment Needed</h3>
              <div className="flex flex-wrap gap-2">
                {plan.equipment.map((item: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Target Goals */}
          {plan.targetGoals && plan.targetGoals.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-sm">
                What You'll Achieve
              </h3>
              <ul className="space-y-1">
                {plan.targetGoals.map((goal: string, index: number) => (
                  <li
                    key={index}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            {plan.isPremium ? (
              // Premium plan - check if user has access
              subscriptionData?.getMySubscriptionStatus?.hasPremium ||
              subscriptionData?.getMySubscriptionStatus
                ?.canAccessPremiumTrainingPlans ? (
                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleAssignTemplate(plan.id)}
                  loading={isAssigning}
                  disabled={isAssigning}
                  iconStart={<Crown />}
                >
                  Add to My Plans
                </Button>
              ) : (
                <Button
                  className="w-full"
                  size="lg"
                  disabled
                  iconStart={<Lock />}
                >
                  Premium Required
                </Button>
              )
            ) : (
              // Free plan
              <Button
                className="w-full"
                size="lg"
                onClick={() => handleAssignTemplate(plan.id)}
                disabled={isAssigning}
                loading={isAssigning}
                iconStart={<Dumbbell />}
              >
                Add to My Plans
              </Button>
            )}

            {plan.isPremium && (
              <p className="text-xs text-center text-muted-foreground">
                Upgrade to Premium to access this training plan and unlock
                advanced features
              </p>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
