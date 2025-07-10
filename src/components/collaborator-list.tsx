import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  GQLCollaborationPermission,
  GQLGetCollaborationMealPlanTemplatesQuery,
  GQLGetCollaborationTemplatesQuery,
} from '@/generated/graphql-client'
import { getPermissionColor } from '@/lib/collaboration-utils'
import { getDisplayName, getUserInitials } from '@/lib/user-utils'

type Collaborator = {
  id: string
  collaborator: {
    id: string
    firstName?: string | null
    lastName?: string | null
    email: string
  }
  permission: GQLCollaborationPermission
}

interface CollaboratorListProps {
  collaborators: Collaborator[]
  maxVisible?: number
  showPermissions?: boolean
}

export function CollaboratorList({
  collaborators,
  maxVisible = 3,
  showPermissions = false,
}: CollaboratorListProps) {
  if (collaborators.length === 0) {
    return <div className="text-xs text-muted-foreground">No collaborators</div>
  }

  const visibleCollaborators = collaborators.slice(0, maxVisible)
  const remainingCount = collaborators.length - maxVisible

  return (
    <div className="flex flex-col gap-2">
      <div className="text-xs font-medium text-muted-foreground">
        Collaborators ({collaborators.length})
      </div>
      <div className="space-y-2">
        {visibleCollaborators.map((collab) => (
          <div key={collab.id} className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">
                {getUserInitials(collab.collaborator)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">
                {getDisplayName(collab.collaborator)}
              </div>
              {showPermissions && (
                <Badge
                  variant={getPermissionColor(collab.permission)}
                  className="text-xs h-4"
                >
                  {collab.permission.toLowerCase()}
                </Badge>
              )}
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <div className="text-xs text-muted-foreground">
            +{remainingCount} more
          </div>
        )}
      </div>
    </div>
  )
}

// Type-safe wrapper for training plan collaborators
export function TrainingPlanCollaboratorList({
  collaborators,
  maxVisible = 3,
  showPermissions = false,
}: {
  collaborators: GQLGetCollaborationTemplatesQuery['getCollaborationTemplates'][number]['collaborators']
  maxVisible?: number
  showPermissions?: boolean
}) {
  return (
    <CollaboratorList
      collaborators={collaborators}
      maxVisible={maxVisible}
      showPermissions={showPermissions}
    />
  )
}

// Type-safe wrapper for meal plan collaborators
export function MealPlanCollaboratorList({
  collaborators,
  maxVisible = 3,
  showPermissions = false,
}: {
  collaborators: GQLGetCollaborationMealPlanTemplatesQuery['getCollaborationMealPlanTemplates'][number]['collaborators']
  maxVisible?: number
  showPermissions?: boolean
}) {
  return (
    <CollaboratorList
      collaborators={collaborators}
      maxVisible={maxVisible}
      showPermissions={showPermissions}
    />
  )
}
