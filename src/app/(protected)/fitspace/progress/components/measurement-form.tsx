'use client'

import { useEffect, useState } from 'react'

import { DatePicker } from '@/components/date-picker'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { WeightInput } from '@/components/ui/weight-input'
import {
  GQLAddBodyMeasurementInput,
  useAddBodyMeasurementMutation,
} from '@/generated/graphql-client'

interface MeasurementFormProps {
  onSuccess?: (data?: GQLAddBodyMeasurementInput) => void
  onDataChange?: (data: GQLAddBodyMeasurementInput) => void
  showSubmitButton?: boolean
  submitButtonText?: string
}

const measurementGroups = [
  {
    title: 'Body Composition',
    fields: [
      { name: 'weight', label: 'Weight', unit: 'kg', step: '0.1' },
      { name: 'bodyFat', label: 'Body Fat', unit: '%', step: '0.1' },
    ],
  },
  {
    title: 'Upper Body',
    fields: [
      { name: 'chest', label: 'Chest', unit: 'cm', step: '0.1' },
      { name: 'bicepsLeft', label: 'Left Bicep', unit: 'cm', step: '0.1' },
      { name: 'bicepsRight', label: 'Right Bicep', unit: 'cm', step: '0.1' },
      { name: 'neck', label: 'Neck', unit: 'cm', step: '0.1' },
    ],
  },
  {
    title: 'Lower Body',
    fields: [
      { name: 'waist', label: 'Waist', unit: 'cm', step: '0.1' },
      { name: 'hips', label: 'Hips', unit: 'cm', step: '0.1' },
      { name: 'thighLeft', label: 'Left Thigh', unit: 'cm', step: '0.1' },
      { name: 'thighRight', label: 'Right Thigh', unit: 'cm', step: '0.1' },
      { name: 'calfLeft', label: 'Left Calf', unit: 'cm', step: '0.1' },
      { name: 'calfRight', label: 'Right Calf', unit: 'cm', step: '0.1' },
    ],
  },
]

export function MeasurementForm({
  onSuccess,
  onDataChange,
  showSubmitButton = true,
  submitButtonText = 'Save Measurements',
}: MeasurementFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [form, setForm] = useState<Record<string, string>>({
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    neck: '',
    bicepsLeft: '',
    bicepsRight: '',
    thighLeft: '',
    thighRight: '',
    calfLeft: '',
    calfRight: '',
    bodyFat: '',
    notes: '',
  })

  const addMeasurementMutation = useAddBodyMeasurementMutation()

  // Update parent component whenever form data changes
  useEffect(() => {
    if (onDataChange) {
      // Filter out empty values
      const measurementData = Object.fromEntries(
        Object.entries(form).filter(
          ([, value]) => value !== '' && value !== undefined,
        ),
      )

      // Convert string values to numbers for numeric fields
      const processedData: GQLAddBodyMeasurementInput = {
        measuredAt: selectedDate.toISOString(),
        weight: measurementData.weight
          ? parseFloat(measurementData.weight)
          : undefined,
        chest: measurementData.chest
          ? parseFloat(measurementData.chest)
          : undefined,
        waist: measurementData.waist
          ? parseFloat(measurementData.waist)
          : undefined,
        hips: measurementData.hips
          ? parseFloat(measurementData.hips)
          : undefined,
        neck: measurementData.neck
          ? parseFloat(measurementData.neck)
          : undefined,
        bicepsLeft: measurementData.bicepsLeft
          ? parseFloat(measurementData.bicepsLeft)
          : undefined,
        bicepsRight: measurementData.bicepsRight
          ? parseFloat(measurementData.bicepsRight)
          : undefined,
        thighLeft: measurementData.thighLeft
          ? parseFloat(measurementData.thighLeft)
          : undefined,
        thighRight: measurementData.thighRight
          ? parseFloat(measurementData.thighRight)
          : undefined,
        calfLeft: measurementData.calfLeft
          ? parseFloat(measurementData.calfLeft)
          : undefined,
        calfRight: measurementData.calfRight
          ? parseFloat(measurementData.calfRight)
          : undefined,
        bodyFat: measurementData.bodyFat
          ? parseFloat(measurementData.bodyFat)
          : undefined,
        notes: measurementData.notes || undefined,
      }

      onDataChange(processedData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, selectedDate]) // Remove onDataChange from dependencies to prevent infinite loops

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Filter out empty values
    const measurementData = Object.fromEntries(
      Object.entries(form).filter(
        ([, value]) => value !== '' && value !== undefined,
      ),
    )

    // Convert string values to numbers for numeric fields
    const processedData: GQLAddBodyMeasurementInput = {
      measuredAt: selectedDate.toISOString(),
      weight: measurementData.weight
        ? parseFloat(measurementData.weight)
        : undefined,
      chest: measurementData.chest
        ? parseFloat(measurementData.chest)
        : undefined,
      waist: measurementData.waist
        ? parseFloat(measurementData.waist)
        : undefined,
      hips: measurementData.hips ? parseFloat(measurementData.hips) : undefined,
      neck: measurementData.neck ? parseFloat(measurementData.neck) : undefined,
      bicepsLeft: measurementData.bicepsLeft
        ? parseFloat(measurementData.bicepsLeft)
        : undefined,
      bicepsRight: measurementData.bicepsRight
        ? parseFloat(measurementData.bicepsRight)
        : undefined,
      thighLeft: measurementData.thighLeft
        ? parseFloat(measurementData.thighLeft)
        : undefined,
      thighRight: measurementData.thighRight
        ? parseFloat(measurementData.thighRight)
        : undefined,
      calfLeft: measurementData.calfLeft
        ? parseFloat(measurementData.calfLeft)
        : undefined,
      calfRight: measurementData.calfRight
        ? parseFloat(measurementData.calfRight)
        : undefined,
      bodyFat: measurementData.bodyFat
        ? parseFloat(measurementData.bodyFat)
        : undefined,
      notes: measurementData.notes || undefined,
    }

    try {
      if (showSubmitButton) {
        // Submit directly when used as standalone form
        await addMeasurementMutation.mutateAsync({ input: processedData })

        // Reset form only when actually submitting
        setForm({
          weight: '',
          chest: '',
          waist: '',
          hips: '',
          neck: '',
          bicepsLeft: '',
          bicepsRight: '',
          thighLeft: '',
          thighRight: '',
          calfLeft: '',
          calfRight: '',
          bodyFat: '',
          notes: '',
        })
        setSelectedDate(new Date())
      }

      // Always pass data to parent component
      onSuccess?.(processedData)
    } catch (error) {
      console.error('Failed to save measurements:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <DatePicker
        label="Measurement Date"
        date={selectedDate}
        setDate={(date) => date && setSelectedDate(date)}
      />

      {measurementGroups.map((group) => (
        <div key={group.title} className="space-y-3">
          <h3 className="font-medium text-lg">{group.title}</h3>
          <div className="grid grid-cols-2 gap-4">
            {group.fields.map((field) => {
              // Special handling for weight field to use WeightInput with unit conversion
              if (field.name === 'weight') {
                return (
                  <WeightInput
                    key={field.name}
                    id={field.name}
                    label={field.label}
                    weightInKg={
                      form[field.name]
                        ? parseFloat(form[field.name] || '0')
                        : null
                    }
                    onWeightChange={(weightInKg) =>
                      setForm({
                        ...form,
                        [field.name]: weightInKg?.toString() || '',
                      })
                    }
                    showLabel={true}
                    decimals={2}
                  />
                )
              }

              return (
                <Input
                  key={field.name}
                  id={field.name}
                  type="number"
                  inputMode="decimal"
                  step={field.step}
                  iconEnd={field.unit}
                  label={field.label}
                  variant="secondary"
                  value={form[field.name]}
                  onChange={(e) =>
                    setForm({ ...form, [field.name]: e.target.value || '' })
                  }
                />
              )
            })}
          </div>
        </div>
      ))}

      <Textarea
        id="notes"
        name="notes"
        label="Additional Notes (Optional)"
        placeholder="Any additional notes..."
        variant="ghost"
        className="resize-none min-h-24"
        rows={3}
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
      />

      {showSubmitButton && (
        <Button
          type="submit"
          loading={addMeasurementMutation.isPending}
          disabled={addMeasurementMutation.isPending}
          className="w-full"
        >
          {submitButtonText}
        </Button>
      )}
    </form>
  )
}
