'use client'

import { BodyViewProps } from '../types'

import { FemaleBodyBackBackground } from './background'
import { FemaleBodyBackBackgroundLayer } from './background-layer'
import { Unselectable } from './unselectable'

export function FemaleBodyBackView({ className, getPathProps }: BodyViewProps) {
  const defaultGetPathProps = (_aliases: string[]) => ({
    className: 'fill-neutral-500 dark:fill-neutral-700',
    onClick: () => {},
  })

  return (
    <div className="relative">
      <svg
        width="171"
        height="392"
        viewBox="0 0 171 392"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <g clipPath="url(#female-back-clip)">
          <mask
            id="female-back-mask"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="171"
            height="392"
          >
            <path d="M171 0H0V392H171V0Z" fill="white" />
          </mask>
          <g mask="url(#female-back-mask)">
            <Unselectable />
            <FemaleBodyBackBackground
              getPathProps={getPathProps ?? defaultGetPathProps}
            />
            <FemaleBodyBackBackgroundLayer />
          </g>
        </g>
        <defs>
          <clipPath id="female-back-clip">
            <rect width="171" height="392" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}
