'use client'

import { RefreshCw, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface SubscriptionFilters {
  status?: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING'
  trainerId?: string
  dateFrom?: string
  dateTo?: string
}

interface SubscriptionFiltersProps {
  filters?: SubscriptionFilters
  onFiltersChange?: (filters: SubscriptionFilters) => void
  searchTerm?: string
  onSearchChange?: (search: string) => void
  onRefresh?: () => void
}

export function SubscriptionFilters({
  filters = {},
  onFiltersChange = () => {},
  searchTerm = '',
  onSearchChange = () => {},
  onRefresh = () => {},
}: SubscriptionFiltersProps) {
  return (
    <div className="flex gap-4 items-center">
      <div className="flex-1">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by user ID, package name, or subscription ID..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Select
        value={filters.status || 'all'}
        onValueChange={(value) =>
          onFiltersChange({
            ...filters,
            status:
              value === 'all'
                ? undefined
                : (value as SubscriptionFilters['status']),
          })
        }
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="ACTIVE">Active</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
          <SelectItem value="EXPIRED">Expired</SelectItem>
        </SelectContent>
      </Select>

      <Button variant="outline" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Refresh
      </Button>
    </div>
  )
}
