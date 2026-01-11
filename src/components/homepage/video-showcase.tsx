'use client'

import { CloudinaryVideoPlayer } from '@/components/ui/cloudinary-video-player'

export function VideoShowcase() {
  return (
    <section className="py-24 bg-card overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-foreground">
            See It In Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Experience the smooth, intuitive interface that makes tracking your
            gains effortless.
          </p>
        </div>

        <div className="w-full max-w-5xl mx-auto">
          <CloudinaryVideoPlayer
            publicId="homepage-slider"
            autoplayMode="on-scroll"
            loop={false}
            controls={false}
          />
        </div>
      </div>
    </section>
  )
}
