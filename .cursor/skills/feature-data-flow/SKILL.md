---
name: feature-data-flow
description: Build features with proper data flow architecture - optimistic mutations, GraphQL hooks, resolvers, factories, and secure business logic. Use when creating new features, adding mutations, building CRUD operations, or implementing frontend-to-database data flow.
---

# Feature Data Flow Architecture

This skill guides building features with the Hypertro data flow pattern:

```
Component → Optimistic Hook → Generated GQL Hook → Resolver → Factory → Prisma
    ↓              ↓                                              ↓
 Instant UI    Rollback on error                            Business Logic
```

## Quick Reference

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Optimistic Hook | `src/hooks/use-[feature]-mutations.ts` | Immediate UI, rollback |
| GQL Schema | `src/server/models/[entity]/schema.graphql` | Type definitions |
| Resolver | `src/server/models/[entity]/resolvers.ts` | Auth + delegation |
| Factory | `src/server/models/[entity]/factory.ts` | Business logic |
| Model | `src/server/models/[entity]/model.ts` | Prisma → GQL mapping |

---

## 1. GraphQL Schema (First Step)

Create/update schema in `src/server/models/[entity]/schema.graphql`:

```graphql
type Meal {
  id: ID!
  name: String!
  description: String
  ingredients: [MealIngredient!]!
  createdBy: UserPublic
  createdAt: String!
}

input CreateMealInput {
  name: String!
  description: String
}

input UpdateMealInput {
  name: String
  description: String
}

extend type Query {
  meal(id: ID!): Meal
  teamMeals(searchQuery: String): [Meal!]!
}

extend type Mutation {
  createMeal(input: CreateMealInput!): Meal!
  updateMeal(id: ID!, input: UpdateMealInput!): Meal!
  deleteMeal(id: ID!): Boolean!
}
```

After schema changes, run: `npm run codegen`

---

## 2. Resolver (Thin Layer)

Resolvers ONLY handle: auth check → delegate to factory → wrap in model.

```typescript
// src/server/models/[entity]/resolvers.ts
import { GQLUserRole } from '@/generated/graphql-client'
import { GQLMutationResolvers, GQLQueryResolvers } from '@/generated/graphql-server'
import { requireAuth } from '@/lib/getUser'
import { GQLContext } from '@/types/gql-context'

import { createMeal, getMealById, updateMeal, deleteMeal } from './factory'
import Meal from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  meal: async (_, { id }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const meal = await getMealById(id, user.user.id)
    return new Meal(meal, context)
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createMeal: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const meal = await createMeal(input, user.user.id)
    return new Meal(meal, context)
  },

  updateMeal: async (_, { id, input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    const meal = await updateMeal(id, input, user.user.id)
    return new Meal(meal, context)
  },

  deleteMeal: async (_, { id }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)
    return await deleteMeal(id, user.user.id)
  },
}
```

**Key Rules:**
- Always call `requireAuth(role, context.user)` first
- Delegate ALL logic to factory functions
- Return Model instances (not raw Prisma data)
- Keep resolvers < 50 lines total

---

## 3. Factory (Business Logic)

Factories contain ALL business logic, validation, and database operations.

```typescript
// src/server/models/[entity]/factory.ts
import { GraphQLError } from 'graphql'
import { GQLCreateMealInput, GQLUpdateMealInput } from '@/generated/graphql-server'
import { Meal as PrismaMeal } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'

// Validation helper
function validateMealInput(input: GQLCreateMealInput): void {
  if (!input.name?.trim()) {
    throw new GraphQLError('Meal name is required')
  }
  if (input.name.length > 100) {
    throw new GraphQLError('Meal name must be 100 characters or less')
  }
}

// Access control helper
async function verifyMealAccess(mealId: string, userId: string): Promise<PrismaMeal> {
  const meal = await prisma.meal.findUnique({
    where: { id: mealId },
    include: { team: true },
  })

  if (!meal) {
    throw new GraphQLError('Meal not found')
  }

  // Verify user belongs to same team
  const userTeam = await prisma.teamMember.findFirst({
    where: { userId, teamId: meal.teamId },
  })

  if (!userTeam) {
    throw new GraphQLError('Access denied')
  }

  return meal
}

export async function getMealById(mealId: string, userId: string) {
  await verifyMealAccess(mealId, userId)

  return await prisma.meal.findUniqueOrThrow({
    where: { id: mealId },
    include: {
      createdBy: { include: { profile: true } },
      ingredients: { orderBy: { orderIndex: 'asc' } },
    },
  })
}

export async function createMeal(input: GQLCreateMealInput, userId: string) {
  validateMealInput(input)

  // Get user's team
  const teamMember = await prisma.teamMember.findFirstOrThrow({
    where: { userId },
    select: { teamId: true },
  })

  // Check for duplicate name
  const existing = await prisma.meal.findFirst({
    where: { name: input.name, teamId: teamMember.teamId },
  })
  if (existing) {
    throw new GraphQLError('A meal with this name already exists')
  }

  return await prisma.meal.create({
    data: {
      name: input.name,
      description: input.description,
      createdById: userId,
      teamId: teamMember.teamId,
    },
    include: {
      createdBy: { include: { profile: true } },
      ingredients: { orderBy: { orderIndex: 'asc' } },
    },
  })
}

export async function updateMeal(
  mealId: string,
  input: GQLUpdateMealInput,
  userId: string,
) {
  await verifyMealAccess(mealId, userId)

  return await prisma.meal.update({
    where: { id: mealId },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.description !== undefined && { description: input.description }),
    },
    include: {
      createdBy: { include: { profile: true } },
      ingredients: { orderBy: { orderIndex: 'asc' } },
    },
  })
}

export async function deleteMeal(mealId: string, userId: string): Promise<boolean> {
  await verifyMealAccess(mealId, userId)

  await prisma.meal.delete({ where: { id: mealId } })
  return true
}
```

**Factory Rules:**
- ALL validation here (not in resolvers)
- ALL access control checks here
- Throw `GraphQLError` for user-facing errors
- Always include necessary relations in queries
- Keep functions focused (< 50 lines each)

---

## 4. Model (Prisma → GraphQL)

Models map Prisma types to GraphQL types with computed properties.

```typescript
// src/server/models/[entity]/model.ts
import { GQLMeal } from '@/generated/graphql-server'
import { Meal as PrismaMeal, User as PrismaUser } from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'
import UserPublic from '../user-public/model'

export default class Meal implements GQLMeal {
  constructor(
    protected data: PrismaMeal & {
      createdBy?: PrismaUser | null
      ingredients?: Array<{ /* ... */ }>
    },
    protected context: GQLContext,
  ) {}

  get id() { return this.data.id }
  get name() { return this.data.name }
  get description() { return this.data.description || null }
  get createdAt() { return this.data.createdAt.toISOString() }

  get createdBy() {
    return this.data.createdBy
      ? new UserPublic(this.data.createdBy, this.context)
      : null
  }

  // Computed property
  get totalCalories(): number {
    return this.data.ingredients?.reduce(
      (sum, ing) => sum + ing.ingredient.caloriesPer100g * (ing.grams / 100),
      0
    ) ?? 0
  }
}
```

---

## 5. Optimistic Mutations (Frontend)

Create custom hooks with optimistic updates for instant UI feedback.

```typescript
// src/hooks/use-meal-mutations.ts
import { useQueryClient } from '@tanstack/react-query'
import {
  GQLGetTeamMealsQuery,
  GQLCreateMealInput,
  useCreateMealMutation,
  useUpdateMealMutation,
  useDeleteMealMutation,
  useGetTeamMealsQuery,
} from '@/generated/graphql-client'
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'
import { generateTempId, useOptimisticMutation } from '@/lib/optimistic-mutations'

export function useMealMutations() {
  const queryClient = useQueryClient()
  const queryKey = useGetTeamMealsQuery.getKey({})

  const debouncedInvalidate = useDebouncedInvalidation({
    queryKeys: ['GetTeamMeals'],
    delay: 1000,
  })

  // Create mutation with optimistic update
  const createMutation = useCreateMealMutation()
  const createOptimistic = useOptimisticMutation({
    queryKey,
    mutationFn: createMutation.mutateAsync,
    updateFn: (
      oldData: GQLGetTeamMealsQuery,
      variables: { input: GQLCreateMealInput },
      tempId?: string,
    ) => {
      if (!oldData?.teamMeals) return oldData

      const newMeal = {
        id: tempId || generateTempId('meal'),
        name: variables.input.name,
        description: variables.input.description || null,
        createdAt: new Date().toISOString(),
        ingredients: [],
      }

      return {
        ...oldData,
        teamMeals: [newMeal, ...oldData.teamMeals],
      }
    },
  })

  // Delete mutation with optimistic update
  const deleteMutation = useDeleteMealMutation()
  const deleteOptimistic = useOptimisticMutation({
    queryKey,
    mutationFn: deleteMutation.mutateAsync,
    updateFn: (oldData: GQLGetTeamMealsQuery, variables: { id: string }) => {
      if (!oldData?.teamMeals) return oldData

      return {
        ...oldData,
        teamMeals: oldData.teamMeals.filter((m) => m.id !== variables.id),
      }
    },
  })

  // Public API
  const createMeal = async (input: GQLCreateMealInput) => {
    debouncedInvalidate()
    return createOptimistic.optimisticMutate({ input })
  }

  const deleteMeal = async (id: string) => {
    debouncedInvalidate()
    return deleteOptimistic.optimisticMutate({ id })
  }

  return { createMeal, deleteMeal }
}
```

**Optimistic Update Rules:**
- Always use `useOptimisticMutation` for mutations affecting visible data
- Use `generateTempId()` for new entities
- Call `debouncedInvalidate()` before mutations
- `updateFn` must return new state immutably
- Rollback happens automatically on error

---

## 6. Component Usage

```typescript
// components/meal-list/meal-list.tsx
'use client'

import { useGetTeamMealsQuery } from '@/generated/graphql-client'
import { useMealMutations } from '@/hooks/use-meal-mutations'

export function MealList() {
  const { data, isLoading } = useGetTeamMealsQuery({})
  const { createMeal, deleteMeal } = useMealMutations()

  const handleCreate = async () => {
    await createMeal({ name: 'New Meal' })
    // UI updates instantly via optimistic update
  }

  const handleDelete = async (id: string) => {
    await deleteMeal(id)
    // Item removed from UI instantly
  }

  if (isLoading) return <Skeleton />

  return (
    <div>
      <Button onClick={handleCreate}>Add Meal</Button>
      {data?.teamMeals.map((meal) => (
        <MealCard
          key={meal.id}
          meal={meal}
          onDelete={() => handleDelete(meal.id)}
        />
      ))}
    </div>
  )
}
```

---

## Security Checklist

Every feature MUST implement:

- [ ] `requireAuth(role, context.user)` in resolver
- [ ] Resource ownership/access check in factory
- [ ] Input validation in factory
- [ ] No sensitive data in error messages
- [ ] Premium feature checks (if applicable)

```typescript
// Access control patterns
import { requireAuth } from '@/lib/getUser'
import { ensureTrainerClientAccess } from '@/lib/access-control'
import { checkPremiumAccess } from '@/server/models/subscription/factory'

// 1. Role check (in resolver)
const user = requireAuth(GQLUserRole.Trainer, context.user)

// 2. Resource access (in factory)
await ensureTrainerClientAccess(trainerId, clientId)

// 3. Premium check (in factory)
const hasPremium = await checkPremiumAccess(context)
if (!hasPremium) throw new GraphQLError('Premium required')
```

---

## File Checklist for New Feature

1. [ ] `src/server/models/[entity]/schema.graphql` - Types & operations
2. [ ] Run `npm run codegen` - Generate types
3. [ ] `src/server/models/[entity]/model.ts` - Prisma → GQL mapping
4. [ ] `src/server/models/[entity]/factory.ts` - Business logic
5. [ ] `src/server/models/[entity]/resolvers.ts` - Auth + delegation
6. [ ] `src/hooks/use-[entity]-mutations.ts` - Optimistic hooks
7. [ ] Test optimistic updates work (instant UI, rollback on error)

---

## Anti-Patterns to Avoid

| Don't | Do Instead |
|-------|------------|
| Business logic in resolvers | Put in factory |
| Direct `prisma` in resolvers | Call factory functions |
| Skip auth check | Always `requireAuth()` |
| Return raw Prisma data | Return Model instances |
| Manual cache invalidation | Use `useDebouncedInvalidation` |
| Skip optimistic updates | Always use `useOptimisticMutation` |
| `any` types | Use `GQL*` generated types |
| Hardcode query keys | Use `.getKey()` methods |
