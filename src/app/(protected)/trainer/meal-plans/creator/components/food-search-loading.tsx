import { Loader } from '@/components/loader'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function FoodSearchLoading() {
  return (
    <div className="space-y-3">
      <div className="text-sm text-muted-foreground flex items-center gap-2 animate-pulse">
        <Loader size="xs" />
        <p>Searching for foods...</p>
      </div>
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="p-4 shadow-xs">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-12 w-12 rounded" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
