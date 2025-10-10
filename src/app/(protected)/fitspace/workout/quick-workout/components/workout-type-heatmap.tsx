import { useMemo } from 'react'

import { BackBodyView } from '@/components/human-body/body-back/body-back'
import { FrontBodyView } from '@/components/human-body/body-front/body-front'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { getIntensityColor } from '../../../progress/constants/heatmap-colors'
import { LABEL_TO_GROUP_MAPPING } from '../../../progress/constants/muscle-groups'

interface WorkoutTypeHeatmapProps {
  muscleGroups: string[]
}

export function WorkoutTypeHeatmap({ muscleGroups }: WorkoutTypeHeatmapProps) {
  // Create muscle intensity data for heatmap visualization
  const muscleIntensity = useMemo(() => {
    const intensity: Record<string, number> = {}

    // Set high intensity (80) for all selected muscle groups
    muscleGroups.forEach((muscle) => {
      intensity[muscle] = 80
    })

    return intensity
  }, [muscleGroups])

  const getPathProps = (aliases: string[]) => {
    // Find the muscle group for these aliases
    let muscleGroupName: string | null = null
    for (const alias of aliases) {
      if (LABEL_TO_GROUP_MAPPING[alias]) {
        muscleGroupName = LABEL_TO_GROUP_MAPPING[alias]
        break
      }
    }

    const intensity = muscleGroupName
      ? muscleIntensity[muscleGroupName] || 0
      : 0

    return {
      className: cn(
        'transition-all duration-200 pointer-events-none',
        getIntensityColor(intensity),
      ),
      onClick: () => {},
    }
  }

  const isRegionSelected = () => false
  const handleRegionClick = () => {}
  const hasMuscleData = () => true

  return (
    <div className="py-2 sm:py-3 -mx-2 sm:mx-0">
      <Tabs defaultValue="front">
        <TabsList className="mx-auto border border-border grid grid-cols-[1fr_auto_1fr] w-fit scale-90 sm:scale-100">
          <TabsTrigger value="front" className="text-xs sm:text-sm">
            Front
          </TabsTrigger>
          <TabsTrigger value="swap" disabled>
            <svg
              className="size-3"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M8 3L4 7l4 4" />
              <path d="M4 7h16" />
              <path d="m16 21 4-4-4-4" />
              <path d="M20 17H4" />
            </svg>
          </TabsTrigger>
          <TabsTrigger value="back" className="text-xs sm:text-sm">
            Back
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="front"
          className="flex flex-col items-center scale-75 sm:scale-90 -my-8 sm:-my-4"
        >
          <FrontBodyView
            getPathProps={getPathProps}
            isRegionSelected={isRegionSelected}
            handleRegionClick={handleRegionClick}
            hasMuscleData={hasMuscleData}
            hideLabels={true}
          />
        </TabsContent>

        <TabsContent
          value="back"
          className="flex flex-col items-center scale-75 sm:scale-90 -my-8 sm:-my-4"
        >
          <BackBodyView
            getPathProps={getPathProps}
            isRegionSelected={isRegionSelected}
            handleRegionClick={handleRegionClick}
            hasMuscleData={hasMuscleData}
            hideLabels={true}
          />
        </TabsContent>
      </Tabs>
      {/* Legend hidden for compact view */}
    </div>
  )
}
