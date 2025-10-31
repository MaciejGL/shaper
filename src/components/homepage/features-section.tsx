'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface Feature {
  title: string
  description: string
  imagePath: string
  imageAlt: string
}

const features: Feature[] = [
  {
    title: 'Track Every Rep',
    description:
      'Log workouts in real-time with intuitive tracking. Sets, reps, weight, and RPE - all at your fingertips',
    imagePath: '/homepage/workout-tracking.png',
    imageAlt:
      'Workout tracking interface showing exercise list and set logging',
  },
  {
    title: 'Watch Your Progress',
    description:
      'Visualize your strength gains, consistency, and body transformation with detailed analytics',
    imagePath: '/homepage/progress-analytics.png',
    imageAlt: 'Progress analytics dashboard with charts and workout heatmap',
  },
  // {
  //   title: 'Follow Expert Plans',
  //   description:
  //     'Get personalized training programs from professional coaches, updated based on your progress',
  //   imagePath: '/homepage/training-plans.png',
  //   imageAlt: 'Training plan view with weekly schedule and exercises',
  // },
  // {
  //   title: 'Stay Connected',
  //   description:
  //     'Message your trainer anytime for form checks, adjustments, and motivation',
  //   imagePath: '/homepage/trainer-messages.png',
  //   imageAlt: 'Messaging interface with trainer conversation',
  // },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 bg-card/50">
      <div className="container mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-foreground">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Professional tools that make fitness tracking effortless and
            effective
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="flex flex-col"
            >
              {/* Feature Image */}
              <div className="relative aspect-[9/17] w-full max-w-sm mx-auto mb-6 rounded-2xl overflow-hidden">
                <Image
                  src={feature.imagePath}
                  alt={feature.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>

              {/* Feature Content */}
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
