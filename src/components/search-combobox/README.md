# SearchCombobox - Reusable Search Component

A generic, reusable search combobox component with debouncing, keyboard navigation, and customizable rendering.

## Features

- ✅ Configurable debounce delay
- ✅ Customizable minimum query length
- ✅ Disabled item support
- ✅ Custom rendering for items
- ✅ Custom "no results" message
- ✅ Keyboard navigation (Escape to close)
- ✅ Loading state
- ✅ Accessible (ARIA attributes)

## Basic Usage

```tsx
import { SearchCombobox } from '@/components/search-combobox/search-combobox'
import type { SearchComboboxItem } from '@/components/search-combobox/types'

interface MyItem extends SearchComboboxItem {
  name: string
  email: string
}

function MySearchComponent() {
  const [searchQuery, setSearchQuery] = useState('')
  const { data, isLoading } = useMySearchQuery(
    { query: searchQuery },
    { enabled: searchQuery.length > 0 },
  )

  const items: MyItem[] =
    data?.results.map((item) => ({
      ...item,
      disabled: false, // Set to true to disable selection
    })) || []

  const renderItem = (item: MyItem) => (
    <div className="flex items-center gap-2">
      <span className="font-medium">{item.name}</span>
      <span className="text-xs text-muted-foreground">{item.email}</span>
    </div>
  )

  return (
    <SearchCombobox<MyItem>
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      items={items}
      isLoading={isLoading}
      onItemSelected={(item) => console.log('Selected:', item)}
      renderItem={renderItem}
      placeholder="Search..."
      debounceMs={500}
      minQueryLength={2}
    />
  )
}
```

## Advanced Examples

### User Search with Disabled Items

```tsx
// See: src/app/(protected)/trainer/clients/components/user-search-combobox.tsx

const users: UserSearchItem[] =
  data?.searchUsers.map((user) => ({
    ...user,
    disabled: user.hasTrainer, // Disable users who already have a trainer
  })) || []

const renderUserItem = (user: UserSearchItem) => (
  <>
    <Avatar className="size-8">
      <AvatarImage src={user.image || undefined} />
      <AvatarFallback>{user.name?.charAt(0).toUpperCase()}</AvatarFallback>
    </Avatar>
    <div className="flex flex-1 flex-col items-start">
      <span className="font-medium">{user.name || user.email}</span>
      <span className="text-xs text-muted-foreground">{user.email}</span>
      {user.hasTrainer && (
        <span className="text-xs italic text-muted-foreground">
          Already has a trainer
        </span>
      )}
    </div>
  </>
)
```

### Custom "No Results" Message

```tsx
const renderNoResults = (query: string) => (
  <>User with email "{query}" is not registered.</>
)

<SearchCombobox
  {...props}
  renderNoResults={renderNoResults}
/>
```

### Custom Debounce and Minimum Query Length

```tsx
<SearchCombobox
  {...props}
  debounceMs={700} // Wait 700ms before triggering search
  minQueryLength={2} // Only search when query has 2+ characters
/>
```

## Props Reference

### Required Props

| Prop                  | Type                           | Description                                                  |
| --------------------- | ------------------------------ | ------------------------------------------------------------ |
| `searchQuery`         | `string`                       | Current search query value                                   |
| `onSearchQueryChange` | `(query: string) => void`      | Callback when search query changes                           |
| `items`               | `T[]`                          | Array of items to display (must extend `SearchComboboxItem`) |
| `isLoading`           | `boolean`                      | Whether search is in progress                                |
| `onItemSelected`      | `(item: T) => void`            | Callback when item is selected                               |
| `renderItem`          | `(item: T) => React.ReactNode` | Function to render each item                                 |

### Optional Props

| Prop              | Type                                 | Default                     | Description                               |
| ----------------- | ------------------------------------ | --------------------------- | ----------------------------------------- |
| `placeholder`     | `string`                             | `"Search..."`               | Input placeholder text                    |
| `className`       | `string`                             | -                           | Additional CSS classes                    |
| `debounceMs`      | `number`                             | `500`                       | Debounce delay in milliseconds            |
| `minQueryLength`  | `number`                             | `0`                         | Minimum characters before showing results |
| `renderNoResults` | `(query: string) => React.ReactNode` | `"No results found."`       | Custom no results message                 |
| `dropdownId`      | `string`                             | `"search-combobox-results"` | HTML id for dropdown (for accessibility)  |

## Item Interface

Items must implement the `SearchComboboxItem` interface:

```typescript
interface SearchComboboxItem {
  id: string // Unique identifier
  disabled?: boolean // Whether item can be selected
}
```

Your custom items should extend this interface:

```typescript
type MyItem = GQLSearchResult & SearchComboboxItem

// Or
interface MyItem extends SearchComboboxItem {
  name: string
  // ... other properties
}
```

## Styling

The component uses Tailwind CSS and design system tokens. The input and dropdown inherit your theme's colors and styling.

### Custom Styling

Pass additional classes via `className`:

```tsx
<SearchCombobox className="w-full max-w-md" {...props} />
```

## Accessibility

- Uses proper ARIA attributes (`role`, `aria-controls`, `aria-expanded`, etc.)
- Keyboard navigation support (Escape to close)
- Focus management for better UX
- Disabled items are marked with `aria-disabled`

## Migration Guide

### From Old UserSearchCombobox

**Before:**

```tsx
// All logic mixed together
const [searchQuery, setSearchQuery] = useState('')
const [isOpen, setIsOpen] = useState(false)
// ... 170 lines of code
```

**After:**

```tsx
// Clean, focused component
const [searchQuery, setSearchQuery] = useState('')
const { data, isLoading } = useSearchUsersQuery(...)
const items = data?.searchUsers.map(user => ({ ...user, disabled: user.hasTrainer })) || []

return (
  <SearchCombobox
    searchQuery={searchQuery}
    onSearchQueryChange={setSearchQuery}
    items={items}
    isLoading={isLoading}
    onItemSelected={onUserSelected}
    renderItem={renderUserItem}
    {...config}
  />
)
```

Benefits:

- ~90 lines of code removed
- Reusable across different search types
- Easier to test and maintain
- Consistent behavior across the app
