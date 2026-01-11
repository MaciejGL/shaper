'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

import { cn } from '@/lib/utils'

interface Feature {
  title: string
  description: string
  imagePath: string
  imageAlt: string
}

const features: Feature[] = [
  {
    title: 'Structured Workouts',
    description:
      'Stop guessing what to do. Follow structured workouts built around progressive overload. Log sets, reps and weight in seconds with an interface designed for serious lifters.',
    imagePath: '/homepage/workout.png',
    imageAlt: 'Workout view showing a structured training session',
  },
  {
    title: 'IFBB Pro Personal Trainers',
    description:
      'Train with IFBB Pro coaches and experienced personal trainers. Get plans that match your goal and training level, and message your coach directly for form checks and advice.',
    imagePath: '/homepage/trainers.png',
    imageAlt: 'Personal trainers and coaching support for structured workouts',
  },
  {
    title: 'Smart Guidance',
    description:
      'Track your activity and muscle volume over time. Every exercise comes with video demos, step-by-step instructions, and pro tips to help you nail your form and maximize gains.',
    imagePath: '/homepage/guidence.png',
    imageAlt:
      'Exercise guidance showing video instructions, muscle tracking, and training tips',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-4 bg-background">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col gap-24 lg:gap-32">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.8 }}
              className={cn(
                'grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center',
                index % 2 === 1 && 'lg:grid-flow-dense',
              )}
            >
              {/* Text Content */}
              <div
                className={cn(
                  'flex flex-col gap-6 text-center lg:text-left',
                  index % 2 === 1 && 'lg:col-start-2',
                )}
              >
                <div className="inline-flex items-center justify-center lg:justify-start gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    0{index + 1}
                  </span>
                  <span className="text-sm font-medium text-primary uppercase tracking-wider">
                    {feature.title}
                  </span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  {feature.title === 'Structured Workouts'
                    ? 'Track Progress, Not Just Workouts'
                    : feature.title === 'IFBB Pro Personal Trainers'
                      ? 'Expert Coaching in Your Pocket'
                      : 'Every Rep, Perfected'}
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed max-w-md mx-auto lg:mx-0">
                  {feature.description}
                </p>
              </div>

              {/* Feature Image */}
              <div
                className={cn(
                  'relative aspect-4/5 w-full max-w-xl mx-auto',
                  index % 2 === 1 && 'lg:col-start-1',
                )}
              >
                <Image
                  src={feature.imagePath}
                  alt={feature.imageAlt}
                  fill
                  className="object-contain"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
