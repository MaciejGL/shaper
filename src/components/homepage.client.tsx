'use client'

import { CtaSection } from './homepage/cta-section'
import { FeaturesSection } from './homepage/features-section'
import { HomepageFooter } from './homepage/footer'
import { HomepageHeader } from './homepage/header'
import { HeroSection } from './homepage/hero-section'
import { MobileAppBanner } from './mobile-app-banner'

export function HomepageClient() {
  return (
    <div className="dark min-h-screen w-full bg-background">
      <HomepageHeader />

      <main>
        <HeroSection />
        <MobileAppBanner className="py-14" />
        <FeaturesSection />
        <CtaSection />
      </main>

      <HomepageFooter />
    </div>
  )
}
