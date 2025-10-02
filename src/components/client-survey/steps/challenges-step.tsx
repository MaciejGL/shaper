import { RadioButtons } from '@/components/radio-buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { ClientSurveyData } from '../types'

interface ChallengesStepProps {
  data: ClientSurveyData
  onChange: (updates: Partial<ClientSurveyData>) => void
}

const CHALLENGE_OPTIONS = [
  { value: 'time', label: 'Lack of Time' },
  { value: 'motivation', label: 'Motivation' },
  { value: 'nutrition', label: 'Nutrition' },
  { value: 'recovery', label: 'Recovery/Sleep' },
  { value: 'results', label: 'Not Seeing Results' },
  { value: 'challenge-other', label: 'Other' },
]

export function ChallengesStep({ data, onChange }: ChallengesStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-semibold">Final Thoughts</h2>
        <p className="text-muted-foreground">
          Help us understand your challenges
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>
            What's your biggest challenge in reaching your fitness goals?
          </Label>
          <RadioButtons
            value={data.biggestChallenge}
            onValueChange={(value) => onChange({ biggestChallenge: value })}
            options={CHALLENGE_OPTIONS}
          />
          {data.biggestChallenge === 'challenge-other' && (
            <Input
              id="other-challenge"
              placeholder="Please specify..."
              value={data.otherChallenge || ''}
              onChange={(e) => onChange({ otherChallenge: e.target.value })}
              variant="secondary"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="additional-info">
            Is there anything else you'd like your coach to know?
          </Label>
          <Textarea
            id="additional-info"
            placeholder="Share any additional information that might help your coach..."
            value={data.additionalInfo}
            onChange={(e) => onChange({ additionalInfo: e.target.value })}
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}
