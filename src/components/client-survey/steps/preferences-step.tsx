import { AnimatePresence, motion } from 'framer-motion'

import { RadioButtons } from '@/components/radio-buttons'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { SliderInput } from '../components/slider-input'
import { ClientSurveyData } from '../types'

interface PreferencesStepProps {
  data: ClientSurveyData
  onChange: (updates: Partial<ClientSurveyData>) => void
}

const DURATION_OPTIONS = [
  { value: '30-45', label: '30-45 minutes' },
  { value: '45-60', label: '45-60 minutes' },
  { value: '60-90', label: '60-90 minutes' },
]

const LOCATION_OPTIONS = [
  { value: 'gym', label: 'Gym-Based Training' },
  { value: 'home', label: 'Home Workouts' },
  { value: 'outdoor', label: 'Outdoor Training' },
  { value: 'hybrid', label: 'Hybrid (Mix of gym & home)' },
]

export function PreferencesStep({ data, onChange }: PreferencesStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-semibold">Training Preferences</h2>
        <p className="text-muted-foreground">
          Help us understand your training style
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <Label>How motivated are you to reach your fitness goals?</Label>
          <SliderInput
            label="How motivated are you to reach your fitness goals?"
            hideLabel={true}
            value={data.motivationLevel}
            onChange={(value) => onChange({ motivationLevel: value })}
            min={1}
            max={10}
            minLabel="Not motivated"
            maxLabel="Extremely motivated"
          />
        </div>

        <div className="space-y-3">
          <Label>Preferred workout duration per session</Label>
          <RadioButtons
            value={data.preferredDuration}
            onValueChange={(value) => onChange({ preferredDuration: value })}
            options={DURATION_OPTIONS}
          />
        </div>

        <div className="space-y-3">
          <Label>Where do you prefer to train?</Label>
          <RadioButtons
            value={data.preferredLocation}
            onValueChange={(value) => onChange({ preferredLocation: value })}
            options={LOCATION_OPTIONS}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="loved-exercises"
            className="flex flex-col items-start gap-1"
          >
            List any exercises you like to do
            <p className="text-xs text-muted-foreground font-normal">
              (e.g., squats, deadlifts, cycling)
            </p>
          </Label>
          <Textarea
            id="loved-exercises"
            variant="ghost"
            placeholder="List your favorite exercises..."
            value={data.lovedExercises}
            onChange={(e) => onChange({ lovedExercises: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label
            htmlFor="hated-exercises"
            className="flex flex-col items-start gap-1"
          >
            List any exercises you prefer to avoid
          </Label>
          <Textarea
            id="hated-exercises"
            placeholder="List exercises you'd prefer to avoid..."
            value={data.hatedExercises}
            onChange={(e) => onChange({ hatedExercises: e.target.value })}
          />
        </div>

        <div>
          <Label className="mb-3">
            Do you have any injuries or medical conditions we should know about?
          </Label>
          <RadioButtons
            value={data.hasInjuries ? 'yes' : 'no'}
            onValueChange={(value) =>
              onChange({ hasInjuries: value === 'yes' })
            }
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          />
          <AnimatePresence mode="wait">
            {data.hasInjuries && (
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
                  <Textarea
                    id="injuries"
                    placeholder="Please describe any injuries or conditions..."
                    value={data.injuries || ''}
                    onChange={(e) => onChange({ injuries: e.target.value })}
                    rows={3}
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
