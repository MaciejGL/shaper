'use client'

import { differenceInYears } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import {
  BadgeCheckIcon,
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
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
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer'
import { useUser } from '@/context/user-context'
import { cn } from '@/lib/utils'

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

function ExpandableBio({ bio }: { bio: string }) {
  const [isExpanded, setIsExpanded] = useState(false)
  // Simple heuristic: if bio is longer than ~200 chars, truncate it
  const shouldTruncate = bio.length > 300

  if (!shouldTruncate) {
    return (
      <p className="text-sm prose prose-sm leading-relaxed whitespace-pre-wrap bg-card/50 p-4 rounded-xl border border-border/50">
        {bio}
      </p>
    )
  }

  return (
    <div className="relative group">
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 160 }}
        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
        className="overflow-hidden relative"
      >
        <p className="text-sm prose prose-sm leading-relaxed whitespace-pre-wrap bg-card/50  rounded-xl">
          {bio}
        </p>

        {/* Subtle Fade for non-expanded state */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card via-card/80 to-transparent rounded-b-xl pointer-events-none"
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Natural Text Link Button */}
      <motion.button
        layout
        onClick={() => setIsExpanded(!isExpanded)}
        className="text-xs font-medium text-muted-foreground hover:text-primary transition-colors mt-2 flex items-center gap-1 mx-auto"
      >
        {isExpanded ? (
          <>
            Show less <ChevronUp className="size-3" />
          </>
        ) : (
          <>
            Read more <ChevronDown className="size-3" />
          </>
        )}
      </motion.button>
    </div>
  )
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

  const canShowPrimaryRequest =
    showRequestCoaching &&
    !requestSent &&
    !hasRequestedTrainer &&
    Boolean(onRequestCoaching)

  const canShowWithdraw =
    showRequestCoaching &&
    !requestSent &&
    hasRequestedCoaching &&
    !!onWithdrawRequest

  const showStickyFooter =
    showRequestCoaching &&
    !requestSent &&
    (canShowPrimaryRequest || canShowWithdraw)

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction={direction}
    >
      <DrawerContent dialogTitle={`${trainerName} - Trainer Details`}>
        <div className="flex flex-col h-full">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 space-y-8">
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
                  <div className="flex flex-col justify-center gap-1.5 py-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-tight truncate">
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
                        <div className="flex items-center gap-2 text-sm font-medium">
                          <Star className="size-4 text-orange-500 fill-orange-500/20 shrink-0" />
                          <span className="truncate">
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

                {/* Availability Text */}
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

            {showRequestCoaching && !requestSent && (
              <div className="rounded-xl border border-border bg-card-on-card/10 dark:bg-card p-4 space-y-3 shadow-md">
                <div className="space-y-1">
                  <h3 className="font-semibold text-base">Coaching</h3>
                  {!hasRequestedTrainer && (
                    <p className="text-sm text-muted-foreground">
                      {trainer.isAtCapacity ? (
                        <>
                          {trainerName} is currently at full capacity and not
                          accepting new clients.
                        </>
                      ) : (
                        <>
                          Send a coaching request to {trainerName}. They’ll
                          contact you to discuss your goals and options.
                        </>
                      )}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  {showCompleteSurvey && onCompleteSurvey && (
                    <Button
                      onClick={onCompleteSurvey}
                      className="w-full"
                      size="md"
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
                      size="md"
                      variant="outline"
                      iconStart={<Sparkles />}
                    >
                      Retake Assessment
                    </Button>
                  )}

                  <Button
                    onClick={() => setShowCoachingInfo(true)}
                    variant="outline"
                    // size="variantless"
                    className="w-full justify-center text-sm"
                    iconStart={<BookOpenCheck />}
                  >
                    Learn How Coaching Works
                  </Button>
                </div>
              </div>
            )}

            {/* Specialization */}
            {trainer.profile?.specialization &&
              trainer.profile.specialization.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
                    <BookOpenCheck className="size-5 text-blue-500" />
                    Specialization
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trainer.profile.specialization.map((spec, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        size="md"
                        className="px-3 py-1 bg-muted/50 border border-border/50 text-foreground/80 font-normal"
                      >
                        {spec}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {/* Bio */}
            {trainer.profile?.bio && (
              <ExpandableBio bio={trainer.profile.bio} />
            )}

            {/* Credentials / Certificates */}
            {trainer.profile?.credentials &&
              trainer.profile.credentials.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
                    <BadgeCheckIcon className="size-5 text-green-500" />
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
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-base">
                    <Sparkles className="size-5 text-purple-500" />
                    Success Stories
                  </h3>
                  <ul className="space-y-2">
                    {trainer.profile.successStories.map((story, index) => (
                      <li
                        key={index}
                        className="bg-card/40 border border-border/50 p-3 rounded-xl text-sm leading-relaxed flex items-start gap-3"
                      >
                        <span className="mt-1.5 size-1.5 rounded-full bg-purple-500 shrink-0" />
                        <span className="text-muted-foreground">{story}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
          </div>

          {showStickyFooter && (
            <DrawerFooter className="border-t bg-card/95 backdrop-blur-sm pb-4 pt-3">
              {canShowWithdraw ? (
                <Button
                  onClick={onWithdrawRequest}
                  className="w-full"
                  size="md"
                  variant="destructive"
                  loading={isWithdrawing}
                  disabled={isWithdrawing}
                  iconStart={<XCircle />}
                >
                  Withdraw Request
                </Button>
              ) : (
                <Button
                  onClick={handleRequestCoaching}
                  disabled={isRequestingCoaching || !!trainer.isAtCapacity}
                  className="w-full"
                  size="md"
                  loading={isRequestingCoaching}
                  iconStart={trainer.isAtCapacity ? <FlameIcon /> : <Mail />}
                >
                  {trainer.isAtCapacity
                    ? 'Trainer at Capacity'
                    : 'Request Coaching'}
                </Button>
              )}
            </DrawerFooter>
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
