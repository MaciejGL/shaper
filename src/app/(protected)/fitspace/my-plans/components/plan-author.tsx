import { UserAvatar } from '@/components/user-avatar'
import { cn } from '@/lib/utils'

import { AvailablePlan } from '../types'

export function PlanAuthor({
  createdBy,
  size = 'sm',
}: {
  createdBy: AvailablePlan['createdBy']
  size?: 'sm' | 'md' | 'lg'
}) {
  return (
    <div className="flex items-center gap-2">
      <UserAvatar
        firstName={createdBy?.firstName ?? ''}
        lastName={createdBy?.lastName ?? ''}
        imageUrl={createdBy?.image ?? ''}
        sex={createdBy?.sex ?? ''}
        withFallbackAvatar
        className={cn(
          'size-8',
          size === 'sm' && 'size-4',
          size === 'md' && 'size-6',
          size === 'lg' && 'size-8',
        )}
      />
      <span className="text-sm text-muted-foreground">
        by {createdBy?.firstName} {createdBy?.lastName}
      </span>
    </div>
  )
}
