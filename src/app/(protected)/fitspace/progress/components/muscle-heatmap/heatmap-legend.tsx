'use client'

import { Info } from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

import {
  DEFAULT_VOLUME_PRESET,
  VOLUME_PRESETS,
} from '../../constants/heatmap-colors'

const LEGEND_ITEMS = [
  { bg: 'bg-neutral-500 dark:bg-neutral-700', sets: '0', label: 'Not trained' },
  {
    bg: 'bg-orange-100',
    sets: `${DEFAULT_VOLUME_PRESET.ranges.low.min}-${DEFAULT_VOLUME_PRESET.ranges.low.max}`,
    label: 'Low',
  },
  {
    bg: 'bg-orange-200',
    sets: `${DEFAULT_VOLUME_PRESET.ranges.moderate.min}-${DEFAULT_VOLUME_PRESET.ranges.moderate.max}`,
    label: 'Moderate',
  },
  {
    bg: 'bg-orange-400',
    sets: `${DEFAULT_VOLUME_PRESET.ranges.optimal.min}-${DEFAULT_VOLUME_PRESET.ranges.optimal.max}`,
    label: 'Optimal',
  },
  {
    bg: 'bg-orange-500',
    sets: `${DEFAULT_VOLUME_PRESET.ranges.maximum.min}+`,
    label: 'Maximum',
  },
]

export function HeatmapLegend() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h4 className="text-xs font-medium text-muted-foreground">
          Weekly sets per muscle
        </h4>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Info className="size-4" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-[300px] p-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="font-medium text-sm">Weekly Volume Guide</p>
                <p className="text-xs text-muted-foreground">
                  Optimal sets per muscle group vary by training goal.
                </p>
              </div>

              <div className="space-y-1.5 rounded-md bg-muted/50 p-2 text-xs">
                {Object.values(VOLUME_PRESETS).map((preset) => (
                  <div
                    key={preset.id}
                    className={cn(
                      'flex items-center justify-between',
                      preset.id === DEFAULT_VOLUME_PRESET.id && 'font-medium',
                    )}
                  >
                    <span
                      className={cn(
                        preset.id === DEFAULT_VOLUME_PRESET.id
                          ? 'text-primary'
                          : 'text-muted-foreground',
                      )}
                    >
                      {preset.name}
                    </span>
                    <span
                      className={cn(
                        preset.id === DEFAULT_VOLUME_PRESET.id &&
                          'text-primary',
                      )}
                    >
                      {preset.ranges.optimal.min}-{preset.ranges.optimal.max}{' '}
                      sets
                    </span>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground">
                Currently using{' '}
                <span className="font-medium text-foreground">
                  {DEFAULT_VOLUME_PRESET.name}
                </span>{' '}
                preset ({DEFAULT_VOLUME_PRESET.ranges.optimal.min}-
                {DEFAULT_VOLUME_PRESET.ranges.optimal.max} sets optimal).
              </p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.sets} className="flex items-center gap-1.5">
            <div className={cn('size-3 rounded-sm', item.bg)} />
            <span className="text-[10px] text-muted-foreground">
              {item.sets}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
