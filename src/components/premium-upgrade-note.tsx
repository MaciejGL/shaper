'use client'

import { Crown } from 'lucide-react'

import { cn } from '@/lib/utils'

interface PremiumUpgradeNoteProps {
  children: React.ReactNode
  className?: string
}

/**
 * Simple upgrade note with crown icon for premium gating
 * Used consistently across stats drawers and progress charts
 */
export function PremiumUpgradeNote({
  children,
  className,
}: PremiumUpgradeNoteProps) {
  return (
    <p className={cn('text-xs text-muted-foreground text-center', className)}>
      <Crown className="size-3 inline-block mr-1 text-amber-500" />
      {children}
    </p>
  )
}
