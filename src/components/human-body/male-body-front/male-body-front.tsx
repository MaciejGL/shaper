'use client'

// Import muscle groups from body-front folder (shared with old structure)
import { Abdominals } from '../body-front/abdominals'
import { Biceps } from '../body-front/biceps'
import { Chest } from '../body-front/chest'
import { Deltoid } from '../body-front/deltoid'
import { Forearms } from '../body-front/forearms'
import { InnerThighs } from '../body-front/inner-thighs'
import { Neck } from '../body-front/neck'
import { Quads } from '../body-front/quads'
import { Shins } from '../body-front/shins'
import { Trapezius } from '../body-front/trapezius'
import { BodyViewProps } from '../types'

import { MaleBodyFrontBackground } from './background'
import { Unselectable } from './unselectable'

export function MaleBodyFrontView({ getPathProps }: BodyViewProps) {
  const Y_OFFSET = 0
  const LEFT_LABEL_OFFSET = 15
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
  }

  return (
    <div className="relative">
      <svg
        width="194"
        height="392"
        viewBox="0 0 194 392"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#male-front-clip)">
          <mask
            id="male-front-mask"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="194"
            height="392"
          >
            <path d="M194 0H0V392H194V0Z" fill="white" />
          </mask>
          <g mask="url(#male-front-mask)">
            <Unselectable />
            <MaleBodyFrontBackground getPathProps={getPathProps} />

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
          </g>
        </g>
        <defs>
          <clipPath id="male-front-clip">
            <rect width="194" height="392" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}
