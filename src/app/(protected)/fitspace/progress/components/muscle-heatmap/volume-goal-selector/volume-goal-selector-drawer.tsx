'use client'

import { Check } from 'lucide-react'

import { getVolumeGoalPresetsList } from '@/config/volume-goals'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

import type { VolumeGoalSelectorProps } from './types'

export function VolumeGoalSelectorDrawer({
  open,
  onOpenChange,
  currentPresetId,
  onSelect,
}: VolumeGoalSelectorProps) {
  const presets = getVolumeGoalPresetsList()

  const handleSelect = (presetId: string) => {
    onSelect(presetId)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent dialogTitle="Set Volume Goal">
        <DrawerHeader>
          <DrawerTitle>Set Volume Goal</DrawerTitle>
          <DrawerDescription>
            Choose a weekly target that matches your training focus
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-4 pb-4 space-y-2 max-h-[60vh] overflow-y-auto">
          {presets.map((preset) => {
            const isSelected = preset.id === currentPresetId

            return (
              <button
                key={preset.id}
                onClick={() => handleSelect(preset.id)}
                className={cn(
                  'w-full text-left rounded-lg border p-3 transition-colors',
                  'hover:bg-accent/50',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{preset.name}</span>
                      {isSelected && (
                        <Check className="size-4 text-primary shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {preset.description}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <DrawerFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
