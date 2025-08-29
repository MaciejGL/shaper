'use client'

import { ChevronRight, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

import { Badge } from './ui/badge'
import { Card } from './ui/card'

interface TrainerDiscoveryCtaProps {
  className?: string
  variant?: 'card' | 'banner' | 'compact'
  title?: string
  subtitle?: string
  showBadge?: boolean
  onClick?: () => void
}

export function TrainerDiscoveryCta({
  className,
  variant = 'card',
  title,
  subtitle,
  showBadge = true,
  onClick,
}: TrainerDiscoveryCtaProps) {
  const defaultTitles = {
    card: 'Ready to Level Up?',
    banner: 'Get Personal Coaching',
    compact: 'Find a Trainer',
  }

  const defaultSubtitles = {
    card: 'Connect with expert trainers for personalized guidance and faster results',
    banner: 'Work with certified trainers who understand your goals',
    compact: 'Get expert guidance',
  }

  const finalTitle = title || defaultTitles[variant]
  const finalSubtitle = subtitle || defaultSubtitles[variant]

  if (variant === 'compact') {
    return (
      <Link
        href="/fitspace/explore?tab=trainers"
        onClick={onClick}
        className={cn(
          'flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 hover:border-primary/30 transition-colors',
          className,
        )}
      >
        <Users className="h-4 w-4 text-primary" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-primary">{finalTitle}</p>
          <p className="text-xs text-muted-foreground truncate">
            {finalSubtitle}
          </p>
        </div>
        <ChevronRight className="h-4 w-4 text-primary" />
      </Link>
    )
  }

  if (variant === 'banner') {
    return (
      <Link
        href="/fitspace/explore?tab=trainers"
        onClick={onClick}
        className={className}
      >
        <Card
          variant="premium"
          className="w-full flex flex-row items-center justify-between p-4"
        >
          <div className="flex items-center gap-3 text-black">
            <div className="text-left">
              <div className="text-base font-semibold leading-tight flex items-center gap-2">
                {finalTitle}
                {showBadge && (
                  <Badge
                    variant="secondary"
                    className="bg-white/20 text-black text-xs"
                  >
                    <Sparkles className="h-3 w-3 mr-1" />
                    New
                  </Badge>
                )}
              </div>
              <div className="text-xs leading-tight">{finalSubtitle}</div>
            </div>
          </div>
          <ChevronRight className="size-5" color="black" />
        </Card>
      </Link>
    )
  }

  // Default card variant
  return (
    <Link
      href="/fitspace/explore?tab=trainers"
      onClick={onClick}
      className={className}
    >
      <Card className="p-6 text-center hover:shadow-md transition-shadow">
        <div className="space-y-3">
          <div className="mx-auto w-12 h-12 bg-gradient-to-r from-primary to-primary/80 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-primary-foreground" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-lg font-semibold">{finalTitle}</h3>
              {showBadge && (
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{finalSubtitle}</p>
          </div>

          <div className="flex items-center justify-center gap-1 text-primary text-sm font-medium">
            <span>Explore Trainers</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </Card>
    </Link>
  )
}
