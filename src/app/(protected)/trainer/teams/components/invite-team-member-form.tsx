'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInviteTeamMemberMutation } from '@/generated/graphql-client'

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type InviteForm = z.infer<typeof inviteSchema>

interface InviteTeamMemberFormProps {
  teamId: string
  onCancel: () => void
  onSuccess: () => void
}

export function InviteTeamMemberForm({
  teamId,
  onCancel,
  onSuccess,
}: InviteTeamMemberFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
  })

  const inviteMutation = useInviteTeamMemberMutation({
    onSuccess: () => {
      toast.success('Invitation sent successfully!')
      reset()
      onSuccess()
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Failed to send invitation'
      toast.error(message)
    },
  })

  const onSubmit = (data: InviteForm) => {
    inviteMutation.mutate({
      input: {
        teamId,
        email: data.email,
      },
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="trainer@example.com"
            className="pl-9"
            disabled={inviteMutation.isPending}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <Alert>
        <AlertDescription>
          The trainer will receive an email invitation to join your team. They
          must be registered as a trainer to accept the invitation.
        </AlertDescription>
      </Alert>

      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          disabled={inviteMutation.isPending}
          className="flex-1 sm:flex-none"
        >
          {inviteMutation.isPending && (
            <Loader2 className="size-4 mr-2 animate-spin" />
          )}
          Send Invitation
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={inviteMutation.isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
