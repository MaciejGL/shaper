'use client'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Clock, Dumbbell, Sparkles, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { startTransition, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import {
  SortOption,
  TrainingPlanFilters,
  focusTagLabels,
} from '@/components/training-plan/training-plan-filters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import {
  GQLDifficulty,
  GQLFocusTag,
  GQLGetPublicTrainingPlansQuery,
  useAssignTemplateToSelfMutation,
  useGetPublicTrainingPlansQuery,
} from '@/generated/graphql-client'
import { useOpenUrl } from '@/hooks/use-open-url'
import { usePaymentRules } from '@/hooks/use-payment-rules'
import { cn } from '@/lib/utils'
import { formatUserCount } from '@/utils/format-user-count'

import { PublicTrainingPlan } from './explore.client'
import { PlanFinder } from './plan-finder/plan-finder'
import { TrainingPlanPreviewContent } from './workout-day-preview/training-plan-preview-content'

interface TrainingPlansTabProps {
  initialPlans?: PublicTrainingPlan[]
  initialPlanId?: string | null
}

export function TrainingPlansTab({
  initialPlans = [],
  initialPlanId,
}: TrainingPlansTabProps) {
  const [selectedPlan, setSelectedPlan] = useState<
    GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number] | null
  >(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPlanFinderOpen, setIsPlanFinderOpen] = useState(false)

  // Filters
  const [selectedFocusTags, setSelectedFocusTags] = useState<GQLFocusTag[]>([])
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<GQLDifficulty | null>(null)
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null)
  const [sessionMaxMins, setSessionMaxMins] = useState<number>(90) // 90 = "Any"
  const [sort, setSort] = useState<SortOption>('recommended')

  const queryClient = useQueryClient()
  const router = useRouter()
  const rules = usePaymentRules()
  const { openUrl } = useOpenUrl({
    errorMessage: 'Failed to open subscription plans',
    openInApp: rules.canLinkToPayment,
  })

  // Fetch public training plans
  const { data, isLoading } = useGetPublicTrainingPlansQuery(
    {
      limit: 30,
    },
    {
      initialData:
        initialPlans.length > 0
          ? { getPublicTrainingPlans: initialPlans }
          : undefined,
      staleTime: 5 * 60 * 1000, // 5 minutes - match ISR revalidation
    },
  )

  // Fetch assignment mutation
  const { mutateAsync: assignTemplate, isPending: isAssigning } =
    useAssignTemplateToSelfMutation({})

  const handlePlanClick = (
    plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number],
  ) => {
    setSelectedPlan(plan)
    setIsPreviewOpen(true)
  }

  useEffect(() => {
    if (initialPlanId && data?.getPublicTrainingPlans) {
      const plan = data.getPublicTrainingPlans.find(
        (p) => p.id === initialPlanId,
      )
      if (plan) {
        startTransition(() => {
          setSelectedPlan(plan)
          setIsPreviewOpen(true)
        })
      }
    }
  }, [initialPlanId, data])

  const handleAssignTemplate = async (planId: string) => {
    try {
      await assignTemplate({
        planId,
      })

      toast.success('Plan added to My Plans')

      await queryClient.refetchQueries({
        queryKey: ['FitspaceMyPlans'],
      })

      router.push('/fitspace/my-plans')
    } catch (error) {
      console.error('Failed to add training plan to your plans:', error)

      // If error contains "limit reached" or "Premium", redirect to offers
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      if (
        errorMessage.includes('limit reached') ||
        errorMessage.includes('Premium') ||
        errorMessage.includes('subscription')
      ) {
        toast.error('Premium required')
        openUrl(
          `/account-management/offers?redirectUrl=/fitspace/explore/plan/${planId}`,
        )
      } else {
        toast.error('Failed to add training plan')
      }
    }
  }

  const toggleFocusTag = (tag: GQLFocusTag) => {
    setSelectedFocusTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    )
  }

  const clearAllFilters = () => {
    setSelectedFocusTags([])
    setSelectedDifficulty(null)
    setDaysPerWeek(null)
    setSessionMaxMins(90)
    setSort('recommended')
  }

  const handlePlanFinderSelect = (plan: PublicTrainingPlan) => {
    setSelectedPlan(plan)
    setIsPreviewOpen(true)
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <LoadingSkeleton count={3} variant="lg" />
      </div>
    )
  }

  // Get all public plans from the API (includes both free and premium)
  const allPlans = data?.getPublicTrainingPlans || []

  const availableFocusTags = (() => {
    const set = new Set<GQLFocusTag>()
    for (const plan of allPlans) {
      for (const tag of plan.focusTags ?? []) set.add(tag)
    }

    const preferredOrder: GQLFocusTag[] = [
      GQLFocusTag.Strength,
      GQLFocusTag.MuscleBuilding,
      GQLFocusTag.WeightLoss,
      GQLFocusTag.BodyRecomposition,
      GQLFocusTag.Bodyweight,
    ]

    const ordered = preferredOrder.filter((t) => set.has(t))
    const remaining = Array.from(set).filter((t) => !preferredOrder.includes(t))
    remaining.sort((a, b) =>
      (focusTagLabels[a] ?? a).localeCompare(focusTagLabels[b] ?? b),
    )

    return [...ordered, ...remaining]
  })()

  const filteredPlans = allPlans
    .filter((plan) => {
      // Filter by difficulty
      if (selectedDifficulty) {
        if (!plan.difficulty || plan.difficulty !== selectedDifficulty) {
          return false
        }
      }

      // Filter by focus tags - match ANY selected tag (OR logic)
      if (selectedFocusTags.length > 0) {
        const hasAnyTag = selectedFocusTags.some((selectedTag) =>
          plan.focusTags?.includes(selectedTag),
        )
        if (!hasAnyTag) return false
      }

      // Filter by days per week
      if (daysPerWeek) {
        const days = plan.sessionsPerWeek || 3
        if (daysPerWeek === 6) {
          // 6 means "6+" so accept 6 or more
          if (days < 6) return false
        } else if (days !== daysPerWeek) {
          return false
        }
      }

      // Filter by session max minutes (slider value, treat as max)
      if (sessionMaxMins < 90) {
        const planDuration = plan.avgSessionTime || 45
        if (planDuration > sessionMaxMins) return false
      }

      return true
    })
    .sort((a, b) => {
      switch (sort) {
        case 'recommended':
        case 'popular':
          // Recommended uses popularity as fallback
          return (b.assignmentCount || 0) - (a.assignmentCount || 0)
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        case 'shortest':
          return (a.avgSessionTime || 0) - (b.avgSessionTime || 0)
        default:
          return 0
      }
    })

  const resultsCount = filteredPlans.length

  return (
    <div className="space-y-4">
      <Button
        variant="secondary"
        size="lg"
        className="w-full rounded-full"
        iconStart={<Sparkles className="h-4 w-4" />}
        onClick={() => setIsPlanFinderOpen(true)}
      >
        Help me choose
      </Button>

      {/* Filter Section */}
      <TrainingPlanFilters
        selectedFocusTags={selectedFocusTags}
        availableFocusTags={availableFocusTags}
        selectedDifficulty={selectedDifficulty}
        daysPerWeek={daysPerWeek}
        sessionMaxMins={sessionMaxMins}
        sort={sort}
        resultsCount={resultsCount}
        onToggleFocusTag={toggleFocusTag}
        onSetDifficulty={setSelectedDifficulty}
        onSetDaysPerWeek={setDaysPerWeek}
        onSetSessionMaxMins={setSessionMaxMins}
        onSetSort={setSort}
        onClearAllFilters={clearAllFilters}
        onOpenPlanFinder={() => setIsPlanFinderOpen(true)}
      />

      {/* Results */}
      <div className="space-y-4">
        {isLoading ? (
          <LoadingSkeleton count={3} variant="lg" />
        ) : filteredPlans.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                No plans match your filters
              </p>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or browse all plans
              </p>
              <Button
                variant="tertiary"
                size="sm"
                onClick={clearAllFilters}
                className="mt-6 mx-auto"
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence mode="popLayout" initial={false}>
            {filteredPlans.map((plan) => (
              <motion.div
                key={plan.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <TrainingPlanCard
                  plan={plan}
                  onClick={() => handlePlanClick(plan)}
                  isPremium={plan.premium}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Plan Finder Drawer */}
      <Drawer
        open={isPlanFinderOpen}
        onOpenChange={(open) => !open && setIsPlanFinderOpen(false)}
      >
        <DrawerContent dialogTitle="Find your plan" className="h-[85vh]">
          <div className="p-4 h-full overflow-y-auto">
            <PlanFinder
              plans={allPlans}
              onSelectPlan={handlePlanFinderSelect}
              onClose={() => setIsPlanFinderOpen(false)}
            />
          </div>
        </DrawerContent>
      </Drawer>

      {/* Plan Preview Drawer */}
      <Drawer
        open={isPreviewOpen}
        onOpenChange={(open) => !open && setIsPreviewOpen(false)}
      >
        <DrawerContent
          dialogTitle={selectedPlan?.title || 'Plan'}
          grabberAbsolute
        >
          {selectedPlan && (
            <TrainingPlanPreviewContent
              plan={selectedPlan}
              onAssignTemplate={handleAssignTemplate}
              isAssigning={isAssigning}
              weeksData={selectedPlan}
            />
          )}
        </DrawerContent>
      </Drawer>
    </div>
  )
}

interface TrainingPlanCardProps {
  plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]
  onClick: () => void
  isPremium: boolean
}

const difficultyVariantMap = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const

function TrainingPlanCard({ plan, onClick }: TrainingPlanCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer hover:border-primary/50 transition-all overflow-hidden group relative dark',
        'shadow-lg shadow-neutral-400 dark:shadow-neutral-950 dark:border dark:border-border',
        'bg-cover bg-center',
      )}
      onClick={onClick}
      style={{
        backgroundImage: plan.heroImageUrl
          ? `url(${plan.heroImageUrl})`
          : 'none',
      }}
    >
      {/* Hero image background */}
      {plan.heroImageUrl && (
        <div className="absolute -inset-[0.5px] bg-linear-to-r from-black via-black/60 to-transparent" />
      )}

      <CardHeader className="relative pb-2">
        <CardTitle className="text-2xl text-foreground flex items-start justify-between gap-2">
          {plan.title}
        </CardTitle>
        {/* Metadata Row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-white/90 mt-1">
          <span className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            {plan.sessionsPerWeek || 3} days/wk
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />~{plan.avgSessionTime || 45} min
          </span>
          {formatUserCount(plan.assignmentCount) && (
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {formatUserCount(plan.assignmentCount)} started
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-2">
          {/* Focus Tags */}
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex flex-wrap gap-1">
              {plan.difficulty ? (
                <Badge
                  variant={difficultyVariantMap[plan.difficulty]}
                  className="capitalize"
                  size="md"
                >
                  {plan.difficulty.toLowerCase()}
                </Badge>
              ) : null}
              {plan.focusTags && plan.focusTags.length > 0
                ? plan.focusTags
                    .slice(0, 2)
                    .map((tag: GQLFocusTag, index: number) => (
                      <Badge key={index} variant="secondary" size="md">
                        {focusTagLabels[tag] || tag}
                      </Badge>
                    ))
                : null}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
