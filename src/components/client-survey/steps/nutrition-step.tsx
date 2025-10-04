import { AnimatePresence, motion } from 'framer-motion'

import { RadioButtons } from '@/components/radio-buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import { CheckboxGroup } from '../components/checkbox-group'
import { ClientSurveyData } from '../types'

interface NutritionStepProps {
  data: ClientSurveyData
  onChange: (updates: Partial<ClientSurveyData>) => void
}

const CUISINE_OPTIONS = [
  { value: 'mediterranean', label: 'Mediterranean' },
  { value: 'asian', label: 'Asian' },
  { value: 'western', label: 'Western (American/European)' },
  { value: 'vegetarian', label: 'Vegetarian/Vegan' },
  { value: 'cuisine-other', label: 'Other' },
]

const DIET_QUALITY_OPTIONS = [
  {
    value: 'clean',
    label: 'Very Clean',
    description: 'Whole foods, balanced macros',
  },
  {
    value: 'moderate',
    label: 'Moderately Healthy',
    description: 'Some processed foods',
  },
  {
    value: 'inconsistent',
    label: 'Inconsistent',
    description: 'No structured diet',
  },
]

const TRACKING_OPTIONS = [
  { value: 'closely', label: 'Yes, closely' },
  { value: 'sometimes', label: 'Sometimes' },
  { value: 'never', label: 'No' },
]

const SUPPLEMENT_OPTIONS = [
  { value: 'none', label: 'None' },
  { value: 'protein', label: 'Protein Powder' },
  { value: 'creatine', label: 'Creatine' },
  { value: 'pre-workout', label: 'Pre-Workout' },
  { value: 'multivitamin', label: 'Multivitamins' },
  { value: 'omega3', label: 'Omega-3/Fish Oil' },
  { value: 'bcaa', label: 'BCAAs' },
  { value: 'vitamin-d', label: 'Vitamin D' },
  { value: 'supplement-other', label: 'Other' },
]

export function NutritionStep({ data, onChange }: NutritionStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-8">
        <h2 className="text-2xl font-semibold">Nutrition & Lifestyle</h2>
        <p className="text-muted-foreground">
          Your eating habits help shape your program
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <Label className="flex flex-col items-start gap-1 mb-3">
            What type of cuisine do you typically enjoy?
            <p className="text-xs text-muted-foreground font-normal">
              (select all that apply)
            </p>
          </Label>
          <CheckboxGroup
            options={CUISINE_OPTIONS}
            value={data.cuisineTypes}
            onChange={(value) => onChange({ cuisineTypes: value })}
          />
          <AnimatePresence mode="wait">
            {data.cuisineTypes.includes('cuisine-other') && (
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
                    id="other-cuisine"
                    placeholder="Please specify..."
                    value={data.otherCuisine || ''}
                    onChange={(e) => onChange({ otherCuisine: e.target.value })}
                    variant="secondary"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div>
          <Label className="mb-3">
            Do you have any food allergies or intolerances?
          </Label>
          <RadioButtons
            value={data.hasAllergies ? 'yes' : 'no'}
            onValueChange={(value) =>
              onChange({ hasAllergies: value === 'yes' })
            }
            options={[
              { value: 'yes', label: 'Yes' },
              { value: 'no', label: 'No' },
            ]}
          />
          <AnimatePresence mode="wait">
            {data.hasAllergies && (
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
                    id="allergies"
                    placeholder="Please list your allergies or intolerances (e.g., gluten, dairy, nuts)..."
                    value={data.allergies || ''}
                    onChange={(e) => onChange({ allergies: e.target.value })}
                    rows={3}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-3">
          <Label>How would you rate your current diet?</Label>
          <RadioButtons
            value={data.dietQuality}
            onValueChange={(value) => onChange({ dietQuality: value })}
            options={DIET_QUALITY_OPTIONS}
            columns={1}
          />
        </div>

        <div className="space-y-3">
          <Label>Do you track your nutrition (calories, protein, etc.)?</Label>
          <RadioButtons
            value={data.tracksNutrition}
            onValueChange={(value) => onChange({ tracksNutrition: value })}
            options={TRACKING_OPTIONS}
          />
        </div>

        <div>
          <Label className="flex flex-col items-start gap-1 mb-3">
            Do you currently take any supplements?
            <p className="text-xs text-muted-foreground font-normal">
              (select all that apply)
            </p>
          </Label>
          <CheckboxGroup
            options={SUPPLEMENT_OPTIONS}
            value={data.supplements}
            onChange={(value) => onChange({ supplements: value })}
          />
          <AnimatePresence mode="wait">
            {data.supplements.includes('supplement-other') && (
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
                    id="other-supplement"
                    placeholder="Please specify..."
                    value={data.otherSupplement || ''}
                    onChange={(e) =>
                      onChange({ otherSupplement: e.target.value })
                    }
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
