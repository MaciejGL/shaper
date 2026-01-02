'use client'

import { useEffect, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { initPostHog } from '@/lib/posthog'

const SURVEY_ID = '019b7bf6-2572-0000-08e9-41f222fd9c53'
const QUESTION_IDS = {
  feedbackType: 'e49fb459-568a-4d7b-9349-bea84af1652e',
  details: 'ba3c3e51-da64-44fb-be51-cd4a25d821d7',
}

type FeedbackType = 'Bug' | 'Feature request' | 'Opinion' | 'Other'
type PostHogStatus = 'unknown' | 'ready' | 'unavailable'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const hasCaptured = useRef(false)
  const resetTimeoutRef = useRef<number | null>(null)
  const [posthogStatus, setPosthogStatus] = useState<PostHogStatus>('unknown')

  const [feedbackType, setFeedbackType] = useState<FeedbackType | ''>('')
  const [details, setDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (resetTimeoutRef.current) {
      window.clearTimeout(resetTimeoutRef.current)
      resetTimeoutRef.current = null
    }

    if (!isOpen) {
      hasCaptured.current = false
      setPosthogStatus('unknown')
      // Delay reset until after the close animation so content doesn't flicker
      resetTimeoutRef.current = window.setTimeout(() => {
        setFeedbackType('')
        setDetails('')
        setIsSubmitting(false)
        setIsSubmitted(false)
      }, 250)
      return
    }

    initPostHog().then((ph) => {
      setPosthogStatus(ph ? 'ready' : 'unavailable')
    })
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!feedbackType || !details.trim()) return

    setIsSubmitting(true)

    const ph = await initPostHog()
    if (!ph) {
      setIsSubmitting(false)
      setPosthogStatus('unavailable')
      return
    }

    const payload: Record<string, unknown> = {
      $survey_id: SURVEY_ID,
      $survey_questions: [
        {
          id: QUESTION_IDS.feedbackType,
          question: 'What type of feedback is this?',
        },
        {
          id: QUESTION_IDS.details,
          question: 'Tell us more',
        },
      ],
      [`$survey_response_${QUESTION_IDS.feedbackType}`]: feedbackType,
      [`$survey_response_${QUESTION_IDS.details}`]: details.trim(),
    }

    ph.capture('survey sent', payload)

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  const isPostHogUnavailable = posthogStatus === 'unavailable'

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent dialogTitle="Feedback">
        {isSubmitted ? (
          <div className="flex flex-col items-center py-6 text-center">
            <DialogHeader className="items-center">
              <DialogTitle>Thank you!</DialogTitle>
              <DialogDescription className="text-center max-w-[40ch]">
                Your feedback has been submitted. We appreciate you taking the
                time to help us improve.
              </DialogDescription>
            </DialogHeader>
            <Button onClick={onClose} className="mt-6">
              Close
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>We value your feedback</DialogTitle>
              <DialogDescription>
                Let us know about bugs, feature requests, or share your opinion.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {isPostHogUnavailable ? (
                <div className="text-sm text-muted-foreground">
                  Feedback is currently unavailable. PostHog is not configured
                  for this environment.
                </div>
              ) : null}
              <div className="space-y-2">
                <Label htmlFor="feedback-type">Feedback type</Label>
                <Select
                  value={feedbackType}
                  onValueChange={(v) => setFeedbackType(v as FeedbackType)}
                >
                  <SelectTrigger className="w-full" variant="outline">
                    <SelectValue placeholder="Select feedback type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bug">Bug</SelectItem>
                    <SelectItem value="Feature request">
                      Feature request
                    </SelectItem>
                    <SelectItem value="Opinion">Opinion</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Textarea
                id="feedback-details"
                label="Tell us more"
                placeholder="Describe your feedback..."
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                className="min-h-32"
              />

              <Button
                type="submit"
                className="w-full"
                disabled={
                  !feedbackType || !details.trim() || isPostHogUnavailable
                }
                loading={isSubmitting}
              >
                Submit Feedback
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
