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

import { useBodyMeasurementsContext } from './body-measurements-context'
import { MeasurementBodyMap } from './measurement-body-map/measurement-body-map'
import { MeasurementFieldEnum } from './measurement-constants'

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
  const { getLatestMeasurement } = useBodyMeasurementsContext()

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

  const lastValues: Record<MeasurementFieldEnum, number | undefined> = {
    [MeasurementFieldEnum.Weight]: getLatestMeasurement('weight'),
    [MeasurementFieldEnum.BodyFat]: getLatestMeasurement('bodyFat'),
    [MeasurementFieldEnum.Chest]: getLatestMeasurement('chest'),
    [MeasurementFieldEnum.Waist]: getLatestMeasurement('waist'),
    [MeasurementFieldEnum.Hips]: getLatestMeasurement('hips'),
    [MeasurementFieldEnum.Neck]: getLatestMeasurement('neck'),
    [MeasurementFieldEnum.BicepsLeft]: getLatestMeasurement('bicepsLeft'),
    [MeasurementFieldEnum.BicepsRight]: getLatestMeasurement('bicepsRight'),
    [MeasurementFieldEnum.ThighLeft]: getLatestMeasurement('thighLeft'),
    [MeasurementFieldEnum.ThighRight]: getLatestMeasurement('thighRight'),
    [MeasurementFieldEnum.CalfLeft]: getLatestMeasurement('calfLeft'),
    [MeasurementFieldEnum.CalfRight]: getLatestMeasurement('calfRight'),
    [MeasurementFieldEnum.Notes]: undefined,
  }

  const bodyMapValues: Record<MeasurementFieldEnum, string> = {
    [MeasurementFieldEnum.Weight]: form.weight || '',
    [MeasurementFieldEnum.BodyFat]: form.bodyFat || '',
    [MeasurementFieldEnum.Chest]: form.chest || '',
    [MeasurementFieldEnum.Waist]: form.waist || '',
    [MeasurementFieldEnum.Hips]: form.hips || '',
    [MeasurementFieldEnum.Neck]: form.neck || '',
    [MeasurementFieldEnum.BicepsLeft]: form.bicepsLeft || '',
    [MeasurementFieldEnum.BicepsRight]: form.bicepsRight || '',
    [MeasurementFieldEnum.ThighLeft]: form.thighLeft || '',
    [MeasurementFieldEnum.ThighRight]: form.thighRight || '',
    [MeasurementFieldEnum.CalfLeft]: form.calfLeft || '',
    [MeasurementFieldEnum.CalfRight]: form.calfRight || '',
    [MeasurementFieldEnum.Notes]: form.notes || '',
  }

  const handleBodyMapChange = (field: MeasurementFieldEnum, value: string) => {
    const fieldKey = field as keyof MeasurementFormData
    setForm((prev) => ({ ...prev, [fieldKey]: value }))
  }

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

          {/* Weight & Body Fat - Prominent inputs at top */}
          {(!showFields ||
            showFields.includes(MeasurementFieldEnum.Weight) ||
            showFields.includes(MeasurementFieldEnum.BodyFat)) && (
            <div className="grid grid-cols-2 gap-4">
              <WeightInput
                id="weight"
                label="Weight"
                weightInKg={form.weight ? parseFloat(form.weight || '0') : null}
                onWeightChange={(weightInKg) =>
                  setForm({
                    ...form,
                    weight: weightInKg?.toString() || '',
                  })
                }
                showLabel={true}
                decimals={2}
                placeholder={lastValues[MeasurementFieldEnum.Weight]?.toFixed(
                  1,
                )}
              />
              <Input
                id="bodyFat"
                type="number"
                inputMode="decimal"
                step="0.1"
                iconEnd="%"
                label="Body Fat"
                variant="secondary"
                value={form.bodyFat}
                placeholder={lastValues[MeasurementFieldEnum.BodyFat]?.toFixed(
                  1,
                )}
                onChange={(e) =>
                  setForm({ ...form, bodyFat: e.target.value || '' })
                }
              />
            </div>
          )}

          {/* Body Map for circumference measurements */}
          {(!showFields ||
            showFields.some((f) =>
              [
                MeasurementFieldEnum.Chest,
                MeasurementFieldEnum.Waist,
                MeasurementFieldEnum.Hips,
                MeasurementFieldEnum.Neck,
                MeasurementFieldEnum.BicepsLeft,
                MeasurementFieldEnum.BicepsRight,
                MeasurementFieldEnum.ThighLeft,
                MeasurementFieldEnum.ThighRight,
                MeasurementFieldEnum.CalfLeft,
                MeasurementFieldEnum.CalfRight,
              ].includes(f),
            )) && (
            <div className="w-full mt-12 mb-18">
              <MeasurementBodyMap
                values={bodyMapValues}
                lastValues={lastValues}
                onChange={handleBodyMapChange}
              />
            </div>
          )}

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
