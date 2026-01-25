'use client'

import { Check, ChevronRight, Target, UserRound, X } from 'lucide-react'
import { useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CircularProgress } from '@/components/ui/circular-progress'
import { LocalStorageKey, useLocalStorage } from '@/hooks/use-local-storage'
import { cn } from '@/lib/utils'

import { CompleteProfileDrawer } from './complete-profile-drawer/complete-profile-drawer'
import type { CompleteYourAccountState } from './types'

interface CompleteYourAccountBannerProps {
  state: CompleteYourAccountState
}

export function CompleteYourAccountBanner({
  state,
}: CompleteYourAccountBannerProps) {
  const [dismissed, setDismissed] = useLocalStorage(
    LocalStorageKey.COMPLETE_ACCOUNT_BANNER_DISMISSED,
    false,
  )
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false)

  const { profileBasicsComplete, volumeGoalComplete } = useMemo(() => {
    const missingVolumeGoal = state.missingSteps.includes('volumeGoal')
    const missingProfileBasics = state.missingSteps.some(
      (s) => s !== 'volumeGoal',
    )

    return {
      profileBasicsComplete: !missingProfileBasics,
      volumeGoalComplete: !missingVolumeGoal,
    }
  }, [state.missingSteps])

  if (state.isLoading || state.isComplete || dismissed) {
    return null
  }

  const handleGoToProfile = () => {
    setProfileDrawerOpen(true)
  }

  const handleSetVolumeGoal = () => {
    window.dispatchEvent(new Event('hypro:open-volume-goal-wizard'))
  }

  const completedMajorSteps =
    Number(profileBasicsComplete) + Number(volumeGoalComplete)
  const progressPercent = (completedMajorSteps / 2) * 100

  return (
    <div className="dark py-4">
      <Card className="p-3" variant="highlighted">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <CircularProgress
              value={progressPercent}
              size="md"
              label={`${completedMajorSteps}/2`}
              sublabel="done"
              className="shrink-0"
            />
            <div className="min-w-0 pt-0.5">
              <p className="text-sm font-semibold">Complete your account</p>
              <p className="text-xs text-muted-foreground">
                Finish setup to get better progress insights.
              </p>
            </div>
          </div>

          <Button
            size="icon-sm"
            variant="ghost"
            iconOnly={<X />}
            aria-label="Dismiss"
            onClick={() => setDismissed(true)}
          >
            Dismiss
          </Button>
        </div>

        <div className="mt-3 space-y-1">
          <ChecklistRow
            title="Complete profile"
            description="Name, gender, birthday, height, weight"
            icon={<UserRound className="size-4" />}
            done={profileBasicsComplete}
            onClick={handleGoToProfile}
          />
          <ChecklistRow
            title="Set weekly volume goal"
            description="Targets per muscle group"
            icon={<Target className="size-4" />}
            done={volumeGoalComplete}
            onClick={handleSetVolumeGoal}
          />
        </div>
      </Card>

      <CompleteProfileDrawer
        open={profileDrawerOpen}
        onOpenChange={setProfileDrawerOpen}
        missingSteps={state.missingSteps}
      />
    </div>
  )
}

interface ChecklistRowProps {
  title: string
  description: string
  icon: React.ReactNode
  done: boolean
  onClick: () => void
}

function ChecklistRow({
  title,
  description,
  icon,
  done,
  onClick,
}: ChecklistRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl px-3 py-2',
        'border border-border/60 bg-neutral-950',
        'hover:bg-muted/40 transition-colors',
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-start gap-2 min-w-0">
          <div className="mt-0.5 text-muted-foreground">{icon}</div>
          <div className="min-w-0">
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground truncate">
              {description}
            </p>
          </div>
        </div>

        {done ? (
          <div className="shrink-0 flex items-center gap-1 text-xs font-medium text-primary">
            <Check className="size-4" />
            Done
          </div>
        ) : (
          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
        )}
      </div>
    </button>
  )
}
