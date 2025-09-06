'use client'

import { motion } from 'framer-motion'

import { RadioButtons } from '@/components/radio-buttons'
import { GQLTrainingView } from '@/generated/graphql-client'

import type { OnboardingData } from '../onboarding-modal'

import { TrainingViewPreview } from './training-view-preview'

interface PreferencesStepProps {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
}

export function PreferencesStep({ data, onChange }: PreferencesStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-2xl font-semibold">Are You into Tracking?</h2>
        <p className="text-muted-foreground">Choose your preferred interface</p>
      </div>

      {/* Training View */}
      <div className="space-y-3">
        <RadioButtons
          value={data.trainingView}
          onValueChange={(value) => onChange({ trainingView: value })}
          options={[
            { value: GQLTrainingView.Simple, label: 'Simple' },
            { value: GQLTrainingView.Advanced, label: 'Advanced' },
          ]}
        />
        <motion.p
          key={data.trainingView}
          className="text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {data.trainingView === GQLTrainingView.Advanced
            ? 'With advanced logging and timers'
            : 'No timers or detailed logging'}
        </motion.p>
        <TrainingViewPreview trainingView={data.trainingView} />
      </div>
    </div>
  )
}
