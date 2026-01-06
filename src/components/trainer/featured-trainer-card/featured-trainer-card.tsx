'use client'

import { Star, User } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { Badge } from '../../ui/badge'

import { FeaturedTrainerCardProps } from './types'

export function FeaturedTrainerCard({
  name,
  headline,
  imageUrl,
  rating,
  reviews,
  years,
  clients,
  spots,
  onClick,
  onCTAClick,
}: FeaturedTrainerCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative w-full h-[190px] rounded-3xl overflow-hidden border border-border bg-card shadow-lg',
        onClick &&
          'cursor-pointer active:scale-[0.99] transition-[transform,shadow] duration-200',
      )}
    >
      {imageUrl ? (
        <div
          className="absolute inset-0 bg-repeat-x bg-center opacity-80 blur-[1px] pointer-events-none"
          style={{
            backgroundImage: `url(${imageUrl})`,
            backgroundPosition: 'left center',
            backgroundSize: 'auto 100%',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-muted/30 pointer-events-none" />
      )}

      <div className="absolute inset-0 bg-linear-to-r from-background/80 via-background/50 to-transparent pointer-events-none" />

      <div className="absolute top-3 right-3">
        <Badge
          variant="secondary"
          className="bg-background/70 backdrop-blur border border-border/50 text-foreground"
        >
          Featured
        </Badge>
      </div>

      <div className="relative z-10 h-full p-4 flex flex-col justify-end">
        <div className="rounded-2xl border border-border/50 bg-background/75 backdrop-blur px-4 py-3">
          <div className="mb-2">
            <h3 className="text-lg font-semibold leading-tight text-foreground line-clamp-1">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
              {headline}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
            {typeof rating === 'number' && typeof reviews === 'number' && (
              <span className="inline-flex items-center gap-1">
                <Star className="size-3.5" />
                {rating.toFixed(1)} ({reviews})
              </span>
            )}
            {typeof years === 'number' && <span>• {years}y</span>}
            {typeof clients === 'number' && <span>• {clients} clients</span>}
            {spots !== undefined && spots !== null && (
              <span>• {spots} spots</span>
            )}
          </div>

          <Button
            size="sm"
            variant="secondary"
            iconStart={<User />}
            onClick={(e) => {
              e.stopPropagation()
              onCTAClick?.()
            }}
          >
            View coaching options
          </Button>
        </div>
      </div>
    </div>
  )
}
