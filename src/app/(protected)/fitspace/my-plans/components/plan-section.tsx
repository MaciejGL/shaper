'use client'

import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { CardContent } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from '@/components/ui/carousel'
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
}

export function PlanSection({
  title,
  plans,
  onPlanClick,
  showProgress = true,
  showEmptyState = false,
  showPromoCard = false,
  titleLink,
}: PlanSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (plans.length === 0 && !showEmptyState && !showPromoCard) {
    return null
  }

  if (plans.length === 0 && showEmptyState) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        <CardContent className="flex items-center gap-4 py-6">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm mb-1">No Template Plans</h4>
            <p className="text-sm text-muted-foreground">
              Explore ready-made plans or get a personalized one from a trainer
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
      </div>
    )
  }

  // Show promo card when no plans but promo is enabled
  if (showPromoCard) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          {titleLink ? (
            <Link href={titleLink} className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{title}</h2>{' '}
              <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <h2 className="text-lg font-semibold">{title}</h2>
          )}
        </div>
        <div className="w-[60%]">
          <PromoPlanCard />
        </div>
      </div>
    )
  }

  const maxPlans = 6

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        {titleLink ? (
          <Link href={titleLink} className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">{title}</h2>{' '}
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <h2 className="text-lg font-semibold">{title}</h2>
        )}
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
                {isExpanded ? 'Show Less' : 'See All'}
              </motion.span>
            </AnimatePresence>
          </Button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <LayoutGroup id="plan-section" key={`plan-section-`}>
          {!isExpanded ? (
            <div>
              <Carousel
                opts={{
                  align: 'start',
                  dragFree: true,
                }}
                className="w-screen space-y-3 -mx-4"
              >
                <CarouselContent className="ml-0">
                  {plans.slice(0, maxPlans).map((plan) => (
                    <CarouselItem
                      key={
                        plan?.id ? `${plan.id}-carousel-item` : `carousel-item`
                      }
                      className={cn('basis-[60%] md:basis-[20%] pl-4')}
                    >
                      <PlanCarouselCard
                        key={plan?.id}
                        plan={plan}
                        onClick={onPlanClick}
                        imageUrl={getPlanImage(plan)}
                        showProgress={showProgress}
                        layoutId={`plan-${plan?.id}`}
                      />
                    </CarouselItem>
                  ))}
                  <div className="w-4 shrink-0" />
                </CarouselContent>

                {plans.length > 1 && (
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
