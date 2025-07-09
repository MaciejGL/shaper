'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { PlusIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useSendCollaborationInvitationMutation } from '@/generated/graphql-client'

const sendInvitationSchema = z.object({
  recipientEmail: z.string().email('Please enter a valid email address'),
  message: z.string().optional(),
})

type SendInvitationFormData = z.infer<typeof sendInvitationSchema>
//
interface SendInvitationDialogProps {
  onSuccess?: () => void
}

export function SendInvitationDialog({ onSuccess }: SendInvitationDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<SendInvitationFormData>({
    resolver: zodResolver(sendInvitationSchema),
    defaultValues: {
      recipientEmail: '',
      message: '',
    },
  })

  const { mutate: sendInvitation, isPending } =
    useSendCollaborationInvitationMutation({
      onSuccess: () => {
        setOpen(false)
        form.reset()
        onSuccess?.()
      },
      onError: (error) => {
        toast.error('Failed to send invitation')
        console.error('Error sending invitation:', error)
      },
    })

  const onSubmit = (data: SendInvitationFormData) => {
    sendInvitation({
      input: {
        recipientEmail: data.recipientEmail,
        message: data.message,
      },
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button iconStart={<PlusIcon className="h-4 w-4" />}>
          Send Invitation
        </Button>
      </DialogTrigger>
      <DialogContent dialogTitle="Send Collaboration Invitation">
        <DialogHeader>
          <DialogTitle>Send Collaboration Invitation</DialogTitle>
          <DialogDescription>
            Invite another trainer to collaborate on your training and meal
            plans.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="recipientEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trainer Email</FormLabel>
                  <FormControl>
                    <Input
                      id="recipientEmail"
                      placeholder="trainer@example.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Enter the email address of the trainer you want to
                    collaborate with.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Message (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      id="message"
                      placeholder="Hi! I'd like to collaborate on some training plans..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Add a personal message to your invitation.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isPending}>
                Send Invitation
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
