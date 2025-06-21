'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { Abdominals } from './abdominals'
import { FrontBodyBackground } from './background'
import { Biceps } from './biceps'
import { Chest } from './chest'
import { Deltoid } from './deltoid'
import { Forearms } from './forearms'
import { InnerThighs } from './inner-thighs'
import { Neck } from './neck'
import { Quads } from './quads'
import { Shins } from './shins'
import { Trapezius } from './trapezius'
import { Unselectable } from './unselectable'

interface FrontBodyViewProps {
  selectedMuscleGroups: string[]
  onMuscleGroupClick: (muscleGroupId: string) => void
  muscleGroups: { id: string; alias?: string | null; groupSlug: string }[]
  className?: string
}

export type MuscleGroupProps = {
  getPathProps: (aliases: string[]) => {
    className: string
    onClick: () => void
    style: { fillOpacity: number }
  }
}

export function FrontBodyView({
  selectedMuscleGroups = [],
  onMuscleGroupClick,
  muscleGroups = [],
}: FrontBodyViewProps) {
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
        ? cn('fill-amber-600')
        : 'fill-primary/40 group-hover:fill-muted-foreground'
    }`,
    onClick: () => handleRegionClick(aliases),
    style: { fillOpacity: isRegionSelected(aliases) ? 0.8 : 0.6 },
  })
  const Y_OFFSET = 20
  const LEFT_LABEL_OFFSET = 1
  const RIGHT_LABEL_OFFSET = 195
  const config: Record<
    string,
    {
      muscleX: number
      muscleY: number
      labelX: number
      labelY: number
      aliases: string[]
      side: 'left' | 'right'
    }
  > = {
    Neck: {
      muscleX: 101,
      muscleY: 74,
      labelX: LEFT_LABEL_OFFSET || 30,
      labelY: 20 + Y_OFFSET,
      aliases: ['neck', 'anterior'],
      side: 'left',
    },

    Shoulders: {
      muscleX: 64,
      muscleY: 94,
      labelX: LEFT_LABEL_OFFSET || 20,
      labelY: 75 + Y_OFFSET,
      aliases: ['front delts', 'side delts', 'rear delts'],
      side: 'left',
    },
    Chest: {
      muscleX: 85,
      muscleY: 105,
      labelX: LEFT_LABEL_OFFSET || 0,
      labelY: 130 + Y_OFFSET,
      aliases: ['chest', 'inner chest'],
      side: 'left',
    },
    Forearms: {
      muscleX: 43,
      muscleY: 170,
      labelX: LEFT_LABEL_OFFSET || 8,
      labelY: 180 + Y_OFFSET,
      aliases: ['forearms'],
      side: 'left',
    },
    Quads: {
      muscleX: 80,
      muscleY: 230,
      labelX: LEFT_LABEL_OFFSET || 15,
      labelY: 270 + Y_OFFSET,
      aliases: ['quads'],
      side: 'left',
    },

    ////////////////
    // Right side
    ////////////////

    Traps: {
      muscleX: 118,
      muscleY: 82,
      labelX: RIGHT_LABEL_OFFSET || 180,
      labelY: 40 + Y_OFFSET,
      aliases: ['traps'],
      side: 'right',
    },
    Biceps: {
      muscleX: 145,
      muscleY: 122,
      labelX: RIGHT_LABEL_OFFSET || 190,
      labelY: 90 + Y_OFFSET,
      aliases: ['biceps'],
      side: 'right',
    },
    Obliques: {
      muscleX: 125,
      muscleY: 150,
      labelX: RIGHT_LABEL_OFFSET || 180,
      labelY: 140 + Y_OFFSET,
      aliases: ['obliques'],
      side: 'right',
    },
    Abs: {
      muscleX: 101,
      muscleY: 160,
      labelX: RIGHT_LABEL_OFFSET || 195,
      labelY: 190 + Y_OFFSET,
      aliases: ['abs'],
      side: 'right',
    },
    ['Inner Thighs']: {
      muscleX: 108,
      muscleY: 215,
      labelX: RIGHT_LABEL_OFFSET ? RIGHT_LABEL_OFFSET - 20 : 159,
      labelY: 250 + Y_OFFSET,
      aliases: ['inner thigh'],
      side: 'right',
    },
    Shins: {
      muscleX: 127,
      muscleY: 310,
      labelX: RIGHT_LABEL_OFFSET || 195,
      labelY: 320 + Y_OFFSET,
      aliases: ['shin'],
      side: 'right',
    },
  }
  return (
    <div className="relative">
      <svg
        width="200"
        height="400"
        viewBox="0 0 200 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_1191_2882)">
          <Unselectable />
          <FrontBodyBackground />

          <Neck getPathProps={getPathProps} />
          <Trapezius getPathProps={getPathProps} />
          <Deltoid getPathProps={getPathProps} />
          <Chest getPathProps={getPathProps} />
          <Biceps getPathProps={getPathProps} />
          <Abdominals getPathProps={getPathProps} />

          <Forearms getPathProps={getPathProps} />
          <InnerThighs getPathProps={getPathProps} />
          <Quads getPathProps={getPathProps} />
          <Shins getPathProps={getPathProps} />

          {Object.entries(config).map(([key, value]) => (
            <ConnectionLine
              key={key}
              muscleX={value.muscleX}
              muscleY={value.muscleY}
              labelX={value.labelX}
              labelY={value.labelY}
            />
          ))}
        </g>
        <defs>
          <clipPath id="clip0_1191_2882">
            <rect width="200" height="400" fill="white" />
          </clipPath>
        </defs>
      </svg>
      {Object.entries(config).map(([label, value]) => (
        <MuscleLabel
          key={label}
          label={label}
          value={value}
          isRegionSelected={isRegionSelected}
          handleRegionClick={handleRegionClick}
        />
      ))}
    </div>
  )
}

function MuscleLabel({
  label,
  value,
  isRegionSelected,
  handleRegionClick,
}: {
  label: string
  value: {
    muscleX: number
    muscleY: number
    labelX: number
    labelY: number
    aliases: string[]
    side: 'left' | 'right'
  }
  isRegionSelected: (aliases: string[]) => boolean
  handleRegionClick: (aliases: string[]) => void
}) {
  const [elementWidth, setElementWidth] = useState(0)
  const ref = useRef<HTMLButtonElement>(null)
  useEffect(() => {
    setElementWidth(ref.current?.offsetWidth ?? 0)
  }, [ref])
  return (
    <Button
      ref={ref}
      key={label}
      size="xs"
      variant={isRegionSelected(value.aliases) ? 'default' : 'secondary'}
      style={{
        top: `${value.labelY}px`,
        left:
          value.side === 'left'
            ? `calc(${value.labelX}px - ${elementWidth}px - 2px)`
            : 'unset',
        right:
          value.side === 'right'
            ? `calc(100% - ${value.labelX}px - ${elementWidth}px - 2px)`
            : 'unset',
      }}
      onClick={() => {
        handleRegionClick(value.aliases)
      }}
      className={cn('absolute z-10 -translate-y-1/2 animate-in')}
    >
      {label}
    </Button>
  )
}

// Enhanced muscle label component with improved styling and animations
function ConnectionLine({
  muscleX,
  muscleY,
  labelX,
  labelY,
}: {
  muscleX: number
  muscleY: number
  labelX: number
  labelY: number
}) {
  // Calculate the midpoint for the step (50% of the distance)
  const stepX = labelX + (muscleX - labelX) * 0.15

  // Create step path: horizontal line first, then straight to muscle
  const pathData = `M ${labelX} ${labelY} L ${stepX} ${labelY} L ${muscleX} ${muscleY}`

  return (
    <>
      <g className="muscle-label-group">
        {/* Connection line with curve */}
        <path
          d={pathData}
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4,0"
          opacity="0.6"
          className="transition-all duration-300 stroke-amber-500/60"
        />

        {/* Connection point on muscle */}
        <circle
          cx={muscleX}
          cy={muscleY}
          r="4"
          className="transition-all duration-300 fill-amber-600"
        />
      </g>
      <Button className="absolute top-5 left-5 z-10">asd </Button>
    </>
  )
}
