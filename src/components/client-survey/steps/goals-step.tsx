import { AnimatePresence, motion } from 'framer-motion'

import { RadioButtons } from '@/components/radio-buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { ClientSurveyData } from '../types'

interface GoalsStepProps {
  data: ClientSurveyData
  onChange: (updates: Partial<ClientSurveyData>) => void
}

const PRIMARY_GOAL_OPTIONS = [
  { value: 'fat-loss', label: 'Fat Loss / Weight Loss' },
  { value: 'muscle-gain', label: 'Muscle Gain (Hypertrophy)' },
  {
    value: 'strength',
    label: 'Strength & Power (Powerlifting, Strength Training)',
  },
  { value: 'athletic', label: 'Athletic Performance (Sports, Agility)' },
  { value: 'general', label: 'General Fitness & Endurance' },
  { value: 'primary-goal-other', label: 'Other' },
]

const SECONDARY_GOAL_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'flexibility', label: 'Improve Flexibility / Mobility' },
  { value: 'definition', label: 'Build Muscle Definition' },
  { value: 'stamina', label: 'Increase Stamina' },
  { value: 'rehab', label: 'Rehab / Injury Prevention' },
  { value: 'secondary-goal-other', label: 'Other' },
]

export function GoalsStep({ data, onChange }: GoalsStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-semibold">Your Fitness Goals</h2>
        <p className="text-muted-foreground">
          What do you want to achieve with coaching?
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="mb-3">
            <p>What is your PRIMARY fitness goal?</p>
          </Label>
          <RadioButtons
            value={data.primaryGoal}
            onValueChange={(value) => onChange({ primaryGoal: value })}
            options={PRIMARY_GOAL_OPTIONS}
            columns={1}
          />
          <AnimatePresence mode="wait">
            {data.primaryGoal === 'primary-goal-other' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  duration: 0.2,
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                }}
              >
                <div className="pt-1">
                  <Input
                    id="other-primary-goal"
                    placeholder="Please specify..."
                    value={data.otherPrimaryGoal || ''}
                    onChange={(e) =>
                      onChange({ otherPrimaryGoal: e.target.value })
                    }
                    variant="secondary"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <Label className="mb-3">
            What is your SECONDARY goal? (Optional)
          </Label>
          <RadioButtons
            value={data.secondaryGoal}
            onValueChange={(value) => onChange({ secondaryGoal: value })}
            options={SECONDARY_GOAL_OPTIONS}
            columns={1}
          />
          <AnimatePresence mode="wait">
            {data.secondaryGoal === 'secondary-goal-other' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  duration: 0.2,
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                }}
              >
                <div className="pt-1">
                  <Input
                    id="other-secondary-goal"
                    placeholder="Please specify..."
                    value={data.otherSecondaryGoal || ''}
                    onChange={(e) =>
                      onChange({ otherSecondaryGoal: e.target.value })
                    }
                    variant="secondary"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <Label className="flex flex-col items-start gap-1 mb-3">
            Do you have a specific deadline or event?
            <p className="text-xs text-muted-foreground font-normal">
              (e.g., competition, wedding, marathon)
            </p>
          </Label>
          <RadioButtons
            value={data.hasDeadline ? 'yes' : 'no'}
            onValueChange={(value) =>
              onChange({ hasDeadline: value === 'yes' })
            }
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          />
          <AnimatePresence mode="wait">
            {data.hasDeadline && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{
                  duration: 0.2,
                  type: 'spring',
                  stiffness: 200,
                  damping: 25,
                }}
              >
                <div className="pt-1">
                  <Input
                    id="deadline"
                    placeholder="Describe your deadline or event..."
                    value={data.deadline || ''}
                    onChange={(e) => onChange({ deadline: e.target.value })}
                    variant="secondary"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
