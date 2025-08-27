import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
      <Avatar>
        <AvatarImage src={createdBy?.image ?? ''} />
        <AvatarFallback className={cn('text-xs')}>
          {createdBy?.firstName?.charAt(0)}
          {createdBy?.lastName?.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span
        className={cn(
          'text-xs text-muted-foreground',
          size === 'sm' && 'text-xs',
          size === 'md' && 'text-xs',
          size === 'lg' && 'text-xs',
        )}
      >
        by {createdBy?.firstName} {createdBy?.lastName}
      </span>
    </div>
  )
}
