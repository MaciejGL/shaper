'use client'

import { ChevronRight } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent, CardProps } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { Badge } from '../ui/badge'

export interface TrainerData {
  id: string
  name?: string | null
  role?: string | null
  clientCount?: number | null
  email: string
  capacity?: number | null
  spotsLeft?: number | null
  isAtCapacity?: boolean | null
  profile?: {
    firstName?: string | null
    lastName?: string | null
    bio?: string | null
    avatarUrl?: string | null
    specialization?: string[] | null
    credentials?: string[] | null
    successStories?: string[] | null
    trainerSince?: string | null
  } | null
}

interface TrainerCardProps {
  trainer: TrainerData
  onClick?: () => void
  variant?: CardProps['variant']
  showExperience?: boolean
  showClientCount?: boolean
  className?: string
}

export function TrainerCard({
  trainer,
  onClick,
  variant = 'secondary',
  showExperience = true,
  showClientCount = true,
  className = '',
}: TrainerCardProps) {
  const trainerName =
    trainer.name ||
    `${trainer.profile?.firstName || ''} ${trainer.profile?.lastName || ''}`.trim() ||
    'Trainer'

  const initials =
    (trainer.profile?.firstName?.charAt(0) || '') +
    (trainer.profile?.lastName?.charAt(0) || '')

  const getExperienceText = () => {
    if (!trainer.profile?.trainerSince) return null

    const years =
      new Date().getFullYear() -
      new Date(trainer.profile.trainerSince).getFullYear()
    return years === 0
      ? 'Less than 1 year'
      : years === 1
        ? '1 year'
        : `${years} years`
  }

  return (
    <Card
      className={cn(
        'p-0',
        onClick
          ? 'cursor-pointer hover:border-primary/50 transition-colors'
          : '',
        className,
      )}
      variant={variant}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="size-16">
            {trainer.profile?.avatarUrl && (
              <AvatarImage src={trainer.profile.avatarUrl} />
            )}
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <h3 className="font-semibold text-lg">{trainerName}</h3>
                <div className="flex items-center flex-wrap gap-1.5">
                  {showExperience && trainer.profile?.trainerSince && (
                    <Badge variant="premium" size="sm">
                      {getExperienceText()} of experience
                    </Badge>
                  )}
                  {showClientCount &&
                    trainer.clientCount !== null &&
                    trainer.clientCount !== undefined && (
                      <Badge variant="equipment" size="sm">
                        {trainer.clientCount} clients
                      </Badge>
                    )}
                  {trainer.capacity && trainer.spotsLeft !== null && (
                    <Badge
                      variant={trainer.isAtCapacity ? 'warning' : 'secondary'}
                      size="sm"
                    >
                      {trainer.spotsLeft === 0
                        ? 'At capacity'
                        : `${trainer.spotsLeft} ${trainer.spotsLeft === 1 ? 'spot' : 'spots'} left`}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {trainer.profile?.specialization?.slice(0, 2).map((spec) => (
                    <Badge key={spec} variant="secondary" size="sm">
                      {spec}
                    </Badge>
                  ))}
                  {(trainer.profile?.specialization?.length ?? 0) > 2 && (
                    <Badge variant="secondary" size="sm">
                      +{(trainer.profile?.specialization?.length ?? 0) - 2}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Years of experience */}

            {trainer.profile?.bio && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2 prose prose-sm whitespace-pre-wrap">
                {trainer.profile.bio}
              </p>
            )}
          </div>
          <ChevronRight className="self-center" />
        </div>
      </CardContent>
    </Card>
  )
}
