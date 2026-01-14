import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const journeySteps = [
  {
    step: 1,
    title: 'Schedule a free assessment',
    description:
      'Meet your trainer in person or via phone/video outside the app to discuss your goals.',
    image: '/coaching-info/person-filling-out-form-on-phone.jpg',
    badge: 'Free & Easy',
  },
  {
    step: 2,
    title: 'Receive a trainer service offer',
    description:
      "Your trainer prepares an offer based on your assessment. You'll get a notification when it’s ready.",
    image: '/coaching-info/trainer-creating-workout-plan-on-computer.jpg',
    badge: 'Custom Pricing',
  },
  {
    step: 3,
    title: 'Review and pay securely',
    description:
      'Review the offer in the app and complete payment in secure checkout.',
    image: '/coaching-info/person-making-secure-payment-on-phone.jpg',
    badge: 'Secure Payment',
  },
  {
    step: 4,
    title: 'Train with ongoing support',
    description:
      'Continue sessions outside the app. Plans and updates are delivered here as part of the service.',
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
