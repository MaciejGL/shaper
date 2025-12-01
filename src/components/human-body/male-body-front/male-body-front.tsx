'use client'

import { BodyViewProps } from '../types'

import { MaleBodyFrontBackground } from './background'
import { MaleBodyFrontBackgroundLayer } from './background-layer'
import { Unselectable } from './unselectable'

export function MaleBodyFrontView({ getPathProps }: BodyViewProps) {
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
            <MaleBodyFrontBackgroundLayer />
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
