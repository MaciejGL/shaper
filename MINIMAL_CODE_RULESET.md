# Minimal Code Ruleset for Cursor AI

## Core Principle: Write the LEAST code possible while maintaining readability and functionality.

## 1. REUSE BEFORE CREATING

### Components

- **MANDATORY**: Search existing components in `src/components/` before creating new ones
- **ALWAYS**: Use existing UI primitives from `src/components/ui/`
- **NEVER**: Create custom versions of existing components (buttons, modals, cards, etc.)
- **REQUIRED**: Check for similar patterns in codebase before implementing

```typescript
// ✅ GOOD - Reuse existing
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// ❌ BAD - Creating custom when existing works
const CustomButton = ({ children }) => <button className="...">{children}</button>
```

### Hooks & Utilities

- **MANDATORY**: Search for existing hooks in `src/hooks/` before creating
- **ALWAYS**: Use existing utilities from `src/lib/` and `src/utils/`
- **RULE**: If logic exists in 2+ places, extract to utility (DRY principle)

## 2. COMPONENT SIZE LIMITS

### Hard Limits

- **Components**: Maximum 200 lines - SPLIT if exceeded
- **Hooks**: Maximum 200 lines - SPLIT if exceeded
- **Files**: One primary export per file
- **Functions**: Maximum 50 lines - extract helpers if needed

### Split Triggers

- Multiple concerns in one component → Split by responsibility
- Complex logic → Extract to custom hook
- Repeated code → Extract to utility function
- UI getting complex → Break into smaller components

```typescript
// ✅ GOOD - Small, focused
export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <Card>
      <ExerciseHeader exercise={exercise} />
      <ExerciseMetrics exercise={exercise} />
    </Card>
  )
}

// ❌ BAD - Too much in one component
export function ExerciseCard() {
  // 300 lines of mixed concerns
}
```

## 3. NO DUPLICATE CODE

### Zero Tolerance Rules

- **NEVER**: Copy-paste code between files
- **ALWAYS**: Extract shared logic to utilities
- **MANDATORY**: Use existing patterns from codebase
- **REQUIRED**: Check for similar implementations before coding

### Common Patterns to Reuse

- Form validation → Use existing validation utilities
- Data fetching → Use existing GraphQL hooks
- UI patterns → Use existing component compositions
- Error handling → Use existing error boundaries
- Loading states → Use existing skeleton components

## 4. LEVERAGE EXISTING PATTERNS

### GraphQL

- **ALWAYS**: Use generated hooks (`useGetWorkoutQuery`)
- **NEVER**: Write custom fetch logic
- **MANDATORY**: Use optimistic updates pattern from existing code
- **REQUIRED**: Follow existing query key patterns

### Styling

- **ALWAYS**: Use existing Tailwind classes and utilities
- **NEVER**: Write custom CSS when Tailwind class exists
- **MANDATORY**: Use existing design tokens (colors, spacing, etc.)
- **FORBIDDEN**: Arbitrary values (`w-[123px]`) when standard exists

### State Management

- **ALWAYS**: Use existing context patterns
- **NEVER**: Create new global state when existing covers it
- **MANDATORY**: Follow existing React Query patterns

## 5. COMPOSITION OVER CREATION

### Prefer Composition

```typescript
// ✅ GOOD - Compose existing
function WorkoutHeader({ workout }: { workout: Workout }) {
  return (
    <div className="flex-center gap-4">
      <UserAvatar user={workout.trainer} />
      <div>
        <h3>{workout.name}</h3>
        <p className="text-muted-foreground">{workout.description}</p>
      </div>
    </div>
  )
}

// ❌ BAD - Creating from scratch
function WorkoutHeader() {
  return (
    <div className="flex items-center justify-center gap-4">
      <div className="w-10 h-10 rounded-full bg-gray-200">
        <img src="..." className="w-full h-full rounded-full" />
      </div>
      {/* ... custom implementation of existing patterns */}
    </div>
  )
}
```

## 6. STRICT FILE ORGANIZATION

### One Responsibility Per File

- **RULE**: One component per file
- **RULE**: One hook per file
- **RULE**: One utility function per file (unless tightly related)
- **FORBIDDEN**: Index files for re-exports

### Naming Conventions

- **Files**: `kebab-case.tsx`
- **Components**: `PascalCase`
- **Hooks**: `useCamelCase`
- **Utilities**: `camelCase`

## 7. MINIMAL IMPORTS

### Import Rules

- **ALWAYS**: Import only what you need
- **NEVER**: Import entire libraries when partial import works
- **MANDATORY**: Use existing import patterns from codebase
- **FORBIDDEN**: Unused imports

```typescript
// ✅ GOOD
import { Button } from '@/components/ui/button'
import { useWorkout } from '@/hooks/use-workout'

// ❌ BAD
import * as React from 'react'
import { Button, Card, Input, ... } from '@/components/ui' // when only using Button
```

## 8. CODE REDUCTION CHECKLIST

Before writing ANY code, ask:

1. **Does this component/hook/utility already exist?**
2. **Can I compose existing components instead?**
3. **Is there a simpler way using existing patterns?**
4. **Am I duplicating logic that exists elsewhere?**
5. **Can this be a 10-line function instead of 50?**
6. **Do I really need this abstraction or can I use existing ones?**

## 9. MANDATORY CODE REVIEW POINTS

### Before Submitting Code

- [ ] Component is under 200 lines
- [ ] No duplicate logic exists in codebase
- [ ] Used existing UI components where possible
- [ ] Followed existing patterns and conventions
- [ ] No unnecessary abstractions created
- [ ] Imports are minimal and necessary
- [ ] One clear responsibility per file

### RED FLAGS - Stop and Refactor

- Creating custom versions of existing UI components
- Copy-pasting code from other files
- Components over 200 lines
- Complex nested conditionals (extract to functions)
- Multiple concerns in single component
- Custom implementations of existing utilities

## 10. ENFORCEMENT

### AI Assistant Must:

- **ALWAYS** search existing code before creating new code
- **ALWAYS** use existing patterns and components
- **ALWAYS** extract duplicate logic to utilities
- **ALWAYS** keep components under 200 lines
- **NEVER** create custom versions of existing functionality
- **NEVER** ignore existing conventions and patterns

### When in Doubt:

1. Read similar existing components
2. Check for existing utilities/hooks
3. Look for established patterns
4. Choose the minimal viable solution
5. Prefer composition over creation

---

**Remember: The goal is to write the MINIMUM amount of code that accomplishes the task while maintaining readability and following existing patterns.**
