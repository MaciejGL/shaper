'use client'

import { BodyViewProps } from '../types'

import { MaleBodyBackBackground } from './background'
import { MaleBodyBackBackgroundLayer } from './background-layer'
import { Unselectable } from './unselectable'

export function MaleBodyBackView({ getPathProps }: BodyViewProps) {
  return (
    <div className="relative">
      <svg
        width="194"
        height="392"
        viewBox="0 0 194 392"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#male-back-clip)">
          <mask
            id="male-back-mask"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="194"
            height="392"
          >
            <path d="M194 0H0V392H194V0Z" fill="white" />
          </mask>
          <g mask="url(#male-back-mask)">
            <Unselectable />
            <MaleBodyBackBackground getPathProps={getPathProps} />
            <MaleBodyBackBackgroundLayer />
          </g>
        </g>
        <defs>
          <clipPath id="male-back-clip">
            <rect width="194" height="392" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}
