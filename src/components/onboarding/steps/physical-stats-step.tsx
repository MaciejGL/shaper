import { useEffect, useState } from 'react'

import { RadioButtons } from '@/components/radio-buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GQLHeightUnit, GQLWeightUnit } from '@/generated/graphql-client'
import { formatDecimalInput, formatNumberSmart } from '@/lib/format-tempo'
import { cmToFeetInches, feetInchesToCm } from '@/lib/height-utils'
import { convertWeight } from '@/lib/weight-utils'

import type { OnboardingData } from '../onboarding-modal'

interface PhysicalStatsStepProps {
  data: OnboardingData
  onChange: (updates: Partial<OnboardingData>) => void
}

export function PhysicalStatsStep({ data, onChange }: PhysicalStatsStepProps) {
  // Local state for input display values
  const [heightDisplay, setHeightDisplay] = useState({
    cm: '',
    feet: '',
    inches: '',
  })
  const [weightDisplay, setWeightDisplay] = useState('')

  // Update display values when data or units change
  useEffect(() => {
    // Height display
    if (data.height) {
      if (data.heightUnit === GQLHeightUnit.Cm) {
        setHeightDisplay((prev) => ({ ...prev, cm: data.height!.toString() }))
      } else {
        const { feet, inches } = cmToFeetInches(data.height)
        setHeightDisplay({
          cm: '',
          feet: feet.toString(),
          inches: inches.toString(),
        })
      }
    } else {
      setHeightDisplay({ cm: '', feet: '', inches: '' })
    }

    // Weight display
    if (data.weight) {
      const displayWeight =
        data.weightUnit === GQLWeightUnit.Kg
          ? data.weight
          : convertWeight(data.weight, 'kg', 'lbs')
      setWeightDisplay(formatNumberSmart(displayWeight, 1))
    } else {
      setWeightDisplay('')
    }
  }, [data.height, data.weight, data.heightUnit, data.weightUnit])

  const handleHeightChange = (
    value: string,
    type: 'cm' | 'feet' | 'inches',
  ) => {
    const newDisplay = { ...heightDisplay, [type]: value }
    setHeightDisplay(newDisplay)

    if (data.heightUnit === GQLHeightUnit.Cm) {
      const cm = parseFloat(value)
      onChange({ height: isNaN(cm) ? undefined : Math.round(cm) })
    } else {
      const feet = parseInt(newDisplay.feet) || 0
      const inches = parseInt(newDisplay.inches) || 0
      if (inches >= 12) return // Prevent invalid inches

      if (feet === 0 && inches === 0) {
        onChange({ height: undefined })
      } else {
        onChange({ height: feetInchesToCm(feet, inches) })
      }
    }
  }

  const handleWeightChange = (value: string) => {
    setWeightDisplay(value)

    const numericValue = parseFloat(value)
    if (isNaN(numericValue)) {
      onChange({ weight: undefined })
      return
    }

    const weightInKg =
      data.weightUnit === GQLWeightUnit.Kg
        ? numericValue
        : convertWeight(numericValue, 'lbs', 'kg')

    onChange({ weight: weightInKg })
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2 mb-10">
        <h2 className="text-2xl font-semibold">Physical measurements</h2>
        <p className="text-muted-foreground">
          Set your preferred units and enter your measurements
        </p>
      </div>

      <div className="space-y-6">
        {/* Unit Preferences */}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Weight Unit</Label>
            <RadioButtons
              value={data.weightUnit}
              onValueChange={(value: GQLWeightUnit) =>
                onChange({ weightUnit: value })
              }
              options={[
                {
                  value: GQLWeightUnit.Kg,
                  label: 'Kilograms',
                  description: 'kg',
                },
                {
                  value: GQLWeightUnit.Lbs,
                  label: 'Pounds',
                  description: 'lbs',
                },
              ]}
            />
          </div>

          <div className="space-y-2">
            <Label>Height Unit</Label>
            <RadioButtons
              value={data.heightUnit}
              onValueChange={(value: GQLHeightUnit) =>
                onChange({ heightUnit: value })
              }
              options={[
                {
                  value: GQLHeightUnit.Cm,
                  label: 'Centimeters',
                  description: 'cm',
                },
                {
                  value: GQLHeightUnit.Ft,
                  label: 'Feet & Inches',
                  description: 'ft/in',
                },
              ]}
            />
          </div>
        </div>

        {/* Physical Measurements */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Height Input */}
            <div className="space-y-1.5">
              <Label>Height</Label>
              {data.heightUnit === GQLHeightUnit.Cm ? (
                <Input
                  id="height-cm"
                  value={heightDisplay.cm}
                  onChange={(e) => handleHeightChange(e.target.value, 'cm')}
                  placeholder="e.g. 175"
                  variant="secondary"
                  iconEnd={
                    <div className="text-sm text-muted-foreground pointer-events-none">
                      cm
                    </div>
                  }
                />
              ) : (
                <div className="flex gap-2">
                  <Input
                    id="height-feet"
                    value={heightDisplay.feet}
                    onChange={(e) => handleHeightChange(e.target.value, 'feet')}
                    placeholder="5"
                    variant="secondary"
                    iconEnd={
                      <div className="text-sm text-muted-foreground pointer-events-none">
                        ft
                      </div>
                    }
                  />
                  <Input
                    id="height-inches"
                    value={heightDisplay.inches}
                    onChange={(e) =>
                      handleHeightChange(e.target.value, 'inches')
                    }
                    placeholder="10"
                    variant="secondary"
                    iconEnd={
                      <div className="text-sm text-muted-foreground pointer-events-none">
                        in
                      </div>
                    }
                  />
                </div>
              )}
            </div>

            {/* Weight Input */}
            <div className="space-y-1.5">
              <Label>Weight</Label>
              <Input
                id="weight"
                value={weightDisplay}
                onChange={(e) => handleWeightChange(formatDecimalInput(e))}
                placeholder={
                  data.weightUnit === GQLWeightUnit.Kg ? 'e.g. 70' : 'e.g. 154'
                }
                variant="secondary"
                iconEnd={
                  <div className="text-sm text-muted-foreground pointer-events-none">
                    {data.weightUnit === GQLWeightUnit.Kg ? 'kg' : 'lbs'}
                  </div>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
