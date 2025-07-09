# Collaboration Permissions Utility

This utility provides centralized permission checking for collaboration features in training plans and meal plans.

## Features

- **Permission Checking**: Check if users have specific permissions (VIEW, EDIT, MANAGE_COLLABORATORS, etc.)
- **Batch Operations**: Check permissions for multiple plans at once
- **Creator Detection**: Automatically detect plan creators who have full permissions
- **Public Plan Support**: Handle public plans that can be viewed by anyone
- **Error Handling**: Consistent error messages and handling

## Usage

### Basic Permission Check

```typescript
import {
  CollaborationAction,
  createCollaborationPermissions,
  throwPermissionError,
} from '@/lib/permissions/collaboration-permissions'

// In a GraphQL resolver
const permissions = createCollaborationPermissions(context)

// Check if user can edit a training plan
const permissionCheck = await permissions.checkTrainingPlanPermission(
  user.user.id,
  trainingPlanId,
  CollaborationAction.EDIT,
)

// Throw error if permission denied
throwPermissionError(permissionCheck, 'update training plan')

// Continue with mutation logic...
```

### Available Actions

- `CollaborationAction.VIEW` - Read access to the plan
- `CollaborationAction.EDIT` - Modify plan content (exercises, sets, etc.)
- `CollaborationAction.DELETE` - Delete the plan (only creators)
- `CollaborationAction.MANAGE_COLLABORATORS` - Add/remove collaborators (ADMIN permission required)
- `CollaborationAction.SHARE` - Share the plan (EDIT or ADMIN permission required)

### Permission Levels

- **CREATOR**: Full access to everything (always allowed)
- **ADMIN**: Can manage collaborators + all EDIT permissions
- **EDIT**: Can modify plan content + all VIEW permissions
- **VIEW**: Can only read the plan

### Examples

#### 1. Training Plan Mutation

```typescript
// src/server/models/training-plan/resolvers.ts
export const Mutation: GQLMutationResolvers<GQLContext> = {
  updateTrainingPlanDetails: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const permissions = createCollaborationPermissions(context)
    const permissionCheck = await permissions.checkTrainingPlanPermission(
      user.user.id,
      input.id,
      CollaborationAction.EDIT,
    )

    throwPermissionError(permissionCheck, 'update training plan details')

    // Continue with existing mutation logic...
  },
}
```

#### 2. Exercise Mutation (requires plan lookup)

```typescript
// When the mutation works with exercises, you need to find the plan ID first
export const Mutation: GQLMutationResolvers<GQLContext> = {
  addExerciseToDay: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // First get the training plan ID from the day
    const day = await prisma.trainingDay.findUnique({
      where: { id: input.dayId },
      include: { week: { include: { trainingPlan: true } } },
    })

    if (!day) {
      throw new Error('Day not found')
    }

    const permissions = createCollaborationPermissions(context)
    const permissionCheck = await permissions.checkTrainingPlanPermission(
      user.user.id,
      day.week.trainingPlan.id,
      CollaborationAction.EDIT,
    )

    throwPermissionError(permissionCheck, 'add exercise to day')

    // Continue with existing mutation logic...
  },
}
```

#### 3. Collaborator Management

```typescript
export const Mutation: GQLMutationResolvers<GQLContext> = {
  addTrainingPlanCollaborator: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const permissions = createCollaborationPermissions(context)

    // Check if user can manage collaborators
    const permissionCheck = await permissions.checkTrainingPlanPermission(
      user.user.id,
      input.trainingPlanId,
      CollaborationAction.MANAGE_COLLABORATORS,
    )
    throwPermissionError(permissionCheck, 'manage training plan collaborators')

    // Check if user has existing collaboration with the person being added
    const invitationCheck = await permissions.canInviteCollaborators(
      user.user.id,
      input.collaboratorId,
    )
    throwPermissionError(invitationCheck, 'invite collaborator')

    // Continue with existing mutation logic...
  },
}
```

#### 4. Batch Permission Checking

```typescript
// For list queries where you need to filter by permissions
export const Query: GQLQueryResolvers<GQLContext> = {
  myTrainingPlans: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Get all potential plans
    const allPlans = await prisma.trainingPlan.findMany({
      where: {
        OR: [
          { createdById: user.user.id },
          { collaborators: { some: { collaboratorId: user.user.id } } },
        ],
      },
    })

    const planIds = allPlans.map((p) => p.id)
    const permissions = createCollaborationPermissions(context)

    // Check VIEW permission for all plans at once
    const permissionResults =
      await permissions.batchCheckTrainingPlanPermissions(
        user.user.id,
        planIds,
        CollaborationAction.VIEW,
      )

    // Filter to only plans the user can view
    const allowedPlans = allPlans.filter(
      (plan) => permissionResults[plan.id].hasPermission,
    )

    return allowedPlans.map((plan) => new TrainingPlan(plan, context))
  },
}
```

#### 5. Getting User Permission Level

```typescript
// For conditional UI logic
export const Query: GQLQueryResolvers<GQLContext> = {
  trainingPlanPermissions: async (_, { id }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const permissions = createCollaborationPermissions(context)
    const userPermission = await permissions.getUserTrainingPlanPermission(
      user.user.id,
      id,
    )

    return {
      canView: userPermission.permission !== 'NONE',
      canEdit: ['CREATOR', 'ADMIN', 'EDIT'].includes(userPermission.permission),
      canManageCollaborators: ['CREATOR', 'ADMIN'].includes(
        userPermission.permission,
      ),
      canDelete: userPermission.isCreator,
      isCreator: userPermission.isCreator,
      permissionLevel: userPermission.permission,
    }
  },
}
```

### Meal Plan Usage

The utility works identically for meal plans:

```typescript
// Replace checkTrainingPlanPermission with checkMealPlanPermission
const permissionCheck = await permissions.checkMealPlanPermission(
  user.user.id,
  mealPlanId,
  CollaborationAction.EDIT,
)

// Batch checking for meal plans
const permissionResults = await permissions.batchCheckMealPlanPermissions(
  user.user.id,
  mealPlanIds,
  CollaborationAction.VIEW,
)

// Get user permission level for meal plan
const userPermission = await permissions.getUserMealPlanPermission(
  user.user.id,
  mealPlanId,
)
```

## Integration Steps

1. **Import the utility** in your resolver files
2. **Create permissions instance** using `createCollaborationPermissions(context)`
3. **Check permissions** before performing operations
4. **Use `throwPermissionError`** for consistent error handling
5. **For complex operations**, use batch checking or permission level queries

## Error Handling

The utility provides consistent error messages:

- `"Permission denied: Not a collaborator for action: edit"`
- `"Permission denied: Insufficient permission: VIEW for action: edit"`
- `"Permission denied: No accepted collaboration between users for action: invite collaborator"`

## Performance Considerations

- Use **batch checking** when checking permissions for multiple plans
- The utility includes **database query optimization** and only loads necessary data
- **Cache permission results** if checking the same permission multiple times in a request
- Use **permission level queries** when you need to determine multiple permission types at once
