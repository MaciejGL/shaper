# File Structure & Organization

## Directory Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Route groups
│   ├── api/               # API routes
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   └── [feature]/        # Feature-specific components (grouped correctly)
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
├── types/                # Global TypeScript types (NO "any" types)
└── utils/                # Helper functions
```

## File Naming & Structure

- **Pages**: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`
- **Components**: `component-name.tsx` with co-located files:
  - `component-name.tsx` (main component - split if too large)
  - `types.ts` (component-specific types - NEVER use "any")
  - `utils.ts` (component-specific utilities)
  - `component-name.test.tsx` (tests)
- **Feature folders**: Group related components, hooks, and utilities together
- **Component splitting**: Break large components (>100 lines) into smaller, focused ones
- **Index files**: Use `index.ts` for clean imports and exports

## Component Organization & Splitting

```typescript
// ✅ Good - Properly grouped feature folder
// components/workout/
├── index.ts                    // Export barrel
├── workout-dashboard.tsx       // Main component (split if large)
├── workout-header.tsx          // Split component
├── workout-stats.tsx           // Split component
├── workout-actions.tsx         // Split component
├── types.ts                    // Strict TypeScript types
├── utils.ts                    // Helper functions
├── hooks.ts                    // Component hooks
└── workout-dashboard.test.tsx  // Tests

// ❌ Bad - Monolithic component
├── workout-dashboard.tsx       // 300+ lines - should be split
```

## TypeScript Strictness Rules

```typescript
// ✅ Good - Proper types in types.ts
export interface WorkoutProps {
  id: string
  name: string
  exercises: Exercise[]
  onComplete: (workoutId: string) => void
}

export type WorkoutStatus = 'pending' | 'active' | 'completed'

// ❌ NEVER use "any" type
export interface BadWorkoutProps {
  data: any // FORBIDDEN
  callback: any // FORBIDDEN
}

// ✅ Use proper types instead
export interface GoodWorkoutProps {
  data: WorkoutData
  callback: (result: WorkoutResult) => void
}
```

## Import Organization

```typescript
// 1. External libraries
import { NextPage } from 'next'
import React from 'react'

// 3. Components (UI first, then feature)
import { Button } from '@/components/ui/button'
import { WorkoutCard } from '@/components/workout'
// 2. Internal utilities/types (with proper TypeScript)
import { cn } from '@/lib/utils'
import type { User, WorkoutData } from '@/types'

import type { WorkoutProps } from './types'
// 4. Relative imports (with strict types)
import { validateWorkout } from './utils'
```

## Component Splitting Guidelines

- Split components when they exceed 100 lines
- Each component should have a single responsibility
- Extract reusable logic into custom hooks
- Create sub-components for complex UI sections
- Use proper TypeScript interfaces for all props
- Group related components in feature folders

## File Templates

- Always include proper TypeScript types (never "any")
- Export components as default, utilities as named exports
- Use consistent file headers and documentation
- Include error boundaries for page-level components
- Implement proper prop validation with TypeScript
