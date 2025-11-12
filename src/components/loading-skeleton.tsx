import { Card, CardContent, CardHeader, CardProps } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function LoadingSkeleton({
  count = 3,
  variant = 'md',
  cardVariant,
  withBorder = false,
  className,
}: {
  count?: number
  variant?: 'lg' | 'md' | 'sm'
  cardVariant?: CardProps['variant']
  withBorder?: boolean
  className?: string
}) {
  if (variant === 'lg') {
    return Array.from({ length: count }).map((_, index) => (
      <Card
        key={index}
        variant={cardVariant}
        className={cn(withBorder && '!border', className)}
      >
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    ))
  }

  if (variant === 'md') {
    return Array.from({ length: count }).map((_, index) => (
      <Card
        key={index}
        variant={cardVariant}
        className={cn('py-0', withBorder && '!border', className)}
      >
        <CardContent className="p-4">
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    ))
  }

  if (variant === 'sm') {
    return Array.from({ length: count }).map((_, index) => (
      <Card
        key={index}
        className={cn('py-0', withBorder && '!border', className)}
        variant={cardVariant}
      >
        <CardContent className="p-4">
          <Skeleton className="h-6 w-1/2 mb-3" />
          <Skeleton className="h-3 w-full" />
        </CardContent>
      </Card>
    ))
  }

  return Array.from({ length: count }).map((_, index) => (
    <Card
      key={index}
      variant={cardVariant}
      className={cn(withBorder && '!border', className)}
    >
      <CardHeader>
        <Skeleton className="h-8 w-1/3" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-8 w-1/2" />
      </CardContent>
    </Card>
  ))
}
