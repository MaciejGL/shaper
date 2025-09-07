'use client'

import { differenceInYears } from 'date-fns'
import {
  BadgeCheckIcon,
  BookOpenCheck,
  CheckCircle,
  FlameIcon,
  Mail,
  MessageSquare,
  Sparkles,
} from 'lucide-react'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Drawer, DrawerContent } from '@/components/ui/drawer'

import { SectionIcon } from '../ui/section-icon'

import { TrainerData } from './trainer-card'

interface TrainerDetailsDrawerProps {
  trainer: TrainerData | null
  isOpen: boolean
  onClose: () => void
  showRequestCoaching?: boolean
  onRequestCoaching?: (trainer: TrainerData) => Promise<void>
  direction?: 'bottom' | 'right'
}

export function TrainerDetailsDrawer({
  trainer,
  isOpen,
  onClose,
  showRequestCoaching = false,
  onRequestCoaching,
  direction = 'bottom',
}: TrainerDetailsDrawerProps) {
  const [isRequestingCoaching, setIsRequestingCoaching] = useState(false)
  const [requestSent, setRequestSent] = useState(false)

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

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => !open && onClose()}
      direction={direction}
    >
      <DrawerContent dialogTitle={`${trainerName} - Trainer Details`}>
        <div className="p-4 space-y-8 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Avatar className="size-20">
              {trainer.profile?.avatarUrl && (
                <AvatarImage src={trainer.profile.avatarUrl} />
              )}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-2">
              <h2 className="text-xl font-bold">{trainerName}</h2>
              <div className="flex items-center gap-2">
                <Badge variant="premium" size="md">
                  {trainer.role === 'TRAINER'
                    ? 'Personal Trainer'
                    : trainer.role}
                </Badge>
                {trainer.capacity && trainer.spotsLeft !== null && (
                  <Badge
                    variant={trainer.isAtCapacity ? 'destructive' : 'secondary'}
                  >
                    {trainer.spotsLeft === 0
                      ? 'At capacity'
                      : `${trainer.spotsLeft} ${trainer.spotsLeft === 1 ? 'spot' : 'spots'} left`}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Experience */}
          {trainer.profile?.trainerSince && (
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <SectionIcon size="sm" icon={FlameIcon} variant="amber" />{' '}
                {differenceInYears(new Date(), trainer.profile.trainerSince)}{' '}
                years of experience
              </h3>
            </div>
          )}

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

          {/* Credentials */}
          {trainer.profile?.credentials &&
            trainer.profile.credentials.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <SectionIcon
                    size="sm"
                    icon={BadgeCheckIcon}
                    variant="green"
                  />{' '}
                  Credentials
                </h3>
                <div className="flex flex-wrap gap-2">
                  {trainer.profile.credentials.map((credential, index) => (
                    <Badge key={index} variant="secondary" size="lg">
                      {credential}
                    </Badge>
                  ))}
                </div>
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
                  <h3 className="font-semibold">Request Coaching</h3>
                  <p className="text-sm text-muted-foreground">
                    {trainer.isAtCapacity ? (
                      <>
                        {trainerName} is currently at full capacity and not
                        accepting new clients.
                      </>
                    ) : (
                      <>
                        Send a coaching request to {trainerName}. They will
                        contact you to discuss your goals and coaching options.
                      </>
                    )}
                  </p>

                  <Button
                    onClick={handleRequestCoaching}
                    disabled={isRequestingCoaching || !!trainer.isAtCapacity}
                    className="w-full"
                    size="lg"
                  >
                    {isRequestingCoaching ? (
                      <>
                        <MessageSquare className="h-4 w-4 mr-2 animate-pulse" />
                        Sending Request...
                      </>
                    ) : trainer.isAtCapacity ? (
                      <>
                        <FlameIcon className="h-4 w-4 mr-2" />
                        Trainer at Capacity
                      </>
                    ) : (
                      <>
                        <Mail className="h-4 w-4 mr-2" />
                        Request Coaching
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
