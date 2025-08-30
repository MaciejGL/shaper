'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { MapPin } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  OPERATIONAL_LOCATIONS,
  formatLocationName,
} from '@/data/operational-locations'
import { useCreateTeamMutation } from '@/generated/graphql-client'

const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, 'Team name is required')
    .max(100, 'Team name too long'),
  locationIds: z
    .array(z.string())
    .min(1, 'At least one location must be selected'),
})

type CreateTeamForm = z.infer<typeof createTeamSchema>

interface CreateTeamFormProps {
  onCancel: () => void
  onSuccess: () => void
}

export function CreateTeamForm({ onCancel, onSuccess }: CreateTeamFormProps) {
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateTeamForm>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      locationIds: [],
    },
  })

  const createTeamMutation = useCreateTeamMutation({
    onSuccess: () => {
      toast.success('Team created successfully!')
      onSuccess()
    },
    onError: (error) => {
      toast.error('Failed to create team. Please try again.')
      console.error('Create team error:', error)
    },
  })

  const toggleLocation = (locationId: string) => {
    const newSelectedIds = selectedLocationIds.includes(locationId)
      ? selectedLocationIds.filter((id) => id !== locationId)
      : [...selectedLocationIds, locationId]

    setSelectedLocationIds(newSelectedIds)
    setValue('locationIds', newSelectedIds)
  }

  const onSubmit = async (data: CreateTeamForm) => {
    // Convert location IDs to the format expected by the API
    const locations = data.locationIds.map((id) => {
      const location = OPERATIONAL_LOCATIONS.find((loc) => loc.id === id)!
      return {
        city: location.city,
        country: location.country,
        countryCode: location.countryCode,
      }
    })

    await createTeamMutation.mutateAsync({
      input: {
        name: data.name,
        locations,
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Team Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Team Name</Label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Enter team name"
          disabled={createTeamMutation.isPending}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Operating Locations */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <MapPin className="size-4" />
            Operating Locations
          </Label>
          <p className="text-sm text-muted-foreground">
            Select the cities where your team will operate
          </p>
        </div>

        <div className="space-y-3">
          {OPERATIONAL_LOCATIONS.map((location) => (
            <div key={location.id} className="flex items-center space-x-2">
              <Checkbox
                id={location.id}
                checked={selectedLocationIds.includes(location.id)}
                onCheckedChange={() => toggleLocation(location.id)}
                disabled={createTeamMutation.isPending}
              />
              <Label
                htmlFor={location.id}
                className="text-sm font-normal cursor-pointer"
              >
                {formatLocationName(location)}
              </Label>
            </div>
          ))}
        </div>

        {errors.locationIds && (
          <Alert variant="destructive">
            <AlertDescription>{errors.locationIds.message}</AlertDescription>
          </Alert>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={createTeamMutation.isPending}
          className="flex-1 sm:flex-none"
          loading={createTeamMutation.isPending}
        >
          Create Team
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={createTeamMutation.isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
