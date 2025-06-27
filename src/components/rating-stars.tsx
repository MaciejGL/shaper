import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md' | 'lg'
  showValue?: boolean
  className?: string
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = false,
  className,
}: RatingStarsProps) {
  const sizeClasses = {
    sm: 'size-3',
    md: 'size-3.5',
    lg: 'size-4',
  }

  const starSize = sizeClasses[size]

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: maxRating }).map((_, index) => {
        const fillPercentage = Math.min(Math.max(rating - index, 0), 1)

        return (
          <div key={index} className="relative">
            {/* Background star (empty) */}
            <Star className={cn(starSize, 'text-foreground')} />

            {/* Filled star with clip path for partial fills */}
            {fillPercentage > 0 && (
              <div
                className="absolute inset-0 overflow-hidden"
                style={{
                  clipPath: `inset(0 ${100 - fillPercentage * 100}% 0 0)`,
                }}
              >
                <Star
                  className={cn(starSize, 'fill-yellow-400 text-yellow-400')}
                />
              </div>
            )}
          </div>
        )
      })}

      {showValue && (
        <span className="text-sm text-muted-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
