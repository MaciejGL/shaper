'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Plus, X } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCreateTeamMutation } from '@/generated/graphql-client'

const createTeamSchema = z.object({
  name: z
    .string()
    .min(1, 'Team name is required')
    .max(100, 'Team name too long'),
  locations: z
    .array(
      z.object({
        city: z.string().min(1, 'City is required'),
        country: z.string().min(1, 'Country is required'),
        countryCode: z.string().min(2).max(3),
      }),
    )
    .min(1, 'At least one location is required'),
})

type CreateTeamForm = z.infer<typeof createTeamSchema>

interface CreateTeamFormProps {
  onCancel: () => void
}

export function CreateTeamForm({ onCancel }: CreateTeamFormProps) {
  const [locations, setLocations] = useState([
    { city: '', country: '', countryCode: '' },
  ])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CreateTeamForm>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: '',
      locations: [{ city: '', country: '', countryCode: '' }],
    },
  })

  const createTeamMutation = useCreateTeamMutation({
    onSuccess: () => {
      toast.success('Team created successfully!')
      onCancel()
    },
    onError: (error) => {
      toast.error('Failed to create team. Please try again.')
      console.error('Create team error:', error)
    },
  })

  const addLocation = () => {
    const newLocations = [
      ...locations,
      { city: '', country: '', countryCode: '' },
    ]
    setLocations(newLocations)
    setValue('locations', newLocations)
  }

  const removeLocation = (index: number) => {
    if (locations.length > 1) {
      const newLocations = locations.filter((_, i) => i !== index)
      setLocations(newLocations)
      setValue('locations', newLocations)
    }
  }

  const updateLocation = (index: number, field: string, value: string) => {
    const newLocations = [...locations]
    newLocations[index] = { ...newLocations[index], [field]: value }
    setLocations(newLocations)
    setValue('locations', newLocations)
  }

  const onSubmit = (data: CreateTeamForm) => {
    createTeamMutation.mutate({
      input: {
        name: data.name,
        locations: data.locations,
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

      {/* Locations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Operating Locations</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addLocation}
            disabled={createTeamMutation.isPending}
          >
            <Plus className="size-4 mr-2" />
            Add Location
          </Button>
        </div>

        <div className="space-y-3">
          {locations.map((location, index) => (
            <div key={index} className="flex gap-3 items-start">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1">
                <div>
                  <Input
                    id="city"
                    placeholder="City"
                    value={location.city}
                    onChange={(e) =>
                      updateLocation(index, 'city', e.target.value)
                    }
                    disabled={createTeamMutation.isPending}
                  />
                </div>
                <div>
                  <Input
                    id="country"
                    placeholder="Country"
                    value={location.country}
                    onChange={(e) =>
                      updateLocation(index, 'country', e.target.value)
                    }
                    disabled={createTeamMutation.isPending}
                  />
                </div>
                <div>
                  <Input
                    id="countryCode"
                    placeholder="Country Code (NO, US, etc.)"
                    value={location.countryCode}
                    onChange={(e) =>
                      updateLocation(
                        index,
                        'countryCode',
                        e.target.value.toUpperCase(),
                      )
                    }
                    disabled={createTeamMutation.isPending}
                    maxLength={3}
                  />
                </div>
              </div>

              {locations.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeLocation(index)}
                  disabled={createTeamMutation.isPending}
                  className="shrink-0 mt-0"
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ))}
        </div>

        {errors.locations && (
          <Alert variant="destructive">
            <AlertDescription>
              {errors.locations.message || 'Please check location information'}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={createTeamMutation.isPending}
          className="flex-1 sm:flex-none"
        >
          {createTeamMutation.isPending && (
            <Loader2 className="size-4 mr-2 animate-spin" />
          )}
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
