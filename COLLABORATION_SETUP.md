# Collaboration System Setup Guide

## Overview

The collaboration system allows trainers to work together on training plans and meal plans. It's implemented with:

1. **Two-tier collaboration model**: Trainers first establish collaboration relationships via invitations
2. **Plan-specific access**: Once connected, trainers can add each other as collaborators to specific plans
3. **Permission-based access**: Collaborators can have VIEW, EDIT, or ADMIN permissions
4. **Real-time notifications**: Users receive notifications for invitations and collaboration changes

## Database Schema

### CollaborationInvitation

- Tracks invitations between trainers
- Status: PENDING, ACCEPTED, REJECTED
- Creates foundation for collaboration relationships

### TrainingPlanCollaborator

- Links collaborators to specific training plans
- Includes permission levels (VIEW, EDIT, ADMIN)
- Tracks who added the collaborator

### MealPlanCollaborator

- Links collaborators to specific meal plans
- Same structure as training plan collaborators

## Setup Instructions

### 1. Run Database Migration

**Option A: Using Prisma CLI (if WebAssembly issue is resolved)**

```bash
npx prisma migrate dev --name add_collaboration_system
```

**Option B: Manual SQL execution (if WebAssembly issue persists)**

```bash
# Connect to your database and run the migration SQL from:
# prisma/migrations/20250709223447_add_collaboration_system/migration.sql
```

### 2. Regenerate GraphQL Types

After the migration, regenerate the GraphQL types:

```bash
# This will update the generated GraphQL types to include collaboration schemas
npm run codegen
# or
yarn codegen
```

### 3. Register Resolvers

Add the collaboration resolvers to your GraphQL schema by updating `src/api/graphql/schema.ts`:

```typescript
// Import the resolvers
import {
  Mutation as CollaborationInvitationMutation,
  Query as CollaborationInvitationQuery,
} from '@/server/models/collaboration-invitation/resolvers'
import {
  Mutation as MealPlanCollaboratorMutation,
  Query as MealPlanCollaboratorQuery,
} from '@/server/models/meal-plan-collaborator/resolvers'
import {
  Mutation as TrainingPlanCollaboratorMutation,
  Query as TrainingPlanCollaboratorQuery,
} from '@/server/models/training-plan-collaborator/resolvers'

// Add to your resolvers object
const resolvers = {
  Query: {
    // ... existing queries
    ...CollaborationInvitationQuery,
    ...TrainingPlanCollaboratorQuery,
    ...MealPlanCollaboratorQuery,
  },
  Mutation: {
    // ... existing mutations
    ...CollaborationInvitationMutation,
    ...TrainingPlanCollaboratorMutation,
    ...MealPlanCollaboratorMutation,
  },
}
```

## API Usage

### Collaboration Invitations

**Send Invitation**

```graphql
mutation SendCollaborationInvitation(
  $input: SendCollaborationInvitationInput!
) {
  sendCollaborationInvitation(input: $input) {
    id
    sender {
      id
      name
      email
    }
    recipient {
      id
      name
      email
    }
    status
    message
    createdAt
  }
}
```

**Respond to Invitation**

```graphql
mutation RespondToCollaborationInvitation(
  $input: RespondToCollaborationInvitationInput!
) {
  respondToCollaborationInvitation(input: $input) {
    id
    status
    sender {
      id
      name
      email
    }
    recipient {
      id
      name
      email
    }
  }
}
```

**Get My Invitations**

```graphql
query MyCollaborationInvitations {
  myCollaborationInvitations {
    id
    sender {
      id
      name
      email
    }
    status
    message
    createdAt
  }
}
```

### Training Plan Collaboration

**Add Collaborator**

```graphql
mutation AddTrainingPlanCollaborator(
  $input: AddTrainingPlanCollaboratorInput!
) {
  addTrainingPlanCollaborator(input: $input) {
    id
    collaborator {
      id
      name
      email
    }
    permission
    trainingPlan {
      id
      title
    }
  }
}
```

**Update Permissions**

```graphql
mutation UpdateTrainingPlanCollaboratorPermission(
  $input: UpdateTrainingPlanCollaboratorPermissionInput!
) {
  updateTrainingPlanCollaboratorPermission(input: $input) {
    id
    permission
    collaborator {
      id
      name
      email
    }
  }
}
```

**Get Plan Collaborators**

```graphql
query TrainingPlanCollaborators($trainingPlanId: ID!) {
  trainingPlanCollaborators(trainingPlanId: $trainingPlanId) {
    id
    collaborator {
      id
      name
      email
    }
    permission
    addedBy {
      id
      name
      email
    }
    createdAt
  }
}
```

### Meal Plan Collaboration

Similar structure to training plan collaboration:

**Add Collaborator**

```graphql
mutation AddMealPlanCollaborator($input: AddMealPlanCollaboratorInput!) {
  addMealPlanCollaborator(input: $input) {
    id
    collaborator {
      id
      name
      email
    }
    permission
    mealPlan {
      id
      title
    }
  }
}
```

## Permission System

### Permission Levels

- **VIEW**: Can view the plan and its details
- **EDIT**: Can modify exercises, meals, and plan content
- **ADMIN**: Can manage collaborators and plan settings

### Permission Checks

The system automatically enforces permissions:

1. **Plan Creator**: Full access to all operations
2. **ADMIN Collaborators**: Can manage other collaborators
3. **EDIT Collaborators**: Can modify plan content
4. **VIEW Collaborators**: Read-only access

### Privacy & User Information

All collaboration endpoints return `UserPublic` objects instead of full `User` objects to protect user privacy. `UserPublic` includes:

- `id`, `name`, `email`, `image`, `role`
- `createdAt`, `updatedAt`
- `profile` information

This ensures collaborators only see necessary information about each other.

### Performance Optimization

The system prevents N+1 query problems by:

1. **DataLoaders**: All user relations use `context.loaders.user.userById` for batching and caching
2. **Plan Loaders**: New `trainingPlanById` and `mealPlanById` loaders batch plan queries
3. **Eager Loading**: Resolvers include all necessary relations in initial queries
4. **Fallback Strategy**: Models gracefully fall back to loaders when data isn't pre-loaded

This ensures efficient database usage even with complex nested GraphQL queries.

## Notification Types

The system creates notifications for:

- `COLLABORATION_INVITATION`: When someone sends you an invitation
- `COLLABORATION_RESPONSE`: When someone responds to your invitation
- `TRAINING_PLAN_COLLABORATION`: When added as training plan collaborator
- `TRAINING_PLAN_COLLABORATION_REMOVED`: When removed as training plan collaborator
- `MEAL_PLAN_COLLABORATION`: When added as meal plan collaborator
- `MEAL_PLAN_COLLABORATION_REMOVED`: When removed as meal plan collaborator

## Security Features

1. **Trainer-only collaboration**: Only trainers can collaborate with each other
2. **Invitation-based access**: Must have accepted collaboration invitation before plan access
3. **Permission-based operations**: All operations check user permissions
4. **Owner protection**: Plan creators always retain full access
5. **Unique constraints**: Prevents duplicate collaborations on same plan

## Next Steps

After completing the setup:

1. **Test the migration**: Verify all tables are created correctly
2. **Test GraphQL queries**: Run sample queries to ensure resolvers work
3. **Create UI components**: Build frontend components for collaboration features
4. **Add permission checks**: Update existing plan mutations to respect collaborator permissions
5. **Set up notifications**: Ensure notification system handles collaboration events

## File Structure

```
src/server/models/
├── collaboration-invitation/
│   ├── schema.graphql
│   └── resolvers.ts
├── training-plan-collaborator/
│   ├── schema.graphql
│   └── resolvers.ts
└── meal-plan-collaborator/
    ├── schema.graphql
    └── resolvers.ts
```

## Troubleshooting

### Common Issues

1. **WebAssembly Error**: If you get WebAssembly errors with Prisma, run the migration SQL manually
2. **Type Errors**: Make sure to regenerate GraphQL types after migration
3. **Permission Errors**: Verify user has accepted collaboration invitation before adding to plans

### Verification Steps

1. Check database tables exist: `CollaborationInvitation`, `TrainingPlanCollaborator`, `MealPlanCollaborator`
2. Verify GraphQL schema includes collaboration types
3. Test basic invitation flow between two trainers
4. Test adding collaborator to training plan
5. Test permission enforcement
