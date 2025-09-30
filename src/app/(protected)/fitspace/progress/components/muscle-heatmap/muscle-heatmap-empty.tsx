import { Activity } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function MuscleHeatmapEmpty() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-orange-500" />
          Muscle Focus Heatmap
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          No workout data found for the last 30 days.
          <br />
          Complete some workouts to see your muscle group focus heatmap.
        </div>
      </CardContent>
    </Card>
  )
}
