import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const journeySteps = [
  {
    step: 1,
    title: 'Chat with your trainer',
    description:
      'Free consultation to discuss your goals and find the perfect fit.',
    image: '/coaching-info/person-filling-out-form-on-phone.jpg',
    badge: 'Free & Easy',
  },
  {
    step: 2,
    title: 'Receive your custom offer',
    description:
      'Get a personalized coaching package with pricing tailored to your needs.',
    image: '/coaching-info/trainer-creating-workout-plan-on-computer.jpg',
    badge: 'Custom Pricing',
  },
  {
    step: 3,
    title: 'Start your journey',
    description:
      'Accept the offer and your trainer will create your personalized workout plans.',
    image: '/coaching-info/person-making-secure-payment-on-phone.jpg',
    badge: 'Secure Payment',
  },
  {
    step: 4,
    title: 'Train with ongoing support',
    description:
      'Follow your plan, track progress, and get continuous adjustments from your trainer.',
    image: '/coaching-info/person-working-out-with-trainer-guidance.jpg',
    badge: 'Always There',
  },
]
export function ProcessTimeline() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Your Coaching Journey</h3>
        <p className="text-muted-foreground">
          Here's exactly what happens when you request coaching
        </p>
      </div>

      <div className="relative">
        <div className="space-y-4">
          {journeySteps.map((step) => (
            <div
              key={step.step}
              className={cn('relative flex items-center gap-4 pb-4')}
            >
              {/* Image */}
              <div className="flex-shrink-0 w-1/3">
                <Image
                  src={step.image || '/placeholder.svg'}
                  alt={step.title}
                  className="size-full rounded-lg object-cover"
                  width={150}
                  height={150}
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-2 w-full">
                    <div className="size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold text-sm flex-shrink-0">
                      {step.step}
                    </div>
                    <h4 className="font-semibold text-sm">{step.title}</h4>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground leading-snug">
                  {step.description}
                </p>
                <Badge variant="secondary" className="text-xs px-2 py-0 mt-2">
                  {step.badge}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
