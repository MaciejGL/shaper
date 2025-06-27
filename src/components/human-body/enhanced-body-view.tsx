'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

import { BackBodyView } from './body-back/body-back'
import { FrontBodyView } from './body-front/body-front'

interface EnhancedBodyViewProps {
  selectedMuscleGroups: string[]
  onMuscleGroupClick: (muscleGroupId: string) => void
  muscleGroups: { id: string; alias?: string | null; groupSlug: string }[]
  className?: string
}

export function EnhancedBodyView({
  selectedMuscleGroups = [],
  onMuscleGroupClick,
  muscleGroups = [],
}: EnhancedBodyViewProps) {
  if (!onMuscleGroupClick) {
    return (
      <div className="flex justify-center">
        <div className="text-muted-foreground">Loading body map...</div>
      </div>
    )
  }

  const getMuscleGroupsByAlias = (aliases: string[]) => {
    if (!muscleGroups || !Array.isArray(muscleGroups)) return []
    return muscleGroups.filter(
      (mg) => mg.alias && aliases.includes(mg.alias.toLowerCase()),
    )
  }

  const isRegionSelected = (aliases: string[]) => {
    const regionMuscles = getMuscleGroupsByAlias(aliases)
    return regionMuscles.some(
      (muscle) => muscle.alias && selectedMuscleGroups.includes(muscle.alias),
    )
  }

  const handleRegionClick = (aliases: string[]) => {
    const regionMuscles = getMuscleGroupsByAlias(aliases)
    regionMuscles.forEach(
      (muscle) => muscle.alias && onMuscleGroupClick(muscle.alias),
    )
  }

  const getPathProps = (aliases: string[]) => ({
    className: `cursor-pointer transition-all duration-200 ${
      isRegionSelected(aliases)
        ? cn(
            'fill-amber-600 group-hover:fill-amber-700',
            'dark:fill-orange-400 dark:group-hover:fill-orange-500',
          )
        : cn(
            'fill-primary/10 group-hover:fill-primary/20 stroke-primary/10 group-hover:stroke-primary/20',
            'dark:fill-secondary dark:group-hover:fill-primary/20 dark:stroke-primary/10 dark:group-hover:stroke-primary/20',
          )
    }`,
    onClick: () => handleRegionClick(aliases),
    style: { fillOpacity: isRegionSelected(aliases) ? 0.8 : 0.6 },
  })

  return (
    <Tabs>
      <TabsList className="mx-auto">
        <TabsTrigger value="front">Front</TabsTrigger>
        <TabsTrigger value="back">Back</TabsTrigger>
      </TabsList>

      <TabsContent value="front" className="flex flex-col items-center">
        <FrontBodyView
          getPathProps={getPathProps}
          isRegionSelected={isRegionSelected}
          handleRegionClick={handleRegionClick}
        />
      </TabsContent>
      <TabsContent value="back" className="flex flex-col items-center">
        <BackBodyView
          getPathProps={getPathProps}
          isRegionSelected={isRegionSelected}
          handleRegionClick={handleRegionClick}
        />
      </TabsContent>
    </Tabs>
  )
}
