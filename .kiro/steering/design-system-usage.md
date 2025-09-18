# Design System Usage

## Button Component Standards

```typescript
// ✅ Correct - Use proper button props with icons
<Button
  variant="default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size="sm" | "md" | "lg"
  iconStart={<Plus className="w-4 h-4" />}
  iconEnd={<ChevronRight className="w-4 h-4" />}
  disabled={isLoading}
  onClick={handleClick}
>
  Button Text
</Button>

// ❌ Wrong - Missing proper props or using custom styling
<button className="custom-button-style">Click me</button>
```

## Design System Tokens

```typescript
// ✅ Use semantic design system colors
className = 'bg-background text-foreground border-border'
className = 'bg-primary text-primary-foreground'
className = 'bg-secondary text-secondary-foreground'
className = 'bg-muted text-muted-foreground'

// ✅ Use design system spacing (follows 4px grid)
className = 'p-4 m-8 gap-6 space-y-4'

// ❌ Avoid arbitrary values outside design system
className = 'bg-blue-500 p-7 m-13' // Use design tokens instead
```

## Light & Dark Mode Implementation

```typescript
// ✅ Proper theme-aware components
<Card className="bg-card text-card-foreground border-border">
  <CardHeader className="border-b border-border">
    <CardTitle className="text-foreground">Title</CardTitle>
  </CardHeader>
  <CardContent className="text-muted-foreground">
    Content that works in both themes
  </CardContent>
</Card>

// ✅ Manual dark mode classes when needed
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">

// ❌ Hard-coded colors that break in dark mode
<div className="bg-white text-black"> // Will look bad in dark mode
```

## Component Composition with Design System

```typescript
// ✅ Use design system components as building blocks
import { Button, Card, Input, Label } from '@/components/ui'

const LoginForm = () => (
  <Card className="w-full max-w-md">
    <CardHeader>
      <CardTitle>Login</CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" />
      </div>
      <Button
        className="w-full"
        iconStart={<LogIn className="w-4 h-4" />}
      >
        Sign In
      </Button>
    </CardContent>
  </Card>
)
```

## Typography Scale

```typescript
// ✅ Use design system typography classes
<h1 className="text-4xl font-bold">Main Heading</h1>
<h2 className="text-3xl font-semibold">Section Heading</h2>
<h3 className="text-2xl font-medium">Subsection</h3>
<p className="text-base text-muted-foreground">Body text</p>
<small className="text-sm text-muted-foreground">Helper text</small>

// ❌ Avoid arbitrary font sizes
<h1 className="text-[32px]"> // Use design system scale instead
```

## Responsive Design with Design System

```typescript
// ✅ Mobile-first with design system breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  <Card className="p-4 md:p-6">
    <Button
      className="w-full md:w-auto"
      size="sm"
      iconStart={<Plus className="w-4 h-4" />}
    >
      Add Item
    </Button>
  </Card>
</div>
```

## Testing Design System Components

- Test all components in both light and dark modes
- Verify proper contrast ratios for accessibility
- Ensure touch targets meet minimum 44px requirement
- Test responsive behavior across breakpoints
- Validate proper keyboard navigation and focus states
