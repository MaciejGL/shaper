'use client'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Crown, Dumbbell, Star, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import {
  FilterType,
  TrainingPlanFilters,
  focusTagLabels,
} from '@/components/training-plan/training-plan-filters'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  GQLDifficulty,
  GQLFocusTag,
  GQLGetPublicTrainingPlansQuery,
  useAssignTemplateToSelfMutation,
  useGetPublicTrainingPlansQuery,
} from '@/generated/graphql-client'
import { formatUserCount } from '@/utils/format-user-count'

import { PublicTrainingPlan } from './explore.client'
import { TrainingPlanPreview } from './training-plan-preview/training-plan-preview'

interface TrainingPlansTabProps {
  initialPlans?: PublicTrainingPlan[]
}

export function TrainingPlansTab({ initialPlans = [] }: TrainingPlansTabProps) {
  const [selectedPlan, setSelectedPlan] = useState<
    GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number] | null
  >(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [selectedFocusTags, setSelectedFocusTags] = useState<GQLFocusTag[]>([])
  const [selectedDifficulties, setSelectedDifficulties] = useState<
    GQLDifficulty[]
  >([])
  const queryClient = useQueryClient()
  const router = useRouter()
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

      // Redirect to my-plans page
      router.push('/fitspace/my-plans')
    } catch (error) {
      console.error('Failed to add training plan to your plans:', error)
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
    setActiveFilter('all')
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
  const allPublicPlans = (data?.getPublicTrainingPlans || []).map((plan) => ({
    ...plan,
    isPremium: plan.premium || false,
    focusTags: plan.focusTags || [],
    targetGoals: plan.targetGoals || [],
  }))

  // Separate into free and premium plans
  const freePlans = allPublicPlans.filter((plan) => !plan.premium)
  const premiumPlans = allPublicPlans.filter((plan) => plan.premium)

  // Combine and filter plans
  const allPlans = [...freePlans, ...premiumPlans]

  const filteredPlans = allPlans.filter((plan) => {
    // Filter by type (free/premium/all)
    if (activeFilter === 'free' && plan.premium) return false
    if (activeFilter === 'premium' && !plan.premium) return false

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
        activeFilter={activeFilter}
        selectedFocusTags={selectedFocusTags}
        selectedDifficulties={selectedDifficulties}
        onFilterChange={setActiveFilter}
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
      <TrainingPlanPreview
        plan={selectedPlan}
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        onAssignTemplate={handleAssignTemplate}
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

const difficultyVariantMap = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} as const

function TrainingPlanCard({ plan, onClick }: TrainingPlanCardProps) {
  return (
    <Card
      className="cursor-pointer hover:border-primary/50 transition-colors"
      onClick={onClick}
    >
      <CardHeader>
        <CardTitle className="flex items-start justify-between gap-2">
          {plan.title}
          {plan.premium ? (
            <Badge variant="premium">
              <Crown className="h-2 w-2 mr-1" />
              Premium
            </Badge>
          ) : (
            <Badge variant="secondary">Free</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Focus Tags */}
          <div className="flex flex-col gap-2">
            {plan.difficulty ? (
              <Badge
                variant={difficultyVariantMap[plan.difficulty]}
                className="capitalize"
                size="lg"
              >
                {plan.difficulty.toLowerCase()}
              </Badge>
            ) : null}
            {plan.focusTags && plan.focusTags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {plan.focusTags
                  .slice(0, 2)
                  .map((tag: GQLFocusTag, index: number) => (
                    <Badge key={index} variant="secondary" size="lg">
                      {focusTagLabels[tag] || tag}
                    </Badge>
                  ))}
                {plan.focusTags.length > 2 && (
                  <Badge variant="secondary" size="lg">
                    +{plan.focusTags.length - 2}
                  </Badge>
                )}
              </div>
            ) : null}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {plan.weekCount} weeks
              </div>
            </div>

            {/* Assignment count for all plans */}
            {formatUserCount(plan.assignmentCount) ? (
              <div className="flex items-center gap-2 text-xs">
                <span>{formatUserCount(plan.assignmentCount)}</span>
                <Users className="h-3 w-3" />
              </div>
            ) : null}

            {/* Show rating only for premium plans */}
            {plan.premium && plan.rating ? (
              <div className="flex items-center gap-1 text-xs">
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
