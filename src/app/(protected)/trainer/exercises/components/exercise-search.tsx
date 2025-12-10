'use client'

import { debounce } from 'lodash'
import { RotateCcw, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EQUIPMENT_OPTIONS } from '@/config/equipment'

import { useSearchQueries } from './hooks'

export function ExerciseSearch() {
  const {
    searchTerm,
    setSearchTerm,
    resetFilters,
    hasAnyFilter,
    selectedEquipment,
    setSelectedEquipment,
  } = useSearchQueries()

  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)

  // Create a memoized debounced function that will only be recreated if setSearchTerm changes
  const debouncedSetSearchTerm = useMemo(
    () => debounce((value: string) => setSearchTerm(value), 300),
    [setSearchTerm],
  )

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSetSearchTerm.cancel()
    }
  }, [debouncedSetSearchTerm])

  // Update local state and trigger debounced search
  const handleSearchChange = (value: string) => {
    setLocalSearchTerm(value)
    debouncedSetSearchTerm(value)
  }
  const handleResetFilters = () => {
    resetFilters()
    setLocalSearchTerm('')
  }
  return (
    <div className="flex flex-col sm:flex-row gap-4 ">
      <div className="w-full">
        <Input
          id="search"
          placeholder="Search exercises..."
          value={localSearchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          iconStart={<Search className="text-muted-foreground" />}
          className="grow"
        />
      </div>
      <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
        <SelectTrigger className="min-w-48" variant="ghost">
          <SelectValue placeholder="Equipment" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Equipment</SelectItem>
          {EQUIPMENT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          onClick={handleResetFilters}
          className="flex items-center gap-2"
          size="icon-sm"
          disabled={!hasAnyFilter}
          iconOnly={<RotateCcw />}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
