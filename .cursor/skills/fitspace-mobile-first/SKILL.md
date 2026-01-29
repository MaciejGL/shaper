---
name: fitspace-mobile-first
description: Build mobile-optimized UI/UX for fitspace routes. These routes run as WebView inside native iOS/Android shell. Use when working on any fitspace/ route, creating components in fitspace/, or when user mentions mobile app, native app, or fitspace features.
---

# Fitspace Mobile-First Development

The `fitspace/` routes are designed exclusively for mobile devices. They run as a WebView inside a minimal native shell on iOS and Android. The web app must reflect best practices for mobile UI/UX.

## Architecture Context

```
┌─────────────────────────────────────────┐
│          Native Shell (iOS/Android)      │
│  ┌─────────────────────────────────────┐ │
│  │           WebView                    │ │
│  │  ┌─────────────────────────────────┐ │ │
│  │  │     fitspace/* Routes           │ │ │
│  │  │                                 │ │ │
│  │  │  - Full web app logic           │ │ │
│  │  │  - Mobile-first UI/UX           │ │ │
│  │  │  - Safe area handling           │ │ │
│  │  │  - Touch-optimized controls     │ │ │
│  │  └─────────────────────────────────┘ │ │
│  └─────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Key insight**: Native shell is minimal. ALL UI/UX logic lives in the web app.

---

## 1. Safe Areas (Critical)

iOS devices have notches, home indicators, and dynamic islands. Always handle safe areas.

### Available Utilities

```typescript
// Bottom navigation - tightest (nav bars)
'safe-area-bottom-nav'     // padding-bottom: max(4px, calc(env(safe-area-inset-bottom) - 18px))

// Content areas - moderate padding
'safe-area-bottom-content' // padding-bottom: max(16px, calc(env(safe-area-inset-bottom) - 12px))

// Full safe area utilities
'safe-area-top'     // padding-top: env(safe-area-inset-top)
'safe-area-bottom'  // padding-bottom: env(safe-area-inset-bottom)
'safe-area-x'       // padding-left + padding-right
'safe-area-y'       // padding-top + padding-bottom
'safe-area-all'     // all sides
```

### When to Use

| Context | Utility | Example |
|---------|---------|---------|
| Bottom navigation bar | `safe-area-bottom-nav` | `<nav className="safe-area-bottom-nav">` |
| Drawer footers | `safe-area-bottom-content` | `<DrawerFooter>` (built-in) |
| Fixed bottom CTAs | `safe-area-bottom-content` | `<div className="fixed bottom-0 safe-area-bottom-content">` |
| Full-screen overlays | `safe-area-all` | Modal backgrounds |
| Side panels | `safe-area-x` | Slide-out menus |

### Pattern: Fixed Bottom Actions

```typescript
// ✅ CORRECT - Fixed bottom button with safe area
<div className="fixed bottom-0 inset-x-0 p-4 bg-background/95 backdrop-blur safe-area-bottom-content">
  <Button className="w-full">Complete Workout</Button>
</div>

// ❌ WRONG - No safe area handling
<div className="fixed bottom-0 inset-x-0 p-4">
  <Button className="w-full">Complete Workout</Button>
</div>
```

---

## 2. Touch Targets (44px Minimum)

Mobile users tap with fingers. All interactive elements need adequate touch targets.

### Minimum Sizes

| Element | Minimum Size | Recommended |
|---------|--------------|-------------|
| Buttons | 44x44px | `size-11` or larger |
| Icon buttons | 44x44px | `size="icon-lg"` (48px) |
| List items | 44px height | `min-h-11` |
| Input fields | 44px height | Default in design system |
| Checkbox/Radio | 44x44px touch area | Use label wrapping |

### Pattern: Touch-Friendly Buttons

```typescript
// ✅ CORRECT - Large touch targets
<Button size="icon-lg" iconOnly={<Plus />} />  // 48x48px
<Button className="h-12 w-full">Save</Button>  // 48px height

// ✅ Day selector with 48px touch targets
<button className="size-12 rounded-xl flex-center">
  <span>Mon</span>
</button>

// ❌ WRONG - Too small
<Button size="icon-sm" iconOnly={<Plus />} />  // Only 32px
<button className="size-8">X</button>          // 32px, too small
```

### Pattern: Clickable List Items

```typescript
// ✅ CORRECT - Full row is tappable
<button className="w-full min-h-11 flex items-center gap-3 px-4 py-3">
  <Icon className="size-5" />
  <span>Exercise Name</span>
  <ChevronRight className="size-5 ml-auto" />
</button>

// ❌ WRONG - Only icon is tappable
<div className="flex items-center">
  <span>Exercise Name</span>
  <button className="size-6"><ChevronRight /></button>
</div>
```

---

## 3. Navigation Patterns

### Bottom Tab Navigation

The app uses a fixed bottom navigation bar. Design content to work with it.

```typescript
// Content must account for bottom nav height (~72px + safe area)
<div className="pb-20"> // Or use container-hypertro
  {/* Page content */}
</div>

// Navigation hides when keyboard is visible
const isKeyboardVisible = useKeyboardVisible()
if (isKeyboardVisible) return null
```

### Drawers Over Modals

Prefer bottom drawers for mobile overlays - they're thumb-friendly.

```typescript
// ✅ CORRECT - Bottom drawer for mobile
<Drawer>
  <DrawerTrigger asChild>
    <Button>Open Options</Button>
  </DrawerTrigger>
  <DrawerContent dialogTitle="Options">
    <DrawerHeader>
      <DrawerTitle>Select Option</DrawerTitle>
    </DrawerHeader>
    {/* Content */}
    <DrawerFooter> {/* Has safe-area-bottom-content built-in */}
      <Button className="w-full">Confirm</Button>
    </DrawerFooter>
  </DrawerContent>
</Drawer>

// Avoid: Desktop-style centered modals for primary interactions
```

### Back Button Handling

Native back button (Android) and swipe gestures must work. Use `useModalHistory`.

```typescript
// Built into Drawer component - handles history.pushState for back button
useModalHistory(isOpen, () => setIsOpen(false))
```

---

## 4. Keyboard Handling

Mobile keyboards dramatically change available space.

### Hide Elements When Keyboard Shows

```typescript
import { useKeyboardVisible } from '@/hooks/use-keyboard-visible'

function MyComponent() {
  const isKeyboardVisible = useKeyboardVisible()
  
  return (
    <>
      {/* Main content */}
      
      {/* Hide fixed bottom elements when keyboard is up */}
      {!isKeyboardVisible && (
        <div className="fixed bottom-0 safe-area-bottom-content">
          <Button>Action</Button>
        </div>
      )}
    </>
  )
}
```

### Input Focus Scrolling

Ensure inputs scroll into view when focused:

```typescript
// Drawer already handles this with repositionInputs={false}
<DrawerPrimitive.Root repositionInputs={false}>

// For custom implementations, ensure viewport adjusts
const handleFocus = () => {
  setTimeout(() => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, 300)
}
```

---

## 5. Layout Patterns

### Max Width Container

Content should be constrained for readability:

```typescript
// ✅ Use container-hypertro for main content
<div className="container-hypertro mx-auto px-4">
  {children}
</div>

// Or explicit max-width
<div className="max-w-md mx-auto">
  {children}
</div>
```

### Vertical Rhythm

Mobile screens are tall and narrow. Use vertical layouts:

```typescript
// ✅ CORRECT - Vertical stacking with consistent gaps
<div className="flex flex-col gap-4">
  <Card>Section 1</Card>
  <Card>Section 2</Card>
  <Card>Section 3</Card>
</div>

// ❌ WRONG - Horizontal layouts that require scrolling
<div className="flex gap-4 overflow-x-auto">
  {/* Forces horizontal scrolling */}
</div>
```

### Full-Width CTAs

Primary actions should be full-width on mobile:

```typescript
// ✅ CORRECT - Full width buttons
<Button className="w-full">Start Workout</Button>

<div className="grid gap-2">
  <Button variant="default" className="w-full">Primary Action</Button>
  <Button variant="secondary" className="w-full">Secondary</Button>
</div>

// ❌ WRONG - Inline buttons compete for space
<div className="flex gap-2">
  <Button>Action 1</Button>
  <Button>Action 2</Button>
</div>
```

---

## 6. Visual Feedback

Mobile users need immediate feedback since there's no hover state.

### Active States

```typescript
// ✅ Use data-* states for selection feedback
<button
  data-selected={isSelected}
  className={cn(
    'bg-card transition-all',
    'data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground',
    'active:scale-95' // Press feedback
  )}
>

// ✅ Loading states on buttons
<Button loading={isLoading} disabled={isLoading}>
  Save
</Button>
```

### Optimistic Updates

Essential for perceived performance on mobile:

```typescript
// Always use optimistic mutations
const { createExercise } = useExerciseMutations()

const handleAdd = () => {
  createExercise(data) // UI updates instantly
}
```

---

## 7. Performance Considerations

### Reduce Motion When Needed

```css
@media (prefers-reduced-motion: reduce) {
  * { animation: none !important; transition: none !important; }
}
```

### Lazy Load Below-Fold Content

```typescript
// Defer non-critical content
const [showMore, setShowMore] = useState(false)

useEffect(() => {
  const timer = setTimeout(() => setShowMore(true), 100)
  return () => clearTimeout(timer)
}, [])
```

### Debounce Frequent Updates

```typescript
// Use debounced mutations for rapid input
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'

const debouncedInvalidate = useDebouncedInvalidation({
  queryKeys: ['GetWorkout'],
  delay: 1000,
})
```

---

## 8. Component Checklist

Before creating/editing fitspace components:

- [ ] Touch targets are 44px minimum (use `size-11`, `size-12`, `min-h-11`)
- [ ] Safe areas handled for fixed/sticky elements
- [ ] Keyboard visibility handled if has fixed bottom elements
- [ ] Primary CTAs are full-width
- [ ] Uses Drawer (not Dialog) for overlays
- [ ] Loading states on all buttons/actions
- [ ] Optimistic updates for mutations
- [ ] Content doesn't overflow horizontally
- [ ] Max-width constrained (`max-w-md` or `container-hypertro`)

---

## Anti-Patterns to Avoid

| Don't | Do Instead |
|-------|------------|
| Small touch targets (< 44px) | Use `size-11` minimum |
| Centered modals for primary actions | Use bottom Drawer |
| Fixed elements without safe-area | Add `safe-area-bottom-*` |
| Hover-dependent interactions | Use tap/active states |
| Horizontal scroll layouts | Stack vertically |
| Inline small buttons | Full-width CTAs |
| Skip loading states | Always show loading |
| Desktop-first then adapt | Mobile-first always |

---

## Quick Reference

```typescript
// Safe areas
'safe-area-bottom-nav'      // Navigation bars
'safe-area-bottom-content'  // Content/footers
'safe-area-x'               // Horizontal safe areas

// Touch targets
'size-11'                   // 44px - minimum
'size-12'                   // 48px - recommended

// Container
'container-hypertro'        // Max-width + min-height
'max-w-md mx-auto'          // Alternative

// Keyboard
useKeyboardVisible()        // Hide elements when keyboard up

// Drawer (not Dialog)
<Drawer>
  <DrawerContent dialogTitle="...">
    <DrawerFooter>         // Has safe-area built-in
```
