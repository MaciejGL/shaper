'use client'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Dumbbell, Star, Users } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { startTransition, useEffect, useState } from 'react'
import { toast } from 'sonner'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import {
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
import { formatUserCount } from '@/utils/format-user-count'

import { PublicTrainingPlan } from './explore.client'
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
  const [selectedFocusTags, setSelectedFocusTags] = useState<GQLFocusTag[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<
    GQLDifficulty[]
  >([])
  const queryClient = useQueryClient()
  const router = useRouter()
  const { openUrl } = useOpenUrl({
    errorMessage: 'Failed to open subscription plans',
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

  const toggleDifficulty = (difficulty: GQLDifficulty) => {
    setSelectedDifficulties((prev) =>
      prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty],
    )
  }

  const clearAllFilters = () => {
    setSelectedFocusTags([])
    setSelectedDifficulties([])
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

  const filteredPlans = allPlans.filter((plan) => {
    // Filter by difficulty - plan must match ANY selected difficulty (OR logic)
    if (selectedDifficulties.length > 0) {
      if (!plan.difficulty || !selectedDifficulties.includes(plan.difficulty)) {
        return false
      }
    }

    // Filter by focus tags - plan must have ALL selected tags (AND logic)
    if (selectedFocusTags.length > 0) {
      return selectedFocusTags.every((selectedTag) =>
        plan.focusTags?.includes(selectedTag),
      )
    }

    return true
  })

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <TrainingPlanFilters
        selectedFocusTags={selectedFocusTags}
        selectedDifficulties={selectedDifficulties}
        onToggleFocusTag={toggleFocusTag}
        onToggleDifficulty={toggleDifficulty}
        onClearAllFilters={clearAllFilters}
      />

      {/* Results */}
      <div className="space-y-3">
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

      {/* Plan Preview Drawer */}
      <Drawer
        open={isPreviewOpen}
        onOpenChange={(open) => !open && setIsPreviewOpen(false)}
      >
        <DrawerContent
          dialogTitle={selectedPlan?.title || 'Plan'}
          grabber={false}
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
      className="cursor-pointer hover:border-primary/50 transition-all overflow-hidden group relative dark border-none"
      onClick={onClick}
    >
      {/* Hero image background */}
      {plan.heroImageUrl && (
        <div className="absolute inset-0 opacity-100 group-hover:opacity-30 transition-opacity">
          <Image
            src={plan.heroImageUrl}
            alt={plan.title}
            fill
            className="object-cover"
            quality={100}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        </div>
      )}

      <CardHeader className="relative">
        <CardTitle className="text-2xl text-foreground flex items-start justify-between gap-2">
          {plan.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-2">
          {/* Focus Tags */}
          <div className="flex flex-col gap-2">
            {plan.difficulty ? (
              <Badge
                variant={difficultyVariantMap[plan.difficulty]}
                className="capitalize"
                size="md"
              >
                {plan.difficulty.toLowerCase()}
              </Badge>
            ) : null}
            {plan.focusTags && plan.focusTags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {plan.focusTags
                  .slice(0, 2)
                  .map((tag: GQLFocusTag, index: number) => (
                    <Badge key={index} variant="secondary" size="md">
                      {focusTagLabels[tag] || tag}
                    </Badge>
                  ))}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div>{plan.weekCount} weeks</div>

            {/* Assignment count for all plans */}
            {formatUserCount(plan.assignmentCount) ? (
              <Badge>
                <span>{formatUserCount(plan.assignmentCount)}</span>
                <Users className="h-3 w-3" />
              </Badge>
            ) : null}

            {/* Show rating only for premium plans */}
            {plan.premium && plan.rating ? (
              <div className="flex items-center gap-1 text-xs text-foreground">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{plan.rating}</span>
                <span className="text-muted-foreground">
                  ({plan.totalReviews})
                </span>
              </div>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
