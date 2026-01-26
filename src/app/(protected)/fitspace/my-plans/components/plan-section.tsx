'use client'

import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from '@/components/ui/carousel'
import { useTrainerServiceAccess } from '@/hooks/use-trainer-service-access'
import { cn } from '@/lib/utils'

import { UnifiedPlan } from '../types'
import { getPlanImage } from '../utils'

import { PlanCarouselCard } from './plan-carousel-card'
import { PromoPlanCard } from './promo-plan-card'

interface PlanSectionProps {
  title: string
  plans: UnifiedPlan[]
  onPlanClick: (plan: UnifiedPlan) => void
  showProgress?: boolean
  showEmptyState?: boolean
  showPromoCard?: boolean
  titleLink?: string
  showCoachingBadge?: boolean
}

interface SectionHeaderProps {
  title: string
  count: number
  titleLink?: string
  children?: React.ReactNode
}

function SectionHeader({
  title,
  count,
  titleLink,
  children,
}: SectionHeaderProps) {
  const titleContent = (
    <>
      <h2 className="text-xl font-semibold">{title}</h2>
      <Badge variant="primary" size="sm" className="rounded-2xl min-w-[22px]">
        {count}
      </Badge>
    </>
  )

  return (
    <div className="flex items-center justify-between">
      {titleLink ? (
        <Link href={titleLink} className="flex items-center gap-2">
          {titleContent}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <div className="flex items-center gap-2">{titleContent}</div>
      )}
      {children}
    </div>
  )
}

export function PlanSection({
  title,
  plans,
  onPlanClick,
  showProgress = true,
  showEmptyState = false,
  showPromoCard = false,
  titleLink,
  showCoachingBadge = false,
}: PlanSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { isTrainerServiceEnabled } = useTrainerServiceAccess()

  if (plans.length === 0 && !showEmptyState && !showPromoCard) {
    return null
  }

  if (plans.length === 0 && showEmptyState) {
    const emptyStateDescription = isTrainerServiceEnabled
      ? 'Explore ready-made plans or get a personalized one from a trainer'
      : 'Explore ready-made workout plans to get started'

    return (
      <Card variant="glass" className="">
        <div className="px-4">
          <SectionHeader title={title} count={plans.length} />
        </div>
        <CardContent className="flex items-end gap-4 py-6">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">No Template Plans</h4>
            <p className="text-sm text-muted-foreground">
              {emptyStateDescription}
            </p>
          </div>
          <ButtonLink
            href="/fitspace/explore?tab=plans"
            size="sm"
            iconEnd={<ChevronRight />}
          >
            Explore
          </ButtonLink>
        </CardContent>
      </Card>
    )
  }

  // Show promo card when no plans but promo is enabled
  if (showPromoCard) {
    return (
      <div className="space-y-4">
        <SectionHeader
          title={title}
          count={plans.length}
          titleLink={titleLink}
        />
        <PromoPlanCard />
      </div>
    )
  }

  const maxPlans = 6

  return (
    <div className="space-y-4 bg-card -mx-4 px-4 py-0">
      <SectionHeader title={title} count={plans.length} titleLink={titleLink}>
        {plans.length > 2 && (
          <Button
            variant="link"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            iconEnd={
              <ChevronRight
                className={cn(
                  'transition-transform duration-300',
                  isExpanded ? 'rotate-90' : 'rotate-0',
                )}
              />
            }
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={isExpanded ? 'less' : 'all'}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15 }}
              >
                {isExpanded ? 'Show Less' : 'View All'}
              </motion.span>
            </AnimatePresence>
          </Button>
        )}
      </SectionHeader>

      <AnimatePresence mode="wait">
        <LayoutGroup id="plan-section" key={`plan-section-`}>
          {!isExpanded ? (
            <div className="overflow-x-hidden -mx-4 px-4 pb-6">
              <Carousel
                opts={{
                  align: 'start',
                  dragFree: true,
                }}
                className="w-screen md:w-[calc(100%+2rem)] space-y-3 -mx-4 overflow-visible"
              >
                <CarouselContent
                  className="ml-0"
                  containerClassName="overflow-visible"
                >
                  {plans.slice(0, maxPlans).map((plan) => (
                    <CarouselItem
                      key={
                        plan?.id ? `${plan.id}-carousel-item` : `carousel-item`
                      }
                      className={cn('basis-[55%] pl-4')}
                    >
                      <PlanCarouselCard
                        key={plan?.id}
                        plan={plan}
                        onClick={onPlanClick}
                        imageUrl={getPlanImage(plan)}
                        showProgress={showProgress}
                        layoutId={`plan-${plan?.id}`}
                        showCoachingBadge={showCoachingBadge}
                      />
                    </CarouselItem>
                  ))}
                  <div className="w-4 shrink-0" />
                </CarouselContent>

                {plans.length > 2 && (
                  <CarouselDots count={plans.length} className="px-4" />
                )}
              </Carousel>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {plans.map((plan) => (
                <PlanCarouselCard
                  key={plan?.id}
                  plan={plan}
                  onClick={onPlanClick}
                  imageUrl={getPlanImage(plan)}
                  isExpanded
                  showProgress={showProgress}
                  layoutId={`plan-${plan?.id}`}
                />
              ))}
            </div>
          )}
        </LayoutGroup>
      </AnimatePresence>
    </div>
  )
}
