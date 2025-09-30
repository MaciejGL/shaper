'use client'

import { BackBodyView } from '@/components/human-body/body-back/body-back'
import { FrontBodyView } from '@/components/human-body/body-front/body-front'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GQLMuscleFrequency } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

// Mapping between muscle aliases and body view aliases
// This allows for more granular muscle tracking using readable names
const MUSCLE_ALIAS_MAPPING = {
  // Chest muscles
  Chest: ['chest', 'inner chest'], // Pectoralis Major
  'Pec Minor': ['chest', 'inner chest'], // Pectoralis Minor
  Serratus: ['chest', 'inner chest'], // Serratus Anterior

  // Upper back muscles (individual mapping)
  Lats: ['lats'], // Latissimus Dorsi
  Traps: ['traps'], // Trapezius
  Rhomboids: ['rhomboids'], // Rhomboids

  // Lower back
  'Lower Back': ['lower back'], // Erector Spinae

  // Shoulder muscles (individual mapping)
  'Front Delts': ['front delts'], // Deltoid Anterior
  'Side Delts': ['side delts'], // Deltoid Lateral
  'Rear Delts': ['rear delts'], // Deltoid Posterior

  // Biceps (individual mapping)
  Biceps: ['biceps'], // Biceps Brachii
  Brachialis: ['biceps'], // Brachialis
  Brachioradialis: ['biceps'], // Brachioradialis

  // Triceps
  Triceps: ['triceps'], // Triceps Brachii

  // Forearms
  Forearms: ['forearms'], // Forearm Flexors
  'Forearm Extensors': ['forearms'], // Forearm Extensors

  // Leg muscles
  Quads: ['quads'], // Quadriceps
  Hams: ['hams'], // Hamstrings
  Glutes: ['glutes'], // Gluteus Maximus
  'Glute Med': ['glutes'], // Gluteus Medius
  'Glute Min': ['glutes'], // Gluteus Minimus
  Calves: ['calves'], // Gastrocnemius
  Soleus: ['calves'], // Soleus
  'Inner Thigh': ['inner thighs'], // Hip Adductors

  // Core muscles
  Abs: ['abs'], // Rectus Abdominis
  Obliques: ['obliques'], // Obliques
  'Deep Core': ['abs'], // Transverse Abdominis

  // Additional muscles
  Neck: ['neck', 'anterior'], // Neck
  'Rotator Cuff': ['stabilizers'], // Stabilizers
}

// Heatmap color configuration - Positive, friendly colors
const HEATMAP_COLORS = {
  levels: [
    {
      threshold: 0.8,
      fillColor: 'fill-orange-600',
      bgColor: 'bg-orange-600',
      label: 'Excellent',
    },
    {
      threshold: 0.6,
      fillColor: 'fill-orange-400',
      bgColor: 'bg-orange-400',
      label: 'Great',
    },
    {
      threshold: 0.4,
      fillColor: 'fill-orange-300',
      bgColor: 'bg-orange-300',
      label: 'Good',
    },
    {
      threshold: 0.2,
      fillColor: 'fill-orange-200',
      bgColor: 'bg-orange-200',
      label: 'Light',
    },
    {
      threshold: 0,
      fillColor: 'fill-orange-100',
      bgColor: 'bg-orange-100',
      label: 'None',
    },
  ],
  getColorForIntensity: (intensity: number) => {
    const level = HEATMAP_COLORS.levels.find(
      (level) => intensity >= level.threshold,
    )
    return level || HEATMAP_COLORS.levels[HEATMAP_COLORS.levels.length - 1]
  },
}

interface HeatmapBodyViewProps {
  muscleIntensity: Record<string, number>
  selectedMuscle: string | null
  onMuscleClick: (muscle: string) => void
  rawMuscleData?: GQLMuscleFrequency[]
  disableEmptyLabels?: boolean
}

export function HeatmapBodyView({
  muscleIntensity,
  selectedMuscle,
  onMuscleClick,
  rawMuscleData,
  disableEmptyLabels = false,
}: HeatmapBodyViewProps) {
  const getPathProps = (aliases: string[]) => {
    // Find the individual muscle that matches these aliases
    const muscleEntry = Object.entries(MUSCLE_ALIAS_MAPPING).find(
      ([, muscleAliases]) =>
        muscleAliases.some((alias) => aliases.includes(alias)),
    )

    // Find the muscle data by alias
    const muscleData = muscleEntry
      ? rawMuscleData?.find((m) => m.muscleAlias === muscleEntry[0])
      : null

    const intensity = muscleData ? muscleIntensity[muscleData.muscleId] || 0 : 0

    // Convert intensity to color using configuration
    const getIntensityColor = (intensity: number) => {
      const colorLevel = HEATMAP_COLORS.getColorForIntensity(intensity)
      return cn(colorLevel.fillColor)
    }

    const getIntensityOpacity = (intensity: number) => {
      return Math.max(0.3, intensity) // Minimum 30% opacity
    }

    return {
      className: cn(
        'cursor-pointer transition-all duration-200',
        getIntensityColor(intensity),
        selectedMuscle &&
          muscleEntry &&
          muscleEntry[0] === selectedMuscle &&
          'ring-2 ring-blue-500',
      ),
      style: {
        fillOpacity: getIntensityOpacity(intensity),
      },
      onClick: () => {
        if (muscleData) {
          onMuscleClick(muscleData.muscleId)
        }
      },
    }
  }

  const isRegionSelected = (aliases: string[]) => {
    if (!selectedMuscle) return false

    const muscleEntry = Object.entries(MUSCLE_ALIAS_MAPPING).find(
      ([, muscleAliases]) =>
        muscleAliases.some((alias) => aliases.includes(alias)),
    )

    const muscleData = muscleEntry
      ? rawMuscleData?.find((m) => m.muscleAlias === muscleEntry[0])
      : null

    return muscleData ? muscleData.muscleId === selectedMuscle : false
  }

  const handleRegionClick = (aliases: string[]) => {
    const muscleEntry = Object.entries(MUSCLE_ALIAS_MAPPING).find(
      ([, muscleAliases]) =>
        muscleAliases.some((alias) => aliases.includes(alias)),
    )

    const muscleData = muscleEntry
      ? rawMuscleData?.find((m) => m.muscleAlias === muscleEntry[0])
      : null

    if (muscleData) {
      onMuscleClick(muscleData.muscleId)
    }
  }

  const hasMuscleData = (aliases: string[]): boolean => {
    if (!disableEmptyLabels) return true

    const muscleEntry = Object.entries(MUSCLE_ALIAS_MAPPING).find(
      ([, muscleAliases]) =>
        muscleAliases.some((alias) => aliases.includes(alias)),
    )

    const muscleData = muscleEntry
      ? rawMuscleData?.find((m) => m.muscleAlias === muscleEntry[0])
      : null

    return Boolean(muscleData && muscleData.totalSets > 0)
  }

  return (
    <div className="relative">
      <Tabs defaultValue="front">
        <TabsList className="mx-auto mb-4">
          <TabsTrigger value="front">Front</TabsTrigger>
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
