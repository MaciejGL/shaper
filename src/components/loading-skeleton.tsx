import { Card, CardContent, CardHeader, CardProps } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingSkeleton({
  count = 3,
  variant = 'md',
  withBorder = false,
  cardVariant,
}: {
  count?: number
  variant?: 'lg' | 'md' | 'sm'
  withBorder?: boolean
  cardVariant?: CardProps['variant']
}) {
  if (variant === 'lg') {
    return Array.from({ length: count }).map((_, index) => (
      <Card key={index} borderless={!withBorder} variant={cardVariant}>
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
        borderless={!withBorder}
        className="py-0"
        variant={cardVariant}
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
        borderless={!withBorder}
        className="py-0"
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
    <Card key={index} borderless={!withBorder} variant={cardVariant}>
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
