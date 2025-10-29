'use client'

import { DialogTitle, DialogTrigger } from '@radix-ui/react-dialog'
import { useQueryClient } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  useCreateCoachingRequestMutation,
  useGetClientsQuery,
  useMyCoachingRequestsQuery,
} from '@/generated/graphql-client'
import type { GQLSearchUserResult, GQLUser } from '@/generated/graphql-client'

import { UserSearchCombobox } from './user-search-combobox'

export function ActiveClientList() {
  const { data } = useGetClientsQuery(
    {},
    {
      refetchOnWindowFocus: false,
    },
  )

  return (
    <div>
      <div className="flex justify-between items-baseline border-b pb-2">
        <h1 className="text-2xl font-medium">Clients</h1>
        <AddNewClientButton />
      </div>
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3 mt-2">
        {data?.myClients.map((client) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  )
}

function ClientCard({
  client,
}: {
  client: Pick<GQLUser, 'id' | 'name' | 'email' | 'image'>
}) {
  return (
    <Card className="border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Avatar>
            <AvatarImage src={client.image ?? ''} />
            <AvatarFallback className="text-sm">
              {client.name
                ?.split(' ')
                .map((name) => name.charAt(0))
                .join('')}
            </AvatarFallback>
          </Avatar>
          {client.name ?? client.email}
        </CardTitle>
        <CardDescription className="flex flex-wrap gap-2">
          {/* <Badge variant="secondary">{client.profile.goal}</Badge>
					<Badge variant="secondary">{client.activeProgram.name}</Badge> */}
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

function AddNewClientButton() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [message, setMessage] = React.useState('')
  const [selectedUser, setSelectedUser] =
    React.useState<GQLSearchUserResult | null>(null)
  const queryClient = useQueryClient()
  const { mutate: createCoachingRequest, isPending } =
    useCreateCoachingRequestMutation({
      onSuccess: () => {
        // Invalidate coaching requests query to refresh the list
        queryClient.invalidateQueries({
          queryKey: useMyCoachingRequestsQuery.getKey(),
        })
        toast.success('Request has been sent to the client.')
        setIsOpen(false)
        setSelectedUser(null)
        setMessage('')
      },
      onError: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to send invitation. Please try again.'
        toast.error(errorMessage)
      },
    })

  const handleSendRequest = () => {
    if (!selectedUser) {
      toast.error('Please select a user')
      return
    }
    createCoachingRequest({
      recipientEmail: selectedUser.email,
      message: message,
    })
  }

  const handleUserSelected = (user: GQLSearchUserResult) => {
    setSelectedUser(user)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
        </Button>
      </DialogTrigger>
      <DialogContent dialogTitle="Send request to new client">
        <DialogHeader>
          <DialogTitle>Send request to new client</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <label htmlFor="user-search" className="text-sm font-medium">
              Select User
            </label>
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
          <div className="space-y-2">
            <label htmlFor="message" className="text-sm font-medium">
              Message
            </label>
            <Textarea
              id="message"
              placeholder="Optional message for the client..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={isPending}
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSendRequest}
            loading={isPending}
            disabled={!selectedUser}
          >
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
