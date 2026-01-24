'use client'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar, Clock, Dumbbell, Layers, Users } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { startTransition, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { TrainerDiscoveryCta } from '@/components/trainer-discovery-cta'
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
  useStartFreeWorkoutDayMutation,
} from '@/generated/graphql-client'
import { useOpenUrl } from '@/hooks/use-open-url'
import { usePaymentRules } from '@/hooks/use-payment-rules'
import { queryInvalidation } from '@/lib/query-invalidation'
import { cn } from '@/lib/utils'
import { formatUserCount, getFakeUserCount } from '@/utils/format-user-count'

import { FreeWorkoutDay, PublicTrainingPlan } from './explore.client'
import { PlanFinder } from './plan-finder/plan-finder'
import { TrainingPlanPreviewContent } from './workout-day-preview/training-plan-preview-content'
import { UnifiedPreviewDrawer } from './workout-day-preview/unified-preview-drawer'

interface TrainingPlansTabProps {
  initialPlans?: PublicTrainingPlan[]
  initialPlanId?: string | null
  workouts: FreeWorkoutDay[]
}

type QuickPlanBadgeId =
  | 'first_time'
  | 'beginner'
  | 'intermediate'
  | 'expert'
  | 'fbw'
  | 'upper_lower'
  | 'ppl'
  | 'split'

type QuickPlanBadge =
  | {
      id: QuickPlanBadgeId
      label: string
      type: 'difficulty'
      difficulty: GQLDifficulty
    }
  | {
      id: QuickPlanBadgeId
      label: string
      type: 'title'
      keywords: readonly string[]
    }

const quickPlanBadges: readonly QuickPlanBadge[] = [
  {
    id: 'first_time',
    label: 'First time',
    type: 'title',
    keywords: ['kickstarter', 'first time', 'starter'],
  },
  {
    id: 'beginner',
    label: 'Beginner',
    type: 'difficulty',
    difficulty: GQLDifficulty.Beginner,
  },
  {
    id: 'intermediate',
    label: 'Intermediate',
    type: 'difficulty',
    difficulty: GQLDifficulty.Intermediate,
  },
  {
    id: 'expert',
    label: 'Expert',
    type: 'difficulty',
    difficulty: GQLDifficulty.Expert,
  },
  {
    id: 'fbw',
    label: 'FBW',
    type: 'title',
    keywords: ['full body', 'full-body', 'fbw', 'fullbody'],
  },
  {
    id: 'upper_lower',
    label: 'Upper/Lower',
    type: 'title',
    keywords: ['upper/lower', 'upper lower', 'upper-lower'],
  },
  {
    id: 'ppl',
    label: 'PPL',
    type: 'title',
    keywords: ['ppl', 'push pull legs', 'push/pull/legs', 'push-pull-legs'],
  },
  {
    id: 'split',
    label: 'Split',
    type: 'title',
    keywords: ['split', 'body split', 'bro split'],
  },
] as const

export function TrainingPlansTab({
  initialPlans = [],
  initialPlanId,
  workouts,
}: TrainingPlansTabProps) {
  const [selectedPlan, setSelectedPlan] = useState<
    GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number] | null
  >(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isPlanFinderOpen, setIsPlanFinderOpen] = useState(false)
  const [selectedDemoWorkout, setSelectedDemoWorkout] =
    useState<FreeWorkoutDay | null>(null)
  const [isDemoPreviewOpen, setIsDemoPreviewOpen] = useState(false)

  // Filters
  const [selectedFocusTags, setSelectedFocusTags] = useState<GQLFocusTag[]>([])
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<GQLDifficulty | null>(null)
  const [daysPerWeek, setDaysPerWeek] = useState<number | null>(null)
  const [sessionMaxMins, setSessionMaxMins] = useState<number>(90) // 90 = "Any"
  const [sort, setSort] = useState<SortOption>('popular')
  const [selectedQuickBadges, setSelectedQuickBadges] = useState<
    QuickPlanBadgeId[]
  >([])

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

  const { mutateAsync: startWorkoutDay, isPending: isStarting } =
    useStartFreeWorkoutDayMutation({
      onSuccess: (data) => {
        if (!data.startFreeWorkoutDay) return

        const { weekId, dayId } = data.startFreeWorkoutDay

        startTransition(() => {
          router.refresh()
          router.push(`/fitspace/workout?week=${weekId}&day=${dayId}`)
        })

        queryInvalidation.favouriteWorkoutStart(queryClient)
      },
    })

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

  const toggleQuickBadge = (badgeId: QuickPlanBadgeId) => {
    setSelectedQuickBadges((prev) => {
      const next = prev.includes(badgeId)
        ? prev.filter((id) => id !== badgeId)
        : [...prev, badgeId]

      const selectedDifficulties = new Set(
        next
          .map((id) => quickPlanBadges.find((b) => b.id === id))
          .filter((b) => b?.type === 'difficulty')
          .map(
            (b) =>
              (b as Extract<QuickPlanBadge, { type: 'difficulty' }>).difficulty,
          ),
      )

      if (selectedDifficulties.size === 1) {
        setSelectedDifficulty(Array.from(selectedDifficulties)[0] ?? null)
      } else if (selectedDifficulties.size > 1) {
        setSelectedDifficulty(null)
      } else {
        setSelectedDifficulty(null)
      }

      return next
    })
  }

  const handleSetDifficultyFromFilters = (difficulty: GQLDifficulty | null) => {
    setSelectedDifficulty(difficulty)

    setSelectedQuickBadges((prev) => {
      const next = prev.filter((id) => {
        const badge = quickPlanBadges.find((b) => b.id === id)
        return badge?.type !== 'difficulty'
      })

      if (difficulty === GQLDifficulty.Beginner) return [...next, 'beginner']
      if (difficulty === GQLDifficulty.Intermediate)
        return [...next, 'intermediate']
      if (difficulty === GQLDifficulty.Expert) return [...next, 'expert']

      return next
    })
  }

  const clearAllFilters = () => {
    setSelectedFocusTags([])
    setSelectedDifficulty(null)
    setDaysPerWeek(null)
    setSessionMaxMins(90)
    setSort('popular')
    setSelectedQuickBadges([])
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

  const demoWorkoutForSelectedPlan = selectedPlan
    ? (workouts.find((w) => w.plan?.id === selectedPlan.id) ?? null)
    : null

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

      // Quick badges
      if (selectedQuickBadges.length > 0) {
        const selectedBadges = selectedQuickBadges
          .map((id) => quickPlanBadges.find((b) => b.id === id))
          .filter(Boolean) as QuickPlanBadge[]

        const selectedDifficulties = new Set(
          selectedBadges
            .filter((b) => b.type === 'difficulty')
            .map((b) => b.difficulty),
        )

        const selectedTitleBadges = selectedBadges.filter(
          (b) => b.type === 'title',
        )

        if (selectedDifficulties.size > 0) {
          if (!plan.difficulty || !selectedDifficulties.has(plan.difficulty)) {
            return false
          }
        }

        if (selectedTitleBadges.length > 0) {
          const normalizedTitle = normalizeForKeywordMatch(plan.title)
          const matchesAny = selectedTitleBadges.some((b) =>
            b.keywords.some((k) =>
              normalizedTitle.includes(normalizeForKeywordMatch(k)),
            ),
          )
          if (!matchesAny) return false
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
        case 'popular':
          // Temporarily using fake counts for sorting
          return getFakeUserCount(b.id) - getFakeUserCount(a.id)
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
    <div>
      <div className="flex items-center mb-6 mt-2">
        <TrainerDiscoveryCta
          variant="banner"
          title="Find Your Plan"
          subtitle="Filter by your goals, experience level, days and time available"
          showBadge={false}
          className="w-full"
          onClick={() => setIsPlanFinderOpen(true)}
        />
      </div>

      <div
        className="overflow-x-auto hide-scrollbar -mx-4 max-w-screen overscroll-x-contain touch-pan-x bg-card"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <div className="flex gap-2 pl-4 pr-4 py-3 w-max">
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
            onSetDifficulty={handleSetDifficultyFromFilters}
            onSetDaysPerWeek={setDaysPerWeek}
            onSetSessionMaxMins={setSessionMaxMins}
            onSetSort={setSort}
            onClearAllFilters={clearAllFilters}
            onOpenPlanFinder={() => setIsPlanFinderOpen(true)}
          />
          {quickPlanBadges.map((badge) => {
            const selected = selectedQuickBadges.includes(badge.id)
            return (
              <Badge
                key={badge.id}
                asChild
                size="lg"
                variant={selected ? 'primary' : 'secondary'}
                className="rounded-full p-0 border border-neutral-300 dark:border-neutral-700"
              >
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleQuickBadge(badge.id)}
                  className="px-3 py-2"
                >
                  {badge.label}
                </button>
              </Badge>
            )
          })}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-1 -mx-4">
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
        direction="right"
      >
        <DrawerContent
          dialogTitle={selectedPlan?.title || 'Plan'}
          grabberAbsolute
          className="data-[vaul-drawer-direction=right]:max-w-screen data-[vaul-drawer-direction=right]:w-screen overflow-hidden data-[vaul-drawer-direction=right]:border-l-0"
        >
          {selectedPlan && (
            <TrainingPlanPreviewContent
              plan={selectedPlan}
              onAssignTemplate={handleAssignTemplate}
              isAssigning={isAssigning}
              weeksData={selectedPlan}
              hasDemoWorkoutDay={!!demoWorkoutForSelectedPlan}
              onTryDemoWorkoutDay={() => {
                if (!demoWorkoutForSelectedPlan) return
                setSelectedDemoWorkout(demoWorkoutForSelectedPlan)
                setIsDemoPreviewOpen(true)
              }}
            />
          )}
        </DrawerContent>
      </Drawer>

      <UnifiedPreviewDrawer
        initialView={
          selectedDemoWorkout
            ? { type: 'workout', data: selectedDemoWorkout }
            : null
        }
        isOpen={isDemoPreviewOpen}
        onClose={() => {
          setIsDemoPreviewOpen(false)
        }}
        onAnimationComplete={() => {
          setSelectedDemoWorkout(null)
        }}
        onStartWorkout={async (trainingDayId) => {
          try {
            await startWorkoutDay({
              input: {
                trainingDayId,
                replaceExisting: true,
              },
            })
            startTransition(() => {
              router.refresh()
              router.push(`/fitspace/workout`)
            })
          } catch (error) {
            console.error('Failed to start workout:', error)
            toast.error('Failed to start workout')
          }
        }}
        isStarting={isStarting}
        onAssignTemplate={handleAssignTemplate}
        isAssigning={isAssigning}
        availablePlans={allPlans}
        hidePreviewPlan
      />
    </div>
  )
}

interface TrainingPlanCardProps {
  plan: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]
  onClick: () => void
  isPremium: boolean
}

function normalizeForKeywordMatch(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

const difficultyVariantMap = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const

function TrainingPlanCard({ plan, onClick }: TrainingPlanCardProps) {
  const is10MinutesPlan = plan.title.toLowerCase().includes('10-minutes')
  const avgSessionMinutes = is10MinutesPlan
    ? 10
    : Math.ceil((plan.avgSessionTime ?? 45) / 5) * 5
  const weekCount = plan.weekCount ?? plan.weeks?.length

  const heroImageUrl =
    plan.heroImageUrl || '/images/training-plan-placeholder.png'
  return (
    <Card
      className={cn(
        'cursor-pointer hover:border-primary/50 transition-all overflow-hidden group relative dark',
        'rounded-none shadow-none border-y-0 border-x-0',
        'bg-cover bg-center',
      )}
      onClick={onClick}
    >
      {heroImageUrl ? (
        <Image
          src={heroImageUrl}
          alt={`${plan.title} cover`}
          fill
          className="object-cover"
          quality={100}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : null}
      {heroImageUrl && (
        <div className="absolute -inset-[0.5px] bg-linear-to-r from-black via-black/60 to-transparent" />
      )}

      <CardHeader className="relative pb-2">
        <CardTitle className="text-2xl text-foreground flex items-start justify-between gap-2">
          {plan.title}
        </CardTitle>
        {/* Metadata Row */}
        <div className="flex flex-col gap-y-2 text-sm font-medium text-white/90 mt-1">
          <p className="flex items-center gap-1">
            <Calendar className="size-4" />
            {plan.sessionsPerWeek || 3} days/week
          </p>
          {weekCount ? (
            <p className="flex items-center gap-1">
              <Layers className="size-4" />
              {weekCount} {weekCount === 1 ? 'week' : 'weeks'}
            </p>
          ) : null}
          <p className="flex items-center gap-1">
            <Clock className="size-4" />~{avgSessionMinutes} min
          </p>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-2">
          {/* Focus Tags */}
          <div className="flex flex-col gap-2 mt-2">
            {plan.difficulty ? (
              <Badge
                variant={difficultyVariantMap[plan.difficulty]}
                className="capitalize"
                size="md-lg"
              >
                {plan.difficulty.toLowerCase()}
              </Badge>
            ) : null}
            <div className="flex flex-wrap gap-1">
              {plan.focusTags && plan.focusTags.length > 0
                ? plan.focusTags
                    .slice(0, 2)
                    .map((tag: GQLFocusTag, index: number) => (
                      <Badge key={index} variant="secondary" size="md-lg">
                        {focusTagLabels[tag] || tag}
                      </Badge>
                    ))
                : null}
              <Badge
                variant="glass"
                className="flex items-center gap-1 ml-auto border-transparent"
                size="lg"
              >
                <Users className="h-3 w-3" />
                {formatUserCount(getFakeUserCount(plan.id))}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
