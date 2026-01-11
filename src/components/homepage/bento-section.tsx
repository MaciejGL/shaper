'use client'

import { motion } from 'framer-motion'

import { CloudinaryVideoPlayer } from '@/components/ui/cloudinary-video-player'

export function BentoSection() {
  return (
    <section className="py-24 overflow-hidden bg-card">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Text Content - constrained to container */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="px-4 lg:pl-[max(1rem,calc((100vw-80rem)/2+1rem))]"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            The Complete System
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
            Everything you need to build your best physique. From smart workout
            logging to advanced analytics, all in one distinctively simple
            interface.
          </p>
        </motion.div>

        {/* Bento Video - extends to the right edge */}
        <div className="relative w-full">
          <CloudinaryVideoPlayer
            publicId="homepage-bento"
            autoplayMode="on-scroll"
          />
        </div>
      </div>
    </section>
  )
}
