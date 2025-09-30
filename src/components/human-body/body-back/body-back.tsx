'use client'

import { ConnectionLine } from '../connection-line'
import { MuscleLabel } from '../muscle-label'
import { BodyViewProps } from '../types'

import { BackBodyBackground } from './background'
import { Calves } from './calves'
import { Deltoid } from './deltoid'
import { Forearms } from './forearms'
import { Glutes } from './glutes'
import { Hamstrings } from './hamstrings'
import { Lats } from './lats'
import { LowerBack } from './lower-back'
import { Rhomboids } from './rhomboids'
import { Traps } from './traps'
import { Triceps } from './triceps'
import { Unselectable } from './unselectable'

export function BackBodyView({
  getPathProps,
  isRegionSelected,
  handleRegionClick,
  hasMuscleData,
}: BodyViewProps) {
  const Y_OFFSET = 20
  const LEFT_LABEL_OFFSET = 13
  const RIGHT_LABEL_OFFSET = 188
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
    ['Upper Back']: {
      muscleX: 100,
      muscleY: 100,
      labelX: LEFT_LABEL_OFFSET ? LEFT_LABEL_OFFSET + 20 : 20,
      labelY: 30 + Y_OFFSET,
      aliases: ['rhomboids'],
      side: 'left',
    },
    Shoulders: {
      muscleX: 60,
      muscleY: 95,
      labelX: LEFT_LABEL_OFFSET ? LEFT_LABEL_OFFSET + 20 : 20,
      labelY: 80 + Y_OFFSET,
      aliases: ['rear delts', 'side delts', 'front delts'],
      side: 'left',
    },
    Lats: {
      muscleX: 80,
      muscleY: 130,
      labelX: LEFT_LABEL_OFFSET || 20,
      labelY: 130 + Y_OFFSET,
      aliases: ['lats'],
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
    Hamstrings: {
      muscleX: 80,
      muscleY: 240,
      labelX: LEFT_LABEL_OFFSET ? LEFT_LABEL_OFFSET + 20 : 20,
      labelY: 230 + Y_OFFSET,
      aliases: ['hams'],
      side: 'left',
    },

    ////////////////
    // Right side
    ////////////////

    Traps: {
      muscleX: 110,
      muscleY: 75,
      labelX: RIGHT_LABEL_OFFSET || 180,
      labelY: 40 + Y_OFFSET,
      aliases: ['traps'],
      side: 'right',
    },
    Triceps: {
      muscleX: 145,
      muscleY: 122,
      labelX: RIGHT_LABEL_OFFSET || 190,
      labelY: 90 + Y_OFFSET,
      aliases: ['triceps'],
      side: 'right',
    },
    LowerBack: {
      muscleX: 100,
      muscleY: 160,
      labelX: RIGHT_LABEL_OFFSET || 190,
      labelY: 140 + Y_OFFSET,
      aliases: ['lower back'],
      side: 'right',
    },
    Glutes: {
      muscleX: 115,
      muscleY: 195,
      labelX: RIGHT_LABEL_OFFSET || 190,
      labelY: 190 + Y_OFFSET,
      aliases: ['glutes'],
      side: 'right',
    },
    Calves: {
      muscleX: 120,
      muscleY: 295,
      labelX: RIGHT_LABEL_OFFSET || 190,
      labelY: 290 + Y_OFFSET,
      aliases: ['calves'],
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
        <g clipPath="url(#clip0_3346_1070)">
          <Unselectable />
          <BackBodyBackground />
          <Traps getPathProps={getPathProps} />
          <Rhomboids getPathProps={getPathProps} />
          <Deltoid getPathProps={getPathProps} />
          <Triceps getPathProps={getPathProps} />
          <Lats getPathProps={getPathProps} />
          <LowerBack getPathProps={getPathProps} />
          <Forearms getPathProps={getPathProps} />
          <Glutes getPathProps={getPathProps} />
          <Hamstrings getPathProps={getPathProps} />
          <Calves getPathProps={getPathProps} />

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
          <clipPath id="clip0_3346_1070">
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
          hasMuscleData={hasMuscleData}
        />
      ))}
    </div>
  )
}

// Enhanced muscle label component with improved styling and animations
