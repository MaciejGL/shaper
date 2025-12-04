'use client'

import { Info } from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const LEGEND_ITEMS = [
  { bg: 'bg-neutral-500 dark:bg-neutral-700', sets: '0', label: 'Not trained' },
  { bg: 'bg-orange-100', sets: '1-3', label: 'Starting' },
  { bg: 'bg-orange-200', sets: '4-6', label: 'Building' },
  { bg: 'bg-orange-300', sets: '7-9', label: 'Good' },
  { bg: 'bg-orange-400', sets: '10-11', label: 'Almost' },
  { bg: 'bg-orange-500', sets: '12+', label: 'Optimal' },
]

export function HeatmapLegend() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
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
          <TooltipContent side="top" className="max-w-[260px]">
            Research suggests 12+ sets per muscle group weekly for optimal
            growth. This tracks your progress toward that target.
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

