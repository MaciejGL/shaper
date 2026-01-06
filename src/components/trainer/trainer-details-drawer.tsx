'use client'

import { AnimatePresence, motion } from 'framer-motion'
import {
  BadgeCheckIcon,
  BookOpenCheck,
  ChevronDown,
  ChevronUp,
  FlameIcon,
  Mail,
  Sparkles,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'

import { CoachingInfoModal } from '@/components/coaching-info-modal/coaching-info-modal'
import { PendingCoachingRequestBanner } from '@/components/pending-coaching-request-banner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer'
import { useUser } from '@/context/user-context'

import { TrainerCard, TrainerData } from './trainer-card'
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
      <DrawerContent
        dialogTitle={`${trainerName} - Trainer Details`}
        grabberAbsolute
      >
        <div className="flex flex-col h-full">
          <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-0 space-y-8">
            {/* Trainer Card Header */}
            <div className="-mx-4">
              <TrainerCard
                trainer={trainer}
                className="rounded-none border-x-0 border-t-0"
                hideButton
              />
            </div>

            {hasRequestedCoaching && (
              <PendingCoachingRequestBanner trainerName={trainerName} />
            )}

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
