'use client'

import { format, formatRelative } from 'date-fns'
import { AlertCircle, FileText, Users } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { GQLDifficulty } from '@/generated/graphql-client'

import type { TrainingPlanFormData } from './types'

type PlanDetailsProps = {
  data: TrainingPlanFormData['details']
  createdAt?: string
  updatedAt?: string
  assignedCount?: number
  updateData: (data: TrainingPlanFormData['details']) => void
}

const DIFFICULTIES: { label: string; value: GQLDifficulty }[] = [
  { label: 'Beginner', value: GQLDifficulty.Beginner },
  { label: 'Intermediate', value: GQLDifficulty.Intermediate },
  { label: 'Advanced', value: GQLDifficulty.Advanced },
  { label: 'Expert', value: GQLDifficulty.Expert },
]

export function PlanDetailsForm({
  data,
  updateData,
  createdAt,
  updatedAt,
  assignedCount,
}: PlanDetailsProps) {
  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <PlanDetailsHeader data={data} updateData={updateData} />
      </div>
      <div className="w-full gap-6">
        <PlanPublicications
          data={data}
          updateData={updateData}
          createdAt={createdAt}
          updatedAt={updatedAt}
          assignedCount={assignedCount}
        />
      </div>
    </div>
  )
}

function PlanDetailsHeader({
  data,
  updateData,
}: Pick<PlanDetailsProps, 'data' | 'updateData'>) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Basic Information
        </CardTitle>
        <CardDescription>
          Set up the fundamental details of your training plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Plan Title</Label>
            <Input
              id="title"
              placeholder="e.g., Upper Body Strength Program"
              value={data.title}
              onChange={(e) => updateData({ ...data, title: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
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

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the goals, target audience, and key features of this training plan..."
            value={data.description ?? ''}
            onChange={(e) =>
              updateData({ ...data, description: e.target.value })
            }
            className="min-h-[120px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Help clients understand what this plan offers and who it's designed
            for
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function PlanPublicications({
  data,
  updateData,
  createdAt,
  updatedAt,
  assignedCount,
}: PlanDetailsProps) {
  const isDraft = data.isDraft ?? false
  const setIsDraft = (value: boolean) => updateData({ ...data, isDraft: value })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Publication Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="draft-toggle" className="text-sm font-medium">
              Draft Mode
            </Label>
            <p className="text-xs text-muted-foreground">
              {isDraft
                ? "Plan is private and can't be assigned"
                : 'Plan is live and available to clients'}
            </p>
          </div>
          <Switch
            id="draft-toggle"
            checked={isDraft}
            onCheckedChange={setIsDraft}
          />
        </div>

        {isDraft && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              This plan is in draft mode and won't be assignable to clients
              until published.
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Created</span>
            {createdAt && (
              <span>{format(new Date(createdAt), 'd MMM HH:mm')}</span>
            )}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Last modified</span>
            {updatedAt && (
              <span>{formatRelative(new Date(updatedAt), new Date())}</span>
            )}
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Assigned clients</span>
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {assignedCount}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
