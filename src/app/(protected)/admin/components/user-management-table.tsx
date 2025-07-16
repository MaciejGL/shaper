'use client'

import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  LogOut,
  MoreHorizontal,
  Search,
  Shield,
  UserCheck,
  UserX,
} from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { RoleManagementModal } from './role-management-modal'
import { UserDetailsModal } from './user-details-modal'

// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from '@/components/ui/table'

// import { RoleManagementModal } from './role-management-modal'
// import { UserDetailsModal } from './user-details-modal'

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

interface UserListResponse {
  users: AdminUserListItem[]
  total: number
  hasMore: boolean
}

interface UserManagementTableProps {
  onUserUpdate?: () => void
}

export function UserManagementTable({
  onUserUpdate,
}: UserManagementTableProps) {
  const [users, setUsers] = useState<AdminUserListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // Filters
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [profileFilter, setProfileFilter] = useState<string>('')

  // Pagination
  const [offset, setOffset] = useState(0)
  const limit = 20

  // Modals
  const [selectedUser, setSelectedUser] = useState<AdminUserListItem | null>(
    null,
  )
  const [roleModalOpen, setRoleModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        action: 'list',
        limit: limit.toString(),
        offset: offset.toString(),
      })

      if (search) params.append('search', search)
      if (roleFilter) params.append('role', roleFilter)
      if (profileFilter) params.append('hasProfile', profileFilter)

      const response = await fetch(`/api/admin/users?${params}`)

      if (!response.ok) {
        throw new Error('Failed to fetch users')
      }

      const data: UserListResponse = await response.json()
      setUsers(data.users)
      setTotal(data.total)
      setHasMore(data.hasMore)
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset, search, roleFilter, profileFilter])

  const handleNextPage = () => {
    if (hasMore) {
      setOffset(offset + limit)
    }
  }

  const handlePrevPage = () => {
    if (offset > 0) {
      setOffset(Math.max(0, offset - limit))
    }
  }

  const handleResetFilters = () => {
    setSearch('')
    setRoleFilter('')
    setProfileFilter('')
    setOffset(0)
  }

  const handleUserAction = async (userId: string, action: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`)
      }

      // Refresh the user list
      await fetchUsers()
      onUserUpdate?.()
    } catch (error) {
      console.error(`Error ${action} user:`, error)
    }
  }

  const handleClearSessions = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/sessions`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to clear sessions')
      }

      // Refresh the user list
      await fetchUsers()
      onUserUpdate?.()
    } catch (error) {
      console.error('Error clearing sessions:', error)
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

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString()
  }

  const getDisplayName = (user: AdminUserListItem) => {
    if (user.profile?.firstName || user.profile?.lastName) {
      return `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()
    }
    return user.name || user.email
  }

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading users...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="user-search"
            placeholder="Search users by name, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setOffset(0) // Reset to first page when searching
            }}
            className="pl-8"
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(value) => {
            setRoleFilter(value === 'all' ? '' : value)
            setOffset(0)
          }}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="CLIENT">Clients</SelectItem>
            <SelectItem value="TRAINER">Trainers</SelectItem>
            <SelectItem value="ADMIN">Admins</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={profileFilter}
          onValueChange={(value) => {
            setProfileFilter(value === 'all' ? '' : value)
            setOffset(0)
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Profile Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Users</SelectItem>
            <SelectItem value="true">Has Profile</SelectItem>
            <SelectItem value="false">No Profile</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleResetFilters}>
          <Filter className="h-4 w-4 mr-2" />
          Reset
        </Button>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-muted/50">
            <tr>
              <th className="border-b px-4 py-3 text-left text-sm font-medium">
                User
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium">
                Role
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium">
                Status
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium">
                Last Login
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium">
                Sessions
              </th>
              <th className="border-b px-4 py-3 text-left text-sm font-medium">
                Joined
              </th>
              <th className="border-b px-4 py-3 text-right text-sm font-medium">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  <div>
                    <div className="font-medium">{getDisplayName(user)}</div>
                    <div className="text-sm text-muted-foreground">
                      {user.email}
                    </div>
                    {user.role === 'CLIENT' && user.trainer && (
                      <div className="text-xs text-muted-foreground">
                        Trainer: {user.trainer.firstName}{' '}
                        {user.trainer.lastName}
                      </div>
                    )}
                    {user.role === 'TRAINER' && user.clientCount > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {user.clientCount} clients
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <Badge variant={getRoleBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </td>
                <td>
                  <div className="flex items-center gap-2">
                    {user.isActive ? (
                      <UserCheck className="h-4 w-4 text-green-500" />
                    ) : (
                      <UserX className="h-4 w-4 text-orange-500" />
                    )}
                    <span className="text-sm">
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {!user.profile && (
                      <Badge variant="outline" className="text-xs">
                        No Profile
                      </Badge>
                    )}
                  </div>
                </td>
                <td className="text-sm">{formatDate(user.lastLoginAt)}</td>
                <td className="text-sm">{user.sessionCount}</td>
                <td className="text-sm">{formatDate(user.createdAt)}</td>
                <td className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>

                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user)
                          setDetailsModalOpen(true)
                        }}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedUser(user)
                          setRoleModalOpen(true)
                        }}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Change Role
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      {user.sessionCount > 0 && (
                        <DropdownMenuItem
                          onClick={() => handleClearSessions(user.id)}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Clear Sessions
                        </DropdownMenuItem>
                      )}

                      {user.isActive ? (
                        <DropdownMenuItem
                          onClick={() =>
                            handleUserAction(user.id, 'deactivate')
                          }
                          className="text-orange-600"
                        >
                          <UserX className="mr-2 h-4 w-4" />
                          Deactivate User
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="text-green-600"
                        >
                          <UserCheck className="mr-2 h-4 w-4" />
                          Activate User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {offset + 1} to {Math.min(offset + limit, total)} of {total}{' '}
          users
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevPage}
            disabled={offset === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={!hasMore}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading && users.length > 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">Updating...</span>
        </div>
      )}

      {/* Modals */}
      {selectedUser && (
        <>
          <RoleManagementModal
            user={selectedUser}
            open={roleModalOpen}
            onOpenChange={setRoleModalOpen}
            onSuccess={() => {
              fetchUsers()
              onUserUpdate?.()
            }}
          />

          <UserDetailsModal
            user={selectedUser}
            open={detailsModalOpen}
            onOpenChange={setDetailsModalOpen}
          />
        </>
      )}
    </div>
  )
}
