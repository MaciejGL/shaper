'use client'

import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'

import { Badge } from './ui/badge'

interface TrainerDiscoveryCtaProps {
  className?: string
  // Kept for backward compatibility, but we only have one design now
  variant?: string
  title?: string
  subtitle?: string
  showBadge?: boolean
  onClick?: () => void
}

export function TrainerDiscoveryCta({
  className,
  title,
  subtitle,
  showBadge = true,
  onClick,
}: TrainerDiscoveryCtaProps) {
  const defaultTitle = 'Elevate Your Training'
  const defaultSubtitle = 'Get matched with a certified expert for your goals'

  const finalTitle = title || defaultTitle
  const finalSubtitle = subtitle || defaultSubtitle

  return (
    <Link
      href="/fitspace/explore?tab=trainers"
      onClick={onClick}
      className={cn('group block', className)}
    >
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-primary/20 p-5',
          'bg-linear-to-br from-primary/10 to-white via-white dark:via-background dark:to-background shadow-xl',
          'hover:border-primary/30 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5',
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {showBadge && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20"
                >
                  <Sparkles className="mr-1 h-3 w-3" />
                  Level Up
                </Badge>
              )}
            </div>
            <div>
              <h3 className="font-bold text-lg leading-tight mb-1">
                {finalTitle}
              </h3>
              <p className="text-sm text-muted-foreground leading-snug">
                {finalSubtitle}
              </p>
            </div>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:translate-x-1 transition-transform">
            <ArrowRight className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  )
}
