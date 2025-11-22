'use client'

import { Settings2Icon } from 'lucide-react'

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
  const { preferences, setTrainingView } = useUserPreferences()

  const isAdvanced = preferences.trainingView === GQLTrainingView.Advanced

  const toggleLoggingMode = () => {
    setTrainingView(
      isAdvanced ? GQLTrainingView.Simple : GQLTrainingView.Advanced,
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="tertiary"
          size="icon-sm"
          iconOnly={<Settings2Icon className="size-4" />}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            toggleLoggingMode()
          }}
          className="flex cursor-pointer items-center justify-between"
        >
          <span>Logging Mode</span>
          <Switch checked={isAdvanced} />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
