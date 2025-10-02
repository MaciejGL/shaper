import { RadioButtons } from '@/components/radio-buttons'
import { Label } from '@/components/ui/label'

import { ClientSurveyData } from '../types'

interface RecoveryStepProps {
  data: ClientSurveyData
  onChange: (updates: Partial<ClientSurveyData>) => void
}

const SLEEP_HOURS_OPTIONS = [
  { value: '<5', label: 'Less than 5 hours' },
  { value: '5-6', label: '5-6 hours' },
  { value: '7-8', label: '7-8 hours' },
  { value: '8+', label: '8+ hours' },
]

export function RecoveryStep({ data, onChange }: RecoveryStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-semibold">Recovery & Sleep</h2>
        <p className="text-muted-foreground">
          Recovery is crucial for progress
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>How many hours of sleep do you average per night?</Label>
          <RadioButtons
            value={data.sleepHours}
            onValueChange={(value) => onChange({ sleepHours: value })}
            options={SLEEP_HOURS_OPTIONS}
            columns={1}
          />
        </div>

        <div className="space-y-3">
          <Label className="flex flex-col items-start gap-1">
            Do you struggle with sleep quality?
            <p className="text-xs text-muted-foreground font-normal">
              (e.g., insomnia, frequent waking)
            </p>
          </Label>
          <RadioButtons
            value={data.hasSleepIssues ? 'yes' : 'no'}
            onValueChange={(value) =>
              onChange({ hasSleepIssues: value === 'yes' })
            }
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          />
        </div>
      </div>
    </div>
  )
}
