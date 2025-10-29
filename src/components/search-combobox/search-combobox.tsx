'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'

import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

export interface SearchComboboxItem {
  id: string
  disabled?: boolean
}

interface SearchComboboxProps<T extends SearchComboboxItem> {
  onItemSelected: (item: T) => void
  placeholder?: string
  className?: string
  debounceMs?: number
  minQueryLength?: number
  renderItem: (item: T) => React.ReactNode
  renderNoResults?: (query: string) => React.ReactNode
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  items: T[]
  isLoading: boolean
  dropdownId?: string
}

export function SearchCombobox<T extends SearchComboboxItem>({
  onItemSelected,
  placeholder = 'Search...',
  className,
  debounceMs = 500,
  minQueryLength = 0,
  renderItem,
  renderNoResults,
  searchQuery,
  onSearchQueryChange,
  items,
  isLoading,
  dropdownId = 'search-combobox-results',
}: SearchComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false)

  const debouncedSearchQuery = useDebounce(searchQuery, debounceMs)

  const hasResults = items.length > 0
  const showResults = isOpen && searchQuery.length >= minQueryLength
  const showNoResults =
    showResults &&
    !hasResults &&
    !isLoading &&
    debouncedSearchQuery.length >= minQueryLength

  const handleSelectItem = (item: T) => {
    if (item.disabled) {
      return
    }
    onItemSelected(item)
    onSearchQueryChange('')
    setIsOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      onSearchQueryChange('')
      e.currentTarget.blur()
    }
  }

  return (
    <div className={cn('relative', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => {
            onSearchQueryChange(e.target.value)
            if (e.target.value.length >= minQueryLength) {
              setIsOpen(true)
            } else {
              setIsOpen(false)
            }
          }}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (searchQuery.length >= minQueryLength) setIsOpen(true)
          }}
          onBlur={(e) => {
            // Don't close if clicking on the dropdown itself
            const relatedTarget = e.relatedTarget as HTMLElement
            if (relatedTarget?.closest(`#${dropdownId}`)) {
              return
            }
            // Stable delay to prevent flickering
            setTimeout(() => setIsOpen(false), 150)
          }}
          className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          role="combobox"
          aria-controls={dropdownId}
          aria-expanded={showResults}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
      </div>

      {/* Results Dropdown */}
      {showResults && (
        <div
          id={dropdownId}
          className="absolute z-50 mt-1 w-full rounded-md border border-border bg-popover shadow-md"
          role="listbox"
        >
          <div className="max-h-[300px] overflow-y-auto p-1">
            {isLoading && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Searching...
              </div>
            )}

            {!isLoading && hasResults && (
              <>
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    disabled={item.disabled}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-sm px-3 py-2 text-sm',
                      item.disabled
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer hover:bg-accent hover:text-accent-foreground',
                    )}
                    role="option"
                    aria-selected={false}
                    aria-disabled={item.disabled}
                  >
                    {renderItem(item)}
                  </button>
                ))}
              </>
            )}

            {showNoResults && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                {renderNoResults?.(debouncedSearchQuery) || 'No results found.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
