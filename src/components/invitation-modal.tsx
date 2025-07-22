'use client'

import { motion } from 'framer-motion'
import {
  ArrowRight,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  MessageCircle,
  Sparkles,
  User,
  UserPlus,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  useAcceptCoachingRequestMutation,
  useMyCoachingRequestQuery,
  useRejectCoachingRequestMutation,
} from '@/generated/graphql-client'

interface TrainingInvitationProps {
  relatedItemId: string
  onClose: () => void
}

type ModalState = 'invitation' | 'success' | 'declined'

export function TrainingInvitationModal({
  relatedItemId,
  onClose,
}: TrainingInvitationProps) {
  const [modalState, setModalState] = useState<ModalState>('invitation')
  const { data } = useMyCoachingRequestQuery({ id: relatedItemId })
  const { mutate: acceptCoachingRequest, isPending: isAccepting } =
    useAcceptCoachingRequestMutation({
      onSuccess: () => {
        toast.success('Coaching request accepted')
        setModalState('success')
      },
      // onError: () => toast.error('Failed to accept coaching request'),
    })
  const { mutate: rejectCoachingRequest, isPending: isRejecting } =
    useRejectCoachingRequestMutation({
      onSuccess: () => {
        toast.success('Coaching request declined')
        setModalState('declined')
      },
      // onError: () => toast.error('Failed to reject coaching request'),
    })

  const handleAccept = () => acceptCoachingRequest({ id: relatedItemId })
  const handleDecline = () => rejectCoachingRequest({ id: relatedItemId })

  const { sender, message } = data?.coachingRequest || {}
  const senderName = sender?.name
  const senderEmail = sender?.email

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md"
      >
        {modalState === 'invitation' && (
          <Card>
            <div className="absolute top-4 right-4">
              <Button
                variant="ghost"
                onClick={onClose}
                size="md"
                iconOnly={<X className="" />}
              >
                <span className="sr-only">Close</span>
              </Button>
            </div>
            <InvitationHeader senderName={senderName} />
            <CardContent className="pb-4">
              <SenderInfo
                senderName={senderName}
                senderEmail={senderEmail}
                message={message}
              />
              <InvitationBenefits />
            </CardContent>
            <InvitationActions
              onAccept={handleAccept}
              onDecline={handleDecline}
              isAccepting={isAccepting}
              isRejecting={isRejecting}
            />
          </Card>
        )}

        {modalState === 'success' && (
          <SuccessCard senderName={senderName} onClose={onClose} />
        )}

        {modalState === 'declined' && (
          <DeclinedCard senderName={senderName} onClose={onClose} />
        )}
      </motion.div>
    </div>
  )
}

function InvitationHeader({ senderName }: { senderName?: string | null }) {
  return (
    <CardHeader className="pt-8 pb-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge>New Invitation</Badge>
      </div>
      <CardTitle className="text-2xl font-bold">
        {senderName ? `Connect with ${senderName}` : 'Training Invitation'}
      </CardTitle>
      <CardDescription className="text-base mt-1">
        You've been invited to start a fitness journey
      </CardDescription>
    </CardHeader>
  )
}

function SenderInfo({
  senderName,
  senderEmail,
  message,
}: {
  senderName?: string | null
  senderEmail?: string | null
  message?: string | null
}) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-lg bg-background mb-6">
      <Avatar className="h-12 w-12 border-2 shadow-sm">
        <AvatarImage src="/placeholder.svg?key=ebzsn" alt="Trainer" />
        <AvatarFallback className="bg-muted-foreground">
          <User className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        {senderName && (
          <h3 className="font-semibold text-foreground">{senderName}</h3>
        )}
        {senderEmail && (
          <p className="text-sm text-foreground">{senderEmail}</p>
        )}
        {message && (
          <div className="mt-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Message:</p>
            <p>{message}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function InvitationBenefits() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted-foreground">
          <CheckCircle className="h-4 w-4" />
        </div>
        <span>Personalized training programs</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted-foreground">
          <Calendar className="h-4 w-4" />
        </div>
        <span>Flexible scheduling options</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted-foreground">
          <ArrowRight className="h-4 w-4" />
        </div>
        <span>Start your fitness journey today</span>
      </div>
    </div>
  )
}

function InvitationActions({
  onAccept,
  onDecline,
  isAccepting,
  isRejecting,
}: {
  onAccept: () => void
  onDecline: () => void
  isAccepting: boolean
  isRejecting: boolean
}) {
  return (
    <CardFooter className="flex gap-3 py-3 border-t">
      <Button
        variant="outline"
        onClick={onDecline}
        loading={isRejecting}
        disabled={isRejecting || isAccepting}
      >
        Decline
      </Button>
      <Button
        onClick={onAccept}
        loading={isAccepting}
        className="flex-1"
        disabled={isAccepting || isRejecting}
      >
        Accept Invitation
      </Button>
    </CardFooter>
  )
}

function SuccessCard({
  senderName,
  onClose,
}: {
  senderName?: string | null
  onClose: () => void
}) {
  return (
    <Card className="relative overflow-hidden">
      {/* Success gradient background */}

      <div className="relative">
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            onClick={onClose}
            size="md"
            iconOnly={<X className="" />}
          >
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <CardHeader className="text-center pt-8 pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4"
          >
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </motion.div>
          <CardTitle className="text-2xl font-bold text-green-900 dark:text-green-100">
            You're Connected!
          </CardTitle>
          <CardDescription className="text-green-700 dark:text-green-300 text-base">
            {senderName
              ? `You and ${senderName} can now collaborate`
              : 'Your fitness partnership has begun'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-white/5">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Shared Training Plans</p>
                <p className="text-xs text-muted-foreground">
                  Create and manage workouts together
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-white/5">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30">
                <MessageCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Real-time Communication</p>
                <p className="text-xs text-muted-foreground">
                  Share progress and get feedback
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-white/60 dark:bg-white/5">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Personalized Experience</p>
                <p className="text-xs text-muted-foreground">
                  Tailored workouts and meal plans
                </p>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-6">
          <Button onClick={onClose} className="w-full" iconEnd={<ArrowRight />}>
            Start Training Together
          </Button>
        </CardFooter>
      </div>
    </Card>
  )
}

function DeclinedCard({
  senderName,
  onClose,
}: {
  senderName?: string | null
  onClose: () => void
}) {
  return (
    <Card className="relative overflow-hidden">
      {/* Declined gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20" />

      <div className="relative">
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            onClick={onClose}
            size="md"
            iconOnly={<X className="" />}
          >
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <CardHeader className="text-center pt-8 pb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mx-auto w-16 h-16 bg-slate-100 dark:bg-slate-900/30 rounded-full flex items-center justify-center mb-4"
          >
            <Heart className="h-8 w-8 text-slate-600 dark:text-slate-400" />
          </motion.div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
            That's Okay!
          </CardTitle>
          <CardDescription className="text-slate-700 dark:text-slate-300 text-base">
            {senderName
              ? `${senderName} will understand your decision`
              : 'You can always connect later'}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              You can always change your mind and connect with{' '}
              {senderName || 'trainers'} in the future.
            </p>

            <div className="p-4 rounded-lg bg-white/60 dark:bg-white/5 text-left">
              <h4 className="font-medium text-sm mb-2">Alternative options:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Continue your solo fitness journey
                </li>
                <li className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Connect with other trainers anytime
                </li>
                <li className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  Send a message if you change your mind
                </li>
              </ul>
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-6">
          <Button onClick={onClose} variant="outline" className="w-full">
            Continue My Journey
          </Button>
        </CardFooter>
      </div>
    </Card>
  )
}
