'use client'

import { ChevronRight, Star, User } from 'lucide-react'
import Image from 'next/image'

import { Card, CardProps } from '@/components/ui/card'
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
  showClientCount?: boolean // Kept for interface compatibility but not used
  className?: string
}

export function TrainerCard({
  trainer,
  onClick,
  variant = 'secondary',
  showExperience = true,
  // showClientCount = true, // Unused in new design
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
    return years === 0 ? '<1 year' : years === 1 ? '1 year' : `${years} years`
  }

  const hasAvatar = !!trainer.profile?.avatarUrl

  return (
    <Card
      className={cn(
        'p-0 overflow-hidden border border-border shadow-sm bg-card hover:shadow-md',
        onClick
          ? 'cursor-pointer active:scale-[0.98] transition-all duration-200'
          : '',
        className,
      )}
      variant={variant}
      onClick={onClick}
    >
      <div className="flex min-h-[160px]">
        {/* Left: Profile Image */}
        <div className="relative w-[130px] shrink-0 bg-muted/30">
          {hasAvatar ? (
            <Image
              src={trainer.profile!.avatarUrl!}
              alt={trainerName}
              fill
              className="object-cover"
              sizes="130px"
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
              {initials ? (
                <span className="text-2xl font-bold text-muted-foreground/50">
                  {initials}
                </span>
              ) : (
                <User className="size-10 text-muted-foreground/40" />
              )}
            </div>
          )}
        </div>

        {/* Right: Content */}
        <div className="flex-1 p-3.5 flex flex-col justify-between min-w-0">
          <div className="space-y-3">
            {/* Header: Name & Chevron */}
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-bold text-lg leading-tight text-foreground line-clamp-1">
                {trainerName}
              </h3>
              {onClick && (
                <ChevronRight className="size-5 text-muted-foreground/50 shrink-0" />
              )}
            </div>

            {/* Stats Row - Clean & Minimal */}
            <div className="flex flex-col gap-1.5 mt-1">
              {showExperience && trainer.profile?.trainerSince && (
                <div className="flex items-center gap-2.5 h-5 text-sm text-muted-foreground font-medium">
                  <div className="flex items-center justify-center w-4 h-4 shrink-0">
                    <Star className="size-4 text-orange-500 fill-orange-500/20" />
                  </div>
                  <span className="leading-none mt-[1px]">
                    {getExperienceText()} experience
                  </span>
                </div>
              )}

              {/* Availability Indicator */}
              {trainer.capacity &&
                trainer.spotsLeft !== null &&
                trainer.spotsLeft !== undefined && (
                  <div className="flex items-center gap-2.5 h-5 text-sm font-medium">
                    <div className="flex items-center justify-center w-4 h-4 shrink-0">
                      <span className="relative flex size-2.5">
                        <span
                          className={cn(
                            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
                            trainer.spotsLeft > 0
                              ? 'bg-emerald-400'
                              : 'bg-red-400',
                          )}
                        />
                        <span
                          className={cn(
                            'relative inline-flex rounded-full size-2.5',
                            trainer.spotsLeft > 0
                              ? 'bg-emerald-500'
                              : 'bg-red-500',
                          )}
                        />
                      </span>
                    </div>
                    <span
                      className={cn(
                        'leading-none mt-[1px]',
                        trainer.spotsLeft > 0
                          ? 'text-emerald-600 dark:text-emerald-500'
                          : 'text-red-600 dark:text-red-500',
                      )}
                    >
                      {trainer.spotsLeft === 0
                        ? 'Full capacity'
                        : `${trainer.spotsLeft} spots left`}
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Specializations - Minimal Scrollable Row */}
          {trainer.profile?.specialization &&
            trainer.profile.specialization.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {trainer.profile.specialization.slice(0, 3).map((spec) => (
                  <Badge
                    key={spec}
                    variant="secondary"
                    className="text-[10px] px-2 py-0.5 h-5 font-normal bg-muted/50 text-muted-foreground hover:bg-muted border-0"
                  >
                    {spec}
                  </Badge>
                ))}
                {trainer.profile.specialization.length > 3 && (
                  <Badge
                    variant="secondary"
                    className="text-[10px] px-1.5 py-0.5 h-5 font-normal bg-muted/50 text-muted-foreground border-0"
                  >
                    +{trainer.profile.specialization.length - 3}
                  </Badge>
                )}
              </div>
            )}
        </div>
      </div>
    </Card>
  )
}
