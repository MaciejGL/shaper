/**
 * SearchCombobox Usage Examples
 *
 * This file contains example implementations showing how to use
 * the SearchCombobox component for different use cases.
 */
import { useState } from 'react'

import { SearchCombobox } from './search-combobox'
import type { SearchComboboxItem } from './types'

// ============================================================================
// Example 1: Simple Text Search
// ============================================================================

interface SimpleItem extends SearchComboboxItem {
  name: string
  description?: string
}

export function SimpleSearchExample() {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - replace with actual API call
  const items: SimpleItem[] = [
    { id: '1', name: 'Item 1', description: 'First item' },
    { id: '2', name: 'Item 2', description: 'Second item' },
  ]

  const renderItem = (item: SimpleItem) => (
    <div>
      <div className="font-medium">{item.name}</div>
      {item.description && (
        <div className="text-xs text-muted-foreground">{item.description}</div>
      )}
    </div>
  )

  return (
    <SearchCombobox<SimpleItem>
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      items={items}
      isLoading={false}
      onItemSelected={(item) => console.log('Selected:', item)}
      renderItem={renderItem}
      placeholder="Search items..."
    />
  )
}

// ============================================================================
// Example 2: Search with Disabled Items
// ============================================================================

interface ProductItem extends SearchComboboxItem {
  name: string
  price: number
  inStock: boolean
}

export function ProductSearchExample() {
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - disable out of stock items
  const items: ProductItem[] = [
    { id: '1', name: 'Product A', price: 29.99, inStock: true },
    {
      id: '2',
      name: 'Product B',
      price: 39.99,
      inStock: false,
      disabled: true,
    },
  ]

  const renderItem = (item: ProductItem) => (
    <div className="flex items-center justify-between">
      <div>
        <div className="font-medium">{item.name}</div>
        {!item.inStock && (
          <div className="text-xs italic text-muted-foreground">
            Out of stock
          </div>
        )}
      </div>
      <div className="text-sm font-medium">${item.price}</div>
    </div>
  )

  return (
    <SearchCombobox<ProductItem>
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      items={items}
      isLoading={false}
      onItemSelected={(item) => console.log('Selected:', item)}
      renderItem={renderItem}
      placeholder="Search products..."
    />
  )
}

// ============================================================================
// Example 3: Search with API Integration
// ============================================================================

interface ApiItem extends SearchComboboxItem {
  title: string
  subtitle: string
}

export function ApiSearchExample() {
  const [searchQuery, setSearchQuery] = useState('')

  // Replace with your actual query hook
  // const { data, isLoading } = useSearchQuery(
  //   { query: searchQuery },
  //   { enabled: searchQuery.length >= 2 }
  // )

  const isLoading = false
  const items: ApiItem[] = []

  const renderItem = (item: ApiItem) => (
    <div>
      <div className="font-medium">{item.title}</div>
      <div className="text-xs text-muted-foreground">{item.subtitle}</div>
    </div>
  )

  const renderNoResults = (query: string) => (
    <>No results found for &quot;{query}&quot;. Try a different search.</>
  )

  return (
    <SearchCombobox<ApiItem>
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      items={items}
      isLoading={isLoading}
      onItemSelected={(item) => console.log('Selected:', item)}
      renderItem={renderItem}
      renderNoResults={renderNoResults}
      placeholder="Search (min 2 characters)..."
      debounceMs={700}
      minQueryLength={2}
    />
  )
}

// ============================================================================
// Example 4: Search with Complex Layout
// ============================================================================

interface ComplexItem extends SearchComboboxItem {
  avatar?: string
  name: string
  email: string
  role: string
  verified: boolean
}

export function ComplexSearchExample() {
  const [searchQuery, setSearchQuery] = useState('')

  const items: ComplexItem[] = []

  const renderItem = (item: ComplexItem) => (
    <div className="flex items-center gap-3">
      {item.avatar ? (
        <img src={item.avatar} alt="" className="size-10 rounded-full" />
      ) : (
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          {item.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.name}</span>
          {item.verified && <span className="text-xs text-green-600">✓</span>}
        </div>
        <span className="text-xs text-muted-foreground">{item.email}</span>
        <span className="text-xs text-muted-foreground">{item.role}</span>
      </div>
    </div>
  )

  return (
    <SearchCombobox<ComplexItem>
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      items={items}
      isLoading={false}
      onItemSelected={(item) => console.log('Selected:', item)}
      renderItem={renderItem}
      placeholder="Search users..."
      debounceMs={500}
    />
  )
}
