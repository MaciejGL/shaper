'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Calendar, CheckCircle, User, X } from 'lucide-react'

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

export function TrainingInvitationModal({
  relatedItemId,
  onClose,
}: TrainingInvitationProps) {
  const { data } = useMyCoachingRequestQuery({ id: relatedItemId })
  const { mutate: acceptCoachingRequest, isPending: isAccepting } =
    useAcceptCoachingRequestMutation()
  const { mutate: rejectCoachingRequest, isPending: isRejecting } =
    useRejectCoachingRequestMutation()

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
        <Card className="border-0 shadow-2xl">
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full h-8 w-8"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <InvitationHeader />
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
      </motion.div>
    </div>
  )
}

function InvitationHeader() {
  return (
    <CardHeader className="pt-8 pb-4">
      <div className="flex items-center gap-2 mb-2">
        <Badge
          variant="outline"
          className="bg-violet-50 text-violet-700 border-violet-200 font-medium px-2.5 py-0.5"
        >
          New Invitation
        </Badge>
      </div>
      <CardTitle className="text-2xl font-bold">Training Invitation</CardTitle>
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
    <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 mb-6">
      <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
        <AvatarImage src="/placeholder.svg?key=ebzsn" alt="Trainer" />
        <AvatarFallback className="bg-violet-100 text-violet-700">
          <User className="h-6 w-6" />
        </AvatarFallback>
      </Avatar>
      <div className="flex-1">
        {senderName && (
          <h3 className="font-semibold text-slate-900">{senderName}</h3>
        )}
        {senderEmail && <p className="text-sm text-slate-500">{senderEmail}</p>}
        {message && <p className="mt-2 text-sm text-slate-700">{message}</p>}
      </div>
    </div>
  )
}

function InvitationBenefits() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-50 text-violet-600">
          <CheckCircle className="h-4 w-4" />
        </div>
        <span>Personalized training programs</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-50 text-violet-600">
          <Calendar className="h-4 w-4" />
        </div>
        <span>Flexible scheduling options</span>
      </div>
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-violet-50 text-violet-600">
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
    <CardFooter className="flex gap-3 pt-2 pb-6 border-t">
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
        className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white"
        loading={isAccepting}
        disabled={isAccepting || isRejecting}
      >
        Accept Invitation
      </Button>
    </CardFooter>
  )
}
