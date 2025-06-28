'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { GQLDifficulty } from '@/generated/graphql-client'

import type { TrainingPlanFormData } from './types'

type PlanDetailsProps = {
  data: TrainingPlanFormData['details']
  updateData: (data: TrainingPlanFormData['details']) => void
}

const DIFFICULTIES: { label: string; value: GQLDifficulty }[] = [
  { label: 'Beginner', value: GQLDifficulty.Beginner },
  { label: 'Intermediate', value: GQLDifficulty.Intermediate },
  { label: 'Advanced', value: GQLDifficulty.Advanced },
  { label: 'Expert', value: GQLDifficulty.Expert },
]

export function PlanDetailsForm({ data, updateData }: PlanDetailsProps) {
  return (
    <div className="container space-y-6">
      <PlanDetailsHeader data={data} updateData={updateData} />
    </div>
  )
}

function PlanDetailsHeader({ data, updateData }: PlanDetailsProps) {
  return (
    <div className="flex flex-row gap-8 items-start">
      <div className="space-y-6 flex-1 min-w-0">
        <div className="grid grid-cols-[2fr_1fr] gap-4 items-end">
          <Input
            id="title"
            label="Title"
            placeholder="e.g., 12-Week Strength Program"
            value={data?.title ?? ''}
            onChange={(e) => updateData({ ...data, title: e.target.value })}
            className="w-full"
          />
          <div className="flex flex-col gap-2">
            <Label htmlFor="difficulty">Difficulty</Label>
            <Select
              value={data.difficulty ?? ''}
              onValueChange={(value: GQLDifficulty) =>
                updateData({ ...data, difficulty: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select difficulty" />
              </SelectTrigger>
              <SelectContent>
                {DIFFICULTIES.map((difficulty) => (
                  <SelectItem key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Textarea
          id="description"
          label="Description"
          placeholder="Describe the goals and focus of this training plan"
          value={data.description ?? ''}
          onChange={(e) => updateData({ ...data, description: e.target.value })}
          className="min-h-32 w-full resize-none"
        />
      </div>
      <div className="w-80 flex-shrink-0">
        <PlanDetailsOptions data={data} updateData={updateData} />
      </div>
    </div>
  )
}

function PlanDetailsOptions({ data, updateData }: PlanDetailsProps) {
  return (
    <div className="w-full gap-6 max-w-max">
      <SwitchOption
        id="isDraft"
        label={!data.isDraft ? 'Active' : 'Draft'}
        description={
          !data.isDraft
            ? 'Plan is available for assignment to clients'
            : "Plan is in draft mode, can't be assigned to clients"
        }
        checked={!data.isDraft || data.isDraft === undefined}
        onCheckedChange={() => updateData({ ...data, isDraft: !data.isDraft })}
      />

      {/* <SwitchOption
        id="isPublic"
        label="Public"
        description="Make this plan visible to all clients"
        checked={data.isPublic}
        onCheckedChange={(v) => updateData({ ...data, isPublic: v })}
      /> */}
    </div>
  )
}

type SwitchOptionProps = {
  id: string
  label: string
  description: string
  checked: boolean
  onCheckedChange: (value: boolean) => void
}

function SwitchOption({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: SwitchOptionProps) {
  return (
    <Label
      htmlFor={id}
      className="flex flex-row items-center justify-between rounded-lg border p-4 bg-card-on-card w-full min-h-[80px]"
    >
      <div className="space-y-0.5 flex-1">
        <p className="text-base">{label}</p>
        <p className="text-sm text-muted-foreground max-w-xs leading-tight">
          {description}
        </p>
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </Label>
  )
}
