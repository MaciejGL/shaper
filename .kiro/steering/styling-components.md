# Styling & Component Usage

## Tailwind CSS Standards

- Use utility classes for styling
- Follow mobile-first responsive design
- Use consistent spacing scale (4, 8, 12, 16, 24, 32, 48, 64)
- Prefer Tailwind utilities over custom CSS

## Component Hierarchy & Rules

```typescript
// 1. Use shadcn/ui components first
import { Button, Card, Input } from '@/components/ui'
// 2. Create feature components when needed
import { UserCard } from '@/components/user'

// 3. Split large components into smaller, focused components
// 4. NEVER use type "any" - always provide proper TypeScript types
// 5. Group related components in feature folders
```

## Button Usage with Design System

```typescript
// ✅ Good - Use proper button props with icons
<Button
  variant="default"
  size="md"
  iconStart={<Plus />}
  iconEnd={<ChevronRight />}
>
  Add Item
</Button>

// ✅ Good - Proper TypeScript types
interface ButtonProps {
  variant: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size: 'sm' | 'md' | 'lg'
  iconStart?: React.ReactNode
  iconEnd?: React.ReactNode
  children: React.ReactNode
}

// ❌ Never use "any" type
const handleClick = (event: any) => {} // WRONG
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {} // CORRECT
```

## Component Splitting Strategy

```typescript
// ❌ Large monolithic component
const UserDashboard = () => {
  // 200+ lines of JSX and logic
}

// ✅ Split into focused components
const UserDashboard = () => (
  <div>
    <UserHeader />
    <UserStats />
    <UserActivityFeed />
    <UserActions />
  </div>
)
```

## Styling Patterns

```typescript
// ✅ Good - Utility classes with proper dark mode
<div className="flex items-center gap-4 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">

// ✅ Good - Conditional classes with cn()
<Button className={cn("w-full", isLoading && "opacity-50")}>

// ❌ Avoid - Inline styles
<div style={{ padding: '24px', backgroundColor: 'white' }}>
```

## Design System & Theme Usage

- Use actual design system tokens from `tailwind.config.js`
- Support both light and dark modes with proper contrast ratios
- Use semantic color names: `bg-background`, `text-foreground`, `border-border`
- Test all components in both light and dark themes
- Use CSS variables for consistent theming across components

## Responsive Design

```typescript
// Mobile-first approach with proper breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">

// Responsive text following design system scale
<h1 className="text-2xl md:text-3xl lg:text-4xl mb-4 md:mb-6">

// Touch-friendly targets (minimum 44px)
<Button className="w-full md:w-auto">
```

## TypeScript Strictness

- Never use `any` type - use proper interfaces or `unknown`
- Define proper prop interfaces for all components
- Use generic types for reusable components
- Prefer `type` over `interface` for simple object shapes
- Use strict null checks and proper optional chaining
