'use client'

import { BodyViewProps } from '../types'

import { MaleBodyFrontBackground } from './background'
import { MaleBodyFrontBackgroundLayer } from './background-layer'
import { Unselectable } from './unselectable'

export function MaleBodyFrontView({ className, getPathProps }: BodyViewProps) {
  const defaultGetPathProps = (_aliases: string[]) => ({
    className: 'fill-[#424747]',
    onClick: () => {},
  })

  return (
    <div className="relative">
      <svg
        width="198"
        height="393"
        viewBox="0 0 198 393"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <g clipPath="url(#male-front-clip)">
          <mask
            id="male-front-mask"
            style={{ maskType: 'luminance' }}
            maskUnits="userSpaceOnUse"
            x="0"
            y="0"
            width="198"
            height="393"
          >
            <path d="M198 0H0V393H198V0Z" fill="white" />
          </mask>
          <g mask="url(#male-front-mask)">
            <Unselectable />
            <MaleBodyFrontBackground
              getPathProps={getPathProps ?? defaultGetPathProps}
            />
            <MaleBodyFrontBackgroundLayer />
          </g>
        </g>
        <defs>
          <clipPath id="male-front-clip">
            <rect width="198" height="393" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </div>
  )
}
