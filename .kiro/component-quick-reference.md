# Component Quick Reference

## 🚀 Common Patterns - Copy & Paste Ready

### Button Patterns

```typescript
// Icon-only buttons
<Button size="icon-sm" iconOnly={<Edit />} />
<Button size="icon-md" iconOnly={<Trash />} />

// Buttons with icons
<Button iconStart={<Plus />}>Add New</Button>
<Button iconEnd={<ArrowRight />}>Continue</Button>

// Action buttons
<Button variant="destructive" iconStart={<Trash />}>Delete</Button>
<Button variant="outline" iconStart={<Cancel />}>Cancel</Button>

// Loading button
<Button loading={isSubmitting} disabled={isSubmitting}>
  Save Changes
</Button>
```

### Card Patterns

```typescript
// Standard content card
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
    <CardAction>
      <Button size="icon-sm" iconOnly={<MoreHorizontal />} />
    </CardAction>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>

// Borderless card (minimal styling)
<Card borderless>
  <CardContent>
    Content without visual card styling
  </CardContent>
</Card>

// Simple container (NOT a card)
<div className="p-4 space-y-4">
  <h3 className="font-medium">Section Title</h3>
  <p>Simple content</p>
</div>
```

### Form Patterns

```typescript
// Standard form field
<FormField
  control={form.control}
  name="fieldName"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Field Label</FormLabel>
      <FormControl>
        <Input {...field} />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>

// Form with submit button
<form onSubmit={form.handleSubmit(onSubmit)}>
  {/* Fields here */}
  <Button
    type="submit"
    loading={isSubmitting}
    disabled={!form.formState.isValid}
  >
    Save
  </Button>
</form>
```

### Layout Patterns

```typescript
// Dashboard header
<DashboardHeader
  title="Page Title"
  description="Page description"
  icon={SomeIcon}
  prevSegment={{ label: 'Back', href: '/previous' }}
/>

// Grid layout
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {items.map(item => (
    <ItemCard key={item.id} item={item} />
  ))}
</div>

// Flex actions
<div className="flex items-center justify-between gap-4">
  <h2>Title</h2>
  <div className="flex gap-2">
    <Button variant="outline">Cancel</Button>
    <Button>Save</Button>
  </div>
</div>
```

### Modal/Dialog Patterns

```typescript
// Standard dialog
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogTrigger asChild>
    <Button iconStart={<Plus />}>Create New</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>
        Dialog description
      </DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline" onClick={() => setIsOpen(false)}>
        Cancel
      </Button>
      <Button onClick={handleSave}>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

// Drawer for mobile-friendly modals
<Drawer open={isOpen} onOpenChange={setIsOpen}>
  <DrawerTrigger asChild>
    <Button>Open</Button>
  </DrawerTrigger>
  <DrawerContent>
    <DrawerHeader>
      <DrawerTitle>Title</DrawerTitle>
    </DrawerHeader>
    {/* Content */}
  </DrawerContent>
</Drawer>
```

---

## 🔍 Migration Patterns

### Button Icon Migration

```typescript
// ❌ BEFORE
<Button className="flex items-center gap-2">
  <TrashIcon className="h-4 w-4" />
  Delete
</Button>

// ✅ AFTER
<Button iconStart={<TrashIcon />}>Delete</Button>

// ❌ BEFORE
<Button>
  <Plus className="mr-2 h-4 w-4" />
  Add New
</Button>

// ✅ AFTER
<Button iconStart={<Plus />}>Add New</Button>

// ❌ BEFORE
<Button className="w-8 h-8 p-0">
  <EditIcon className="h-4 w-4" />
</Button>

// ✅ AFTER
<Button size="icon-sm" iconOnly={<EditIcon />} />
```

### Card Migration

```typescript
// ❌ BEFORE - Unnecessary card
<Card>
  <div className="p-4">
    <Button>Simple action</Button>
  </div>
</Card>

// ✅ AFTER - Simple container
<div className="p-4">
  <Button>Simple action</Button>
</div>

// ❌ BEFORE - Card for layout
<Card borderless>
  <div className="grid grid-cols-2 gap-4">
    <div>Item 1</div>
    <div>Item 2</div>
  </div>
</Card>

// ✅ AFTER - Direct layout
<div className="grid grid-cols-2 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

---

## 🎯 Component Structure Template

```typescript
// components/feature-name/feature-name.tsx
'use client'

import { SomeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { useFeatureName } from './use-feature-name'
import { type FeatureNameProps } from './types'

export function FeatureName({
  prop1,
  prop2,
  onAction
}: FeatureNameProps) {
  const { state, handleSomething, isLoading } = useFeatureName()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Button
          iconStart={<SomeIcon />}
          loading={isLoading}
          onClick={() => onAction(prop1)}
        >
          Action
        </Button>
      </CardContent>
    </Card>
  )
}

// components/feature-name/use-feature-name.ts
export function useFeatureName() {
  // Hook logic
  return { state, handleSomething, isLoading }
}

// components/feature-name/types.ts
export interface FeatureNameProps {
  prop1: string
  prop2?: number
  onAction: (id: string) => void
}
```

---

## 📱 Mobile-First Patterns

```typescript
// Responsive grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <ItemCard key={item.id} item={item} />)}
</div>

// Mobile-friendly actions
<div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
  <Button className="w-full sm:w-auto">Primary</Button>
  <Button variant="outline" className="w-full sm:w-auto">Secondary</Button>
</div>

// Container queries for component-level responsive
<div className="@container">
  <div className="grid grid-cols-1 @lg:grid-cols-2 gap-4">
    Content
  </div>
</div>
```

---

## ⚡ Performance Patterns

```typescript
// Optimistic updates
const mutation = useUpdateItemMutation({
  onMutate: async (variables) => {
    await queryClient.cancelQueries({ queryKey })
    const previousData = queryClient.getQueryData(queryKey)

    queryClient.setQueryData(queryKey, (old) => ({
      ...old,
      items: old.items.map((item) =>
        item.id === variables.id ? { ...item, ...variables } : item,
      ),
    }))

    return { previousData }
  },
  onError: (err, variables, context) => {
    if (context?.previousData) {
      queryClient.setQueryData(queryKey, context.previousData)
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey })
  },
})

// Debounced actions
const debouncedSave = useDebouncedCallback((value: string) => {
  mutation.mutate({ id, value })
}, 500)
```
