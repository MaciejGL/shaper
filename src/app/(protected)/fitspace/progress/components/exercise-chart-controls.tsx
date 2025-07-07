import { BarChart3, Dumbbell, TrendingUp } from 'lucide-react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ChartType } from './exercise-progress-constants'

interface ExerciseChartControlsProps {
  activeChart: ChartType
  onChartChange: (chartType: ChartType) => void
}

export function ExerciseChartControls({
  activeChart,
  onChartChange,
}: ExerciseChartControlsProps) {
  return (
    <Tabs
      defaultValue="oneRM"
      value={activeChart}
      onValueChange={(value) => onChartChange(value as ChartType)}
      className="w-full"
    >
      <TabsList size="sm" className="mx-auto mb-2 bg-background">
        <TabsTrigger value="oneRM">
          <TrendingUp className="h-3 w-3 mr-1" />
          1RM
        </TabsTrigger>
        <TabsTrigger value="sets">
          <BarChart3 className="h-3 w-3 mr-1" />
          Sets
        </TabsTrigger>
        <TabsTrigger value="volume">
          <Dumbbell className="h-3 w-3 mr-1" />
          Volume
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
