'use client'

import Link from 'next/link'

import { AnimatedLogo, AnimatedLogoText } from '@/components/animated-logo'
import { ButtonLink } from '@/components/ui/button-link'

export function HomepageHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-7xl">
        <Link href="/" className="flex items-center">
          <AnimatedLogo size={32} infinite={false} />
          <AnimatedLogoText className="text-2xl text-foreground" />
        </Link>

        <ButtonLink href="/login" variant="default" size="md">
          Login
        </ButtonLink>
      </div>
    </header>
  )
}
