# Advanced Data Flow Patterns

Reference for complex scenarios in the Hypertro data flow.

## Nested Entity Mutations

When updating nested entities (e.g., exercises within a training plan), use index-based updates:

```typescript
// Optimistic update for nested data
const optimisticUpdaters = {
  updateExercise: (
    oldData: GQLGetTrainingPlanQuery,
    variables: { input: GQLUpdateExerciseInput },
  ) => {
    if (!oldData?.getTrainingPlanById?.weeks) return oldData

    const exerciseId = variables.input.id
    const newWeeks = [...oldData.getTrainingPlanById.weeks]

    // Find and update nested exercise
    for (const week of newWeeks) {
      for (const day of week.days) {
        const exerciseIndex = day.exercises.findIndex(
          (ex) => ex.id === exerciseId,
        )
        if (exerciseIndex !== -1) {
          day.exercises[exerciseIndex] = {
            ...day.exercises[exerciseIndex],
            ...variables.input,
          }
          break
        }
      }
    }

    return {
      ...oldData,
      getTrainingPlanById: {
        ...oldData.getTrainingPlanById,
        weeks: newWeeks,
      },
    }
  },
}
```

## Temporary ID Management

For create operations, generate temp IDs and replace after server response:

```typescript
import { generateTempId, isTemporaryId } from '@/lib/optimistic-mutations'

// Generate temp ID
const tempId = generateTempId('exercise') // "exercise-1706547200000-0.123"

// Check if ID is temporary
if (isTemporaryId(someId)) {
  // Handle temporary entity differently
}

// Replace temp ID with real ID in onSuccess
const createOptimistic = useOptimisticMutation({
  queryKey,
  mutationFn: createMutation.mutateAsync,
  updateFn: (oldData, variables, tempId) => {
    // Use tempId in optimistic update
    return {
      ...oldData,
      items: [...oldData.items, { id: tempId, ...variables }],
    }
  },
  onSuccess: (result, variables, tempId) => {
    // Replace temp ID with real ID
    if (tempId && result.id) {
      queryClient.setQueryData(queryKey, (old) =>
        replaceTemporaryId(old, tempId, result.id),
      )
    }
  },
})
```

## Debounced Mutations

For rapid user input (typing, sliders), use debounced invalidation:

```typescript
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'

function useEntityMutations(entityId: string) {
  const debouncedInvalidate = useDebouncedInvalidation({
    queryKeys: ['GetEntityById'],
    delay: 1000, // 1 second debounce
  })

  const updateField = async (field: string, value: string) => {
    // Called on every keystroke
    debouncedInvalidate() // Only invalidates once, 1s after last call
    await updateOptimistic.optimisticMutate({ id: entityId, [field]: value })
  }

  return { updateField }
}
```

## Batch Operations

For operations affecting multiple entities:

```typescript
// Factory: Batch update
export async function updateMultipleExercises(
  updates: Array<{ id: string; order: number }>,
  userId: string,
): Promise<void> {
  // Verify access to all exercises first
  const exerciseIds = updates.map((u) => u.id)
  await verifyExercisesAccess(exerciseIds, userId)

  // Use transaction for atomicity
  await prisma.$transaction(
    updates.map((update) =>
      prisma.exercise.update({
        where: { id: update.id },
        data: { order: update.order },
      }),
    ),
  )
}

// Optimistic update for batch
const reorderOptimistic = useOptimisticMutation({
  queryKey,
  mutationFn: reorderMutation.mutateAsync,
  updateFn: (oldData, variables) => {
    if (!oldData?.exercises) return oldData

    const reorderedExercises = oldData.exercises
      .map((ex) => {
        const update = variables.updates.find((u) => u.id === ex.id)
        return update ? { ...ex, order: update.order } : ex
      })
      .sort((a, b) => a.order - b.order)

    return { ...oldData, exercises: reorderedExercises }
  },
})
```

## Cross-Entity Operations

When mutations affect multiple entities (e.g., assigning plan creates notification):

```typescript
// Factory: Cross-entity operation
export async function assignTrainingPlanToClient(
  planId: string,
  clientId: string,
  trainerId: string,
): Promise<AssignedPlan> {
  // 1. Verify access
  await ensureTrainerClientAccess(trainerId, clientId)

  // 2. Create assignment
  const assignment = await prisma.clientTrainingPlan.create({
    data: { trainingPlanId: planId, clientId, assignedById: trainerId },
    include: { trainingPlan: true },
  })

  // 3. Create notification (cross-entity)
  await createNotification({
    userId: clientId,
    type: GQLNotificationType.TrainingPlanAssigned,
    title: `New training plan assigned: ${assignment.trainingPlan.title}`,
    data: { planId, assignmentId: assignment.id },
  })

  // 4. Complete service task (if applicable)
  await completeTaskByAction('TRAINING_PLAN_ASSIGNED', clientId)

  return assignment
}
```

## Error Handling Patterns

```typescript
// Factory: Structured error handling
export async function updateMeal(
  mealId: string,
  input: GQLUpdateMealInput,
  userId: string,
) {
  // Validation errors (user can fix)
  if (!input.name?.trim()) {
    throw new GraphQLError('Meal name is required', {
      extensions: { code: 'VALIDATION_ERROR', field: 'name' },
    })
  }

  // Access errors (forbidden)
  const canModify = await canModifyMeal(mealId, userId)
  if (!canModify) {
    throw new GraphQLError('Access denied', {
      extensions: { code: 'FORBIDDEN' },
    })
  }

  // Business rule errors
  const usageCount = await prisma.nutritionPlanMeal.count({ where: { mealId } })
  if (usageCount > 0) {
    throw new GraphQLError(
      'Cannot edit meal used in nutrition plans. Duplicate it first.',
      { extensions: { code: 'BUSINESS_RULE_VIOLATION' } },
    )
  }

  return await prisma.meal.update({ where: { id: mealId }, data: input })
}
```

## Premium Feature Guards

```typescript
// Factory: Premium check pattern
import { checkPremiumAccess } from '@/server/models/subscription/factory'

export async function createAdvancedAnalytics(
  input: GQLCreateAnalyticsInput,
  context: GQLContext,
) {
  const hasPremium = await checkPremiumAccess(context)

  if (!hasPremium) {
    throw new GraphQLError(
      'Premium subscription required for advanced analytics',
      {
        extensions: {
          code: 'PREMIUM_REQUIRED',
          feature: 'advanced_analytics',
        },
      },
    )
  }

  return await prisma.analytics.create({ data: input })
}
```

## Trainer-Client Access Control

```typescript
import { ensureTrainerClientAccess } from '@/lib/access-control'

// Factory: Verify trainer can access client data
export async function getClientWorkouts(clientId: string, trainerId: string) {
  // Returns authorized trainer IDs (includes team members)
  const authorizedTrainerIds = await ensureTrainerClientAccess(
    trainerId,
    clientId,
    { returnTrainerIds: true },
  )

  // Use in query if needed
  return await prisma.workout.findMany({
    where: {
      clientId,
      // Optionally filter by authorized trainers
      createdById: { in: authorizedTrainerIds },
    },
  })
}
```

## Complex Query Patterns

```typescript
// Factory: Complex query with filters
export async function getTeamMeals(
  trainerId: string,
  options: {
    searchQuery?: string
    sortBy?: 'NAME' | 'USAGE_COUNT' | 'CREATED_AT'
    includeArchived?: boolean
  },
) {
  const teamId = await getTrainerTeamId(trainerId)

  const where: Prisma.MealWhereInput = {
    teamId,
    ...(options.includeArchived ? {} : { archived: false }),
    ...(options.searchQuery && {
      name: { contains: options.searchQuery, mode: 'insensitive' },
    }),
  }

  const orderBy: Prisma.MealOrderByWithRelationInput =
    options.sortBy === 'NAME'
      ? { name: 'asc' }
      : options.sortBy === 'USAGE_COUNT'
        ? { planMeals: { _count: 'desc' } }
        : { createdAt: 'desc' }

  return await prisma.meal.findMany({
    where,
    orderBy,
    include: {
      createdBy: { include: { profile: true } },
      ingredients: { orderBy: { orderIndex: 'asc' } },
      _count: { select: { planMeals: true } },
    },
  })
}
```

## Testing Optimistic Updates

Manual testing checklist:

1. **Instant feedback**: UI updates immediately (no loading state)
2. **Server sync**: After ~1s, data matches server
3. **Error rollback**: On server error, UI reverts to previous state
4. **Temp ID handling**: New items work correctly before server response
5. **Multiple rapid updates**: Last update wins, no race conditions
