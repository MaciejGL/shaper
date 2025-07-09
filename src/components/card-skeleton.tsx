import { Card, CardContent, CardFooter, CardHeader } from './ui/card'
import { Skeleton } from './ui/skeleton'

export function CardSkeleton() {
  return (
    <Card className="space-y-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="size-8" />
      </CardHeader>
      <CardContent className="space-y-2">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
      </CardContent>
      <CardFooter className="flex gap-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  )
}
