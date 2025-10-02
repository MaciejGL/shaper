'use client'

import { ArrowLeftRight } from 'lucide-react'

import { BackBodyView } from '@/components/human-body/body-back/body-back'
import { FrontBodyView } from '@/components/human-body/body-front/body-front'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GQLMuscleFrequency } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import {
  HEATMAP_COLORS,
  getIntensityColor,
} from '../../constants/heatmap-colors'
import { LABEL_TO_GROUP_MAPPING } from '../../constants/muscle-groups'

interface HeatmapBodyViewProps {
  muscleIntensity: Record<string, number>
  selectedMuscle: string | null
  onMuscleClick: (muscle: string) => void
  groupedMuscleData?: Record<
    string,
    {
      groupName: string
      totalSets: number
      sessionsCount: number
      lastTrained: string
      muscles: GQLMuscleFrequency[]
    }
  >
  disableEmptyLabels?: boolean
}

export function HeatmapBodyView({
  muscleIntensity,
  selectedMuscle,
  onMuscleClick,
  groupedMuscleData,
  disableEmptyLabels = false,
}: HeatmapBodyViewProps) {
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
        'cursor-pointer transition-all duration-200',
        getIntensityColor(intensity),
        selectedMuscle &&
          muscleGroupName &&
          muscleGroupName === selectedMuscle &&
          'ring-2 ring-blue-500',
      ),
      onClick: () => {
        if (muscleGroupName) {
          onMuscleClick(muscleGroupName)
        }
      },
    }
  }

  const isRegionSelected = (aliases: string[]) => {
    if (!selectedMuscle) return false

    // Find the muscle group for these aliases
    for (const alias of aliases) {
      if (LABEL_TO_GROUP_MAPPING[alias] === selectedMuscle) {
        return true
      }
    }

    return false
  }

  const handleRegionClick = (aliases: string[]) => {
    // Find the muscle group for these aliases
    for (const alias of aliases) {
      if (LABEL_TO_GROUP_MAPPING[alias]) {
        onMuscleClick(LABEL_TO_GROUP_MAPPING[alias])
        break
      }
    }
  }

  const hasMuscleData = (aliases: string[]): boolean => {
    if (!disableEmptyLabels) return true

    // Find the muscle group for these aliases
    for (const alias of aliases) {
      if (LABEL_TO_GROUP_MAPPING[alias]) {
        const groupData = groupedMuscleData?.[LABEL_TO_GROUP_MAPPING[alias]]
        return Boolean(groupData && groupData.totalSets > 0)
      }
    }

    return false
  }

  return (
    <div className="relative">
      <Tabs defaultValue="front">
        <TabsList className="mx-auto border border-border grid grid-cols-[1fr_auto_1fr]">
          <TabsTrigger value="front">Front</TabsTrigger>
          <TabsTrigger value="swap" disabled>
            <ArrowLeftRight className="size-3" />
          </TabsTrigger>
          <TabsTrigger value="back">Back</TabsTrigger>
        </TabsList>

        <TabsContent value="front" className="flex flex-col items-center">
          <FrontBodyView
            getPathProps={getPathProps}
            isRegionSelected={isRegionSelected}
            handleRegionClick={handleRegionClick}
            hasMuscleData={hasMuscleData}
          />
        </TabsContent>

        <TabsContent value="back" className="flex flex-col items-center">
          <BackBodyView
            getPathProps={getPathProps}
            isRegionSelected={isRegionSelected}
            handleRegionClick={handleRegionClick}
            hasMuscleData={hasMuscleData}
          />
        </TabsContent>
      </Tabs>
      {/* Intensity Legend */}
      <div className="space-y-1">
        <div className="text-xs font-medium text-muted-foreground">
          Intensity
        </div>
        <div className="flex items-center gap-2">
          {HEATMAP_COLORS.levels.map((level) => (
            <div key={level.label} className="flex items-center gap-2">
              <div className={cn('size-3 rounded', level.bgColor)} />
              <div className="text-xs text-muted-foreground">{level.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
