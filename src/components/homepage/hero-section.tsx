'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

import { ButtonLink } from '@/components/ui/button-link'
import { analyticsEvents } from '@/lib/analytics-events'

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center pt-16 overflow-hidden bg-background">
      <Image
        src="/homepage/hero.png"
        alt="Athlete performing a deadlift"
        fill
        className="object-cover"
        priority
        sizes="800px"
      />
      <div className="absolute inset-0 bg-linear-to-r from-background via-background/40 to-transparent max-md:backdrop-blur-sm" />

      <div className="container mx-auto max-w-7xl px-4 relative z-10">
        <div className="max-w-2xl">
          {/* Left: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-8 text-foreground leading-[1.1]">
              Structured workouts.{' '}
              <span className="text-primary block mt-2">Simple tracking.</span>
            </h1>
            <p className="text-xl text-foreground mb-10 max-w-[36ch] leading-relaxed">
              Follow a clear plan, log your sets fast, and train with IFBB Pro
              personal trainers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <ButtonLink
                href="/login"
                size="xl"
                className="w-full sm:w-auto text-lg h-14 px-8"
                onClick={() => {
                  analyticsEvents.authLandingCtaClick({ cta: 'hero' })
                }}
              >
                Start Training Now
              </ButtonLink>
            </div>

            <Link
              href="/login"
              className="mt-12 flex items-center gap-4 text-sm font-medium text-foreground bg-white/10 rounded-3xl p-4 shadow-sm backdrop-blur-sm cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-primary border-2 border-background"
                  />
                ))}
              </div>
              <p>Join our lifting community</p>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
