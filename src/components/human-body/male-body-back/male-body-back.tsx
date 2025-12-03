'use client'

import { BodyViewProps } from '../types'

import { MaleBodyBackBackground } from './background'
import { MaleBodyBackBackgroundLayer } from './background-layer'
import { Unselectable } from './unselectable'

export function MaleBodyBackView({ className, getPathProps }: BodyViewProps) {
  const defaultGetPathProps = (_aliases: string[]) => ({
    className: 'fill-[#424747]',
    onClick: () => {},
  })

  return (
    <div className="relative">
      <svg
        width="197"
        height="392"
        viewBox="0 0 197 392"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <g clipPath="url(#male-back-clip)">
          <mask
            id="male-back-mask"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="197"
            height="392"
          >
            <path d="M197 0H0V392H197V0Z" fill="white" />
          </mask>
          <g mask="url(#male-back-mask)">
            <MaleBodyBackBackgroundLayer />
            <Unselectable />
            <MaleBodyBackBackground
              getPathProps={getPathProps ?? defaultGetPathProps}
            />
          </g>
        </g>
        <defs>
          <clipPath id="male-back-clip">
            <rect width="197" height="392" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}
