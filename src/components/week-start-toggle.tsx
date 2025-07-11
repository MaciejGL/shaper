'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useUserPreferences } from '@/context/user-preferences-context'

export function WeekStartToggle() {
  const { preferences, setWeekStartsOn } = useUserPreferences()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Week Start Preference</CardTitle>
        <CardDescription>
          Choose which day your week should start on
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={preferences.weekStartsOn === 0 ? 'default' : 'outline'}
            onClick={() => setWeekStartsOn(0)}
            className="flex-1"
          >
            Sunday
          </Button>
          <Button
            variant={preferences.weekStartsOn === 1 ? 'default' : 'outline'}
            onClick={() => setWeekStartsOn(1)}
            className="flex-1"
          >
            Monday
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Current setting: Week starts on{' '}
          {preferences.weekStartsOn === 0 ? 'Sunday' : 'Monday'}
        </p>
      </CardContent>
    </Card>
  )
}
