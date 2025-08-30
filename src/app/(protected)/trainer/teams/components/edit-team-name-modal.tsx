'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useUpdateTeamMutation } from '@/generated/graphql-client'

// TODO: Add after running codegen
// import { useUpdateTeamMutation } from '@/generated/graphql-client'

const editTeamNameSchema = z.object({
  name: z
    .string()
    .min(1, 'Team name is required')
    .max(100, 'Team name too long'),
})

type EditTeamNameForm = z.infer<typeof editTeamNameSchema>

interface EditTeamNameModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
  currentName: string
}

export function EditTeamNameModal({
  open,
  onOpenChange,
  teamId,
  currentName,
}: EditTeamNameModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<EditTeamNameForm>({
    resolver: zodResolver(editTeamNameSchema),
    defaultValues: {
      name: currentName,
    },
  })

  const updateTeamMutation = useUpdateTeamMutation({
    onSuccess: () => {
      toast.success('Team name updated successfully!')
      onOpenChange(false)
      reset()
    },
    onError: (error: Error) => {
      const message = error.message || 'Failed to update team name'
      toast.error(message)
    },
  })

  const onSubmit = (data: EditTeamNameForm) => {
    updateTeamMutation.mutate({
      input: {
        teamId,
        name: data.name,
      },
    })
  }

  const handleCancel = () => {
    reset({ name: currentName })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dialogTitle="Edit Team Name" className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Edit Team Name</DialogTitle>
            <DialogDescription>
              Update your team's name. This will be visible to all team members.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="teamName">Team Name</Label>
              <Input
                id="teamName"
                {...register('name')}
                placeholder="Enter team name"
                disabled={updateTeamMutation.isPending}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={updateTeamMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={updateTeamMutation.isPending}>
              {updateTeamMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
