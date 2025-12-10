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
  { bg: 'bg-orange-100', sets: '1-6', label: 'Low' },
  { bg: 'bg-orange-200', sets: '7-11', label: 'Moderate' },
  { bg: 'bg-orange-400', sets: '12-16', label: 'Optimal' },
  { bg: 'bg-orange-500', sets: '17+', label: 'Maximum' },
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
          <TooltipContent side="top" className="max-w-[280px] p-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="font-medium text-sm">Volume Insights</p>
                <p className="text-xs text-muted-foreground">
                  Track your weekly set volume per muscle group to ensure
                  optimal growth.
                </p>
              </div>

              <div className="space-y-1.5 rounded-md bg-muted/50 p-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">1-6 sets</span>
                  <span>Low volume</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">7-11 sets</span>
                  <span>Moderate</span>
                </div>
                <div className="flex items-center justify-between font-medium">
                  <span className="text-primary">12-16 sets</span>
                  <span className="text-primary">Optimal</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                Research suggests{' '}
                <span className="font-medium text-foreground">12-16 sets</span>{' '}
                weekly for optimal results.
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
