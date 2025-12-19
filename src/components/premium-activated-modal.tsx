'use client'

import { BarChart3, Check, Dumbbell, Sparkles, Zap } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface PremiumActivatedModalProps {
  open: boolean
  onClose: () => void
  isVerifying?: boolean
}

const PREMIUM_FEATURES = [
  {
    icon: Dumbbell,
    title: 'Premium Training Plans',
    description: 'Access expert-designed workout programs',
  },
  {
    icon: BarChart3,
    title: 'Advanced Analytics',
    description: 'Track your progress with detailed insights',
  },
  {
    icon: Zap,
    title: 'AI-Powered Suggestions',
    description: 'Get personalized workout recommendations',
  },
  {
    icon: Sparkles,
    title: 'Exclusive Content',
    description: 'Unlock premium exercises and techniques',
  },
]

export function PremiumActivatedModal({
  open,
  onClose,
  isVerifying = false,
}: PremiumActivatedModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent
        dialogTitle="Welcome to Premium"
        className="sm:max-w-md"
        withCloseButton={false}
      >
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Check className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold">
            Welcome to Premium
          </DialogTitle>
          <DialogDescription className="text-base">
            Your subscription is now active. Here&apos;s what you&apos;ve
            unlocked:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {PREMIUM_FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-3 rounded-lg bg-muted/50 p-3"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="font-medium">{feature.title}</p>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <Button
          onClick={onClose}
          className="w-full"
          size="lg"
          disabled={isVerifying}
        >
          {isVerifying ? 'Verifying subscription...' : 'Start Exploring'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
