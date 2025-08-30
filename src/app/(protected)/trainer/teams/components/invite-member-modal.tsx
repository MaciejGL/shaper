'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Mail } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Alert, AlertDescription } from '@/components/ui/alert'
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
import { useInviteTeamMemberMutation } from '@/generated/graphql-client'

const inviteSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type InviteForm = z.infer<typeof inviteSchema>

interface InviteMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  teamId: string
}

export function InviteMemberModal({
  open,
  onOpenChange,
  teamId,
}: InviteMemberModalProps) {
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
      onOpenChange(false)
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

  const handleCancel = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dialogTitle="Invite Team Member" className="sm:max-w-md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to another trainer to join your team.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
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
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Alert>
              <AlertDescription>
                The trainer will receive an email invitation to join your team.
                They must be registered as a trainer to accept the invitation.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={inviteMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={inviteMutation.isPending}>
              {inviteMutation.isPending && (
                <Loader2 className="size-4 mr-2 animate-spin" />
              )}
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
