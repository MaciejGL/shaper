'use client'

// Import muscle groups from body-back folder (shared with old structure)
import { Calves } from '../body-back/calves'
import { Deltoid } from '../body-back/deltoid'
import { Forearms } from '../body-back/forearms'
import { Glutes } from '../body-back/glutes'
import { Hamstrings } from '../body-back/hamstrings'
import { Lats } from '../body-back/lats'
import { LowerBack } from '../body-back/lower-back'
import { Rhomboids } from '../body-back/rhomboids'
import { Traps } from '../body-back/traps'
import { Triceps } from '../body-back/triceps'
import { ConnectionLine } from '../connection-line'
import { MuscleLabel } from '../muscle-label'
import { BodyViewProps } from '../types'

import { MaleBodyBackBackground } from './background'
import { Unselectable } from './unselectable'

export function MaleBodyBackView({
  getPathProps,
  isRegionSelected,
  handleRegionClick,
  hasMuscleData,
  hideLabels = false,
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
        <g clipPath="url(#male-back-clip)">
          <Unselectable />
          <MaleBodyBackBackground getPathProps={getPathProps} />

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

          {!hideLabels &&
            Object.entries(config).map(([key, value]) => (
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
          <clipPath id="male-back-clip">
            <rect width="200" height="400" fill="white" />
          </clipPath>
        </defs>
      </svg>
      {!hideLabels &&
        Object.entries(config).map(([label, value]) => (
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
