'use client'

import { BentoSection } from './homepage/bento-section'
import { CtaSection } from './homepage/cta-section'
import { FeaturesSection } from './homepage/features-section'
import { HomepageFooter } from './homepage/footer'
import { HomepageHeader } from './homepage/header'
import { HeroSection } from './homepage/hero-section'
import { PlatformStatsSection } from './homepage/platform-stats'
import { UserStatsSection } from './homepage/user-stats'
import { VideoShowcase } from './homepage/video-showcase'
import { MobileAppBanner } from './mobile-app-banner'

export function HomepageClient() {
  return (
    <div className="min-h-screen w-full bg-background">
      <HomepageHeader />

      <main>
        <HeroSection />
        <UserStatsSection />
        <MobileAppBanner className="py-14" />
        <BentoSection />
        <FeaturesSection />
        <PlatformStatsSection />
        <VideoShowcase />
        <CtaSection />
      </main>

      <HomepageFooter />
    </div>
  )
}
