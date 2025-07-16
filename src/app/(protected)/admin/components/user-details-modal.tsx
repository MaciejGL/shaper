'use client'

import { Calendar, Clock, Mail, Phone, User, Users } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'

interface UserProfile {
  id: string
  firstName?: string | null
  lastName?: string | null
  phone?: string | null
  birthday?: string | null
  sex?: string | null
}

interface UserTrainer {
  id: string
  email: string
  firstName?: string | null
  lastName?: string | null
}

interface AdminUserListItem {
  id: string
  email: string
  name?: string | null
  role: 'CLIENT' | 'TRAINER' | 'ADMIN'
  createdAt: string
  updatedAt: string
  lastLoginAt?: string | null
  sessionCount: number
  profile?: UserProfile | null
  trainer?: UserTrainer | null
  clientCount: number
  isActive: boolean
}

interface UserDetailsModalProps {
  user: AdminUserListItem
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UserDetailsModal({
  user,
  open,
  onOpenChange,
}: UserDetailsModalProps) {
  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'destructive'
      case 'TRAINER':
        return 'secondary'
      case 'CLIENT':
        return 'primary'
      default:
        return 'outline'
    }
  }

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Not available'
    return new Date(dateString).toLocaleString()
  }

  const getDisplayName = () => {
    if (user.profile?.firstName || user.profile?.lastName) {
      return `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()
    }
    return user.name || 'No name set'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl" dialogTitle="User Details">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            User Details
          </DialogTitle>
          <DialogDescription>
            Complete information for {user.email}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Name
                </label>
                <p className="text-sm">{getDisplayName()}</p>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{user.email}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Role
                </label>
                <div>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <div>
                  <Badge variant={user.isActive ? 'success' : 'outline'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Profile Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Profile Information</h3>

            {user.profile ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    First Name
                  </label>
                  <p className="text-sm">
                    {user.profile.firstName || 'Not provided'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Last Name
                  </label>
                  <p className="text-sm">
                    {user.profile.lastName || 'Not provided'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Phone
                  </label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {user.profile.phone || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Gender
                  </label>
                  <p className="text-sm">
                    {user.profile.sex || 'Not specified'}
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Birthday
                  </label>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {user.profile.birthday
                        ? new Date(user.profile.birthday).toLocaleDateString()
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No profile information available</p>
                <p className="text-sm">
                  User has not completed their profile setup
                </p>
              </div>
            )}
          </div>

          <Separator />

          {/* Relationship Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Relationships</h3>

            <div className="grid grid-cols-2 gap-4">
              {user.role === 'CLIENT' && user.trainer && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Trainer
                  </label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">
                      {user.trainer.firstName} {user.trainer.lastName} (
                      {user.trainer.email})
                    </p>
                  </div>
                </div>
              )}

              {user.role === 'TRAINER' && (
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Clients
                  </label>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm">{user.clientCount} active clients</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Activity Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Activity Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Account Created
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{formatDate(user.updatedAt)}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Last Login
                </label>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm">{formatDate(user.lastLoginAt)}</p>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Total Sessions
                </label>
                <p className="text-sm font-medium">{user.sessionCount}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
