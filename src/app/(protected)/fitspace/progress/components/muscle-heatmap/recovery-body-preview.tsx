'use client'

import { FemaleBodyBackView } from '@/components/human-body/female-body-back/female-body-back'
import { FemaleBodyFrontView } from '@/components/human-body/female-body-front/female-body-front'
import { MaleBodyBackView } from '@/components/human-body/male-body-back/male-body-back'
import { MaleBodyFrontView } from '@/components/human-body/male-body-front/male-body-front'
import { SVG_ALIAS_TO_DISPLAY_GROUP } from '@/config/muscles'
import { useUser } from '@/context/user-context'
import { cn } from '@/lib/utils'

type RecoveryItem = {
  muscle: string
  percentRecovered: number
}

interface RecoveryBodyPreviewProps {
  recovery: RecoveryItem[]
}

function getRecoveryFillClass(percentRecovered: number | undefined): string {
  if (percentRecovered == null) return 'fill-neutral-400 dark:fill-neutral-500'
  if (percentRecovered >= 100) return 'fill-green-500 dark:fill-green-500'
  // if (percentRecovered >= 75) return 'fill-green-400 dark:fill-amber-200'
  if (percentRecovered >= 50) return 'fill-amber-400 dark:fill-amber-400'
  return 'fill-amber-500 dark:fill-amber-500'
}

export function RecoveryBodyPreview({ recovery }: RecoveryBodyPreviewProps) {
  const { user } = useUser()
  const isMale = user?.profile?.sex !== 'Female'

  const recoveryByGroup = new Map<string, number>(
    recovery.map((r) => [r.muscle, r.percentRecovered]),
  )

  const getPathProps = (aliases: string[]) => {
    let displayGroup: string | null = null
    for (const alias of aliases) {
      const mapped = SVG_ALIAS_TO_DISPLAY_GROUP[alias]
      if (mapped) {
        displayGroup = mapped
        break
      }
    }

    const percentRecovered =
      displayGroup != null ? recoveryByGroup.get(displayGroup) : undefined

    return {
      className: cn(
        'transition-colors duration-200 pointer-events-none',
        getRecoveryFillClass(percentRecovered),
      ),
      onClick: () => {},
    }
  }

  const FrontBody = isMale ? MaleBodyFrontView : FemaleBodyFrontView
  const BackBody = isMale ? MaleBodyBackView : FemaleBodyBackView

  return (
    <div className="">
      <div className="flex items-center justify-center gap-3 px-6 py-6">
        <div className="w-1/2 [&_svg]:w-full [&_svg]:h-full">
          <FrontBody getPathProps={getPathProps} />
        </div>
        <div className="w-1/2 [&_svg]:w-full [&_svg]:h-full">
          <BackBody getPathProps={getPathProps} />
        </div>
      </div>
    </div>
  )
}
