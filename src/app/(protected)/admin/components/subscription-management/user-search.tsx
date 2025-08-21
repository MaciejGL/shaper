'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface UserSearchProps {
  onUserSelected: (userId: string) => void
}

export function UserSearch({ onUserSelected }: UserSearchProps) {
  const [userId, setUserId] = useState('')

  const handleSearch = () => {
    if (userId.trim()) {
      onUserSelected(userId.trim())
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Subscription Management</CardTitle>
        <CardDescription>
          Search for a user to manage their subscriptions and billing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <Label htmlFor="userId">User ID</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="userId"
                placeholder="Enter user ID..."
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button onClick={handleSearch} disabled={!userId.trim()}>
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
