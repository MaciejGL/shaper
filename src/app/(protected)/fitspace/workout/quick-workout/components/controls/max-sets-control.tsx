'use client'

import { MinusIcon, PlusIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'

interface MaxSetsControlProps {
  value: number
  onChange: (sets: number) => void
  className?: string
}

export function MaxSetsControl({
  value,
  onChange,
  className,
}: MaxSetsControlProps) {
  const updateSets = (sets: number) => {
    const maxSetsPerExercise = Math.max(1, Math.min(8, sets))
    onChange(maxSetsPerExercise)
  }

  return (
    <Card className={className}>
      <CardContent>
        <div className="space-y-4">
          <Label htmlFor="max-sets" className="text-sm font-medium">
            Maximum Sets per Exercise
          </Label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={() => updateSets(value - 1)}
                disabled={value <= 1}
                iconOnly={<MinusIcon />}
              >
                Decrease
              </Button>
              <div className="w-20 text-center">
                <span className="text-3xl font-bold text-primary">{value}</span>
              </div>
              <Button
                variant="secondary"
                size="icon-sm"
                onClick={() => updateSets(value + 1)}
                disabled={value >= 8}
                iconOnly={<PlusIcon />}
              >
                Increase
              </Button>
            </div>
            <div className="text-sm text-muted-foreground text-right">
              <div className="font-medium">Recommended</div>
              <div>3-4 sets</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
