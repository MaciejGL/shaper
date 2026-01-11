'use client'

import { motion } from 'framer-motion'

import { ButtonLink } from '@/components/ui/button-link'
import { analyticsEvents } from '@/lib/analytics-events'

export function CtaSection() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center bg-card rounded-2xl p-8 md:p-16"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            Time to Make Some Gains?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Jump in and start crushing your workouts with us
          </p>
          <ButtonLink
            href="/login"
            size="xl"
            className="w-full sm:w-auto text-lg px-12"
            onClick={() => {
              analyticsEvents.authLandingCtaClick({ cta: 'cta_section' })
            }}
          >
            Let's Go
          </ButtonLink>
        </motion.div>
      </div>
    </section>
  )
}
