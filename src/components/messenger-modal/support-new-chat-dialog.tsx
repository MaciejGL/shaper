'use client'

import { useQueryClient } from '@tanstack/react-query'
import { Loader2, MessageSquarePlus, Search } from 'lucide-react'
import { useState } from 'react'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { UserAvatar } from '@/components/user-avatar'
import type {
  GQLGetMessengerInitialDataQuery,
  GQLSearchUsersForChatQuery,
} from '@/generated/graphql-client'
import {
  useCreateSupportChatMutation,
  useGetMessengerInitialDataQuery,
  useSearchUsersForChatQuery,
} from '@/generated/graphql-client'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'
import { SUPPORT_ACCOUNT_ID } from '@/lib/support-account'

import { getUserDisplayName } from './utils'

type PartnerUser =
  GQLGetMessengerInitialDataQuery['getMessengerInitialData']['chats'][number]['client']

type SearchUser = GQLSearchUsersForChatQuery['searchUsersForChat'][number]

interface SupportNewChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onChatSelect: (partnerId: string) => void
  messagesPerChat?: number
}

export function SupportNewChatDialog({
  open,
  onOpenChange,
  onChatSelect,
  messagesPerChat = 30,
}: SupportNewChatDialogProps) {
  const [query, setQuery] = useState('')
  const queryClient = useQueryClient()

  const trimmedQuery = query.trim()

  const messengerQueryKey = useGetMessengerInitialDataQuery.getKey({
    messagesPerChat,
  })

  const { data: usersData, isFetching: isSearching } =
    useSearchUsersForChatQuery(
      { query: trimmedQuery },
      {
        enabled: open && trimmedQuery.length >= 2,
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    )

  const users = usersData?.searchUsersForChat ?? []

  const createChatMutation = useCreateSupportChatMutation()

  const toPartnerUser = (user: SearchUser): PartnerUser => ({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    image: user.image,
  })

  const { optimisticMutate: createChatOptimistic } = useOptimisticMutation<
    GQLGetMessengerInitialDataQuery,
    Awaited<ReturnType<typeof createChatMutation.mutateAsync>>,
    { userId: string; user: PartnerUser }
  >({
    queryKey: messengerQueryKey,
    mutationFn: async ({ userId }) =>
      createChatMutation.mutateAsync({ userId }),
    updateFn: (oldData, variables, tempChatId) => {
      const existingChats = oldData.getMessengerInitialData.chats

      const alreadyExists = existingChats.some(
        (c) =>
          c.trainerId === SUPPORT_ACCOUNT_ID && c.clientId === variables.userId,
      )
      if (alreadyExists) return oldData

      const supportTrainer = existingChats.find(
        (c) => c.trainerId === SUPPORT_ACCOUNT_ID,
      )?.trainer ?? {
        id: SUPPORT_ACCOUNT_ID,
        email: '',
        firstName: null,
        lastName: null,
        image: null,
      }

      const optimisticChat = {
        __typename: 'ChatWithMessages' as const,
        id: tempChatId || `temp-support-chat-${variables.userId}`,
        trainerId: SUPPORT_ACCOUNT_ID,
        clientId: variables.userId,
        trainer: supportTrainer,
        client: variables.user,
        messages: [],
        hasMoreMessages: false,
        lastMessage: null,
        unreadCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      return {
        ...oldData,
        getMessengerInitialData: {
          ...oldData.getMessengerInitialData,
          chats: [optimisticChat, ...existingChats],
        },
      }
    },
    onSuccess: (data, variables, tempChatId) => {
      const created = data?.createSupportChat
      if (created && tempChatId) {
        queryClient.setQueryData(
          messengerQueryKey,
          (old: GQLGetMessengerInitialDataQuery | undefined) => {
            if (!old?.getMessengerInitialData?.chats) return old

            return {
              ...old,
              getMessengerInitialData: {
                ...old.getMessengerInitialData,
                chats: old.getMessengerInitialData.chats.map((c) =>
                  c.id === tempChatId
                    ? {
                        ...c,
                        id: created.id,
                        trainerId: created.trainerId,
                        clientId: created.clientId,
                        trainer: created.trainer,
                        client: created.client,
                        lastMessage: created.lastMessage ?? null,
                        createdAt: created.createdAt,
                        updatedAt: created.updatedAt,
                      }
                    : c,
                ),
              },
            }
          },
        )
      }

      onOpenChange(false)
      setQuery('')
      // If we created a chat, navigate to it (now that cache has real id)
      onChatSelect(variables.userId)
    },
  })

  const isCreating = createChatMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dialogTitle="New conversation">
        <div className="text-lg font-semibold">New conversation</div>

        <div className="space-y-3">
          <Input
            id="support-new-chat-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name or email"
            iconStart={<Search />}
          />

          <ScrollArea className="h-80 rounded-lg border border-border">
            <div className="p-2">
              {trimmedQuery.length < 2 ? (
                <p className="text-sm text-muted-foreground p-3">
                  Type at least 2 characters to search.
                </p>
              ) : isSearching ? (
                <div className="flex items-center justify-center py-10 text-sm text-muted-foreground gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Searching...
                </div>
              ) : users.length === 0 ? (
                <p className="text-sm text-muted-foreground p-3">No results.</p>
              ) : (
                <div className="space-y-1">
                  {users.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      className="w-full rounded-lg p-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-50"
                      disabled={isCreating}
                      onClick={async () => {
                        try {
                          const tempChatId = `temp-support-chat-${user.id}`
                          await createChatOptimistic(
                            { userId: user.id, user: toPartnerUser(user) },
                            tempChatId,
                          )
                        } catch {
                          // Error handling is done globally for mutations
                        }
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          withFallbackAvatar
                          firstName={user.firstName || ''}
                          lastName={user.lastName || ''}
                          imageUrl={user.image || undefined}
                          className="size-10"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {getUserDisplayName(user)}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {user.email}
                          </p>
                        </div>
                        <MessageSquarePlus className="size-4 text-muted-foreground shrink-0" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  )
}
