import { UserAvatar } from '@/components/user-avatar'

import { AvailablePlan } from '../page'

export function PlanAuthor({
  createdBy,
}: {
  createdBy: AvailablePlan['createdBy']
}) {
  return (
    <div className="flex items-center gap-2">
      <UserAvatar
        firstName={createdBy?.firstName ?? ''}
        lastName={createdBy?.lastName ?? ''}
        imageUrl={createdBy?.image ?? ''}
        sex={createdBy?.sex ?? ''}
        withFallbackAvatar
        className="size-8"
      />
      <span className="text-sm text-muted-foreground">
        by {createdBy?.firstName} {createdBy?.lastName}
      </span>
    </div>
  )
}
