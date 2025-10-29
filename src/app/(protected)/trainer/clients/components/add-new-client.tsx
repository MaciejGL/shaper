'use client'

import { useQueryClient } from '@tanstack/react-query'
import { UserPlus2Icon } from 'lucide-react'
import type React from 'react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateCoachingRequestMutation,
  useMyCoachingRequestsQuery,
} from '@/generated/graphql-client'
import type { GQLSearchUserResult } from '@/generated/graphql-client'

import { UserSearchCombobox } from './user-search-combobox'

export function AddClientModal() {
  const [open, setOpen] = useState(false)
  const queryClient = useQueryClient()
  const [selectedUser, setSelectedUser] = useState<GQLSearchUserResult | null>(
    null,
  )
  const [message, setMessage] = useState('')

  const { mutateAsync: createCoachingRequest, isPending } =
    useCreateCoachingRequestMutation({
      onSuccess: () => {
        // Invalidate coaching requests query to refresh the list
        queryClient.invalidateQueries({
          queryKey: useMyCoachingRequestsQuery.getKey(),
        })
        toast.success('Coaching request sent')
      },
    })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedUser) {
      toast.error('Please select a user')
      return
    }

    try {
      await createCoachingRequest({
        recipientEmail: selectedUser.email,
        message: message,
      })

      setSelectedUser(null)
      setMessage('')
      setOpen(false)
    } catch (error) {
      console.error('Error sending coaching request:', error)
      // Show error message to user
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to send invitation. Please try again.'
      toast.error(errorMessage)
    }
  }

  const handleUserSelected = (user: GQLSearchUserResult) => {
    setSelectedUser(user)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button iconStart={<UserPlus2Icon />}>Add New Client</Button>
      </DialogTrigger>
      <DialogContent
        dialogTitle="Add New Client"
        className="sm:max-w-[600px] min-h-[500px]"
      >
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
            <DialogDescription>
              Send an invitation to a new client to join your training program.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="user-search" className="text-left">
                Select User
              </Label>
              {selectedUser ? (
                <div className="flex items-center justify-between rounded-md border border-border bg-muted p-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-8">
                      <AvatarImage src={selectedUser.image || undefined} />
                      <AvatarFallback>
                        {selectedUser.name?.charAt(0).toUpperCase() ||
                          selectedUser.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {selectedUser.name || selectedUser.email}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {selectedUser.email}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedUser(null)}
                    disabled={isPending}
                    type="button"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <UserSearchCombobox
                  onUserSelected={handleUserSelected}
                  placeholder="Search by email..."
                />
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="message" className="text-left">
                Invitation Message
              </Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Write a personal message to your client..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[100px]"
                disabled={isPending}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isPending} disabled={!selectedUser}>
              Send Invitation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
