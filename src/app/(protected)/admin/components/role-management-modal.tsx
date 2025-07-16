'use client'

import { AlertCircle, Loader2, Shield } from 'lucide-react'
import { useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface AdminUserListItem {
  id: string
  email: string
  name?: string | null
  role: 'CLIENT' | 'TRAINER' | 'ADMIN'
  createdAt: string
  updatedAt: string
  lastLoginAt?: string | null
  sessionCount: number
  clientCount: number
  isActive: boolean
}

interface RoleManagementModalProps {
  user: AdminUserListItem
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function RoleManagementModal({
  user,
  open,
  onOpenChange,
  onSuccess,
}: RoleManagementModalProps) {
  const [newRole, setNewRole] = useState<string>(user.role)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async () => {
    if (newRole === user.role) {
      onOpenChange(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/users/${user.id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newRole }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update user role')
      }

      onSuccess?.()
      onOpenChange(false)
    } catch (error) {
      console.error('Error updating user role:', error)
      setError(
        error instanceof Error ? error.message : 'Failed to update user role',
      )
    } finally {
      setLoading(false)
    }
  }

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

  const getRoleDescription = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'Full system access including user management and administrative functions'
      case 'TRAINER':
        return 'Can create training plans, manage clients, and access trainer-specific features'
      case 'CLIENT':
        return 'Basic user access with ability to follow training plans and track progress'
      default:
        return ''
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dialogTitle="Change User Role">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Change User Role
          </DialogTitle>
          <DialogDescription>
            Update the role for {user.email}. This will change their access
            permissions throughout the system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Current Role */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Role</label>
            <div className="flex items-center gap-2">
              <Badge variant={getRoleBadgeVariant(user.role)}>
                {user.role}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {getRoleDescription(user.role)}
              </span>
            </div>
          </div>

          {/* New Role Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">New Role</label>
            <Select value={newRole} onValueChange={setNewRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CLIENT">
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" className="text-xs">
                      CLIENT
                    </Badge>
                    <span>Basic user access</span>
                  </div>
                </SelectItem>
                <SelectItem value="TRAINER">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      TRAINER
                    </Badge>
                    <span>Trainer privileges</span>
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      ADMIN
                    </Badge>
                    <span>Full administrative access</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            {newRole && (
              <p className="text-xs text-muted-foreground">
                {getRoleDescription(newRole)}
              </p>
            )}
          </div>

          {/* Role Change Impact */}
          {newRole !== user.role && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Role Change Impact:</strong>
                {newRole === 'ADMIN' && (
                  <span className="ml-1">
                    This user will gain full administrative access including
                    user management.
                  </span>
                )}
                {newRole === 'TRAINER' && user.role === 'CLIENT' && (
                  <span className="ml-1">
                    This user will be able to create training plans and manage
                    clients.
                  </span>
                )}
                {newRole === 'CLIENT' && user.role === 'TRAINER' && (
                  <span className="ml-1">
                    This user will lose trainer privileges and access to{' '}
                    {user.clientCount} clients.
                  </span>
                )}
                {newRole === 'CLIENT' && user.role === 'ADMIN' && (
                  <span className="ml-1">
                    This user will lose all administrative privileges and
                    access.
                  </span>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || newRole === user.role}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {newRole === user.role ? 'No Changes' : 'Update Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
