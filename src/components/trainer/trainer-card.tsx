'use client'

import { ChevronRight } from 'lucide-react'
import Image from 'next/image'

import { Card, CardContent, CardProps } from '@/components/ui/card'
import { cn } from '@/lib/utils'

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
  classNameImage?: string
  hideButton?: boolean
  classNameOverlay?: string
  classNameBadge?: string
}

export function TrainerCard({
  trainer,
  onClick,
  variant = 'secondary',
  className = '',
  hideButton = false,
  classNameImage,
  classNameOverlay,
  classNameBadge,
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
    return years === 0 ? '<1y' : years === 1 ? '1y exp' : `${years}y exp`
  }

  const backgroundImageUrl = trainer.profile?.trainerCardBackgroundUrl
  const hasBackgroundImage = !!backgroundImageUrl

  return (
    <Card
      className={cn('p-0 aspect-video relative', className)}
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
            classNameImage,
          )}
          quality={100}
          sizes="100vw"
        />
      )}

      <CardContent className="dark min-h-[150px] relative grid grid-cols-[32%_68%] p-0 h-full overflow-hidden">
        <div />
        <div
          className={cn(
            'flex flex-col w-full bg-linear-to-r from-black/0 via-black/70 to-black/50 h-full p-4 rounded-2xl',
            classNameOverlay,
          )}
        >
          <div
            className={cn(
              'absolute top-0 right-0 bg-white/10 backdrop-blur-sm text-amber-400 font-semibold text-xs py-1.5 px-4 rounded-bl-2xl rounded-tr-2xl',
              classNameBadge,
            )}
          >
            EXPERT
          </div>
          <p className="text-2xl font-bold text-foreground text-shadow-xs text-shadow-black mt-auto">
            {trainerName}
          </p>
          {(() => {
            const specializations =
              trainer.profile?.specialization?.slice(0, 2) ?? []

            return (
              <p className="text-sm text-foreground font-semibold">
                {specializations.map((specialization, index) => (
                  <span
                    key={`${specialization}-${index}`}
                    className="text-shadow-xs text-shadow-black"
                  >
                    {index > 0 ? '\u00A0•\u00A0' : null}
                    {specialization}
                  </span>
                ))}
              </p>
            )
          })()}
          <div className="mt-3 text-shadow-xs text-shadow-black text-foreground font-semibold text-sm flex items-center gap-2">
            {trainer.capacity != null && trainer.spotsLeft != null && (
              <SpotsIndicator spotsLeft={trainer.spotsLeft} />
            )}
            {trainer.capacity != null &&
              trainer.spotsLeft != null &&
              getExperienceText() && <span className="font-normal">•</span>}
            {getExperienceText() && (
              <span className="text-amber-500">{getExperienceText()}</span>
            )}
            {!hideButton && (
              <Button
                variant="default"
                size="icon-md"
                iconOnly={<ChevronRight />}
                className="rounded-full ml-auto bg-primary/20 backdrop-blur-sm text-foreground"
              >
                View Trainer
              </Button>
            )}
          </div>
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
