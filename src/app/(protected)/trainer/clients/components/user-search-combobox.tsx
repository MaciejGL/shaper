'use client'

import { UserCheck } from 'lucide-react'
import { useState } from 'react'

import { SearchCombobox } from '@/components/search-combobox/search-combobox'
import type { SearchComboboxItem } from '@/components/search-combobox/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useSearchUsersQuery } from '@/generated/graphql-client'
import type { GQLSearchUserResult } from '@/generated/graphql-client'

interface UserSearchComboboxProps {
  onUserSelected: (user: GQLSearchUserResult) => void
  placeholder?: string
  className?: string
}

type UserSearchItem = GQLSearchUserResult & SearchComboboxItem

export function UserSearchCombobox({
  onUserSelected,
  placeholder = 'Search by email...',
  className,
}: UserSearchComboboxProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Search for users when there's a query
  const { data, isLoading } = useSearchUsersQuery(
    { email: searchQuery, limit: 10 },
    { enabled: searchQuery.length > 0 },
  )

  const users: UserSearchItem[] =
    data?.searchUsers.map((user) => ({
      ...user,
      disabled: user.hasTrainer,
    })) || []

  const renderUserItem = (user: UserSearchItem) => (
    <>
      <Avatar className="size-8">
        <AvatarImage src={user.image || undefined} />
        <AvatarFallback>
          {user.name?.charAt(0).toUpperCase() ||
            user.email.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-1 flex-col items-start">
        <div className="flex items-center gap-2">
          <span className="font-medium">{user.name || user.email}</span>
          {user.hasTrainer && (
            <UserCheck className="size-4 text-muted-foreground" />
          )}
        </div>
        <span className="text-xs text-muted-foreground">{user.email}</span>
        {user.hasTrainer && (
          <span className="text-xs italic text-muted-foreground">
            Already has a trainer
          </span>
        )}
      </div>
    </>
  )

  const renderNoResults = (query: string) => (
    <>User with email &quot;{query}&quot; is not registered.</>
  )

  return (
    <SearchCombobox<UserSearchItem>
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      items={users}
      isLoading={isLoading}
      onItemSelected={onUserSelected}
      renderItem={renderUserItem}
      renderNoResults={renderNoResults}
      placeholder={placeholder}
      className={className}
      debounceMs={700}
      minQueryLength={0}
      dropdownId="user-search-results"
    />
  )
}
