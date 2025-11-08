'use client'

import { useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  CheckCircle,
  Clock,
  Heart,
  MessageCircle,
  Sparkles,
  User,
  UserPlus,
  Users,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
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
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useUser } from '@/context/user-context'
import {
  GQLUserRole,
  useAcceptCoachingRequestMutation,
  useGetMyTrainerQuery,
  useMyCoachingRequestQuery,
  useMyCoachingRequestsQuery,
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
  const queryClient = useQueryClient()
  const { data } = useMyCoachingRequestQuery({ id: relatedItemId })
  const { mutate: acceptCoachingRequest, isPending: isAccepting } =
    useAcceptCoachingRequestMutation({
      onSuccess: () => {
        // Invalidate queries to refresh my-trainer page
        queryClient.invalidateQueries({
          queryKey: useGetMyTrainerQuery.getKey(),
        })
        queryClient.invalidateQueries({
          queryKey: useMyCoachingRequestsQuery.getKey(),
        })
        toast.success('Coaching request accepted')
        setModalState('success')
      },
    })
  const { mutate: rejectCoachingRequest, isPending: isRejecting } =
    useRejectCoachingRequestMutation({
      onSuccess: () => {
        // Invalidate coaching requests query
        queryClient.invalidateQueries({
          queryKey: useMyCoachingRequestsQuery.getKey(),
        })
        toast.success('Coaching request declined')
        setModalState('declined')
      },
    })

  const handleAccept = () => acceptCoachingRequest({ id: relatedItemId })
  const handleDecline = () => rejectCoachingRequest({ id: relatedItemId })

  const { sender, message, interestedServices } = data?.coachingRequest || {}
  const senderName = sender?.name
  const senderEmail = sender?.email

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent
        dialogTitle="Coaching Invitation"
        className="max-w-md p-0 gap-0"
      >
        {modalState === 'invitation' && (
          <>
            <InvitationHeader senderName={senderName} />
            <CardContent className="pb-4">
              <SenderInfo
                senderName={senderName}
                senderEmail={senderEmail}
                message={message}
                interestedServices={interestedServices}
              />
            </CardContent>
            <InvitationActions
              onAccept={handleAccept}
              onDecline={handleDecline}
              isAccepting={isAccepting}
              isRejecting={isRejecting}
            />
          </>
        )}

        {modalState === 'success' && (
          <SuccessCard
            senderName={senderName}
            senderId={sender?.id}
            onClose={onClose}
          />
        )}

        {modalState === 'declined' && (
          <DeclinedCard senderName={senderName} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}

function InvitationHeader({ senderName }: { senderName?: string | null }) {
  return (
    <CardHeader className="pt-8 pb-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge>New Invitation</Badge>
      </div>
      <CardTitle className="text-2xl font-bold">
        {senderName ? 'Coaching Request' : 'Training Invitation'}
      </CardTitle>
      <CardDescription className="text-sm mt-1">
        You've been invited to start a fitness journey with {senderName}
      </CardDescription>
    </CardHeader>
  )
}

function SenderInfo({
  senderName,
  senderEmail,
  message,
  interestedServices,
}: {
  senderName?: string | null
  senderEmail?: string | null
  message?: string | null
  interestedServices?: string[] | null
}) {
  const serviceLabels: Record<string, string> = {
    meal_plan: 'Meal Plan',
    workout_plan: 'Training Plan',
    coaching_complete: 'Full Coaching',
    in_person_meeting: 'In-Person Training',
  }

  return (
    <div className="space-y-4 mb-6">
      <Card className="flex flex-row items-start gap-4 p-4 rounded-lg">
        <Avatar className="h-12 w-12 border-2 shadow-sm">
          <AvatarImage src="/placeholder.svg?key=ebzsn" alt="Trainer" />
          <AvatarFallback>
            <User className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          {senderName && (
            <h3 className="font-semibold text-foreground">{senderName}</h3>
          )}
          {senderEmail && (
            <p className="text-sm text-muted-foreground">{senderEmail}</p>
          )}
        </div>
      </Card>

      {interestedServices && interestedServices.length > 0 && (
        <div>
          <p className="font-medium text-sm mb-2">Interested in:</p>
          <div className="flex flex-wrap gap-2">
            {interestedServices.map((service) => (
              <Badge key={service} variant="secondary">
                {serviceLabels[service] || service}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {message && (
        <div>
          <p className="font-medium text-sm mb-1">Message:</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      )}
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
    <CardFooter className="flex gap-3 pb-3 border-t">
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
  senderId,
  onClose,
}: {
  senderName?: string | null
  senderId?: string | null
  onClose: () => void
}) {
  const { user } = useUser()
  const router = useRouter()

  const handleClose = () => {
    if (user?.role === GQLUserRole.Trainer) {
      router.push(`/trainer/clients/${senderId}`)
    }
    if (user?.role === GQLUserRole.Client) {
      router.push(`/fitspace/my-trainer`)
    }
    onClose()
  }

  return (
    <Card className="relative overflow-hidden">
      <div className="relative">
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
          <Button
            onClick={handleClose}
            className="w-full"
            iconEnd={<ArrowRight />}
          >
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
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20" />

      <div className="relative">
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
