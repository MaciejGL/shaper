import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function LoadingSkeleton({ count = 3 }: { count?: number }) {
  return Array.from({ length: count }).map((_, index) => (
    <Card key={index} className="animate-pulse">
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
