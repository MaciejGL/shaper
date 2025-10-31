'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

import { ButtonLink } from '@/components/ui/button-link'

export function HeroSection() {
  return (
    <section className="dark relative min-h-screen flex items-center justify-center px-4 pt-16 overflow-hidden bg-background">
      {/* Background Image - Right Aligned */}
      <div className="absolute inset-0 flex justify-end">
        <div className="relative w-full lg:w-3/5 h-full">
          <Image
            src="/homepage/hero-workout.png"
            alt="Hypro fitness app in action"
            fill
            className="object-cover object-left"
            priority
            sizes="(max-width: 1024px) 100vw, 60vw"
          />
        </div>
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content - On Top */}
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground">
              Build Your Physique,{' '}
              <span className="text-primary">Dominate Your Goals</span>
            </h1>
            <p className="text-lg md:text-xl max-w-[40ch] text-foreground mb-8 mx-auto lg:mx-0">
              Track workouts, follow personalized plans, and achieve your goals
              with top-tier trainers
            </p>
            <ButtonLink href="/login" size="xl" className="w-full sm:w-auto">
              Start Training Free
            </ButtonLink>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
