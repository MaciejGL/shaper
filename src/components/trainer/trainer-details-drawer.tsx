'use client'

import { differenceInYears } from 'date-fns'
import {
  BadgeCheckIcon,
  BookOpenCheck,
  CheckCircle,
  FlameIcon,
  Mail,
  Sparkles,
  Star,
  User,
  XCircle,
} from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { CoachingInfoModal } from '@/components/coaching-info-modal/coaching-info-modal'
import { PendingCoachingRequestBanner } from '@/components/pending-coaching-request-banner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { useUser } from '@/context/user-context'
import { cn } from '@/lib/utils'

import { SectionIcon } from '../ui/section-icon'

import { TrainerData } from './trainer-card'
import { TrainerCertificatesGallery } from './trainer-certificates-gallery'

interface TrainerDetailsDrawerProps {
  trainer: TrainerData | null
  isOpen: boolean
  onClose: () => void
  showRequestCoaching?: boolean
  onRequestCoaching?: (trainer: TrainerData) => Promise<void>
  hasRequestedCoaching?: boolean
  onWithdrawRequest?: () => Promise<void>
  isWithdrawing?: boolean
  showCompleteSurvey?: boolean
  onCompleteSurvey?: () => void
  showRetakeAssessment?: boolean
  onRetakeAssessment?: () => void
  direction?: 'bottom' | 'right'
}

export function TrainerDetailsDrawer({
  trainer,
  isOpen,
  onClose,
  showRequestCoaching = false,
  onRequestCoaching,
  hasRequestedCoaching = false,
  onWithdrawRequest,
  isWithdrawing = false,
  showCompleteSurvey = false,
  onCompleteSurvey,
  showRetakeAssessment = false,
  onRetakeAssessment,
  direction = 'bottom',
}: TrainerDetailsDrawerProps) {
  const [isRequestingCoaching, setIsRequestingCoaching] = useState(false)
  const [requestSent, setRequestSent] = useState(false)
  const [showCoachingInfo, setShowCoachingInfo] = useState(false)
  const { user } = useUser()

  const handleRequestCoaching = async () => {
    if (!trainer || !onRequestCoaching) return

    setIsRequestingCoaching(true)

    try {
      await onRequestCoaching(trainer)
      setRequestSent(true)

      // Reset after 3 seconds
      setTimeout(() => {
        setRequestSent(false)
        onClose()
      }, 3000)
    } catch (error) {
      console.error('Error sending coaching request:', error)
    } finally {
      setIsRequestingCoaching(false)
    }
  }

  if (!trainer) return null

  const trainerName =
    trainer.name ||
    `${trainer.profile?.firstName || ''} ${trainer.profile?.lastName || ''}`.trim() ||
    'Trainer'

  const initials =
    (trainer.profile?.firstName?.charAt(0) || '') +
    (trainer.profile?.lastName?.charAt(0) || '')

  const hasRequestedTrainer = Boolean(user?.trainerId) || hasRequestedCoaching

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction={direction}
    >
      <DrawerContent dialogTitle={`${trainerName} - Trainer Details`}>
        <div className="p-4 space-y-8 overflow-y-auto">
          {hasRequestedCoaching && (
            <PendingCoachingRequestBanner trainerName={trainerName} />
          )}

          {/* New Modern Header */}
          <div className="relative">
            {/* Background Blob/Gradient */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-6">
              <div className="flex gap-5">
                {/* Large Profile Image */}
                <div className="relative shrink-0">
                  <div className="size-24 rounded-2xl overflow-hidden ring-4 ring-background shadow-xl bg-muted/30 relative">
                    {trainer.profile?.avatarUrl ? (
                      <Image
                        src={trainer.profile.avatarUrl}
                        alt={trainerName}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted/50 to-muted">
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
                </div>

                {/* Name & Role */}
                <div className="flex flex-col justify-center gap-1.5 py-1">
                  <h2 className="text-2xl font-bold leading-tight">
                    {trainerName}
                  </h2>
                  <div className="text-base text-muted-foreground font-medium">
                    {trainer.role === 'TRAINER'
                      ? 'Personal Trainer'
                      : trainer.role}
                  </div>

                  {/* Quick Stats Row */}
                  <div className="flex items-center gap-4 mt-1">
                    {trainer.profile?.trainerSince && (
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Star className="size-4 text-orange-500 fill-orange-500/20" />
                        <span>
                          {differenceInYears(
                            new Date(),
                            new Date(trainer.profile.trainerSince),
                          )}{' '}
                          years exp
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Availability Text (Full width if needed, or keep clean) */}
              {trainer.capacity &&
                trainer.spotsLeft !== null &&
                trainer.spotsLeft !== undefined && (
                  <div
                    className={cn(
                      'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg w-fit text-sm font-medium',
                      trainer.spotsLeft > 0
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-red-500/10 text-red-600 dark:text-red-400',
                    )}
                  >
                    <span className="relative flex size-2 shrink-0">
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
                          'relative inline-flex rounded-full size-2',
                          trainer.spotsLeft > 0
                            ? 'bg-emerald-500'
                            : 'bg-red-500',
                        )}
                      />
                    </span>
                    {trainer.spotsLeft === 0
                      ? 'Currently at full capacity'
                      : `${trainer.spotsLeft} spots available for coaching`}
                  </div>
                )}
            </div>
          </div>

          {/* Bio */}
          {trainer.profile?.bio && (
            <p className="text-sm prose prose-sm leading-relaxed whitespace-pre-wrap bg-card-on-card p-4 rounded-md">
              {trainer.profile.bio}
            </p>
          )}

          {/* Specialization */}
          {trainer.profile?.specialization &&
            trainer.profile.specialization.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <SectionIcon size="sm" icon={BookOpenCheck} variant="blue" />{' '}
                  Specialization
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trainer.profile.specialization.map((spec, index) => (
                    <Badge key={index} variant="secondary" size="lg">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Credentials / Certificates */}
          {trainer.profile?.credentials &&
            trainer.profile.credentials.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <SectionIcon
                    size="sm"
                    icon={BadgeCheckIcon}
                    variant="green"
                  />{' '}
                  Credentials & Certifications
                </h3>
                <TrainerCertificatesGallery
                  urls={trainer.profile.credentials}
                />
              </div>
            )}

          {/* Success Stories */}
          {trainer.profile?.successStories &&
            trainer.profile.successStories.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <SectionIcon size="sm" icon={Sparkles} variant="purple" />{' '}
                  Success Stories
                </h3>
                <ul className="space-y-1">
                  {trainer.profile.successStories.map((story, index) => (
                    <li
                      key={index}
                      className="bg-card-on-card p-3 rounded-md text-sm leading-relaxed flex items-center gap-2"
                    >
                      {story}
                    </li>
                  ))}
                </ul>
              </div>
            )}

          {showRequestCoaching && (
            <>
              {/* Request Coaching Section */}
              {requestSent ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                  <h3 className="font-semibold text-green-700">
                    Request Sent!
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {trainerName} will be contacted and will reach out to you
                    soon.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {!hasRequestedTrainer && (
                    <h3 className="font-semibold">Request Coaching</h3>
                  )}
                  {!hasRequestedTrainer && (
                    <p className="text-sm text-muted-foreground">
                      {trainer.isAtCapacity ? (
                        <>
                          {trainerName} is currently at full capacity and not
                          accepting new clients.
                        </>
                      ) : (
                        <>
                          Send a coaching request to {trainerName}. They will
                          contact you to discuss your goals and coaching
                          options.
                        </>
                      )}
                    </p>
                  )}

                  <div className="space-y-3">
                    {!hasRequestedTrainer && (
                      <Button
                        onClick={handleRequestCoaching}
                        disabled={
                          isRequestingCoaching ||
                          !!trainer.isAtCapacity ||
                          hasRequestedTrainer
                        }
                        className="w-full"
                        size="lg"
                        loading={isRequestingCoaching}
                        iconStart={
                          trainer.isAtCapacity ? <FlameIcon /> : <Mail />
                        }
                      >
                        {trainer.isAtCapacity
                          ? 'Trainer at Capacity'
                          : 'Request Coaching'}
                      </Button>
                    )}

                    {showCompleteSurvey && onCompleteSurvey && (
                      <Button
                        onClick={onCompleteSurvey}
                        className="w-full"
                        size="lg"
                        variant="default"
                        iconStart={<Sparkles />}
                      >
                        Complete Fitness Assessment
                      </Button>
                    )}

                    {showRetakeAssessment && onRetakeAssessment && (
                      <Button
                        onClick={onRetakeAssessment}
                        className="w-full"
                        size="lg"
                        variant="tertiary"
                        iconStart={<Sparkles />}
                      >
                        Retake Assessment
                      </Button>
                    )}

                    {hasRequestedCoaching && onWithdrawRequest && (
                      <Button
                        onClick={onWithdrawRequest}
                        className="w-full"
                        size="lg"
                        variant="destructive"
                        loading={isWithdrawing}
                        disabled={isWithdrawing}
                        iconStart={<XCircle />}
                      >
                        Withdraw Request
                      </Button>
                    )}

                    <Button
                      onClick={() => setShowCoachingInfo(true)}
                      variant="tertiary"
                      className="w-full"
                      size="lg"
                      iconStart={<BookOpenCheck />}
                    >
                      Learn How Coaching Works
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DrawerContent>

      <CoachingInfoModal
        open={showCoachingInfo}
        onOpenChange={setShowCoachingInfo}
      />
    </Drawer>
  )
}
