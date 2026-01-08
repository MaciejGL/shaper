'use client'

import Image from 'next/image'

import { Card, CardContent, CardProps } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import { Badge } from '../ui/badge'
import { Button } from '../ui/button'

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
    trainerCardBackgroundUrl?: string | null
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
  className?: string
  hideButton?: boolean
}

export function TrainerCard({
  trainer,
  onClick,
  variant = 'secondary',
  className = '',
  hideButton = false,
}: TrainerCardProps) {
  const trainerName =
    trainer.name ||
    `${trainer.profile?.firstName || ''} ${trainer.profile?.lastName || ''}`.trim() ||
    'Trainer'

  const getExperienceText = () => {
    if (!trainer.profile?.trainerSince) return null

    const years =
      new Date().getFullYear() -
      new Date(trainer.profile.trainerSince).getFullYear()
    return years === 0
      ? '<1y'
      : years === 1
        ? '1 year exp'
        : `${years} years exp`
  }

  const backgroundImageUrl = trainer.profile?.trainerCardBackgroundUrl
  const hasBackgroundImage = !!backgroundImageUrl

  return (
    <Card
      className={cn('p-0 aspect-video', className)}
      variant={variant}
      onClick={onClick}
    >
      {hasBackgroundImage && (
        <Image
          src={backgroundImageUrl}
          alt="Trainer Card Background"
          fill
          className={cn(
            'object-cover object-top rounded-2xl',
            hideButton && 'rounded-none',
          )}
          sizes="500px"
        />
      )}
      <CardContent className="dark min-h-[150px] relative grid grid-cols-[32%_68%] p-0 h-full">
        <div />
        <div className="flex flex-col w-full bg-linear-to-r from-black/0 via-black/70 to-black/50 h-full p-4 rounded-2xl">
          <Badge variant="primary" className="ml-auto bg-white">
            Expert
          </Badge>
          <p className="text-2xl font-bold text-foreground text-shadow-xs text-shadow-black mt-auto">
            {trainerName}
          </p>
          {(() => {
            const specializations =
              trainer.profile?.specialization?.slice(0, 2) ?? []
            const hasLongSpecialization = specializations.some(
              (s) => s.length > 15,
            )

            return (
              <div
                className={cn(
                  'text-sm text-foreground font-semibold flex gap-1',
                  hasLongSpecialization ? 'flex-col' : 'flex-wrap',
                )}
              >
                {specializations.map((specialization, index, array) => (
                  <div
                    key={specialization}
                    className="flex items-center gap-1 text-shadow-xs text-shadow-black"
                  >
                    <span>{specialization}</span>
                    {!hasLongSpecialization && index < array.length - 1 && (
                      <span>•</span>
                    )}
                  </div>
                ))}
              </div>
            )
          })()}
          <div className="mb-4 mt-3 text-shadow-xs text-shadow-black text-foreground font-semibold text-sm flex items-center gap-2">
            {trainer.capacity != null && trainer.spotsLeft != null && (
              <SpotsIndicator spotsLeft={trainer.spotsLeft} />
            )}
            {trainer.capacity != null &&
              trainer.spotsLeft != null &&
              getExperienceText() && <span className="font-normal">•</span>}
            {getExperienceText() && (
              <span className="text-amber-500">{getExperienceText()}</span>
            )}
          </div>
          {!hideButton && <Button>View Trainer</Button>}
        </div>
      </CardContent>
    </Card>
  )
}

function SpotsIndicator({ spotsLeft }: { spotsLeft: number }) {
  const isAvailable = spotsLeft > 0

  return (
    <div className="flex items-center gap-1.5 text-sm font-medium">
      <span className="relative flex size-2.5">
        <span
          className={cn(
            'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
            isAvailable ? 'bg-green-400' : 'bg-red-400',
          )}
        />
        <span
          className={cn(
            'relative inline-flex rounded-full size-2.5',
            isAvailable ? 'bg-green-500' : 'bg-red-500',
          )}
        />
      </span>
      <span className={isAvailable ? 'text-green-500' : 'text-red-500'}>
        {spotsLeft === 0 ? 'Full capacity' : `${spotsLeft} spots left`}
      </span>
    </div>
  )
}
