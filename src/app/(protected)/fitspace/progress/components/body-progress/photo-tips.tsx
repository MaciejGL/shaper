'use client'

import { Info } from 'lucide-react'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function PhotoTips() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Info className="size-4 text-muted-foreground" />
      </TooltipTrigger>
      <TooltipContent className="space-y-2 p-4">
        <h3 className="font-medium flex items-center gap-2 text-base">
          Tips for Consistent Progress Photos
        </h3>
        <ul className="text-sm space-y-1 list-disc list-outside pl-6 leading-relaxed">
          <li>Take photos at the same time of day (preferably morning)</li>
          <li>Use consistent lighting and background</li>
          <li>Wear minimal, form-fitting clothing</li>
          <li>Stand in the same pose: front view, side view, back view</li>
          <li>Keep your phone at the same distance and height</li>
        </ul>
      </TooltipContent>
    </Tooltip>
  )
}
