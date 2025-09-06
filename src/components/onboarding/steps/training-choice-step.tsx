import { BookOpenCheckIcon, DumbbellIcon, User2Icon } from 'lucide-react'

import { RadioButtons } from '@/components/radio-buttons'
import { SectionIcon } from '@/components/ui/section-icon'

interface TrainingChoiceStepProps {
  trainingChoice: string
  onTrainingChoiceChange: (value: string) => void
}

export function TrainingChoiceStep({
  trainingChoice,
  onTrainingChoiceChange,
}: TrainingChoiceStepProps) {
  return (
    <div className="text-center space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold">You're all set!</h2>
        <p className="text-muted-foreground">
          What would you like to do first?
        </p>
      </div>
      <div className="space-y-3">
        <RadioButtons
          value={trainingChoice}
          onValueChange={onTrainingChoiceChange}
          columns={1}
          itemClassName="h-auto text-left justify-start"
          options={[
            {
              value: 'custom',
              label: 'Build Custom Workout',
              description: 'Create your own workout with our wizard',
              icon: (
                <SectionIcon size="sm" icon={DumbbellIcon} variant="green" />
              ),
            },
            {
              value: 'plans',
              label: 'Browse Training Plans',
              description: 'Explore structured workout programs',
              icon: (
                <SectionIcon size="sm" icon={BookOpenCheckIcon} variant="sky" />
              ),
            },
            {
              value: 'trainer',
              label: 'Find a Trainer',
              description: 'Get personalized coaching',
              icon: <SectionIcon size="sm" icon={User2Icon} variant="amber" />,
            },
          ]}
        />
      </div>
    </div>
  )
}
