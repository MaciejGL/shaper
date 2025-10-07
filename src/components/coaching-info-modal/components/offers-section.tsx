'use client'

import {
  Calendar,
  CheckCircle,
  LucideIcon,
  Notebook,
  Utensils,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionIcon, SectionIconProps } from '@/components/ui/section-icon'
import { useOfferPrices } from '@/hooks/use-offer-prices'
import { DISCOUNT_CONFIG, DISCOUNT_LABELS } from '@/lib/stripe/discount-config'
import { cn } from '@/lib/utils'

interface ServiceOffer {
  id: string
  title: string
  description: string
  features: string[]
  duration: string
  icon: LucideIcon
  badge?: string
  popular?: boolean
  variant?: SectionIconProps['variant']
}

const serviceOffers: ServiceOffer[] = [
  {
    id: 'coaching-combo',
    title: 'Premium Coaching Package',
    description:
      'Premium Coaching experience with ongoing support, plan adjustments, and regular check-ins.',
    features: [
      'Everything from workout + meal plans',
      'Bi-Weekly video check-ins',
      '1x in-person training session a month',
      `-${DISCOUNT_CONFIG.IN_PERSON_COACHING_COMBO}% off for additional 1x in-person training session`,
      'Plan adjustments based on progress',
      'Premium access',
      'Unlimited messaging support',
    ],
    duration: 'Monthly',
    icon: Calendar,
    badge: 'Best Value',
    variant: 'amber',
  },
  {
    id: 'meal-training-bundle',
    title: 'Meal + Training Bundle',
    description:
      'Get both custom workout and nutrition plans together with a special discount.',
    features: [
      'Custom 4-week+ workout program',
      '7-day meal plan with recipes',
      'Fitness & nutrition assessment',
      'Shopping list & macro guidelines',
      `${DISCOUNT_CONFIG.MEAL_TRAINING_BUNDLE}% bundle discount`,
    ],
    duration: 'One-time',
    icon: Notebook,
    badge: DISCOUNT_LABELS.MEAL_TRAINING_BUNDLE,
    variant: 'green',
  },
  {
    id: 'workout-plan',
    title: 'Custom Workout Plan',
    description:
      'Personalized training program designed specifically for your goals, experience level, and available equipment.',
    features: ['Initial fitness assessment', '4-week custom workout program'],
    duration: 'One-time',
    icon: Notebook,
    variant: 'green',
  },
  {
    id: 'meal-plan',
    title: 'Nutrition Plan',
    description:
      'Customized meal plan with recipes, shopping lists, and macro guidelines to support your fitness goals.',
    features: [
      'Detailed nutrition assessment',
      '7 day meal plan with recipes',
      'Shopping list',
      'Macro and calorie guidelines',
      'Dietary preferences accommodated',
    ],
    duration: 'One-time',
    icon: Utensils,
    variant: 'sky',
  },

  {
    id: 'in-person',
    title: 'In-Person Sessions',
    description:
      'One-on-one training sessions at the gym with hands-on guidance and form correction.',
    features: [
      'Personalized in-person training if applicable',
      'Real-time form correction',
      'Equipment familiarization',
      'Flexible scheduling',
    ],
    duration: 'Per session',
    icon: CheckCircle,
    variant: 'indigo',
  },
]

export function OffersSection() {
  const { prices, isLoading } = useOfferPrices()

  const cardVariant = (offer: ServiceOffer) => {
    if (offer.badge === 'Best Value')
      return cn('outline outline-amber-500 dark:outline-amber-500 shadow-lg')
    if (offer.badge === DISCOUNT_LABELS.MEAL_TRAINING_BUNDLE)
      return cn('outline outline-green-500 dark:outline-green-500 shadow-lg')
    return ''
  }

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold">Available Coaching Services</h3>
        <p className="text-sm text-muted-foreground">
          Trainers offer different service packages.
        </p>
      </div>

      <div className="grid gap-4">
        {serviceOffers.map((offer) => (
          <Card key={offer.id} className={cn(cardVariant(offer))}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <SectionIcon
                    icon={offer.icon}
                    size="sm"
                    variant={offer.variant}
                  />
                  <div>
                    <CardTitle className="text-base">{offer.title}</CardTitle>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isLoading && 'masked-placeholder-text',
                        )}
                      >
                        {isLoading ? 'Loading...' : prices[offer.id] || ''}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        {offer.duration}
                      </span>
                    </div>
                  </div>
                </div>
                {offer.badge && (
                  <Badge
                    variant={
                      offer.badge === 'Most Popular' ? 'primary' : 'premium'
                    }
                    className="text-xs"
                  >
                    {offer.badge}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <p className="text-sm text-muted-foreground">
                {offer.description}
              </p>
              <ul className="space-y-1">
                {offer.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-start gap-2 text-sm text-muted-foreground"
                  >
                    <CheckCircle className="size-3 text-green-600 shrink-0 mt-1" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
