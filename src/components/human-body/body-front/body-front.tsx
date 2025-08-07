'use client'

import { ConnectionLine } from '../connection-line'
import { MuscleLabel } from '../muscle-label'
import { BodyViewProps } from '../types'

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

export function FrontBodyView({
  getPathProps,
  isRegionSelected,
  handleRegionClick,
}: BodyViewProps) {
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
    // Shins: {
    //   muscleX: 127,
    //   muscleY: 310,
    //   labelX: RIGHT_LABEL_OFFSET || 195,
    //   labelY: 320 + Y_OFFSET,
    //   aliases: ['shin'],
    //   side: 'right',
    // },
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
