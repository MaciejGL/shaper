import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  GQLHeightUnit,
  GQLTrainingView,
  GQLWeightUnit,
} from '@/generated/graphql-client'

import type { OnboardingData } from '../onboarding-modal'

interface PreferencesStepProps {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
}

export function PreferencesStep({ data, onChange }: PreferencesStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Set your preferences</h2>
        <p className="text-muted-foreground">
          Choose your preferred units and interface
        </p>
      </div>

      <div className="space-y-6">
        {/* Weight Unit */}
        <div className="space-y-3">
          <Label>Weight Unit</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={
                data.weightUnit === GQLWeightUnit.Kg ? 'default' : 'outline'
              }
              onClick={() => onChange({ weightUnit: GQLWeightUnit.Kg })}
              className="h-auto p-3"
            >
              <div className="text-center">
                <div className="font-medium">Kilograms</div>
                <div className="text-xs opacity-70">kg</div>
              </div>
            </Button>
            <Button
              variant={
                data.weightUnit === GQLWeightUnit.Lbs ? 'default' : 'outline'
              }
              onClick={() => onChange({ weightUnit: GQLWeightUnit.Lbs })}
              className="h-auto p-3"
            >
              <div className="text-center">
                <div className="font-medium">Pounds</div>
                <div className="text-xs opacity-70">lbs</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Height Unit */}
        <div className="space-y-3">
          <Label>Height Unit</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={
                data.heightUnit === GQLHeightUnit.Cm ? 'default' : 'outline'
              }
              onClick={() => onChange({ heightUnit: GQLHeightUnit.Cm })}
              className="h-auto p-3"
            >
              <div className="text-center">
                <div className="font-medium">Centimeters</div>
                <div className="text-xs opacity-70">cm</div>
              </div>
            </Button>
            <Button
              variant={
                data.heightUnit === GQLHeightUnit.Ft ? 'default' : 'outline'
              }
              onClick={() => onChange({ heightUnit: GQLHeightUnit.Ft })}
              className="h-auto p-3"
            >
              <div className="text-center">
                <div className="font-medium">Feet & Inches</div>
                <div className="text-xs opacity-70">ft/in</div>
              </div>
            </Button>
          </div>
        </div>

        {/* Training View */}
        <div className="space-y-3">
          <Label>Training Interface</Label>
          <div className="grid grid-cols-1 gap-2">
            <Button
              variant={
                data.trainingView === GQLTrainingView.Simple
                  ? 'default'
                  : 'outline'
              }
              onClick={() => onChange({ trainingView: GQLTrainingView.Simple })}
              className="h-auto p-3 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Simple View</div>
                <div className="text-xs opacity-70">
                  Clean interface, essential features only
                </div>
              </div>
            </Button>
            <Button
              variant={
                data.trainingView === GQLTrainingView.Advanced
                  ? 'default'
                  : 'outline'
              }
              onClick={() =>
                onChange({ trainingView: GQLTrainingView.Advanced })
              }
              className="h-auto p-3 justify-start"
            >
              <div className="text-left">
                <div className="font-medium">Advanced View</div>
                <div className="text-xs opacity-70">
                  Full features, detailed analytics and controls
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
