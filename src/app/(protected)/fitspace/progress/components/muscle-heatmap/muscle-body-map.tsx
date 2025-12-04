'use client'

import { ReactNode, useEffect, useRef, useState } from 'react'

import { FemaleBodyBackView } from '@/components/human-body/female-body-back/female-body-back'
import { FemaleBodyFrontView } from '@/components/human-body/female-body-front/female-body-front'
import { MaleBodyBackView } from '@/components/human-body/male-body-back/male-body-back'
import { MaleBodyFrontView } from '@/components/human-body/male-body-front/male-body-front'
import { SVG_ALIAS_TO_DISPLAY_GROUP } from '@/constants/muscles'
import { useUser } from '@/context/user-context'
import { cn } from '@/lib/utils'

import { getProgressColor } from '../../constants/heatmap-colors'

const LABEL_TO_GROUP_MAPPING = SVG_ALIAS_TO_DISPLAY_GROUP

// Base dimensions for body SVG
const BASE_SVG_WIDTH = 194
const BASE_SVG_HEIGHT = 392
const ASPECT_RATIO = BASE_SVG_HEIGHT / BASE_SVG_WIDTH
const COLUMN_GAP = 4

export interface MusclePosition {
  muscle: string
  maleBodyX: number
  maleBodyY: number
  femaleBodyX: number
  femaleBodyY: number
  inputY: number
  side: 'left' | 'right'
}

// Front view muscle positions (relative to 194x392 SVG)
// Coordinates point to visual center of each muscle group
export const FRONT_POSITIONS: MusclePosition[] = [
  // Left side (top to bottom)
  {
    muscle: 'Shoulders',
    maleBodyX: 50,
    maleBodyY: 78,
    femaleBodyX: 62,
    femaleBodyY: 100,
    inputY: 0,
    side: 'left',
  },
  {
    muscle: 'Biceps',
    maleBodyX: 45,
    maleBodyY: 112,
    femaleBodyX: 55,
    femaleBodyY: 130,
    inputY: 1,
    side: 'left',
  },
  {
    muscle: 'Core',
    maleBodyX: 96,
    maleBodyY: 135,
    femaleBodyX: 98,
    femaleBodyY: 160,
    inputY: 2,
    side: 'left',
  },
  {
    muscle: 'Quads',
    maleBodyX: 70,
    maleBodyY: 220,
    femaleBodyX: 72,
    femaleBodyY: 250,
    inputY: 3,
    side: 'left',
  },
  // Right side (top to bottom)
  {
    muscle: 'Traps',
    maleBodyX: 115,
    maleBodyY: 64,
    femaleBodyX: 115,
    femaleBodyY: 85,
    inputY: 0,
    side: 'right',
  },
  {
    muscle: 'Chest',
    maleBodyX: 116,
    maleBodyY: 92,
    femaleBodyX: 115,
    femaleBodyY: 115,
    inputY: 1,
    side: 'right',
  },
  {
    muscle: 'Forearms',
    maleBodyX: 160,
    maleBodyY: 145,
    femaleBodyX: 156,
    femaleBodyY: 170,
    inputY: 2,
    side: 'right',
  },
  {
    muscle: 'Inner Thighs',
    maleBodyX: 105,
    maleBodyY: 220,
    femaleBodyX: 110,
    femaleBodyY: 240,
    inputY: 3,
    side: 'right',
  },
]

// Back view muscle positions
export const BACK_POSITIONS: MusclePosition[] = [
  // Left side (top to bottom)
  {
    muscle: 'Traps',
    maleBodyX: 85,
    maleBodyY: 57,
    femaleBodyX: 90,
    femaleBodyY: 79,
    inputY: 0,
    side: 'left',
  },
  {
    muscle: 'Upper Back',
    maleBodyX: 95,
    maleBodyY: 95,
    femaleBodyX: 90,
    femaleBodyY: 115,
    inputY: 1,
    side: 'left',
  },
  {
    muscle: 'Triceps',
    maleBodyX: 43,
    maleBodyY: 120,
    femaleBodyX: 50,
    femaleBodyY: 140,
    inputY: 2,
    side: 'left',
  },
  {
    muscle: 'Glutes',
    maleBodyX: 80,
    maleBodyY: 185,
    femaleBodyX: 78,
    femaleBodyY: 215,
    inputY: 3,
    side: 'left',
  },
  {
    muscle: 'Hamstrings',
    maleBodyX: 72,
    maleBodyY: 235,
    femaleBodyX: 75,
    femaleBodyY: 270,
    inputY: 4,
    side: 'left',
  },
  // Right side (top to bottom)
  {
    muscle: 'Shoulders',
    maleBodyX: 145,
    maleBodyY: 82,
    femaleBodyX: 135,
    femaleBodyY: 95,
    inputY: 0,
    side: 'right',
  },
  {
    muscle: 'Lats',
    maleBodyX: 120,
    maleBodyY: 120,
    femaleBodyX: 115,
    femaleBodyY: 140,
    inputY: 1,
    side: 'right',
  },
  {
    muscle: 'Lower Back',
    maleBodyX: 97,
    maleBodyY: 150,
    femaleBodyX: 98,
    femaleBodyY: 170,
    inputY: 2,
    side: 'right',
  },
  {
    muscle: 'Calves',
    maleBodyX: 122,
    maleBodyY: 305,
    femaleBodyX: 116,
    femaleBodyY: 350,
    inputY: 3,
    side: 'right',
  },
]

export const LABEL_HEIGHT = 44
export const LABEL_WIDTH = 90

function getLabelCenterY(
  index: number,
  containerHeight: number,
  labelHeight: number,
  labelCount: number,
): number {
  const totalLabelsHeight = labelCount * labelHeight
  const totalGapSpace = containerHeight - totalLabelsHeight
  const gapBetween = totalGapSpace / (labelCount - 1)
  const labelTop = index * (labelHeight + gapBetween)
  return labelTop + labelHeight / 2
}

interface ConnectionLinesProps {
  positions: MusclePosition[]
  selectedMuscle: string | null
  containerWidth: number
  containerHeight: number
  labelColumnWidth: number
  svgWidth: number
  svgOffsetY: number
  isMale: boolean
}

function ConnectionLines({
  positions,
  selectedMuscle,
  containerWidth,
  containerHeight,
  labelColumnWidth,
  svgWidth,
  svgOffsetY,
  isMale,
}: ConnectionLinesProps) {
  const scale = svgWidth / BASE_SVG_WIDTH
  const svgOffsetX = labelColumnWidth + COLUMN_GAP
  const leftCount = positions.filter((p) => p.side === 'left').length
  const rightCount = positions.filter((p) => p.side === 'right').length

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={containerWidth}
      height={containerHeight}
      viewBox={`0 0 ${containerWidth} ${containerHeight}`}
    >
      {positions.map((pos) => {
        const rawBodyX = isMale ? pos.maleBodyX : pos.femaleBodyX
        const rawBodyY = isMale ? pos.maleBodyY : pos.femaleBodyY
        const bodyX = svgOffsetX + rawBodyX * scale
        const bodyY = svgOffsetY + rawBodyY * scale
        const labelCount = pos.side === 'left' ? leftCount : rightCount
        const labelY = getLabelCenterY(
          pos.inputY,
          containerHeight,
          LABEL_HEIGHT,
          labelCount,
        )
        const labelX =
          pos.side === 'left'
            ? labelColumnWidth
            : labelColumnWidth + COLUMN_GAP + svgWidth + COLUMN_GAP

        const elbowX =
          pos.side === 'left'
            ? labelX + (bodyX - labelX) * 0.2
            : labelX - (labelX - bodyX) * 0.2

        const isFocused = selectedMuscle === pos.muscle
        const pathData = `M ${labelX} ${labelY} L ${elbowX} ${labelY} L ${bodyX} ${bodyY}`

        return (
          <g key={`${pos.muscle}-${pos.side}`}>
            <path
              d={pathData}
              strokeWidth={isFocused ? 2 : 1}
              fill="none"
              className={cn(
                'transition-all duration-200',
                isFocused ? 'stroke-orange-800' : 'stroke-amber-800',
              )}
            />
            <circle
              cx={bodyX}
              cy={bodyY}
              r={isFocused ? 5 : 3}
              className={cn(
                'transition-all duration-200',
                isFocused ? 'fill-orange-800' : 'fill-amber-800',
              )}
            />
          </g>
        )
      })}
    </svg>
  )
}

export interface LabelRenderProps {
  position: MusclePosition
}

export interface BaseMuscleBodyMapProps {
  view: 'front' | 'back'
  muscleIntensity: Record<string, number>
  selectedMuscle: string | null
  onMuscleClick: (muscle: string) => void
  renderLabel: (props: LabelRenderProps) => ReactNode
}

export function BaseMuscleBodyMap({
  view,
  muscleIntensity,
  selectedMuscle,
  onMuscleClick,
  renderLabel,
}: BaseMuscleBodyMapProps) {
  const { user } = useUser()
  const isMale = user?.profile?.sex !== 'Female'
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerWidth, setContainerWidth] = useState(0)

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth)
      }
    }
    updateWidth()
    const observer = new ResizeObserver(updateWidth)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => observer.disconnect()
  }, [])

  const positions = view === 'front' ? FRONT_POSITIONS : BACK_POSITIONS
  const leftPositions = positions.filter((p) => p.side === 'left')
  const rightPositions = positions.filter((p) => p.side === 'right')

  const svgColumnWidth = containerWidth - LABEL_WIDTH * 2 - COLUMN_GAP * 2
  const svgWidth = Math.max(0, svgColumnWidth)
  const svgHeight = svgWidth * ASPECT_RATIO

  const leftLabelsHeight = leftPositions.length * LABEL_HEIGHT
  const rightLabelsHeight = rightPositions.length * LABEL_HEIGHT
  const minLabelHeight = Math.max(leftLabelsHeight, rightLabelsHeight)
  const containerHeight = Math.max(svgHeight, minLabelHeight)
  const svgOffsetY = (containerHeight - svgHeight) / 2

  const getPathProps = (aliases: string[]) => {
    let muscleGroupName: string | null = null
    for (const alias of aliases) {
      if (LABEL_TO_GROUP_MAPPING[alias]) {
        muscleGroupName = LABEL_TO_GROUP_MAPPING[alias]
        break
      }
    }
    const progress = muscleGroupName ? muscleIntensity[muscleGroupName] || 0 : 0
    // const isComplete = progress >= 1.0
    const isSelected = selectedMuscle === muscleGroupName

    return {
      className: cn(
        'cursor-pointer transition-all duration-300',
        getProgressColor(progress),
        // isComplete && 'animate-pulse',
        isSelected &&
          'ring-2 ring-orange-500 ring-offset-1 ring-offset-background',
      ),
      onClick: () => {
        if (muscleGroupName) {
          onMuscleClick(muscleGroupName)
        }
      },
    }
  }

  if (containerWidth === 0) {
    return (
      <div
        ref={containerRef}
        className="w-full"
        style={{ height: minLabelHeight }}
      />
    )
  }

  const BodyComponent =
    view === 'front'
      ? isMale
        ? MaleBodyFrontView
        : FemaleBodyFrontView
      : isMale
        ? MaleBodyBackView
        : FemaleBodyBackView

  return (
    <div
      ref={containerRef}
      className="relative w-full"
      style={{ height: `${containerHeight}px` }}
    >
      <div
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `${LABEL_WIDTH}px 1fr ${LABEL_WIDTH}px`,
          gap: `${COLUMN_GAP}px`,
        }}
      >
        {/* Left labels */}
        <div className="flex flex-col justify-between">
          {leftPositions.map((pos) => (
            <div key={pos.muscle}>{renderLabel({ position: pos })}</div>
          ))}
        </div>

        {/* Body */}
        <div className="relative flex items-center justify-center">
          <div
            className="[&_svg]:w-full [&_svg]:h-full"
            style={{ width: `${svgWidth}px`, height: `${svgHeight}px` }}
          >
            <BodyComponent getPathProps={getPathProps} />
          </div>
        </div>

        {/* Right labels */}
        <div className="flex flex-col justify-between">
          {rightPositions.map((pos) => (
            <div key={pos.muscle}>{renderLabel({ position: pos })}</div>
          ))}
        </div>
      </div>

      {/* Connection lines */}
      <ConnectionLines
        positions={positions}
        selectedMuscle={selectedMuscle}
        containerWidth={containerWidth}
        containerHeight={containerHeight}
        labelColumnWidth={LABEL_WIDTH}
        svgWidth={svgWidth}
        svgOffsetY={svgOffsetY}
        isMale={isMale}
      />
    </div>
  )
}
