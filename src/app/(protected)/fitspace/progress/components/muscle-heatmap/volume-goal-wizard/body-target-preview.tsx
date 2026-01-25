'use client'

import { useMemo } from 'react'

import { FemaleBodyBackView } from '@/components/human-body/female-body-back/female-body-back'
import { FemaleBodyFrontView } from '@/components/human-body/female-body-front/female-body-front'
import { MaleBodyBackView } from '@/components/human-body/male-body-back/male-body-back'
import { MaleBodyFrontView } from '@/components/human-body/male-body-front/male-body-front'
import { SVG_ALIAS_TO_DISPLAY_GROUP, type DisplayGroup } from '@/config/muscles'
import { useUser } from '@/context/user-context'
import { cn } from '@/lib/utils'

/**
 * Get color class based on target sets - emphasizes focus vs baseline
 * Uses relative coloring within the current selection
 */
function getTargetColorClass(
  sets: number,
  minSets: number,
  maxSets: number,
): string {
  const range = maxSets - minSets
  if (range === 0) return 'fill-orange-300'

  const normalized = (sets - minSets) / range

  if (normalized >= 0.8) return 'fill-orange-600' // Top focus
  if (normalized >= 0.5) return 'fill-orange-500' // High focus
  if (normalized >= 0.2) return 'fill-orange-300' // Medium
  return 'fill-orange-200' // Baseline
}

interface BodyTargetPreviewProps {
  targets: Record<DisplayGroup, number>
}

export function BodyTargetPreview({ targets }: BodyTargetPreviewProps) {
  const { user } = useUser()
  const isMale = user?.profile?.sex !== 'Female'

  const { minSets, maxSets } = useMemo(() => {
    const values = Object.values(targets)
    return {
      minSets: Math.min(...values),
      maxSets: Math.max(...values),
    }
  }, [targets])

  const getPathProps = (aliases: string[]) => {
    let muscleGroupName: string | null = null
    for (const alias of aliases) {
      if (SVG_ALIAS_TO_DISPLAY_GROUP[alias]) {
        muscleGroupName = SVG_ALIAS_TO_DISPLAY_GROUP[alias]
        break
      }
    }
    const sets = muscleGroupName
      ? targets[muscleGroupName as DisplayGroup] || 12
      : 12

    return {
      className: cn(
        'transition-all duration-300',
        getTargetColorClass(sets, minSets, maxSets),
      ),
    }
  }

  const FrontBody = isMale ? MaleBodyFrontView : FemaleBodyFrontView
  const BackBody = isMale ? MaleBodyBackView : FemaleBodyBackView

  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-[100px] [&_svg]:w-full [&_svg]:h-full">
        <FrontBody getPathProps={getPathProps} />
      </div>
      <div className="w-[100px] [&_svg]:w-full [&_svg]:h-full">
        <BackBody getPathProps={getPathProps} />
      </div>
    </div>
  )
}
