'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

import type { TrainingPlanFormData } from './types'

type PlanDetailsProps = {
  data: TrainingPlanFormData['details']
  updateData: (data: TrainingPlanFormData['details']) => void
}

export function PlanDetailsForm({ data, updateData }: PlanDetailsProps) {
  return (
    <div className="space-y-6">
      <Input
        id="title"
        label="Title"
        placeholder="e.g., 12-Week Strength Program"
        value={data?.title ?? ''}
        onChange={(e) => updateData({ ...data, title: e.target.value })}
      />

      <Textarea
        id="description"
        label="Description"
        placeholder="Describe the goals and focus of this training plan"
        value={data.description ?? ''}
        onChange={(e) => updateData({ ...data, description: e.target.value })}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Label
          htmlFor="isTemplate"
          className="flex flex-row items-center justify-between rounded-lg border p-4"
        >
          <div className="space-y-0.5">
            <p className="text-base">Template</p>
            <p className="text-sm text-muted-foreground">
              Save as a template for future plans
            </p>
          </div>
          <Switch
            id="isTemplate"
            checked={data.isTemplate}
            onCheckedChange={() =>
              updateData({ ...data, isTemplate: !data.isTemplate })
            }
          />
        </Label>
        <Label
          htmlFor="isPublic"
          className="flex flex-row items-center justify-between rounded-lg border p-4"
        >
          <div className="space-y-0.5">
            <p className="text-base">Public</p>

            <p className="text-sm text-muted-foreground">
              Make this plan visible to all clients
            </p>
          </div>
          <Switch
            id="isPublic"
            checked={data.isPublic}
            onCheckedChange={() =>
              updateData({ ...data, isPublic: !data.isPublic })
            }
          />
        </Label>
      </div>

      <Button type="submit" className="hidden">
        Save Details
      </Button>
    </div>
  )
}
