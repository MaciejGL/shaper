import { AnimatePresence, motion } from 'framer-motion'

import { RadioButtons } from '@/components/radio-buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { CheckboxGroup } from '../components/checkbox-group'
import { ClientSurveyData } from '../types'

interface FitnessLevelStepProps {
  data: ClientSurveyData
  onChange: (updates: Partial<ClientSurveyData>) => void
}

const EXERCISE_FREQUENCY_OPTIONS = [
  { value: 'none', label: '0 (No exercise)' },
  { value: '1-2', label: '1-2 days per week' },
  { value: '3-4', label: '3-4 days per week' },
  { value: '5+', label: '5+ days per week' },
]

const EXERCISE_TYPES = [
  { value: 'weightlifting', label: 'Weightlifting / Bodybuilding' },
  { value: 'cardio', label: 'Cardio (Running, Cycling, etc.)' },
  { value: 'functional', label: 'Functional Training (HIIT, etc.)' },
  { value: 'yoga', label: 'Yoga / Pilates' },
  { value: 'sports', label: 'Sports (Tennis, Basketball, etc.)' },
  { value: 'exercise-other', label: 'Other' },
]

const TRAINING_DURATION_OPTIONS = [
  { value: '<3months', label: 'Less than 3 months' },
  { value: '3-6months', label: '3-6 months' },
  { value: '6-12months', label: '6 months - 1 year' },
  { value: '1year+', label: '1+ years' },
]

const FITNESS_LEVEL_OPTIONS = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'New to structured training',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: 'Some experience, still progressing',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: 'Consistent training, advanced techniques',
  },
]

export function FitnessLevelStep({ data, onChange }: FitnessLevelStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-semibold">Current Fitness Level</h2>
        <p className="text-muted-foreground">
          Tell us about your training experience
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>How often do you exercise per week?</Label>
          <RadioButtons
            value={data.exerciseFrequency}
            onValueChange={(value) => onChange({ exerciseFrequency: value })}
            options={EXERCISE_FREQUENCY_OPTIONS}
            columns={1}
          />
        </div>

        <div>
          <Label className="flex flex-col items-start gap-1 mb-3">
            <p>What type of exercise do you currently do?</p>
            <p className="text-xs text-muted-foreground font-normal">
              (select all that apply)
            </p>
          </Label>
          <CheckboxGroup
            options={EXERCISE_TYPES}
            value={data.exerciseTypes}
            onChange={(value) => onChange({ exerciseTypes: value })}
          />
          <AnimatePresence mode="wait">
            {data.exerciseTypes.includes('exercise-other') && (
              <motion.div
                key="other-exercise-type"
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
                    id="other-exercise-type"
                    placeholder="Please specify..."
                    value={data.otherExerciseType || ''}
                    onChange={(e) =>
                      onChange({ otherExerciseType: e.target.value })
                    }
                    variant="secondary"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-3">
          <Label>How long have you been training consistently?</Label>
          <RadioButtons
            value={data.trainingDuration}
            onValueChange={(value) => onChange({ trainingDuration: value })}
            options={TRAINING_DURATION_OPTIONS}
            columns={1}
          />
        </div>

        <div className="space-y-3">
          <Label>Rate your current fitness level</Label>
          <RadioButtons
            value={data.currentFitnessLevel}
            onValueChange={(value) => onChange({ currentFitnessLevel: value })}
            options={FITNESS_LEVEL_OPTIONS}
            columns={1}
          />
        </div>
      </div>
    </div>
  )
}
