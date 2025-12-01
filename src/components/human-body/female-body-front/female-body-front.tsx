'use client'

import { BodyViewProps } from '../types'

import { FemaleBodyFrontBackground } from './background'
import { FemaleBodyFrontBackgroundLayer } from './background-layer'
import { Unselectable } from './unselectable'

export function FemaleBodyFrontView({
  className,
  getPathProps,
}: BodyViewProps) {
  const defaultGetPathProps = (_aliases: string[]) => ({
    className: 'fill-[#424747]',
    onClick: () => {},
  })

  return (
    <div className="relative">
      <svg
        width="174"
        height="392"
        viewBox="0 0 174 392"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <g clipPath="url(#female-front-clip)">
          <mask
            id="female-front-mask"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="174"
            height="392"
          >
            <path d="M174 0H0V392H174V0Z" fill="white" />
          </mask>
          <g mask="url(#female-front-mask)">
            <Unselectable />
            <FemaleBodyFrontBackground
              getPathProps={getPathProps ?? defaultGetPathProps}
            />
            <FemaleBodyFrontBackgroundLayer />
          </g>
        </g>
        <defs>
          <clipPath id="female-front-clip">
            <rect width="174" height="392" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}
