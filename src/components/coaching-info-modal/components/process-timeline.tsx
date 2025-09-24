import Image from 'next/image'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const journeySteps = [
  {
    step: 1,
    title: 'Request Coaching',
    description: 'Submit your request and complete survey.',
    image: '/coaching-info/person-filling-out-form-on-phone.jpg',
    badge: 'Free & Non-Binding',
  },
  {
    step: 2,
    title: 'Trainer Review',
    description: 'Trainer reviews submission and contacts you.',
    image: '/coaching-info/trainer-reviewing-client-profile-on-tablet.jpg',
    badge: '24-48h',
  },
  {
    step: 3,
    title: 'Free Consultation',
    description: '30-minute call to discuss your needs and expectations.',
    image: '/coaching-info/video-call-between-trainer-and-client.jpg',
    badge: '30min',
  },
  {
    step: 4,
    title: 'Custom Proposal',
    description: 'Personalized offer tailored to your needs and preferences.',
    image: '/coaching-info/trainer-creating-workout-plan-on-computer.jpg',
    badge: 'Custom',
  },
  {
    step: 5,
    title: 'Accept & Pay',
    description: 'Review proposal and pay when ready to commit.',
    image: '/coaching-info/person-making-secure-payment-on-phone.jpg',
    badge: 'Secure',
  },
  {
    step: 6,
    title: 'Start Training',
    description: 'Begin your personalized coaching program with your trainer.',
    image: '/coaching-info/person-working-out-with-trainer-guidance.jpg',
    badge: 'Go!',
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

                <p className="text-sm text-muted-foreground leading-relaxed">
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
