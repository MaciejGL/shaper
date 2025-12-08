'use client'

import { ChevronRight, User } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { useTrainerServiceAccess } from '@/hooks/use-trainer-service-access'
import { cn } from '@/lib/utils'

interface CreatorSectionProps {
  creator: {
    id: string
    firstName?: string | null
    lastName?: string | null
    image?: string | null
  } | null
  onClick?: () => void
}

export function CreatorSection({ creator, onClick }: CreatorSectionProps) {
  const { isTrainerServiceEnabled } = useTrainerServiceAccess()

  if (!creator) return null

  const creatorName =
    `${creator.firstName || ''} ${creator.lastName || ''}`.trim() ||
    'Unknown Creator'

  const initials =
    (creator.firstName?.charAt(0) || '') + (creator.lastName?.charAt(0) || '')

  // Disable click when trainer service is not enabled
  const isClickable = onClick && isTrainerServiceEnabled

  return (
    <div>
      <h3 className="font-semibold mb-2 text-sm">Created By</h3>
      <Card
        className={cn(
          'p-0',
          isClickable
            ? 'cursor-pointer hover:border-primary/50 transition-colors'
            : '',
        )}
        variant="highlighted"
        onClick={isClickable ? onClick : undefined}
      >
        <CardContent className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-12">
              {creator.image && <AvatarImage src={creator.image} />}
              <AvatarFallback>{initials || <User />}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">{creatorName}</p>
              {isClickable && (
                <p className="text-xs text-muted-foreground">
                  View trainer profile
                </p>
              )}
            </div>

            {isClickable && <ChevronRight className="size-4" />}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
