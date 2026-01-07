'use client'

import { ChevronDownIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import { useUserPreferences } from '@/context/user-preferences-context'
import { GQLTrainingView } from '@/generated/graphql-client'

export function WorkoutOptionsDropdown() {
  const { preferences, setTrainingView, setShowImages } = useUserPreferences()

  const isAdvanced = preferences.trainingView === GQLTrainingView.Advanced
  const showImages = preferences.showImages ?? true

  const toggleLoggingMode = () => {
    setTrainingView(
      isAdvanced ? GQLTrainingView.Simple : GQLTrainingView.Advanced,
    )
  }

  const toggleShowImages = () => {
    setShowImages(!showImages)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="tertiary"
          size="md"
          iconEnd={<ChevronDownIcon className="size-4" />}
        >
          Workout Settings
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Workout Settings</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            toggleLoggingMode()
          }}
          className="flex cursor-pointer items-center justify-between"
        >
          <span className="w-full">Logging Mode</span>
          <Switch checked={isAdvanced} />
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            toggleShowImages()
          }}
          className="flex cursor-pointer items-center justify-between"
        >
          <span className="w-full">Show Images</span>
          <Switch checked={showImages} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
