'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { DatePicker } from '@/components/date-picker'
import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerTrigger,
  SimpleDrawerContent,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { WeightInput } from '@/components/ui/weight-input'
import {
  GQLBodyMeasuresQuery,
  useAddBodyMeasurementMutation,
  useDeleteBodyMeasurementMutation,
  useUpdateBodyMeasurementMutation,
} from '@/generated/graphql-client'

import { MeasurementField, MeasurementFieldEnum } from './measurement-constants'

const measurementSchema = z.object({
  weight: z.string({ message: 'Invalid weight' }).optional(),
  bodyFat: z.string({ message: 'Invalid body fat' }).optional(),
  chest: z.string({ message: 'Invalid chest' }).optional(),
  waist: z.string({ message: 'Invalid waist' }).optional(),
  hips: z.string({ message: 'Invalid hips' }).optional(),
  neck: z.string({ message: 'Invalid neck' }).optional(),
  bicepsLeft: z.string({ message: 'Invalid left bicep' }).optional(),
  bicepsRight: z.string({ message: 'Invalid right bicep' }).optional(),
  thighLeft: z.string({ message: 'Invalid left thigh' }).optional(),
  thighRight: z.string({ message: 'Invalid right thigh' }).optional(),
  calfLeft: z.string({ message: 'Invalid left calf' }).optional(),
  calfRight: z.string({ message: 'Invalid right calf' }).optional(),
  notes: z.string({ message: 'Invalid notes' }).optional(),
})

type MeasurementFormData = z.infer<typeof measurementSchema>

export type AddMeasurementType = (keyof MeasurementFormData)[]
interface AddMeasurementModalProps {
  title?: string
  onSuccess?: () => void
  measurement?: GQLBodyMeasuresQuery['bodyMeasures'][0]
  showFields?: MeasurementFieldEnum[]
  children?: React.ReactNode
}

export function AddMeasurementModal({
  onSuccess,
  title,
  measurement,
  showFields,
  children,
}: AddMeasurementModalProps) {
  const isEdit = !!measurement
  const [open, setOpen] = useState(false)

  const [form, setForm] = useState<MeasurementFormData>({
    weight: measurement?.weight?.toString() || '',
    bodyFat: measurement?.bodyFat?.toString() || '',
    chest: measurement?.chest?.toString() || '',
    waist: measurement?.waist?.toString() || '',
    hips: measurement?.hips?.toString() || '',
    neck: measurement?.neck?.toString() || '',
    bicepsLeft: measurement?.bicepsLeft?.toString() || '',
    bicepsRight: measurement?.bicepsRight?.toString() || '',
    thighLeft: measurement?.thighLeft?.toString() || '',
    thighRight: measurement?.thighRight?.toString() || '',
    calfLeft: measurement?.calfLeft?.toString() || '',
    calfRight: measurement?.calfRight?.toString() || '',
    notes: measurement?.notes || '',
  })

  // Date state - initialize with measurement date or today
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (measurement?.measuredAt) {
      return new Date(measurement.measuredAt)
    }
    return new Date()
  })

  const { mutate: addMutation, isPending: isAdding } =
    useAddBodyMeasurementMutation({
      onSuccess: () => {
        setOpen(false)
        onSuccess?.()
      },
    })

  const { mutate: updateMutation, isPending: isUpdating } =
    useUpdateBodyMeasurementMutation({
      onSuccess: () => {
        setOpen(false)
        onSuccess?.()
      },
    })

  const { mutate: deleteMutation, isPending: isDeleting } =
    useDeleteBodyMeasurementMutation({
      onSuccess: () => {
        setOpen(false)
        onSuccess?.()
      },
    })

  const handleSubmit = async (data: MeasurementFormData) => {
    const isValid = measurementSchema.safeParse(data)

    if (!isValid.success) {
      toast.error(
        <div>
          <p>Please enter valid measurements.</p>
          <p className="whitespace-pre-wrap">
            {Object.values(isValid.error.message).join('\n')}
          </p>
        </div>,
      )
      return
    }

    const input = Object.fromEntries(
      Object.entries(data).map(([key, value]) => {
        if (key === 'notes') return [key, value]
        if (value === '') return [key, null]
        return [key, parseFloat(value as string)]
      }),
    )

    if (Object.keys(input).length === 0) {
      toast.error('Please enter at least one measurement.')
      return
    }

    if (isEdit && measurement) {
      // Update the existing measurement
      updateMutation({
        input: {
          id: measurement.id,
          ...input,
          measuredAt: selectedDate.toISOString(),
        },
      })
    } else {
      addMutation({
        input: {
          ...input,
          measuredAt: selectedDate.toISOString(),
        },
      })
    }
  }

  const measurementGroups = [
    {
      title: 'Weight & Body Fat',
      fields: [
        {
          name: 'weight' as const,
          label: 'Weight',
          unit: 'dynamic',
          step: '0.01',
        },
        {
          name: 'bodyFat' as const,
          label: 'Body Fat',
          unit: '%',
          step: '0.01',
        },
      ],
    },
    {
      title: 'Circumferences',
      fields: [
        { name: 'chest' as const, label: 'Chest', unit: 'cm', step: '0.1' },
        { name: 'waist' as const, label: 'Waist', unit: 'cm', step: '0.1' },
        { name: 'hips' as const, label: 'Hips', unit: 'cm', step: '0.1' },
        { name: 'neck' as const, label: 'Neck', unit: 'cm', step: '0.1' },
      ],
    },
    {
      title: 'Arms & Legs',
      fields: [
        {
          name: 'bicepsLeft' as const,
          label: 'Left Bicep',
          unit: 'cm',
          step: '0.1',
        },
        {
          name: 'bicepsRight' as const,
          label: 'Right Bicep',
          unit: 'cm',
          step: '0.1',
        },
        {
          name: 'thighLeft' as const,
          label: 'Left Thigh',
          unit: 'cm',
          step: '0.1',
        },
        {
          name: 'thighRight' as const,
          label: 'Right Thigh',
          unit: 'cm',
          step: '0.1',
        },
        {
          name: 'calfLeft' as const,
          label: 'Left Calf',
          unit: 'cm',
          step: '0.1',
        },
        {
          name: 'calfRight' as const,
          label: 'Right Calf',
          unit: 'cm',
          step: '0.1',
        },
      ],
    },
  ].filter((group) => {
    if (!showFields) return true
    return group.fields.some((field) =>
      showFields.includes(field.name as MeasurementField & 'notes'),
    )
  })

  const hasValues = Object.values(form).some((value) => value !== '')

  const handleDelete = () => {
    if (measurement) {
      deleteMutation({ id: measurement.id })
    }
  }

  return (
    <Drawer open={open} onOpenChange={setOpen} direction="bottom">
      <DrawerTrigger asChild>
        {children ? (
          children
        ) : (
          <Button size="sm" className="gap-2" iconStart={<Plus />}>
            Log
          </Button>
        )}
      </DrawerTrigger>
      <SimpleDrawerContent
        title={
          title || (isEdit ? 'Edit Body Measurements' : 'Add Body Measurements')
        }
        footer={
          <div className="flex gap-3">
            {isEdit && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting || isAdding || isUpdating}
                loading={isDeleting}
                className="gap-2"
                iconOnly={<Trash2 />}
              >
                Delete
              </Button>
            )}
            <Button
              type="button"
              variant="tertiary"
              onClick={() => setOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              disabled={isAdding || isUpdating || isDeleting || !hasValues}
              loading={isAdding || isUpdating}
              className="flex-1"
              onClick={() => handleSubmit(form)}
            >
              {isEdit ? 'Update' : 'Save Measurements'}
            </Button>
          </div>
        }
      >
        <form className="space-y-6">
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
        </form>
      </SimpleDrawerContent>
    </Drawer>
  )
}
