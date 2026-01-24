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
import { DISCOUNT_CONFIG } from '@/lib/stripe/discount-config'
import { cn } from '@/lib/utils'

interface ServiceOffer {
  id: string
  title: string
  description: string
  features: string[]
  icon: LucideIcon
  badge?: string
  popular?: boolean
  variant?: SectionIconProps['variant']
}

const serviceOffers: ServiceOffer[] = [
  {
    id: 'premium-coaching',
    title: 'Trainer Coaching Package',
    description:
      'Ongoing coaching support with regular check-ins and trainer-led plan updates.',
    features: [
      'Trainer-created workout + nutrition plan updates',
      'Bi-Weekly check-ins',
      '1x in-person training session a month',
      `-${DISCOUNT_CONFIG.IN_PERSON_COACHING_COMBO}% off for additional in-person training sessions`,
      'Plan adjustments based on progress',
      'Premium access',
      'Ongoing support between sessions',
    ],
    icon: Calendar,
    badge: 'Best Value',
    variant: 'amber',
  },
  {
    id: 'workout-plan',
    title: 'Assessment + Custom Training Plan',
    description:
      'A trainer-led assessment and a personalized training plan based on your goals, experience level, and available equipment.',
    features: [
      'Trainer assessment',
      'Bi-Weekly check-ins',
      '4-week training plan',
    ],
    icon: Notebook,
    variant: 'green',
  },
  {
    id: 'nutrition-plan',
    title: 'Assessment + Nutrition Guidance',
    description:
      'A trainer-led nutrition assessment and personalized guidance to support your goals.',
    features: [
      'Trainer nutrition assessment',
      'Meal structure and macro guidance',
      'Dietary preferences accommodated',
      'Bi-Weekly check-ins',
    ],
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
    icon: CheckCircle,
    variant: 'indigo',
  },
]

export function OffersSection() {
  const { prices, isLoading } = useOfferPrices()

  const cardVariant = (offer: ServiceOffer) => {
    if (offer.badge === 'Best Value')
      return cn('outline outline-amber-500 dark:outline-amber-500 shadow-lg')
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
            <CardHeader>
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
            <CardContent className="pt-0 space-y-6">
              <p className="text-sm">{offer.description}</p>
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
